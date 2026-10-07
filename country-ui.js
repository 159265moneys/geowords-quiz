import {renderPhotoSet,renderPlatePhotos} from './photo-view.js?v=20261007-6';
import {COUNTRIES,COUNTRY_QUESTIONS} from './country-data.js?v=20261007-6';
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const colors={white:'白',yellow:'黄',black:'黒',red:'赤'};

export function renderClue(clue,country='',context={}){
  const testing=context.quiz&&!context.revealed;
  const photos=(items,extra='')=>renderPhotoSet(items,extra,{quiz:testing});
  let visual='';
  if(clue.kind==='plates'){
    const describe=(p,label)=>`${label}${colors[p.background]}${p.size==='short'?'・短い':''}`;
    visual=renderPlatePhotos(country,{quiz:testing})+`<span class="clue-detail">${describe(clue.front,'前：')} ／ ${describe(clue.rear,'後：')}</span>`;
  }
  if(clue.kind==='photo')visual=photos(clue.photos.map(id=>[id,clue.label]));
  if(clue.kind==='observation')visual=`<strong class="observation-fact">${escape(clue.value)}</strong>`;
  if(clue.kind==='drive')visual=`<div class="driving-clue"><strong>${clue.side==='left'?'← 左側通行':'右側通行 →'}</strong></div>`;
  if(clue.kind==='text'){
    const photo=country==='cy'?'cy-sign':country==='mt'&&clue.value.startsWith('Triq')?'triq':country==='fr'&&clue.value.startsWith('Rue')?'rue':null;
    visual=(photo?photos([[photo,testing?clue.label:undefined]]):'')+`<strong class="clue-text" dir="auto">${escape(clue.value)}</strong>${clue.detail&&!testing?`<span class="clue-detail">${escape(clue.detail)}</span>`:''}`;
  }
  if(clue.kind==='sign'){
    const photo={'DUR':'dur','BERHENTI':'berhenti','止まれ':'japan-stop','PARE':'pare'}[clue.value];
    visual=photo?photos([[photo,'停止標識']]):`<strong class="clue-text">${escape(clue.value)}</strong>`;
  }
  if(clue.kind==='warning')visual=photos([['ireland-warning','警戒標識']]);
  if(clue.kind==='crosswalk')visual=photos([['crosswalk','横断歩道']]);
  return `<div class="clue-card clue-${clue.kind}"><span class="clue-label">${escape(clue.label)}</span>${visual}</div>`;
}
export function renderCountryStage(question,context={}){
  return `<section class="country-stage" aria-label="国を絞る条件"><div class="evidence-scope"><span>${escape(question.scope)}</span>${question.clues.some(c=>c.kind==='plates')?'<span>一般車を複数確認</span>':''}</div><div class="clue-grid">${question.clues.map(clue=>renderClue(clue,question.country,context)).join('')}</div></section>`;
}
export function countryDetails(question){
  return `<div class="country-answer-body"><div class="rule-equation">${question.rule.map((part,i)=>`${i?'<span class="rule-plus" aria-hidden="true">＋</span>':''}<span class="rule-piece">${escape(part)}</span>`).join('')}<span class="rule-equals" aria-hidden="true">→</span><strong>${COUNTRIES[question.country].name}</strong></div><p class="country-explanation">${escape(question.explanation)}</p><div class="country-comparisons">${question.compare.map(([key,reason])=>`<div><strong>${COUNTRIES[key].name}</strong><span>${escape(reason)}</span></div>`).join('')}</div>${question.next?`<div class="answer-next"><span>決め手が欠けたら</span><strong>${escape(question.next)}</strong></div>`:''}<details class="country-note"><summary>適用条件・出典</summary><p>${escape(question.note)}</p><div class="source-links">${question.sources.map((s,i)=>`<a class="source-link" href="${escape(s.url)}" target="_blank" rel="noopener noreferrer">${escape(s.title)} ${i+1} ↗</a>`).join('')}</div></details></div>`;
}
export function renderCountryReview(question){
  return `<details class="review-item country-review"><summary><span class="review-word">${COUNTRIES[question.country].name}</span><span class="review-meaning">${escape(question.title)}</span><span class="review-language">${escape(question.scope)}</span><span aria-hidden="true">›</span></summary>${countryDetails(question)}</details>`;
}
export function renderCountryStudy(){
  return `<div class="toolbar"><div class="section-label"><span class="section-index">01</span> COUNTRY NOTES</div><button class="secondary-button" id="back-to-country">クイズに戻る</button></div><div class="round-heading"><h1>先に覚える、国の決め手</h1><div class="round-counter"><strong>${COUNTRY_QUESTIONS.length}</strong><span>セット</span></div></div><div class="study-grid">${COUNTRY_QUESTIONS.map((question,i)=>`<article class="study-card"><div class="study-card-heading"><span>${String(i+1).padStart(2,'0')}</span><h2>${COUNTRIES[question.country].name}</h2></div><div class="study-cues">${question.rule.map(part=>`<span>${escape(part)}</span>`).join('<b aria-hidden="true">＋</b>')}</div>${renderCountryStage(question)}<details class="study-explanation"><summary>見分け方</summary>${countryDetails(question)}</details></article>`).join('')}</div>`;
}
