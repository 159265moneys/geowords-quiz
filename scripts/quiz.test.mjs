import test from 'node:test';
import assert from 'node:assert/strict';
import {QUESTIONS,LANGUAGES} from '../data.js';
import {makeChoices,makeMeaningChoices,createSession,answerQuestion,advance,getStats} from '../quiz.js';
import {recognitionFor} from '../recognition.js';

function rng(seed=714){return ()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};}

test('110 distinct questions with complete explanations across 40 languages',()=>{
  assert.equal(QUESTIONS.length,110);
  assert.equal(Object.keys(LANGUAGES).length,40);
  assert.equal(new Set(QUESTIONS.map(q=>q.id)).size,110);
  assert.equal(new Set(QUESTIONS.map(q=>q.word)).size,110);
  for(const q of QUESTIONS){
    assert.ok(LANGUAGES[q.language]);
    for(const field of ['word','meaning','clue','explanation','source'])assert.ok(q[field]?.trim(),`${q.id}: ${field}`);
    assert.ok(LANGUAGES[q.language].tip&&LANGUAGES[q.language].origin);
    assert.ok(q.source.startsWith('https://'));
    for(const shared of q.shared)assert.ok(LANGUAGES[shared]);
  }
});

test('every question has one correct choice and no shared-language distractors',()=>{
  const random=rng();
  for(const q of QUESTIONS)for(let i=0;i<100;i++){
    const options=makeChoices(q,random);
    assert.equal(options.length,4);
    assert.equal(new Set(options).size,4);
    assert.equal(options.filter(k=>k===q.language).length,1);
    for(const k of q.shared)assert.ok(!options.includes(k),`${q.word}: ambiguous ${k}`);
  }
});

test('all 110 questions are reachable once; duplicate answers and premature advance are ignored',()=>{
  const session=createSession(110,QUESTIONS,rng());
  const visited=new Set();
  for(let i=0;i<110;i++){
    const q=session.deck[session.index];
    visited.add(q.id);
    session.choices=makeChoices(q,rng(i+1));
    assert.equal(advance(session),false);
    assert.equal(answerQuestion(session,'not-a-language'),false);
    assert.equal(answerQuestion(session,q.language),true);
    assert.equal(answerQuestion(session,q.language),false);
    assert.equal(advance(session),true);
  }
  assert.equal(visited.size,110);
  assert.equal(session.done,true);
  assert.deepEqual(getStats(session),{correct:110,streak:110,answered:110,total:110});
  assert.equal(advance(session),false);
  assert.equal(answerQuestion(session,session.choices[0]),false);
});

test('mixed answers reset streaks; review contains only missed words and ends normally',()=>{
  const session=createSession(10,QUESTIONS,rng());
  for(let i=0;i<10;i++){
    const q=session.deck[session.index];
    session.choices=makeChoices(q);
    answerQuestion(session,i%2===0?q.language:session.choices.find(k=>k!==q.language));
    advance(session);
  }
  assert.deepEqual(getStats(session),{correct:5,streak:0,answered:10,total:10});
  const missed=session.deck.filter((q,i)=>!session.answers[i].correct);
  const review=createSession(missed.length,missed,rng());
  assert.equal(review.deck.length,5);
  assert.deepEqual(new Set(review.deck.map(q=>q.id)),new Set(missed.map(q=>q.id)));
  for(const q of review.deck){review.choices=makeChoices(q);answerQuestion(review,q.language);advance(review);}
  assert.equal(review.done,true);
  assert.equal(getStats(review).correct,5);
});

test('meaning mode has unambiguous options, scores every word, and supports review',()=>{
  const random=rng();
  const session=createSession(QUESTIONS.length,QUESTIONS,random,'meaning');
  for(const q of session.deck){
    const options=makeMeaningChoices(q,random);
    assert.equal(new Set(options).size,4);
    assert.equal(options.filter(o=>o===q.meaning).length,1);
    if(/通り|道路|一方通行|自転車道/.test(q.meaning))assert.ok(!options.filter(o=>o!==q.meaning).includes('通り・道路'));
    if(/店|食堂|薬局|パン屋|精肉店|食料品|両替所/.test(q.meaning))assert.ok(!options.filter(o=>o!==q.meaning).includes('店'));
    if(/停止/.test(q.meaning))assert.ok(!options.filter(o=>o!==q.meaning).includes('一時停止'));
    session.choices=options;
    assert.equal(answerQuestion(session,q.meaning),true);
    assert.equal(answerQuestion(session,q.meaning),false);
    advance(session);
  }
  assert.equal(session.done,true);
  assert.equal(getStats(session).correct,QUESTIONS.length);
  const review=createSession(1,[QUESTIONS[0]],random,'meaning');
  assert.equal(review.mode,'meaning');
  review.choices=makeMeaningChoices(review.deck[0]);
  answerQuestion(review,review.choices.find(c=>c!==review.deck[0].meaning));
  assert.equal(getStats(review).correct,0);
});

test('every answer explains identification strength; stop-sign certainty stays conditional',()=>{
  for(const q of QUESTIONS){const r=recognitionFor(q);assert.ok(r.label&&r.text&&r.tone);}
  for(const word of ['DUR','BERHENTI']){
    const r=recognitionFor(QUESTIONS.find(q=>q.word===word));
    assert.match(r.label,/標識なら/);
    assert.match(r.text,/前提/);
  }
  assert.equal(recognitionFor(QUESTIONS.find(q=>q.word==='PARE')).tone,'shared');
});

test('practical cues distinguish real shared usage from dictionary homographs',()=>{
  const cue=word=>recognitionFor(QUESTIONS.find(q=>q.word===word));
  for(const q of QUESTIONS){const r=recognitionFor(q);assert.ok(r.cue&&r.target, q.word);}
  for(const word of ['rua','rue','vej','vei','tie','katu']){
    assert.ok(QUESTIONS.find(q=>q.word===word).shared.length);
    assert.notEqual(cue(word).tone,'shared');
    assert.match(cue(word).text,/街路名|道路名/);
  }
  assert.match(cue('jalan').target,/インドネシア語.*マレー語/);
  assert.match(cue('PARE').target,/ポルトガル語.*スペイン語/);
  assert.equal(cue('szkoła').cue,'ł');
  assert.equal(cue('náměstí').cue,'ě');
  assert.equal(cue('gatvė').cue,'ė');
});

test('starter course has 30 useful cues and both courses work in both modes',async()=>{
  const {COURSES}=await import('../courses.js');
  assert.equal(COURSES.starter.questions.length,30);
  assert.equal(new Set(COURSES.starter.questions.map(q=>q.id)).size,30);
  assert.equal(COURSES.all.questions.length,110);
  for(const q of COURSES.starter.questions)assert.notEqual(recognitionFor(q).tone,'shared',q.word);
  for(const course of Object.values(COURSES))for(const mode of ['language','meaning']){
    const session=createSession(course.questions.length,course.questions,rng(),mode);
    for(const q of session.deck){
      session.choices=mode==='meaning'?makeMeaningChoices(q):makeChoices(q);
      assert.equal(answerQuestion(session,mode==='meaning'?q.meaning:q.language),true);
      advance(session);
    }
    assert.equal(session.done,true);
    assert.equal(getStats(session).correct,course.questions.length);
  }
});
