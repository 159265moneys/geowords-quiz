import {LANGUAGES,QUESTIONS} from './data.js?v=20261006-3';

export function shuffle(items,random=Math.random){
  const result=[...items];
  for(let i=result.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[result[i],result[j]]=[result[j],result[i]];}
  return result;
}

export function makeChoices(question,random=Math.random){
  const excluded=new Set([question.language,...question.shared]);
  const pool=Object.keys(LANGUAGES).filter(key=>!excluded.has(key));
  const sameScript=pool.filter(key=>LANGUAGES[key].script===LANGUAGES[question.language].script);
  const others=pool.filter(key=>!sameScript.includes(key));
  const distractors=[...shuffle(sameScript,random),...shuffle(others,random)].slice(0,3);
  return shuffle([question.language,...distractors],random);
}

const MEANING_GROUPS=[
  {key:'road',label:'通り・道路',pattern:/通り|道|広場|一方通行/},
  {key:'exit',label:'出口',pattern:/出口/},
  {key:'school',label:'学校',pattern:/学校/},
  {key:'hospital',label:'病院',pattern:/病院/},
  {key:'pharmacy',label:'薬局',pattern:/薬局/},
  {key:'municipality',label:'市役所・自治体',pattern:/役場|市役所|自治体/},
  {key:'station',label:'鉄道駅',pattern:/鉄道駅/},
  {key:'shop',label:'店',pattern:/店|食堂|食料品|両替所|薬局|パン屋|製パン所/},
  {key:'temple',label:'寺院',pattern:/寺院/},
  {key:'toilet',label:'トイレ',pattern:/トイレ/},
  {key:'stop',label:'一時停止',pattern:/停止/}
];

export function makeMeaningChoices(question,random=Math.random){
  // Exclude broader/overlapping translations as well as the identical answer.
  const exclusions=new Set(MEANING_GROUPS.filter(g=>g.pattern.test(question.meaning)).map(g=>g.key));
  if(exclusions.has('shop'))exclusions.add('pharmacy');
  if(exclusions.has('station'))exclusions.add('road');
  const pool=MEANING_GROUPS.filter(g=>!exclusions.has(g.key)).map(g=>g.label);
  return shuffle([question.meaning,...shuffle(pool,random).slice(0,3)],random);
}

export function createSession(count=QUESTIONS.length,questions=QUESTIONS,random=Math.random,mode='language'){
  return {deck:shuffle(questions,random).slice(0,count),index:0,answers:[],choices:[],done:false,mode};
}

export function answerQuestion(session,language){
  if(session.done||session.answers.length>session.index||!session.choices.includes(language))return false;
  const question=session.deck[session.index];
  session.answers.push({id:question.id,selected:language,correct:language===(session.mode==='meaning'?question.meaning:question.language)});
  return true;
}

export function advance(session){
  if(session.answers.length!==session.index+1||session.done)return false;
  if(session.index===session.deck.length-1)session.done=true;
  else session.index++;
  return true;
}

export function getStats(session){
  const correct=session.answers.filter(a=>a.correct).length;
  let streak=0;
  for(let i=session.answers.length-1;i>=0&&session.answers[i].correct;i--)streak++;
  return {correct,streak,answered:session.answers.length,total:session.deck.length};
}
