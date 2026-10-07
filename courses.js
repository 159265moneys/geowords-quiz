import {QUESTIONS} from './data.js?v=20261007-4';

// An editorial starting set: visible scripts, distinctive spelling, and two
// stop-sign cues with an explicit context. Not a statistical confidence rank.
const starterWords=new Set([
  'Straße','gatvė','szkoła','náměstí','οδός','ถนน','วัด','ផ្លូវ',
  '약국','학교','止まれ','רחוב','בית ספר','đường','nhà thuốc','cấm',
  'tänav','iela','utca','stradă','eczane','rruga','вулиця','lékárna',
  'lekáreň','udkørsel','sykehus','väg','DUR','BERHENTI'
]);

export const COURSES={
  starter:{label:'基本30語',questions:QUESTIONS.filter(q=>starterWords.has(q.word))},
  all:{label:'全110語',questions:QUESTIONS}
};
