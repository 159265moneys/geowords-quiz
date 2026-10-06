import {LANGUAGES,QUESTIONS} from './data.js';

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

export function createSession(count=100,questions=QUESTIONS,random=Math.random){
  return {deck:shuffle(questions,random).slice(0,count),index:0,answers:[],choices:[],done:false};
}

export function answerQuestion(session,language){
  if(session.done||session.answers.length>session.index||!session.choices.includes(language))return false;
  const question=session.deck[session.index];
  session.answers.push({id:question.id,selected:language,correct:language===question.language});
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
