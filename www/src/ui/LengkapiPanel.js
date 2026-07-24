const CFG = {
    w: 680, h: 540,          // h dinaikkan 500→540 untuk ruang teks penjelasan saat salah
    bg: 0x141021, bgAlpha: 0.96,
    tepi: 0x8a6fd6,
    slot: 46,
    tombol: 54,
    jumlahPilihan: 8,
    rasioHilang: 0.4,
    salahSebelumPenjelasan: 0,  // 0 = penjelasan muncul tiap kali salah; N = baru muncul setelah N kali salah
    depth: 2500,
};

export class LengkapiPanel {

    constructor(scene) {
        this.scene = scene;
        this.aktif = false;
        this.onBenarSatu = null;
        this.onSelesai = null;
        this.npc = null;
        this.idx = 0;
        this.kunci = false;
        this._pinFn = null;
    }

    buka(npc) {
        this.npc = npc;
        this.soal = npc.soalSet || [];
        this.idx = 0;
        this.aktif = true;
        this.#buatPanel();
        this.#tampilSoal();
    }

    #buatPanel() {
        const s = this.scene;
        const cam = s.cameras.main;

        // ROOT container di WORLD coords (tanpa setScrollFactor(0)) → di-pin ke kamera
        this.wadah = s.add.container(cam.scrollX + cam.width / 2, cam.scrollY + cam.height / 2)
            .setDepth(CFG.depth);

        // pin ke tengah kamera tiap frame (kamera diam saat panel buka, ini jaga-jaga)
        this._pinFn = () => {
            const c = s.cameras.main;
            if (this.wadah) this.wadah.setPosition(c.scrollX + c.width / 2, c.scrollY + c.height / 2);
        };
        s.events.on('update', this._pinFn);

        // backdrop modal (interaktif) → serap tap di luar tombol, blokir tembus ke game
        const backdrop = s.add.rectangle(0, 0, s.scale.width, s.scale.height, 0x000000, 0.35)
            .setInteractive();
        this.wadah.add(backdrop);

        // inner container: semua visual + tombol; di-shake terpisah biar nggak lawan pin
        this.inner = s.add.container(0, 0);
        this.wadah.add(this.inner);

        const bg = s.add.rectangle(0, 0, CFG.w, CFG.h, CFG.bg, CFG.bgAlpha)
            .setStrokeStyle(3, CFG.tepi);
        this.inner.add(bg);

        this.judul = s.add.text(0, -CFG.h / 2 + 34, 'KATA TERMAKAN KEGELAPAN', {
            fontFamily: 'monospace', fontSize: '20px', color: '#d8b6ff',
            stroke: '#000', strokeThickness: 4
        }).setOrigin(0.5);
        this.inner.add(this.judul);

        this.progres = s.add.text(0, -CFG.h / 2 + 62, '', {
            fontFamily: 'monospace', fontSize: '13px', color: '#9a8fc0'
        }).setOrigin(0.5);
        this.inner.add(this.progres);

        this.petunjuk = s.add.text(0, -CFG.h / 2 + 108, '', {
            fontFamily: 'monospace', fontSize: '16px', color: '#ffffff',
            wordWrap: { width: CFG.w - 80 }, align: 'center'
        }).setOrigin(0.5);
        this.inner.add(this.petunjuk);

        // feedback: dikasih wordWrap + lineSpacing supaya penjelasan panjang tetap muat & rapi
        this.feedback = s.add.text(0, CFG.h / 2 - 46, '', {
            fontFamily: 'monospace', fontSize: '13px', color: '#ffe08a',
            stroke: '#000', strokeThickness: 3,
            align: 'center', wordWrap: { width: CFG.w - 70 }, lineSpacing: 4
        }).setOrigin(0.5);
        this.inner.add(this.feedback);

        this.grupSlot = [];
        this.grupTombol = [];
    }

    #tampilSoal() {
        const s = this.scene;
        this.kunci = false;
        this._salahCount = 0;   // reset hitungan salah tiap kata baru
        this.#bersihkanSoal();

        const d = this.soal[this.idx];
        this.kata = d.kata.toUpperCase();

        if (d.hilang && d.hilang.length) {
            this.idxHilang = d.hilang.slice().sort((a, b) => a - b);
        } else {
            const n = Math.max(2, Math.round(this.kata.length * CFG.rasioHilang));
            const semua = Phaser.Utils.Array.Shuffle([...Array(this.kata.length).keys()]);
            this.idxHilang = semua.slice(0, n).sort((a, b) => a - b);
        }
        this.isian = new Array(this.idxHilang.length).fill(null);

        this.progres.setText(`Kata ${this.idx + 1} / ${this.soal.length}`);
        this.petunjuk.setText('Petunjuk: ' + d.petunjuk);
        this.feedback.setText('Kegelapan memakan sebagian hurufnya... pulihkan!').setColor('#ffe08a');

        // ===== baris kata (slot huruf) =====
        const lebarKata = this.kata.length * (CFG.slot + 8) - 8;
        let x = -lebarKata / 2 + CFG.slot / 2;
        const yKata = -20;
        for (let i = 0; i < this.kata.length; i++) {
            const hilang = this.idxHilang.includes(i);
            const kotak = s.add.rectangle(x, yKata, CFG.slot, CFG.slot,
                hilang ? 0x2a1a4a : 0x241d38, 1)
                .setStrokeStyle(2, hilang ? 0x6a4fc0 : 0x453a66);
            const teks = s.add.text(x, yKata, hilang ? '?' : this.kata[i], {
                fontFamily: 'monospace', fontSize: '26px',
                color: hilang ? '#4a3a6a' : '#ffffff', fontStyle: 'bold'
            }).setOrigin(0.5);
            this.inner.add(kotak); this.inner.add(teks);
            this.grupSlot.push({ kotak, teks, hilang, huruf: this.kata[i] });
            x += CFG.slot + 8;
        }

        // ===== tombol pilihan huruf =====
        const hurufBenar = this.idxHilang.map(i => this.kata[i]);
        const pool = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
            .filter(h => !hurufBenar.includes(h));
        Phaser.Utils.Array.Shuffle(pool);
        const pilihan = Phaser.Utils.Array.Shuffle(
            hurufBenar.concat(pool.slice(0, Math.max(0, CFG.jumlahPilihan - hurufBenar.length)))
        );

        const perBaris = Math.min(pilihan.length, 8);
        const lebarTombol = perBaris * (CFG.tombol + 10) - 10;
        let tx = -lebarTombol / 2 + CFG.tombol / 2;
        const yTombol = 90;
        pilihan.forEach(huruf => {
            const kotak = s.add.rectangle(tx, yTombol, CFG.tombol, CFG.tombol, 0x342a55, 1)
                .setStrokeStyle(2, 0x8a6fd6)
                .setInteractive({ useHandCursor: true });
            const teks = s.add.text(tx, yTombol, huruf, {
                fontFamily: 'monospace', fontSize: '24px', color: '#ffe08a', fontStyle: 'bold'
            }).setOrigin(0.5);
            kotak.on('pointerdown', () => this.#tapHuruf(huruf));
            this.inner.add(kotak); this.inner.add(teks);
            this.grupTombol.push({ kotak, teks });
            tx += CFG.tombol + 10;
        });

        // ===== tombol hapus =====
        const hapus = s.add.rectangle(0, yTombol + 78, 120, 40, 0x553344, 1)
            .setStrokeStyle(2, 0xcc7788).setInteractive({ useHandCursor: true });
        const hapusTeks = s.add.text(0, yTombol + 78, '⌫ Hapus', {
            fontFamily: 'monospace', fontSize: '15px', color: '#ffccd5'
        }).setOrigin(0.5);
        hapus.on('pointerdown', () => this.#hapusTerakhir());
        this.inner.add(hapus); this.inner.add(hapusTeks);
        this.grupTombol.push({ kotak: hapus, teks: hapusTeks });
    }

    #tapHuruf(huruf) {
        if (this.kunci) return;
        const kosong = this.isian.indexOf(null);
        if (kosong === -1) return;

        this.isian[kosong] = huruf;
        const slot = this.grupSlot[this.idxHilang[kosong]];
        slot.teks.setText(huruf).setColor('#ffe08a');
        slot.kotak.setFillStyle(0x3a2a5f, 1);

        if (this.isian.indexOf(null) === -1) this.#cek();
    }

    #hapusTerakhir() {
        if (this.kunci) return;
        let terakhir = -1;
        for (let i = this.isian.length - 1; i >= 0; i--) {
            if (this.isian[i] !== null) { terakhir = i; break; }
        }
        if (terakhir === -1) return;
        this.isian[terakhir] = null;
        const slot = this.grupSlot[this.idxHilang[terakhir]];
        slot.teks.setText('?').setColor('#4a3a6a');
        slot.kotak.setFillStyle(0x2a1a4a, 1);
    }

    #cek() {
        const benar = this.idxHilang.every((idxKata, i) => this.isian[i] === this.kata[idxKata]);
        this.kunci = true;

        if (benar) {
            this.feedback.setText('✦ Kata pulih! Cahaya kembali...').setColor('#8aff9a');
            this.grupSlot.forEach(sl => {
                sl.teks.setColor('#ffffff');
                sl.kotak.setFillStyle(0x4a3f7a, 1).setStrokeStyle(2, 0xffe08a);
            });
            if (this.onBenarSatu) this.onBenarSatu();
            this.scene.time.delayedCall(900, () => {
                this.idx++;
                if (this.idx >= this.soal.length) this.#selesai();
                else this.#tampilSoal();
            });
        } else {
            // SALAH — tampilkan penjelasan edukatif kata ini (kalau ada & ambang terpenuhi)
            this._salahCount++;
            const d = this.soal[this.idx];
            if (d && d.penjelasan && this._salahCount > CFG.salahSebelumPenjelasan) {
                this.feedback.setText('✗ ' + d.penjelasan).setColor('#ffcf8a');
            } else {
                this.feedback.setText('Kegelapan menolak huruf itu... coba lagi!').setColor('#ff8a9a');
            }
            // shake INNER (bukan root) biar nggak lawan pin kamera
            this.scene.tweens.add({
                targets: this.inner, x: this.inner.x + 8, duration: 50,
                yoyo: true, repeat: 3,
                onComplete: () => {
                    this.inner.x = 0;
                    this.idxHilang.forEach((idxKata, i) => {
                        this.isian[i] = null;
                        const slot = this.grupSlot[idxKata];
                        slot.teks.setText('?').setColor('#4a3a6a');
                        slot.kotak.setFillStyle(0x2a1a4a, 1);
                    });
                    this.kunci = false;
                }
            });
        }
    }

    #selesai() {
        const npc = this.npc;
        if (npc) npc.dijawab = true;
        if (npc && npc.obj && npc.obj.setTint) npc.obj.setTint(0x88ff88);
        this.tutup();
        if (this.onSelesai) this.onSelesai(npc);
    }

    #bersihkanSoal() {
        this.grupSlot.forEach(sl => { sl.kotak.destroy(); sl.teks.destroy(); });
        this.grupTombol.forEach(t => { t.kotak.destroy(); t.teks.destroy(); });
        this.grupSlot = [];
        this.grupTombol = [];
    }

    tutup() {
        this.aktif = false;
        if (this._pinFn) { this.scene.events.off('update', this._pinFn); this._pinFn = null; }
        if (this.wadah) { this.wadah.destroy(true); this.wadah = null; }
        this.inner = null;
        this.grupSlot = [];
        this.grupTombol = [];
    }
}