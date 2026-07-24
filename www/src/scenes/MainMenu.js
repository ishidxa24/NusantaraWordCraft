// src/scenes/MainMenu.js

const CFG_AUDIO = {
    musik:     { key: 'menu_music',  file: 'assets/audio/music_background/MenuMusic_SFX.mp3', volume: 0.35 },
    klik:      { key: 'btn_click',   file: 'assets/audio/Button_click_SFX.mp3',               volume: 0.5  },
    fadeOut:   400,   // durasi musik memudar saat keluar menu (ms)
    jedaKlik:  120,   // jeda setelah klik sebelum pindah scene (biar bunyinya kedengeran)
};

export class MainMenu extends Phaser.Scene {

    constructor() {
        super('MainMenu');
    }

    preload() {
        this.load.image('bg1', 'assets/background/MainMenu/langit.png');  // ✅ langit
        this.load.image('bg4', 'assets/background/MainMenu/4.png');
        this.load.image('bg3', 'assets/background/MainMenu/3.png');
        this.load.image('bg2', 'assets/background/MainMenu/2.png');

        this.load.image('clouds', 'assets/background/MainMenu/awan.png'); // ✅ awan bergerak

        // ===== AUDIO =====
        this.load.audio(CFG_AUDIO.musik.key, CFG_AUDIO.musik.file);
        this.load.audio(CFG_AUDIO.klik.key,  CFG_AUDIO.klik.file);
    }

    create() {
        const { width, height } = this.scale;
        this._pindah = false;

        // ===== MUSIK MENU (loop) =====
        this.#mulaiMusik();

        // Langit (paling belakang)
        this.add.image(width / 2, height / 2, 'bg1').setDisplaySize(width, height);

        // AWAN bergerak — tileSprite supaya bisa di-scroll mulus berulang
        this.clouds = this.add.tileSprite(width / 2, height / 2, width, height, 'clouds');

        // Layer lain di depan awan
        this.add.image(width / 2, height / 2, 'bg4').setDisplaySize(width, height);
        this.add.image(width / 2, height / 2, 'bg3').setDisplaySize(width, height);
        this.add.image(width / 2, height / 2, 'bg2').setDisplaySize(width, height);

        // Judul (fade-in)
        // padding wajib buat "Press Start 2P": glyph-nya lebih tinggi dari
        // metrics yang dilaporkan font, tanpa padding bagian atas huruf kepotong
        const title = this.add.text(width / 2, height / 3, 'NUSANTARA WORDCRAFT', {
            fontFamily: '"Press Start 2P"',
            fontSize: '32px',
            color: '#FEEC41',
            padding: { x: 12, y: 12 }
        }).setOrigin(0.5);

        title.setAlpha(0);
        this.tweens.add({
            targets: title,
            alpha: 1,
            duration: 1000,
            ease: 'Power2'
        });

        // Tombol MULAI (TANPA animasi, sesuai permintaan)
        const startBtn = this.add.text(width / 2, height / 2 + 40, 'MULAI', {
            fontFamily: '"Press Start 2P"',
            fontSize: '20px',
            color: '#ffff',
            backgroundColor: '#1E104E',
            padding: { x: 48, y: 24 }
        }).setOrigin(0.5);

        startBtn.setInteractive({ useHandCursor: true });
        startBtn.on('pointerdown', () => this.#klikTombol(() => this.scene.start('IslandSelect')));
        startBtn.on('pointerover', () => startBtn.setColor('#ffffff'));
        startBtn.on('pointerout', () => startBtn.setColor('#ffd23f'));

        // === FIX FONT: render ulang teks begitu "Press Start 2P" siap ===
        this.paksaFontSiap([title, startBtn]);

        // ===== Tombol KREDIT (di bawah MULAI) =====
        const kreditBtn = this.add.text(width / 2, height / 2 + 135, 'KREDIT', {
            fontFamily: 'monospace', fontSize: '16px', color: '#ffffff',
            backgroundColor: '#1E104E', padding: { x: 26, y: 12 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        kreditBtn.on('pointerover', () => kreditBtn.setColor('#ffd23f'));
        kreditBtn.on('pointerout',  () => kreditBtn.setColor('#ffffff'));
        kreditBtn.on('pointerdown', () => {
            this.sound.play(CFG_AUDIO.klik.key, { volume: CFG_AUDIO.klik.volume });
            this.scene.pause();
            this.scene.launch('CreditsScene', { kembali: this.scene.key });
            this.scene.bringToTop('CreditsScene');
        });

        // ===== Tombol Setting (pojok kanan atas) =====
        const setBtn = this.add.circle(width - 44, 44, 22, 0x000000, 0.45)
            .setStrokeStyle(2, 0xffffff, 0.6)
            .setScrollFactor(0).setDepth(3000)
            .setInteractive({ useHandCursor: true });
        this.add.text(width - 44, 44, '⚙', {
            fontFamily: 'monospace', fontSize: '22px', color: '#ffffff'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(3001);
        setBtn.on('pointerdown', () => {
            this.sound.play(CFG_AUDIO.klik.key, { volume: CFG_AUDIO.klik.volume });
            this.scene.pause();
            this.scene.launch('SettingsScene', { kembali: this.scene.key });
            this.scene.bringToTop('SettingsScene');
        });
    }

    // ===== MUSIK: mulai kalau belum jalan (anti-dobel saat balik dari F6) =====
    #mulaiMusik() {
        const c = CFG_AUDIO.musik;
        let m = this.sound.get(c.key);
        if (!m) m = this.sound.add(c.key, { loop: true, volume: c.volume });
        if (!m.isPlaying) { m.setVolume(c.volume); m.play(); }
        this.musikMenu = m;
    }

    // ===== KLIK: bunyi → musik memudar → pindah scene =====
    #klikTombol(aksi) {
        if (this._pindah) return;      // cegah klik dobel
        this._pindah = true;

        this.sound.play(CFG_AUDIO.klik.key, { volume: CFG_AUDIO.klik.volume });

        const m = this.musikMenu;
        if (m && m.isPlaying) {
            this.tweens.add({
                targets: m, volume: 0, duration: CFG_AUDIO.fadeOut,
                onComplete: () => m.stop()
            });
        }

        this.time.delayedCall(CFG_AUDIO.jedaKlik, aksi);
    }

    paksaFontSiap(daftarTeks) {
        if (!document.fonts) return;   // browser lawas: skip aman
        document.fonts.load('16px "Press Start 2P"')
            .then(() => {
                daftarTeks.forEach(t => { if (t && t.active) t.updateText(); });
            })
            .catch(() => { /* font gagal load, biarkan fallback */ });
    }

    update() {
        // Gerakkan awan pelan ke kanan terus-menerus
        if (this.clouds) {
            this.clouds.tilePositionX -= 0.3;
        }
    }

}