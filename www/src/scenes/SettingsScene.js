// src/scenes/SettingsScene.js
// Menu Pengaturan — dibuka sebagai OVERLAY di atas scene yang sedang jalan.
// Cara buka (dari scene mana pun, MainMenu s/d F6):
//   this.scene.pause();
//   this.scene.launch('SettingsScene', { kembali: this.scene.key });
//   this.scene.bringToTop('SettingsScene');
// Saat ditutup: scene ini stop, lalu scene 'kembali' di-resume (state permainan utuh).
//
// LAYOUT: label rata-KIRI di labelX; semua kontrol rata-KANAN ke rightEdge → baris sejajar.
// INPUT: semua tombol pakai ZONE tak-terlihat (shape interactive kadang tak menerima klik
//        di scene overlay; Zone selalu andal).
// FULLSCREEN: label di-refresh lewat event scale (enter/leave), request dibungkus try/catch
//        (browser blokir fullscreen kalau game jalan di iframe/preview — buka di tab asli).
import { Settings } from '../Settings.js';

const CFG = {
    panelW: 640,
    panelH: 470,
    radius: 16,
    margin: 48,
    warnaOverlay: 0x0a0710,
    alphaOverlay: 0.92,
    warnaPanelBg: 0x141021,
    warnaBorder:  0x8a6fd6,

    warnaJudul: '#d8b6ff',
    warnaLabel: '#eae0f0',
    warnaRedup: '#9a8fc0',
    warnaAktif: '#ffe08a',

    warnaTrek:     0x2a2140,
    warnaIsi:      0xffb84d,
    warnaKnob:     0xffe08a,
    warnaTombol:   0x2a2140,
    warnaTombolOn: 0x4a2d70,
    warnaAksen:    0x8a6fd6,
    warnaMati:     0x1a1622,   // toggle nonaktif
    warnaBorderMati: 0x40384f,

    barisGap: 64,
    depth: 3000,
};

export class SettingsScene extends Phaser.Scene {
    constructor() {
        super('SettingsScene');
    }

    init(data) {
        this.kembali = (data && data.kembali) || 'MainMenu';
    }

    preload() {
        // SFX klik tombol (kalau belum di-load di scene lain)
        if (!this.cache.audio.exists('btn_click'))
            this.load.audio('btn_click', 'assets/audio/Button_click_SFX.mp3');
    }

    // bunyi klik tombol (aman kalau audionya belum ada)
    #klik() {
        if (this.cache.audio.exists('btn_click')) this.sound.play('btn_click', { volume: 0.5 });
    }

    create() {
        const { width, height } = this.scale;
        const cx = width / 2;
        const cy = height / 2;
        const top = cy - CFG.panelH / 2;

        this.input.topOnly = true;
        Settings.terapkanAudio(this.game);

        const labelX    = cx - CFG.panelW / 2 + CFG.margin;
        const rightEdge = cx + CFG.panelW / 2 - CFG.margin;

        this.add.rectangle(cx, cy, width, height, CFG.warnaOverlay, CFG.alphaOverlay)
            .setInteractive();

        const g = this.add.graphics();
        g.fillStyle(CFG.warnaPanelBg, 0.98)
            .fillRoundedRect(cx - CFG.panelW / 2, top, CFG.panelW, CFG.panelH, CFG.radius);
        g.lineStyle(2, CFG.warnaBorder, 0.8)
            .strokeRoundedRect(cx - CFG.panelW / 2, top, CFG.panelW, CFG.panelH, CFG.radius);

        this.add.text(cx, top + 36, 'PENGATURAN', {
            fontFamily: 'monospace', fontSize: '24px', color: CFG.warnaJudul,
            stroke: '#000', strokeThickness: 4
        }).setOrigin(0.5);

        let y = top + 106;

        this.#labelBaris(labelX, y, 'Volume');
        this.#buatSlider(rightEdge, y, 220);
        y += CFG.barisGap;

        this.#labelBaris(labelX, y, 'Bisukan suara');
        this.#buatToggle(rightEdge, y,
            () => Settings.get('mute'),
            (v) => { Settings.set('mute', v); Settings.terapkanAudio(this.game); });
        y += CFG.barisGap;

        // ===== LAYAR PENUH =====
        this.#labelBaris(labelX, y, 'Layar penuh');
        const fsAda = this.sys.game.device.fullscreen.available;
        const refreshFs = this.#buatToggle(rightEdge, y,
            () => this.scale.isFullscreen,
            (v) => {
                try {
                    if (v) this.scale.startFullscreen(); else this.scale.stopFullscreen();
                } catch (e) { /* diblokir browser (iframe/preview) */ }
                Settings.set('fullscreen', this.scale.isFullscreen);
            },
            !fsAda);   // kalau perangkat memang tak dukung → tombol nonaktif
        if (fsAda) {
            // fullscreen itu async → refresh label saat event benar-benar terjadi
            this.scale.on('enterfullscreen', refreshFs);
            this.scale.on('leavefullscreen', refreshFs);
            this.events.once('shutdown', () => {
                this.scale.off('enterfullscreen', refreshFs);
                this.scale.off('leavefullscreen', refreshFs);
            });
        }
        y += CFG.barisGap;

        this.#labelBaris(labelX, y, 'Kontrol mobile');
        this.#buatSegmen(rightEdge, y,
            [['auto', 'Otomatis'], ['always', 'Selalu'], ['never', 'Sembunyi']],
            () => Settings.get('kontrol'),
            (v) => Settings.set('kontrol', v));
        y += 44;

        this.add.text(cx, y, 'Perubahan kontrol berlaku saat masuk permainan berikutnya.', {
            fontFamily: 'monospace', fontSize: '11px', color: CFG.warnaRedup,
            align: 'center', wordWrap: { width: CFG.panelW - 80 }
        }).setOrigin(0.5);

        this.#buatTombolBesar(cx, top + CFG.panelH - 44, '‹ Kembali', () => { this.#klik(); this.#tutup(); });

        this.input.keyboard.once('keydown-ESC', () => this.#tutup());
    }

    #tutup() {
        const kembali = this.kembali;
        this.scene.stop();
        if (kembali) this.scene.resume(kembali);
    }

    // ---------- helper UI ----------

    #labelBaris(x, y, teks) {
        this.add.text(x, y, teks, {
            fontFamily: 'monospace', fontSize: '16px', color: CFG.warnaLabel
        }).setOrigin(0, 0.5);
    }

    #zonaKlik(x, y, w, h) {
        return this.add.zone(x, y, w, h).setOrigin(0.5)
            .setInteractive({ useHandCursor: true });
    }

    #buatSlider(rightEdge, y, lebar) {
        const pctW = 52;
        const kanan = rightEdge - pctW;
        const kiri  = kanan - lebar;

        this.add.rectangle(kiri + lebar / 2, y, lebar, 8, CFG.warnaTrek).setOrigin(0.5);
        const isi  = this.add.graphics();
        const knob = this.add.circle(kiri, y, 12, CFG.warnaKnob).setStrokeStyle(2, 0x000000, 0.3);
        const pct  = this.add.text(rightEdge, y, '', {
            fontFamily: 'monospace', fontSize: '14px', color: CFG.warnaAktif
        }).setOrigin(1, 0.5);

        const gambar = () => {
            const v = Settings.get('volume');
            knob.x = kiri + lebar * v;
            isi.clear().fillStyle(CFG.warnaIsi, 1).fillRect(kiri, y - 4, lebar * v, 8);
            pct.setText(Math.round(v * 100) + '%');
        };
        gambar();

        const setDariPointer = (p) => {
            const v = Phaser.Math.Clamp((p.x - kiri) / lebar, 0, 1);
            Settings.set('volume', v);
            Settings.terapkanAudio(this.game);
            gambar();
        };

        const zona = this.#zonaKlik(kiri + lebar / 2, y, lebar + 24, 36);
        zona.on('pointerdown', (p) => { this._geser = true; setDariPointer(p); });
        this.input.on('pointermove', (p) => { if (this._geser) setDariPointer(p); });
        this.input.on('pointerup', () => { this._geser = false; });
    }

    // return: fungsi redraw (biar bisa dipanggil dari luar, mis. event fullscreen)
    #buatToggle(rightEdge, y, getVal, onToggle, nonaktif = false) {
        const w = 96, h = 36;
        const x = rightEdge - w / 2;
        const kotak = this.add.rectangle(x, y, w, h, CFG.warnaTombol)
            .setStrokeStyle(2, CFG.warnaAksen);
        const teks = this.add.text(x, y, '', {
            fontFamily: 'monospace', fontSize: '14px', color: '#ffffff'
        }).setOrigin(0.5);

        const gambar = () => {
            if (nonaktif) {
                kotak.setFillStyle(CFG.warnaMati, 1).setStrokeStyle(2, CFG.warnaBorderMati);
                teks.setText('—').setColor('#5a5470');
                return;
            }
            const on = !!getVal();
            kotak.setFillStyle(on ? CFG.warnaTombolOn : CFG.warnaTombol, 1);
            teks.setText(on ? 'ON' : 'OFF').setColor(on ? CFG.warnaAktif : CFG.warnaRedup);
        };
        gambar();

        if (!nonaktif) {
            this.#zonaKlik(x, y, w, h).on('pointerdown', () => { this.#klik(); onToggle(!getVal()); gambar(); });
        }
        return gambar;
    }

    #buatSegmen(rightEdge, y, opsi, getVal, onPilih) {
        const w = 96, h = 36, gap = 8;
        const totalW = opsi.length * w + (opsi.length - 1) * gap;
        let bx = rightEdge - totalW + w / 2;
        const kotaks = [];

        const gambar = () => {
            const aktif = getVal();
            kotaks.forEach(({ kotak, teks, val }) => {
                const on = val === aktif;
                kotak.setFillStyle(on ? CFG.warnaTombolOn : CFG.warnaTombol, 1);
                teks.setColor(on ? CFG.warnaAktif : CFG.warnaRedup);
            });
        };

        opsi.forEach(([val, label]) => {
            const kotak = this.add.rectangle(bx, y, w, h, CFG.warnaTombol)
                .setStrokeStyle(2, CFG.warnaAksen);
            const teks = this.add.text(bx, y, label, {
                fontFamily: 'monospace', fontSize: '13px', color: CFG.warnaRedup
            }).setOrigin(0.5);
            this.#zonaKlik(bx, y, w, h).on('pointerdown', () => { this.#klik(); onPilih(val); gambar(); });
            kotaks.push({ kotak, teks, val });
            bx += w + gap;
        });
        gambar();
    }

    #buatTombolBesar(x, y, teks, onKlik) {
        const w = 200, h = 44;
        const kotak = this.add.rectangle(x, y, w, h, CFG.warnaTombolOn)
            .setStrokeStyle(2, CFG.warnaBorder);
        this.add.text(x, y, teks, {
            fontFamily: 'monospace', fontSize: '18px', color: '#ffffff'
        }).setOrigin(0.5);

        const zona = this.#zonaKlik(x, y, w, h);
        zona.on('pointerover', () => kotak.setFillStyle(0x5a3785, 1));
        zona.on('pointerout',  () => kotak.setFillStyle(CFG.warnaTombolOn, 1));
        zona.on('pointerdown', onKlik);
    }
}