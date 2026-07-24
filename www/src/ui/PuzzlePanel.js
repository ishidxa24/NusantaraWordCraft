// src/ui/PuzzlePanel.js
// Panel puzzle (dark theme). Dialog cerita ditangani DialogBox di scene.
//   tipe 'susunkata' -> KETIK jawaban Inggris lewat papan huruf A–Z (tanpa huruf teracak).
//                       Kotak mulai KOSONG; pemain mengeja sendiri dari petunjuk Indonesia.
//   tipe 'urutan'    -> drag kartu teks ke slot urutan benar (mekanik lama, tak diubah).
//
// VERSI RAMAH HP:
//   - Tombol huruf DIPERBESAR (60x54) supaya nyaman diketuk dengan jari.
//   - Tinggi panel DIHITUNG ULANG tiap soal & otomatis MENGECIL kalau tidak muat
//     di layar, jadi tombol CEK & teks feedback tidak pernah terpotong lagi.
//   - Tinggi teks petunjuk DIUKUR beneran (bukan ditebak), jadi petunjuk panjang
//     2–3 baris tidak menabrak kotak jawaban.
//   - Bonus di desktop: bisa mengetik lewat keyboard fisik (A–Z, Backspace, Enter).

const CFG_PUZZLE = {
    // ── tuas kesulitan ────────────────────────────────────────────
    bocorHurufPertama: false,   // true = huruf pertama sudah terisi sebagai bantuan

    // ── panel ─────────────────────────────────────────────────────
    panelWMax: 720,             // lebar maksimum panel
    marginLayar: 20,            // jarak aman panel ke tepi layar
    warnaOverlay: 0x000000,
    alphaOverlay: 0.7,
    warnaPanelBg: 0x10131c,
    warnaBorder: 0xffd9e0,

    // ── kotak jawaban (slot) ──────────────────────────────────────
    slotGap: 10,
    warnaSlotBg: 0x1c2030,
    warnaSlotIsi: 0x2a3350,
    warnaSlotBorder: 0xffd9e0,

    // ── papan huruf A–Z (ukuran IDEAL; auto-mengecil bila perlu) ──
    keyW: 60,                   // diperbesar dari 46 -> nyaman untuk jari
    keyH: 54,                   // diperbesar dari 42
    keyGap: 9,
    keyPerRowMax: 9,            // 26 huruf + tombol hapus = 27 sel -> 3 baris
    warnaKey: 0x2a2140,
    warnaKeyHover: 0x4a2d70,
    warnaHapus: 0x5a2436,

    // ── warna teks / status ───────────────────────────────────────
    warnaTeksBenar: '#8affa0',
    warnaTeksSalah: '#ffb066',
    warnaTeksNetral: '#cfcfe0',

    // ── timing (ms) ───────────────────────────────────────────────
    jedaLanjut: 800,
    jedaSelesai: 650,
};

export class PuzzlePanel {

    constructor(scene) {
        this.scene = scene;
        this.aktif = false;
        this.objek = [];
        this.tiles = [];
        this.slots = [];
        this.slotLabels = [];
        this.isian = [];
        this.npcAktif = null;
        this.idxSoal = 0;
        this.menunggu = false;
        this.onBenarSatu = null;
        this.onSelesai = null;
        this._dragHandlers = null;
        this._keyHandler = null;
    }

    buka(npc) {
        this.npcAktif = npc;
        this.idxSoal = 0;
        this.aktif = true;
        this.tampilPuzzle();
    }

    tampilPuzzle() {
        this.bersihkan();
        const data = this.npcAktif.soalSet[this.idxSoal];
        this.dataAktif = data;
        this.menunggu = false;
        if (data.tipe === 'susunkata') this._tampilSusunKata(data);
        else                           this._tampilUrutan(data);
    }

    // ====================================================================
    //  TIPE 'susunkata' — papan huruf A–Z, layout adaptif & anti-terpotong
    // ====================================================================
    _tampilSusunKata(data) {
        const C = CFG_PUZZLE;
        const scene = this.scene;
        const { width, height } = scene.scale;
        const cx = width / 2, cy = height / 2;

        const kata = data.jawaban.toUpperCase();
        const n = kata.length;

        const panelW = Math.min(C.panelWMax, width - C.marginLayar * 2);
        const usableW = panelW - 48;
        const maxPanelH = height - C.marginLayar * 2;

        // ── 1) buat teks header dulu supaya tingginya bisa DIUKUR ──
        const nomor = scene.add.text(0, 0, 'Teka-teki ' + (this.idxSoal + 1) + ' / ' + this.npcAktif.soalSet.length, {
            fontFamily: 'monospace', fontSize: '15px', color: '#ffd9e0'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(2002);
        const perintah = scene.add.text(0, 0, data.perintah, {
            fontFamily: 'monospace', fontSize: '16px', color: '#ffffff',
            align: 'center', wordWrap: { width: panelW - 70 }, lineSpacing: 4
        }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(2002);
        const perintahH = perintah.height || 44;
        const headerH = 52 + perintahH + 18;

        // ── 2) cari ukuran yang MUAT di layar (mengecil bertahap) ──
        const cekH = 46, fbH = 56, gapSlotKb = 20, gapKbCek = 18;
        let L = null;
        for (let f = 1.0; f >= 0.62; f -= 0.04) {
            const keyW = Math.round(C.keyW * f);
            const keyH = Math.round(C.keyH * f);
            const keyGap = Math.max(5, Math.round(C.keyGap * f));

            // kotak jawaban
            let slotW = Math.round((n <= 8 ? 54 : n <= 10 ? 48 : 42) * f);
            let perRowSlot = Math.max(1, Math.floor((usableW + C.slotGap) / (slotW + C.slotGap)));
            perRowSlot = Math.min(perRowSlot, n);
            const slotRows = Math.ceil(n / perRowSlot);
            const perRowSlotB = Math.ceil(n / slotRows);
            const slotRowH = slotW + 12;
            const slotBlockH = (slotRows - 1) * slotRowH + slotW;

            // papan huruf (26 huruf + 1 hapus = 27 sel)
            const sel = 27;
            let perRowKey = Math.max(6, Math.floor((usableW + keyGap) / (keyW + keyGap)));
            perRowKey = Math.min(perRowKey, C.keyPerRowMax);
            const kbRows = Math.ceil(sel / perRowKey);
            const perRowKeyB = Math.ceil(sel / kbRows);
            const kbBlockH = kbRows * keyH + (kbRows - 1) * keyGap;

            const panelH = headerH + slotBlockH + gapSlotKb + kbBlockH + gapKbCek + cekH + 10 + fbH;

            L = { keyW, keyH, keyGap, slotW, perRowSlotB, slotRowH, slotBlockH,
                  perRowKeyB, kbRows, kbBlockH, panelH, sel };
            if (panelH <= maxPanelH) break;
        }

        const panelH = Math.min(L.panelH, maxPanelH);
        const top = cy - panelH / 2;

        // ── 3) latar panel ────────────────────────────────────────
        const overlay = scene.add.rectangle(cx, cy, width, height, C.warnaOverlay, C.alphaOverlay)
            .setScrollFactor(0).setDepth(2000);
        const panel = scene.add.graphics().setScrollFactor(0).setDepth(2001);
        panel.fillStyle(C.warnaPanelBg, 0.97).fillRoundedRect(cx - panelW / 2, top, panelW, panelH, 14);
        panel.lineStyle(2, C.warnaBorder, 0.7).strokeRoundedRect(cx - panelW / 2, top, panelW, panelH, 14);
        this.objek.push(overlay, panel, nomor, perintah);

        nomor.setPosition(cx, top + 24);
        perintah.setPosition(cx, top + 48);

        // ── 4) kotak jawaban ──────────────────────────────────────
        const slotsTopC = top + headerH + L.slotW / 2;
        const slotPos = (i) => {
            const row = Math.floor(i / L.perRowSlotB);
            const col = i - row * L.perRowSlotB;
            const cnt = Math.min(L.perRowSlotB, n - row * L.perRowSlotB);
            const rowW = cnt * L.slotW + (cnt - 1) * C.slotGap;
            const sx = cx - rowW / 2 + L.slotW / 2;
            return { x: sx + col * (L.slotW + C.slotGap), y: slotsTopC + row * L.slotRowH };
        };

        const fontSlot = L.slotW >= 50 ? '24px' : L.slotW >= 44 ? '21px' : '18px';
        this.slots = [];
        this.slotLabels = [];
        for (let i = 0; i < n; i++) {
            const p = slotPos(i);
            const g = scene.add.graphics().setScrollFactor(0).setDepth(2002);
            g._pos = p; g._w = L.slotW; g._h = L.slotW;
            this._gambarSlot(g, false);
            const lbl = scene.add.text(p.x, p.y, '', {
                fontFamily: 'monospace', fontSize: fontSlot, color: '#ffffff'
            }).setOrigin(0.5).setScrollFactor(0).setDepth(2003);
            this.objek.push(g, lbl);
            this.slots.push({ g });
            this.slotLabels.push(lbl);
        }

        this.isian = [];
        if (C.bocorHurufPertama && n > 0) {
            this.isian.push(kata[0]);
            this.slotLabels[0].setText(kata[0]);
            this._gambarSlot(this.slots[0].g, true);
        }

        // ── 5) papan huruf A–Z + hapus ────────────────────────────
        const sel = ('ABCDEFGHIJKLMNOPQRSTUVWXYZ').split('').concat(['\u232B']);
        const kbTopC = slotsTopC + L.slotBlockH - L.slotW / 2 + gapSlotKb + L.keyH / 2;
        const fontKey = L.keyH >= 48 ? '20px' : '17px';

        sel.forEach((ch, i) => {
            const row = Math.floor(i / L.perRowKeyB);
            const col = i - row * L.perRowKeyB;
            const cnt = Math.min(L.perRowKeyB, sel.length - row * L.perRowKeyB);
            const rowW = cnt * L.keyW + (cnt - 1) * L.keyGap;
            const sx = cx - rowW / 2 + L.keyW / 2;
            const x = sx + col * (L.keyW + L.keyGap);
            const y = kbTopC + row * (L.keyH + L.keyGap);
            this._buatKey(x, y, ch, ch === '\u232B', L.keyW, L.keyH, fontKey);
        });

        // ── 6) tombol CEK + feedback (selalu di dalam panel) ──────
        const cekY = kbTopC + L.kbBlockH - L.keyH / 2 + gapKbCek + cekH / 2;
        const cekBtn = scene.add.rectangle(cx, cekY, 170, cekH, 0x2d8080)
            .setScrollFactor(0).setDepth(2002).setInteractive({ useHandCursor: true });
        const cekTeks = scene.add.text(cx, cekY, 'CEK', {
            fontFamily: 'monospace', fontSize: '18px', color: '#ffffff'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(2003);
        cekBtn.on('pointerover', () => cekBtn.setFillStyle(0x236666));
        cekBtn.on('pointerout', () => cekBtn.setFillStyle(0x2d8080));
        cekBtn.on('pointerdown', () => this.cek());
        this.objek.push(cekBtn, cekTeks);

        this.feedback = scene.add.text(cx, cekY + cekH / 2 + 8, 'Baca petunjuk, ketik jawabannya, lalu tekan CEK.', {
            fontFamily: 'monospace', fontSize: '13px', color: C.warnaTeksNetral,
            align: 'center', wordWrap: { width: panelW - 60 }, lineSpacing: 3
        }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(2002);
        this.objek.push(this.feedback);

        // ── 7) keyboard fisik (bantuan saat main di laptop) ───────
        this._pasangKeyboardFisik();
    }

    _pasangKeyboardFisik() {
        if (!this.scene.input || !this.scene.input.keyboard) return;
        const h = (ev) => {
            if (!this.aktif || this.menunggu) return;
            const k = (ev.key || '');
            if (/^[a-zA-Z]$/.test(k)) this._ketikHuruf(k.toUpperCase());
            else if (k === 'Backspace') this._hapusHuruf();
            else if (k === 'Enter') this.cek();
        };
        this.scene.input.keyboard.on('keydown', h);
        this._keyHandler = h;
    }

    _gambarSlot(g, terisi) {
        const C = CFG_PUZZLE;
        const p = g._pos, w = g._w, h = g._h;
        g.clear();
        g.fillStyle(terisi ? C.warnaSlotIsi : C.warnaSlotBg, terisi ? 1 : 0.9)
            .fillRoundedRect(p.x - w / 2, p.y - h / 2, w, h, 6);
        g.lineStyle(2, C.warnaSlotBorder, terisi ? 0.85 : 0.45)
            .strokeRoundedRect(p.x - w / 2, p.y - h / 2, w, h, 6);
    }

    _buatKey(x, y, ch, hapus, w, h, fontSize) {
        const scene = this.scene, C = CFG_PUZZLE;
        const warnaDasar = hapus ? C.warnaHapus : C.warnaKey;
        const rect = scene.add.rectangle(x, y, w, h, warnaDasar)
            .setStrokeStyle(1, 0xffffff, 0.12)
            .setScrollFactor(0).setDepth(2003).setInteractive({ useHandCursor: true });
        const label = scene.add.text(x, y, ch, {
            fontFamily: 'monospace', fontSize: fontSize, color: '#eae0f0'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(2004);
        rect.on('pointerover', () => rect.setFillStyle(hapus ? 0x7a3450 : C.warnaKeyHover));
        rect.on('pointerout', () => rect.setFillStyle(warnaDasar));
        rect.on('pointerdown', () => hapus ? this._hapusHuruf() : this._ketikHuruf(ch));
        this.objek.push(rect, label);
    }

    _ketikHuruf(ch) {
        if (this.menunggu) return;
        const n = this.slots.length;
        if (this.isian.length >= n) return;
        const i = this.isian.length;
        this.isian.push(ch);
        this.slotLabels[i].setText(ch);
        this._gambarSlot(this.slots[i].g, true);
    }

    _hapusHuruf() {
        if (this.menunggu) return;
        const min = (CFG_PUZZLE.bocorHurufPertama ? 1 : 0);
        if (this.isian.length <= min) return;
        const i = this.isian.length - 1;
        this.slotLabels[i].setText('');
        this._gambarSlot(this.slots[i].g, false);
        this.isian.pop();
    }

    // ====================================================================
    //  TIPE 'urutan' — drag kartu ke slot (mekanik lama, dipertahankan)
    // ====================================================================
    _tampilUrutan(data) {
        const scene = this.scene;
        const { width, height } = scene.scale;
        const cx = width / 2, cy = height / 2;
        const panelW = Math.min(CFG_PUZZLE.panelWMax, width - 40);
        const panelH = 460;
        const top = cy - panelH / 2;

        const overlay = scene.add.rectangle(cx, cy, width, height, CFG_PUZZLE.warnaOverlay, CFG_PUZZLE.alphaOverlay)
            .setScrollFactor(0).setDepth(2000);
        const panel = scene.add.graphics().setScrollFactor(0).setDepth(2001);
        panel.fillStyle(CFG_PUZZLE.warnaPanelBg, 0.97).fillRoundedRect(cx - panelW / 2, top, panelW, panelH, 14);
        panel.lineStyle(2, CFG_PUZZLE.warnaBorder, 0.7).strokeRoundedRect(cx - panelW / 2, top, panelW, panelH, 14);
        const nomor = scene.add.text(cx, top + 26, 'Teka-teki ' + (this.idxSoal + 1) + ' / ' + this.npcAktif.soalSet.length, {
            fontFamily: 'monospace', fontSize: '15px', color: '#ffd9e0'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(2002);
        const perintah = scene.add.text(cx, top + 58, data.perintah, {
            fontFamily: 'monospace', fontSize: '16px', color: '#ffffff',
            align: 'center', wordWrap: { width: panelW - 70 }, lineSpacing: 4
        }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(2002);
        this.objek.push(overlay, panel, nomor, perintah);

        const potongan = data.jawaban.slice();
        const tileW = 132, tileH = 46, gap = 12;
        const n = potongan.length;
        const totalW = n * tileW + (n - 1) * gap;
        const startX = cx - totalW / 2 + tileW / 2;
        const slotY = top + 210;
        const trayY = top + 330;

        this.slots = [];
        for (let i = 0; i < n; i++) {
            const sx = startX + i * (tileW + gap);
            const kotak = scene.add.graphics().setScrollFactor(0).setDepth(2002);
            kotak.fillStyle(0x1c2030, 0.9).fillRoundedRect(sx - tileW / 2, slotY - tileH / 2, tileW, tileH, 6);
            kotak.lineStyle(2, 0xffd9e0, 0.5).strokeRoundedRect(sx - tileW / 2, slotY - tileH / 2, tileW, tileH, 6);
            this.objek.push(kotak);
            this.slots.push({ x: sx, y: slotY, tile: null });
        }

        const urutAcak = Phaser.Utils.Array.Shuffle(potongan.map((v, i) => i));
        this.tiles = [];
        urutAcak.forEach((nilaiIdx, pos) => {
            const nilai = potongan[nilaiIdx];
            const hx = startX + pos * (tileW + gap);
            const rect = scene.add.rectangle(hx, trayY, tileW, tileH, 0x4a2d70)
                .setStrokeStyle(2, 0x7a4ea0)
                .setScrollFactor(0).setDepth(2003).setInteractive({ useHandCursor: true, draggable: true });
            const label = scene.add.text(hx, trayY, nilai, {
                fontFamily: 'monospace', fontSize: '15px', color: '#ffffff'
            }).setOrigin(0.5).setScrollFactor(0).setDepth(2004);
            const tile = { rect, label, value: nilai, homeX: hx, homeY: trayY, slot: -1 };
            rect._tile = tile;
            this.tiles.push(tile);
            this.objek.push(rect, label);
        });

        const onDrag = (pointer, obj, dragX, dragY) => {
            if (!obj._tile) return;
            obj._tile.rect.x = dragX; obj._tile.rect.y = dragY;
            obj._tile.label.x = dragX; obj._tile.label.y = dragY;
            obj._tile.rect.setDepth(2010); obj._tile.label.setDepth(2011);
        };
        const onDragEnd = (pointer, obj) => {
            if (!obj._tile) return;
            obj._tile.rect.setDepth(2003); obj._tile.label.setDepth(2004);
            this.lepasTile(obj._tile);
        };
        scene.input.on('drag', onDrag);
        scene.input.on('dragend', onDragEnd);
        this._dragHandlers = [onDrag, onDragEnd];

        const cekY = top + 400;
        const cekBtn = scene.add.rectangle(cx, cekY, 160, 44, 0x2d8080)
            .setScrollFactor(0).setDepth(2002).setInteractive({ useHandCursor: true });
        const cekTeks = scene.add.text(cx, cekY, 'CEK', {
            fontFamily: 'monospace', fontSize: '18px', color: '#ffffff'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(2003);
        cekBtn.on('pointerdown', () => this.cek());
        this.objek.push(cekBtn, cekTeks);

        this.feedback = scene.add.text(cx, cekY + 30, 'Seret potongan ke kotak, lalu tekan CEK.', {
            fontFamily: 'monospace', fontSize: '13px', color: CFG_PUZZLE.warnaTeksNetral,
            align: 'center', wordWrap: { width: panelW - 60 }, lineSpacing: 3
        }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(2002);
        this.objek.push(this.feedback);
    }

    posisikan(tile, x, y) {
        tile.rect.x = x; tile.rect.y = y;
        tile.label.x = x; tile.label.y = y;
    }

    pulang(tile) {
        tile.slot = -1;
        this.posisikan(tile, tile.homeX, tile.homeY);
    }

    lepasTile(tile) {
        const sx = tile.rect.x, sy = tile.rect.y;
        let nearest = -1, best = 9999;
        this.slots.forEach((s, i) => {
            const d = Phaser.Math.Distance.Between(sx, sy, s.x, s.y);
            if (d < best) { best = d; nearest = i; }
        });
        const oldSlot = tile.slot;

        if (best < 55 && nearest >= 0) {
            const occ = this.slots[nearest].tile;
            if (oldSlot >= 0) this.slots[oldSlot].tile = null;
            if (occ && occ !== tile) {
                if (oldSlot >= 0) {
                    this.slots[oldSlot].tile = occ; occ.slot = oldSlot;
                    this.posisikan(occ, this.slots[oldSlot].x, this.slots[oldSlot].y);
                } else {
                    this.pulang(occ);
                }
            }
            this.slots[nearest].tile = tile; tile.slot = nearest;
            this.posisikan(tile, this.slots[nearest].x, this.slots[nearest].y);
        } else {
            if (oldSlot >= 0) this.posisikan(tile, this.slots[oldSlot].x, this.slots[oldSlot].y);
            else this.pulang(tile);
        }
    }

    cek() {
        if (this.menunggu) return;
        const data = this.dataAktif;
        let benar;

        if (data.tipe === 'susunkata') {
            if (this.isian.length < this.slots.length) {
                this.feedback.setColor(CFG_PUZZLE.warnaTeksSalah).setText('Lengkapi semua kotak dulu.');
                return;
            }
            benar = this.isian.join('').toUpperCase() === data.jawaban.toUpperCase();
        } else {
            if (this.slots.some(s => !s.tile)) {
                this.feedback.setColor(CFG_PUZZLE.warnaTeksSalah).setText('Lengkapi semua kotak dulu.');
                return;
            }
            benar = this.slots.every((s, i) => s.tile.value === data.jawaban[i]);
        }

        if (benar) {
            this.menunggu = true;
            this.feedback.setColor(CFG_PUZZLE.warnaTeksBenar).setText('BENAR!  +1 Cahaya');
            if (this.onBenarSatu) this.onBenarSatu();

            this.idxSoal++;
            if (this.idxSoal >= this.npcAktif.soalSet.length) {
                this.npcAktif.dijawab = true;
                if (this.npcAktif.obj) this.npcAktif.obj.setTint(0x88ff88);
                this.scene.time.delayedCall(CFG_PUZZLE.jedaSelesai, () => {
                    this.tutup();
                    if (this.onSelesai) this.onSelesai(this.npcAktif);
                });
            } else {
                this.scene.time.delayedCall(CFG_PUZZLE.jedaLanjut, () => this.tampilPuzzle());
            }
        } else {
            this.feedback.setColor(CFG_PUZZLE.warnaTeksSalah)
                .setText('Belum tepat. ' + (data.penjelasan || ''));
        }
    }

    bersihkan() {
        if (this._dragHandlers) {
            this.scene.input.off('drag', this._dragHandlers[0]);
            this.scene.input.off('dragend', this._dragHandlers[1]);
            this._dragHandlers = null;
        }
        if (this._keyHandler && this.scene.input && this.scene.input.keyboard) {
            this.scene.input.keyboard.off('keydown', this._keyHandler);
            this._keyHandler = null;
        }
        this.objek.forEach(o => o.destroy());
        this.objek = [];
        this.tiles = [];
        this.slots = [];
        this.slotLabels = [];
        this.isian = [];
    }

    tutup() {
        this.bersihkan();
        this.aktif = false;
    }
}