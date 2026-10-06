import test from 'node:test';
import assert from 'node:assert/strict';
import {QUESTIONS,LANGUAGES} from '../data.js';
import {makeChoices,createSession,answerQuestion,advance,getStats} from '../quiz.js';

function rng(seed=714){return ()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};}

test('100 distinct questions with complete explanations across 40 languages',()=>{
  assert.equal(QUESTIONS.length,100);
  assert.equal(Object.keys(LANGUAGES).length,40);
  assert.equal(new Set(QUESTIONS.map(q=>q.id)).size,100);
  assert.equal(new Set(QUESTIONS.map(q=>q.word)).size,100);
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

test('all 100 questions are reachable once; duplicate answers and premature advance are ignored',()=>{
  const session=createSession(100,QUESTIONS,rng());
  const visited=new Set();
  for(let i=0;i<100;i++){
    const q=session.deck[session.index];
    visited.add(q.id);
    session.choices=makeChoices(q,rng(i+1));
    assert.equal(advance(session),false);
    assert.equal(answerQuestion(session,'not-a-language'),false);
    assert.equal(answerQuestion(session,q.language),true);
    assert.equal(answerQuestion(session,q.language),false);
    assert.equal(advance(session),true);
  }
  assert.equal(visited.size,100);
  assert.equal(session.done,true);
  assert.deepEqual(getStats(session),{correct:100,streak:100,answered:100,total:100});
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
