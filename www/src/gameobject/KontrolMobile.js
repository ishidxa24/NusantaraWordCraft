// src/ui/KontrolMobile.js
// PENTING: sesuaikan path import di bawah dengan lokasi Settings.js.

import { Settings } from '../Settings.js';
const CFG = {
    ukuran:       50,     // radius tombol
    margin:       68,     // jarak pusat tombol dari tepi layar
    jarak:        122,    // jarak antar tombol
    alpha:        0.4,    // transparansi normal
    alphaTekan:   0.8,    // transparansi saat ditekan
    depth:        2500,
    selaluTampil: false,  // dev-only: paksa tampil di PC saat mode 'auto' (buat tes pakai mouse)
};

export class KontrolMobile {
    constructor(scene, opt = {}) {
        this.scene = scene;

        // Mode kontrol dari Setting: 'auto' (deteksi touch) | 'always' | 'never'.
        // selaluTampil hanya berpengaruh saat mode 'auto' (flag dev).
        const touch = scene.sys.game.device.input.touch || CFG.selaluTampil;
        this.aktif = Settings.kontrolAktif(touch);

        // tombol mana yang ditampilkan (per-scene)
        this.opt = {
            attack:    opt.attack    ?? false,
            ngobrol:   opt.ngobrol   ?? true,
            transform: opt.transform ?? false,  // tombol TF (jadi knight)
            knight:    opt.knight    ?? false,  // DEF mulai tersembunyi; dimunculkan via aturModeKnight
        };

        // bentuknya meniru cursors keyboard
        this.arah = {
            left:  { isDown: false },
            right: { isDown: false },
            up:    { isDown: false },
            down:  { isDown: false },
        };
        this.tangkis = { isDown: false };   // ditahan (buat blok/parry)
        this._attackBaru    = false;
        this._ngobrolBaru   = false;
        this._transformBaru = false;
        this._tangkisBaru   = false;

        this._semua = [];          // semua objek tombol (buat show/hide global)
        this._grupTangkis = [];
        this._grupTransform = [];
        this._disembunyikan = false;   // state global (quiz/dialog buka)
        this._knightAktif = false;     // apakah mode knight (DEF boleh tampil)

        if (!this.aktif) return;

        scene.input.addPointer(3);   // izinkan beberapa sentuhan sekaligus

        const { width, height } = scene.scale;
        const y = height - CFG.margin;

        // === kiri: gerak ===
        this.#tombol(CFG.margin, y, '<',
            () => this.arah.left.isDown = true,
            () => this.arah.left.isDown = false);
        this.#tombol(CFG.margin + CFG.jarak, y, '>',
            () => this.arah.right.isDown = true,
            () => this.arah.right.isDown = false);

        // === kanan: JMP paling kanan, lalu A, lalu B (ke arah kiri) ===
        this.#tombol(width - CFG.margin, y, 'JMP',
            () => this.arah.up.isDown = true,
            () => this.arah.up.isDown = false);

        let kolom = 1;
        if (this.opt.attack) {
            this.#tombol(width - CFG.margin - CFG.jarak * kolom, y, 'A',
                () => { this._attackBaru = true; }, () => {});
            kolom++;
        }
        if (this.opt.ngobrol) {
            this.#tombol(width - CFG.margin - CFG.jarak * kolom, y, 'B',
                () => { this._ngobrolBaru = true; }, () => {});
            kolom++;
        }

        // === TF (transform knight) — di atas A ===
        this._grupTransform = this.#tombol(width - CFG.margin - CFG.jarak, y - CFG.jarak, 'TF',
            () => { this._transformBaru = true; }, () => {});
        this.#tampilGrup(this._grupTransform, this.opt.transform);

        // === DEF (tangkis, knight) — di atas JMP, mulai tersembunyi ===
        this._grupTangkis = this.#tombol(width - CFG.margin, y - CFG.jarak, 'DEF',
            () => { this.tangkis.isDown = true; this._tangkisBaru = true; },
            () => { this.tangkis.isDown = false; });
        this.#tampilGrup(this._grupTangkis, this.opt.knight);
    }

    #tombol(x, y, label, onDown, onUp) {
        const s = this.scene;
        const c = s.add.circle(x, y, CFG.ukuran, 0x000000, CFG.alpha)
            .setStrokeStyle(3, 0xffffff, 0.6)
            .setScrollFactor(0).setDepth(CFG.depth).setInteractive();
        const t = s.add.text(x, y, label, {
            fontFamily: 'monospace', fontSize: '20px', color: '#ffffff'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(CFG.depth + 1);

        const tekan = () => { c.setFillStyle(0x000000, CFG.alphaTekan); onDown(); };
        const lepas = () => { c.setFillStyle(0x000000, CFG.alpha); onUp(); };
        c.on('pointerdown', tekan);
        c.on('pointerup', lepas);
        c.on('pointerout', lepas);   // jari geser keluar = dianggap lepas

        const grup = [c, t];
        this._semua.push(...grup);
        return grup;
    }

    #tampilGrup(grup, tampil) { grup.forEach(o => o.setVisible(tampil)); }

    // sembunyikan SEMUA tombol (quiz/dialog terbuka) atau tampilkan lagi.
    // saat tampil lagi, DEF & TF ikut aturannya masing-masing.
    sembunyikan(sembunyi) {
        if (!this.aktif) return;
        if (this._disembunyikan === sembunyi) return;   // no-op kalau sama
        this._disembunyikan = sembunyi;

        if (sembunyi) {
            this._semua.forEach(o => o.setVisible(false));
            // lepas semua input yang mungkin lagi ketahan
            this.arah.left.isDown = this.arah.right.isDown = false;
            this.arah.up.isDown = this.arah.down.isDown = false;
            this.tangkis.isDown = false;
        } else {
            this._semua.forEach(o => o.setVisible(true));
            // hormati aturan tombol kondisional
            this.#tampilGrup(this._grupTangkis, this._knightAktif);
            this.#tampilGrup(this._grupTransform, this.opt.transform && !this._knightAktif);
        }
    }

    // panggil saat MC jadi knight (true) / balik ke MC (false)
    aturModeKnight(aktif) {
        if (!this.aktif) return;
        this._knightAktif = aktif;
        if (!this._disembunyikan) this.#tampilGrup(this._grupTangkis, aktif);
        if (!aktif) this.tangkis.isDown = false;
    }

    // sembunyikan tombol TF setelah dipakai (transform sekali saja)
    sembunyikanTransform() {
        this.opt.transform = false;
        this.#tampilGrup(this._grupTransform, false);
    }

    // mirip JustDown — true hanya di frame tombol baru ditekan
    attackJustDown()    { const v = this._attackBaru;    this._attackBaru    = false; return v; }
    ngobrolJustDown()   { const v = this._ngobrolBaru;   this._ngobrolBaru   = false; return v; }
    transformJustDown() { const v = this._transformBaru; this._transformBaru = false; return v; }
    tangkisJustDown()   { const v = this._tangkisBaru;   this._tangkisBaru   = false; return v; }

    // gabungkan keyboard + sentuh; bentuknya sama seperti cursors
    buatKursor(kb) {
        const a = this.arah;
        return {
            left:  { get isDown() { return kb.left.isDown  || a.left.isDown;  } },
            right: { get isDown() { return kb.right.isDown || a.right.isDown; } },
            up:    { get isDown() { return kb.up.isDown    || a.up.isDown;    } },
            down:  { get isDown() { return kb.down.isDown  || a.down.isDown;  } },
        };
    }
}