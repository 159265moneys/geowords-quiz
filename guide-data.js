import {COUNTRY_QUESTIONS,COUNTRIES} from './country-data.js?v=20261007-4';

const link=slug=>`https://www.plonkit.net/${slug}`;
export const STEPS=[
  {id:'sun',name:'太陽',icon:'sun',question:'南北を使える場面？',move:'コンパスと影の方向を確認',skip:'低い・真上・曇りなら保留',
    cards:[
      {title:'南寄りの高い太陽',level:'region',result:'北半球寄り',next:'通行方向・標識で裏付ける',detail:'正午に近く、熱帯の外と判断できる場面の補助。これだけで南半球の国を除外しない。',visual:'sun-south'},
      {title:'北寄りの高い太陽',level:'region',result:'南半球寄り',next:'左側／右側通行を見る',detail:'正午に近く、熱帯の外と判断できる場面の補助。撮影時刻や緯度が不明なら仮置き。',visual:'sun-north'},
      {title:'朝夕・真上・方位不明',level:'skip',result:'南北は決めない',next:'道路か公的な看板へ進む',detail:'朝夕は太陽の方位が大きく動く。熱帯では季節によって南北が逆転する。太陽を無理に使わなくてよい。'}
    ],sources:[{title:'NOAA・太陽位置',url:'https://gml.noaa.gov/grad/solcalc/solareqns.PDF'},{title:'太陽の使い方',url:link('beginners-guide')}]},
  {id:'landscape',name:'建築・植生',icon:'mountain',question:'強い地域のまとまりがある？',move:'遠景と住宅を両方見渡す',skip:'赤土・ヤシ・山だけなら後回し',
    cards:[
      {title:'黒い火山礫＋木の少ない広い荒野',level:'region',result:'アイスランドを先に照合',next:'白反射板の黄色いボラード／道路名の Þ',detail:'風景の候補出しで止め、道路上の目印で締める。木がないだけならフェロー諸島や高地も残る。',routes:['iceland'],visual:'volcano'},
      {title:'裸の台地状の山＋水平な岩の段',level:'region',result:'南部アフリカの高地',next:'左側通行・黄色い外側線 → 地名案内',detail:'レソトを優先して照合。丸い小屋や短い草は補助。南アフリカ側にも似た景観があるので国境までは決めない。',routes:['lesotho-region'],visual:'table-mountain'},
      {title:'石灰岩色の密な街並み・石垣',level:'region',result:'地中海圏を仮置き',next:'左側通行なら Triq を探す',detail:'建物の色だけでは国を選ばない。マルタの街路語まで見えたら国のルートへ。',routes:['mt'],visual:'stone-town'},
      {title:'低い土地＋運河・自転車道',level:'region',result:'オランダ周辺を照合',next:'普通車の前後色 → 街路名',detail:'ベルギー北部などにも似た景観がある。黄色い前後とオランダ語の道路名を重ねる。',routes:['nl','be'],visual:'flat-land'}
    ],sources:[{title:'アイスランド',url:link('iceland')},{title:'レソト',url:link('lesotho')},{title:'マルタ',url:link('malta')},{title:'オランダ',url:link('netherlands')},{title:'ベルギー',url:link('belgium')}]},
  {id:'road',name:'道路',icon:'road',question:'左右・外側線・中央線は？',move:'走っている車か交差点で通行方向を確認',skip:'白線だけ・線なしなら標識へ',
    cards:[
      {title:'左側通行＋黄色い外側線＋白い中央線',level:'region',result:'南部アフリカを先に照合',next:'国名・町名・道路番号がある案内板へ',detail:'南アフリカ、ボツワナ、レソト、エスワティニ、ナミビアで共有。外側と中央を取り違えない。',routes:['southern-africa','lesotho-region'],visual:'road-africa'},
      {title:'左側通行＋英語',level:'region',result:'複数地域が残る',next:'距離の単位・後ろのナンバー・GIVE WAY',detail:'英語と左側通行だけで豪州や英国へ決めない。mile、前白後黄、赤字 GIVE WAY などの次の目印へ。',routes:['gb','ie','new-zealand','australia'],visual:'drive-left'},
      {title:'黄色い横断歩道＋右側通行',level:'region',result:'欧州ならスイス／リヒテンシュタイン',next:'短い前ナンバーの色と青帯',detail:'白い短い前＋青帯なしならスイス型。黒い通常ナンバーならリヒテンシュタインを照合。',routes:['ch'],visual:'crosswalk'},
      {title:'ギリシャ文字＋通行方向',level:'finish',result:'左 → キプロス／右 → ギリシャ',next:'公的な案内の文字を確認',detail:'店の名前一つではなく、現地の道路案内にギリシャ文字が続く場面で使う。',routes:['cy','greece'],visual:'greek-drive'},
      {title:'黄色が中央線・外側は白',level:'region',result:'国はまだ絞り込まない',next:'左右通行・道路番号・文字へ',detail:'南北アメリカ、北欧の一部、ケニアなどにある。黄色い中央線を南部アフリカの外側線と混同しない。',visual:'road-centre'}
    ],sources:[{title:'南部アフリカ',url:link('south-africa')},{title:'スイス',url:link('switzerland')},{title:'キプロス',url:link('cyprus')},{title:'ギリシャ',url:link('greece')},{title:'ニュージーランド',url:link('new-zealand')},{title:'ケニア',url:link('kenya')}]},
  {id:'pole',name:'電柱',icon:'pole',question:'目立つ一部分だけ拾える？',move:'近くの一本をズーム。タグと根元を見る',skip:'普通の穴あき柱・丸柱は後回し',
    cards:[
      {title:'極端に大きい黄色い電柱タグ',level:'region',result:'ルーマニアを先に照合',next:'タグの地名・周囲の ă／ș／ț',detail:'小さい黄色い札は周辺国にもある。大きさと印字内容が見える場合だけ使う。',routes:['romania'],visual:'pole-yellow'},
      {title:'黒黄の斜線が地面まで続く',level:'region',result:'台湾を先に照合',next:'右側通行＋繁体字の道路案内',detail:'日本の多くの巻き付け型は地面まで届かない。斜線だけでなく、根元・通行方向・文字を合わせる。',routes:['taiwan'],visual:'pole-stripes'},
      {title:'柱の下部に大きな貫通穴',level:'region',result:'スリランカを照合',next:'左側通行＋シンハラ文字',detail:'穴のある電柱全般を暗記しない。下部の大きな穴が見える型だけ候補にし、現地文字で締める。',routes:['lk'],visual:'pole-holes'}
    ],sources:[{title:'ルーマニア',url:link('romania')},{title:'日本と台湾の電柱比較',url:link('japan')},{title:'スリランカ',url:link('sri-lanka')}]},
  {id:'sign',name:'標識',icon:'sign',question:'形と文字がセットで見える？',move:'交差点へ。表と裏を確認',skip:'普通の STOP だけならナンバーへ',
    cards:[
      {title:'停止標識の DUR',level:'finish',result:'トルコ',next:'赤い八角形とセットで確認',detail:'文章中の dur にはこの判定を使わない。通常の道路カバレッジが対象。',routes:['tr'],visual:'stop-dur'},
      {title:'停止標識の BERHENTI',level:'finish',result:'マレーシア',next:'停止標識として設置されていることを確認',detail:'文章中の単語はインドネシア語とも共通。標識としての使われ方を覚える。',routes:['my'],visual:'stop-berhenti'},
      {title:'赤い逆三角形＋止まれ',level:'finish',result:'日本',next:'逆三角形とひらがなを確認',detail:'STOP 併記の有無は問わない。赤い逆三角形の文字まで見る。',routes:['jp'],visual:'stop-japan'},
      {title:'欧州の黄色いひし形警戒標識',level:'finish',result:'アイルランド',next:'左側通行・白い後ろナンバーで確認',detail:'優先道路を示す黄色いひし形とは別。黒い危険図形が入った警戒標識を指す。',routes:['ie'],visual:'warning'},
      {title:'低い矢印標識を囲むパイプ枠',level:'region',result:'デンマークを先に照合',next:'赤白の標識＋道路名 -vej',detail:'枠があるだけではルクセンブルクも残る。矢印を含む赤白の表示と街路名まで組み合わせる。',routes:['denmark'],visual:'pipe-sign'},
      {title:'PARE／ALTO／STOP だけ',level:'region',result:'一国にはしない',next:'PARE → ã・õ／ALTO → 地名・路線番号',detail:'PARE はブラジルとスペイン語圏、ALTO はメキシコと中米の一部。意味より追加の文字・標識を探す。',routes:['brazil'],visual:'stop-pare'},
      {title:'赤字 GIVE WAY＋赤い路線盾',level:'finish',result:'ニュージーランド',next:'二つの標識を組み合わせる',detail:'左側通行の英語圏で使う。豪州の GIVE WAY は黒字。',routes:['new-zealand','australia'],visual:'giveway-red'},
      {title:'標識の裏に白い十字の支え',level:'region',result:'コロンビアを先に照合',next:'一般車の黄色いナンバー＋スペイン語',detail:'十字の形、支柱の白、普通車のプレートを重ねる。',routes:['colombia'],visual:'sign-cross'}
    ],sources:[{title:'トルコ',url:link('turkey')},{title:'マレーシア',url:link('malaysia')},{title:'日本',url:link('japan')},{title:'アイルランド',url:link('ireland')},{title:'デンマーク',url:link('denmark')},{title:'NZ',url:link('new-zealand')},{title:'コロンビア',url:link('colombia')}]},
  {id:'plate',name:'ナンバー',icon:'plate',question:'前後・文字色・端の帯は？',move:'普通車を数台。前と後ろを分けて見る',skip:'一台だけ・ぼけすぎなら道路名へ',
    cards:[
      {title:'黄色い欧州型プレート',level:'region',result:'まずオランダ。ルクセンブルクも残す',next:'前後とも黄？ → 現地の街路名',detail:'オランダ語の街路名ならオランダ。仏語の案内と枠付きの黄色い標識ならルクセンブルク。',routes:['nl','lu'],plateRef:'nl'},
      {title:'白地に赤い文字',level:'finish',result:'ベルギー型',next:'複数台で確認し、現地の標識と合わせる',detail:'赤い背景・赤い縁取りではない。車の登録国を示すため、外国車一台で撮影国を決めない。',routes:['be'],plateRef:'be'},
      {title:'前だけ短い＋両端が青',level:'finish',result:'イタリア型',next:'前が普通の長さなら仏・アルバニアも照合',detail:'青帯が二本だけでは決めない。短い前という条件が重要。',routes:['it','fr','al'],plateRef:'it'},
      {title:'白地・左青・右黄の細い帯',level:'finish',result:'ポルトガル旧式',next:'黄色いのは右端だけか確認',detail:'新式には黄帯がない。「ないから違う」という除外には使わない。',routes:['pt'],plateRef:'pt'},
      {title:'前白・後黄＋左側通行',level:'region',result:'欧州なら英国／キプロスを照合',next:'距離が mile か、ギリシャ文字か',detail:'世界全体ではスリランカ・ケニアなどもある。前後色だけで英国に固定しない。',routes:['gb','cy','lk','kenya'],plateRef:'gb'},
      {title:'短い白い前・青帯なし',level:'region',result:'スイスを先に照合',next:'黄色い横断歩道／後ろの国章',detail:'黒い通常ナンバーが続くならリヒテンシュタインを照合。',routes:['ch'],plateRef:'ch'},
      {title:'左端に青と黄の二色',level:'region',result:'ウクライナ型を照合',next:'道路名の вулиця・вул.／ї・є',detail:'単なる青いEU帯と区別。道路側のウクライナ語で撮影地域も裏付ける。',routes:['ukraine'],visual:'plate-ukraine'},
      {title:'中南米・一般車に黄色が続く',level:'region',result:'コロンビアを先に照合',next:'白い十字の標識裏を確認',detail:'タクシー・商用車を混ぜない。スペイン語圏という文脈も必要。',routes:['colombia'],visual:'plate-yellow'}
    ],sources:[{title:'オランダ',url:link('netherlands')},{title:'ルクセンブルク',url:link('luxembourg')},{title:'ベルギー',url:link('belgium')},{title:'イタリア',url:link('italy')},{title:'ポルトガル',url:link('portugal')},{title:'英国',url:link('united-kingdom')},{title:'ウクライナ',url:link('ukraine')},{title:'コロンビア',url:link('colombia')}]},
  {id:'text',name:'文字',icon:'text',question:'公的な道路表示に決め手はある？',move:'店名より、街路名・役所・道路案内へ',skip:'共通語だけなら地名を拾って地図照合',
    cards:[
      {title:'…straat／Rue …／Rruga …',level:'region',result:'ナンバーの候補を締める',next:'黄色前後→straat／両端青・長い前→RueかRruga',detail:'同じ言語を複数国で使うため、先に見たプレートの条件と組み合わせる。',routes:['nl','lu','fr','al']},
      {title:'ギリシャ文字／シンハラ文字',level:'finish',result:'通行方向を合わせる',next:'ギリシャ文字＋左→キプロス／シンハラ＋左→スリランカ',detail:'外国料理店の一枚でなく、現地の公的表示が続くことを見る。',routes:['cy','greece','lk']},
      {title:'ã・õ・-ção が道路表示に続く',level:'region',result:'ポルトガル語圏',next:'南米と絞れているならブラジル',detail:'ç 一字や PARE だけではなく、現地の複数の単語で言語を確認する。',routes:['brazil','pt']},
      {title:'ї・є／вулиця・вул.',level:'region',result:'ウクライナ語',next:'左端が青黄の通常ナンバー',detail:'і 一字ではほかのキリル文字言語も残る。街路語と現地の車を組み合わせる。',routes:['ukraine']},
      {title:'ă・ș・ț／Triq／-vej',level:'region',result:'候補を締めるための文字',next:'巨大な黄タグ→ルーマニア／左通行→マルタ／パイプ標識→デンマーク',detail:'記号全般を広く暗記するより、見た構造物と対応する語だけ探す。',routes:['romania','mt','denmark']},
      {title:'jalan／ulica／apotek だけ',level:'skip',result:'まだ一国にしない',next:'停止標識・住所・別の道路名へ',detail:'共通語を何度見ても決め手は増えない。別の種類の情報へ切り替える。'},
      {title:'国・町・路線番号が読めた',level:'finish',result:'地図で答え合わせ',next:'地名＋道路番号＋方角の三つを一致させる',detail:'同名の町や他地域への行先もある。現在地表示か行先案内かを分け、交差点や道路形状を地図で照合する。'}
    ],sources:[{title:'ウクライナ',url:link('ukraine')},{title:'ブラジル',url:link('brazil')},{title:'マルタ',url:link('malta')},{title:'街路名の読み方',url:link('beginners-guide')}]}
];

// Each trace preserves what is still unresolved, then names the next independent clue.
const traceData={
 nl:[['landscape','低い土地・運河','オランダ周辺を仮置き'],['plate','前後とも黄色・左青帯','オランダ／ルクセンブルク'],['text','街路名が …straat','オランダを選ぶ']],
 lu:[['plate','前後黄色・左青帯','最初はオランダも候補'],['text','公的な案内がフランス語','ルクセンブルクへ寄せる'],['sign','金属枠付きの黄色い方向標識','ルクセンブルクを選ぶ']],
 be:[['plate','普通車を複数台見る','外国車一台では判断しない'],['plate','白地の文字が赤い','ベルギー型'],['text','現地の街路名が Rue または -straat','複数台の赤文字と合わせてベルギーを選ぶ']],
 it:[['plate','左右に青い帯','伊・仏・アルバニアが残る'],['plate','前だけ明らかに短い','イタリア型に絞る'],['text','街路名 Via でも裏付け','イタリアを選ぶ']],
 pt:[['plate','白地・左青・右黄帯','ポルトガル旧式'],['text','街路名 Rua も一致','ポルトガルを選ぶ']],
 gb:[['road','左側通行','欧州なら英・愛・マルタ・キプロス'],['plate','前白・後黄','英国と旧式キプロスが残る'],['sign','公道の距離が mile / yards','イギリスを選ぶ']],
 ie:[['road','左側通行','欧州の左側通行国'],['plate','後ろも白い','英国よりアイルランド側へ'],['sign','黄色いひし形の警戒標識','アイルランドを選ぶ'],['text','英語＋斜体のアイルランド語','もう一度裏付け']],
 cy:[['text','道路案内にギリシャ文字','ギリシャ／キプロス'],['road','左側通行','キプロスを選ぶ']],
 al:[['plate','両端青・前も長い','仏／アルバニアを照合'],['text','街路名 Rruga','アルバニアを選ぶ']],
 mt:[['landscape','石灰岩色の密な街','地中海圏として保留'],['road','左側通行','マルタ／キプロスを照合'],['text','街路名 Triq','マルタを選ぶ']],
 fr:[['plate','両端青・前も長い','伊より仏／アルバニアへ'],['text','街路名 Rue・仏語の案内','フランスへ寄せる'],['plate','白地の黒文字・右青帯が細い','フランスを選ぶ']],
 ch:[['road','黄色い横断歩道','スイス／リヒテンシュタイン'],['plate','短い白い前・青帯なし','スイス型'],['plate','複数台と後ろの国章を確認','スイスを選ぶ']],
 tr:[['sign','赤い八角形に DUR','トルコを選ぶ。残りの手順は省略']],
 my:[['text','jalan を見た','インドネシア／マレー語圏のまま'],['sign','交差点で BERHENTI の停止標識','マレーシアを選ぶ']],
 jp:[['sign','赤い逆三角形に「止まれ」','日本を選ぶ。意味の暗記は不要']],
 lk:[['road','左側通行','まだ地域を限定しない'],['plate','前白・後黄','英国などとも共有する色'],['text','現地の公的表示がシンハラ文字','スリランカを選ぶ']]
};
const nextMoves={
 nl:'前後の黄色を確認したら、交差点の街路名 -straat を探す',
 lu:'前後黄色だけなら保留。公的な仏語と枠付きの黄色い方向標識を探す',
 be:'別の普通車で文字の赤を確認。街路名の Rue／-straat も照合する',
 it:'車の前へ回って長さを見る。前が見えなければ街路名 Via を探す',
 pt:'右端だけ黄色か別の車で確認。街路名 Rua を照合する',
 gb:'交差点の予告・距離表示で mile／yards を探す',
 ie:'交差点の警戒標識と、英語＋斜体のアイルランド語を探す',
 cy:'走行車・停止線で左側通行を確認する',
 al:'両端青だけなら保留。交差点の街路名 Rruga を読む',
 mt:'交差点・家の角の街路名で Triq を探す',
 fr:'白い黒文字・長い前を確認。道路名 Rue と組み合わせる',
 ch:'横断歩道と別の車へ。白い短い前／黒い通常ナンバーを分ける',
 tr:'別の交差点で、DUR が停止標識に載っていることを確認する',
 my:'jalan だけなら交差点へ。BERHENTI の停止標識を探す',
 jp:'公的な停止標識の逆三角形と「止まれ」を確認する',
 lk:'ナンバーの色だけなら保留。役所・道路案内のシンハラ文字を探す'
};
export const ROUTES=COUNTRY_QUESTIONS.map(q=>({id:q.country,country:COUNTRIES[q.country].name,region:q.scope,level:'finish',title:q.title,question:q,steps:traceData[q.country],next:nextMoves[q.country],sources:q.sources}));
function add(id,country,region,level,title,steps,next,summary,slugs){ROUTES.push({id,country,region,level,title,steps,next,summary,sources:slugs.map(slug=>({title:'地域の資料',url:link(slug)}))});}
add('greece','ギリシャ','ヨーロッパ','finish','ギリシャ文字＋右側通行',[['text','公的な道路案内がギリシャ文字','ギリシャ／キプロス'],['road','右側通行','ギリシャを選ぶ']],'通行方向が不明なら走行車か交差点を見る','同じ文字体系でも通行方向で分けられる。停車中の車の向きだけでは判定しない。',['greece','cyprus']);
add('iceland','アイスランド','北大西洋','finish','火山礫＋白反射板の黄色いボラード',[['landscape','黒い火山礫・樹木の少ない荒野','アイスランドを先に照合'],['road','黄色い細長いボラードに白い反射板','アイスランドへ絞る'],['text','道路表示に Þ を見つける','アイスランドを裏付け']],'近くの道路標識で Þ や道路番号を見る','木がないだけ、黄色い杭だけでは止めない。フェローの小さな木杭とは構造まで比較する。',['iceland','faroe-islands']);
add('romania','ルーマニア','ヨーロッパ','finish','大きい黄色タグ＋ă・ș・ț',[['pole','極端に大きい黄色い電柱タグ','ルーマニアを先に照合'],['text','近くの自治体表示に ă・ș・ț','ルーマニアを選ぶ']],'小さい札しか見えなければ、役所・町名の案内へ進む','穴あき電柱全般は覚えない。大きいタグと現地のルーマニア語を合わせる。',['romania']);
add('taiwan','台湾','東アジア','finish','斜線が地面まで＋繁体字＋右側',[['pole','黒黄の斜線が地面まで続く','台湾を先に照合'],['road','右側通行','左側の日本・香港と分ける'],['text','公的な案内が繁体字','台湾を選ぶ']],'電柱の根元が見えなければ次の一本と公的な案内を見る','黒黄の模様だけを丸暗記しない。根元・通行方向・現地文字をセットにする。',['japan','taiwan']);
add('denmark','デンマーク','ヨーロッパ','finish','赤白パイプ枠＋-vej',[['sign','低い赤白の矢印標識をパイプが囲む','デンマークを先に照合'],['text','街路名が -vej','デンマークを選ぶ']],'交差点の街路名表示へ進む','æ・ø だけならノルウェーも残る。標識の構造と j で終わる vej を組み合わせる。',['denmark']);
add('colombia','コロンビア','中南米','finish','一般車の黄色＋標識裏の白い十字',[['text','現地の公的表示がスペイン語','中南米の候補を持つ'],['plate','普通車に黄色いナンバーが続く','コロンビアを先に照合'],['sign','裏側が白い金属の十字支え','コロンビアを選ぶ']],'交差点の標識を通り過ぎ、裏を振り返る','タクシーなどを除いた普通車を見る。黄色だけで国を固定せず、固定された道路設備を足す。',['colombia']);
add('brazil','ブラジル','南アメリカ','finish','南米＋ポルトガル語の公的表示',[['sign','停止標識が PARE','スペイン語圏も残す'],['text','複数の現地語に ã・õ・-ção','ポルトガル語へ絞る'],['text','南米の道路・住所表示とも一致','ブラジルを選ぶ']],'市役所・道路案内・住所から別の単語を読む','PARE 一語をブラジル確定にしない。南米という地域と、現地のポルトガル語が決め手。',['brazil','portugal']);
add('ukraine','ウクライナ','東欧','finish','青黄の左帯＋ウクライナ語',[['text','キリル文字を見た','ロシアに固定しない'],['plate','左端に青黄の通常ナンバーが続く','ウクライナ型へ'],['text','道路名が вулиця / вул.、周囲に ї・є','ウクライナを選ぶ']],'街路名か町名の公的表示を探す','車の登録国と道路側の文字を重ねる。і 一字だけに頼らない。',['ukraine']);
add('new-zealand','ニュージーランド','オセアニア','finish','赤字 GIVE WAY＋赤い路線盾',[['road','左側通行・英語・km','豪州／NZなどが残る'],['sign','GIVE WAY の文字が赤色','NZへ寄せる'],['sign','国道番号が赤い盾形','ニュージーランドを選ぶ']],'幹線との交差点か橋の番号標へ進む','牧草地や羊だけでは決めない。文字の赤と路線盾という別の標識を合わせる。',['new-zealand','australia']);
add('australia','オーストラリア','豪州／NZの比較','finish','黒字 GIVE WAY＋英数字の道路番号',[['landscape','オセアニアを候補にする','この景観だけでは決めない'],['road','左側通行・km・白い道路線','豪州／NZを照合'],['sign','GIVE WAY は黒字。道路番号は A・B など＋数字','オーストラリアを選ぶ']],'黄色い中央線や赤い路線盾が見えたらNZも再確認','このルートは豪州とNZまで絞った後の比較。黒字 GIVE WAY だけは世界で共有される。',['australia','new-zealand']);
add('ghana','ガーナ','撮影車','finish','ルーフラック前棒の右端に黒テープ',[['road','撮影車の前後を確認','普通の車でなく撮影車を見る'],['road','ルーフラックの前棒・右端に黒テープ','ガーナのGen3撮影車を照合']],'見えなければ道路・看板の通常ルートへ戻る','該当する車が見えたときに使う。Gen4や保護区の車には別の型があり、テープがないだけで除外しない。',['ghana']);
add('kenya','ケニア','撮影車＋通行方向','finish','シュノーケル＋左側通行',[['road','撮影車に立ち上がる吸気管','ケニアを先に照合。モンゴルにもある'],['road','左側通行','ケニアを選ぶ'],['plate','前白・後ろ黄色も裏付け','色だけの判定にはしない']],'吸気管が見えなくても除外せず、公道の看板へ進む','吸気管だけをケニア確定にしない。モンゴルは右側通行。通常の道路カバレッジで使う。',['kenya','mongolia']);
add('southern-africa','南部アフリカ','南部アフリカ','region','左側＋黄色い外側線で「その辺」',[['road','左側通行・外側黄・中央白','南部アフリカへ'],['road','同じ線を何本見ても国は増えない','南ア・ボツワナ・レソト・エスワティニ・ナミビアを残す'],['sign','町名＋道路番号のある案内へ移動','地図で地域と道路を照合']],'交差点・町の入口へ。町名と路線番号を一組で読む','国の証拠が足りない模範例。ここで南アフリカと決め打ちせず、広い地域として保持する。',['south-africa','lesotho']);
add('lesotho-region','レソト周辺の高地','南部アフリカ','region','裸の段状の山でも国境は保留',[['landscape','水平な岩の段・裸の山・丸い小屋','レソトを優先して照合'],['road','左側通行・外側黄・中央白','南部アフリカという読みが一致'],['sign','まだ国名・地名がない','レソト周辺の高地で止める']],'町への案内を探す。地名と道路番号が合うまで国境は決めない','似た景観は南アフリカ側にもある。地名と道路番号が拾えるまでは、国境のどちら側かを保留する。',['lesotho','south-africa']);

add('united-states','アメリカ','北米','finish','SPEED LIMIT＋赤青のINTERSTATE盾',[['road','右側通行・英語・黄色い中央線','アメリカ／カナダを候補に'],['sign','速度標識に SPEED LIMIT','アメリカへ寄せる'],['sign','公道に赤青の盾＋INTERSTATE','アメリカを選ぶ']],'交差点や幹線への案内で路線盾を探す','森林や住宅の雰囲気で米加を決めない。国境を越える行先案内なら、現在地側の速度標識も照合する。',['united-states','canada']);
ROUTES.at(-1).sources.push({title:'米FHWA・INTERSTATE標識',url:'https://mutcd.fhwa.dot.gov/htm/2009r1r2/part2/fig2d_03_longdesc.htm'});
add('canada','カナダ','北米','finish','MAXIMUM＋km/h',[['road','右側通行・英語・黄色い中央線','米加で保留'],['sign','公道の速度標識に MAXIMUM','カナダを選ぶ'],['sign','km/h の表示も見える','メートル法を裏付け']],'別の速度標識か、州名のある路線標識を探す','英語圏の北米という文脈で使う。km/h だけは世界共通で、MAXIMUM の表記が決め手。',['canada','united-states']);
add('mexico','メキシコ','北中米','finish','ALTOからMEXICOの路線盾へ',[['sign','停止標識が ALTO','メキシコ／中米の一部'],['sign','国道の盾に MEXICO＋数字','メキシコを選ぶ'],['text','地名とその路線番号を地図で照合','国内の場所まで絞る']],'幹線との交差点で国道番号を読む','ALTO 一枚では終わらない。MEXICO の表記を含む国道標識が見えたら地図へ進める。',['mexico']);
add('south-korea','韓国','東アジア','finish','丸と直線のハングル＋右側',[['text','複数の公的表示に 학교・약국 のような文字','ハングルへ絞る'],['road','右側通行','通常の道路カバレッジなら韓国を選ぶ']],'道路名や家形の青い住所表示で文字を再確認','丸い ㅇ と直線を四角いまとまりに組む文字。外国料理店の一枚より、道路名や住所を使う。',['south-korea']);
add('cambodia','カンボジア','東南アジア','finish','クメール文字＋右側通行',[['text','公的な案内に ផ្លូវ のような複雑な文字','クメール文字を照合'],['road','右側通行','カンボジアを選ぶ']],'文字が一語では曖昧なら、役所・学校・別の案内板へ進む','丸い文字という印象だけでは止めない。下側にも字形が重なったクメール文字を、複数の語で確認する。',['cambodia','laos','thailand']);
add('thailand','タイ','タイ／ラオス周辺','finish','似た文字は左側通行で分ける',[['text','道路案内の文字がタイ語・ラオ語に見える','一語では決めずに保留'],['road','走行車と停止線が左側通行','タイへ寄せる'],['sign','赤い停止標識の หยุด を照合','タイを選ぶ']],'まず走行車か交差点。文字だけを見続けない','通行方向を加えれば、タイと右側通行のラオス・カンボジアを分けられる。',['thailand','laos','cambodia']);
add('laos','ラオス','東南アジア','finish','右側＋ラオ文字＋一般車の黄色',[['text','公的な案内がタイ語・ラオ語に見える','文字だけでは保留'],['road','右側通行','タイを外し、ラオス側へ'],['plate','一般車に短い黄色いナンバーが続く','ラオスを選ぶ']],'タクシー以外の普通車と、別の公的表示を確認','ラオスの普通車は黄色。タイの商用車の黄色を混ぜず、左右通行も確認する。',['laos','thailand']);
add('indonesia','インドネシア','マレー語／インドネシア語圏','finish','jalanからKabupatenの住所へ',[['text','jalan や toko を見つけた','マレー語／インドネシア語圏として保持'],['text','役所・学校の住所に Kabupaten / Kab.＋地名','インドネシアを選ぶ'],['text','県名と州名を拾う','地図で島と地域へ進む']],'役所・学校・施設の住所を探す','Kabupaten は県に相当する行政区画。一般語の jalan を何枚集めるより、住所に切り替える。',['indonesia','malaysia']);

STEPS.find(s=>s.id==='sign').cards.push(
  {title:'北米の SPEED LIMIT／MAXIMUM',level:'region',result:'SPEED LIMIT → 米／MAXIMUM → 加',next:'米は INTERSTATE 盾／加は km/h を照合',detail:'英語圏の北米と絞れた場面。制限速度の数字だけで分けず、見出しを見る。',routes:['united-states','canada'],visual:'speed-compare'},
  {title:'国道の盾に MEXICO＋数字',level:'finish',result:'メキシコ',next:'数字と行先地名を地図で照合',detail:'ALTO は中米の一部でも使う。国道番号の国名表記まで見えれば締められる。',routes:['mexico'],visual:'mexico-shield'}
);
STEPS.find(s=>s.id==='sign').sources.push({title:'米加の標識',url:link('canada')},{title:'メキシコ',url:link('mexico')});
STEPS.find(s=>s.id==='road').cards.push({title:'タイ語・ラオ語風の文字＋左右通行',level:'region',result:'左 → タイ／右 → ラオス側を照合',next:'停止標識／一般車のプレート色',detail:'丸い文字だけではカンボジアなども残る。現地の案内を何語か見てから通行方向を重ねる。',routes:['thailand','laos','cambodia'],visual:'thai-lao'});
STEPS.find(s=>s.id==='road').sources.push({title:'タイとラオスの比較',url:link('laos')});
STEPS.find(s=>s.id==='text').cards.unshift(
  {title:'학교・약국／ផ្លូវ',level:'finish',result:'ハングル → 韓国／クメール → カンボジア',next:'複数の公的表示と右側通行を確認',detail:'通常の道路カバレッジが対象。丸や曲線の印象だけでなく、文字のまとまりを図で照合する。',routes:['south-korea','cambodia'],visual:'script-compare'},
  {title:'住所の Kabupaten／Kab.＋地名',level:'finish',result:'インドネシア',next:'県名と州名を地図で探す',detail:'役所・学校などの現地の住所として使われる表記を見る。',routes:['indonesia']}
);
STEPS.find(s=>s.id==='text').sources.push({title:'韓国',url:link('south-korea')},{title:'カンボジア',url:link('cambodia')},{title:'インドネシア',url:link('indonesia')});

export const FALLBACKS=[
  {title:'自然だけ・標識なし',action:'舗装路・橋・交差点・集落を探して進む',hold:'植生と地形は広い地域の仮置き'},
  {title:'通行方向が不明',action:'走行車、交差点の停止線、標識の向きを確認',hold:'停車中の一台の向きだけでは決めない'},
  {title:'文字がぼけて読めない',action:'別の看板へ。街路名・自治体・道路番号を優先',hold:'読めない文字を都合よく補わない'},
  {title:'ナンバーが一台だけ',action:'普通車をもう数台と、固定された道路情報を見る',hold:'旅行中の車を撮影国と取り違えない'},
  {title:'証拠が食い違う',action:'前後の取り違え・商用車・外国語の店・境界を確認',hold:'弱い情報から外し、公的な標識を優先'},
  {title:'先へ進めない・時間切れ',action:'裏付けのある最小の地域で回答する',hold:'国が決まる情報のない場面は、必ず残る'}
];
