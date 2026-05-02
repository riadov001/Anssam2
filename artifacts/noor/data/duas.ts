export type DuaCategory =
  | "morning"
  | "evening"
  | "sleep"
  | "waking"
  | "eating"
  | "mosque"
  | "travel"
  | "general";

export interface Dua {
  id: string;
  category: DuaCategory;
  arabic: string;
  transliteration: string;
  en: string;
  fr: string;
  tr: string;
  source: string;
}

export const DUAS: Dua[] = [
  // MORNING
  {
    id: "m1",
    category: "morning",
    arabic: "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ",
    transliteration: "Asbahna wa asbahal-mulku lillah, walhamdu lillah",
    en: "We have entered the morning and the entire dominion belongs to Allah, and praise is due to Allah.",
    fr: "Nous avons accueilli le matin et tout le royaume appartient à Allah, et louange à Allah.",
    tr: "Sabaha erdik ve mülk Allah'ındır, hamd Allah'a aittir.",
    source: "Muslim",
  },
  {
    id: "m2",
    category: "morning",
    arabic: "اللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ وَإِلَيْكَ النُّشُورُ",
    transliteration: "Allahumma bika asbahna, wa bika amsayna, wa bika nahya, wa bika namutu wa ilaykan-nushur",
    en: "O Allah, by You we enter the morning and by You we enter the evening, by You we live and by You we die, and to You is the resurrection.",
    fr: "Ô Allah, c'est par Toi que nous entrons dans le matin et le soir, c'est par Toi que nous vivons et mourons, et c'est vers Toi la résurrection.",
    tr: "Allah'ım! Senin adınla sabaha erdik, senin adınla akşama girdik, senin adınla yaşarız ve ölürüz. Diriliş de Sana'dır.",
    source: "Abu Dawud, Tirmidhi",
  },
  {
    id: "m3",
    category: "morning",
    arabic: "سُبْحَانَ اللهِ وَبِحَمْدِهِ",
    transliteration: "Subhana Allahi wa bihamdih",
    en: "Glory be to Allah and praise Him. (Recite 100 times)",
    fr: "Gloire à Allah et louange à Lui. (100 fois)",
    tr: "Allah'ı tesbih eder ve O'na hamd ederim. (100 kez)",
    source: "Bukhari, Muslim",
  },
  {
    id: "m4",
    category: "morning",
    arabic: "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ",
    transliteration: "Allahumma anta Rabbi la ilaha illa anta, khalaqtani wa ana abduka",
    en: "O Allah, You are my Lord, there is no god but You. You created me and I am Your servant.",
    fr: "Ô Allah, Tu es mon Seigneur, il n'y a de dieu que Toi. Tu m'as créé et je suis Ton serviteur.",
    tr: "Allah'ım! Sen benim Rabbimsin. Senden başka ilah yoktur. Sen beni yarattın ve ben senin kulunum.",
    source: "Bukhari",
  },

  // EVENING
  {
    id: "e1",
    category: "evening",
    arabic: "أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ",
    transliteration: "Amsayna wa amsal-mulku lillah, walhamdu lillah",
    en: "We have entered the evening and the entire dominion belongs to Allah, and praise is due to Allah.",
    fr: "Nous avons accueilli le soir et tout le royaume appartient à Allah, et louange à Allah.",
    tr: "Akşama erdik ve mülk Allah'ındır, hamd Allah'a aittir.",
    source: "Muslim",
  },
  {
    id: "e2",
    category: "evening",
    arabic: "اللَّهُمَّ بِكَ أَمْسَيْنَا، وَبِكَ أَصْبَحْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ وَإِلَيْكَ الْمَصِيرُ",
    transliteration: "Allahumma bika amsayna, wa bika asbahna, wa bika nahya, wa bika namutu wa ilaykal-masir",
    en: "O Allah, by You we enter the evening and by You we enter the morning, by You we live and by You we die, and to You is the return.",
    fr: "Ô Allah, c'est par Toi que nous entrons dans le soir et le matin, c'est par Toi que nous vivons et mourons.",
    tr: "Allah'ım! Senin adınla akşama girdik, senin adınla sabaha erdik. Senin adınla yaşar ve ölürüz. Dönüş de Sana'dır.",
    source: "Abu Dawud, Tirmidhi",
  },
  {
    id: "e3",
    category: "evening",
    arabic: "اللَّهُمَّ عَافِنِي فِي بَدَنِي، اللَّهُمَّ عَافِنِي فِي سَمْعِي، اللَّهُمَّ عَافِنِي فِي بَصَرِي",
    transliteration: "Allahumma 'afini fi badani, Allahumma 'afini fi sam'i, Allahumma 'afini fi basari",
    en: "O Allah, grant me health in my body. O Allah, grant me health in my hearing. O Allah, grant me health in my sight.",
    fr: "Ô Allah, accorde-moi la santé dans mon corps. Ô Allah, accorde-moi la santé dans mon ouïe. Ô Allah, accorde-moi la santé dans ma vue.",
    tr: "Allah'ım! Beni bedenimde sağlıklı kıl. Allah'ım! Beni işitmemde sağlıklı kıl. Allah'ım! Beni görmemde sağlıklı kıl.",
    source: "Abu Dawud",
  },

  // SLEEP
  {
    id: "s1",
    category: "sleep",
    arabic: "بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا",
    transliteration: "Bismika Allahumma amutu wa ahya",
    en: "In Your name O Allah, I die and I live.",
    fr: "En Ton nom ô Allah, je meurs et je vis.",
    tr: "Allah'ım! Senin adınla ölür ve yaşarım.",
    source: "Bukhari",
  },
  {
    id: "s2",
    category: "sleep",
    arabic: "اللَّهُمَّ قِنِي عَذَابَكَ يَوْمَ تَبْعَثُ عِبَادَكَ",
    transliteration: "Allahumma qini adhabaka yawma tab'athu ibadak",
    en: "O Allah, protect me from Your punishment on the Day You resurrect Your servants.",
    fr: "Ô Allah, protège-moi de Ton châtiment le jour où Tu ressusciteras Tes serviteurs.",
    tr: "Allah'ım! Kullarını dirilttiğin günde azabından beni koru.",
    source: "Abu Dawud, Tirmidhi",
  },
  {
    id: "s3",
    category: "sleep",
    arabic: "سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ، لَا إِلَهَ إِلَّا أَنْتَ، أَسْتَغْفِرُكَ وَأَتُوبُ إِلَيْكَ",
    transliteration: "Subhanakal-lahumma wa bihamdik, la ilaha illa anta, astaghfiruka wa atubu ilayk",
    en: "Glory be to You O Allah and with Your praise, there is no god but You, I seek Your forgiveness and repent to You.",
    fr: "Gloire à Toi ô Allah et louange, il n'y a de dieu que Toi, je Te demande pardon et me repens à Toi.",
    tr: "Allah'ım! Seni tenzih eder ve sana hamd ederim. Senden başka ilah yoktur. Senden mağfiret diler ve sana tövbe ederim.",
    source: "Nasa'i",
  },

  // WAKING
  {
    id: "w1",
    category: "waking",
    arabic: "الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ",
    transliteration: "Alhamdu lillahil-ladhi ahyana ba'da ma amatana wa ilayhin-nushur",
    en: "All praise is for Allah who gave us life after having taken it from us, and unto Him is the resurrection.",
    fr: "Toute louange est pour Allah qui nous a redonné vie après nous l'avoir prise, et c'est à Lui la résurrection.",
    tr: "Bizi öldürdükten sonra tekrar dirilten Allah'a hamd olsun. Dönüş O'na'dır.",
    source: "Bukhari",
  },
  {
    id: "w2",
    category: "waking",
    arabic: "لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ",
    transliteration: "La ilaha illallahu wahdahu la sharika lah, lahul-mulku wa lahul-hamd",
    en: "There is no god but Allah, alone, without partner, to Him belongs sovereignty and to Him belongs all praise.",
    fr: "Il n'y a de dieu qu'Allah seul, sans associé, à Lui la souveraineté et à Lui toute louange.",
    tr: "Allah'tan başka ilah yoktur. O tektir, ortağı yoktur. Mülk O'nundur, hamd O'nadır.",
    source: "Bukhari, Muslim",
  },

  // EATING
  {
    id: "f1",
    category: "eating",
    arabic: "بِسْمِ اللَّهِ",
    transliteration: "Bismillah",
    en: "In the name of Allah.",
    fr: "Au nom d'Allah.",
    tr: "Allah'ın adıyla.",
    source: "Abu Dawud, Tirmidhi",
  },
  {
    id: "f2",
    category: "eating",
    arabic: "اللَّهُمَّ بَارِكْ لَنَا فِيمَا رَزَقْتَنَا، وَقِنَا عَذَابَ النَّارِ",
    transliteration: "Allahumma barik lana fima razaqtana, wa qina adhaban-nar",
    en: "O Allah, bless us in what You have provided us and protect us from the punishment of the Fire.",
    fr: "Ô Allah, bénis-nous dans ce que Tu nous as accordé et protège-nous du châtiment du feu.",
    tr: "Allah'ım! Bize rızıklandırdığın şeyde bizi mübarek kıl ve bizi ateşin azabından koru.",
    source: "Ibn al-Sunni",
  },
  {
    id: "f3",
    category: "eating",
    arabic: "الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنَا وَسَقَانَا وَجَعَلَنَا مُسْلِمِينَ",
    transliteration: "Alhamdu lillahil-ladhi at'amana wa saqana wa ja'alana muslimin",
    en: "All praise is to Allah who fed us, gave us drink, and made us Muslims.",
    fr: "Toute louange à Allah qui nous a nourris, abreuvés et fait musulmans.",
    tr: "Bizi yediren, içiren ve Müslüman kılan Allah'a hamd olsun.",
    source: "Abu Dawud, Tirmidhi",
  },

  // MOSQUE
  {
    id: "mq1",
    category: "mosque",
    arabic: "اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ",
    transliteration: "Allahumma iftah li abwaba rahmatik",
    en: "O Allah, open the gates of Your mercy for me.",
    fr: "Ô Allah, ouvre-moi les portes de Ta miséricorde.",
    tr: "Allah'ım! Bana rahmet kapılarını aç.",
    source: "Muslim",
  },
  {
    id: "mq2",
    category: "mosque",
    arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ مِنْ فَضْلِكَ",
    transliteration: "Allahumma inni as'aluka min fadlik",
    en: "O Allah, I ask You from Your bounty.",
    fr: "Ô Allah, je Te demande de Ta grâce.",
    tr: "Allah'ım! Senden fazlını/ihsanını isterim.",
    source: "Muslim, Abu Dawud",
  },

  // TRAVEL
  {
    id: "t1",
    category: "travel",
    arabic: "سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ وَإِنَّا إِلَى رَبِّنَا لَمُنْقَلِبُونَ",
    transliteration: "Subhanal-ladhi sakhkhara lana hadha wa ma kunna lahu muqrinin, wa inna ila rabbina lamunqalibun",
    en: "Glory be to Him Who has subjected this to us, and we were not capable of subjecting it, and to our Lord is our return.",
    fr: "Gloire à Celui qui nous a soumis ceci alors que nous n'étions pas capables de le maîtriser, et c'est vers notre Seigneur que nous retournons.",
    tr: "Bunu bize musahhar kılan Allah'ı tenzih ederiz. Onu kendiliğimizden yönetemezdik. Biz elbette Rabbimize döneceğiz.",
    source: "Muslim",
  },
  {
    id: "t2",
    category: "travel",
    arabic: "اللَّهُمَّ إِنَّا نَسْأَلُكَ فِي سَفَرِنَا هَذَا الْبِرَّ وَالتَّقْوَى",
    transliteration: "Allahumma inna nas'aluka fi safarina hadhal-birra wat-taqwa",
    en: "O Allah, we ask You on this our journey for goodness and piety.",
    fr: "Ô Allah, nous Te demandons dans ce voyage la bonté et la piété.",
    tr: "Allah'ım! Bu yolculuğumuzda senden iyilik ve takva istiyoruz.",
    source: "Muslim",
  },

  // GENERAL
  {
    id: "g1",
    category: "general",
    arabic: "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ",
    transliteration: "Rabbana atina fid-dunya hasanatan wa fil-akhirati hasanatan wa qina adhaban-nar",
    en: "Our Lord, grant us good in this world and good in the Hereafter and protect us from the punishment of the Fire.",
    fr: "Notre Seigneur, accorde-nous le bien dans ce monde et le bien dans l'au-delà et protège-nous du châtiment du Feu.",
    tr: "Rabbimiz! Bize dünyada iyilik ver, ahirette de iyilik ver. Bizi ateş azabından koru.",
    source: "Quran 2:201",
  },
  {
    id: "g2",
    category: "general",
    arabic: "اللَّهُمَّ اغْفِرْ لِي، وَارْحَمْنِي، وَاهْدِنِي، وَعَافِنِي، وَارْزُقْنِي",
    transliteration: "Allahummaghfir li, warhamni, wahdini, wa'afini, warzuqni",
    en: "O Allah, forgive me, have mercy on me, guide me, grant me health, and provide for me.",
    fr: "Ô Allah, pardonne-moi, fais-moi miséricorde, guide-moi, accorde-moi la santé et pourvois à mes besoins.",
    tr: "Allah'ım! Beni bağışla, bana merhamet et, beni doğruya ilet, bana afiyet ver ve bana rızık ver.",
    source: "Muslim",
  },
  {
    id: "g3",
    category: "general",
    arabic: "حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ",
    transliteration: "Hasbunallahu wa ni'mal-wakil",
    en: "Allah is sufficient for us and He is the best Disposer of affairs.",
    fr: "Allah nous suffit et Il est le meilleur des gardiens.",
    tr: "Allah bize yeter. O ne güzel vekil!",
    source: "Quran 3:173",
  },
  {
    id: "g4",
    category: "general",
    arabic: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ",
    transliteration: "Allahumma inni a'udhu bika minal-hammi wal-hazan",
    en: "O Allah, I seek refuge in You from worry and grief.",
    fr: "Ô Allah, je cherche refuge en Toi contre le souci et le chagrin.",
    tr: "Allah'ım! Sana sıkıntıdan ve üzüntüden sığınırım.",
    source: "Bukhari",
  },
  {
    id: "g5",
    category: "general",
    arabic: "لَا إِلَهَ إِلَّا أَنْتَ سُبْحَانَكَ إِنِّي كُنْتُ مِنَ الظَّالِمِينَ",
    transliteration: "La ilaha illa anta subhanaka inni kuntu minaz-zalimin",
    en: "There is no god but You, glory be to You, indeed I have been of the wrongdoers.",
    fr: "Il n'y a de dieu que Toi, gloire à Toi, j'ai vraiment été parmi les injustes.",
    tr: "Senden başka ilah yoktur. Seni tenzih ederim. Gerçekten ben zalimlerden oldum.",
    source: "Quran 21:87 - Dua of Yunus (AS)",
  },
];

export const DUA_CATEGORIES: DuaCategory[] = [
  "morning",
  "evening",
  "sleep",
  "waking",
  "eating",
  "mosque",
  "travel",
  "general",
];
