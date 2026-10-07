import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {TABLE_COUNTRIES,TABLE_BY_CODE,TABLE_RULES,RELIABILITY,TYPES,conditionKey,ruleProgress,countryProgress,selectRules} from '../country-table-data.js';
import {PHOTOS} from '../photo-data.js';

test('country table has complete sourced rules, country coverage and safe photos',()=>{
 assert.ok(TABLE_COUNTRIES.length>=108);assert.ok(TABLE_RULES.length>=223);
 assert.equal(new Set(TABLE_COUNTRIES.map(p=>p.code)).size,TABLE_COUNTRIES.length);
 assert.equal(new Set(TABLE_RULES.map(r=>r.id)).size,TABLE_RULES.length);
 for(const p of TABLE_COUNTRIES){assert.ok(TABLE_RULES.some(r=>r.country===p.code));assert.ok(TABLE_RULES.some(r=>r.country===p.code&&r.type==='address'));}
 for(const r of TABLE_RULES){
  assert.ok(TABLE_BY_CODE[r.country]&&RELIABILITY[r.grade]&&TYPES[r.type],r.id);
  assert.ok(r.conditions.length>=1&&r.conditions.length<=3,r.id);
  assert.equal(new Set(r.conditions).size,r.conditions.length,r.id);
  assert.ok(r.title&&r.scope&&r.next&&r.explanation);
  assert.ok(r.sources.length>0);
  for(const s of r.sources)assert.ok(s?.title&&new URL(s.url).protocol==='https:',r.id);
  for(const id of r.photos){assert.ok(PHOTOS[id],id);if(PHOTOS[id].plate)assert.equal(PHOTOS[id].mosaic,true,id);}
  if(r.example)assert.equal(new URL(r.example).protocol,'https:');
 }
});

test('every rule requires its own full set, including one-shot rules',()=>{
 for(const r of TABLE_RULES){
  const checks=new Set();assert.equal(ruleProgress(r,checks).complete,false);
  r.conditions.forEach((_,i)=>{checks.add(conditionKey(r,i));const state=ruleProgress(r,checks);assert.equal(state.matched,i+1);assert.equal(state.remaining,r.conditions.length-i-1);assert.equal(state.complete,i===r.conditions.length-1);});
  checks.delete(conditionKey(r,0));assert.equal(ruleProgress(r,checks).complete,false);
 }
});

test('checks in different rows or countries never pool into a false completion',()=>{
 const a=TABLE_RULES.find(r=>r.id==='gb-distance'),b=TABLE_RULES.find(r=>r.id==='gb-address-finish');
 const checks=new Set([conditionKey(a,0),conditionKey(a,1),conditionKey(b,2)]);
 assert.equal(checks.size,3);assert.equal(countryProgress('gb',checks).grade,null);
 checks.add(conditionKey(a,2));assert.equal(ruleProgress(a,checks).complete,true);
 assert.equal(countryProgress('gb',checks).grade,'A','more evidence does not promote an A rule to S');
 assert.equal(countryProgress('nl',checks).complete,0);
 checks.add(conditionKey(b,0));checks.add(conditionKey(b,1));assert.equal(countryProgress('gb',checks).grade,'S');
});

test('filters retain all matching alternative sets and explicit empty results',()=>{
 assert.equal(selectRules().length,TABLE_RULES.length);
 assert.ok(selectRules({query:'黒テープ'}).some(r=>r.country==='gh'));
 assert.ok(selectRules({query:'Netherlands'}).every(r=>r.country==='nl'));
 assert.equal(selectRules({query:'一致しない語987654321'}).length,0);
 assert.ok(selectRules({type:'single'}).length>=10);
 assert.ok(selectRules({type:'car'}).length>=16);
 for(const r of selectRules({type:'single',grade:'S'}))assert.equal(r.conditions.length,1);
 for(const r of selectRules({area:'アジア',grade:'S'})){assert.equal(TABLE_BY_CODE[r.country].area,'アジア');assert.equal(r.grade,'S');}
});

test('shared clues, territories and confidence keep material boundaries',()=>{
 const byId=Object.fromEntries(TABLE_RULES.map(r=>[r.id,r]));
 assert.equal(byId['gb-distance'].grade,'A');assert.match(byId['gb-distance'].explanation,/マン島/);
 assert.equal(byId['om-plate'].grade,'A');assert.match(byId['om-plate'].explanation,/西岸/);
 assert.match(byId['bt-plate'].explanation,/ネパール/);
 assert.match(byId['ke-snorkel'].explanation,/モンゴル/);
 assert.ok(byId['ke-snorkel'].conditions.includes('左側通行'));
 assert.match(byId['re-rear-tape'].conditions[0],/後ろ/);assert.match(byId['gh-front-tape'].conditions[0],/前/);
 assert.equal(TABLE_BY_CODE.re.parent,'フランス');assert.equal(TABLE_BY_CODE.pr.parent,'アメリカ');
 for(const code of ['ru','kz','us','ca','gb','il','cw','re'])assert.match(byId[`${code}-address-finish`].explanation,/共有|属領|西岸/);
 for(const r of TABLE_RULES)assert.doesNotMatch(r.explanation,/信頼度\s*\d+%|正答率\s*100%/);
});

test('new page is reachable from both entry points and versions match',async()=>{
 for(const file of ['index.html','quiz.html'])assert.match(await readFile(new URL('../'+file,import.meta.url),'utf8'),/href="\.\/countries.html"/);
 const html=await readFile(new URL('../countries.html',import.meta.url),'utf8');
 assert.match(html,/<table id="country-table">/);assert.match(html,/必要数・信頼度/);
 for(const file of ['countries.html','country-table.js','country-table-data.js']){
  const source=await readFile(new URL('../'+file,import.meta.url),'utf8');
  assert.ok([...source.matchAll(/\?v=([\d-]+)/g)].every(m=>m[1]==='20261007-6'));
 }
});
