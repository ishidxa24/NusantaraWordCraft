// src/ui/MatchingPanel.js
// Mini-game F1: cocokkan serpihan ingatan (kata EN <-> ID).
// Interface sama seperti QuizPanel: buka(npc), onBenarSatu, onSelesai, aktif.
// npc butuh properti: pasanganSet (array {en, id}), obj (sprite npc, opsional), dijawab.

const CFG_MATCH = {
    // ── sesi ──────────────────────────────────────────────
    pasanganPerSesi: 6,     // ambil ACAK sekian pasangan dari bank tiap sesi.
                            // 0 / null = pakai SEMUA pasangan di bank.

    // panel
    panelW: 720,
    panelH: 520,            // dipakai sebagai TINGGI MINIMUM; panel auto-melar bila item banyak
    padBawah: 88,           // ruang bawah untuk teks feedback saat auto-sizing
    radius: 14,
    warnaOverlay: 0x000000,
    alphaOverlay: 0.7,
    warnaPanelBg: 0x10131c,
    warnaBorder: 0xffd9e0,

    // kolom & item
    offsetKolom: 180,       // jarak pusat kolom dari tengah panel
    kolomW: 300,
    itemH: 50,
    gapItem: 12,
    itemStartOffsetY: 132,  // dari atas panel ke area item pertama

    // warna item
    warnaItem: 0x2a2140,
    warnaHover: 0x4a2d70,
    warnaPilih: 0xffb84d,   // dipilih (emas)
    warnaBenar: 0x2e7d4f,   // menyatu (hijau)
    warnaSalah: 0x7a2230,   // gagal (merah)

    // teks
    warnaTeks: '#eae0f0',
    warnaTeksBenar: '#8affa0',
    warnaCahaya: '#ffe27a',

    // timing (ms)
    jedaSalah: 550,
    jedaSelesai: 800,
};

function acak(sumber) {
    const arr = sumber.slice();
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

export class MatchingPanel {

    constructor(scene) {
        this.scene = scene;
        this.aktif = false;
        this.objek = [];
        this.npcAktif = null;
        this.pasangan = [];
        this.dipilih = null;
        this.jumlahBenar = 0;
        this.onBenarSatu = null;
        this.onSelesai = null;
    }

    buka(npc) {
        this.npcAktif = npc;

        // Ambil acak sejumlah pasangan dari bank (npc.pasanganSet).
        // Bank boleh besar; panel tetap ringkas dan sesi jadi bervariasi tiap main.
        const bank = npc.pasanganSet || [];
        const n = CFG_MATCH.pasanganPerSesi;
        this.pasangan = (n && n > 0 && bank.length > n)
            ? acak(bank).slice(0, n)
            : bank.slice();

        this.dipilih = null;
        this.jumlahBenar = 0;
        this.aktif = true;
        this.tampil();
    }

    // tinggi panel yang dibutuhkan untuk jumlah pasangan saat ini
    hitungPanelH() {
        const n = this.pasangan.length;
        const { itemStartOffsetY, itemH, gapItem, padBawah, panelH } = CFG_MATCH;
        const tinggiItem = n * itemH + Math.max(0, n - 1) * gapItem;
        return Math.max(panelH, itemStartOffsetY + tinggiItem + padBawah);
    }

    tampil() {
        this.bersihkan();
        const scene = this.scene;
        const { width, height } = scene.scale;
        const cx = width / 2;
        const panelW = CFG_MATCH.panelW;
        const panelH = this.hitungPanelH();          // ← auto-size ke jumlah item
        const top = height / 2 - panelH / 2;

        // overlay + panel gelap
        const overlay = scene.add.rectangle(cx, height / 2, width, height, CFG_MATCH.warnaOverlay, CFG_MATCH.alphaOverlay)
            .setScrollFactor(0).setDepth(2000);
        const panel = scene.add.graphics().setScrollFactor(0).setDepth(2001);
        panel.fillStyle(CFG_MATCH.warnaPanelBg, 0.97).fillRoundedRect(cx - panelW / 2, top, panelW, panelH, CFG_MATCH.radius);
        panel.lineStyle(2, CFG_MATCH.warnaBorder, 0.7).strokeRoundedRect(cx - panelW / 2, top, panelW, panelH, CFG_MATCH.radius);
        this.objek.push(overlay, panel);

        // judul naratif
        const judul = scene.add.text(cx, top + 26, '\u2756  Serpihan Ingatan  \u2756', {
            fontFamily: 'monospace', fontSize: '18px', color: '#ffd9e0'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(2002);
        const sub = scene.add.text(cx, top + 52, 'Ingatan hutan terbelah dua. Satukan kembali tiap serpih kata.', {
            fontFamily: 'monospace', fontSize: '13px', color: '#c9bcd6',
            align: 'center', wordWrap: { width: panelW - 80 }
        }).setOrigin(0.5).setScrollFactor(0).setDepth(2002);
        this.objek.push(judul, sub);

        // counter
        this.counter = scene.add.text(cx, top + 82, '', {
            fontFamily: 'monospace', fontSize: '13px', color: '#ffd9e0'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(2002);
        this.objek.push(this.counter);

        // label kolom
        const leftX = cx - CFG_MATCH.offsetKolom;
        const rightX = cx + CFG_MATCH.offsetKolom;
        const labelY = top + 108;
        const labKiri = scene.add.text(leftX, labelY, 'English', {
            fontFamily: 'monospace', fontSize: '12px', color: '#8fb7ff'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(2002);
        const labKanan = scene.add.text(rightX, labelY, 'Bahasa Indonesia', {
            fontFamily: 'monospace', fontSize: '12px', color: '#8fffb0'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(2002);
        this.objek.push(labKiri, labKanan);

        // susun item (tiap kolom diacak terpisah biar nggak sejajar)
        const kiriData = acak(this.pasangan.map((p, i) => ({ teks: p.en, key: i })));
        const kananData = acak(this.pasangan.map((p, i) => ({ teks: p.id, key: i })));

        const { itemH, gapItem } = CFG_MATCH;
        const firstCenterY = top + CFG_MATCH.itemStartOffsetY + itemH / 2;
        this.kiriItems = [];
        this.kananItems = [];

        kiriData.forEach((d, i) => {
            const y = firstCenterY + i * (itemH + gapItem);
            this.kiriItems.push(this.buatItem(leftX, y, d.teks, d.key, 'kiri'));
        });
        kananData.forEach((d, i) => {
            const y = firstCenterY + i * (itemH + gapItem);
            this.kananItems.push(this.buatItem(rightX, y, d.teks, d.key, 'kanan'));
        });

        // feedback bawah
        const fbY = firstCenterY + this.pasangan.length * (itemH + gapItem) + 6;
        this.feedback = scene.add.text(cx, fbY, 'Ketuk satu serpih di kiri, lalu pasangannya di kanan.', {
            fontFamily: 'monospace', fontSize: '12px', color: '#ffffff',
            align: 'center', wordWrap: { width: panelW - 60 }, lineSpacing: 3
        }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(2002);
        this.objek.push(this.feedback);

        this.perbaruiHeader();
    }

    buatItem(x, y, teks, key, kolom) {
        const scene = this.scene;
        const w = CFG_MATCH.kolomW, h = CFG_MATCH.itemH;

        const g = scene.add.graphics().setScrollFactor(0).setDepth(2002);
        const item = { g, key, kolom, matched: false, x, y, w, h, teksAsli: teks };
        item.warna = (c) => {
            g.clear();
            g.fillStyle(c, 1).fillRoundedRect(x - w / 2, y - h / 2, w, h, 8);
            g.lineStyle(1, 0xffffff, 0.12).strokeRoundedRect(x - w / 2, y - h / 2, w, h, 8);
        };
        item.warna(CFG_MATCH.warnaItem);

        const txt = scene.add.text(x, y, teks, {
            fontFamily: 'monospace', fontSize: '15px', color: CFG_MATCH.warnaTeks,
            align: 'center', wordWrap: { width: w - 20 }
        }).setOrigin(0.5).setScrollFactor(0).setDepth(2004);

        const zone = scene.add.zone(x, y, w, h).setScrollFactor(0).setDepth(2003)
            .setInteractive({ useHandCursor: true });
        zone.on('pointerover', () => { if (!item.matched && this.dipilih !== item) item.warna(CFG_MATCH.warnaHover); });
        zone.on('pointerout',  () => { if (!item.matched && this.dipilih !== item) item.warna(CFG_MATCH.warnaItem); });
        zone.on('pointerdown', () => this.tap(item));

        item.txt = txt; item.zone = zone;
        this.objek.push(g, txt, zone);
        return item;
    }

    tap(item) {
        if (!this.aktif || item.matched) return;

        // belum ada yang dipilih
        if (!this.dipilih) {
            this.dipilih = item;
            item.warna(CFG_MATCH.warnaPilih);
            return;
        }
        // ketuk item yang sama → batal pilih
        if (this.dipilih === item) {
            item.warna(CFG_MATCH.warnaItem);
            this.dipilih = null;
            return;
        }
        // ketuk kolom yang sama → pindah pilihan
        if (this.dipilih.kolom === item.kolom) {
            this.dipilih.warna(CFG_MATCH.warnaItem);
            this.dipilih = item;
            item.warna(CFG_MATCH.warnaPilih);
            return;
        }

        // kolom beda → cek pasangan
        const a = this.dipilih, b = item;
        this.dipilih = null;

        if (a.key === b.key) {
            // COCOK — serpihan menyatu
            a.matched = b.matched = true;
            a.warna(CFG_MATCH.warnaBenar);
            b.warna(CFG_MATCH.warnaBenar);
            a.txt.setColor(CFG_MATCH.warnaTeksBenar);
            b.txt.setColor(CFG_MATCH.warnaTeksBenar);
            a.zone.disableInteractive();
            b.zone.disableInteractive();
            this.jumlahBenar++;
            this.efekMenyatu(a, b);
            if (this.onBenarSatu) this.onBenarSatu();
            this.perbaruiHeader();
            this.setFeedback(CFG_MATCH.warnaTeksBenar, 'Serpihan menyatu \u2192 +1 Cahaya');

            if (this.jumlahBenar >= this.pasangan.length) {
                this.setFeedback('#8affa0', 'Semua serpihan menyatu. Ingatan hutan kembali bersinar.');
                this.npcAktif.dijawab = true;
                if (this.npcAktif.obj) this.npcAktif.obj.setTint(0x88ff88);
                this.scene.time.delayedCall(CFG_MATCH.jedaSelesai, () => {
                    this.tutup();
                    if (this.onSelesai) this.onSelesai(this.npcAktif);
                });
            }
        } else {
            // SALAH — serpihan tolak-menolak
            a.warna(CFG_MATCH.warnaSalah);
            b.warna(CFG_MATCH.warnaSalah);
            this.setFeedback('#ffb066', '"' + a.teksAsli + '" belum berpasangan dengan "' + b.teksAsli + '". Coba lagi.');
            this.scene.time.delayedCall(CFG_MATCH.jedaSalah, () => {
                if (!this.aktif) return;
                if (!a.matched && this.dipilih !== a) a.warna(CFG_MATCH.warnaItem);
                if (!b.matched && this.dipilih !== b) b.warna(CFG_MATCH.warnaItem);
            });
        }
    }

    efekMenyatu(a, b) {
        const scene = this.scene;
        const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
        const cahaya = scene.add.text(mx, my, '\u2726 +1 Cahaya', {
            fontFamily: 'monospace', fontSize: '15px', color: CFG_MATCH.warnaCahaya
        }).setOrigin(0.5).setScrollFactor(0).setDepth(2010);
        this.objek.push(cahaya);
        scene.tweens.add({
            targets: cahaya, y: my - 42, alpha: 0, duration: 700, ease: 'Cubic.easeOut',
            onComplete: () => {
                const idx = this.objek.indexOf(cahaya);
                if (idx !== -1) this.objek.splice(idx, 1);
                cahaya.destroy();
            }
        });
    }

    perbaruiHeader() {
        if (this.counter) this.counter.setText('Serpihan menyatu: ' + this.jumlahBenar + ' / ' + this.pasangan.length);
    }

    setFeedback(warna, teks) {
        if (this.feedback) this.feedback.setColor(warna).setText(teks);
    }

    bersihkan() {
        this.objek.forEach(o => o.destroy());
        this.objek = [];
    }

    tutup() {
        this.bersihkan();
        this.aktif = false;
        this.dipilih = null;
    }
}