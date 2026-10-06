import {LANGUAGES,QUESTIONS} from './data.js?v=20261006-4';
import {recognitionFor} from './recognition.js?v=20261006-4';
import {createSession,makeChoices,makeMeaningChoices,answerQuestion,advance,getStats} from './quiz.js?v=20261006-4';

const main=document.querySelector('#main');
const icons={
  arrow:'<path d="m9 5 7 7-7 7"/>',
  check:'<path d="m5 12 4 4L19 6"/>',
  cross:'<path d="m6 6 12 12M18 6 6 18"/>',
  shuffle:'<path d="M4 6h3c4 0 6 12 10 12h3M4 18h3c1.4 0 2.8-1.6 4-4M14 8c1-1.2 2-2 3-2h3m-3-3 3 3-3 3m0 6 3 3-3 3"/>',
  pin:'<path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z"/><circle cx="12" cy="10" r="2.5"/>',
  book:'<path d="M12 6v15M3 4c4-1 6 0 9 2 3-2 5-3 9-2v14c-4-1-6 0-9 2-3-2-5-3-9-2Z"/>',
  eye:'<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
  globe:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c6 6 6 12 0 18-6-6-6-12 0-18Z"/>'
};
const icon=(name,cls='')=>`<svg class="icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name]||icons.book}</svg>`;
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let size=QUESTIONS.length;
let mode='language';
const choicesFor=q=>mode==='meaning'?makeMeaningChoices(q):makeChoices(q);
let session;
let reviewing=false;

function start(count=size,pool=QUESTIONS,review=false){
  reviewing=review;
  session=createSession(count,pool,Math.random,mode);
  session.choices=choicesFor(session.deck[0]);
  render();
}

function controls(){
  return `<div class="toolbar"><div class="section-label"><span class="section-index">01</span> ${mode==='meaning'?'MEANING QUIZ':'LANGUAGE QUIZ'} ${reviewing?'<span class="review-badge">復習</span>':''}</div><div class="quiz-settings"><label for="round-size">出題数</label><select id="round-size" aria-label="出題数を変更して新しいクイズを開始">${[10,25,QUESTIONS.length].map(n=>`<option value="${n}" ${n===size?'selected':''}>${n===QUESTIONS.length?'全':''}${n}問</option>`).join('')}</select><button class="icon-button" id="restart" aria-label="シャッフルして最初から" title="シャッフルして最初から">${icon('shuffle')}</button></div></div><div class="mode-switch" role="group" aria-label="出題形式"><button data-mode="language" aria-pressed="${mode==='language'}">言語を当てる</button><button data-mode="meaning" aria-pressed="${mode==='meaning'}">意味を当てる</button></div>`;
}

function details(question){
  const language=LANGUAGES[question.language];
  const recognition=recognitionFor(question);
  return `<div class="recognition-strip tone-${recognition.tone}"><div class="recognition-label">${icon('eye')}<span>一目で分かる？</span><strong>${recognition.label}</strong></div><p>${escape(recognition.text)}</p></div><div class="learning-grid">
    <section class="learning-block word-notes"><div class="note-label">${icon('book')} このことば</div><h3>${escape(question.meaning)}</h3><p>${escape(question.explanation)}</p><a class="source-link" href="${escape(question.source)}" target="_blank" rel="noopener noreferrer">単語の出典 · ${escape(question.sourceLabel)} <span aria-hidden="true">↗</span></a></section>
    <section class="learning-block"><div class="note-label">${icon('eye')} 見分けるポイント</div><div class="letter-samples" aria-label="特徴的な文字や単語">${escape(language.marks)}</div><p>${escape(question.clue)}</p><p class="language-tip">${escape(language.tip)}</p></section>
    <section class="learning-block origin-block"><div class="note-label">${icon('globe')} 言語のルーツ</div><p>${escape(language.origin)}</p><div class="source-links"><a class="source-link" href="https://en.wikipedia.org/wiki/${encodeURIComponent(language.name==='スロベニア語'?'Slovene':language.name==='クロアチア語'?'Croatian':language.name==='セルビア語'?'Serbian':language.wiki)}_language" target="_blank" rel="noopener noreferrer">言語の資料 <span aria-hidden="true">↗</span></a><a class="source-link" href="https://www.plonkit.net/${question.guide||language.guide}" target="_blank" rel="noopener noreferrer">地域のガイド · Plonk It <span aria-hidden="true">↗</span></a></div></section>
  </div>`;
}

function feedback(question,answer){
  const language=LANGUAGES[question.language];
  return `<section class="answer-panel" aria-labelledby="answer-title"><div class="answer-header"><div class="answer-title-wrap"><span class="result-icon ${answer.correct?'is-correct':'is-wrong'}">${icon(answer.correct?'check':'cross')}</span><div><div class="answer-eyebrow">${answer.correct?'正解':'正解は'}</div><h2 id="answer-title">${mode==='meaning'?escape(question.meaning):language.name}<span>${mode==='meaning'?language.name:escape(language.native)}</span></h2><div class="country-line">${icon('pin')}<span><span class="country-label">国・地域</span>${escape(question.countries||language.countries)}</span></div></div></div></div>${details(question)}<div class="answer-footer"><span class="answer-position">${String(session.index+1).padStart(2,'0')} / ${session.deck.length}</span><button class="primary-button" id="next">${session.index===session.deck.length-1?'結果を見る':'次のことば'}<kbd>Enter</kbd></button></div></section>`;
}

function render(){
  if(session.done){document.querySelector('.feedback-announcement').textContent='クイズ完了';renderResults();return;}
  const question=session.deck[session.index];
  const answer=session.answers[session.index];
  const stats=getStats(session);
  const length=[...question.word].length;
  main.innerHTML=`${controls()}<div class="round-heading"><h1>${mode==='meaning'?'このことば、どんな意味？':'このことば、何語？'}</h1><div class="round-counter"><strong>${String(session.index+1).padStart(2,'0')}</strong><span>/ ${session.deck.length}</span></div></div><div class="progress-track" role="progressbar" aria-label="回答済み" aria-valuenow="${stats.answered}" aria-valuemin="0" aria-valuemax="${stats.total}"><div style="width:${stats.answered/stats.total*100}%"></div></div><div class="quiz-grid"><section class="word-stage" aria-label="出題された単語"><div class="word-stage-top"><span>STREET WORDS</span><span class="sign-corner" aria-hidden="true">＋</span></div><div class="sign-face"><div class="sign-word ${length>12?'word-long':length>8?'word-medium':''} script-${LANGUAGES[question.language].script}" dir="${LANGUAGES[question.language].dir||'ltr'}" lang="${question.language}" id="question-word">${escape(question.word)}</div><div class="sign-rule" aria-hidden="true"></div></div><div class="word-stage-bottom"><span>WORD ${question.id.slice(-3)}</span><span class="coordinate-symbol" aria-hidden="true">⊕</span><span>GEOWORDS</span></div></section><section class="choices-panel" aria-label="${mode==='meaning'?'意味の選択肢':'言語の選択肢'}"><div class="choices-label">${mode==='meaning'?'意味を選ぶ':'言語を選ぶ'} <span>${mode==='meaning'?'SELECT MEANING':'SELECT LANGUAGE'}</span></div><div class="choices">${session.choices.map((key,index)=>{
    const correct=!!answer&&key===(mode==='meaning'?question.meaning:question.language);
    const wrong=!!answer&&key===answer.selected&&!answer.correct;
    return `<button class="choice ${correct?'choice-correct':''} ${wrong?'choice-wrong':''} ${answer&&!correct&&!wrong?'choice-muted':''}" data-language="${escape(key)}" ${answer?'disabled':''}><span class="choice-key">${index+1}</span><span class="choice-copy"><span class="choice-name">${mode==='meaning'?escape(key):escape(LANGUAGES[key].name)}</span>${mode==='language'?`<span class="choice-countries">${escape(LANGUAGES[key].countries)}</span>`:''}</span><span class="choice-status">${correct?`${icon('check')}<span>正解</span>`:wrong?`${icon('cross')}<span>選択</span>`:icon('arrow')}</span></button>`;
  }).join('')}</div><div class="live-stats"><span><span class="stat-label">正解</span><strong>${stats.correct}</strong><span class="stat-denominator">/ ${stats.answered}</span></span><span><span class="stat-label">連続</span><strong>${stats.streak}</strong><span class="streak-sparks" aria-hidden="true">${stats.streak>0?'✦':''}</span></span></div></section></div>${answer?feedback(question,answer):'<div class="keyboard-hint"><kbd>1</kbd><kbd>2</kbd><kbd>3</kbd><kbd>4</kbd><span>で選択</span></div>'}`;
  document.querySelector('.feedback-announcement').textContent=answer?`${answer.correct?'正解です。':'不正解です。正解は'}${mode==='meaning'?question.meaning:LANGUAGES[question.language].name}。${mode==='meaning'?LANGUAGES[question.language].name:question.meaning}`:'';
  bind();
}

function bind(){
  document.querySelectorAll('[data-mode]').forEach(button=>button.addEventListener('click',()=>{if(mode===button.dataset.mode)return;mode=button.dataset.mode;start();}));
  document.querySelector('#round-size')?.addEventListener('change',event=>{size=Number(event.target.value);start();});
  document.querySelector('#restart')?.addEventListener('click',()=>start());
  document.querySelectorAll('[data-language]').forEach(button=>button.addEventListener('click',()=>choose(button.dataset.language)));
  document.querySelector('#next')?.addEventListener('click',next);
}

function choose(language){
  if(!answerQuestion(session,language))return;
  render();
  // Preserve keyboard flow after replacing disabled answer controls.
  document.querySelector('#next').focus({preventScroll:true});
  if(window.matchMedia('(max-width: 720px)').matches)document.querySelector('.answer-panel').scrollIntoView({behavior:reducedMotion()?'instant':'smooth',block:'start'});
}

function reducedMotion(){return window.matchMedia('(prefers-reduced-motion: reduce)').matches;}

function next(){
  if(!advance(session))return;
  if(!session.done)session.choices=choicesFor(session.deck[session.index]);
  render();
  window.scrollTo({top:0,behavior:reducedMotion()?'instant':'smooth'});
  (document.querySelector('.choice')||document.querySelector('#play-again')).focus({preventScroll:true});
}

function renderResults(){
  const stats=getStats(session);
  const missed=session.deck.filter((q,i)=>!session.answers[i].correct);
  const percent=Math.round(stats.correct/stats.total*100);
  main.innerHTML=`<div class="toolbar"><div class="section-label"><span class="section-index">02</span> FIELD REPORT</div><span class="finished-badge">${reviewing?'復習':mode==='meaning'?'意味クイズ':'言語クイズ'}完了</span></div><section class="results-hero"><div class="result-ring" style="--score:${percent}%"><div><strong>${stats.correct}<span>/${stats.total}</span></strong><small>正解</small></div></div><div class="results-copy"><div class="eyebrow">ROUND COMPLETE</div><h1>${percent===100?'すべて、見抜いた。':percent>=70?'ことばが、道しるべに。':'次の旅へ、もう一歩。'}</h1><div class="results-metrics"><span>正答率 <strong>${percent}<small>%</small></strong></span><span>復習 <strong>${missed.length}<small>問</small></strong></span></div><div class="result-actions">${missed.length?'<button class="primary-button" id="review-missed">間違えたことばを復習</button>':''}<button class="${missed.length?'secondary-button':'primary-button'}" id="play-again">もう一度</button></div></div></section>${missed.length?`<section class="review-list"><div class="review-list-title"><h2>もう一度、覚えたいことば</h2><span>${missed.length} WORDS</span></div>${missed.map(question=>`<details class="review-item"><summary><span class="review-word" dir="${LANGUAGES[question.language].dir||'ltr'}" lang="${question.language}">${escape(question.word)}</span><span class="review-meaning">${escape(question.meaning)}</span><span class="review-language"><span>${escape(LANGUAGES[question.language].name)}</span><span class="review-countries">${escape(question.countries||LANGUAGES[question.language].countries)}</span></span>${icon('arrow')}</summary>${details(question)}</details>`).join('')}</section>`:'<div class="perfect-note">100% <span>お見事！</span></div>'}`;
  document.querySelector('#play-again').addEventListener('click',()=>{start();window.scrollTo({top:0});});
  document.querySelector('#review-missed')?.addEventListener('click',()=>{start(missed.length,missed,true);window.scrollTo({top:0});});
}

document.addEventListener('keydown',event=>{
  if(event.repeat||event.altKey||event.ctrlKey||event.metaKey||['SELECT','INPUT','TEXTAREA'].includes(event.target.tagName))return;
  if(session.done)return;
  if(/^[1-4]$/.test(event.key)&&session.answers.length===session.index){event.preventDefault();choose(session.choices[Number(event.key)-1]);}
  else if(event.key==='Enter'&&session.answers.length>session.index&&!['A','SUMMARY'].includes(event.target.tagName)&&(event.target.tagName!=='BUTTON'||event.target.id==='next')){event.preventDefault();next();}
});

start();
