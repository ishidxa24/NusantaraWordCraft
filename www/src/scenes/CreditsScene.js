// src/scenes/CreditsScene.js
// Layar Kredit — atribusi aset pihak ketiga. Dibuka sbg overlay dari MainMenu:
//   this.scene.pause();
//   this.scene.launch('CreditsScene', { kembali: this.scene.key });
//   this.scene.bringToTop('CreditsScene');
// Bisa di-scroll: geser/seret (mobile & mouse) atau roda mouse. Tutup → resume pemanggil.
import { Settings } from '../Settings.js';

const CFG = {
    bg: 0x0a0710, bgAlpha: 0.98,
    warnaJudul: '#d8b6ff',
    warnaSeksi: '#ffd9e0',
    warnaItem:  '#eae0f0',
    warnaOleh:  '#c9bcd6',
    warnaUrl:   '#7a6f95',
    warnaRedup: '#9a8fc0',
    depthUI: 50,
    autoScroll: 0.6,   // kecepatan gulir otomatis (mode 'lanjut'); WAJIB ada — kalau hilang → NaN → teks hilang
};

// Data kredit — tinggal tambah/edit di sini.
const KREDIT = [
    { seksi: 'KARAKTER & SPRITE' },
    { judul: 'Karakter Utama (Liora)',     oleh: 'Anokolisa',      url: 'anokolisa.itch.io/sidescroller-pixelart-sprites-asset-pack-forest-16x16' },
    { judul: 'Knight (wujud ksatria)',     oleh: 'CraftPix',       url: 'craftpix.net/freebies/free-knight-character-sprites-pixel-art' },
    { judul: 'Countess Lethe & Bawahan',   oleh: 'CraftPix',       url: 'craftpix.net/freebies/free-vampire-pixel-art-sprite-sheets' },
    { judul: 'Zombie',                     oleh: 'CraftPix',       url: 'craftpix.net/freebies/free-zombie-sprite-sheet-pack-pixel-art' },
    { judul: 'Archer (NPC)',               oleh: 'GandalfHardcore',url: 'gandalfhardcore.itch.io/pixel-art-archer-character' },

    { seksi: 'TILESET & LINGKUNGAN' },
    { judul: 'Tileset Hutan (16x16)',      oleh: 'Anokolisa',      url: 'anokolisa.itch.io/sidescroller-pixelart-sprites-asset-pack-forest-16x16' },
    { judul: 'Tileset Overworld (32x32)',  oleh: 'GandalfHardcore',url: 'gandalfhardcore.itch.io/free-pixel-art-sidescroller-asset-pack-32x32-overworld' },

    { seksi: 'MUSIK' },
    { judul: 'Musik Menu, Pilih Pulau, Hutan 1 & 2', oleh: 'Paul Winter (Pixabay)',   url: 'pixabay.com' },
    { judul: 'Musik Dialog Countess (Hutan 2)',      oleh: 'Florin Cinca (Pixabay)',   url: 'pixabay.com' },
    { judul: 'Musik Hutan 3',                        oleh: 'Claude Houde (Pixabay)',   url: 'pixabay.com' },
    { judul: 'Musik Hutan 4',                        oleh: 'Kevin MacLeod (Pixabay)',  url: 'pixabay.com' },
    { judul: 'Musik Hutan 5 — "The Weeping Moon"',   oleh: 'Nicholas Aralus',          url: 'nicholas-aralus.itch.io/theweepingmoon' },
    { judul: 'Musik Hutan 6 (ending)',               oleh: 'RubyZephyr (Pixabay)',     url: 'pixabay.com' },

    { seksi: 'EFEK SUARA (SFX)' },
    { judul: 'Langkah kaki',               oleh: 'Dryoma',                        url: 'dryoma.itch.io/footsteps-sounds' },
    { judul: 'Lompat (cartoon jump)',      oleh: 'freesound_community (Pixabay)', url: 'pixabay.com' },
    { judul: 'Tebasan pedang',             oleh: 'freesound_community (Pixabay)', url: 'pixabay.com' },
    { judul: 'Hujan',                      oleh: 'Pig Bank - Mood (Pixabay)',     url: 'pixabay.com' },
    { judul: 'Petir',                      oleh: 'u_q2hb2391vb (Pixabay)',        url: 'pixabay.com' },
    { judul: 'SFX tambahan',               oleh: 'AlesiaDavina (Pixabay)',        url: 'pixabay.com' },
    { judul: 'SFX tambahan',               oleh: 'DRAGON-STUDIO (Pixabay)',       url: 'pixabay.com' },

    { catatan: 'Terima kasih kepada seluruh kreator aset di atas.' },
    { catatan: 'Dibuat dengan Phaser 3.' },
];

export class CreditsScene extends Phaser.Scene {
    constructor() { super('CreditsScene'); }

    init(data) {
        this.kembali = (data && data.kembali) || 'MainMenu';
        // 'overlay' = dibuka dari menu (balik via resume). 'lanjut' = dari ending (auto-scroll → start menu).
        this.mode = (data && data.mode) || 'overlay';
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

        this.input.topOnly = true;

        // (camera fadeIn dihapus: bentrok dengan geometry mask → daftar kredit hilang.
        //  Transisi dari ending sudah mulus karena F6 fade-out ke hitam + latar gelap di sini.)

        // latar (interaktif = serap klik + jadi permukaan geser)
        this.add.rectangle(cx, height / 2, width, height, CFG.bg, CFG.bgAlpha).setInteractive();

        // judul (tetap di atas)
        this.add.text(cx, 40, 'KREDIT', {
            fontFamily: 'monospace', fontSize: '26px', color: CFG.warnaJudul,
            stroke: '#000', strokeThickness: 4
        }).setOrigin(0.5).setDepth(CFG.depthUI);
        this.add.text(cx, 74, 'Aset pihak ketiga yang digunakan', {
            fontFamily: 'monospace', fontSize: '12px', color: CFG.warnaRedup
        }).setOrigin(0.5).setDepth(CFG.depthUI);

        // wilayah scroll
        this.regionTop = 104;
        const regionBottom = height - 92;
        const regionH = regionBottom - this.regionTop;
        const wrapW = Math.min(width - 100, 760);

        // isi (container yang digeser) — depth 1 supaya bisa ditutup tirai (depth 10)
        this.isi = this.add.container(0, this.regionTop).setDepth(1);
        let y = 0;
        const tambah = (teks, gaya, gapAtas = 0) => {
            y += gapAtas;
            const t = this.add.text(cx, y, teks, gaya).setOrigin(0.5, 0);
            this.isi.add(t);
            y += t.height + 4;
        };

        KREDIT.forEach(e => {
            if (e.seksi) {
                tambah(e.seksi, {
                    fontFamily: 'monospace', fontSize: '16px', color: CFG.warnaSeksi,
                    stroke: '#000', strokeThickness: 3
                }, 22);
            } else if (e.catatan) {
                tambah(e.catatan, {
                    fontFamily: 'monospace', fontSize: '12px', color: CFG.warnaRedup,
                    align: 'center', wordWrap: { width: wrapW }
                }, 18);
            } else {
                tambah(e.judul, {
                    fontFamily: 'monospace', fontSize: '15px', color: CFG.warnaItem,
                    align: 'center', wordWrap: { width: wrapW }
                }, 12);
                tambah('oleh ' + e.oleh, {
                    fontFamily: 'monospace', fontSize: '12px', color: CFG.warnaOleh
                });
                tambah(e.url, {
                    fontFamily: 'monospace', fontSize: '10px', color: CFG.warnaUrl,
                    align: 'center', wordWrap: { width: wrapW }
                });
            }
        });
        this.isiTinggi = y;

        // Tirai penutup atas & bawah — PENGGANTI geometry mask.
        // (Geometry mask WebGL kadang gagal render di scene yang di-start, bukan di-launch →
        //  daftar kredit hilang saat dibuka dari ending. Tirai selalu andal.)
        // Isi menggulir di depth 1; tirai (depth 10) menutup yang keluar area;
        // judul/tombol (depth 50) tetap di atas tirai.
        this.add.rectangle(cx, this.regionTop / 2, width, this.regionTop, CFG.bg, 1).setDepth(10);
        this.add.rectangle(cx, (regionBottom + height) / 2, width, height - regionBottom, CFG.bg, 1).setDepth(10);

        // scroll state
        this.scrollY = 0;
        this.maxScroll = Math.max(0, this.isiTinggi - regionH);

        // geser: seret (mobile/mouse) + roda
        this._drag = false;
        this.input.on('pointerdown', (p) => { this._drag = true; this._lastY = p.y; });
        this.input.on('pointerup',   () => { this._drag = false; });
        this.input.on('pointermove', (p) => {
            if (this._drag) { this.#geser(this._lastY - p.y); this._lastY = p.y; }
        });
        this.input.on('wheel', (p, go, dx, dy) => this.#geser(dy * 0.5));

        // petunjuk geser (kalau memang bisa di-scroll)
        if (this.maxScroll > 0) {
            this.add.text(cx, regionBottom + 6, '⇅ seret untuk menggulir', {
                fontFamily: 'monospace', fontSize: '11px', color: CFG.warnaRedup
            }).setOrigin(0.5).setDepth(CFG.depthUI);
        }

        // tombol Kembali (zona klik andal di scene overlay)
        this.#tombolKembali(cx, height - 44, this.mode === 'lanjut' ? 'Menu Utama ›' : '‹ Kembali');
        this.input.keyboard.once('keydown-ESC', () => this.#tutup());
    }

    #geser(d) {
        if (!Number.isFinite(d)) return;   // jaga-jaga: NaN → posisi container rusak → semua teks hilang
        this.scrollY = Phaser.Math.Clamp(this.scrollY + d, 0, this.maxScroll);
        this.isi.y = this.regionTop - this.scrollY;
    }

    #tombolKembali(x, y, teks) {
        const w = 200, h = 44;
        const kotak = this.add.rectangle(x, y, w, h, 0x4a2d70)
            .setStrokeStyle(2, 0x8a6fd6).setDepth(CFG.depthUI);
        this.add.text(x, y, teks, {
            fontFamily: 'monospace', fontSize: '18px', color: '#ffffff'
        }).setOrigin(0.5).setDepth(CFG.depthUI + 1);
        const zona = this.add.zone(x, y, w, h).setOrigin(0.5)
            .setDepth(CFG.depthUI + 2).setInteractive({ useHandCursor: true });
        zona.on('pointerover', () => kotak.setFillStyle(0x5a3785, 1));
        zona.on('pointerout',  () => kotak.setFillStyle(0x4a2d70, 1));
        zona.on('pointerup',   () => { this.#klik(); this.#tutup(); });   // pointerup: hindari bentrok dgn drag-scroll
    }

    #tutup() {
        const kembali = this.kembali;
        if (this.mode === 'lanjut') {
            this.cameras.main.fadeOut(500, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start(kembali));
        } else {
            this.scene.stop();
            if (kembali) this.scene.resume(kembali);
        }
    }

    // auto-scroll pelan saat kredit dibuka dari ending (mode 'lanjut'); berhenti kalau lagi diseret
    update(time, delta) {
        if (this.mode === 'lanjut' && !this._drag && this.scrollY < this.maxScroll) {
            this.#geser(CFG.autoScroll * (delta / 16.67));
        }
    }
}