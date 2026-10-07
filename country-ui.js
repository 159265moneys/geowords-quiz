import {COUNTRIES,COUNTRY_QUESTIONS} from './country-data.js?v=20261007-3';
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const colors={white:'白',yellow:'黄',black:'黒',red:'赤'};

function renderPlate(p,label){
  const bands=[p.left!=='none'?`左${p.left==='blue'?'青':'赤'}`:'',p.right!=='none'?`右${p.right==='yellow'?'黄':'青'}`:''].filter(Boolean).join('・');
  const description=`${label}：${colors[p.background]}地・${colors[p.letters]}文字${bands?'・'+bands:''}${p.size==='short'?'・短い':''}`;
  return `<div class="plate-row"><span class="plate-position">${label}</span><div class="plate-space"><div class="plate-model plate-${p.background} plate-size-${p.size} letters-${p.letters}" role="img" aria-label="${description}">${p.left!=='none'?`<i class="plate-band band-${p.left}"></i>`:''}${p.emblem?'<i class="plate-emblem" aria-hidden="true">✚</i>':''}<span aria-hidden="true">••• •••</span>${p.right!=='none'?`<i class="plate-band band-${p.right}"></i>`:''}</div></div></div>`;
}
export function renderClue(clue){
  let visual='';
  if(clue.kind==='plates')visual=`<div class="plate-pair">${renderPlate(clue.front,'前')}${renderPlate(clue.rear,'後')}</div>`;
  if(clue.kind==='drive')visual=`<div class="driving-clue"><span class="road-model" aria-hidden="true"><b>${clue.side==='left'?'↑':'↓'}</b><b>${clue.side==='left'?'↓':'↑'}</b></span><strong>${clue.side==='left'?'左':'右'}側通行</strong></div>`;
  if(clue.kind==='text')visual=`<strong class="clue-text" dir="auto">${escape(clue.value)}</strong>${clue.detail?`<span class="clue-detail">${escape(clue.detail)}</span>`:''}`;
  if(clue.kind==='sign'){
    const triangle=clue.shape==='triangle-down';
    visual=`<svg class="stop-model ${triangle?'triangle-model':''}" viewBox="0 0 220 170" role="img" aria-label="${triangle?'赤い逆三角形':'赤い八角形'}に${escape(clue.value)}"><path d="${triangle?'M15 15H205L110 155Z':'M67 10H153L192 49V121L153 160H67L28 121V49Z'}" fill="#c82d3a" stroke="#fff" stroke-width="5"/><text x="110" y="${triangle?'68':'91'}" text-anchor="middle" fill="white" font-size="${clue.value.length>5?20:29}" font-weight="700">${escape(clue.value)}</text></svg>`;
  }
  if(clue.kind==='warning')visual='<div class="warning-model" role="img" aria-label="黄色いひし形の警戒標識"><span>!</span></div><span class="clue-detail">黄色いひし形</span>';
  if(clue.kind==='crosswalk')visual='<div class="crosswalk-model" role="img" aria-label="黄色い横断歩道"><i></i><i></i><i></i><i></i><i></i></div><span class="clue-detail">黄色いしま模様</span>';
  return `<div class="clue-card clue-${clue.kind}"><span class="clue-label">${escape(clue.label)}</span>${visual}</div>`;
}
export function renderCountryStage(question){
  return `<section class="country-stage" aria-label="国を絞る条件"><div class="evidence-scope"><span>${escape(question.scope)}</span>${question.clues.some(c=>c.kind==='plates')?'<span>一般車を複数確認</span>':''}</div><div class="clue-grid">${question.clues.map(renderClue).join('')}</div></section>`;
}
export function countryDetails(question){
  return `<div class="country-answer-body"><div class="rule-equation">${question.rule.map((part,i)=>`${i?'<span class="rule-plus" aria-hidden="true">＋</span>':''}<span class="rule-piece">${escape(part)}</span>`).join('')}<span class="rule-equals" aria-hidden="true">→</span><strong>${COUNTRIES[question.country].name}</strong></div><p class="country-explanation">${escape(question.explanation)}</p><div class="country-comparisons">${question.compare.map(([key,reason])=>`<div><strong>${COUNTRIES[key].name}</strong><span>${escape(reason)}</span></div>`).join('')}</div><details class="country-note"><summary>適用条件・出典</summary><p>${escape(question.note)}</p><div class="source-links">${question.sources.map((s,i)=>`<a class="source-link" href="${escape(s.url)}" target="_blank" rel="noopener noreferrer">${escape(s.title)} ${i+1} ↗</a>`).join('')}</div></details></div>`;
}
export function renderCountryReview(question){
  return `<details class="review-item country-review"><summary><span class="review-word">${COUNTRIES[question.country].name}</span><span class="review-meaning">${escape(question.title)}</span><span class="review-language">${escape(question.scope)}</span><span aria-hidden="true">›</span></summary>${countryDetails(question)}</details>`;
}
export function renderCountryStudy(){
  return `<div class="toolbar"><div class="section-label"><span class="section-index">01</span> COUNTRY NOTES</div><button class="secondary-button" id="back-to-country">クイズに戻る</button></div><div class="round-heading"><h1>先に覚える、国の決め手</h1><div class="round-counter"><strong>${COUNTRY_QUESTIONS.length}</strong><span>セット</span></div></div><div class="study-grid">${COUNTRY_QUESTIONS.map((question,i)=>`<article class="study-card"><div class="study-card-heading"><span>${String(i+1).padStart(2,'0')}</span><h2>${COUNTRIES[question.country].name}</h2></div><div class="study-cues">${question.rule.map(part=>`<span>${escape(part)}</span>`).join('<b aria-hidden="true">＋</b>')}</div>${renderCountryStage(question)}<details class="study-explanation"><summary>見分け方</summary>${countryDetails(question)}</details></article>`).join('')}</div>`;
}
