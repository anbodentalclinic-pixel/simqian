/* 司馬遷教材：歴史地図（Leaflet + Natural Earth）
   すべての地点・経路・範囲は緯度経度で管理する。画面上の位置は Leaflet が計算する。 */
(function () {
  'use strict';
  var L = window.L, GEO = window.SIMA_GEO;
  if (!L || !GEO) return;
  var $ = function (id) { return document.getElementById(id); };
  var REDUCED = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 色 ---------- */
  var C = { han: '#a8483a', xiongnu: '#35607f', report: '#b08a2e', qin: '#3f3a45', jade: '#4f8a63', sea: '#dfe9ea', land: '#f4eedd', coast: '#b5a98d', river: '#7da2b6' };

  /* ---------- 地点（certain: 位置が史料・遺跡から確かな地点 / false: 推定） ---------- */
  var P = {
    changan: { ll: [34.31, 108.86], name: '長安', certain: true, min: 0, big: true,
      now: '現在の陝西省西安市の北西郊', text: '漢の都。武帝の宮廷があり、太史令の司馬遷もここに勤めた。李陵の戦いについて都の人々が知りえたのは、届いた報告だけだった。' },
    juyan: { ll: [41.95, 101.07], name: '居延', certain: true, min: 3.5,
      now: '現在の内モンゴル自治区エジン旗付近', text: '砂漠の中のオアシスに置かれた漢の最前線の拠点。防衛用の砦（遮虜鄣）が築かれていた。李陵はここから北へ出発した。漢代の木簡（居延漢簡）が大量に出土し、位置は確かめられている。' },
    jiuquan: { ll: [39.74, 98.51], name: '酒泉', certain: true, min: 4.5,
      now: '現在の甘粛省酒泉市', text: '河西回廊に置かれた漢の郡。前99年の夏、主力の弐師将軍・李広利は騎兵3万を率いてここから出撃した。' },
    zhangye: { ll: [38.93, 100.45], name: '張掖', certain: true, min: 5,
      now: '現在の甘粛省張掖市', text: '河西回廊の郡。李陵は出撃前、酒泉・張掖で兵に弓術を教え、匈奴に備えていた。' },
    dunhuang: { ll: [40.14, 94.66], name: '敦煌', certain: true, min: 4,
      now: '現在の甘粛省敦煌市', text: '河西回廊の西の端。ここから先はタリム盆地のオアシス諸国（西域）へ道が続く。' },
    junji: { ll: [44.3, 102.3], name: '浚稽山', certain: false, min: 4, radius: 110000,
      now: '現在のモンゴル国南部、ゴビ・アルタイ山脈の東部と考えられている', text: '李陵が居延から北へ30日進んで陣を置いた山。『漢書』に名が記されるが、正確な位置は分かっていない。地図の円は「このあたり」という推定の範囲である。' },
    surrender: { ll: [42.35, 101.25], name: '降伏の地', certain: false, min: 5, radius: 35000,
      now: '居延の北方、現在の中国・モンゴル国境付近', text: '『漢書』は、李陵の敗れた場所を「塞（国境の砦）から百余里」と記す。漢代の百里は約40kmにあたる。方角や正確な地点は分からないため、推定の範囲として示す。' },
    court: { ll: [47.4, 104.3], name: '単于の本拠', certain: false, min: 3.5, radius: 150000,
      now: '現在のモンゴル国中部、オルホン川流域方面と考えられている', text: '匈奴の君主・単于の本拠。前119年の敗戦のあと、ゴビ砂漠の北（漠北）へ移っていた。遊牧の政権であり、位置は固定した「都」ではない。' },
    tianshan: { ll: [43.3, 93.8], name: '天山', certain: false, min: 4.5, radius: 120000,
      now: '現在の新疆ウイグル自治区東部の天山山脈東端とする説などがある', text: '李広利が匈奴の右賢王と戦った場所。『漢書』のいう「天山」がどの山を指すかには複数の説がある。' },
    handan: { ll: [36.6, 114.49], name: '邯鄲', certain: true, min: 0, big: true, now: '現在の河北省邯鄲市', text: '趙の都。城壁の跡（趙王城）がいまも残る。藺相如はここから璧を持って秦へ向かった。' },
    xianyang: { ll: [34.42, 108.83], name: '咸陽', certain: true, min: 0, big: true, now: '現在の陝西省咸陽市の東', text: '秦の都。宮殿の跡が発掘されている。藺相如が秦王と向き合った章台もこの都にあった。のちの漢の都・長安は、川をはさんだすぐ南に造られる。' },
    hangu: { ll: [34.63, 110.92], name: '函谷関', certain: true, min: 5, now: '現在の河南省霊宝市', text: '秦の東の入り口にあたる関所。深い谷を通る一本道で、東の国々から秦へ入るにはここを通らなければならなかった。' },
    luoyang: { ll: [34.72, 112.45], name: '洛陽', certain: true, min: 5.5, now: '現在の河南省洛陽市', text: '周の王の都。このころ周の王は名ばかりの存在で、まわりを強い国々に囲まれていた。' },
    jingshan: { ll: [31.6, 111.6], name: '荊山', certain: false, min: 4.5, radius: 60000, now: '現在の湖北省南漳県あたりとされる', text: '卞和が玉の原石を見つけたと伝えられる楚の山。言い伝えであり、場所も推定である。' },
    ying: { ll: [30.42, 112.18], name: '郢', certain: true, min: 5, now: '現在の湖北省荊州市の北', text: '楚の都。前278年、秦の将軍・白起に攻め落とされる。' },
    daliang: { ll: [34.8, 114.3], name: '大梁', certain: true, min: 5.5, now: '現在の河南省開封市', text: '魏の都。' },
    xinzheng: { ll: [34.4, 113.74], name: '新鄭', certain: true, min: 5.5, now: '現在の河南省新鄭市', text: '韓の都。' },
    linzi: { ll: [36.87, 118.35], name: '臨淄', certain: true, min: 5, now: '現在の山東省淄博市', text: '斉の都。戦国時代で最も人口の多い都市の一つだった。' },
    ji: { ll: [39.9, 116.4], name: '薊', certain: true, min: 5, now: '現在の北京市', text: '燕の都。' },
    rome: { ll: [41.9, 12.5], name: 'ローマ', certain: true, min: 0, max: 4, now: '現在のイタリア・ローマ', text: 'イタリア半島の都市国家から出発し、前3世紀に半島を、前1世紀までに地中海全体を支配した。前27年からは皇帝が治める帝国になる。漢はローマを「大秦」と呼んだが、国どうしが確かに使者を交わした記録は、司馬遷の時代にはない。' }
  };

  /* ---------- 地点の現在の写真（Wikimedia Commons） ---------- */
  var PLACE_PHOTOS = {"changan": {"src": "https://commons.wikimedia.org/wiki/Special:FilePath/Historic_Site_of_Weiyang_Palace_08_2013-09.JPG?width=500", "w": 960, "h": 720, "cap": "未央宮の跡（西安市）", "credit": "猫猫的日记本／CC BY-SA 3.0", "page": "https://commons.wikimedia.org/wiki/File:Historic_Site_of_Weiyang_Palace_08_2013-09.JPG"}, "juyan": {"src": "https://commons.wikimedia.org/wiki/Special:FilePath/Juyan_Lake_2018-10-28_Sentinel-2_L2A_True_color.jpg?width=500", "w": 960, "h": 866, "cap": "衛星から見た居延の湖", "credit": "European Space Agency（Sentinel-2）／出典表示", "page": "https://commons.wikimedia.org/wiki/File:Juyan_Lake_2018-10-28_Sentinel-2_L2A_True_color.jpg"}, "dunhuang": {"src": "https://commons.wikimedia.org/wiki/Special:FilePath/Summer_Vacation_2007%2C_263%2C_Watchtower_In_The_Morning_Light%2C_Dunhuang%2C_Gansu_Province.jpg?width=500", "w": 960, "h": 639, "cap": "敦煌近くに残る漢代ののろし台", "credit": "The Real Bear／CC BY 2.0", "page": "https://commons.wikimedia.org/wiki/File:Summer_Vacation_2007%2C_263%2C_Watchtower_In_The_Morning_Light%2C_Dunhuang%2C_Gansu_Province.jpg"}, "court": {"src": "https://commons.wikimedia.org/wiki/Special:FilePath/Goats_in_Orkhon_Valley.jpg?width=500", "w": 960, "h": 612, "cap": "オルホン渓谷の現在", "credit": "Bernard Gagnon／CC0", "page": "https://commons.wikimedia.org/wiki/File:Goats_in_Orkhon_Valley.jpg"}, "junji": {"src": "https://commons.wikimedia.org/wiki/Special:FilePath/Gobi_Desert_2023_in_%C3%96mn%C3%B6govi_Province%2C_Mongolia_7.jpg?width=500", "w": 960, "h": 720, "cap": "ゴビ地方の風景（浚稽山そのものではない）", "credit": "ノボホショコロトソ／CC BY-SA 3.0", "page": "https://commons.wikimedia.org/wiki/File:Gobi_Desert_2023_in_%C3%96mn%C3%B6govi_Province%2C_Mongolia_7.jpg"}, "surrender": {"src": "https://commons.wikimedia.org/wiki/Special:FilePath/Gobi_Desert_2023_in_%C3%96mn%C3%B6govi_Province%2C_Mongolia_35.jpg?width=500", "w": 960, "h": 720, "cap": "ゴビ砂漠の風景（降伏の地そのものではない）", "credit": "ノボホショコロトソ／CC BY-SA 3.0", "page": "https://commons.wikimedia.org/wiki/File:Gobi_Desert_2023_in_%C3%96mn%C3%B6govi_Province%2C_Mongolia_35.jpg"}};
  Object.keys(PLACE_PHOTOS).forEach(function (k) { P[k].photo = PLACE_PHOTOS[k]; });

  /* ---------- 同時代の勢力・地域（位置は目安） ---------- */
  var POLITIES = [
    { ll: [33.5, 52], name: 'パルティア', sub: '漢の史料では「安息」', min: 1.5, max: 4.5 },
    { ll: [36.3, 68], name: '大月氏', sub: '', min: 2.5, max: 5 },
    { ll: [40.4, 71.8], name: '大宛', sub: 'フェルガナ', min: 3, max: 5.5 },
    { ll: [45, 80.5], name: '烏孫', sub: '', min: 3, max: 5.5 },
    { ll: [39.3, 83], name: '西域のオアシス諸国', sub: '', min: 3, max: 5.5 },
    { ll: [39.0, 125.75], name: '楽浪郡', sub: '前108年に漢が設置', min: 3.5, max: 6 },
    { ll: [35.2, 136.5], name: '倭', sub: '弥生時代の日本列島', min: 1.5, max: 6 },
    { ll: [23, 79], name: 'インド', sub: '', min: 1.5, max: 4 }
  ];

  /* ---------- 地形の名前（位置は名前を置く場所） ---------- */
  var GEOLABELS = [
    { ll: [46.0, 111], t: 'モンゴル高原', k: 'geo-big', min: 2.75, max: 6.5 },
    { ll: [43.2, 108.5], t: 'ゴビ砂漠', k: 'geo', min: 3.25, max: 7 },
    { ll: [38.2, 102.6], t: '河西回廊', k: 'geo-key', min: 4.25, max: 8 },
    { ll: [38.4, 96.9], t: '祁連山脈', k: 'geo-s', min: 4.75, max: 8 },
    { ll: [47.5, 91], t: 'アルタイ山脈', k: 'geo-s', min: 3.75, max: 7 },
    { ll: [42.4, 81], t: '天山山脈', k: 'geo-s', min: 3.5, max: 7 },
    { ll: [41.6, 110], t: '陰山山脈', k: 'geo-s', min: 4.75, max: 8 },
    { ll: [47.6, 99.5], t: 'ハンガイ山脈', k: 'geo-s', min: 4.75, max: 8 },
    { ll: [39.0, 82.5], t: 'タクラマカン砂漠', k: 'geo-s', min: 4.75, max: 7 },
    { ll: [33, 88], t: 'チベット高原', k: 'geo', min: 2.75, max: 6.5 },
    { ll: [36.6, 108.3], t: '黄土高原', k: 'geo-s', min: 4.75, max: 8 },
    { ll: [50, 68], t: 'カザフ草原', k: 'geo', min: 2.75, max: 6 },
    { ll: [36.3, 116.5], t: '華北平原', k: 'geo-s', min: 4.25, max: 7 },
    { ll: [40.9, 108.3], t: '黄河', k: 'water', min: 3.75, max: 8 },
    { ll: [30.4, 113], t: '長江', k: 'water', min: 3.75, max: 8 },
    { ll: [53.3, 108], t: 'バイカル湖', k: 'water', min: 3.75, max: 7 },
    { ll: [35, 18], t: '地中海', k: 'water', min: 1.5, max: 5 },
    { ll: [20, 150], t: '太平洋', k: 'water', min: 0, max: 4 },
    { ll: [-5, 78], t: 'インド洋', k: 'water', min: 0, max: 4 },
    { ll: [52, 10], t: 'ヨーロッパ', k: 'continent', min: 0, max: 2.5 },
    { ll: [8, 20], t: 'アフリカ', k: 'continent', min: 0, max: 2.5 },
    { ll: [63, 95], t: 'アジア', k: 'continent', min: 0, max: 2.5 },
    { ll: [45, -100], t: '北アメリカ', k: 'continent', min: 0, max: 2.5 },
    { ll: [-12, -58], t: '南アメリカ', k: 'continent', min: 0, max: 2.5 },
    { ll: [-25, 134], t: 'オーストラリア', k: 'continent', min: 0, max: 2.5 }
  ];

  /* ---------- 勢力圏の概略（前100年ごろ。国境線ではない） ---------- */
  var HAN = [[40.5, 93.5], [41, 98], [42.2, 101], [40, 102], [39.5, 104.5], [41.3, 107], [41.2, 111], [41.5, 114], [42, 117.5], [42.5, 120], [42.5, 123.5], [41.5, 126], [40.5, 128], [38.3, 128], [37.5, 126.3], [39, 125], [39.6, 122], [40.8, 121.5], [39, 118], [37.6, 119], [37, 122.4], [35.5, 120], [31.5, 121.6], [29.5, 122], [26, 119.8], [23.5, 117], [22, 113.5], [20.5, 110], [21.5, 108], [20, 106.5], [17.5, 106.3], [18.5, 105], [21.5, 104], [22.5, 101], [24.5, 99], [27.5, 99.5], [29.5, 102.5], [32, 103], [34.5, 102], [36.5, 101], [38.5, 98], [39.3, 94]];
  var XIONGNU = [[47, 84], [50, 88], [51.5, 96], [52.5, 104], [51.5, 112], [50, 119], [46.5, 121], [43.5, 118], [43, 113], [42.8, 108], [42.9, 103], [43, 98], [44, 93], [45, 88]];
  var STEPPE = [[46, 28], [48, 40], [50, 52], [52, 68], [52, 84], [51, 96], [51, 108], [49, 118], [46, 121], [43.5, 116], [43.5, 106], [45, 96], [46, 84], [46.5, 70], [46, 56], [45, 44], [45.5, 34], [45, 28]];

  /* ---------- 戦国時代の七つの国（前283年ごろ。おおよその範囲） ---------- */
  var WARRING = [
    { name: '秦', key: true, color: '#3f3a45', at: [33.0, 106.6], text: '西の強国。都は咸陽。四川の地も手に入れ、東の国々を圧迫していた。', pts: [[38.5, 105.5], [38.8, 109.8], [37.2, 110.5], [35.6, 110.4], [34.9, 111.2], [33.8, 111.0], [32.8, 110.3], [31.8, 109.8], [30.8, 109.5], [29.3, 107.5], [28.6, 104.5], [30.2, 102.8], [32.5, 103.5], [34.3, 104.0], [36.2, 104.2]] },
    { name: '趙', key: true, color: '#a8483a', at: [38.6, 113.2], text: '藺相如の国。都は邯鄲。北の遊牧民から騎馬の戦い方を取り入れた軍事力のある国だったが、秦には押されていた。', pts: [[41.0, 107.5], [41.3, 112], [40.8, 114.6], [39.5, 115.3], [38.6, 115.9], [37.4, 115.9], [36.2, 115.3], [36.0, 114.2], [36.5, 113.2], [37.3, 112.6], [37.4, 111.0], [38.9, 110.6], [39.8, 109.5]] },
    { name: '魏', color: '#8a7a3c', at: [35.0, 114.7], text: '都は大梁。かつての強国だが、西の土地を秦に奪われていた。', pts: [[36.0, 114.2], [36.2, 115.3], [35.4, 115.7], [34.2, 115.5], [33.8, 114.3], [34.5, 113.9], [35.0, 113.2], [35.3, 112.4], [35.7, 113.2]] },
    { name: '韓', color: '#7a5a8a', at: [34.2, 112.7], text: '都は新鄭。七国の中で最も小さく、秦のすぐ東にあった。', pts: [[36.6, 112.6], [36.3, 113.4], [35.7, 113.2], [35.3, 112.4], [35.0, 113.2], [34.5, 113.9], [33.8, 114.3], [33.4, 113.2], [33.8, 112.0], [34.4, 111.6], [34.9, 111.4], [35.4, 111.9], [36.2, 112.2]] },
    { name: '楚', color: '#4f8a63', at: [29.8, 114.5], text: '南の大国。都は郢。和氏の璧は、もとは楚で見つかったと伝えられる。', pts: [[33.8, 111.0], [33.8, 112.0], [33.4, 113.2], [33.8, 114.3], [34.2, 115.5], [34.6, 117.5], [34.3, 119.3], [32.5, 120.8], [30.8, 121.5], [29.0, 121.0], [27.5, 118.5], [26.0, 115.5], [25.5, 112.5], [26.5, 110.0], [28.5, 108.8], [29.3, 107.8], [30.8, 109.5], [31.8, 109.8], [32.8, 110.3]] },
    { name: '斉', color: '#3f6f8a', at: [36.4, 118.6], text: '東の大国。都は臨淄。ただしこのころは燕などの連合軍に攻めこまれ、国土の大半を一時失っていた。', pts: [[38.2, 117.6], [37.8, 119.0], [37.6, 121.0], [37.0, 122.5], [36.0, 120.6], [35.2, 119.5], [34.7, 118.2], [34.9, 117.0], [35.6, 116.0], [36.4, 115.7], [37.4, 116.2]] },
    { name: '燕', color: '#5a6b7a', at: [40.6, 118.5], text: '北東の国。都は薊（現在の北京）。', pts: [[40.8, 114.8], [41.8, 117.5], [42.3, 121], [41.8, 124.5], [40.2, 124.5], [39.2, 122], [40.0, 120], [39.0, 118], [38.3, 117.4], [38.6, 116.0], [39.5, 115.4]] }
  ];

  /* ---------- 同じころの世界と日本（時代の断面） ----------
     labels: [位置, 名前, 補足, 最小ズーム, 最大ズーム, 大きく表示]
     links: kind は direct=直接の関係 / indirect=人や物を介した関係 / none=同じ時代だが直接の関係は確かめられない */
  var ERAS = {
    e283: { year: -283, when: '前283年ごろ', title: '『和氏の璧』のころ', polys: 'warring', places: ['handan', 'xianyang', 'rome'],
      sum: '中国は七つの国が争う戦国時代。西では、アレクサンドロス大王の死後に分かれた国々が並び、ローマはまだイタリア半島の一勢力だった。',
      labels: [[[49, 103], '遊牧の諸集団', 'まだ統一されていない', 2, 6], [[34.5, 47], 'セレウコス朝', 'アレクサンドロスの後継国家'], [[27.5, 30.5], 'プトレマイオス朝', 'エジプト'], [[23, 79], 'マウリヤ朝', 'インド'], [[36.6, 9.5], 'カルタゴ', ''], [[35.2, 136.5], '倭', '弥生時代', 1.5, 6]],
      cards: [['中国', '秦・趙・魏・韓・楚・斉・燕の七国が争う。秦が次第に優勢になっていく。藺相如が璧を守ったのはこのころ。'], ['草原', '北の遊牧民はまだ一つにまとまっていない。趙は前307年ごろ、彼らにならって騎馬で弓を射る戦い方（胡服騎射）を取り入れた。'], ['西アジア・インド', 'アレクサンドロス大王（前323年没）の帝国は、部下たちの国に分かれた。インドではマウリヤ朝が広い地域をまとめ、まもなくアショーカ王が即位する。'], ['地中海', 'ローマはイタリア半島の統一を進めている最中。海の向こうにはカルタゴという強い商業国家があった。'], ['日本列島', '弥生時代。水田での稲作が九州から東へ広がり、金属の道具が使われ始めていた。文字の記録はまだない。']],
      links: [['direct', '趙と北方の遊牧民：戦い、同時に騎馬の技術を学んだ。'], ['none', '戦国の中国と地中海世界：互いを知っていたという記録はない。'], ['indirect', '日本列島と大陸：稲作や金属器は、朝鮮半島を通って人とともに伝わった。国どうしの交渉の記録はない。']] },
    e221: { year: -221, when: '前221年', title: '秦が中国を統一する', polys: 'labels', places: ['xianyang', 'rome'],
      sum: '秦王の政が六国を滅ぼし、初めて「皇帝」を名のった。同じころ、地中海ではローマとカルタゴの大戦争が始まろうとしていた。',
      labels: [[[29.8, 112.5], '秦', '中国を統一', 1.25, 6.5, 1], [[47, 106], '匈奴', '頭曼単于', 1.5, 6.5, 1], [[39.5, 97], '月氏', '', 3, 6], [[38, 57], 'パルティア', '前247年ごろ建国'], [[31.5, 42], 'セレウコス朝', ''], [[23, 79], 'マウリヤ朝', 'アショーカ王の死後'], [[36.6, 9.5], 'カルタゴ', 'ハンニバル'], [[35.2, 136.5], '倭', '弥生時代', 1.5, 6]],
      cards: [['中国', '秦が六国を滅ぼして統一。文字・貨幣・ものさしをそろえ、北に長城をつないだ。しかし秦は、始皇帝の死後わずか数年で滅びる。'], ['草原', '匈奴は秦の将軍・蒙恬に攻められ、黄河の北へ退いた。前209年、冒頓単于が父を倒して立ち、周りの遊牧民を次々に従えていく。'], ['西アジア・インド', 'イラン高原でパルティアが力を伸ばし始める。インドではアショーカ王の死後、マウリヤ朝が弱まっていく。'], ['地中海', '前218年、カルタゴの将軍ハンニバルがアルプスを越えてイタリアへ攻めこむ（第二次ポエニ戦争）。'], ['日本列島', '弥生時代。各地に、まわりを堀で囲んだ集落（環濠集落）がつくられる。']],
      links: [['direct', '秦と匈奴：秦は30万の軍で匈奴を攻め、長城を築いた。'], ['none', '秦の統一とローマ・カルタゴの戦争：同じ時代の出来事だが、互いに関わりはない。'], ['none', '秦と日本列島：始皇帝の命で徐福が東の海へ出たという話が『史記』にあるが、日本に着いたかどうかは分からない。']] },
    e200: { year: -200, when: '前200年', title: '漢の成立と、匈奴の強盛', polys: 'labels', places: ['changan', 'rome'],
      sum: '漢を建てた劉邦は、匈奴の冒頓単于に包囲されて敗れた。以後およそ60年、漢は匈奴に贈り物を送って和平を保つ。武帝の戦争は、この関係をくつがえそうとするものだった。',
      labels: [[[29.8, 112.5], '漢', '高祖 劉邦', 1.25, 6.5, 1], [[46.5, 105], '匈奴', '冒頓単于', 1.25, 6.5, 1], [[40.2, 113.3], '白登山', '前200年', 3.5, 7], [[39.5, 96], '月氏', '匈奴に敗れ西へ', 3, 6], [[38, 57], 'パルティア', ''], [[31.5, 42], 'セレウコス朝', ''], [[36.6, 9.5], 'カルタゴ', '前201年に敗北'], [[35.2, 136.5], '倭', '弥生時代', 1.5, 6]],
      cards: [['中国', '前202年、劉邦が項羽を破って漢を建てる。長い戦乱のあとで、国力はまだ弱かった。'], ['草原', '冒頓単于のもとで匈奴は最も強くなる。東の東胡、西の月氏を破り、草原の東半分をまとめあげた。'], ['西アジア・インド', '匈奴に敗れた月氏は西へ移っていく。のちに武帝は、この月氏と手を結ぼうとして張騫を送ることになる。'], ['地中海', '前201年、ローマがカルタゴに勝ち、西地中海の主導権をにぎる。'], ['日本列島', '弥生時代。青銅や鉄の道具が広まり、集落どうしの争いも起きていた。']],
      links: [['direct', '漢と匈奴：白登山で敗れた漢は、皇族の娘を単于に嫁がせ、毎年、絹や酒や穀物を贈る約束をした。'], ['direct', '匈奴と月氏：匈奴が月氏を追い出したことが、数十年後の漢の西方外交のきっかけになる。'], ['none', '漢とローマ：東西で大きな国が生まれつつあったが、互いの存在を知らない。']] },
    e99: { year: -99, when: '前99年', title: '李陵と司馬遷のとき', polys: 'han', places: ['changan', 'juyan', 'jiuquan', 'zhangye', 'dunhuang', 'junji', 'surrender', 'court', 'tianshan', 'rome'],
      sum: '武帝の治世は50年を超えていた。漢は匈奴をゴビの北へ押し返し、西は中央アジア、東は朝鮮半島まで手を伸ばしていた。その戦いの一つで、李陵は降伏する。',
      labels: [[[33.5, 52], 'パルティア', '漢の史料では「安息」', 1.5, 4.5], [[36.3, 68], '大月氏', '', 2.5, 5], [[40.4, 71.8], '大宛', 'フェルガナ', 3, 5.5], [[45, 80.5], '烏孫', '', 3, 5.5], [[39.3, 83], '西域のオアシス諸国', '', 3, 5.5], [[39.0, 125.75], '楽浪郡', '前108年に漢が設置', 3.5, 6], [[35.2, 136.5], '倭', '弥生時代の日本列島', 1.5, 6], [[23, 79], 'インド', '', 1.5, 4]],
      cards: [['中国', '武帝（在位 前141〜前87年）のもと、漢は最も外へ広がった。長い戦争は国の財政を苦しめ、塩と鉄を国が独占して費用をまかなった。'], ['草原', '匈奴は前119年の敗戦でゴビの北へ退いたが、滅びてはいない。李陵を破ったのは、その力がまだ十分にあった証拠である。'], ['西アジア・中央アジア', '張騫の旅（前139ごろ〜前126年）で、漢は初めて中央アジアの国々を知った。前104〜前101年には李広利が大宛へ遠征し、名馬を手に入れている。'], ['地中海', 'ローマは共和政の末期。兵士のあり方を変える改革が進み、カエサルはこのころ生まれたばかりである。'], ['日本列島', '弥生時代の中ごろ。『漢書』は、楽浪郡の海のむこうに倭人がいて、百余りの国に分かれ、ときどき使いをよこすと記す。日本列島が中国の歴史書に現れる、最も早い例である。']],
      links: [['direct', '漢と匈奴：戦争、使者の行き来、降伏した者の受け入れ。李陵はその一人。'], ['direct', '漢と中央アジア：使者と軍隊が行き来し、馬やブドウなどが漢に伝わった。'], ['indirect', '漢と倭：朝鮮半島に置かれた楽浪郡を窓口に、倭の小さな国々が使いを送った。'], ['none', '漢とローマ：絹は多くの商人の手を経て西へ運ばれたが、国どうしが使者を交わした記録はこの時代にはない。'], ['none', '匈奴と倭：同じ時代に漢と向き合っていたが、互いの関わりは知られていない。']] },
    e57: { year: 57, when: '後57年', title: '倭の奴国に金印が授けられる', polys: 'labels', places: ['rome'],
      sum: '前漢は一度ほろび、後漢が建った。その光武帝のもとへ、倭の奴国が使いを送る。司馬遷の死からおよそ140年後のことである。',
      labels: [[[32.5, 112], '後漢', '光武帝', 1.25, 6.5, 1], [[47.5, 103], '北匈奴', '', 2, 6.5], [[41.5, 110.5], '南匈奴', '後漢に従う', 3, 6.5], [[36, 72], 'クシャーナ朝', ''], [[31.5, 52], 'パルティア', ''], [[48.5, 15], 'ローマ帝国', '皇帝ネロ', 2, 4.5], [[33.4, 130.6], '奴国', '金印「漢委奴国王」', 3, 7], [[36.5, 138.5], '倭', '弥生時代', 1.5, 6]],
      cards: [['中国', '後25年、劉秀（光武帝）が漢を再興した（後漢）。都は洛陽。司馬遷の『史記』にならい、班固が前漢の歴史『漢書』を書くのもこの時代である。'], ['草原', '匈奴は後48年に南北に分かれた。南匈奴は後漢に従って長城の内側に住み、北匈奴はやがて西へ去っていく。'], ['西アジア・中央アジア', '大月氏の流れをくむクシャーナ朝が、中央アジアから北インドを治める。後97年、後漢の甘英はローマを目指して西アジアの海辺まで行き、引き返した。'], ['地中海', 'ローマは前27年から皇帝が治める帝国になっていた。地中海全体を支配し、最も安定した時代に向かう。'], ['日本列島', '弥生時代の後期。『後漢書』は、倭の奴国が使いを送り、光武帝が印を授けたと記す。江戸時代に福岡県の志賀島で見つかった金印が、その印と考えられている。']],
      links: [['direct', '後漢と倭の奴国：使者が海を渡り、皇帝から印を受けた。中国の皇帝と日本列島の王が結ばれた、確かめられる最初の例。'], ['direct', '後漢と匈奴：南匈奴は後漢の中に組みこまれていった。'], ['indirect', '後漢とローマ：甘英は途中で引き返したが、互いの存在は知っていた。漢はローマを「大秦」と呼んだ。']] },
    e239: { year: 239, when: '後239年', title: '卑弥呼が魏に使いを送る', polys: 'labels', places: ['rome'],
      sum: '後漢はほろび、中国は魏・呉・蜀の三国に分かれた。倭の女王・卑弥呼が魏へ使いを送る。まもなく日本列島では、大きな古墳がつくられ始める。',
      labels: [[[36, 113.5], '魏', '', 2, 6.5, 1], [[29.5, 117.5], '呉', '', 2.5, 6.5, 1], [[30.5, 104], '蜀', '', 2.5, 6.5, 1], [[46.5, 110], '鮮卑', '', 2, 6.5], [[33.5, 52], 'ササン朝', '224年〜'], [[48.5, 15], 'ローマ帝国', '軍人皇帝の時代', 2, 4.5], [[34.6, 134.5], '倭（邪馬台国）', '場所は九州説・近畿説がある', 2.5, 7]],
      cards: [['中国', '220年に後漢がほろび、魏・呉・蜀が並び立つ（三国時代）。倭の使いを迎えたのは、北の魏である。'], ['草原', '匈奴に代わって、鮮卑が草原の主役になっていた。南匈奴の人々は中国の内側に住み、のちに自分たちの国を建てる。'], ['西アジア・中央アジア', 'イランではパルティアに代わってササン朝がおこり、ローマと争う。'], ['地中海', 'ローマ帝国は、軍人が次々に皇帝になる混乱の時代（235〜284年）に入っていた。'], ['日本列島', '弥生時代の終わり。『魏志』倭人伝は、女王・卑弥呼が魏に使いを送り、「親魏倭王」の称号と銅鏡を受けたと記す。3世紀の半ばごろから前方後円墳がつくられ、古墳時代へ移っていく。']],
      links: [['direct', '魏と倭：使者が何度も行き来した。倭人伝は、当時の日本列島のようすを伝える貴重な記録である。'], ['indirect', '後漢・三国とローマ：166年、ローマ皇帝の使いを名のる者が後漢に着いたと『後漢書』は記す。本当の使節か、商人かは分からない。'], ['none', '司馬遷と卑弥呼：およそ330年の開きがある。「同じ古代」でも、同じ時代ではない。']] }
  };
  var ERA_ORDER = ['e283', 'e221', 'e200', 'e99', 'e57', 'e239'];
  var LINK_KIND = { direct: '直接の関係', indirect: '人や物を介した関係', none: '同じ時代だが関係は確かめられない' };
  /* 年表：[開始年, 終了年, 名前] と [年, できごと] */
  var CHART = [
    { name: 'この教材', cls: 'story', bars: [[-145, -86, '司馬遷の生涯']], ev: [[-283, '『和氏の璧』'], [-99, '李陵事件']] },
    { name: '中国', cls: 'cn', bars: [[-300, -221, '戦国時代'], [-221, -206, '秦'], [-202, 8, '前漢'], [8, 23, '新'], [25, 220, '後漢'], [220, 280, '三国'], [280, 300, '晋']], ev: [[-221, '統一'], [-141, '武帝即位']] },
    { name: '草原', cls: 'st', bars: [[-209, 48, '匈奴'], [48, 155, '南北に分裂'], [155, 300, '鮮卑']], ev: [[-209, '冒頓単于'], [-119, 'ゴビの北へ退く']] },
    { name: '西アジア', cls: 'wa', bars: [[-300, -247, 'セレウコス朝'], [-247, 224, 'パルティア（安息）'], [224, 300, 'ササン朝']], ev: [[-139, '張騫が西へ'], [97, '甘英の旅']] },
    { name: 'インド', cls: 'in', bars: [[-300, -180, 'マウリヤ朝'], [30, 250, 'クシャーナ朝']], ev: [[-268, 'アショーカ王']] },
    { name: '地中海', cls: 'ro', bars: [[-300, -27, 'ローマ共和政'], [-27, 300, 'ローマ帝政']], ev: [[-218, 'ハンニバル'], [-44, 'カエサル暗殺'], [166, '「大秦」の使い']] },
    { name: '日本列島', cls: 'jp', bars: [[-300, 250, '弥生時代'], [250, 300, '古墳']], ev: [[57, '金印'], [107, '帥升'], [239, '卑弥呼']] }
  ];

  /* ---------- 縮尺（範囲で指定するので、画面の大きさが違っても同じ場所が入る） ---------- */
  var VIEWS = {
    world: { b: [[-48, -165], [74, 178]], txt: '世界全体で見ると、この物語の舞台はユーラシア大陸の東側。枠で囲んだ範囲を、これから拡大していく。' },
    eurasia: { b: [[8, -8], [60, 148]], txt: '大陸の西にはローマ、東には漢。そのあいだを、草原地帯が帯のように東西につないでいる。匈奴はこの草原の東の端にいた。' },
    eastasia: { b: [[18, 74], [54, 144]], txt: '農耕地帯を治める漢と、その北の草原に広がる匈奴。あいだにゴビ砂漠があり、西へは河西回廊が細くのびる。色の帯は勢力のおおよその広がりで、国境線ではない。' },
    campaign: { b: [[33, 92], [49, 112]], txt: '長安から居延まで直線で約' + (Math.round(km([34.31, 108.86], [41.95, 101.07]) / 10) * 10).toLocaleString() + 'km。李陵はそこからさらに北へ進んだ。点線は推定の経路、点線の円は推定の範囲である。' }
  };
  var THEATRE = [[33.3, 91.5], [48.6, 111]];

  /* ---------- 計算 ---------- */
  function km(a, b) { var r = Math.PI / 180, dLat = (b[0] - a[0]) * r, dLon = (b[1] - a[1]) * r, h = Math.pow(Math.sin(dLat / 2), 2) + Math.cos(a[0] * r) * Math.cos(b[0] * r) * Math.pow(Math.sin(dLon / 2), 2); return 12742 * Math.asin(Math.sqrt(h)); }
  function along(path, t) {
    if (path.length === 1 || t <= 0) return path[0];
    if (t >= 1) return path[path.length - 1];
    var len = [0], i;
    for (i = 1; i < path.length; i++) len.push(len[i - 1] + km(path[i - 1], path[i]));
    var d = t * len[len.length - 1];
    for (i = 1; i < path.length; i++) if (d <= len[i]) { var f = (d - len[i - 1]) / ((len[i] - len[i - 1]) || 1); return [path[i - 1][0] + (path[i][0] - path[i - 1][0]) * f, path[i - 1][1] + (path[i][1] - path[i - 1][1]) * f]; }
    return path[path.length - 1];
  }
  function upTo(path, t) {
    if (t <= 0) return [path[0]]; if (t >= 1) return path.slice();
    var len = [0], i, out = [path[0]];
    for (i = 1; i < path.length; i++) len.push(len[i - 1] + km(path[i - 1], path[i]));
    var d = t * len[len.length - 1];
    for (i = 1; i < path.length; i++) { if (d <= len[i]) { out.push(along(path, t)); break; } out.push(path[i]); }
    return out;
  }
  function ease(t) { return t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  /* ---------- 地図の土台 ---------- */
  function createMap(el, opts) {
    var box = $(el);
    var map = L.map(box, { zoomSnap: 0.25, zoomDelta: 0.5, minZoom: 0, maxZoom: 8, scrollWheelZoom: false, worldCopyJump: false, maxBounds: [[-85, -200], [85, 200]], maxBoundsViscosity: 0.8, attributionControl: true, zoomAnimation: !REDUCED, fadeAnimation: !REDUCED });
    map.attributionControl.setPrefix('<a href="https://leafletjs.com" target="_blank" rel="noopener">Leaflet</a>').addAttribution('地形: Natural Earth');
    L.control.scale({ imperial: false, maxWidth: 110 }).addTo(map);
    [['base', 150], ['zones', 410], ['routes', 420], ['labels', 440], ['places', 450], ['units', 460]].forEach(function (p) { map.createPane(p[0]).style.zIndex = p[1]; });
    map.getPane('base').style.pointerEvents = 'none'; map.getPane('labels').style.pointerEvents = 'none';
    var canvas = L.canvas({ pane: 'base', padding: 0.3 });
    function gj(data, style) { return L.geoJSON(data, { renderer: canvas, pane: 'base', interactive: false, style: style }); }
    var landStyle = { fillColor: C.land, fillOpacity: 1, color: C.coast, weight: 1 };
    var landLow = gj(GEO.land110, landStyle), landHigh = L.layerGroup([gj(GEO.land110out, landStyle), gj(GEO.land50, landStyle)]);
    var terrain = L.layerGroup([
      gj(GEO.regions, function (f) {
        var k = f.properties.FEATURECLA, n = f.properties.NAME;
        if (k === 'Desert') return { stroke: false, fillColor: '#e2cf9c', fillOpacity: .55 };
        if (k === 'Range/mtn') return { stroke: false, fillColor: '#b3a184', fillOpacity: .38 };
        if (n === 'MONGOLIAN PLATEAU' || n === 'KAZAKH STEPPE') return { stroke: false, fillColor: '#c3cf9d', fillOpacity: .45 };
        if (n === 'PLATEAU OF TIBET') return { stroke: false, fillColor: '#cfc3a8', fillOpacity: .4 };
        if (n === 'Hexi Corridor') return { color: '#a37a2c', weight: 1.5, dashArray: '4 4', fillColor: '#e9c46a', fillOpacity: .35 };
        if (n === 'Loess Plateau') return { stroke: false, fillColor: '#e6d6ad', fillOpacity: .5 };
        return { stroke: false, fill: false };
      }),
      gj(GEO.rivers, function (f) { var n = f.properties.name, main = n === 'Huang' || n === 'Chang Jiang' || n === 'Yangtze'; return { color: C.river, weight: main ? 2.2 : 1, opacity: main ? .95 : .6, fill: false }; }),
      gj(GEO.lakes, { fillColor: C.sea, fillOpacity: 1, color: C.river, weight: .8 })
    ]);
    function swapLand() {
      var hi = map.getZoom() >= 3.25;
      if (hi) { map.removeLayer(landLow); landHigh.addTo(map); terrain.addTo(map); } else { map.removeLayer(landHigh); map.removeLayer(terrain); landLow.addTo(map); }
    }
    /* 名前ラベル：縮尺に応じて出し入れする */
    var labels = [];
    function label(ll, html, cls, min, max, pane) {
      var m = L.marker(ll, { pane: pane || 'labels', interactive: false, keyboard: false, icon: L.divIcon({ className: 'hm-label ' + cls, html: '<span>' + html + '</span>', iconSize: [0, 0] }) });
      labels.push({ m: m, min: min == null ? 0 : min, max: max == null ? 99 : max, on: true }); return m;
    }
    function refreshLabels() { var z = map.getZoom(); labels.forEach(function (o) { var show = o.on && z >= o.min && z <= o.max; if (show && !map.hasLayer(o.m)) o.m.addTo(map); if (!show && map.hasLayer(o.m)) map.removeLayer(o.m); }); }
    GEOLABELS.forEach(function (g) { label(g.ll, esc(g.t), 'hm-' + g.k, g.min, g.max); });
    map.on('zoomend', function () { swapLand(); refreshLabels(); });

    /* 現代の地図（任意・要インターネット） */
    var osm = null, noticeEl = null;
    function notice(msg) {
      if (!noticeEl) { noticeEl = document.createElement('p'); noticeEl.className = 'map-notice'; noticeEl.setAttribute('role', 'status'); box.after(noticeEl); }
      noticeEl.textContent = msg || ''; noticeEl.classList.toggle('show', !!msg);
    }
    function setModern(on, btn) {
      if (on) {
        var ok = false;
        osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>', maxZoom: 8, opacity: .9 }).addTo(map);
        osm.on('tileload', function () { ok = true; notice(''); });
        osm.on('tileerror', function () { if (ok || !osm) return; setModern(false, btn); notice('現代の地図（OpenStreetMap）を読み込めませんでした。インターネット接続が必要です。地形だけの地図に戻しました。'); });
      } else if (osm) { map.removeLayer(osm); osm = null; }
      if (btn) { btn.setAttribute('aria-pressed', on ? 'true' : 'false'); btn.classList.toggle('active', on); }
    }

    /* 勢力圏：時代ごとの組を切り替えられるようにする */
    var sets = {}, curSet = null, zonesOn = true;
    function zone(grp, pts, color, name, text, strong) {
      L.polygon(pts, { pane: 'zones', color: color, weight: strong ? 2 : 1.4, dashArray: '6 5', fillColor: color, fillOpacity: strong ? .22 : .13 }).addTo(grp)
        .bindPopup('<b>' + name + '</b><span class="hm-badge est">おおよその範囲</span><p>' + text + '</p>', { maxWidth: 260 });
    }
    function buildSet(kind) {
      var grp = L.layerGroup(), zl = [];
      function lab(ll, html, cls, min, max) { var m = label(ll, html, cls, min, max); labels[labels.length - 1].on = false; zl.push(m); }
      var era = ERAS[kind], polys = era ? era.polys : kind;
      if (polys !== 'warring') L.polygon(STEPPE, { pane: 'zones', stroke: false, fillColor: '#9fb46a', fillOpacity: .22, interactive: false }).addTo(grp);
      if (polys === 'warring') {
        WARRING.forEach(function (w) { zone(grp, w.pts, w.color, w.name + '（前283年ごろ）', w.text, w.key); lab(w.at, w.name, 'hm-power' + (w.key ? '' : ' hm-power-s'), era ? 3 : 0, 7); });
      } else if (polys === 'han') {
        zone(grp, HAN, C.han, '漢（前100年ごろ）', '皇帝と官僚が、農耕を基盤とする広い地域を治めた。武帝の時代に河西回廊・朝鮮半島北部・南方へ支配を広げた。図の範囲は目安であり、境界ははっきりした線ではなかった。');
        zone(grp, XIONGNU, C.xiongnu, '匈奴（前100年ごろ）', '単于のもとに遊牧の諸集団がまとまった政権。人も家畜も季節ごとに移動するため、領土を線で囲むことはできない。タリム盆地のオアシス諸国にも影響力を持っていた。');
        lab([28.3, 113.5], '漢', 'hm-power hm-han', 1.5, 6.5); lab([49.4, 107.5], '匈奴', 'hm-power hm-xiongnu', 1.5, 6.5);
      }
      if (polys !== 'warring' || era) lab([49.3, 60], 'ユーラシア草原地帯', 'hm-geo hm-steppe', 2, 4.5);
      (era ? era.labels : polys === 'han' ? POLITIES.map(function (p) { return [p.ll, p.name, p.sub, p.min, p.max]; }) : []).forEach(function (p) {
        lab(p[0], esc(p[1]) + (p[2] ? '<small>' + esc(p[2]) + '</small>' : ''), p[5] ? 'hm-power hm-power-s' : 'hm-polity', p[3] == null ? 1.25 : p[3], p[4] == null ? 5.5 : p[4]);
      });
      return { grp: grp, zl: zl };
    }
    function applySet() {
      Object.keys(sets).forEach(function (k) { var s = sets[k], on = zonesOn && k === curSet; if (on) s.grp.addTo(map); else map.removeLayer(s.grp); labels.forEach(function (o) { if (s.zl.indexOf(o.m) > -1) o.on = on; }); });
      refreshLabels();
    }
    function setEra(kind) { if (!sets[kind]) sets[kind] = buildSet(kind); curSet = kind; applySet(); }
    function setZones(on, btn) {
      zonesOn = on; applySet();
      if (btn) { btn.setAttribute('aria-pressed', on ? 'true' : 'false'); btn.classList.toggle('active', on); }
    }

    /* 地点 */
    var placeLayers = {};
    function popupHtml(p) {
      return '<b>' + esc(p.name) + '</b><span class="hm-badge ' + (p.certain ? 'sure">位置は確か' : 'est">位置は推定') + '</span><p>' + esc(p.text) + '</p><p class="hm-now">' + esc(p.now) + '</p>' + (p.photo ? '<div class="hm-photo"><img alt="" loading="lazy" width="' + p.photo.w + '" height="' + p.photo.h + '" src="' + p.photo.src + '"><small>' + esc(p.photo.cap) + '　写真：' + esc(p.photo.credit) + '／<a href="' + p.photo.page + '" target="_blank" rel="noopener">Wikimedia Commons</a></small></div>' : '');
    }
    (opts.places || Object.keys(P)).forEach(function (key) {
      var p = P[key], grp = L.layerGroup();
      if (!p.certain && p.radius) L.circle(p.ll, { pane: 'zones', radius: p.radius, color: '#6b5a45', weight: 1.5, dashArray: '3 6', fillColor: '#6b5a45', fillOpacity: .07 }).addTo(grp).bindPopup(popupHtml(p), { maxWidth: 270, maxHeight: 250 });
      L.circleMarker(p.ll, { pane: 'places', radius: p.big ? 7 : 5.5, color: '#3b2f26', weight: 2, fillColor: p.certain ? '#3b2f26' : '#fffaf0', fillOpacity: 1, dashArray: p.certain ? null : '2 3' }).addTo(grp).bindPopup(popupHtml(p), { maxWidth: 270, maxHeight: 250 });
      var lab = label(p.ll, esc(p.name) + (p.certain ? '' : '<small>推定</small>'), 'hm-place' + (p.big ? ' hm-place-big' : ''), p.min, p.max == null ? 99 : p.max);
      placeLayers[key] = { grp: grp, min: p.min, max: p.max == null ? 99 : p.max, lab: lab, on: true };
    });
    function refreshPlaces() { var z = map.getZoom(); Object.keys(placeLayers).forEach(function (k) { var o = placeLayers[k], show = o.on && z >= o.min && z <= o.max; if (show && !map.hasLayer(o.grp)) o.grp.addTo(map); if (!show && map.hasLayer(o.grp)) map.removeLayer(o.grp); }); }
    map.on('zoomend', refreshPlaces);
    function setPlaces(list) { Object.keys(placeLayers).forEach(function (k) { var o = placeLayers[k]; o.on = list.indexOf(k) > -1; labels.forEach(function (x) { if (x.m === o.lab) x.on = o.on; }); }); refreshPlaces(); refreshLabels(); }

    function fit(b, animate) { map.invalidateSize(); if (animate && !REDUCED) map.flyToBounds(b, { duration: 1.1, padding: [6, 6] }); else map.fitBounds(b, { animate: false, padding: [6, 6] }); }
    map.fitBounds(opts.view, { animate: false, padding: [6, 6] });
    swapLand(); refreshLabels(); refreshPlaces(); setEra(opts.era || opts.mode || 'han');
    return { map: map, fit: fit, label: label, refreshLabels: refreshLabels, setModern: setModern, setZones: setZones, setEra: setEra, setPlaces: setPlaces, places: placeLayers };
  }

  function wireToggles(hm, root) {
    root.querySelectorAll('[data-hm-toggle]').forEach(function (b) {
      b.addEventListener('click', function () { var on = b.getAttribute('aria-pressed') !== 'true'; if (b.dataset.hmToggle === 'modern') hm.setModern(on, b); else hm.setZones(on, b); });
    });
  }

  /* =========================================================
     第三展示室：世界から戦場まで
     ========================================================= */
  var atlas = null;
  function initAtlas() {
    if (atlas || !$('atlasMap')) return;
    if ($('atlasMap').clientWidth < 420) VIEWS.world.b = [[-38, -22], [72, 162]];
    atlas = createMap('atlasMap', { view: VIEWS.world.b, era: 'e99', places: ['changan', 'juyan', 'jiuquan', 'zhangye', 'dunhuang', 'junji', 'surrender', 'court', 'tianshan', 'rome', 'handan', 'xianyang'] });
    atlas.setPlaces(ERAS.e99.places);
    var m = atlas.map;
    /* 世界地図の上で「ここ」を示す枠 */
    var frame = L.rectangle(VIEWS.eastasia.b, { pane: 'zones', color: '#8c4b3c', weight: 2, fill: false, dashArray: '5 4', interactive: false });
    var frameLab = atlas.label([56.5, 109], 'この地域の物語', 'hm-frame', 0, 2.5);
    function frameVis() { if (m.getZoom() <= 2.5) frame.addTo(m); else m.removeLayer(frame); }
    m.on('zoomend', frameVis); frameVis(); atlas.refreshLabels(); void frameLab;
    /* 李陵の行軍（推定）は拡大したときだけ見せる */
    var route = L.polyline(ROUTES.march, { pane: 'routes', color: C.han, weight: 3, dashArray: '2 7', opacity: .9 }).bindPopup('<b>李陵の進軍</b><span class="hm-badge est">経路は推定</span><p>居延から北へ30日、と『漢書』は記す。どこを通ったかは分かっていない。第四展示室で、時間を追ってたどる。</p>', { maxWidth: 260 });
    var curEra = 'e99';
    function routeVis() { if (curEra === 'e99' && m.getZoom() >= 4.5) route.addTo(m); else m.removeLayer(route); }
    m.on('zoomend', routeVis); routeVis();
    var root = $('worldAtlas');
    root.querySelectorAll('[data-atlas-view]').forEach(function (b) {
      b.addEventListener('click', function () {
        var v = VIEWS[b.dataset.atlasView]; atlas.fit(v.b, true); $('atlasInfo').textContent = v.txt;
        root.querySelectorAll('[data-atlas-view]').forEach(function (x) { var on = x === b; x.classList.toggle('active', on); x.setAttribute('aria-pressed', on ? 'true' : 'false'); });
      });
    });
    $('atlasInfo').textContent = VIEWS.world.txt;
    wireToggles(atlas, root);

    /* 時代の断面を選ぶ */
    var X = function (y) { return ((y + 300) / 600 * 100).toFixed(2) + '%'; };
    var yr = function (y) { return y < 0 ? '前' + (-y) : '後' + y; };
    var pick = $('eraPick'), panel = $('eraPanel'), chart = $('eraChart');
    pick.innerHTML = ERA_ORDER.map(function (k) { var e = ERAS[k]; return '<button type="button" data-era="' + k + '" aria-pressed="false"><b>' + e.when + '</b><small>' + e.title + '</small></button>'; }).join('');
    chart.innerHTML = '<div class="tl"><div class="tl-row tl-axis"><span class="tl-name"></span><div class="tl-track">'
      + [-300, -200, -100, 0, 100, 200, 300].map(function (y) { return '<i class="tl-tick" style="left:' + X(y) + '">' + (y === 0 ? '紀元' : yr(y)) + '</i>'; }).join('')
      + ERA_ORDER.map(function (k) { return '<button type="button" class="tl-flag" data-era="' + k + '" style="left:' + X(ERAS[k].year) + '" aria-label="' + ERAS[k].when + 'を選ぶ"></button>'; }).join('') + '</div></div>'
      + CHART.map(function (r) {
        return '<div class="tl-row tl-' + r.cls + '"><span class="tl-name">' + r.name + '</span><div class="tl-track">'
          + r.bars.map(function (b) { return '<span class="tl-bar" style="left:' + X(b[0]) + ';width:' + ((b[1] - b[0]) / 6).toFixed(2) + '%" title="' + b[2] + '（' + yr(b[0]) + '〜' + yr(b[1]) + '）"><em>' + b[2] + '</em></span>'; }).join('')
          + r.ev.map(function (v) { return '<span class="tl-ev" style="left:' + X(v[0]) + '"><em>' + (v[0] < 0 ? '前' + (-v[0]) : v[0]) + ' ' + v[1] + '</em></span>'; }).join('')
          + ERA_ORDER.map(function (k) { return '<i class="tl-line" data-era="' + k + '" style="left:' + X(ERAS[k].year) + '"></i>'; }).join('') + '</div></div>';
      }).join('') + '</div>';
    function setEraUI(k, moveMap) {
      var e = ERAS[k]; curEra = k; atlas.setEra(k); atlas.setPlaces(e.places); routeVis();
      root.querySelectorAll('[data-era]').forEach(function (b) { var on = b.dataset.era === k; b.classList.toggle('active', on); if (b.hasAttribute('aria-pressed')) b.setAttribute('aria-pressed', on ? 'true' : 'false'); });
      panel.innerHTML = '<div class="era-head"><span>' + e.when + '</span><b>' + e.title + '</b><p>' + e.sum + '</p></div>'
        + '<div class="world-band">' + e.cards.map(function (c) { return '<article' + (c[0] === '日本列島' ? ' class="jp"' : '') + '><b>' + c[0] + '</b>' + c[1] + '</article>'; }).join('') + '</div>'
        + '<div class="era-links"><b>つながりを確かめる</b><ul>' + e.links.map(function (l) { return '<li><span class="lk lk-' + l[0] + '">' + LINK_KIND[l[0]] + '</span>' + l[1] + '</li>'; }).join('') + '</ul></div>';
      if (moveMap) {
        var narrow = $('atlasMap').clientWidth < 420, v = (k === 'e283' || narrow) ? 'eastasia' : 'eurasia';
        atlas.fit(VIEWS[v].b, true); $('atlasInfo').textContent = e.when + 'の世界。' + (e.polys === 'labels' ? '国や勢力の名前を、おおよその位置に示している（範囲は描いていない）。' : '色の範囲は、勢力のおおよその広がりを示す。') + (v === 'eastasia' ? '「② ユーラシア」を押すと、西の世界まで見わたせる。' : '');
        root.querySelectorAll('[data-atlas-view]').forEach(function (x) { var on = x.dataset.atlasView === v; x.classList.toggle('active', on); x.setAttribute('aria-pressed', on ? 'true' : 'false'); });
      }
    }
    root.addEventListener('click', function (ev) { var b = ev.target.closest('[data-era]'); if (!b || b.tagName !== 'BUTTON') return; setEraUI(b.dataset.era, true); if (b.classList.contains('tl-flag')) $('atlasMap').scrollIntoView({ block: 'center', behavior: REDUCED ? 'auto' : 'smooth' }); });
    setEraUI('e99', false);
    atlas.era = function () { return curEra; };
  }

  /* =========================================================
     物語を時間順にたどる地図（第一展示室・第四展示室で共通）
     ========================================================= */
  var ROAD = [[41.95, 101.07], [40.4, 100.3], [38.93, 100.45], [37.93, 102.64], [36.05, 103.8], [34.6, 105.7], [34.31, 108.86]];
  var ROUTES = {
    march: [[41.95, 101.07], [43.0, 101.6], [44.3, 102.3]],
    retreat: [[44.3, 102.3], [43.75, 103.0], [43.1, 102.5], [42.35, 101.25]],
    messenger: [[44.3, 102.3], [43.0, 101.6]].concat(ROAD),
    report: ROAD,
    survivors: [[42.35, 101.25], [41.95, 101.07]],
    guangli: [[39.74, 98.51], [41.3, 96.3], [43.3, 93.8]]
  };
  var D_CHANGAN = Math.round(km(P.changan.ll, P.surrender.ll) / 10) * 10;
  var D_JUYAN = Math.round(km(P.changan.ll, P.juyan.ll) / 10) * 10;
  var MOVE = 3200, HOLD = 2600; /* 1場面の動き／通し再生のときの間 */
  /* 状態の種類：field=その場にいる / wait=待つ・動く / stale=古い知らせを信じている / unknown=知らない / know=知る / act=判断する */

  var LILING = {
    key: 'liling', map: 'campaignMap', root: 'liveHistory', mode: 'han', view: THEATRE,
    places: ['changan', 'juyan', 'jiuquan', 'zhangye', 'dunhuang', 'junji', 'surrender', 'court', 'tianshan'],
    people: [{ k: 'li', name: '李陵', at: '戦場' }, { k: 'wu', name: '武帝', at: '長安' }, { k: 'sima', name: '司馬遷', at: '長安' }],
    views: [['全体', THEATRE], ['戦場', [[41.2, 98], [45.6, 106]]], ['長安', [[32.3, 105.5], [36.3, 112]]]],
    banner: function (sc) { return '長安の宮廷：' + sc.st.wu[0]; },
    est: [
      { from: 0, to: 0, path: ROUTES.guangli, color: C.han }, { from: 1, to: 7, path: ROUTES.march, color: C.han }, { from: 2, to: 2, path: ROUTES.messenger, color: C.report },
      { from: 4, to: 7, path: ROUTES.retreat, color: C.han }, { from: 6, to: 7, path: ROUTES.report, color: C.report }
    ],
    dist: { from: 6, a: P.surrender.ll, b: P.changan.ll, at: .68, text: '直線で約' + D_CHANGAN.toLocaleString() + 'km' },
    units: [
      { id: 'guangli', side: 'han', small: true, label: function () { return '李広利<small>騎兵3万</small>'; }, show: [0, 0], tracks: { 0: { path: ROUTES.guangli } } },
      { id: 'main', side: 'han', pos: 'bottom', posAt: function (s) { return s <= 3 ? 'bottom' : 'left'; }, label: function (s) { return s >= 5 ? '李陵<small>降伏</small>' : '李陵軍<small>歩兵5千</small>'; }, show: [0, 7], tracks: { 0: { path: [ROUTES.march[0]] }, 1: { path: ROUTES.march }, 4: { path: ROUTES.retreat } } },
      { id: 'messenger', side: 'report', small: true, label: function () { return '陳歩楽<small>「順調」の報告</small>'; }, show: [2, 2], tracks: { 2: { path: ROUTES.messenger } } },
      { id: 'x1', side: 'xiongnu', label: function () { return '単于<small>騎兵3万</small>'; }, show: [3, 5], tracks: { 3: { path: [[47.4, 104.3], [45.9, 103.3], [44.75, 102.5]], to: .55 }, 4: { path: [[44.75, 102.5], [44.2, 103.2], [43.55, 102.8], [42.85, 101.75]] }, 5: { path: [[42.85, 101.75], [42.62, 101.38]] } } },
      { id: 'x2', side: 'xiongnu', pos: 'right', label: function () { return '援軍<small>あわせて8万騎</small>'; }, show: [3, 5], tracks: { 3: { path: [[46.3, 108.0], [45.2, 105.3], [44.35, 103.25]], from: .45 }, 4: { path: [[44.35, 103.25], [43.7, 103.75], [43.0, 103.2], [42.35, 102.1]] }, 5: { path: [[42.35, 102.1], [42.3, 101.62]] } } },
      { id: 'x3', side: 'xiongnu', label: function () { return ''; }, show: [3, 5], tracks: { 3: { path: [[46.2, 97.0], [45.1, 99.6], [44.3, 101.3]], from: .45 }, 4: { path: [[44.3, 101.3], [43.6, 101.7], [43.0, 101.2], [42.5, 100.8]] }, 5: { path: [[42.5, 100.8], [42.42, 100.95]] } } },
      { id: 'survivors', side: 'han', small: true, pos: 'bottom', label: function () { return '逃げ帰った<small>400余人</small>'; }, show: [5, 6], tracks: { 5: { path: ROUTES.survivors, from: .5 } } },
      { id: 'report', side: 'report', small: true, label: function () { return '敗北の知らせ'; }, show: [6, 6], tracks: { 6: { path: ROUTES.report } } }
    ],
    scenes: [
      { when: '前99年 夏', title: '出発の前', view: THEATRE, focus: { li: 'juyan', wu: 'changan', sima: 'changan' },
        text: 'この年の夏、武帝は弐師将軍・李広利に騎兵3万を与え、酒泉から匈奴の右賢王を攻めさせた。李陵は、その補給部隊を任されるはずだった。',
        who: { li: '輸送役を断り、自分の兵だけで単于の本拠に迫りたいと願い出た。騎兵は与えられず、手勢は歩兵5千。', wu: '主力は李広利の騎兵。李陵の願いを勇ましいものと認めて許し、路博徳に後ろからの支援を命じた。', sima: '太史令として長安の宮廷にいた。李陵とは特に親しい間柄ではなかった、と後に自分で書いている。' },
        st: { li: ['出撃を願い出る', 'act'], wu: ['作戦を決める', 'act'], sima: ['宮廷に勤める', 'wait'] },
        ask: '三人のうち、戦場へ行くのは一人だけ。残る二人は、これから何をたよりに戦いのようすを知るのだろう。',
        src: '李広利の出撃と李陵の願い出は『漢書』による。「天山」がどこかは説が分かれる。' },
      { when: '前99年 秋', title: '居延から北へ30日', view: [[41, 97.5], [45.6, 106.5]], focus: { li: 'unit', wu: 'changan', sima: 'changan' },
        text: '9月、李陵は歩兵5千を率いて居延を出た。北へ30日。食糧と矢を車に積み、砂漠と山地を歩いて進む。',
        who: { li: '匈奴の地の奥へ入っていく。騎兵はなく、頼れるのは弩（機械じかけの弓）と、車に積んだ矢。', wu: '支援を命じた路博徳は出撃の先延ばしを申し出た。武帝はこれを李陵の心変わりと疑い、予定どおりの出撃を命じた。後ろから支える軍はなかった。', sima: '長安にいる。戦場のようすを知る手段は、届く報告だけである。' },
        st: { li: ['行軍中', 'field'], wu: ['報告を待つ', 'wait'], sima: ['報告を待つ', 'wait'] },
        ask: '後ろから支える軍がないことを、李陵はどこまで分かっていただろう。武帝の側の事情と見くらべよう。',
        src: '「北へ30日」は『漢書』の記述。通った道は分からないため、点線は推定である。' },
      { when: '前99年 秋', title: '浚稽山に陣を置く　「順調」の報告', view: THEATRE, focus: { li: 'unit', wu: 'changan', sima: 'changan' },
        text: '浚稽山に着いた李陵は、通ってきた山や川の地形を図に描き、部下の陳歩楽を都へ送った。報告は河西回廊を通って長安へ向かう。',
        who: { li: 'まだ大きな戦いはない。偵察と記録という任務を果たし、その成果を都へ届けさせた。', wu: '陳歩楽から、李陵が兵士の心をよくつかんでいると聞き、たいへん喜んだ。', sima: '宮廷は良い知らせに沸き、大臣たちは皇帝に祝いの杯をささげた、と司馬遷は書き残している。' },
        st: { li: ['陣を置く', 'field'], wu: ['「順調」と聞く', 'stale'], sima: ['「順調」と聞く', 'stale'] },
        ask: '知らせは、届くまでに日数がかかる。長安に着いたとき、「順調」はまだ本当だっただろうか。',
        src: '報告の内容は『漢書』と「報任安書」による。使者が通った道と日数は記録になく、推定である。' },
      { when: '前99年 秋', title: '単于の3万騎、さらに8万騎', view: [[42.3, 95.5], [48.8, 109.5]], focus: { li: 'unit', wu: 'changan', sima: 'changan' },
        text: '単于みずから率いる騎兵およそ3万が李陵軍を囲んだ。李陵は車を並べて陣を作り、弩で迎え撃つ。単于は驚き、左右の地からさらに8万余りの騎兵を呼び集めた。',
        who: { li: '歩兵5千に対して、騎兵は合わせて10万を超える。それでも初めの戦いでは数千を倒した、と記される。', wu: 'まだ何も知らない。手元にあるのは「順調」という報告だけである。', sima: '同じく、何も知らない。都ではまだ祝いの気分が続いている。' },
        st: { li: ['囲まれて戦う', 'field'], wu: ['まだ知らない', 'unknown'], sima: ['まだ知らない', 'unknown'] },
        ask: '李陵が囲まれているこの瞬間、都の二人は祝いの気分の中にいる。この差は、だれのせいだろうか。',
        src: '兵の数は『漢書』の記述による。古代の史料の兵数は誇張を含むことがある。匈奴軍がどこから来たかは推定である。' },
      { when: '前99年 秋', title: '南へ退きながら戦う', view: [[41.2, 98], [45.6, 106]], focus: { li: 'unit', wu: 'changan', sima: 'changan' },
        text: '李陵は東南へ、さらに南へと、戦いながら退いた。何日も戦闘が続き、矢は減っていく。途中、部下の一人が匈奴に逃げ、「援軍は来ない、矢も残りわずかだ」と伝えてしまう。',
        who: { li: '負傷した兵も車を押し、武器を取って戦い続けた。国境の砦まで、あと少し。', wu: 'まだ知らない。長安から居延まででも、直線で約' + D_JUYAN.toLocaleString() + 'km離れている。', sima: 'まだ知らない。' },
        st: { li: ['退きながら戦う', 'field'], wu: ['まだ知らない', 'unknown'], sima: ['まだ知らない', 'unknown'] },
        ask: '何日も戦い続けたこの苦労を、都の人はどうすれば知ることができただろう。',
        src: '退いた方角（東南、のち南）は『漢書』に記されるが、地点は特定できない。経路は推定である。' },
      { when: '前99年 冬の初めごろ', title: '砦まで百余里　矢が尽きる', view: [[41.2, 98.5], [44.2, 104.5]], focus: { li: 'surrender', wu: 'changan', sima: 'changan' },
        text: '谷に追い込まれ、矢は一日で射尽くされた。夜、李陵は囲みを破ろうとしたが果たせず、降伏した。国境の砦まで百余里（約40〜50km）。400人余りが砦にたどり着いた。',
        who: { li: '「陛下に合わせる顔がない」と言って降伏した、と『漢書』は記す。心の中までは、史料からは分からない。', wu: 'この瞬間にも、まだ知らない。', sima: 'まだ知らない。' },
        st: { li: ['降伏する', 'field'], wu: ['まだ知らない', 'unknown'], sima: ['まだ知らない', 'unknown'] },
        ask: '降伏の場面を自分の目で見た人は、三人のうち一人だけ。見ていない二人は、何をもとにその場面を思い描くことになるか。',
        src: '「塞から百余里」「400余人」は『漢書』による。地点は推定の範囲で示している。' },
      { when: '前99年 冬', title: '敗北の知らせが長安へ', view: THEATRE, focus: { li: 'surrender', wu: 'changan', sima: 'changan' },
        text: '国境の砦から、敗北の知らせが都へ送られた。戦場と長安は直線で約' + D_CHANGAN.toLocaleString() + 'km。都の人々が知るのは、起きたことそのものではなく、届いた知らせである。',
        who: { li: '匈奴の地にとどまる。都で自分がどう語られるかを知る方法はない。', wu: '初めは李陵が戦死したものと期待した。降伏したと知って激しく怒った。', sima: '昨日まで李陵をたたえていた大臣たちが、いっせいに李陵を非難し始めるのを見た。' },
        st: { li: ['都のようすを知らない', 'unknown'], wu: ['降伏を知る', 'know'], sima: ['降伏を知る', 'know'] },
        ask: '同じ知らせを受け取った武帝と司馬遷。二人の受け取り方は、なぜ分かれたのだろう。立場の違いから考えよう。',
        src: '知らせが届くまでの日数は記録にない。直線距離は推定地点から計算した目安である。' },
      { when: '前99年〜前98年', title: '長安の宮廷　司馬遷の弁護', view: THEATRE, focus: { li: 'surrender', wu: 'changan', sima: 'changan' },
        text: '武帝に意見を求められた司馬遷は、李陵を弁護した。武帝はこれを、主力を率いた李広利をおとしめる言葉と受け取り、司馬遷を獄に下した。翌年、司馬遷は宮刑を受ける。',
        who: { li: '後に、誤った知らせがもとで、都に残した家族は処刑された。李陵は漢に帰らなかった。', wu: '軍の規律と皇帝の威信を守る立場にあった。自分が選んだ将軍・李広利への批判を許さなかった。', sima: '「わずかな歩兵で大軍と戦い抜いた。降伏したのは、いつか漢に報いる機会を待つためではないか」と述べた。' },
        st: { li: ['都のようすを知らない', 'unknown'], wu: ['罰を下す', 'act'], sima: ['李陵を弁護する', 'act'] },
        ask: '三人のうち、ほかの二人の事情を十分に知っていた人はいただろうか。下の「三人の時間表」を上から順に見直そう。',
        src: '司馬遷の言葉は『漢書』と「報任安書」の内容を要約したもの。李陵の本心についての部分は、司馬遷の推測である。' }
    ]
  };

  /* ---- 『和氏の璧』：璧はどこを動いたか（前283年ごろ） ---- */
  var W_ROAD = [[36.6, 114.49], [35.6, 114.1], [35.0, 113.2], [34.72, 112.45], [34.63, 110.92], [34.55, 109.9], [34.42, 108.83]];
  var W_BACK = [[34.42, 108.83], [35.2, 110.1], [36.0, 111.5], [36.35, 113.0], [36.6, 114.49]];
  var D_HX = Math.round(km(P.handan.ll, P.xianyang.ll) / 10) * 10;
  var HESHI = {
    key: 'heshi', map: 'heshiMap', root: 'heshiStory', mode: 'warring', view: [[29.5, 104.5], [41.5, 121]],
    places: ['handan', 'xianyang', 'hangu', 'luoyang', 'jingshan', 'ying', 'daliang', 'linzi', 'ji', 'xinzheng'],
    people: [{ k: 'lin', name: '藺相如', at: '趙の使者' }, { k: 'qin', name: '秦の昭王', at: '咸陽' }, { k: 'zhao', name: '趙の恵文王', at: '邯鄲' }],
    views: [['全体', [[29.5, 104.5], [41.5, 121]]], ['秦と趙', [[33.4, 107.5], [37.6, 116]]]],
    banner: function (sc) { return '璧のありか：' + sc.bi; },
    est: [
      { from: 1, to: 1, path: W_ROAD.slice().reverse(), color: '#3f3a45' }, { from: 2, to: 6, path: W_ROAD, color: C.han }, { from: 4, to: 6, path: W_BACK, color: '#4f8a63' }
    ],
    dist: { from: 2, to: 2, a: P.handan.ll, b: P.xianyang.ll, at: .5, text: '直線で約' + D_HX.toLocaleString() + 'km' },
    units: [
      { id: 'stone', side: 'jade', small: true, pos: 'right', label: function () { return '璧のもとになった石'; }, show: [0, 0], tracks: { 0: { path: [P.jingshan.ll] } } },
      { id: 'envoy', side: 'qin', small: true, label: function () { return '秦王の手紙<small>「15の城と交換を」</small>'; }, show: [1, 1], tracks: { 1: { path: W_ROAD.slice().reverse() } } },
      { id: 'main', side: 'han', pos: 'bottom', label: function (s) { return s === 2 ? '藺相如<small>璧を持って</small>' : s === 6 ? '藺相如<small>帰国</small>' : '藺相如'; }, show: [2, 6], tracks: { 2: { path: W_ROAD }, 6: { path: W_ROAD.slice().reverse() } } },
      { id: 'bi', side: 'jade', small: true, pos: 'right', label: function () { return '璧<small>従者がひそかに運ぶ</small>'; }, show: [4, 4], tracks: { 4: { path: W_BACK } } },
      { id: 'bihome', side: 'jade', small: true, pos: 'right', label: function () { return '璧'; }, show: [5, 6], tracks: { 5: { path: [P.handan.ll] } } }
    ],
    scenes: [
      { when: 'さらに昔', title: '璧は楚の山で見つかった', view: [[29.5, 104.5], [41.5, 121]], bi: '楚（言い伝え）', focus: { lin: 'handan', qin: 'xianyang', zhao: 'handan' },
        text: '言い伝えでは、楚の人・卞和（べんか）が山で玉の原石を見つけ、王に差し出した。二度までただの石と疑われ、三度目にようやく磨かれて宝となった。「和氏の璧」の名はここから来ている。',
        who: { lin: 'まだ登場しない。もとは趙の役人・繆賢（びゅうけん）に仕える身だった。', qin: '秦は西の強国。次々と周りの国の土地を取り、力を伸ばしていた。', zhao: 'その璧を、いまは趙の恵文王が持っている。楚から趙へどう渡ったのかは分かっていない。' },
        st: { lin: ['まだ無名', 'wait'], qin: ['力を伸ばす', 'act'], zhao: ['璧を手に入れる', 'know'] },
        ask: '宝は楚で生まれ、趙に渡り、秦がほしがった。一つの璧が三つの国を結んでいる。地図で三国の位置を確かめよう。',
        src: '卞和の話は『韓非子』に見える言い伝え。山の場所（荊山）は伝承による推定である。' },
      { when: '前283年ごろ', title: '秦王の手紙が届く', view: [[33.4, 107.5], [37.6, 116]], bi: '趙の都・邯鄲', focus: { lin: 'handan', qin: 'xianyang', zhao: 'handan' },
        text: '秦の昭王から趙へ手紙が来た。「15の城と、璧を交換したい」。渡せば城はもらえないかもしれない。断れば、秦に攻める口実を与える。',
        who: { lin: '繆賢の推薦で王の前に呼ばれた。「城が手に入らなければ、璧を無事に持ち帰ります」と引き受けた。', qin: '強国の立場から申し出た。本当に城を渡すつもりがあったのかは、手紙からは分からない。', zhao: '大臣たちと相談したが結論が出ない。秦に送る使者さえ決まらなかった。' },
        st: { lin: ['使者を引き受ける', 'act'], qin: ['交換を申し出る', 'act'], zhao: ['決められない', 'unknown'] },
        ask: '趙王が決められなかったのはなぜか。秦王の本心を、趙王は知ることができただろうか。',
        src: '手紙の内容と趙の相談は『史記』廉頗藺相如列伝による。使者が通った道は推定。' },
      { when: '前283年ごろ', title: '藺相如、璧を持って西へ', view: [[33.4, 107.5], [37.6, 116]], bi: '藺相如の手に（移動中）', focus: { lin: 'unit', qin: 'xianyang', zhao: 'handan' },
        text: '藺相如は璧をたずさえ、邯鄲から秦の都・咸陽へ向かった。直線でも約' + D_HX.toLocaleString() + 'km。途中には魏や韓の土地があり、最後に秦の東の門・函谷関を通る。',
        who: { lin: '一人の使者として、他国の土地を通り、敵になるかもしれない国の都へ入っていく。', qin: '咸陽で使者を待つ。自分の都、自分の宮殿、自分の兵。すべてが秦王の側にある。', zhao: '邯鄲に残る。ここから先、交渉がどう進むかを知る方法はない。' },
        st: { lin: ['秦へ向かう', 'field'], qin: ['使者を待つ', 'wait'], zhao: ['結果を待つ', 'wait'] },
        ask: '交渉の場は秦の都。場所が相手の国であることは、藺相如にとってどんな不利になるだろう。',
        src: '出発と到着は『史記』による。通った道の記録はなく、当時の主要な道筋にもとづく推定である。' },
      { when: '前283年ごろ', title: '咸陽の宮殿で', view: [[33.4, 107.5], [37.6, 116]], bi: '咸陽（いったん秦王の手に、すぐ藺相如へ）', focus: { lin: 'xianyang', qin: 'xianyang', zhao: 'handan' },
        text: '秦王は璧を受け取って喜び、まわりの者に見せて回った。城の話は出ない。藺相如は「璧に傷があります。お教えしましょう」と言って取り戻し、柱のそばに立った。「城を渡す気がないなら、私の頭もろとも璧をこの柱で砕きます」。',
        who: { lin: '相手の態度から、城を渡す気がないと見抜いた。璧を自分の手に取り戻してから、初めて強い言葉を口にした。', qin: '璧を砕かれては元も子もない。地図を広げて15の城を示し、五日間身を清めてから受け取ると約束した。', zhao: '邯鄲では、この場面をだれも知らない。' },
        st: { lin: ['璧を取り戻す', 'field'], qin: ['約束してみせる', 'act'], zhao: ['まだ知らない', 'unknown'] },
        ask: '藺相如は、怒る前にまず璧を取り戻した。この順番でなければならなかった理由を、本文から考えよう。',
        src: '場面は『史記』廉頗藺相如列伝による。宮殿の名は章台と記される。' },
      { when: '前283年ごろ', title: '璧はひそかに趙へ', view: [[33.4, 107.5], [37.6, 116]], bi: '従者が運ぶ（趙へ移動中）', focus: { lin: 'xianyang', qin: 'xianyang', zhao: 'handan' },
        text: '藺相如は、秦王が結局は城を渡さないと判断した。五日の間に、従者に粗末な服を着せ、璧をふところに隠させて、人目につかない道から趙へ帰らせた。自分は咸陽に残った。',
        who: { lin: '璧は逃がした。しかし自分は逃げなかった。秦王の前にもう一度立つためである。', qin: 'まだ知らない。五日後に璧が手に入ると思っている。', zhao: 'まだ知らない。璧は、何も知らせのないまま戻ってくることになる。' },
        st: { lin: ['咸陽に残る', 'field'], qin: ['まだ知らない', 'unknown'], zhao: ['まだ知らない', 'unknown'] },
        ask: 'このとき本当のことを知っているのは藺相如だけ。なぜ彼は、璧といっしょに逃げなかったのだろう。',
        src: '「間道（わき道）から帰らせた」と『史記』は記すが、どの道かは分からない。緑の点線は推定である。' },
      { when: '前283年ごろ', title: '秦王の前に立つ', view: [[33.4, 107.5], [37.6, 116]], bi: '趙（無事に戻った）', focus: { lin: 'xianyang', qin: 'xianyang', zhao: 'handan' },
        text: '五日後、藺相如は秦王に告げた。「璧はもう趙に帰しました。秦が先に城を渡せば、趙は璧を惜しみません。王を欺いた罪は死に値します。どうか私を釜ゆでにしてください」。',
        who: { lin: '自分の命を相手にゆだねた。ただし、殺せば秦が損をする道理を、先に言葉で示している。', qin: '家来たちは藺相如を引き立てようとした。しかし王は「殺しても璧は手に入らず、趙との関係を壊すだけだ」と考え、礼をつくして帰した。', zhao: '璧は戻った。しかし使者がどうなったかは、まだ分からない。' },
        st: { lin: ['命をかけて告げる', 'field'], qin: ['初めて知る', 'know'], zhao: ['璧だけが戻る', 'stale'] },
        ask: '秦王はなぜ藺相如を殺さなかったのか。王の立場から見た損と得を整理しよう。',
        src: '言葉は『史記』の内容を要約したもの。' },
      { when: '前283年ごろ', title: '帰国', view: [[33.4, 107.5], [37.6, 116]], bi: '趙', focus: { lin: 'unit', qin: 'xianyang', zhao: 'handan' },
        text: '藺相如は趙に帰った。結局、秦は城を渡さず、趙も璧を渡さなかった。趙王は、他国ではずかしめを受けずに使命を果たしたとして、藺相如を上大夫に取り立てた。',
        who: { lin: '璧も、国の面目も、自分の命も守って帰った。傷のないまま返すことを、のちに「完璧」と言うようになる。', qin: '城も璧も動かなかった。しかし秦の力は変わらず、数年後にはまた趙を攻める。', zhao: 'すべてを知り、藺相如を高い位につけた。' },
        st: { lin: ['使命を果たす', 'act'], qin: ['何も得ず', 'know'], zhao: ['すべてを知る', 'know'] },
        ask: '三人の時間表を見直そう。本当のことを知っている人は、場面ごとにどう入れかわっただろうか。',
        src: '結末は『史記』廉頗藺相如列伝による。' }
    ]
  };
  var KIND = { field: 'その場にいる', wait: '待つ', stale: '古い知らせ', unknown: '知らない', know: '知る', act: '決める・動く' };

  function createStory(cfg) {
    var root = $(cfg.root), n = cfg.scenes.length;
    /* 画面の部品を作る */
    var h = '<div class="atlas-map" id="' + cfg.map + '" role="application" aria-label="物語の進行を示す歴史地図"></div>'
      + '<div class="map-progress" aria-hidden="true"><div class="js-bar"></div></div>'
      + '<div class="scene-controls"><button class="js-prev" type="button" aria-label="前の場面">←</button><button class="js-play play" type="button">▶ 再生</button><button class="js-next" type="button" aria-label="次の場面">→</button></div>'
      + '<div class="map-scenes js-chips" role="group" aria-label="場面を選ぶ" style="grid-template-columns:repeat(' + n + ',1fr)"></div>'
      + '<label class="map-auto"><input class="js-auto" type="checkbox"> 止まらずに最後まで通して再生する</label>'
      + '<div class="map-stage" aria-live="polite"><span class="when js-when"></span><strong class="js-title"></strong><p class="js-text"></p></div>'
      + '<div class="trio"><div class="trio-head">同じ瞬間、三人は<span>名前を押すと地図で居場所を示す</span></div>'
      + cfg.people.map(function (p) { return '<button type="button" class="trio-row" data-person="' + p.k + '" aria-pressed="false"><span class="trio-name"><b>' + p.name + '</b><small>' + p.at + '</small></span><span class="trio-body"><span class="chip js-chip"></span><span class="js-who"></span></span></button>'; }).join('')
      + '</div>'
      + '<p class="map-ask"><b>くらべてみよう</b><span class="js-ask"></span></p>'
      + '<p class="map-src"><b>史料と推定</b>　<span class="js-src"></span></p>'
      + '<div class="matrix"><div class="matrix-head">三人の時間表<span>行を押すとその場面へ</span></div><div class="matrix-grid" style="grid-template-columns:auto repeat(' + cfg.people.length + ',1fr)"><span></span>'
      + cfg.people.map(function (p) { return '<b>' + p.name + '</b>'; }).join('')
      + cfg.scenes.map(function (sc, i) { return '<button type="button" class="mx-row" data-scene="' + i + '"><span class="mx-n">' + (i + 1) + '</span>' + cfg.people.map(function (p) { return '<span class="chip k-' + sc.st[p.k][1] + '">' + esc(sc.st[p.k][0]) + '</span>'; }).join('') + '</button>'; }).join('')
      + '</div><ul class="chip-legend">' + ['field', 'act', 'wait', 'stale', 'unknown', 'know'].map(function (k) { return '<li><span class="chip k-' + k + '">' + KIND[k] + '</span></li>'; }).join('') + '</ul></div>'
      + '<div class="map-tools">' + cfg.views.map(function (v, i) { return '<button type="button" data-view="' + i + '">' + v[0] + 'を見る</button>'; }).join('')
      + '<button aria-pressed="true" class="active" data-hm-toggle="zones" type="button">勢力の範囲</button><button aria-pressed="false" data-hm-toggle="modern" type="button">現代の地図</button></div>';
    root.querySelector('.js-story').innerHTML = h;
    var q = function (s) { return root.querySelector(s); };

    var hm = createMap(cfg.map, { view: cfg.view, places: cfg.places, mode: cfg.mode });
    var map = hm.map;
    var state = { scene: 0, p: 0, playing: false, person: cfg.people[0].k, raf: 0, last: 0, holdUntil: 0, picked: false };

    var est = cfg.est.map(function (e) { return { from: e.from, to: e.to, line: L.polyline(e.path, { pane: 'routes', color: e.color, weight: 2.5, dashArray: '2 7', opacity: .75, interactive: false }) }; });
    var units = cfg.units.map(function (u) {
      var o = Object.create(u);
      o.marker = L.marker([0, 0], { pane: 'units', interactive: false, keyboard: false, icon: L.divIcon({ className: 'hm-unit hm-' + u.side + (u.small ? ' hm-small' : '') + ' hm-pos-' + (u.pos || 'top'), html: '<i></i><span></span>', iconSize: [0, 0] }) });
      o.trail = L.polyline([], { pane: 'routes', color: C[u.side] || '#3f3a45', weight: u.small ? 3 : 4.5, opacity: .9, interactive: false, lineCap: 'round' });
      o.lastLabel = null; o.curPos = null; return o;
    });
    var ring = L.marker([0, 0], { pane: 'places', interactive: false, keyboard: false, icon: L.divIcon({ className: 'hm-ring', html: '<i></i>', iconSize: [0, 0] }) }).addTo(map);
    var dist = cfg.dist, distLine = null, distLab = null;
    if (dist) {
      distLine = L.polyline([dist.a, dist.b], { pane: 'routes', color: '#3b2f26', weight: 1.2, opacity: .7, dashArray: '1 5', interactive: false });
      distLab = L.marker(along([dist.a, dist.b], dist.at), { pane: 'labels', interactive: false, keyboard: false, icon: L.divIcon({ className: 'hm-label hm-dist', html: '<span>' + dist.text + '</span>', iconSize: [0, 0] }) });
    }
    var cap = document.createElement('div'); cap.className = 'hm-caption'; cap.setAttribute('aria-hidden', 'true'); map.getContainer().appendChild(cap);

    function unitPos(u, s, p) {
      var keys = Object.keys(u.tracks).map(Number).filter(function (k) { return k <= s; });
      if (!keys.length) return null;
      var k = Math.max.apply(null, keys), tr = u.tracks[k];
      if (k < s) return { ll: tr.path[tr.path.length - 1], t: 1, tr: tr, cur: false };
      var a = tr.from || 0, b = tr.to == null ? 1 : tr.to, t = Math.min(1, Math.max(0, (p - a) / (b - a)));
      return { ll: along(tr.path, ease(t)), t: ease(t), tr: tr, cur: true, waiting: p < a };
    }
    function draw() {
      var s = state.scene, p = state.p, mainLL = null;
      est.forEach(function (e) { var on = s >= e.from && s <= e.to; if (on && !map.hasLayer(e.line)) e.line.addTo(map); if (!on && map.hasLayer(e.line)) map.removeLayer(e.line); });
      units.forEach(function (u) {
        var pos = (s >= u.show[0] && s <= u.show[1]) ? unitPos(u, s, p) : null;
        if (!pos || pos.waiting) { if (map.hasLayer(u.marker)) { map.removeLayer(u.marker); map.removeLayer(u.trail); } return; }
        u.marker.setLatLng(pos.ll); if (!map.hasLayer(u.marker)) { u.marker.addTo(map); u.trail.addTo(map); u.lastLabel = null; u.curPos = null; }
        u.trail.setLatLngs(pos.cur && pos.tr.path.length > 1 ? upTo(pos.tr.path, pos.t) : []);
        var html = u.label(s), el = u.marker.getElement();
        if (el && html !== u.lastLabel) { el.querySelector('span').innerHTML = html; el.classList.toggle('hm-nolabel', !html); u.lastLabel = html; }
        if (u.posAt && el) { var want = u.posAt(s); if (u.curPos !== want) { ['top', 'left', 'right', 'bottom'].forEach(function (k) { el.classList.toggle('hm-pos-' + k, k === want); }); u.curPos = want; } }
        if (u.id === 'main') mainLL = pos.ll;
      });
      var f = cfg.scenes[s].focus[state.person], fl = f === 'unit' ? (mainLL || null) : P[f].ll;
      if (fl) ring.setLatLng(fl);
      if (dist) {
        var on = s >= dist.from && s <= (dist.to == null ? 99 : dist.to);
        if (on && !map.hasLayer(distLine)) { distLine.addTo(map); distLab.addTo(map); }
        if (!on && map.hasLayer(distLine)) { map.removeLayer(distLine); map.removeLayer(distLab); }
      }
      q('.js-bar').style.width = ((s + p) / n * 100) + '%';
    }
    function renderText() {
      var sc = cfg.scenes[state.scene], last = state.scene === n - 1;
      cap.innerHTML = '<small>' + esc(sc.when) + '</small>' + (state.scene + 1) + '．' + esc(sc.title) + '<em>' + esc(cfg.banner(sc)) + '</em>';
      q('.js-when').textContent = sc.when; q('.js-title').textContent = (state.scene + 1) + '．' + sc.title; q('.js-text').textContent = sc.text;
      q('.js-ask').textContent = sc.ask; q('.js-src').textContent = sc.src;
      root.querySelectorAll('.trio-row').forEach(function (b) {
        var k = b.dataset.person, on = k === state.person, chip = b.querySelector('.js-chip');
        b.classList.toggle('selected', on); b.setAttribute('aria-pressed', on ? 'true' : 'false');
        chip.textContent = sc.st[k][0]; chip.className = 'chip js-chip k-' + sc.st[k][1]; b.querySelector('.js-who').textContent = sc.who[k];
      });
      root.querySelectorAll('.js-chips button').forEach(function (b) { var on = +b.dataset.scene === state.scene; b.classList.toggle('selected', on); if (on) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current'); });
      root.querySelectorAll('.mx-row').forEach(function (b) { var i = +b.dataset.scene; b.classList.toggle('now', i === state.scene); b.classList.toggle('done', i < state.scene); });
      q('.js-prev').disabled = state.scene === 0; q('.js-next').disabled = last;
      q('.js-play').textContent = state.playing ? 'Ⅱ 一時停止' : (state.p < 1 || state.picked) ? '▶ この場面を再生' : last ? '↺ 最初から再生' : '▶ 次の場面を再生';
    }
    function setScene(i, p, moveView) {
      state.scene = Math.max(0, Math.min(n - 1, i)); state.p = p; state.holdUntil = 0; state.picked = p >= 1;
      if (moveView) hm.fit(cfg.scenes[state.scene].view, true);
      renderText(); draw();
    }
    function stop() { state.playing = false; cancelAnimationFrame(state.raf); renderText(); }
    function tick(now) {
      if (!state.playing) return;
      var dt = Math.min(100, now - (state.last || now)); state.last = now;
      if (state.p < 1) {
        state.p = REDUCED ? 1 : Math.min(1, state.p + dt / MOVE); draw();
        if (state.p >= 1) { state.picked = false; if (!q('.js-auto').checked || state.scene >= n - 1) { stop(); return; } state.holdUntil = now + HOLD; }
      } else if (now >= state.holdUntil) setScene(state.scene + 1, 0, true);
      state.raf = requestAnimationFrame(tick);
    }
    function play() {
      if (state.playing) { stop(); return; }
      if (state.p >= 1) { if (state.picked) setScene(state.scene, 0, false); else if (state.scene === n - 1) setScene(0, 0, true); else setScene(state.scene + 1, 0, true); }
      state.playing = true; state.last = 0; renderText(); state.raf = requestAnimationFrame(tick);
    }
    var chips = q('.js-chips');
    cfg.scenes.forEach(function (sc, i) { var b = document.createElement('button'); b.type = 'button'; b.dataset.scene = i; b.textContent = i + 1; b.title = sc.title; b.setAttribute('aria-label', '場面' + (i + 1) + '：' + sc.title); b.addEventListener('click', function () { stop(); setScene(i, 1, true); }); chips.appendChild(b); });
    root.querySelectorAll('.mx-row').forEach(function (b) { b.addEventListener('click', function () { stop(); setScene(+b.dataset.scene, 1, true); map.getContainer().scrollIntoView({ block: 'center', behavior: REDUCED ? 'auto' : 'smooth' }); }); });
    q('.js-play').addEventListener('click', play);
    q('.js-prev').addEventListener('click', function () { stop(); setScene(state.scene - 1, 1, true); });
    q('.js-next').addEventListener('click', function () { stop(); setScene(state.scene + 1, 1, true); });
    root.querySelectorAll('.trio-row').forEach(function (b) {
      b.addEventListener('click', function () {
        state.person = b.dataset.person; renderText(); draw();
        if (!map.getBounds().pad(-0.08).contains(ring.getLatLng())) hm.fit(cfg.view, true);
      });
    });
    root.querySelectorAll('[data-view]').forEach(function (b) { b.addEventListener('click', function () { hm.fit(cfg.views[+b.dataset.view][1], true); }); });
    document.addEventListener('visibilitychange', function () { if (document.hidden && state.playing) stop(); });
    wireToggles(hm, root);
    setScene(0, 0, false);
    return { hm: hm, state: state, stop: stop, cfg: cfg, jump: function (i) { stop(); setScene(i, 1, true); map.getContainer().scrollIntoView({ block: 'center', behavior: REDUCED ? 'auto' : 'smooth' }); } };
  }

  /* 章が表示されたときに地図を作る（非表示のまま作ると大きさを測れないため） */
  var stories = {};
  function ensureStory(cfg) {
    var box = $(cfg.root); if (!box) return;
    var active = box.closest('section').classList.contains('active'), st = stories[cfg.key];
    if (active) { var first = !st; if (first) st = stories[cfg.key] = createStory(cfg); setTimeout(function () { st.hm.map.invalidateSize(); if (first) st.hm.fit(cfg.scenes[0].view, false); }, 60); }
    else if (st && st.state.playing) st.stop();
  }
  function refresh() {
    var a = $('atlasMap');
    if (a && a.closest('section').classList.contains('active')) { initAtlas(); setTimeout(function () { atlas.map.invalidateSize(); }, 60); }
    ensureStory(LILING); ensureStory(HESHI);
  }
  document.addEventListener('click', function (e) { var b = e.target.closest && e.target.closest('[data-heshi-scene]'); if (!b) return; var sec = $('heshiStory').closest('section'), idx = Array.prototype.indexOf.call(document.querySelectorAll('section.chapter'), sec), i = +b.dataset.heshiScene; if (!sec.classList.contains('active') && window.go) window.go(idx); setTimeout(function () { if (stories.heshi) stories.heshi.jump(i); }, 450); });
  var obs = new MutationObserver(refresh);
  document.querySelectorAll('section.chapter').forEach(function (s) { obs.observe(s, { attributes: true, attributeFilter: ['class'] }); });
  window.addEventListener('resize', function () { if (atlas) atlas.map.invalidateSize(); Object.keys(stories).forEach(function (k) { stories[k].hm.map.invalidateSize(); }); });
  refresh();
  window.SIMA_MAP = { get atlas() { return atlas; }, get campaign() { return stories.liling; }, get heshi() { return stories.heshi; }, P: P, km: km };
})();
