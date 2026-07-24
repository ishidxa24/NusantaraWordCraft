export const segmenForest = [
    {
        nama: 'Forest 1',
        mapKey: 'map_hutan',
        mapFile: 'assets/background/Forest/AssetForest/Forest1.tmj',
        spawnX: 150, spawnY: 100,   // F1: sengaja jatuh dari langit (sesuai cerita)
        exitX: 4290,
        next: 1,
        tilesets: [
            { nama: 'Tiles_rumput', key: 'f1_tiles',  file: 'assets/background/Forest/AssetForest/Tiles.png' },
            { nama: 'pohon',        key: 'f1_pohon',  file: 'assets/background/Forest/AssetForest/Tree-Assets.png' },
            { nama: 'pohon2',       key: 'f1_pohon2', file: 'assets/background/Forest/Trees/Green-Tree.png' }
        ],
        layerCollision: ['Tanah'],
        layerHias: ['pohon2', 'pohon1', 'semak2', 'semak1'],
        layerHiasDepan: [],
        zonaAir: [
            { x1: 1080, x2: 1404, batas: 650 },
            { x1: 1620, x2: 1800, batas: 650 },
            { x1: 1908, x2: 2088, batas: 650 },
            { x1: 2196, x2: 2412, batas: 650 },
            { x1: 2520, x2: 2664, batas: 650 },
            { x1: 2700, x2: 2736, batas: 650 },
            { x1: 2844, x2: 2916, batas: 650 }
        ],
        npcSprites: [
            { key: 'npc_gandalf', file: 'assets/bot/MapForest/Npc/npc-gandalf.png', frameW: 64, frameH: 64, frames: 13 }
        ],
        npc: [
            {
                x: 300,
                sprite: 'npc_gandalf',
                namaNpc: 'Nawang Wulan',
                dialog: [
                    'Jatuh dari langit yang bahkan tak lagi kuingat warnanya... dan tetap bangkit. Kukira hutan ini sudah benar-benar dilupakan semua orang.',
                    'Namaku Nawang Wulan, penjaga hutan ini. Sudah lama aku menanti seseorang yang masih sanggup mengingat.',
                    'Kau tak ingat apa-apa, bukan? Bahkan namamu, juga asalmu. Tenang — itu kutukan hutan ini, bukan salahmu.',
                    'Lihat percikan cahaya yang berpendar di sekitarku. Itu bukan sekadar kemilau, melainkan serpihan ingatan hutan yang tercecer: nama benda, makna kata, semua yang pernah kau ingat.',
                    'Setiap kali kau mengingat sebuah kata dengan benar, satu serpihan Cahaya kembali kepadamu. Kumpulkan cukup banyak, dan dirimu akan pulih perlahan.',
                    'Aku akan menemanimu sepanjang perjalanan. Di tiap persinggahan aku muncul untuk mengujimu dan menuntunmu — akulah pemandumu.',
                    'Dan kau tak boleh terus melangkah tanpa nama. Kau datang justru untuk mengingat, saat semua memilih lupa... maka izinkan aku menamaimu.',
                    'Mulai kini, namamu Kirana — cahaya kecil yang menolak padam. Ingatlah nama itu, sebab nama itu pemberianku.',
                    'Sekarang, ujian pertamamu, Kirana. Kumpulkan Cahaya dengan mengingat kata-kata yang benar.'
                ],
                dialogSelesai: [
                    'Hebat, Kirana... tiap Cahaya yang kembali seperti kepingan dirimu yang pulih. Lihat, warna hutan mulai hidup kembali.',
                    'Gerbang di depan sudah terbuka. Aku akan menunggumu di persinggahan berikutnya.'
                ]
            }
        ]
    },
    {
        nama: 'Forest 2',
        mapKey: 'map_hutan2',
        mapFile: 'assets/background/Forest/AssetForest/Forest2.tmj',
        spawnX: 20, spawnY: 480, jalanMasukX: 150,
        exitX: 4230,
        next: 'StartForest3',
        tilesets: [
            { nama: 'Pohon',        key: 'f2_pohon',    file: 'assets/background/Forest/Trees/Dark-Tree.png' },
            { nama: 'Tiles_rumput', key: 'f2_tiles',    file: 'assets/background/Forest/AssetForest/Tiles.png' },
            { nama: 'Rock',         key: 'f2_rock',     file: 'assets/background/Forest/AssetForest/Props-Rocks.png' },
            { nama: 'Building',     key: 'f2_building', file: 'assets/background/Forest/AssetForest/Buildings.png' }
        ],
        layerCollision: ['Tanah', 'daratan atas', 'jembatan', 'pijakan batu'],
        layerHias: ['Latar', 'pohon', 'pohon2', 'Semak1', 'Semak2', 'Dekorasi_belakang_semak'],
        zonaAir: [
            { x1: 324,  x2: 648,  batas: 600 },
            { x1: 1476, x2: 1620, batas: 600 },
            { x1: 2952, x2: 3096, batas: 600 },
            { x1: 3348, x2: 3384, batas: 600 },
            { x1: 3708, x2: 3816, batas: 600 },
            { x1: 4068, x2: 4176, batas: 600 }
        ],
        npcSprites: [
            { key: 'npc_gandalf', file: 'assets/bot/MapForest/Npc/npc-gandalf.png', frameW: 64, frameH: 64, frames: 13 }
        ],
        npc: [
            {
                x: 1401,
                y: 128,   // ATUR posisi Nawang Wulan F2 di sini (x & y) sampai napak di pijakan
                idle: true,
                flip: true,
                sprite: 'npc_gandalf',
                namaNpc: 'Nawang Wulan',
                dialog: [
                    'Kita bertemu lagi, Kirana. Seperti kataku — aku akan selalu ada di tiap persinggahan.',
                    'Kau melangkah lebih jauh dari yang kuduga. Tapi warna hutan makin tipis, dan ada yang harus kuceritakan sebelum terlambat.',
                    'Yang merenggut cahaya hutan ini bernama Kanjeng Ratu Sirna. Dahulu ia penjaga hutan sepertiku — kami menjaga tempat ini bersama.',
                    'Tapi ia kehilangan seseorang yang amat dikasihinya. Kesedihannya begitu dalam hingga ia memilih melupakan segalanya.',
                    'Ia meyakini bahwa lupa bisa menghapus luka, maka seluruh dunia harus ikut lupa. Itulah "kedamaian" yang ia paksakan.',
                    'Ia tak jahat, Kirana. Ia hanya ingin berhenti merasa sakit. Tapi niatnya tetap berbahaya — makin banyak yang lupa kosakata, makin kuat ia.',
                    'Karena itu ingatanmu adalah senjata. Soal di sini lebih berat: bukan sekadar kata, tapi makna di baliknya. Tunjukkan kau masih mengingatnya.'
                ],
                dialogSelesai: [
                    'Luar biasa, Kirana. Tiap jawabanmu seperti pelita kecil yang menolak padam.',
                    'Di balik gerbang ini kau tak akan sendirian lagi — para abdi Sirna telah menunggu. Bersiaplah.',
                    'Aku tak bisa menemanimu lebih jauh. Tapi ingat: selama kau tak lupa, ia tak akan pernah benar-benar menang.'
                ]
            }
        ]
    }
];

// ===== DIALOG CERITA (cutscene) =====
export const dialogForest = {
    // Forest 1: MONOLOG MC setelah mendarat (MC belum bernama → label '???')
    f1Monolog: [
        'Ugh... kepalaku... Oh. Di mana ini?',
        'Hutan? Kenapa warnanya seperti... pudar. Sunyi sekali.',
        'Aku... siapa aku? Kenapa aku tak ingat apa-apa? Namaku pun tidak...',
        'Bagaimana aku bisa sampai di sini? Apa yang terjadi padaku?',
        'Tenang... tenang. Pasti ada jalan. Aku harus mencari tahu.'
    ],

    // Forest 2: pertemuan pertama Kanjeng Ratu Sirna (cutscene setelah quiz)
    f2Countess: [
        { nama: 'Kanjeng Ratu Sirna', teks: 'Hmm... ada bau ingatan yang baru terbangun di hutanku. Lama sekali tak kucium yang seharum ini.' },
        { nama: 'Kanjeng Ratu Sirna', teks: 'Seorang anak kecil... berjalan sambil memungut kata-kata yang sudah lama kubuang. Manis sekali.' },
        { nama: 'Kirana',             teks: 'Kau... entah kenapa aku merasa pernah mengenalmu. Kenapa hutan ini jadi kelabu?' },
        { nama: 'Kanjeng Ratu Sirna', teks: 'Kelabu? Oh, tidak, sayang. Ini damai. Tanpa kata, tanpa nama, tanpa ingatan yang menyakitkan. Aku hanya... merapikannya.' },
        { nama: 'Kirana',             teks: 'Tidak. Ini bukan damai, ini sunyi. Aku akan mengembalikan semuanya — setiap kata, setiap warna.' },
        { nama: 'Kanjeng Ratu Sirna', teks: 'Hihi... berani sekali, untuk yang bahkan namanya pun baru saja diberikan orang lain. Baiklah, buktikan, anak kecil.' },
        { nama: 'Kanjeng Ratu Sirna', teks: 'Lewati dulu para abdiku. Bila kau masih ingat siapa dirimu saat tiba di puncak... barulah kita bermain sungguhan.' },
        { nama: 'Kanjeng Ratu Sirna', teks: 'Sampai jumpa di atas sana~' },
    ],

    // Forest 3: pembuka (abdi Sirna menghadang)
    f3Intro: [
        { nama: 'Abdi Sirna', teks: 'Berhenti di situ, anak kecil. Tuan kami sudah memperingatkan kami soal kau.' },
        { nama: 'Kirana',     teks: 'Kalian... makhluk yang merenggut warna hutan ini. Minggir, aku harus terus maju.' },
        { nama: 'Abdi Sirna', teks: 'Maju? Hihi. Tak ada yang melewati kami dan tetap mengingat namanya sendiri.' },
        { nama: 'Abdi Sirna', teks: 'Akan kami pastikan kau lupa — lupa jalan pulang, lupa siapa dirimu, lupa segalanya!' },
        { nama: 'Kirana',     teks: 'Kalau begitu akan kubuktikan: ingatan yang kuperjuangkan jauh lebih kuat dari kegelapan kalian.' },
    ],

    // Forest 3: penutup (Nawang Wulan muncul setelah combat) — ungkap masa lalu mereka berdua
    f3Npc: [
        { nama: 'Nawang Wulan', teks: 'Kirana! Syukurlah kau selamat... para abdi Sirna semakin berani belakangan ini.' },
        { nama: 'Kirana',       teks: 'Mereka menyebut nama "Sirna" sebelum lenyap. Nawang... dia benar-benar mengenalku, ya?' },
        { nama: 'Nawang Wulan', teks: 'Ya. Dan itu membuatnya takut. Makin kau mengingat, makin ia merasa terancam — sebab kau membuktikan bahwa lupa bukan satu-satunya jalan.' },
        { nama: 'Nawang Wulan', teks: 'Dahulu aku dan Sirna menjaga hutan ini bersama. Aku masih menyimpan harapan untuknya. Tapi harapan itu... ada di tanganmu sekarang.' },
        { nama: 'Nawang Wulan', teks: 'Teruslah maju, Kirana. Dan jangan biarkan dirimu lupa untuk apa kau berjuang.' },
    ],

    // Forest 4: Nawang Wulan di ujung desa — ungkap siapa yang Sirna kehilangan + kekuatan knight
    f4Magic: [
        { nama: 'Nawang Wulan', teks: 'Berhenti sejenak, Kirana. Ada hal yang tak sempat kuceritakan — dan kau berhak tahu sebelum ke puncak.' },
        { nama: 'Nawang Wulan', teks: 'Yang membuat Sirna menjadi seperti ini adalah kehilangan muridnya sendiri. Anak yang ia latih dan ia sayangi seperti anak kandung.' },
        { nama: 'Kirana',       teks: 'Muridnya...? Lalu ia memilih menghapus dunia agar tak lagi merasa kehilangan?' },
        { nama: 'Nawang Wulan', teks: 'Begitulah duka bekerja bila dibiarkan menang. Karena itu, Kirana — jangan datang dengan kebencian. Datanglah dengan ingatan.' },
        { nama: 'Nawang Wulan', teks: 'Dan dengar baik-baik: saat kau merasa terdesak nanti, panggil semua yang telah kau ingat. Ingatan itu akan menjelma — menjadi baju zirah, menjadi pedang cahaya.' },
        { nama: 'Kirana',       teks: 'Kekuatan yang berasal dari semua yang kupelajari?' },
        { nama: 'Nawang Wulan', teks: 'Ya. Ilmu adalah perisai bagi yang mengingat, dan racun bagi yang melupakan. Kaulah buktinya.' },
        { nama: 'Nawang Wulan', teks: 'Pergilah ke puncak. Sirna menanti. Kali ini kau tak akan menghadapinya dengan tangan kosong.' },
    ],

    // Forest 4: archer penjaga desa (opsional)
    f4Archer: [
        { nama: 'Penjaga Desa', teks: 'Hei, kau yang dikirim Nawang Wulan? Kami para pemanah menjaga tepi desa ini siang dan malam.' },
        { nama: 'Penjaga Desa', teks: 'Sejak kegelapan menyebar, makin banyak makhluk aneh mendekat. Tapi selama api pengetahuan menyala, kami tak akan mundur.' },
        { nama: 'Kirana',       teks: 'Kalian menjaga tempat ini dengan gagah. Aku akan pastikan pengorbanan kalian tak sia-sia.' },
        { nama: 'Penjaga Desa', teks: 'Pergilah ke puncak, Kirana. Bawa kembali warna hutan kami. Kami akan menahan garis ini.' },
    ],

    // Forest 5: intro (ketemu Sirna di puncak) — diawali TAWA (Countess_laugh.mp3 diputar di sini)
    f5Intro: [
        { nama: 'Kanjeng Ratu Sirna', teks: 'Hihihi... ahahahaha! Dengar, hutanku... langkah kecil yang berisik itu akhirnya sampai juga.' },
        { nama: 'Kanjeng Ratu Sirna', teks: 'Kau sampai juga ke puncak hutanku... Kirana yang keras kepala.' },
        { nama: 'Kirana',             teks: 'Aku tahu kisahmu, Sirna. Aku tahu kau merasa kehilangan. Tapi ini bukan jalannya!' },
        { nama: 'Kanjeng Ratu Sirna', teks: 'Jangan sebut dia. JANGAN. Kau tak tahu apa-apa soal kehilangan, anak kecil.' },
        { nama: 'Kanjeng Ratu Sirna', teks: 'Bangkitlah, para abdiku. Bangkitlah, yang telah lama dilupakan... hentikan dia.' },
        { nama: 'Kanjeng Ratu Sirna', teks: 'Bila kau sanggup melewati mereka semua, barulah kita bicara. Sampai jumpa~' },
    ],

    // Forest 5: bangkit (semua bawahan kalah, Sirna maju sendiri)
    f5Bangkit: [
        { nama: 'Kanjeng Ratu Sirna', teks: '...Seluruh abdiku. Kau kalahkan mereka semua?!' },
        { nama: 'Kirana',             teks: 'Di tiap langkahku aku mengingat lebih banyak. Dan tiap ingatan itu membuat kegelapanmu memudar.' },
        { nama: 'Kanjeng Ratu Sirna', teks: 'Hmph. Kau memang mengingatkanku padanya. Itulah yang paling kutakuti.' },
        { nama: 'Kanjeng Ratu Sirna', teks: 'Akan kuhentikan kau sendiri — sebelum kau membangunkan hal yang mati-matian kukubur!' },
    ],

    // Forest 5: TRANSFORMASI DARURAT — HP Kirana habis, ingatan menjelma jadi zirah (janji Nawang Wulan di F4)
    f5Transform: [
        { nama: 'Kirana',             teks: 'Ugh... tidak... aku tak boleh tumbang di sini...' },
        { nama: 'Kirana',             teks: 'Eh...? Tubuhku... bercahaya? Hangat... kenapa aku merasa... kuat?' },
        { nama: 'Kirana',             teks: 'Baju zirah? Pedang cahaya? Aku... berubah?! Apa yang terjadi padaku?!' },
        { nama: 'Kirana',             teks: '...Ah. Kata-kata Nawang Wulan. "Saat kau paling terdesak, panggil semua yang telah kau ingat."' },
        { nama: 'Kirana',             teks: 'Jadi ini wujudnya... Setiap kata yang kuingat, setiap Cahaya yang kukumpulkan — semuanya menjelma jadi kekuatan ini!' },
        { nama: 'Kanjeng Ratu Sirna', teks: 'Cahaya itu... tidak mungkin. TIDAK MUNGKIN! Wujud itu... sama seperti DIA dulu...!' },
    ],

    // Forest 5: kalah (Sirna tumbang → menuju F6) — bukan dikalahkan, tapi diingatkan
    f5Kalah: [
        { nama: 'Kanjeng Ratu Sirna', teks: 'Tidak mungkin... tiap kata yang kau ingat... membakar kegelapan yang kubangun...' },
        { nama: 'Kirana',             teks: 'Aku tak mengalahkanmu, Sirna. Aku hanya... mengingat untukmu. Termasuk dia yang kau sayangi.' },
        { nama: 'Kanjeng Ratu Sirna', teks: 'Kau... membuatku mengingat wajahnya lagi. Senyumnya. Suaranya saat memanggil namaku. Semua yang mati-matian kukubur...' },
        { nama: 'Kanjeng Ratu Sirna', teks: 'Hihi... hihihi... lucu sekali. Dulu aku menertawakan mereka yang menangis karena ingatan. Sekarang... aku yang ingin menangis.' },
        { nama: 'Kirana',             teks: 'Menangislah, Sirna. Mengingat memang menyakitkan. Tapi hanya dari sanalah luka bisa mulai sembuh.' },
        { nama: 'Kanjeng Ratu Sirna', teks: 'Anak yang aneh... kau datang untuk melawanku, tapi malah mengembalikan hal yang paling kutakuti — dan paling kurindukan.' },
        { nama: 'Kanjeng Ratu Sirna', teks: 'Mungkin... melupakan memang bukan cara menyembuhkan luka. Pergilah, Kirana. Kembalikan warna hutan ini... dan terima kasih.' },
    ],

    // Forest 6: archer penjaga (opsional, sebelum Nawang Wulan)
    f6Archer: [
        { nama: 'Penjaga Desa', teks: 'Kau... kaulah yang mendaki puncak itu, kan? Kami melihat kegelapan di atas sana sirna semalam.' },
        { nama: 'Penjaga Desa', teks: 'Bertahun-tahun kami menunggu seseorang yang berani mengingat kembali. Ternyata kau jawabannya, Kirana.' },
        { nama: 'Kirana',       teks: 'Aku hanya melakukan yang kubisa. Mengingat, satu kata demi satu kata.' },
        { nama: 'Penjaga Desa', teks: 'Dan itu sudah lebih dari cukup. Nawang Wulan menunggumu di depan. Pergilah — hutan ini ingin berterima kasih padamu.' },
    ],

    // Forest 6: ending — Kirana (masih wujud knight) kembalikan Cahaya
    f6Ending: [
        { nama: 'Nawang Wulan', teks: 'Kau kembali, Kirana... dan lihat dirimu. Zirah cahaya itu — kau memanggilnya di saat paling terdesak, persis seperti kataku dulu.' },
        { nama: 'Nawang Wulan', teks: 'Dan kegelapan di puncak sudah sirna. Ratu Sirna... akhirnya membiarkan dirinya berduka.' },
        { nama: 'Kirana',       teks: 'Aku membawa semua yang kukumpulkan. Setiap kata, setiap nama, setiap Cahaya yang kutemukan di jalan.' },
        { nama: 'Nawang Wulan', teks: 'Maka kembalikanlah, nak. Serahkan Cahaya itu pada hutan. Biarkan ia mengingat kembali warnanya sendiri.' },
        { nama: 'Kirana',       teks: 'Untuk hutan ini... dan untuk semua yang pernah melupakannya. Kukembalikan semuanya.' },
    ],

    // Forest 6: Nawang Wulan membantu Kirana kembali ke wujud asli (SEBELUM transformasi balik)
    f6Kembali1: [
        { nama: 'Nawang Wulan', teks: 'Tugas zirah itu telah usai, Kirana. Kemarilah... biar kubantu melepasnya.' },
        { nama: 'Nawang Wulan', teks: 'Jangan khawatir — kekuatan itu tak akan hilang. Ia hanya kembali tidur di dalam ingatanmu, menunggu bila kau membutuhkannya lagi.' },
    ],

    // Forest 6: sesudah transformasi balik → lanjut fajar
    f6Kembali2: [
        { nama: 'Kirana',       teks: 'Terasa hangat... seperti melepas selimut setelah malam yang sangat panjang.' },
        { nama: 'Nawang Wulan', teks: 'Itulah dirimu yang sesungguhnya — kecil, tapi tak pernah padam. Sekarang, lihatlah ke timur, Kirana. Fajar datang.' },
        { nama: 'Nawang Wulan', teks: 'Selama masih ada yang mau belajar dan mengingat... hutan ini takkan pernah benar-benar gelap lagi. Terima kasih, Kirana.' },
    ],
};

// ============================================================
// KONFIGURASI SCENE F3–F6
// ============================================================
const A_  = 'assets/background/Forest/AssetForest/';
const A4_ = A_ + 'assetForest4/';

// ===== FOREST 3 — combat abdi Sirna =====
export const cfgForest3 = {
    nama: 'Forest 3 - Pertempuran Pertama',
    mapKey: 'map_hutan3',
    mapFile: A_ + 'Forest3.tmj',
    scale: 2.25,
    spawnX: 20, spawnY: 480,
    jalanMasukX: 150,

    next: 'StartForest4',
    exitX: 7000,
    introX: 700,

    suasana: {
        langit: '#0b081a',                        // langit malam pekat keunguan
        bulan: {
            x: 0.72, y: 0.16, r: 36,
            warna: 0xc4756a,                      // bulan merah pucat (blood moon)
            halo: [ { r: 58, a: 0.22 }, { r: 88, a: 0.10 }, { r: 126, a: 0.05 } ],
        },
        bintang: { jumlah: 16, yMaks: 0.45, rMin: 0.8, rMaks: 1.6, alphaMaks: 0.5, kedip: true },
        kabut: { jumlah: 6, warna: 0x9a9ab8, alpha: 0.06, wMin: 260, wMaks: 480, yMin: 0.35, yMaks: 0.75 },
        hujan: { alpha: 0.35, kecepatan: 480, miring: -45, volume: 0.15 },
        gelap: { warna: 0x0e0c20, alpha: 0.48 },  // overlay MULTIPLY (pengganti 2 rectangle lama)
        kilat: { min: 7000, max: 16000, warna: [150, 120, 210] },  // flash ungu tiap 7-16 detik
    },

    tilesets: [
        { nama: 'Tiles_rumput', key: 'f3_tiles',  file: A_ + 'Tiles.png' },
        { nama: 'rumah',        key: 'f3_rumah',  file: A_ + 'Buildings.png' },
        { nama: 'pohon',        key: 'f3_pohon',  file: A_ + 'Tree-Assets.png' },
        { nama: 'pohon2',       key: 'f3_pohon2', file: 'assets/background/Forest/Trees/Green-Tree.png' }
    ],
    layerHias: [
        'pohon2', 'pohon3', 'pohon',
        'rumah2/tembok2', 'rumah2/atap_rumah2', 'rumah2/jendela2', 'rumah2/pintu2',
        'rumah1/tembok', 'rumah1/atap_rumah', 'rumah1/jendela', 'rumah1/pintu',
        'semak', 'semak2', 'Jamur'
    ],
    layerCollision: ['Daratan', 'Daratan_batu', 'Daratan_batu2', 'pijakan_melayang'],

    zonaJurang: [
        { x1: 180,  x2: 432,  batas: 650 },
        { x1: 1260, x2: 2664, batas: 650 },
        { x1: 3708, x2: 3924, batas: 650 },
        { x1: 5256, x2: 5760, batas: 650 }
    ],

    attack: { w: 70, h: 64, offsetY: -10, durasi: 220, damage: 1, cooldown: 420 },
    iframe: 800,
    hp: { max: 100, damage: 20, jurang: 34 },

    musuh: [
        { tipe: 'pelayan', x: 900  },
        { tipe: 'pelayan', x: 3200 },
        { tipe: 'pelayan', x: 4400 },
        { tipe: 'pelayan', x: 4900 },
    ],
    musuhY: 200,

    npcSprite: 'npc_gandalf',
};

// ===== FOREST 4 — desa + puzzle + perahu =====
export const cfgForest4 = {
    nama: 'Forest 4 - Desa',
    mapKey: 'map_hutan4',
    mapFile: A_ + 'Forest4.tmj',
    spawnX: 20, spawnY: 480,
    jalanMasukX: 150,
    next: 'StartForest5',
    penyihirX: 6950,
    penyihirY: 490,
    triggerPenyihir: 6820,
    exitX: 7080,

    bulan: { x: 1080, y: 110, radius: 46, warna: 0xf6f2d5, scroll: 0.1, depth: -2 },

    tilesets: [
        { nama: 'Tiles_rumput', key: 'f4_tiles',   file: A_ + 'Tiles.png' },
        { nama: 'rumah',        key: 'f4_rumah',   file: A_ + 'Buildings.png' },
        { nama: 'pohon',        key: 'f4_pohon',   file: A_ + 'Tree-Assets.png' },
        { nama: 'pohon2',       key: 'f4_pohon2',  file: 'assets/background/Forest/Trees/Green-Tree.png' },
        { nama: 'awan',         key: 'f4_awan',    file: A4_ + '2.png' },
        { nama: 'aset_random',  key: 'f4_decor',   file: A4_ + 'Decor.png' },
        { nama: 'big_tent',     key: 'f4_tent',    file: A4_ + 'Large_Tent.png' },
        { nama: 'patung',       key: 'f4_patung',  file: A4_ + 'Angel_Statue.png' }
    ],
    layerHias: [
        'pohon', 'pohon2', 'meja', 'dekorasi_random', 'dekorasi_kayu2', 'dekorasi_kayu',
        'semak2', 'semak', 'batu', 'patung', 'tembok2', 'tembok',
        'jendela', 'atap', 'atap2', 'pintu', 'tenda_kecil'
    ],
    layerCollision: ['daratan'],
    zonaAir: [
        { x1: 180,  x2: 432,  batas: 650 },
        { x1: 3528, x2: 6624, batas: 650 }
    ],
    perahu: { x1: 3520, x2: 6680, y: 560, durasi: 5000, offset: 52 },
    air: { atas: 576 },
    archer:  [ { x: 1818, y: 490 }, { x: 2400, y: 490, flip: true } ],
    cooking: { x: 2050, y: 500 },
    npcSprites: [
        { key: 'npc_gandalf', file: 'assets/bot/MapForest/Npc/npc-gandalf.png', frameW: 64, frameH: 64, frames: 13 }
    ],
    npc: [
        {
            x: 800, y: 490,
            sprite: 'npc_gandalf',
            namaNpc: 'Nawang Wulan',
            dialog: [
                'Kita bertemu lagi, Kirana. Kau berhasil melewati para abdi Sirna — tak banyak yang sanggup sejauh ini.',
                'Desa ini cahaya terakhir sebelum puncak. Di sini pun aku bisa merasakan ingatanmu makin terang, makin kuat.',
                'Sebelum kau lanjut, izinkan aku mengujimu sekali lagi. Pecahkan teka-tekiku — buktikan ingatanmu masih utuh.'
            ],
            dialogSelesai: [
                'Sempurna, Kirana. Tiap jawaban benar adalah secercah Cahaya yang kau kembalikan ke hutan ini.',
                'Aku akan menunggumu di ujung desa, di tepi sungai. Ada hal penting yang harus kusampaikan sebelum kau menyeberang.'
            ]
        }
    ]
};

// ===== FOREST 5 — puncak: horde + boss + knight =====
export const cfgForest5 = {
    nama: 'Forest 5 - Puncak',
    mapKey: 'map_hutan5',
    mapFile: A_ + 'Forest5.tmj',
    scale: 2.25,
    spawnX: 20, spawnY: 480,
    jalanMasukX: 150,

    next: 'StartForest6',

    introX:   500,
    introLift: 90,
    bangkitX: 6300,
    arenaX:   6950,
    arenaY:   300, 

    suasana: {
        langit: '#0a040f',                        // nyaris hitam, semburat ungu
        bulan: {
            x: 0.68, y: 0.14, r: 46,
            warna: 0xb84a4a,                      // bulan darah pekat (lebih merah dari F3)
            halo: [ { r: 72, a: 0.26 }, { r: 108, a: 0.13 }, { r: 155, a: 0.06 } ],
        },
        // tanpa bintang — langit puncak sudah ditelan kegelapan
        kabut: { jumlah: 9, warna: 0x6a5a8a, alpha: 0.08, wMin: 300, wMaks: 560, yMin: 0.30, yMaks: 0.80 },
        hujan: { alpha: 0.35, kecepatan: 480, miring: -45, volume: 0.15 },
        gelap: { warna: 0x140a1e, alpha: 0.38 },
        denyut: { alphaMaks: 0.65, durasi: 2600 },            // kegelapan "bernapas"
        kilat: { min: 5000, max: 11000, warna: [200, 50, 50] }, // kilat merah, lebih sering
    },

    tilesets: [
        { nama: 'Tiles_rumput', key: 'f5_tiles',  file: A_ + 'Tiles.png' },
        { nama: 'rumah',        key: 'f5_rumah',  file: A_ + 'Buildings.png' },
        { nama: 'pohon',        key: 'f5_pohon',  file: A_ + 'Tree-Assets.png' },
        { nama: 'pohon2',       key: 'f5_pohon2', file: 'assets/background/Forest/Trees/Green-Tree.png' },
        { nama: 'awan',         key: 'f5_awan',   file: A4_ + '2.png' },
        { nama: 'aset_random',  key: 'f5_decor',  file: A4_ + 'Decor.png' },
        { nama: 'big_tent',     key: 'f5_tent',   file: A4_ + 'Large_Tent.png' },
        { nama: 'patung',       key: 'f5_patung', file: A4_ + 'Angel_Statue.png' },
    ],

    layerHias: ['pohon', 'pohon2', 'semak_dekorasi2', 'semak_dekorasi',
                'batu_dekorasi', 'patung_dekorasi', 'grave_dekorasi'],
    layerCollision: ['daratan', 'daratan2', 'daratan3', 'daratan4', 'daratan5'],

    zonaJurang: [
        { x1: 216,  x2: 540,  batas: 650 },
        { x1: 3240, x2: 3780, batas: 650 },
        { x1: 6156, x2: 6696, batas: 650 },
    ],

    attack: { w: 70, h: 64, offsetY: -10, durasi: 220, damage: 1, cooldown: 420 },
    knight: { damage: 3, heal: 40, reviveHp: 60, defendReduksi: 0.3 },
    

    knightCombo: {
        resetMs: 800,
        langkah: [
            { anim: 'knight_atk1', dmg: 3, reach: 70, durasi: 240, cooldown: 240 },
            { anim: 'knight_atk2', dmg: 3, reach: 95, durasi: 240, cooldown: 240 },
            { anim: 'knight_atk3', dmg: 5, reach: 82, durasi: 300, cooldown: 360 },
        ],
    },

    iframe: 800,
    hp: { damage: 20, jurang: 34 },

    musuh: [
        { tipe: 'zombie',   x: 1100 },
        { tipe: 'zombie',   x: 1450 },
        { tipe: 'pelayan',  x: 2600 },
        { tipe: 'zombie',   x: 3950 },
        { tipe: 'pelayan',  x: 4350 },
        { tipe: 'pelayan',  x: 5200 },
        { tipe: 'zombie',   x: 5550 },
        { tipe: 'countess', x: 6950, boss: true },
    ],
    musuhY: 200,
};

// ===== FOREST 6 — ending fajar =====
export const cfgForest6 = {
    nama: 'Forest 6 - Fajar',
    mapKey: 'map_hutan6',
    mapFile: A_ + 'Forest6.tmj',
    scale: 2.25,

    spawnX: 20, spawnY: 480,
    jalanMasukX: 150,

    archer: [
        { x: 1900, y: 270, flip: false },
        { x: 2150, y: 270, flip: true },
    ],

    penyihirX: 2600,
    penyihirY: 390,
    triggerX: 2430,

    menuScene: 'MainMenu',

    bulan: { x: 700, y: 120, radius: 46, warna: 0xf6f2d5, scroll: 0.1, depth: -2 },

    tilesets: [
        { nama: 'Tiles_rumput', key: 'f6_tiles',  file: A_ + 'Tiles.png' },
        { nama: 'rumah',        key: 'f6_rumah',  file: A_ + 'Buildings.png' },
        { nama: 'pohon',        key: 'f6_pohon',  file: A_ + 'Tree-Assets.png' },
        { nama: 'pohon2',       key: 'f6_pohon2', file: 'assets/background/Forest/Trees/Green-Tree.png' },
        { nama: 'awan',         key: 'f6_awan',   file: A4_ + '2.png' },
        { nama: 'aset_random',  key: 'f6_decor',  file: A4_ + 'Decor.png' },
        { nama: 'big_tent',     key: 'f6_tent',   file: A4_ + 'Large_Tent.png' },
        { nama: 'patung',       key: 'f6_patung', file: A4_ + 'Angel_Statue.png' },
    ],
    layerHias: ['pohon2', 'pohon', 'semak_dekorasi2', 'semak_dekorasi',
                'tembok', 'atap', 'goa_besar_dekorasi', 'pintu',
                'tenda_kecil_dekorasi', 'dekorasilog_kayu', 'tenda_besar_dekorasi',
                'dekorasi_meja', 'patung'],
    layerCollision: ['daratan', 'daratan2', 'daratan3'],

    zonaJurang: [
        { x1: 252, x2: 576, batas: 650 },
    ],
    hpJurang: 25,
};

// ============================================================
// SUASANA per segmen Start.js (F1 senja, F2 malam)
// x,y matahari/bulan = rasio layar (0..1); r = piksel.
// F3-F6 sudah punya sistem malam/bulan sendiri di scene masing-masing.
// ============================================================
export const suasanaForest = {
    0: { // F1 — menjelang senja
        langit: '#e8925c',
        matahari: {
            x: 0.5, y: 0.28, r: 44,
            scroll: 0,
            warna: 0xffd98a,
            halo: [ { r: 70, a: 0.30 }, { r: 105, a: 0.15 }, { r: 150, a: 0.07 } ],
        },
        rona: { warna: 0xff8c3a, alpha: 0.10 },
    },
    1: { // F2 — malam berbulan
        langit: '#141c38',
        bulan: {
            x: 0.78, y: 0.18, r: 32,
            warna: 0xf5f2e0,
            halo: [ { r: 52, a: 0.25 }, { r: 78, a: 0.12 }, { r: 112, a: 0.05 } ],
        },
        bintang: { jumlah: 42, yMaks: 0.55, rMin: 1, rMaks: 2.2, kedip: true },
    },
};

// ============================================================
// MUSIK per segmen Start.js (F1/F2) — tiap hutan punya lagunya sendiri
// ============================================================
export const cfgMusik = {
    fadeIn:  800,    // musik masuk perlahan saat scene dibuka (ms)
    fadeOut: 600,    // musik memudar saat pindah scene (ms)
    segmen: {
        0: { key: 'f1_music', file: 'assets/audio/f1_music_background.mp3', volume: 0.3 },
        1: { key: 'f2_music', file: 'assets/audio/f2_music_baru.mp3', volume: 0.3 },
    },
    countess: { key: 'countess_music', file: 'assets/audio/hit_audio/countess_sfx/Dialog_Countess.mp3', volume: 0.35 },
    forest3:  { key: 'f3_music', file: 'assets/audio/f3_music_baru.mp3', volume: 0.25 },
    forest4:  { key: 'f4_music', file: 'assets/audio/f4_music_baru.mp3', volume: 0.3 },
    forest5:  { key: 'f5_music', file: 'assets/audio/f5_music_background.mp3', volume: 0.25 },
    boss5:    { key: 'boss_music', file: 'assets/audio/Boss_music.mp3',          volume: 0.3  },
    forest6:  { key: 'f6_music', file: 'assets/audio/f6_music_baru.mp3', volume: 0.3 },
};

export const cfgSfx = {
    jump:      { key: 'sfx_jump',      file: 'assets/audio/hit_audio/mc_sfx/Jump_SFX.mp3',      volume: 0.5, pool: 2 },
    slash1:    { key: 'sfx_slash1',    file: 'assets/audio/hit_audio/mc_sfx/Slash1_SFX.mp3',    volume: 0.7, pool: 4 },  // MC
    slash2:    { key: 'sfx_slash2',    file: 'assets/audio/hit_audio/mc_sfx/Slash2_SFX.mp3',    volume: 0.7, pool: 4 },  // Knight
    transform: { key: 'sfx_transform', file: 'assets/audio/hit_audio/mc_sfx/Transform_SFX.mp3', volume: 0.8, pool: 1 },
    countessLaugh: { key: 'sfx_countess_laugh', file: 'assets/audio/hit_audio/countess_sfx/Countess_laugh_SFX.mp3', volume: 0.7, pool: 1 },
    countessDead:  { key: 'sfx_countess_dead',  file: 'assets/audio/hit_audio/countess_sfx/Countess_dead_SFX.mp3', volume: 0.35, fadeIn: 600, fadeOut: 900, pool: 1 },
    pelayanDead: { key: 'sfx_pelayan_dead', file: 'assets/audio/hit_audio/bawahan_sfx/Vampire_death_SFX.mp3', volume: 0.5, pool: 3 },
    zombieDead: { key: 'sfx_zombie_dead', file: 'assets/audio/hit_audio/zombie_sfx/Zombie_dead_SFX.mp3', volume: 0.5, pool: 3 },
    pelayanSlash1: { key: 'sfx_pelayan_slash1', file: 'assets/audio/hit_audio/bawahan_sfx/Bawahan_Sword_SFX.mp3',  volume: 0.5, pool: 3 },
    pelayanSlash2: { key: 'sfx_pelayan_slash2', file: 'assets/audio/hit_audio/bawahan_sfx/Bawahan_Sword2_SFX.mp3', volume: 0.5, pool: 3 },
    step1: { key: 'sfx_step1', file: 'assets/audio/step1.mp3', volume: 0.4, pool: 2 },
    step2: { key: 'sfx_step2', file: 'assets/audio/step2.mp3', volume: 0.4, pool: 2 },
};