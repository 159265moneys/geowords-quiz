import test from 'node:test';
import assert from 'node:assert/strict';
import {COUNTRY_PROFILES,EXTRA_CASES} from '../country-cases.js';
import {COUNTRIES,COUNTRY_QUESTIONS} from '../country-data.js';
import {LANGUAGES} from '../data.js';
import {STEPS,ROUTES} from '../guide-data.js';
import {PHOTOS} from '../photo-data.js';
import {renderCountryStage,countryDetails} from '../country-ui.js';
const visible=html=>html.replace(/<[^>]*>/g,' ').replace(/\s+/g,' ');

test('all 80 country prompts withhold country/language interpretations until answered',()=>{
  const spoilers=[...Object.values(COUNTRIES).map(c=>c.name),...Object.values(LANGUAGES).map(l=>l.name),'ギリシャ文字','シンハラ文字','クメール文字','ハングル','マルタ語','仏語'];
  for(const q of COUNTRY_QUESTIONS){
    const before=renderCountryStage(q,{quiz:true,revealed:false});
    const text=visible(before);
    for(const name of spoilers)assert.ok(!text.includes(name),`${q.id}: answer leaked: ${name}`);
    assert.doesNotMatch(before,/class="clue-detail">(?:フランス語|オランダ語|ギリシャ文字|シンハラ文字)/);
    assert.doesNotMatch(before,/class="country-answer-body"|class="country-comparisons"|class="source-link"/);
    for(const match of before.matchAll(/<button[^>]*data-photo=[^>]*>/g))assert.match(match[0],/data-photo-quiz="true"/,q.id);
    assert.ok(visible(countryDetails(q)).includes(COUNTRIES[q.country].name));
    const after=renderCountryStage(q,{quiz:true,revealed:true});
    assert.doesNotMatch(after,/data-photo-quiz="true"/);
    for(const clue of q.clues)if(clue.detail)assert.ok(visible(after).includes(clue.detail),q.id);
  }
});

test('54 countries have distinct road, alternative and local-contact worked cases',()=>{
  assert.equal(COUNTRY_PROFILES.length,54);
  assert.equal(EXTRA_CASES.length,162);
  assert.equal(new Set(EXTRA_CASES.map(c=>c.id)).size,162);
  assert.equal(new Set(EXTRA_CASES.map(c=>JSON.stringify(c.observations))).size,162);
  assert.equal(EXTRA_CASES.filter(c=>c.quiz).length,64);
  const stages=new Set(STEPS.map(s=>s.id));
  for(const p of COUNTRY_PROFILES){
    assert.equal(EXTRA_CASES.filter(c=>c.country===p.code).length,3,p.code);
    assert.match(p.phone,/^\d{1,3}$/);
    assert.match(p.tld,/^[a-z]{2}$/);
  }
  for(const c of EXTRA_CASES){
    assert.ok(COUNTRIES[c.country]);
    assert.ok(stages.has(c.stage));
    assert.ok(c.steps.length>=2&&c.next&&c.summary&&c.note);
    assert.ok(c.compare.length>=1);
    assert.ok(c.observations.length>=2);
    assert.ok(c.sources.every(s=>s.title&&s.url.startsWith('https://')));
    for(const id of c.photos)assert.ok(PHOTOS[id],`${c.id}: ${id}`);
    assert.ok(ROUTES.find(r=>r.id===c.id));
  }
  assert.equal(STEPS.reduce((sum,s)=>sum+s.cards.length,0),205);
});

test('shared numbering, domains, plates and regional languages keep the needed qualifiers',()=>{
  for(const code of ['us','ca'])assert.match(EXTRA_CASES.find(c=>c.id===`case-${code}-contact`).summary,/共有/);
  for(const code of ['co','la'])assert.match(EXTRA_CASES.find(c=>c.id===`case-${code}-contact`).summary,/国外/);
  assert.match(EXTRA_CASES.find(c=>c.id==='case-ar-mercosur').steps[0][2],/ブラジル.*ウルグアイ/);
  assert.match(EXTRA_CASES.find(c=>c.id==='case-hu-double-acute').steps[0][2],/隣国/);
  assert.match(EXTRA_CASES.find(c=>c.id==='case-lk-tamil').steps[0][2],/インド/);
  assert.match(EXTRA_CASES.find(c=>c.id==='case-za-regional-road').steps[0][2],/ボツワナ.*レソト.*エスワティニ.*ナミビア/);
  for(const card of STEPS.flatMap(s=>s.cards).filter(c=>c.evidence))assert.ok(card.evidence.length>=2,'expanded cards must show the full condition set, not just a country label');
});
