import {STEPS,ROUTES,FALLBACKS} from './guide-data.js?v=20261007-3';
import {COUNTRY_QUESTIONS,COUNTRIES} from './country-data.js?v=20261007-3';
import {renderClue,renderCountryStage} from './country-ui.js?v=20261007-3';
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const icons={sun:'<circle cx="12" cy="12" r="4"/><path d="M12 1v3m0 16v3M1 12h3m16 0h3M4 4l2 2m12 12 2 2M4 20l2-2M18 6l2-2"/>',mountain:'<path d="m2 20 7-14 5 8 3-5 5 11H2Zm4-8 3 2 2-3"/>',road:'<path d="M6 2 2 22M18 2l4 20M12 3v4m0 3v4m0 3v4"/>',pole:'<path d="M12 22V3M3 6h18M6 3v6m12-6v6M4 13h16"/>',sign:'<path d="M12 2v20M3 5h14l4 4-4 4H3V5Z"/>',plate:'<rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 6v12m3-6h2m3 0h2m2 0h1"/>',text:'<path d="M4 4h16M12 4v16M8 20h8"/>',arrow:'<path d="m9 5 7 7-7 7"/>',check:'<path d="m5 12 4 4L19 6"/>'};
const icon=name=>`<svg viewBox="0 0 24 24" class="icon" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name]||icons.arrow}</svg>`;
const levelName={finish:'国まで',region:'その辺',skip:'保留'};
let stepIndex=0;
let filter='all';
let query='';
const visited=new Set([0]);
const sketch=(body,label)=>`<div class="sketch" role="img" aria-label="${escape(label)}"><span class="sketch-label">図解</span><svg viewBox="0 0 320 140" aria-hidden="true">${body}</svg></div>`;
function visual(card){
  if(card.plateRef){const q=COUNTRY_QUESTIONS.find(q=>q.country===card.plateRef);return `<div class="observation-visual">${renderClue(q.clues.find(c=>c.kind==='plates'))}</div>`;}
  const key=card.visual;
  if(!key)return '';
  const signs={'stop-dur':'tr','stop-berhenti':'my','stop-japan':'jp'};
  if(signs[key])return `<div class="observation-visual">${renderClue(COUNTRY_QUESTIONS.find(q=>q.country===signs[key]).clues[0])}</div>`;
  if(key==='stop-pare')return `<div class="observation-visual">${renderClue({kind:'sign',label:'停止標識',value:'PARE',shape:'octagon'})}</div>`;
  if(key==='warning')return `<div class="observation-visual">${renderClue({kind:'warning',label:'警戒標識'})}</div>`;
  if(key==='crosswalk')return `<div class="observation-visual">${renderClue({kind:'crosswalk',label:'横断歩道'})}</div>`;
  if(key==='drive-left')return `<div class="observation-visual">${renderClue({kind:'drive',label:'通行方向',side:'left'})}</div>`;
  if(key==='speed-compare')return sketch('<rect x="30" y="20" width="110" height="108" rx="7" fill="white" stroke="#33493c" stroke-width="3"/><text x="85" y="43" text-anchor="middle" font-size="14">SPEED</text><text x="85" y="60" text-anchor="middle" font-size="14">LIMIT</text><text x="85" y="106" text-anchor="middle" font-size="44">55</text><rect x="179" y="20" width="110" height="108" rx="7" fill="white" stroke="#33493c" stroke-width="3"/><text x="234" y="45" text-anchor="middle" font-size="13">MAXIMUM</text><text x="234" y="93" text-anchor="middle" font-size="44">80</text><text x="234" y="115" text-anchor="middle" font-size="13">km/h</text>','速度標識の見出し。米 SPEED LIMIT、加 MAXIMUM');
  if(key==='mexico-shield')return sketch('<path d="M107 25q53 16 106 0v49q-5 30-53 52-48-22-53-52Z" fill="white" stroke="#344b40" stroke-width="3"/><text x="160" y="54" text-anchor="middle" font-size="17" fill="#233e39">MEXICO</text><text x="160" y="95" text-anchor="middle" font-size="34" fill="#233e39">15</text>','白黒の国道盾に MEXICO と番号');
  if(key==='thai-lao')return sketch('<text x="85" y="64" text-anchor="middle" font-size="32" fill="#233e39">หยุด</text><text x="235" y="64" text-anchor="middle" font-size="32" fill="#233e39">ຢຸດ</text><text x="85" y="100" text-anchor="middle" font-size="15" fill="#557648">タイ・左側</text><text x="235" y="100" text-anchor="middle" font-size="15" fill="#557648">ラオス・右側</text>','停止標識の文字。タイは左側通行、ラオスは右側通行');
  if(key==='script-compare')return sketch('<text x="85" y="65" text-anchor="middle" font-size="33" fill="#233e39">학교</text><text x="235" y="65" text-anchor="middle" font-size="33" fill="#233e39">ផ្លូវ</text><text x="85" y="102" text-anchor="middle" font-size="15" fill="#557648">ハングル</text><text x="235" y="102" text-anchor="middle" font-size="15" fill="#557648">クメール</text>','ハングル 학교 とクメール文字 ផ្លូវ の字形');
  if(key==='greek-drive')return sketch('<text x="82" y="55" text-anchor="middle" font-size="30" fill="#233e39">Δ Λ Ω</text><text x="242" y="55" text-anchor="middle" font-size="30" fill="#233e39">Δ Λ Ω</text><text x="82" y="96" text-anchor="middle" font-size="18" fill="#426953">← 左側</text><text x="242" y="96" text-anchor="middle" font-size="18" fill="#426953">右側 →</text>','ギリシャ文字の場面で左右通行を比較');
  if(key.startsWith('sun-'))return sketch(`<circle cx="160" cy="68" r="42" fill="none" stroke="#8da08e"/><path d="M160 10V26m0 84v20M103 68h16m82 0h16" stroke="#8da08e"/><text x="160" y="15" text-anchor="middle" font-size="12" fill="#637463">N</text><text x="160" y="136" text-anchor="middle" font-size="12" fill="#637463">S</text><circle cx="160" cy="${key==='sun-north'?38:96}" r="14" fill="#e4bd48"/><path d="M140 70h40" stroke="#4a6256" stroke-width="2"/>`,'コンパスの南北と太陽を比較。時刻と緯度に条件あり');
  if(key.startsWith('road-')){const outer=key==='road-africa'?'#efcb50':'#e3eee7';const centre=key==='road-africa'?'#e3eee7':'#efcb50';return sketch(`<path d="M90 140 123 0h74l33 140Z" fill="#435a55"/><path d="M98 140 129 0M222 140 191 0" stroke="${outer}" stroke-width="4"/><path d="M160 140V0" stroke="${centre}" stroke-width="3" stroke-dasharray="13 9"/><text x="40" y="80" font-size="12" fill="#6f805f">外側</text><text x="242" y="80" font-size="12" fill="#6f805f">中央</text><path d="m80 76 28-4m129 4-68-4" stroke="#839379"/>`,key==='road-africa'?'外側が黄色、中央が白い道路':'外側が白、中央が黄色い道路');}
  if(key.startsWith('pole-')){
    const detail=key==='pole-yellow'?'<rect x="143" y="39" width="34" height="54" rx="2" fill="#edce59"/><path d="M148 50h24m-24 8h20m-20 8h24m-24 8h18m-18 8h24" stroke="#6b5f31"/>':key==='pole-stripes'?'<defs><pattern id="pole-stripes-pattern" width="16" height="16" patternUnits="userSpaceOnUse" patternTransform="rotate(-30)"><rect width="16" height="16" fill="#f4d252"/><rect width="8" height="16" fill="#243d35"/></pattern></defs><rect x="147" y="76" width="26" height="58" fill="url(#pole-stripes-pattern)"/>':'<rect x="153" y="64" width="14" height="18" rx="2" fill="#edf2e8"/><rect x="153" y="91" width="14" height="24" rx="2" fill="#edf2e8"/>';
    return sketch(`<path d="M158 11v121" stroke="#8f9b8d" stroke-width="22"/><path d="M115 26h90m-68-10v20m47-20v20M90 22l43 4m52 0 50-8" stroke="#586f60" stroke-width="3"/>${detail}<path d="M90 134h140" stroke="#70836e"/>`,card.title);
  }
  if(key==='giveway-red')return sketch('<path d="M30 20H150L90 125Z" fill="white" stroke="#b83342" stroke-width="7"/><text x="90" y="54" text-anchor="middle" fill="#bb293c" font-size="17" font-weight="700">GIVE</text><text x="90" y="76" text-anchor="middle" fill="#bb293c" font-size="17" font-weight="700">WAY</text><path d="M205 24h65v62l-32 29-33-29Z" fill="#b83342"/><text x="238" y="78" text-anchor="middle" fill="white" font-size="35">1</text>','GIVE WAY の赤い文字と赤い国道番号の盾');
  if(key==='pipe-sign')return sketch('<path d="M67 135V18h190v117" fill="none" stroke="#8a9890" stroke-width="5"/><path d="M79 32h145l22 28-22 28H79Z" fill="white" stroke="#b4343c" stroke-width="5"/><path d="M95 60h110" stroke="#b4343c" stroke-width="7"/><path d="m198 48 16 12-16 12" fill="none" stroke="#b4343c" stroke-width="5"/>','矢印標識の周囲をパイプが囲む');
  if(key==='sign-cross')return sketch('<rect x="102" y="18" width="116" height="74" rx="4" fill="#a6b5a8"/><path d="M160 18v118M97 54h126" stroke="#fafcf4" stroke-width="9"/><circle cx="160" cy="54" r="3" fill="#6d8071"/>','標識の背面の白い十字の金属支え');
  if(key==='plate-ukraine')return sketch('<rect x="50" y="48" width="220" height="46" rx="5" fill="#fff" stroke="#455b50" stroke-width="2"/><rect x="52" y="50" width="23" height="22" fill="#3779bb"/><rect x="52" y="72" width="23" height="20" fill="#edcd47"/><text x="174" y="80" text-anchor="middle" font-size="27" fill="#304b3b">••• •••</text>','白いナンバー左端の青黄二色');
  if(key==='plate-yellow')return sketch('<rect x="83" y="41" width="154" height="58" rx="6" fill="#efc64e" stroke="#5e6145" stroke-width="2"/><text x="160" y="79" text-anchor="middle" font-size="28" fill="#344839">••• •••</text>','横長で黄色いナンバー');
  const landscapes={
    volcano:'<path d="M0 115 45 81 67 93 129 37 167 53 200 28 250 81 320 66v74H0Z" fill="#697a70"/><path d="m102 100 17-9 12 11m49 15 22-13 26 14m-173 0 9-6 10 8" fill="none" stroke="#354d40" stroke-width="4"/>',
    'table-mountain':'<path d="M0 110 50 92 72 46h90l24 64 47-11 23-55h44l20 62v34H0Z" fill="#87977b"/><path d="M71 62h95M64 78h108m81-19h52m-58 18h65" stroke="#596f54" stroke-width="5"/><path d="M34 124v-20h20v20M28 104l16-15 16 15Z" fill="#ac9569"/>',
    'stone-town':'<path d="M10 133V58h68v75m7 0V29h75v104m8 0V67h69v66m7 0V45h68v88" fill="#cfbe96" stroke="#b2a27d"/><path d="M34 75h20v29H34Zm73-24h27v30h-27Zm78 42h22v26h-22Zm77-31h28v28h-28Z" fill="#748872"/>',
    'flat-land':'<path d="M0 91h320v49H0Z" fill="#9bae81"/><path d="m90 140 25-50h30l9 50Z" fill="#8db6b1"/><path d="M211 85V53h39v32Z" fill="#a66f59"/><path d="m203 53 27-23 28 23Z" fill="#605e4d"/><path d="M5 93h310" stroke="#576e52"/>'
  };
  return landscapes[key]?sketch(landscapes[key],card.title):'';
}
function renderStep(){
  const step=STEPS[stepIndex];
  document.querySelector('#step-nav').innerHTML=STEPS.map((s,i)=>`<button class="step-tab ${i===stepIndex?'active':''}" data-step="${i}" aria-current="${i===stepIndex?'step':'false'}"><span class="step-number">${visited.has(i)?icon('check'):String(i+1).padStart(2,'0')}</span>${icon(s.icon)}<span>${s.name}</span></button>`).join('');
  document.querySelector('#step-content').innerHTML=`<div class="step-heading"><div><span class="eyebrow">OBSERVE ${String(stepIndex+1).padStart(2,'0')}</span><h2 id="step-title" tabindex="-1">${step.question}</h2></div><span class="step-count">${stepIndex+1} / 7</span></div><div class="move-strip">${icon('arrow')}<span>${step.move}</span></div><div class="observation-grid">${step.cards.map(card=>`<article class="observation-card level-${card.level}"><div class="observation-top"><span class="level-tag">${levelName[card.level]}</span></div>${visual(card)}<h3>${card.title}</h3><div class="observation-result">${icon('arrow')}<strong>${card.result}</strong></div><div class="next-look"><span>次に見る</span><b>${card.next}</b></div><details class="card-details"><summary>条件と見分け方</summary><p>${card.detail}</p></details>${card.routes?`<div class="route-links">${card.routes.map(id=>{const route=ROUTES.find(r=>r.id===id);return `<button data-route="${id}">${route.country}の模範解答 ${icon('arrow')}</button>`;}).join('')}</div>`:''}</article>`).join('')}</div><div class="skip-step"><div><span>見つからない・曖昧</span><strong>${step.skip}</strong></div><button id="next-step">${stepIndex<6?`${STEPS[stepIndex+1].name}へ`:'詰まったときの動きへ'} ${icon('arrow')}</button></div><details class="step-sources"><summary>この項目の資料</summary><div>${step.sources.map(s=>`<a href="${s.url}" target="_blank" rel="noopener noreferrer">${s.title} ↗</a>`).join('')}</div></details>`;
  document.querySelectorAll('[data-step]').forEach(button=>button.addEventListener('click',()=>setStep(Number(button.dataset.step))));
  document.querySelector('#next-step').addEventListener('click',()=>stepIndex<6?setStep(stepIndex+1):document.querySelector('#stuck').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'}));
  bindRoutes(document.querySelector('#step-content'));
}
function setStep(index){stepIndex=index;visited.add(index);renderStep();document.querySelector('#step-title').focus({preventScroll:true});document.querySelector('#flow').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});}
function bindRoutes(root){root.querySelectorAll('[data-route]').forEach(button=>button.addEventListener('click',()=>openRoute(button.dataset.route)));}
function renderRoutes(){
  const normalized=query.normalize('NFKC').toLocaleLowerCase();
  const visible=ROUTES.filter(route=>(filter==='all'||route.level===filter)&&JSON.stringify(route).normalize('NFKC').toLocaleLowerCase().includes(normalized));
  document.querySelector('#route-count').textContent=visible.length;
  document.querySelector('#route-grid').innerHTML=visible.length?visible.map(route=>`<button class="route-preview" data-route="${route.id}"><span class="route-region">${route.region}</span><strong>${route.country}</strong><span class="route-preview-title">${route.title}</span><span class="route-preview-bottom"><span class="level-tag ${route.level==='region'?'is-region':''}">${levelName[route.level]}</span><span>${route.steps.length} STEPS ${icon('arrow')}</span></span></button>`).join(''):'<div class="no-results">該当するルートがありません</div>';
  bindRoutes(document.querySelector('#route-grid'));
}
function openRoute(id){
  const route=ROUTES.find(r=>r.id===id);
  if(!route)return;
  const dialog=document.querySelector('#route-dialog');
  dialog.innerHTML=`<div class="dialog-bar"><span class="level-tag ${route.level==='region'?'is-region':''}">${levelName[route.level]}</span><button id="close-route" aria-label="模範解答を閉じる">×</button></div><span class="route-region">${route.region}</span><h2 id="dialog-title">${route.country}</h2><p class="dialog-subtitle">${route.title}</p>${route.question?renderCountryStage(route.question):''}<ol class="thought-trace">${route.steps.map(([stage,observation,result],i)=>`<li><span class="trace-number">${i+1}</span><div><span class="trace-stage">${STEPS.find(s=>s.id===stage)?.name||'観察'}</span><h3>${escape(observation)}</h3><p>${icon('arrow')}${escape(result)}</p></div></li>`).join('')}</ol><div class="route-conclusion ${route.level==='region'?'regional-conclusion':''}"><span>${route.level==='finish'?'この条件なら':'ここまでで止める'}</span><strong>${route.country}</strong></div><div class="missing-next"><span>決め手が欠けたら</span><strong>${route.next}</strong></div><p class="route-explanation">${escape(route.summary||route.question.explanation)}</p>${route.question?`<div class="route-comparison">${route.question.compare.map(([key,reason])=>`<div><strong>${COUNTRY_NAMES[key]||key}</strong><span>${reason}</span></div>`).join('')}</div>`:''}<details class="route-sources"><summary>適用条件・資料</summary><p>${escape(route.question?.note||'通常の道路カバレッジで、示された条件がそろう場合の模範ルート。見えない特徴を補って判定しない。')}</p><div>${route.sources.map(s=>`<a href="${s.url}" target="_blank" rel="noopener noreferrer">${s.title} ↗</a>`).join('')}</div></details><button class="dialog-done" id="done-route">一覧へ戻る</button>`;
  const close=()=>dialog.close();
  document.querySelector('#close-route').addEventListener('click',close);
  document.querySelector('#done-route').addEventListener('click',close);
  dialog.showModal();
  dialog.scrollTop=0;
}
const COUNTRY_NAMES=Object.fromEntries(Object.entries(COUNTRIES).map(([key,value])=>[key,value.name]));

renderStep();
renderRoutes();
document.querySelector('#guide-search').addEventListener('input',event=>{query=event.target.value;renderRoutes();});
document.querySelectorAll('[data-filter]').forEach(button=>button.addEventListener('click',()=>{filter=button.dataset.filter;document.querySelectorAll('[data-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));renderRoutes();}));
document.querySelector('#fallback-grid').innerHTML=FALLBACKS.map(item=>`<article><span class="fallback-label">${item.title}</span><h3>${item.action}</h3><p>${item.hold}</p></article>`).join('');
document.querySelector('#total-routes').textContent=ROUTES.length;
