// src/scenes/Forest/StartForest6.js
// Forest 6 — ENDING. MC (masih wujud KNIGHT dari F5) auto-jalan masuk →
//   (opsional temui 2 archer) → temui Aurora → kembalikan Cahaya →
//   Aurora bantu lepas zirah (kembali jadi MC) → FAJAR → TAMAT → MainMenu.
//   Konfigurasi scene ada di mapForest.js (cfgForest6).

import { Player } from '../../gameobject/Player.js';
import { Hud } from '../../ui/Hud.js';
import { DialogBox } from '../../gameobject/DialogBox.js';
import { dialogForest, cfgForest6, cfgMusik, cfgSfx } from '../../data/mapForest.js';
import { KontrolMobile } from '../../gameobject/KontrolMobile.js';

const A  = 'assets/background/Forest/AssetForest/';
const A4 = A + 'assetForest4/';
const MC = 'assets/Forest_MC/';

const HP_MAX = 100;

const CFG = cfgForest6;

export class StartForest6 extends Phaser.Scene {

    constructor() { super('StartForest6'); }

    init(data) {
        this.cfg = CFG;
        this.koinAwal = (data && data.koin != null) ? data.koin : 0;
        this.skinAwal = (data && data.skin) ? data.skin : 'mc';   // wujud dibawa dari F5
    }

    preload() {
        this.load.spritesheet('mc_idle', MC + 'Idle-Sheet.png',     { frameWidth: 64, frameHeight: 80 });
        this.load.spritesheet('mc_run',  MC + 'Run-Sheet.png',      { frameWidth: 80, frameHeight: 80 });
        this.load.spritesheet('mc_jump', MC + 'Jump-All-Sheet.png', { frameWidth: 64, frameHeight: 80 });

        // ===== KNIGHT (wujud dibawa dari F5, dilepas saat ending) =====
        const PMC = MC + 'PowerUpMC/';
        this.load.spritesheet('knight_idle', PMC + 'Idle_sheet.png', { frameWidth: 80, frameHeight: 80 });
        this.load.spritesheet('knight_run',  PMC + 'Run_sheet.png',  { frameWidth: 80, frameHeight: 80 });
        this.load.spritesheet('knight_jump', PMC + 'Jump_sheet.png', { frameWidth: 80, frameHeight: 80 });

        this.load.tilemapTiledJSON(this.cfg.mapKey, this.cfg.mapFile);
        this.cfg.tilesets.forEach(ts => this.load.image(ts.key, ts.file));

        this.load.spritesheet('npc_gandalf', 'assets/bot/MapForest/Npc/npc-gandalf.png', { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet('archer', 'assets/bot/MapForest/npcForest4/GandalfHardcore_Archer_sheet.png', { frameWidth: 64, frameHeight: 64 });

        // ===== SFX KARAKTER: jump + transform (buat lepas zirah) =====
        [cfgSfx.jump, cfgSfx.transform, cfgSfx.step1, cfgSfx.step2].forEach(s => {
            if (!this.cache.audio.exists(s.key)) this.load.audio(s.key, s.file);
        });

        if (!this.cache.audio.exists('btn_click'))
            this.load.audio('btn_click', 'assets/audio/Button_click_SFX.mp3');

        if (!this.cache.audio.exists(cfgMusik.forest6.key))
            this.load.audio(cfgMusik.forest6.key, cfgMusik.forest6.file);
    }

    create() {
        this.#mulaiMusik();
        this.cameras.main.setBackgroundColor('#0b1020');   // mulai gelap (malam)
        this.cameras.main.fadeIn(500, 0, 0, 0);

        // ===== MAP =====
        const map = this.make.tilemap({ key: this.cfg.mapKey });
        const tilesetObjs = this.cfg.tilesets.map(ts => map.addTilesetImage(ts.nama, ts.key));
        this.cfg.layerHias.forEach(nama => {
            const l = map.createLayer(nama, tilesetObjs, 0, 0);
            if (l) l.setScale(this.cfg.scale); else console.warn('Layer hias tak ketemu:', nama);
        });
        this.collisionLayers = [];
        this.cfg.layerCollision.forEach(nama => {
            const l = map.createLayer(nama, tilesetObjs, 0, 0);
            if (l) { l.setScale(this.cfg.scale); l.setCollisionByExclusion([-1, 0]); this.collisionLayers.push(l); }
            else console.warn('Layer collision tak ketemu:', nama);
        });
        const utama = this.collisionLayers[0];

        // ===== BULAN + MATAHARI (background) =====
        this.#buatBulan();
        this.#buatMatahari();

        // ===== OVERLAY MALAM (di-fade jadi terang saat fajar) =====
        this.malam = this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x0a1030, 0.40)
            .setOrigin(0).setScrollFactor(0).setDepth(90)
            .setBlendMode(Phaser.BlendModes.MULTIPLY);
        this.cahayaBulan = this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x2a3a6a, 0.12)
            .setOrigin(0).setScrollFactor(0).setDepth(91)
            .setBlendMode(Phaser.BlendModes.ADD);

        // ===== ANIM =====
        if (!this.anims.exists('idle') && this.textures.exists('mc_idle'))
            this.anims.create({ key: 'idle', frames: this.anims.generateFrameNumbers('mc_idle', { start: 0, end: 3 }), frameRate: 6, repeat: -1 });
        if (!this.anims.exists('run') && this.textures.exists('mc_run'))
            this.anims.create({ key: 'run', frames: this.anims.generateFrameNumbers('mc_run', { start: 0, end: 7 }), frameRate: 12, repeat: -1 });
        if (!this.anims.exists('jump') && this.textures.exists('mc_jump'))
            this.anims.create({ key: 'jump', frames: this.anims.generateFrameNumbers('mc_jump', { start: 0, end: 3 }), frameRate: 10, repeat: 0 });
        if (!this.anims.exists('penyihir_idle') && this.textures.exists('npc_gandalf'))
            this.anims.create({ key: 'penyihir_idle', frames: this.anims.generateFrameNumbers('npc_gandalf', { start: 0, end: 3 }), frameRate: 5, repeat: -1 });
        if (!this.anims.exists('archer_idle') && this.textures.exists('archer'))
            this.anims.create({ key: 'archer_idle', frames: this.anims.generateFrameNumbers('archer', { start: 0, end: 4 }), frameRate: 5, repeat: -1 });

        // ===== PLAYER (masuk dengan wujud yang dibawa dari F5) =====
        this.spawnX = this.cfg.spawnX; this.spawnY = this.cfg.spawnY;
        this.player = new Player(this, this.spawnX, this.spawnY);
        this.player.setDepth(5);
        if (this.skinAwal === 'knight') this.player.setSkin('knight');
        this.collisionLayers.forEach(l => this.physics.add.collider(this.player, l));

        // ===== WORLD / KAMERA =====
        const lebar  = utama ? utama.displayWidth  : 3240;
        const tinggi = utama ? utama.displayHeight : 720;
        this.physics.world.setBounds(0, 0, lebar, tinggi);
        this.cameras.main.setBounds(0, 0, lebar, tinggi);
        this.cameras.main.startFollow(this.player, true);

        // ===== INPUT =====
        this.cursors  = this.input.keyboard.createCursorKeys();
        this.keySpace = this.input.keyboard.addKey('SPACE');

        // ===== KONTROL MOBILE: gerak + JMP + B (ngobrol archer) =====
        this.kontrol = new KontrolMobile(this, { attack: false, ngobrol: true, knight: false });
        this.kursor  = this.kontrol.buatKursor(this.cursors);

        // ===== HUD: HP + Cahaya (dibawa dari F5) =====
        this.hud = new Hud(this, { cahaya: this.koinAwal, hpMax: HP_MAX });

        // ===== ARCHER (2 NPC dekat tenda) =====
        this.archerSelesai = false;
        this.archers = this.cfg.archer.map(a => {
            const s = this.add.sprite(a.x, a.y, 'archer').setScale(2.7).setDepth(6);
            s.setFlipX(!!a.flip);
            if (this.anims.exists('archer_idle')) s.play('archer_idle');
            return s;
        });
        this.promptArcher = this.add.text(0, 0, '▼ Tekan SPACE / B', {
            fontFamily: 'monospace', fontSize: '13px',
            color: '#ffff00', stroke: '#000000', strokeThickness: 3
        }).setOrigin(0.5).setDepth(1400).setVisible(false);

        // ===== PENYIHIR (invisible dulu → fade in saat MC mendekat) =====
        this.penyihir = this.add.sprite(this.cfg.penyihirX, this.cfg.penyihirY, 'npc_gandalf')
            .setScale(2.6).setDepth(6).setAlpha(0);
        this.penyihir.setFlipX(false);   // hadap kiri, ke arah MC datang
        if (this.anims.exists('penyihir_idle')) this.penyihir.play('penyihir_idle');

        // ===== DIALOG =====
        this.dialog = new DialogBox(this);

        // ===== STATE =====
        this.mati = false;
        this.autoJalan = true;
        this.endingMulai = false;
        this.selesai = false;

        const label = this.add.text(this.scale.width / 2, 40, this.cfg.nama, {
            fontFamily: 'monospace', fontSize: '20px', color: '#ffffff', stroke: '#000', strokeThickness: 4
        }).setOrigin(0.5).setScrollFactor(0).setDepth(1500);
        this.time.delayedCall(1500, () => label.destroy());

        // ===== Tombol Setting (pojok kanan atas) =====
        this._setBtn = this.add.circle(this.scale.width - 44, 44, 22, 0x000000, 0.45)
            .setStrokeStyle(2, 0xffffff, 0.6)
            .setScrollFactor(0).setDepth(3000)
            .setInteractive({ useHandCursor: true });
        this._setIco = this.add.text(this.scale.width - 44, 44, '⚙', {
            fontFamily: 'monospace', fontSize: '22px', color: '#ffffff'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(3001);
        this._setBtn.on('pointerdown', () => {
            // jangan buka Setting saat sibuk (dialog/soal/cutscene/transisi/mati)
            this.sound.play('btn_click', { volume: 0.5 });
            if (this.mati || this.sedangTransisi || this._pindah || this.selesai) return;
            if ((this.dialog && this.dialog.aktif) || (this.quiz && this.quiz.aktif)
                || this.transforming || this.endingMulai || this.berlayar) return;
            this.scene.pause();
            this.scene.launch('SettingsScene', { kembali: this.scene.key });
            this.scene.bringToTop('SettingsScene');
        });
    }

    // ===== MUSIK F6: tema fajar =====
    #mulaiMusik() {
        const m = cfgMusik.forest6;
        if (!m || !this.cache.audio.exists(m.key)) return;
        this.musik = this.sound.add(m.key, { loop: true, volume: 0 });
        this.musik.play();
        this.tweens.add({ targets: this.musik, volume: m.volume, duration: cfgMusik.fadeIn });
        this.events.once('shutdown', () => { if (this.musik) { this.musik.stop(); this.musik.destroy(); this.musik = null; } });
    }

    // ===== MC menghadap ke sebuah objek (NPC) =====
    #hadapKe(obj) {
        if (!obj) return;
        this.player.setFlipX(obj.x < this.player.x);
    }

    #buatBulan() {
        const c = this.cfg.bulan;
        const m = this.add.container(c.x, c.y).setScrollFactor(c.scroll).setDepth(c.depth);
        for (let i = 5; i >= 1; i--) m.add(this.add.circle(0, 0, c.radius * (1 + i * 0.6), c.warna, 0.09));
        m.add(this.add.circle(0, 0, c.radius, 0xffffff, 1));   // bulan putih terang
        const kawah = 0xd9d4b0;
        m.add(this.add.circle(-c.radius * 0.30, -c.radius * 0.18, c.radius * 0.20, kawah, 0.45));
        m.add(this.add.circle( c.radius * 0.28,  c.radius * 0.10, c.radius * 0.13, kawah, 0.45));
        this.bulan = m;
    }

    #buatMatahari() {
        const x = this.scale.width - 180, y = 130, r = 54;
        const m = this.add.container(x, y).setScrollFactor(0).setDepth(-2).setAlpha(0);
        for (let i = 5; i >= 1; i--) m.add(this.add.circle(0, 0, r * (1 + i * 0.6), 0xffd27a, 0.06));
        m.add(this.add.circle(0, 0, r, 0xfff2c4, 1));
        m.add(this.add.circle(0, 0, r * 0.7, 0xffe9a8, 1));
        this.matahari = m;
    }

    // ===== ARCHER dialog (MC & archer saling hadap) =====
    #bukaArcher(archer) {
        this.player.setVelocity(0, 0);
        this.player.diam();
        this.#hadapKe(archer);
        archer.setFlipX(this.player.x < archer.x);
        this.promptArcher.setVisible(false);
        this.dialog.tampil(dialogForest.f6Archer, () => {
            this.archerSelesai = true;
        });
    }

    // ===== ENDING: penyihir fade in → dialog → lepas zirah → fajar → TAMAT =====
    #mulaiEnding() {
        this.endingMulai = true;
        this.player.setVelocity(0, 0);
        this.player.diam();
        this.#hadapKe(this.penyihir);
        this.penyihir.setFlipX(this.player.x > this.penyihir.x);
        this.promptArcher.setVisible(false);

        this.cameras.main.flash(400, 200, 220, 255);
        this.tweens.add({
            targets: this.penyihir, alpha: 1, duration: 700, ease: 'Sine.easeOut',
            onComplete: () => {
                this.dialog.tampil(dialogForest.f6Ending, () => this.#kembaliWujud());
            }
        });
    }

    // ===== LEPAS ZIRAH: Aurora bantu Liora kembali ke wujud asli =====
    #kembaliWujud() {
        // kalau (entah kenapa) masuk F6 sebagai mc, langsung fajar
        if (this.player.skin !== 'knight') { this.#fajar(); return; }

        this.dialog.tampil(dialogForest.f6Kembali1, () => {
            const p = this.player;
            p.setVelocity(0, 0);

            this.player.sfxTransform();          // 🔊 SFX transformasi (lepas zirah)
            this.cameras.main.flash(300, 200, 220, 255);
            p.setTintFill(0xffffff);
            const sx = p.scaleX, sy = p.scaleY;
            this.tweens.add({ targets: p, scaleX: sx * 1.15, scaleY: sy * 1.15, duration: 200, yoyo: true });

            this.time.delayedCall(230, () => {
                p.clearTint();
                p.setSkin('mc');                 // kembali ke wujud asli
                this.cameras.main.flash(180, 255, 240, 210);
            });

            this.time.delayedCall(900, () => {
                this.dialog.tampil(dialogForest.f6Kembali2, () => this.#fajar());
            });
        });
    }

    #fajar() {
        this.cameras.main.flash(600, 255, 240, 200);

        this.tweens.add({ targets: this.malam, alpha: 0, duration: 2500, ease: 'Sine.easeInOut' });
        if (this.cahayaBulan) this.tweens.add({ targets: this.cahayaBulan, alpha: 0, duration: 2000 });
        if (this.bulan) this.tweens.add({ targets: this.bulan, alpha: 0, duration: 1500 });

        this.tweens.addCounter({
            from: 0, to: 100, duration: 2500, ease: 'Sine.easeInOut',
            onUpdate: (tw) => {
                const t = tw.getValue() / 100;
                const c = Phaser.Display.Color.Interpolate.ColorWithColor(
                    new Phaser.Display.Color(11, 16, 32),
                    new Phaser.Display.Color(126, 192, 238),
                    100, t * 100
                );
                this.cameras.main.setBackgroundColor(Phaser.Display.Color.GetColor(c.r, c.g, c.b));
            }
        });

        if (this.matahari) {
            this.matahari.y += 40;
            this.tweens.add({ targets: this.matahari, alpha: 1, y: '-=40', duration: 2500, ease: 'Sine.easeOut' });
        }

        this.time.delayedCall(2800, () => this.#layarTamat());
    }

#layarTamat() {
        this.selesai = true;
        const cx = this.scale.width / 2, cy = this.scale.height / 2;

        this.add.rectangle(cx, cy, this.scale.width, this.scale.height, 0x000000, 0.45)
            .setScrollFactor(0).setDepth(2500);
        this.add.text(cx, cy - 70, '✦ TAMAT ✦', {
            fontFamily: 'monospace', fontSize: '44px', color: '#fff8e0', stroke: '#c88a1e', strokeThickness: 6
        }).setOrigin(0.5).setScrollFactor(0).setDepth(2501);
        this.add.text(cx, cy - 6, 'Hutan Nusantara telah pulih.', {
            fontFamily: 'monospace', fontSize: '18px', color: '#ffffff', stroke: '#000', strokeThickness: 4, align: 'center'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(2501);
        this.add.text(cx, cy + 40, 'Cahaya yang kau kembalikan:  ✦ ' + this.hud.koin, {
            fontFamily: 'monospace', fontSize: '22px', color: '#ffe08a', stroke: '#000', strokeThickness: 4
        }).setOrigin(0.5).setScrollFactor(0).setDepth(2501);
        const klik = this.add.text(cx, cy + 100, 'Klik / ketuk untuk kembali ke menu', {
            fontFamily: 'monospace', fontSize: '16px', color: '#ffffff', stroke: '#000', strokeThickness: 3
        }).setOrigin(0.5).setScrollFactor(0).setDepth(2501);
        this.tweens.add({ targets: klik, alpha: 0.3, yoyo: true, repeat: -1, duration: 600 });

        this.time.delayedCall(800, () => {
            this.input.once('pointerdown', () => {
                this.cameras.main.fadeOut(500, 0, 0, 0);
                this.cameras.main.once('camerafadeoutcomplete', () => {
                    // TAMAT → tampilkan credits (auto-scroll), lalu ke Menu Utama
                    this.scene.start('CreditsScene', { kembali: this.cfg.menuScene, mode: 'lanjut' });
                });
            });
        });
    }

    cekJurang() {
        const px = this.player.x, bawah = this.player.body.bottom;
        for (const z of this.cfg.zonaJurang) {
            if (px >= z.x1 && px <= z.x2 && bawah > z.batas) { this.kenaJurang(); return; }
        }
    }

    kenaJurang() {
        if (this.mati) return;
        this.mati = true;
        this.hud.kurangiHp(this.cfg.hpJurang);
        this.player.respawn(this.spawnX, this.spawnY);
        this.time.delayedCall(300, () => { this.mati = false; });
    }

    update() {
        if (this.mati || this.selesai) return;

        // auto-hide tombol kontrol saat dialog terbuka
        if (this.kontrol) this.kontrol.sembunyikan(this.dialog && this.dialog.aktif);

        // tombol Setting ikut sembunyi saat UI sibuk / cutscene
        if (this._setBtn) {
            const _sibuk = (this.dialog && this.dialog.aktif) || (this.quiz && this.quiz.aktif)
                || this.transforming || this.endingMulai || this.berlayar
                || this.sedangTransisi || this._pindah;
            this._setBtn.setVisible(!_sibuk);
            this._setIco.setVisible(!_sibuk);
        }

        if (this.dialog && this.dialog.aktif) { if (this.player.diam) this.player.diam(); return; }
        if (this.endingMulai) { this.player.setVelocityX(0); return; }

        // ===== AUTO-JALAN MASUK (anim run mengikuti wujud: mc / knight) =====
        if (this.autoJalan) {
            if (this.player.x < this.cfg.jalanMasukX) {
                this.player.setVelocityX(this.player.speed);
                this.player.flipX = false;
                const runKey = this.player.skin === 'knight' ? 'knight_run' : 'run';
                if (this.anims.exists(runKey)) this.player.play(runKey, true);
            } else {
                this.autoJalan = false;
                this.player.setVelocityX(0);
                this.player.diam();
            }
            return;
        }

        this.cekJurang();

        // trigger ending saat MC dekat penyihir
        if (!this.endingMulai && this.player.x >= this.cfg.triggerX && this.player.body.onFloor()) {
            this.#mulaiEnding();
            return;
        }

        // interaksi archer (opsional) — SPACE atau tombol B
        if (!this.archerSelesai && this.archers) {
            let dekat = null;
            for (const s of this.archers) {
                if (Math.abs(this.player.x - s.x) < 90) { dekat = s; break; }
            }
            if (dekat) {
                this.promptArcher.setPosition(dekat.x, dekat.y - 90).setVisible(true);
                if (Phaser.Input.Keyboard.JustDown(this.keySpace) || this.kontrol.ngobrolJustDown()) {
                    this.#bukaArcher(dekat);
                    return;
                }
            } else {
                this.promptArcher.setVisible(false);
            }
        }

        this.player.gerak(this.kursor);
    }
}