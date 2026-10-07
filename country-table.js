import {TABLE_COUNTRIES,TABLE_BY_CODE,TABLE_RULES,RULE_BY_ID,RELIABILITY,AREAS,TYPES,conditionKey,ruleProgress,countryProgress,selectRules} from './country-table-data.js?v=20261007-6';
import {renderPhotoSet,bindPhotoViewer} from './photo-view.js?v=20261007-6';
const $=selector=>document.querySelector(selector);
const e=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const flag=code=>Array.from(code.toUpperCase(),c=>String.fromCodePoint(c.charCodeAt(0)+127397)).join('');
const checked=new Set();
const filters={query:'',area:'all',type:'all',grade:'all'};
const pageSize=16;
let page=1,dialogTrigger;
const dialog=$('#rule-dialog');
const badge=grade=>`<span class="reliability grade-${grade}"><b>${grade}</b> ${RELIABILITY[grade].label}</span>`;
function progressMarkup(rule){
 const p=ruleProgress(rule,checked);
 return `<div class="set-progress ${p.complete?'is-complete':''} grade-${rule.grade}"><div class="progress-number"><b>${p.matched}</b><span>/ ${p.total}</span><small>必須 ${p.total} 個</small></div><div class="progress-track" aria-hidden="true">${rule.conditions.map((_,i)=>`<i class="${checked.has(conditionKey(rule,i))?'filled':''}"></i>`).join('')}</div><strong class="progress-result">${p.complete?(rule.grade==='S'?'✓ 確定級':'✓ 非常に強い'):`あと ${p.remaining} 個`}</strong>${p.complete?'':badge(rule.grade)}</div>`;
}
function countryMarkup(code){
 const p=TABLE_BY_CODE[code],state=countryProgress(code,checked);
 return `<div class="country-label"><span class="country-flag" aria-hidden="true">${flag(code)}</span><strong>${e(p.name)}</strong><small>${e(p.native)}</small>${p.parent?`<span class="parent-label">${e(p.parent)}</span>`:''}<span class="country-outcome ${state.grade?'grade-'+state.grade:''}">${state.grade?`✓ ${RELIABILITY[state.grade].label}`:''}</span></div>`;
}
function conditionMarkup(rule,i){
 if(!rule.conditions[i])return `<td class="not-needed"><span aria-label="この条件は不要">—</span></td>`;
 const key=conditionKey(rule,i),selected=checked.has(key);
 return `<td class="condition-cell ${selected?'is-checked':''}"><label class="condition-check"><input type="checkbox" data-rule="${rule.id}" data-index="${i}" ${selected?'checked':''} aria-label="${e(TABLE_BY_CODE[rule.country].name)}：${e(rule.title)}：${e(rule.conditions[i])}"><span class="checkmark" aria-hidden="true"></span><span>${e(rule.conditions[i])}</span></label></td>`;
}
function render(){
 const selected=selectRules(filters);
 const codes=TABLE_COUNTRIES.map(p=>p.code).filter(code=>selected.some(r=>r.country===code));
 const pages=Math.max(1,Math.ceil(codes.length/pageSize));page=Math.min(page,pages);
 const shown=codes.slice((page-1)*pageSize,page*pageSize);
 document.querySelectorAll('#country-table tbody').forEach(body=>body.remove());
 $('#country-table').insertAdjacentHTML('beforeend',shown.map(code=>{
  const rules=selected.filter(r=>r.country===code);
  return `<tbody data-country="${code}">${rules.map((r,i)=>`<tr data-rule-row="${r.id}" class="${ruleProgress(r,checked).complete?'row-complete grade-'+r.grade:''}">${i===0?`<th scope="rowgroup" rowspan="${rules.length}" class="country-cell" data-country-cell="${code}">${countryMarkup(code)}</th>`:''}<th scope="row" class="rule-name"><span class="rule-category">${r.conditions.length===1?'⚡ 一撃':e(TYPES[r.type])}</span><button type="button" class="rule-detail" data-detail="${r.id}" aria-label="${e(TABLE_BY_CODE[code].name)}：${e(r.title)}の解説">${e(r.title)} <span>↗</span></button><small>${e(r.scope)}</small>${r.example?`<a class="example-link" href="${e(r.example)}" target="_blank" rel="noopener noreferrer">実写で比較 ↗</a>`:''}</th>${[0,1,2].map(i=>conditionMarkup(r,i)).join('')}<td class="result-cell" data-progress="${r.id}">${progressMarkup(r)}</td></tr>`).join('')}</tbody>`;
 }).join(''));
 $('#table-result').innerHTML=`<b>${codes.length}</b> 国・地域 <span> / ${selected.length} セット</span>`;
 $('#table-scroll').hidden=codes.length===0;$('#table-empty').hidden=codes.length>0;
 $('#table-pager').innerHTML=codes.length?`<button type="button" data-page="${page-1}" ${page===1?'disabled':''}>← 前へ</button><span><b>${page}</b> / ${pages}<small>${(page-1)*pageSize+1}–${Math.min(page*pageSize,codes.length)} 国・地域</small></span><button type="button" data-page="${page+1}" ${page===pages?'disabled':''}>次へ →</button>`:'';
 syncScrollButtons();syncReset();
}
function syncReset(){$('#reset-checks').disabled=checked.size===0;}
function syncScrollButtons(){const box=$('#table-scroll');$('#scroll-left').disabled=box.scrollLeft<2;$('#scroll-right').disabled=box.scrollLeft+box.clientWidth>=box.scrollWidth-2;}
function updateRule(id){
 const rule=RULE_BY_ID[id],p=ruleProgress(rule,checked);
 const row=document.querySelector(`[data-rule-row="${id}"]`);
 if(row){row.className=p.complete?'row-complete grade-'+rule.grade:'';row.querySelector('[data-progress]').innerHTML=progressMarkup(rule);}
 const country=document.querySelector(`[data-country-cell="${rule.country}"]`);if(country)country.innerHTML=countryMarkup(rule.country);
 $('#check-status').textContent=`${TABLE_BY_CODE[rule.country].name}、${rule.title}、${p.matched} / ${p.total}。${p.complete?RELIABILITY[rule.grade].label:`あと${p.remaining}個`}`;
 syncReset();
}
function openDialog(html,trigger){dialogTrigger=trigger;dialog.innerHTML=`<div class="dialog-bar"><span class="section-tag">COUNTRY FIELD NOTES</span><button type="button" class="close-rule" aria-label="解説を閉じる">×</button></div>${html}`;dialog.querySelector('.close-rule').addEventListener('click',()=>dialog.close());dialog.showModal();}
function showRule(id,trigger){
 const r=RULE_BY_ID[id],p=TABLE_BY_CODE[r.country];
 openDialog(`<div class="dialog-country">${flag(r.country)} ${e(p.name)} ${badge(r.grade)}</div><h2 id="rule-title">${e(r.title)}</h2><span class="dialog-scope">${e(r.scope)}</span><ol class="dialog-conditions">${r.conditions.map((c,i)=>`<li><span>${i+1}</span>${e(c)}</li>`).join('')}</ol><div class="dialog-requirement"><b>${r.conditions.length} 個すべて</b><span>→</span>${badge(r.grade)}</div>${renderPhotoSet(r.photos)}${r.example?`<a class="real-example" href="${e(r.example)}" target="_blank" rel="noopener noreferrer"><span>◉</span> Street View の実写で比較 <span>↗</span></a>`:''}<p class="rule-explanation">${e(r.explanation)}</p><div class="next-action"><span>足りないときの移動先</span><strong>${e(r.next)}</strong></div><details class="rule-sources"><summary>出典・信頼度</summary><p>${e(RELIABILITY[r.grade].description)}</p><div>${r.sources.map(s=>`<a href="${e(s.url)}" target="_blank" rel="noopener noreferrer">${e(s.title)} ↗</a>`).join('')}</div></details>`,trigger);
}
function showHelp(trigger){
 openDialog(`<h2 id="rule-title">何個で決まる？</h2><div class="help-equation"><b>同じ行の全条件</b><span>→</span><strong>その行の信頼度</strong></div><dl class="help-grades"><div><dt>${badge('S')}</dt><dd>${e(RELIABILITY.S.description)}</dd></div><div><dt>${badge('A')}</dt><dd>${e(RELIABILITY.A.description)}</dd></div></dl><p class="rule-explanation">3/3 は条件が全部そろったという意味です。正答率100%の意味ではありません。別の行の条件を足し合わせても判定は上がりません。どれか1行のセットを完成させます。</p><p class="rule-explanation">「一撃」は一つの標識や撮影装備を形・配色・位置まで識別できた場合。撮影車は指定された世代・車体そのもの、ナンバーは複数の普通車、文字は現地の公道や施設で確認します。</p><div class="next-action"><span>見つからないとき</span><strong>別の行のセット、または「住所で決着」へ</strong></div>`,trigger);
}
$('#table-area').insertAdjacentHTML('beforeend',AREAS.map(a=>`<option value="${e(a)}">${e(a)}</option>`).join(''));
$('#total-countries').textContent=TABLE_COUNTRIES.length;$('#total-rules').textContent=TABLE_RULES.length;$('#total-single').textContent=TABLE_RULES.filter(r=>r.conditions.length===1).length;
$('#table-search').addEventListener('input',event=>{filters.query=event.target.value;page=1;render();});
$('#table-area').addEventListener('change',event=>{filters.area=event.target.value;page=1;render();});
$('#table-grade').addEventListener('change',event=>{filters.grade=event.target.value;page=1;render();});
$('.table-tabs').addEventListener('click',event=>{const b=event.target.closest('[data-type]');if(!b)return;filters.type=b.dataset.type;page=1;document.querySelectorAll('[data-type]').forEach(t=>t.setAttribute('aria-pressed',String(t===b)));render();});
$('#country-table').addEventListener('change',event=>{const input=event.target.closest('input[data-rule]');if(!input)return;const key=conditionKey(RULE_BY_ID[input.dataset.rule],Number(input.dataset.index));if(input.checked)checked.add(key);else checked.delete(key);input.closest('td').classList.toggle('is-checked',input.checked);updateRule(input.dataset.rule);});
$('#country-table').addEventListener('click',event=>{const b=event.target.closest('[data-detail]');if(b)showRule(b.dataset.detail,b);});
$('#table-pager').addEventListener('click',event=>{const b=event.target.closest('[data-page]');if(!b)return;page=Number(b.dataset.page);render();$('.table-controls').scrollIntoView({block:'start',behavior:'instant'});$('#table-scroll').focus({preventScroll:true});});
$('#reset-checks').addEventListener('click',()=>{checked.clear();render();$('#check-status').textContent='すべてのチェックを解除しました';});
for(const id of ['help-button','bottom-help'])$('#'+id).addEventListener('click',event=>showHelp(event.currentTarget));
for(const [id,direction] of [['scroll-left',-1],['scroll-right',1]])$('#'+id).addEventListener('click',()=>$('#table-scroll').scrollBy({left:direction*240,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'}));
$('#table-scroll').addEventListener('scroll',syncScrollButtons,{passive:true});window.addEventListener('resize',syncScrollButtons);
dialog.addEventListener('close',()=>{if(dialogTrigger?.isConnected)dialogTrigger.focus({preventScroll:true});});
dialog.addEventListener('click',event=>{if(event.target!==dialog)return;const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();});
const query=new URLSearchParams(location.search);if(query.has('country')){filters.query=query.get('country');$('#table-search').value=filters.query;}
bindPhotoViewer();render();
