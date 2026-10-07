import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {COUNTRIES,COUNTRY_QUESTIONS} from '../country-data.js';
import {STEPS,ROUTES,FALLBACKS} from '../guide-data.js';
import {makeCountryChoices,createSession,answerQuestion,advance,getStats} from '../quiz.js';
import {renderClue,renderCountryStage,countryDetails,renderCountryReview,renderCountryStudy} from '../country-ui.js';

const random=()=>0.36;
const checkSources=sources=>{
  assert.ok(sources.length);
  for(const source of sources){assert.ok(source.title);assert.equal(new URL(source.url).protocol,'https:');}
};

test('country combinations offer four distinct valid countries and complete evidence',()=>{
  assert.equal(COUNTRY_QUESTIONS.length,16);
  assert.equal(new Set(COUNTRY_QUESTIONS.map(q=>q.country)).size,16);
  assert.equal(new Set(COUNTRY_QUESTIONS.map(q=>q.id)).size,16);
  for(const q of COUNTRY_QUESTIONS){
    const choices=makeCountryChoices(q,random);
    assert.equal(choices.length,4);
    assert.equal(new Set(choices).size,4);
    assert.ok(choices.includes(q.country));
    for(const key of choices)assert.ok(COUNTRIES[key]?.name);
    for(const [key,reason] of q.compare){assert.ok(COUNTRIES[key]?.name);assert.ok(reason);}
    for(const key of ['title','scope','explanation','note'])assert.ok(q[key]);
    assert.ok(q.rule.length>=2);
    assert.ok(q.clues.length>=2);
    checkSources(q.sources);
    for(const clue of q.clues){assert.ok(clue.label);assert.doesNotMatch(renderClue(clue),/undefined|NaN/);}
    for(const render of [renderCountryStage,countryDetails,renderCountryReview])assert.doesNotMatch(render(q),/undefined|NaN/);
  }
  assert.equal((renderCountryStudy().match(/class="study-card"/g)||[]).length,16);
});

test('country scoring and missed-only review work through an entire round',()=>{
  const session=createSession(16,COUNTRY_QUESTIONS,random,'country');
  for(const [i,q] of session.deck.entries()){
    session.choices=makeCountryChoices(q,random);
    assert.equal(advance(session),false);
    const choice=i%2?q.country:session.choices.find(k=>k!==q.country);
    assert.equal(answerQuestion(session,choice),true);
    assert.equal(answerQuestion(session,q.country),false);
    assert.equal(advance(session),true);
  }
  assert.equal(session.done,true);
  assert.equal(getStats(session).correct,8);
  const missed=session.deck.filter((q,i)=>!session.answers[i].correct);
  const review=createSession(missed.length,missed,random,'country');
  assert.equal(review.deck.length,8);
  for(const q of review.deck){review.choices=makeCountryChoices(q);answerQuestion(review,q.country);advance(review);}
  assert.equal(review.done,true);
  assert.equal(getStats(review).correct,8);
});

test('seven observation stages link to complete worked routes with next moves',()=>{
  assert.deepEqual(STEPS.map(s=>s.id),['sun','landscape','road','pole','sign','plate','text']);
  assert.equal(ROUTES.length,38);
  assert.equal(new Set(ROUTES.map(r=>r.id)).size,38);
  const stageIds=new Set(STEPS.map(s=>s.id));
  const routeIds=new Set(ROUTES.map(r=>r.id));
  for(const step of STEPS){
    assert.ok(step.move&&step.skip&&step.question);
    checkSources(step.sources);
    for(const card of step.cards){
      assert.ok(['finish','region','skip'].includes(card.level));
      assert.ok(card.title&&card.result&&card.next&&card.detail);
      for(const id of card.routes||[])assert.ok(routeIds.has(id),`${step.id}: ${id}`);
      if(card.plateRef)assert.ok(COUNTRY_QUESTIONS.find(q=>q.country===card.plateRef)?.clues.some(c=>c.kind==='plates'));
    }
  }
  for(const route of ROUTES){
    assert.ok(route.country&&route.title&&route.next&&route.region);
    assert.ok(route.summary||route.question?.explanation);
    assert.ok(route.steps.length>=1);
    assert.ok(['finish','region'].includes(route.level));
    checkSources(route.sources);
    for(const [stage,observation,result] of route.steps){assert.ok(stageIds.has(stage));assert.ok(observation&&result);}
  }
});

test('ambiguous shared clues retain the right stopping points and concrete movement',()=>{
  for(const id of ['southern-africa','lesotho-region'])assert.equal(ROUTES.find(r=>r.id===id).level,'region');
  assert.ok(STEPS.find(s=>s.id==='sun').cards.every(c=>c.level!=='finish'));
  assert.ok(STEPS.find(s=>s.id==='pole').cards.every(c=>c.level!=='finish'));
  assert.match(ROUTES.find(r=>r.id==='australia').region,/豪州.*NZ/);
  const south=ROUTES.find(r=>r.id==='southern-africa');
  for(const name of ['ボツワナ','レソト','エスワティニ','ナミビア'])assert.ok(JSON.stringify(south).includes(name));
  assert.equal(FALLBACKS.length,6);
  for(const item of FALLBACKS)assert.ok(item.title&&item.action&&item.hold);
  assert.match(FALLBACKS.at(-1).hold,/国が決まる情報のない/);
});

test('home and quiz remain distinct entry points with consistent module versions',async()=>{
  const files=['index.html','quiz.html','guide.js','guide-data.js','app.js','country-ui.js','quiz.js','courses.js','recognition.js','photo-view.js'];
  for(const name of files){
    const text=await readFile(new URL(`../${name}`,import.meta.url),'utf8');
    const versions=[...text.matchAll(/\?v=([\d-]+)/g)].map(m=>m[1]);
    assert.ok(versions.length);
    assert.ok(versions.every(v=>v==='20261007-4'),name);
  }
  const home=await readFile(new URL('../index.html',import.meta.url),'utf8');
  assert.match(home,/src="\.\/guide\.js/);
  assert.match(home,/href="\.\/quiz\.html"/);
  const quiz=await readFile(new URL('../quiz.html',import.meta.url),'utf8');
  assert.match(quiz,/src="\.\/app\.js/);
  assert.match(quiz,/aria-label="模範解答集へ"/);
});
