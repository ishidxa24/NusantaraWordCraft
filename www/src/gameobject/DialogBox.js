export class DialogBox {
    constructor(scene, opt = {}) {
        this.scene = scene;
        this.aktif = false;
        this._baris = [];
        this._idx = 0;
        this._selesaiCb = null;

        const W = scene.scale.width, H = scene.scale.height;
        const cfg = {
            margin:   opt.margin   ?? 24,
            tinggi:   opt.tinggi   ?? 150,
            padding:  opt.padding  ?? 20,
            warnaBox: opt.warnaBox ?? 0x10131c,
            alphaBox: opt.alphaBox ?? 0.92,
            warnaTepi:opt.warnaTepi?? 0xffd9e0,
            depth:    opt.depth    ?? 4000,
            kecepatanKetik: opt.kecepatanKetik ?? 28, // ms per huruf
        };
        this.cfg = cfg;

        const bx = cfg.margin, bw = W - cfg.margin * 2;
        const by = H - cfg.margin - cfg.tinggi, bh = cfg.tinggi;

        // container biar gampang show/hide & nempel layar
        this.box = scene.add.container(0, 0).setScrollFactor(0).setDepth(cfg.depth).setVisible(false);

        const g = scene.add.graphics();
        g.fillStyle(cfg.warnaBox, cfg.alphaBox).fillRoundedRect(bx, by, bw, bh, 12);
        g.lineStyle(2, cfg.warnaTepi, 0.8).strokeRoundedRect(bx, by, bw, bh, 12);
        this.box.add(g);

        // nama speaker (label kecil di atas kotak)
        this.lblNama = scene.add.text(bx + 14, by - 14, '', {
            fontFamily: 'monospace', fontSize: '18px', color: '#ffd9e0',
            stroke: '#000', strokeThickness: 4
        });
        this.box.add(this.lblNama);

        // teks isi (word-wrap dalam kotak)
        this.txt = scene.add.text(bx + cfg.padding, by + cfg.padding, '', {
            fontFamily: 'monospace', fontSize: '18px', color: '#ffffff',
            stroke: '#000', strokeThickness: 3,
            wordWrap: { width: bw - cfg.padding * 2 }, lineSpacing: 6
        });
        this.box.add(this.txt);

        // petunjuk lanjut (▼ kedip di pojok kanan bawah)
        this.tanda = scene.add.text(bx + bw - 24, by + bh - 26, '▼', {
            fontFamily: 'monospace', fontSize: '18px', color: '#ffd9e0'
        }).setVisible(false);
        this.box.add(this.tanda);
        scene.tweens.add({ targets: this.tanda, alpha: 0.2, yoyo: true, repeat: -1, duration: 450 });

        // input: SPACE (event) + klik
        this._onKey = () => this.lanjut();
        this._onPointer = () => this.lanjut();
        // (di-attach saat tampil, di-detach saat selesai)
    }

    // mulai percakapan: baris = [{nama, teks}, ...]
    tampil(baris, selesaiCb = null) {
        if (!baris || !baris.length) { if (selesaiCb) selesaiCb(); return; }
        this._baris = baris;
        this._idx = 0;
        this._selesaiCb = selesaiCb;
        this.aktif = true;
        this.box.setVisible(true);
        this.scene.input.on('pointerdown', this._onPointer);
        this.scene.input.keyboard.on('keydown-SPACE', this._onKey);
        this._tampilBaris();
    }

    _tampilBaris() {
        const b = this._baris[this._idx];
        this.lblNama.setText(b.nama || '');
        this.tanda.setVisible(false);

        // efek ketik per huruf
        this._penuh = b.teks || '';
        this._mengetik = true;
        this.txt.setText('');
        let i = 0;
        if (this._timer) this._timer.remove();
        this._timer = this.scene.time.addEvent({
            delay: this.cfg.kecepatanKetik,
            repeat: this._penuh.length - 1,
            callback: () => {
                i++;
                this.txt.setText(this._penuh.slice(0, i));
                if (i >= this._penuh.length) { this._mengetik = false; this.tanda.setVisible(true); }
            }
        });
    }

    // dipanggil saat SPACE/klik
    lanjut() {
        if (!this.aktif) return;
        if (this._mengetik) {
            // skip efek ketik → langsung tampil penuh
            if (this._timer) this._timer.remove();
            this.txt.setText(this._penuh);
            this._mengetik = false;
            this.tanda.setVisible(true);
            return;
        }
        // ke baris berikutnya
        this._idx++;
        if (this._idx >= this._baris.length) { this._tutup(); return; }
        this._tampilBaris();
    }

    _tutup() {
        this.aktif = false;
        this.box.setVisible(false);
        if (this._timer) this._timer.remove();
        this.scene.input.off('pointerdown', this._onPointer);
        this.scene.input.keyboard.off('keydown-SPACE', this._onKey);
        const cb = this._selesaiCb; this._selesaiCb = null;
        if (cb) cb();
    }
}