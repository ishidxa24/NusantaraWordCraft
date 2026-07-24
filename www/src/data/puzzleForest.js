export const setPuzzle = {
    forest4: [
        // ── TIER 1 · pemanasan (3–4 huruf) ─────────────────────────────
        {
            tipe: 'susunkata',
            jawaban: 'FIG',
            perintah: 'Buah ara kecil — makanan kesukaan burung Rangkong di hutan. (Jawab dalam Bahasa Inggris.)',
            penjelasan: 'FIG = buah ara. Tiga huruf: F-I-G.'
        },
        {
            tipe: 'susunkata',
            jawaban: 'NEST',
            perintah: 'Tempat burung bertelur dan mengerami anaknya. (Jawab dalam Bahasa Inggris.)',
            penjelasan: 'NEST = sarang. Empat huruf, diakhiri -ST.'
        },
        {
            tipe: 'susunkata',
            jawaban: 'BEAK',
            perintah: 'Bagian mulut yang keras dan runcing pada burung. (Jawab dalam Bahasa Inggris.)',
            penjelasan: 'BEAK = paruh. Empat huruf; ada gugus vokal E-A.'
        },

        // ── TIER 2 · menengah (7–8 huruf) ──────────────────────────────
        {
            tipe: 'susunkata',
            jawaban: 'FEATHER',
            perintah: 'Helai lembut yang menyelimuti seluruh tubuh burung. (Jawab dalam Bahasa Inggris.)',
            penjelasan: 'FEATHER = bulu. Tujuh huruf; gugus -EA- dan diakhiri -THER.'
        },
        {
            tipe: 'susunkata',
            jawaban: 'EXTINCT',
            perintah: 'Sudah lenyap selamanya dari muka bumi, misalnya karena diburu. (Jawab dalam Bahasa Inggris.)',
            penjelasan: 'EXTINCT = punah. Tujuh huruf; ada gugus -NCT di akhir.'
        },
        {
            tipe: 'susunkata',
            jawaban: 'MANGROVE',
            perintah: 'Hutan bakau di tepi pantai — rumah asli si Bekantan. (Jawab dalam Bahasa Inggris.)',
            penjelasan: 'MANGROVE = hutan bakau. Delapan huruf; berakhiran -GROVE.'
        },
        {
            tipe: 'susunkata',
            jawaban: 'WINGSPAN',
            perintah: 'Rentang sayap burung dari ujung ke ujung saat dibentangkan. (Jawab dalam Bahasa Inggris.)',
            penjelasan: 'WINGSPAN = rentang sayap. Delapan huruf; gabungan "wing" + "span".'
        },
        {
            tipe: 'susunkata',
            jawaban: 'STARLING',
            perintah: 'Burung nasional Bali yang nyaris punah — orang Indonesia menyebutnya Jalak Bali. (Jawab dalam Bahasa Inggris.)',
            penjelasan: 'STARLING = jalak. Delapan huruf; diawali STAR- diakhiri -LING.'
        },
        {
            tipe: 'susunkata',
            jawaban: 'HORNBILL',
            perintah: 'Burung berparuh besar bertanduk; di Indonesia disebut Rangkong atau Enggang. (Jawab dalam Bahasa Inggris.)',
            penjelasan: 'HORNBILL = rangkong. Delapan huruf; gabungan "horn" (tanduk) + "bill" (paruh).'
        },

        // ── TIER 3 · sulit & paling khas (7–10 huruf) ──────────────────
        {
            tipe: 'susunkata',
            jawaban: 'ENDEMIC',
            perintah: 'Hanya hidup di satu wilayah tertentu dan tak ada di tempat lain — ciri banyak satwa Indonesia. (Jawab dalam Bahasa Inggris.)',
            penjelasan: 'ENDEMIC = endemik. Tujuh huruf; diawali EN- diakhiri -MIC.'
        },
        {
            tipe: 'susunkata',
            jawaban: 'PROBOSCIS',
            perintah: 'Julukan Inggris untuk si Bekantan, monyet khas Kalimantan berhidung besar. (Jawab dalam Bahasa Inggris.)',
            penjelasan: 'PROBOSCIS = belalai/hidung besar (nama monyet Bekantan). Sembilan huruf; ada -SC- di dekat akhir (pro-BOS-cis).'
        },
        {
            tipe: 'susunkata',
            jawaban: 'MANGOSTEEN',
            perintah: 'Buah ungu berkulit tebal yang dijuluki "ratu buah" — manggis. (Jawab dalam Bahasa Inggris.)',
            penjelasan: 'MANGOSTEEN = manggis. Sepuluh huruf; berakhiran -STEEN dengan dobel E.'
        },
    ]
};

// Cara pakai di scene (sesuaikan key "forest4" dengan penamaan NPC-mu):
//   import { setPuzzle } from '../data/puzzleForest.js';
//   npc.soalSet = setPuzzle.forest4;