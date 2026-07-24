export const setSoal = {
    // ===== FOREST 2 — MENANTANG (ditingkatkan dari SEDANG) =====
    // Fokus: jebakan pengecoh yang mirip jawaban benar, bukan sekadar kata sulit.
    // Setiap penjelasan mengajarkan POLA, bukan cuma "jawabannya B".
    forest2: [
        {
            pertanyaan: 'Choose the CORRECT sentence:',
            pilihan: [
                'Indonesia have thousands of islands.',
                'Indonesia has thousands of islands.',
                'Indonesia are having thousands of islands.'
            ],
            jawabanBenar: 1,
            penjelasan: 'Dua jebakan sekaligus. (1) Nama negara = tunggal → pakai "has", bukan "have". (2) "have" untuk kepemilikan adalah kata kerja STATIF, tidak boleh -ing → "are having" salah. Pola: He/She/It/nama negara → has.'
        },
        {
            pertanyaan: '"Wayang stories are passed down from our ancestors." What does "ancestors" mean?',
            pilihan: ['Keturunan', 'Leluhur (nenek moyang)', 'Tetangga'],
            jawabanBenar: 1,
            penjelasan: '"Ancestor" = leluhur / nenek moyang (generasi terdahulu). Jebakannya "keturunan" — itu justru KEBALIKANNYA (= descendant). Ingat pasangannya: ancestor ↔ descendant = leluhur ↔ keturunan.'
        },
        {
            pertanyaan: 'Complete: "Borobudur is one of the ___ Buddhist temples in the world."',
            pilihan: ['larger', 'largest', 'more large'],
            jawabanBenar: 1,
            penjelasan: 'Pola "one of the + [superlatif] + benda jamak" → wajib bentuk PALING (largest). "one of the largest" = salah satu yang terbesar. "larger" (lebih) dan "more large" (salah bentuk) tidak cocok. Rumus: one of the biggest/oldest/best + kata benda jamak.'
        },
        {
            pertanyaan: 'Complete: "The temple ___ built in the 9th century."',
            pilihan: ['was', 'were', 'is'],
            jawabanBenar: 0,
            penjelasan: 'Kalimat PASIF lampau: rumusnya was/were + V3. Subjek "the temple" tunggal + peristiwa masa lalu → "was built". "were" untuk subjek jamak; "is" untuk masa kini. Jebakannya di sini bukan artinya, tapi tunggal/jamak + waktu.'
        },
        {
            pertanyaan: 'Complete: "Raden Saleh is a painter ___ works are famous worldwide."',
            pilihan: ['who', 'which', 'whose'],
            jawabanBenar: 2,
            penjelasan: '"whose" = penghubung KEPEMILIKAN (karya milik si pelukis). "a painter whose works" = pelukis yang karya-karyanya. Jebakannya "who" — itu untuk orang sebagai pelaku, bukan pemilik. Pola: who (orang), which (benda), whose (milik siapa pun).'
        },
        {
            pertanyaan: 'Complete: "Batik is famous ___ its intricate patterns."',
            pilihan: ['of', 'for', 'with'],
            jawabanBenar: 1,
            penjelasan: 'Kolokasi tetap: "famous FOR" = terkenal karena/atas. "famous for its patterns" = terkenal karena motifnya. Jangan tertukar dengan "made of" (terbuat dari) atau "full of" (penuh). Hafal frasa utuh: famous for + alasan terkenalnya.'
        },
        {
            pertanyaan: 'Complete: "Komodo dragons ___ only in Indonesia."',
            pilihan: ['find', 'are found', 'are finding'],
            jawabanBenar: 1,
            penjelasan: 'Kalimat PASIF present: rumusnya am/is/are + V3. "are found" = ditemukan (komodo tidak menemukan, tapi ditemukan). "find" itu aktif (salah pelaku); "are finding" bentuk progresif yang tak cocok. Pola pasif: to be + V3.'
        },
        {
            pertanyaan: '"The Javan rhino is an endangered species." What does "endangered" mean?',
            pilihan: ['Berbahaya', 'Terancam punah', 'Dilindungi'],
            jawabanBenar: 1,
            penjelasan: '"Endangered" = terancam punah. Jebakan besar: "berbahaya" itu "dangerous" — mirip bentuknya tapi beda arti. "Dilindungi" (protected) itu akibat dari status terancam, bukan artinya. Ingat: endangered species = spesies yang hampir punah.'
        },
        {
            pertanyaan: 'Complete: "Mount Rinjani is ___ than most mountains in Java."',
            pilihan: ['high', 'higher', 'highest'],
            jawabanBenar: 1,
            penjelasan: 'Ada kata "than" → membandingkan DUA hal → pakai bentuk -er (higher). Jebakannya "highest" (paling tinggi) yang dipakai TANPA "than" dan biasanya dengan "the". Pola: adjective + -er + than = lebih ... daripada.'
        },
        {
            pertanyaan: 'Complete: "A gamelan orchestra produces ___ beautiful sound."',
            pilihan: ['a', 'an', 'the'],
            jawabanBenar: 0,
            penjelasan: '"a" atau "an" ditentukan oleh BUNYI awal kata berikutnya, bukan hurufnya. "beautiful" diawali bunyi /b/ (konsonan) → pakai "a beautiful". Jebakan "an" muncul karena orang lihat ini kata sifat. Bandingkan: "an hour" (huruf h, tapi bunyi vokal).'
        }
    ]
};

export const pasanganForest = {
    
    forest1: [
        // ── Budaya & tradisi Nusantara ───────────────────────────
        { en: 'Shadow puppet',      id: 'Wayang kulit' },
        { en: 'Storyteller',        id: 'Pendongeng' },
        { en: 'Kite',               id: 'Layang-layang' },
        { en: 'Yellow rice cone',   id: 'Tumpeng' },
        { en: 'Shrimp paste',       id: 'Terasi' },
        { en: 'Torch ginger',       id: 'Kecombrang' },
        { en: 'Hermit',             id: 'Pertapa' },
        { en: 'Giant',              id: 'Raksasa' },

        // ── Jati diri bangsa ─────────────────────────────────────
        { en: 'Unity in diversity', id: 'Bhinneka Tunggal Ika' },
        { en: 'Ethnic group',       id: 'Suku bangsa' },
        { en: 'Regional language',  id: 'Bahasa daerah' },

        // ── Alam & pelestarian ───────────────────────────────────
        { en: 'Bird of paradise',   id: 'Cenderawasih' },
        { en: 'Poaching',           id: 'Perburuan liar' },
        { en: 'Captivity',          id: 'Penangkaran' },
        { en: 'Coral reefs',        id: 'Terumbu karang' },
        { en: 'Excursion',          id: 'Karyawisata' },
        { en: 'Waterfall',          id: 'Air terjun' },
        { en: 'Harbor',             id: 'Pelabuhan' }
    ]
};