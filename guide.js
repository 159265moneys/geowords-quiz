import {renderPhotoSet,renderPlatePhotos,bindPhotoViewer} from './photo-view.js?v=20261007-5';
import {VISUAL_PHOTOS,ROUTE_PHOTOS} from './photo-data.js?v=20261007-5';
import {STEPS,ROUTES,FALLBACKS} from './guide-data.js?v=20261007-5';
import {COUNTRIES} from './country-data.js?v=20261007-5';
import {renderCountryStage} from './country-ui.js?v=20261007-5';
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const icons={sun:'<circle cx="12" cy="12" r="4"/><path d="M12 1v3m0 16v3M1 12h3m16 0h3M4 4l2 2m12 12 2 2M4 20l2-2M18 6l2-2"/>',mountain:'<path d="m2 20 7-14 5 8 3-5 5 11H2Zm4-8 3 2 2-3"/>',road:'<path d="M6 2 2 22M18 2l4 20M12 3v4m0 3v4m0 3v4"/>',pole:'<path d="M12 22V3M3 6h18M6 3v6m12-6v6M4 13h16"/>',sign:'<path d="M12 2v20M3 5h14l4 4-4 4H3V5Z"/>',plate:'<rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 6v12m3-6h2m3 0h2m2 0h1"/>',text:'<path d="M4 4h16M12 4v16M8 20h8"/>',arrow:'<path d="m9 5 7 7-7 7"/>',check:'<path d="m5 12 4 4L19 6"/>'};
const icon=name=>`<svg viewBox="0 0 24 24" class="icon" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name]||icons.arrow}</svg>`;
const levelName={finish:'国まで',region:'その辺',skip:'保留'};
let stepIndex=0;
let filter='all';
let query='';
let area='all';
let stage='all';
let page=0;
let cardLimit=8;
const pageSize=24;
const visited=new Set([0]);
function visual(card){
  return card.plateRef?renderPlatePhotos(card.plateRef):renderPhotoSet(card.photos||VISUAL_PHOTOS[card.visual]);
}
function renderStep(){
  const step=STEPS[stepIndex];
  document.querySelector('#step-nav').innerHTML=STEPS.map((s,i)=>`<button class="step-tab ${i===stepIndex?'active':''}" data-step="${i}" aria-current="${i===stepIndex?'step':'false'}"><span class="step-number">${visited.has(i)?icon('check'):String(i+1).padStart(2,'0')}</span>${icon(s.icon)}<span>${s.name}</span></button>`).join('');
  document.querySelector('#step-content').innerHTML=`<div class="step-heading"><div><span class="eyebrow">OBSERVE ${String(stepIndex+1).padStart(2,'0')}</span><h2 id="step-title" tabindex="-1">${step.question}</h2></div><span class="step-count">${step.cards.length} カード</span></div><div class="move-strip">${icon('arrow')}<span>${step.move}</span></div><div class="observation-grid">${step.cards.slice(0,cardLimit).map(card=>`<article class="observation-card level-${card.level}"><div class="observation-top"><span class="level-tag">${levelName[card.level]}</span></div>${visual(card)}<h3>${card.title}</h3>${card.evidence?`<ul class="card-evidence">${card.evidence.map(fact=>`<li>${escape(fact)}</li>`).join('')}</ul>`:''}<div class="observation-result">${icon('arrow')}<strong>${card.result}</strong></div><div class="next-look"><span>次に見る</span><b>${card.next}</b></div><details class="card-details"><summary>条件と見分け方</summary><p>${card.detail}</p></details>${card.routes?`<div class="route-links">${card.routes.map(id=>{const route=ROUTES.find(r=>r.id===id);return `<button data-route="${id}">${route.country}の模範解答 ${icon('arrow')}</button>`;}).join('')}</div>`:''}</article>`).join('')}</div>${step.cards.length>cardLimit?`<button class="show-more" id="more-cards">続きを見る <span>${cardLimit} / ${step.cards.length}</span> ↓</button>`:''}<div class="skip-step"><div><span>見つからない・曖昧</span><strong>${step.skip}</strong></div><button id="next-step">${stepIndex<6?`${STEPS[stepIndex+1].name}へ`:'詰まったときの動きへ'} ${icon('arrow')}</button></div><details class="step-sources"><summary>この項目の資料</summary><div>${step.sources.map(s=>`<a href="${s.url}" target="_blank" rel="noopener noreferrer">${s.title} ↗</a>`).join('')}</div></details>`;
  document.querySelectorAll('[data-step]').forEach(button=>button.addEventListener('click',()=>setStep(Number(button.dataset.step))));
  document.querySelector('#next-step').addEventListener('click',()=>stepIndex<6?setStep(stepIndex+1):document.querySelector('#stuck').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'}));
  document.querySelector('#more-cards')?.addEventListener('click',()=>{const top=window.scrollY;cardLimit+=8;renderStep();window.scrollTo({top,behavior:'instant'});const nextCard=document.querySelectorAll('.observation-card')[cardLimit-8];if(nextCard){nextCard.tabIndex=-1;nextCard.focus({preventScroll:true});}});
  bindRoutes(document.querySelector('#step-content'));
}
function setStep(index){stepIndex=index;cardLimit=8;visited.add(index);renderStep();document.querySelector('#step-title').focus({preventScroll:true});document.querySelector('#flow').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});}
function bindRoutes(root){root.querySelectorAll('[data-route]').forEach(button=>button.addEventListener('click',()=>openRoute(button.dataset.route)));}
function renderRoutes(){
  const normalized=query.normalize('NFKC').toLocaleLowerCase();
  const visible=ROUTES.filter(route=>(filter==='all'||route.level===filter)&&(area==='all'||route.area===area)&&(stage==='all'||route.stages.includes(stage))&&JSON.stringify(route).normalize('NFKC').toLocaleLowerCase().includes(normalized));
  page=Math.min(page,Math.max(0,Math.ceil(visible.length/pageSize)-1));
  document.querySelector('#route-count').textContent=visible.length;
  document.querySelector('#route-grid').innerHTML=visible.length?visible.slice(page*pageSize,(page+1)*pageSize).map(route=>`<button class="route-preview" data-route="${route.id}"><span class="route-region">${route.region}</span><strong>${route.country}</strong><span class="route-preview-title">${route.title}</span><span class="route-preview-bottom"><span class="level-tag ${route.level==='region'?'is-region':''}">${levelName[route.level]}</span><span>${route.steps.length} STEPS ${icon('arrow')}</span></span></button>`).join(''):'<div class="no-results">該当するルートがありません</div>';
  document.querySelector('#route-pager').innerHTML=visible.length>pageSize?`<button data-page="${page-1}" ${page===0?'disabled':''} aria-label="前のページ">← 前へ</button><span>${page+1} / ${Math.ceil(visible.length/pageSize)}</span><button data-page="${page+1}" ${(page+1)*pageSize>=visible.length?'disabled':''} aria-label="次のページ">次へ →</button>`:'';
  document.querySelectorAll('[data-page]').forEach(button=>button.addEventListener('click',()=>{page=Number(button.dataset.page);renderRoutes();document.querySelector('#route-grid').scrollIntoView({behavior:'instant',block:'start'});document.querySelector('#route-grid button')?.focus({preventScroll:true});}));
  bindRoutes(document.querySelector('#route-grid'));
}
function openRoute(id){
  const route=ROUTES.find(r=>r.id===id);
  if(!route)return;
  const dialog=document.querySelector('#route-dialog');
  dialog.innerHTML=`<div class="dialog-bar"><span class="level-tag ${route.level==='region'?'is-region':''}">${levelName[route.level]}</span><button id="close-route" aria-label="模範解答を閉じる">×</button></div><span class="route-region">${route.region}</span><h2 id="dialog-title">${route.country}</h2><p class="dialog-subtitle">${route.title}</p>${route.question?renderCountryStage(route.question):renderPhotoSet(route.photos||ROUTE_PHOTOS[route.id])}<ol class="thought-trace">${route.steps.map(([stage,observation,result],i)=>`<li><span class="trace-number">${i+1}</span><div><span class="trace-stage">${STEPS.find(s=>s.id===stage)?.name||'観察'}</span><h3>${escape(observation)}</h3><p>${icon('arrow')}${escape(result)}</p></div></li>`).join('')}</ol><div class="route-conclusion ${route.level==='region'?'regional-conclusion':''}"><span>${route.level==='finish'?'この条件なら':'ここまでで止める'}</span><strong>${route.country}</strong></div><div class="missing-next"><span>決め手が欠けたら</span><strong>${route.next}</strong></div><p class="route-explanation">${escape(route.summary||route.question.explanation)}</p>${(route.compare||route.question?.compare)?`<div class="route-comparison">${(route.compare||route.question.compare).map(([key,reason])=>`<div><strong>${escape(COUNTRY_NAMES[key]||key)}</strong><span>${escape(reason)}</span></div>`).join('')}</div>`:''}<details class="route-sources"><summary>適用条件・資料</summary><p>${escape(route.note||route.question?.note||'通常の道路カバレッジで、示された条件がそろう場合の模範ルート。見えない特徴を補って判定しない。')}</p><div>${route.sources.map(s=>`<a href="${s.url}" target="_blank" rel="noopener noreferrer">${s.title} ↗</a>`).join('')}</div></details><button class="dialog-done" id="done-route">一覧へ戻る</button>`;
  const close=()=>dialog.close();
  document.querySelector('#close-route').addEventListener('click',close);
  document.querySelector('#done-route').addEventListener('click',close);
  dialog.showModal();
  dialog.scrollTop=0;
}
const COUNTRY_NAMES=Object.fromEntries(Object.entries(COUNTRIES).map(([key,value])=>[key,value.name]));

bindPhotoViewer();
renderStep();
renderRoutes();
document.querySelector('#guide-search').addEventListener('input',event=>{query=event.target.value;page=0;renderRoutes();});
document.querySelectorAll('[data-filter]').forEach(button=>button.addEventListener('click',()=>{filter=button.dataset.filter;page=0;document.querySelectorAll('[data-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));renderRoutes();}));
document.querySelector('#fallback-grid').innerHTML=FALLBACKS.map(item=>`<article><span class="fallback-label">${item.title}</span><h3>${item.action}</h3><p>${item.hold}</p></article>`).join('');
document.querySelector('#total-routes').textContent=ROUTES.length;

document.querySelector('#area-filter').innerHTML='<option value="all">全地域</option>'+[...new Set(ROUTES.map(r=>r.area))].map(a=>`<option value="${a}">${a}</option>`).join('');
document.querySelector('#stage-filter').innerHTML='<option value="all">全観察項目</option>'+STEPS.map(s=>`<option value="${s.id}">${s.name}</option>`).join('');
document.querySelector('#area-filter').addEventListener('change',event=>{area=event.target.value;page=0;renderRoutes();});
document.querySelector('#stage-filter').addEventListener('change',event=>{stage=event.target.value;page=0;renderRoutes();});
document.querySelector('#total-cards').textContent=STEPS.reduce((n,s)=>n+s.cards.length,0);
