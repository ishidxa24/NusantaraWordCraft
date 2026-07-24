// src/scenes/IslandSelect.js

const CFG_AUDIO = {
    musik:    { key: 'menu_music', file: 'assets/audio/music_background/MenuMusic_SFX.mp3', volume: 0.35 },
    klik:     { key: 'btn_click',  file: 'assets/audio/Button_click_SFX.mp3',               volume: 0.5  },
    fadeOut:  400,   // musik memudar saat masuk gameplay (ms)
    jedaKlik: 120,   // jeda setelah klik sebelum pindah scene
};

export class IslandSelect extends Phaser.Scene {

    constructor() {
        super('IslandSelect');
    }

    preload() {
        this.load.image('goa', 'assets/image_island/Goa.png');
        this.load.image('hutan', 'assets/image_island/hutan.png');
        this.load.image('jungle', 'assets/image_island/Jungle.png');

        // ===== AUDIO (dimuat kalau belum ada di cache) =====
        if (!this.cache.audio.exists(CFG_AUDIO.musik.key))
            this.load.audio(CFG_AUDIO.musik.key, CFG_AUDIO.musik.file);
        if (!this.cache.audio.exists(CFG_AUDIO.klik.key))
            this.load.audio(CFG_AUDIO.klik.key, CFG_AUDIO.klik.file);
    }

    create() {
        const { width, height } = this.scale;

        this._pindah = false;
        this.musikMenu = this.sound.get(CFG_AUDIO.musik.key);   // musik lanjut dari MainMenu

        // ===== CFG: nilai yang bisa diatur =====
        const CFG = {
            skala:       0.38,   // skala normal pulau
            skalaHover:  0.42,   // skala saat hover (pulau kebuka)
            gap:         420,    // jarak antar pulau dari tengah
            lockTint:    0x555555, // warna redup pulau terkunci
            lockAlpha:   0.55,   // transparansi pulau terkunci
            toastDurasi: 1800,   // lama toast tampil (ms)
        };

        // === Background laut dari kode (gradien) ===
        const bg = this.add.graphics();
        bg.fillGradientStyle(0x0a2a4a, 0x0a2a4a, 0x1a5a8a, 0x1a5a8a, 1);
        bg.fillRect(0, 0, width, height);

        // Garis ombak dekoratif
        bg.lineStyle(2, 0x2a6a9a, 0.3);
        for (let i = 0; i < 8; i++) {
            const y = 120 + i * 80;
            bg.lineBetween(0, y, width, y);
        }

        // === Judul ===
        this.add.text(width / 2, 70, 'PILIH MAP', {
            fontFamily: '"Press Start 2P"',
            fontSize: '28px',
            color: '#ffd23f'
        }).setOrigin(0.5);

        // === 3 Map (Goa & Jungle terkunci) ===
        const maps = [
            { key: 'goa',    x: width / 2 - CFG.gap, nama: 'GOA',    target: 'Start', locked: true },
            { key: 'hutan',  x: width / 2,           nama: 'FOREST', target: 'Start', locked: false },
            { key: 'jungle', x: width / 2 + CFG.gap, nama: 'JUNGLE', target: 'Start', locked: true },
        ];

        maps.forEach((p) => {
            const y = height / 2;

            const img = this.add.image(p.x, y, p.key).setScale(CFG.skala);
            img.setInteractive({ useHandCursor: true });

            const label = this.add.text(p.x, y + 150, p.nama, {
                fontFamily: '"Press Start 2P"',
                fontSize: '16px',
                color: '#ffffff'
            }).setOrigin(0.5);

            if (p.locked) {
                // --- Tampilan terkunci: redup + gembok ---
                img.setTint(CFG.lockTint).setAlpha(CFG.lockAlpha);
                label.setColor('#888888');

                const gembok = this.add.text(p.x, y - 10, '🔒', {
                    fontFamily: 'monospace',
                    fontSize: '48px'
                }).setOrigin(0.5).setDepth(5);

                img.on('pointerover', () => {
                    // goyang halus, tanpa membesar / ganti warna
                    this.tweens.add({
                        targets: [img, gembok],
                        x: '+=4',
                        duration: 60, yoyo: true, repeat: 2,
                    });
                });

                img.on('pointerdown', () => {
                    this.bunyiKlik();   // tetap bunyi, tapi tak pindah scene
                    this.tampilToast('Segera hadir, tunggu ya! 🔒', width, height, CFG.toastDurasi);
                });

            } else {
                // --- Pulau kebuka: perilaku normal ---
                img.on('pointerover', () => {
                    img.setScale(CFG.skalaHover);
                    label.setColor('#ffd23f');
                });
                img.on('pointerout', () => {
                    img.setScale(CFG.skala);
                    label.setColor('#ffffff');
                });
                img.on('pointerdown', () => {
                    // masuk gameplay → musik menu memudar lalu berhenti
                    this.klikTombol(() => this.scene.start(p.target), true);
                });
            }
        });

        // === Tombol Kembali ===
        const backBtn = this.add.text(40, 40, '< KEMBALI', {
            fontFamily: '"Press Start 2P"',
            fontSize: '14px',
            color: '#aaaaaa'
        });
        backBtn.setInteractive({ useHandCursor: true });
        backBtn.on('pointerover', () => backBtn.setColor('#ffffff'));
        backBtn.on('pointerout', () => backBtn.setColor('#aaaaaa'));
        // balik ke menu → musik JANGAN dihentikan (masih di area menu)
        backBtn.on('pointerdown', () => this.klikTombol(() => this.scene.start('MainMenu'), false));
    }

    // ===== bunyi klik saja (tanpa pindah scene) =====
    bunyiKlik() {
        if (this.cache.audio.exists(CFG_AUDIO.klik.key))
            this.sound.play(CFG_AUDIO.klik.key, { volume: CFG_AUDIO.klik.volume });
    }

    // ===== klik → bunyi → (opsional) musik fade → pindah scene =====
    // ===== klik → bunyi → (opsional) musik fade → pindah scene =====
    klikTombol(aksi, stopMusik) {
        if (this._pindah) return;      // cegah klik dobel
        this._pindah = true;

        this.bunyiKlik();

        const m = this.musikMenu;
        if (stopMusik && m && m.isPlaying) {
            // fade dulu SAMPAI SELESAI, baru pindah scene.
            // (kalau scene pindah duluan, tween ikut hancur & musik tak pernah berhenti)
            this.tweens.add({
                targets: m, volume: 0, duration: CFG_AUDIO.fadeOut,
                onComplete: () => { m.stop(); aksi(); }
            });
            // jaring pengaman: kalau scene tetap ditutup lebih dulu, paksa stop
            this.events.once('shutdown', () => { if (m.isPlaying) m.stop(); });
            return;
        }

        this.time.delayedCall(CFG_AUDIO.jedaKlik, aksi);
    }

    // ===== Toast kecil di bawah tengah, auto-ilang =====
    tampilToast(pesan, width, height, durasi) {
        // kalau masih ada toast lama, hapus dulu biar nggak numpuk
        if (this.toastAktif) { this.toastAktif.destroy(); this.toastAktif = null; }

        const t = this.add.text(width / 2, height - 60, pesan, {
            fontFamily: '"Press Start 2P"',
            fontSize: '13px',
            color: '#ffffff',
            backgroundColor: '#000000cc',
            padding: { x: 16, y: 12 },
        }).setOrigin(0.5).setDepth(100).setAlpha(0);

        this.toastAktif = t;

        this.tweens.add({
            targets: t, alpha: 1, y: height - 70,
            duration: 200, ease: 'Back.out',
            onComplete: () => {
                this.time.delayedCall(durasi, () => {
                    if (!t.active) return;
                    this.tweens.add({
                        targets: t, alpha: 0, y: height - 60, duration: 250,
                        onComplete: () => { t.destroy(); if (this.toastAktif === t) this.toastAktif = null; }
                    });
                });
            }
        });
    }

}