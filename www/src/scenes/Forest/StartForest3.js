// src/scenes/Forest/StartForest3.js
// Forest 3 — COMBAT (vampir bawahan). HP bar seperti F5, TANPA boss/transform/quiz.
//   Konfigurasi scene ada di mapForest.js (cfgForest3).

import { Player } from '../../gameobject/Player.js';
import { Enemy } from '../../gameobject/Enemy.js';
import { DialogBox } from '../../gameobject/DialogBox.js';
import { dialogForest, cfgForest3, cfgMusik, cfgSfx } from '../../data/mapForest.js';
import { KontrolMobile } from '../../gameobject/KontrolMobile.js';

const A  = 'assets/background/Forest/AssetForest/';
const MC = 'assets/Forest_MC/';

const CFG = cfgForest3;

export class StartForest3 extends Phaser.Scene {

    constructor() { super('StartForest3'); }

    init(data) {
        this.cfg = CFG;
        this.koinAwal = (data && data.koin != null) ? data.koin : 0;
    }

    preload() {
        this.load.spritesheet('mc_idle', MC + 'Idle-Sheet.png',     { frameWidth: 64, frameHeight: 80 });
        this.load.spritesheet('mc_run',  MC + 'Run-Sheet.png',      { frameWidth: 80, frameHeight: 80 });
        this.load.spritesheet('mc_jump', MC + 'Jump-All-Sheet.png', { frameWidth: 64, frameHeight: 80 });
        this.load.spritesheet('mc_attack', MC + 'Attack-01-Sheet.png', { frameWidth: 96, frameHeight: 80 });
        this.load.spritesheet('mc_dead',   MC + 'mc_dead.png',         { frameWidth: 80, frameHeight: 80 });
        this.load.spritesheet('petir', 'assets/effects/petir_ungu.png', { frameWidth: 64, frameHeight: 128 });
        this.load.audio('sfx_thunder', 'assets/audio/sfx_thunder.mp3');
        this.load.audio('sfx_rain', 'assets/audio/sfx_rain.mp3');

        this.load.tilemapTiledJSON(this.cfg.mapKey, this.cfg.mapFile);
        this.cfg.tilesets.forEach(ts => this.load.image(ts.key, ts.file));

        if (!this.cache.audio.exists('btn_click'))
            this.load.audio('btn_click', 'assets/audio/Button_click_SFX.mp3');

        // NPC
        this.load.spritesheet('npc_gandalf', 'assets/bot/MapForest/Npc/npc-gandalf.png', { frameWidth: 64, frameHeight: 64 });

        // air animasi (4 frame, 16x16)
        this.load.spritesheet('air3', A + 'Sprite-0001.png', { frameWidth: 16, frameHeight: 16 });

        // vampir bawahan — 128x128
        const VB = 'assets/bot/MapForest/vampire_bawahan/';
        this.load.spritesheet('pelayan_idle',   VB + 'Idle.png',     { frameWidth: 128, frameHeight: 128 });
        this.load.spritesheet('pelayan_walk',   VB + 'Walk.png',     { frameWidth: 128, frameHeight: 128 });
        this.load.spritesheet('pelayan_attack', VB + 'Attack_1.png', { frameWidth: 128, frameHeight: 128 });
        this.load.spritesheet('pelayan_attack2', VB + 'Attack_2.png', { frameWidth: 128, frameHeight: 128 });
        this.load.spritesheet('pelayan_attack3', VB + 'Attack_3.png', { frameWidth: 128, frameHeight: 128 });
        this.load.spritesheet('pelayan_hurt',   VB + 'Hurt.png',     { frameWidth: 128, frameHeight: 128 });
        this.load.spritesheet('pelayan_dead',   VB + 'Dead.png',     { frameWidth: 128, frameHeight: 128 });

        // ===== SFX KARAKTER: F3 combat → jump + slash1 (belum ada knight) =====
        [cfgSfx.jump, cfgSfx.slash1, cfgSfx.pelayanDead, cfgSfx.pelayanSlash1, cfgSfx.pelayanSlash2, cfgSfx.step1, cfgSfx.step2].forEach(s => {
            if (!this.cache.audio.exists(s.key)) this.load.audio(s.key, s.file);
        });
        // ===== MUSIK F3 =====
        if (!this.cache.audio.exists(cfgMusik.forest3.key))
            this.load.audio(cfgMusik.forest3.key, cfgMusik.forest3.file);
    }

    create() {
        this.#buatSuasanaF3();
        this.#mulaiMusik();
        this.cameras.main.fadeIn(400, 0, 0, 0);

        // ===== MAP =====
        const map = this.make.tilemap({ key: this.cfg.mapKey });
        const tilesetObjs = this.cfg.tilesets.map(ts => map.addTilesetImage(ts.nama, ts.key));
        this.cfg.layerHias.forEach(nama => {
            const l = map.createLayer(nama, tilesetObjs, 0, 0);
            if (l) l.setScale(this.cfg.scale);
        });
        this.collisionLayers = [];
        this.cfg.layerCollision.forEach(nama => {
            const l = map.createLayer(nama, tilesetObjs, 0, 0);
            if (l) { l.setScale(this.cfg.scale); l.setCollisionByExclusion([-1, 0]); this.collisionLayers.push(l); }
        });
        const utama = this.collisionLayers[0];

        // ===== AIR ANIMASI =====
        {
            const airAtas = 630, airBawah = 720, lebarMap = 7200;
            this.air = this.add
                .tileSprite(lebarMap / 2, (airAtas + airBawah) / 2, lebarMap, airBawah - airAtas, 'air3', 0)
                .setDepth(-1).setTileScale(2.25, 2.25);
            this._f = 0;
            this.time.addEvent({
                delay: 130, loop: true,
                callback: () => { this._f = (this._f + 1) % 4; this.air.setTexture('air3', this._f); }
            });
        }

        // ===== SUASANA SORE MENUJU MALAM =====
        this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0xff7a3c, 0.12)
            .setOrigin(0).setScrollFactor(0).setDepth(79)
            .setBlendMode(Phaser.BlendModes.ADD);
        this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x141a3a, 0.40)
            .setOrigin(0).setScrollFactor(0).setDepth(80)
            .setBlendMode(Phaser.BlendModes.MULTIPLY);

        // ===== ANIM =====
        this.#buatAnim();

        // ===== PLAYER =====
        this.spawnX = this.cfg.spawnX; this.spawnY = this.cfg.spawnY;
        this.player = new Player(this, this.spawnX, this.spawnY);
        this.player.setDepth(5);
        this.collisionLayers.forEach(l => this.physics.add.collider(this.player, l));

        // ===== WORLD / KAMERA =====
        const lebar  = utama ? utama.displayWidth  : 7200;
        const tinggi = utama ? utama.displayHeight : 720;
        this.physics.world.setBounds(0, 0, lebar, tinggi);
        this.cameras.main.setBounds(0, 0, lebar, tinggi);
        this.cameras.main.startFollow(this.player, true);

        // ===== INPUT =====
        this.cursors   = this.input.keyboard.createCursorKeys();
        this.keySerang = this.input.keyboard.addKey('J');

        // ===== KONTROL MOBILE: gerak + JMP + A(attack) =====
        this.kontrol = new KontrolMobile(this, { attack: true, ngobrol: false, knight: false });
        this.kursor  = this.kontrol.buatKursor(this.cursors);

        // ===== HP BAR =====
        this.hpMax = this.cfg.hp.max;
        this.hp = this.hpMax;
        this.koin = this.koinAwal;
        this.barHp = this.add.graphics().setScrollFactor(0).setDepth(1000);
        this.lblHp = this.add.text(16, 12, 'HP', {
            fontFamily: 'monospace', fontSize: '14px', color: '#fff', stroke: '#000', strokeThickness: 3
        }).setScrollFactor(0).setDepth(1001);
        this.updateHpBar();

        // ===== CAHAYA (koin) =====
        this.lblKoin = this.add.text(16, 54, '✦ Cahaya: ' + this.koin, {
            fontFamily: 'monospace', fontSize: '14px', color: '#ffe08a', stroke: '#000', strokeThickness: 3
        }).setScrollFactor(0).setDepth(1001);

        // ===== STATE =====
        this.mati = false;
        this.kebal = false;
        this.menyerang = false;
        this.bisaSerang = true;
        this.sedangTransisi = false;
        this._gameover = false;
        this.fase = 'intro';
        this._introMulai = false;
        this.attackDamage = this.cfg.attack.damage;
        this.npc = null;
        this.autoJalan = true;   // MC auto-jalan masuk di awal scene

        // ===== DIALOG =====
        this.dialog = new DialogBox(this);

        // ===== MUSUH (disembunyikan dulu, muncul saat intro) =====
        this.enemies = [];
        this.cfg.musuh.forEach(m => {
            const e = new Enemy(this, m.x, this.cfg.musuhY, m.tipe);
            if (!e.sprite) return;
            e.sprite.setDepth(4);
            e.sprite.setVisible(false);
            this.collisionLayers.forEach(l => this.physics.add.collider(e.sprite, l));
            this.enemies.push(e);
        });

        // ===== PINTU (terkunci sampai combat selesai) =====
        this.pintu = this.add.rectangle(this.cfg.exitX, 420, 40, 180, 0x888888, 0.5)
            .setStrokeStyle(3, 0xd8b6ff);
        this.pintuTeks = this.add.text(this.cfg.exitX, 290, 'TERKUNCI\nKalahkan musuh', {
            fontFamily: 'monospace', fontSize: '14px',
            color: '#ffffff', stroke: '#000000', strokeThickness: 4, align: 'center'
        }).setOrigin(0.5);

        // ===== LABEL =====
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

    #buatAnim() {
        const A_ = (key, sheet, start, end, rate, repeat) => {
            if (!this.anims.exists(key) && this.textures.exists(sheet))
                this.anims.create({ key, frames: this.anims.generateFrameNumbers(sheet, { start, end }), frameRate: rate, repeat });
        };
        A_('idle', 'mc_idle', 0, 3, 6, -1);
        A_('run',  'mc_run',  0, 7, 12, -1);
        A_('jump', 'mc_jump', 0, 3, 10, 0);
        A_('mc_attack', 'mc_attack', 0, 7, 16, 0);
        A_('mc_dead',   'mc_dead',   0, 7, 10, 0);
        A_('pelayan_idle','pelayan_idle',0,4,6,-1); A_('pelayan_walk','pelayan_walk',0,7,10,-1);
        A_('pelayan_attack','pelayan_attack',0,4,12,0); A_('pelayan_hurt','pelayan_hurt',0,0,1,0); A_('pelayan_dead','pelayan_dead',0,7,8,0);
        A_('pelayan_attack2','pelayan_attack2',0,2,12,0);   // Attack_2 = 3 frame
        A_('pelayan_attack3','pelayan_attack3',0,3,12,0);   // Attack_3 = 4 frame
        if (!this.anims.exists('npc_idle') && this.textures.exists('npc_gandalf')) {
            this.anims.create({ key: 'npc_idle', frames: this.anims.generateFrameNumbers('npc_gandalf', { start: 0, end: 3 }), frameRate: 5, repeat: -1 });
        }
    }

    // ===== SUASANA MALAM SERAM — config di cfgForest3.suasana (mapForest.js) =====
    #buatSuasanaF3() {
        const su = this.cfg.suasana;
        if (!su) { this.cameras.main.setBackgroundColor('#4a3a5c'); return; }

        this.cameras.main.setBackgroundColor(su.langit);
        const W = this.scale.width, H = this.scale.height;

        // bulan merah pucat + halo
        if (su.bulan) {
            const b = su.bulan;
            const bx = W * b.x, by = H * b.y;
            b.halo.forEach(hl => {
                this.add.circle(bx, by, hl.r, b.warna, hl.a).setScrollFactor(0).setDepth(-20);
            });
            this.add.circle(bx, by, b.r, b.warna, 1).setScrollFactor(0).setDepth(-20);
            this.add.circle(bx - b.r * 0.3, by - b.r * 0.2, b.r * 0.18, 0x8a4a44, 0.7)
                .setScrollFactor(0).setDepth(-20);
            this.add.circle(bx + b.r * 0.25, by + b.r * 0.3, b.r * 0.12, 0x8a4a44, 0.6)
                .setScrollFactor(0).setDepth(-20);
        }

        // bintang redup, sedikit
        if (su.bintang) {
            const bt = su.bintang;
            for (let i = 0; i < bt.jumlah; i++) {
                const s = this.add.circle(
                    Phaser.Math.Between(0, W),
                    Phaser.Math.Between(0, H * bt.yMaks),
                    Phaser.Math.FloatBetween(bt.rMin, bt.rMaks),
                    0xffffff, Phaser.Math.FloatBetween(0.15, bt.alphaMaks ?? 0.5)
                ).setScrollFactor(0).setDepth(-20);
                if (bt.kedip && Math.random() < 0.6) {
                    this.tweens.add({
                        targets: s, alpha: 0.05,
                        duration: Phaser.Math.Between(1200, 2800),
                        yoyo: true, repeat: -1, delay: Phaser.Math.Between(0, 2000),
                    });
                }
            }
        }

        // kabut tipis melayang pelan (ellipse graphics, bolak-balik)
        if (su.kabut) {
            const k = su.kabut;
            for (let i = 0; i < k.jumlah; i++) {
                const kw = Phaser.Math.Between(k.wMin, k.wMaks);
                const kx = Phaser.Math.Between(0, W);
                const ky = Phaser.Math.Between(H * k.yMin, H * k.yMaks);
                const e = this.add.ellipse(kx, ky, kw, kw * 0.22, k.warna, k.alpha)
                    .setScrollFactor(0).setDepth(76);
                this.tweens.add({
                    targets: e, x: kx + Phaser.Math.Between(60, 140),
                    duration: Phaser.Math.Between(6000, 12000),
                    yoyo: true, repeat: -1, ease: 'Sine.inOut',
                    delay: Phaser.Math.Between(0, 3000),
                });
            }
        }

        // hujan: particle garis + suara loop
        if (su.hujan) {
            const hj = su.hujan;
            if (!this.textures.exists('tetes_hujan')) {
                const g = this.make.graphics({ x: 0, y: 0, add: false });
                g.fillStyle(0xaac4e8, 1).fillRect(0, 0, 2, 12);
                g.generateTexture('tetes_hujan', 2, 12);
                g.destroy();
            }
            this.add.particles(0, 0, 'tetes_hujan', {
                x: { min: -60, max: this.scale.width + 60 },
                y: -20,
                lifespan: 1000,
                speedY: { min: hj.kecepatan * 0.85, max: hj.kecepatan },
                speedX: { min: hj.miring, max: hj.miring * 0.6 },
                scale: { min: 0.6, max: 1 },
                alpha: { min: hj.alpha * 0.6, max: hj.alpha },
                quantity: 2,
                frequency: 28,
            }).setScrollFactor(0).setDepth(75);

            // suara hujan loop — di-stop saat scene shutdown/restart biar nggak numpuk
            if (this.cache.audio.exists('sfx_rain')) {
                this.hujanSfx = this.sound.add('sfx_rain', { volume: hj.volume, loop: true });
                this.hujanSfx.play();
                this.events.once('shutdown', () => { if (this.hujanSfx) this.hujanSfx.stop(); });
            }
        }

        // gelap pekat (MULTIPLY) — pengganti overlay lama
        if (su.gelap) {
            this.add.rectangle(0, 0, W, H, su.gelap.warna, su.gelap.alpha)
                .setOrigin(0).setScrollFactor(0).setDepth(80)
                .setBlendMode(Phaser.BlendModes.MULTIPLY);
        }

        // kilat sesekali: flash kamera + sprite petir menyambar
        if (su.kilat) {
            if (!this.anims.exists('petir_samber') && this.textures.exists('petir')) {
                this.anims.create({
                    key: 'petir_samber',
                    frames: this.anims.generateFrameNumbers('petir', { start: 0, end: 5 }),
                    frameRate: 18, repeat: 0
                });
            }
            const jadwalKilat = () => {
                this.time.delayedCall(Phaser.Math.Between(su.kilat.min, su.kilat.max), () => {
                    const [r, g, b] = su.kilat.warna;
                    this.cameras.main.flash(120, r, g, b);
                    this.sound.play('sfx_thunder', { volume: 0.15 });
                    this.time.delayedCall(180, () => this.cameras.main.flash(90, r, g, b));
                    if (this.anims.exists('petir_samber')) {
                        const px = Phaser.Math.Between(60, this.scale.width - 60);
                        const p = this.add.sprite(px, 128, 'petir')
                            .setScrollFactor(0).setDepth(77).setScale(1.6);
                        p.play('petir_samber');
                        p.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => p.destroy());
                    }
                    jadwalKilat();
                });
            };
            jadwalKilat();
        }
    }

    #mulaiMusik() {
        const m = cfgMusik.forest3;
        if (!m || !this.cache.audio.exists(m.key)) return;

        this.musik = this.sound.add(m.key, { loop: true, volume: 0 });
        this.musik.play();
        this.tweens.add({ targets: this.musik, volume: m.volume, duration: cfgMusik.fadeIn });

        // wajib: hentikan saat pindah/restart scene biar tidak menumpuk
        this.events.once('shutdown', () => { if (this.musik) { this.musik.stop(); this.musik.destroy(); this.musik = null; } });
    }

    #sisaMusuh() {
        return this.enemies.filter(e => !e.isDead).length;
    }

    // ===== INTRO: vampir muncul (fade in, hadap MC) → dialog → combat =====
    #mulaiIntroF3() {
        this._introMulai = true;
        this.player.setVelocity(0, 0);
        this.player.diam();
        this.cameras.main.flash(300, 120, 0, 40);

        this.enemies.forEach(e => {
            if (!e.sprite) return;
            e.sprite.setVisible(true).setAlpha(0);
            e.sprite.setFlipX(this.player.x < e.sprite.x);
            this.tweens.add({ targets: e.sprite, alpha: 1, duration: 500 });
        });

        this.dialog.tampil(dialogForest.f3Intro, () => {
            this.fase = 'combat';
        });
    }

    // ===== SERANG MC =====
    serang() {
        this.player.sfxSlash(); 
        if (this.menyerang || !this.bisaSerang || this.mati || this.fase !== 'combat') return;
        this.menyerang = true; this.bisaSerang = false;
        this.player.setVelocityX(0);
        if (this.anims.exists('mc_attack')) this.player.play('mc_attack', true);

        const arah = this.player.flipX ? -1 : 1;
        const hx = this.player.x + arah * (this.cfg.attack.w * 0.5 + 18);
        const hy = this.player.y + this.cfg.attack.offsetY;
        const hb = this.add.zone(hx, hy, this.cfg.attack.w, this.cfg.attack.h);
        this.physics.add.existing(hb);
        hb.body.setAllowGravity(false);

        const kena = new Set();
        this.enemies.forEach(e => {
            if (!e.sprite) return;
            this.physics.add.overlap(hb, e.sprite, () => {
                if (kena.has(e) || e.isDead) return;
                kena.add(e);
                e.takeDamage(this.attackDamage);
            });
        });

        this.time.delayedCall(this.cfg.attack.durasi, () => { hb.destroy(); this.menyerang = false; });
        this.time.delayedCall(this.cfg.attack.cooldown, () => { this.bisaSerang = true; });
    }

    // ===== HP BAR =====
    updateHpBar() {
        const x = 16, y = 30, w = 240, h = 18;
        const r = Phaser.Math.Clamp(this.hp / this.hpMax, 0, 1);
        const warna = r > 0.5 ? 0x36c44a : (r > 0.25 ? 0xe0a020 : 0xc81e3a);
        const g = this.barHp;
        g.clear();
        g.fillStyle(0x000000, 0.6).fillRect(x - 2, y - 2, w + 4, h + 4);
        g.fillStyle(0x3a1414, 1).fillRect(x, y, w, h);
        g.fillStyle(warna, 1).fillRect(x, y, w * r, h);
        g.lineStyle(2, 0xffffff, 0.25).strokeRect(x, y, w, h);
    }

    kenaSerang(jml = 1) {
        if (this.kebal || this.mati) return;
        this.kebal = true;
        this.hp -= this.cfg.hp.damage * jml;
        this.updateHpBar();
        this.tweens.add({ targets: this.player, alpha: 0.4, yoyo: true, repeat: 3, duration: 90,
            onComplete: () => this.player.setAlpha(1) });
        if (this.hp <= 0) { this.gameOver(); return; }
        this.time.delayedCall(this.cfg.iframe, () => { this.kebal = false; });
    }

    // ===== JURANG =====
    cekJurang() {
        const px = this.player.x, bawah = this.player.body.bottom;
        for (const z of this.cfg.zonaJurang) {
            if (px >= z.x1 && px <= z.x2 && bawah > z.batas) { this.kenaJurang(); return; }
        }
    }

    kenaJurang() {
        if (this.mati) return;
        this.mati = true;
        this.hp -= this.cfg.hp.jurang;
        this.updateHpBar();
        if (this.hp <= 0) { this.gameOver(); return; }
        this.player.respawn(this.spawnX, this.spawnY);
        this.time.delayedCall(300, () => { this.mati = false; });
    }

    // ===== TRANSISI: NPC muncul dekat MC → dialog → menghilang → buka pintu =====
    #mulaiTransisi() {
        this.fase = 'transisi';
        this.player.setVelocity(0, 0);
        this.player.diam();

        const nx = this.player.x + 130;
        const ny = this.player.body.bottom - 40;
        this.npc = this.add.sprite(nx, ny, this.cfg.npcSprite)
            .setScale(2.4).setDepth(6).setAlpha(0);
        this.npc.setFlipX(nx < this.player.x);
        if (this.anims.exists('npc_idle')) this.npc.play('npc_idle');

        this.tweens.add({ targets: this.npc, alpha: 1, duration: 500 });
        this.cameras.main.flash(260, 200, 220, 255);

        this.dialog.tampil(dialogForest.f3Npc, () => {
            this.cameras.main.flash(220, 200, 220, 255);
            if (this.npc) {
                this.tweens.add({
                    targets: this.npc, alpha: 0, y: this.npc.y - 50, duration: 600,
                    onComplete: () => { if (this.npc) { this.npc.destroy(); this.npc = null; } }
                });
            }
            this.fase = 'selesai';
            this.pintu.setFillStyle(0x4caf50, 0.6);
            this.pintuTeks.setText('PINTU TERBUKA →');
        });
    }

    cekPintu() {
        if (this.sedangTransisi || this.fase !== 'selesai') return;
        if (this.player.x >= this.cfg.exitX) {
            this.sedangTransisi = true;
            this.player.setVelocity(0, 0);
            this.cameras.main.fadeOut(500, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start(this.cfg.next, { koin: this.koin });
            });
        }
    }

    gameOver() {
        if (this._gameover) return;
        this._gameover = true;
        this.mati = true;
        this.player.setVelocity(0, 0);
        if (this.anims.exists('mc_dead')) {
            this.player.play('mc_dead', true);
            let sudah = false;
            const tampil = () => { if (!sudah) { sudah = true; this.#layarGagal(); } };
            this.player.once(Phaser.Animations.Events.ANIMATION_COMPLETE, tampil);
            this.time.delayedCall(2500, tampil);
        } else {
            this.time.delayedCall(900, () => this.#layarGagal());
        }
    }

    #layarGagal() {
        const cx = this.scale.width / 2, cy = this.scale.height / 2;
        this.add.text(cx, cy - 20, 'GAME OVER', {
            fontFamily: 'monospace', fontSize: '40px', color: '#fff', stroke: '#aa0000', strokeThickness: 6
        }).setOrigin(0.5).setScrollFactor(0).setDepth(3000);
        this.add.text(cx, cy + 30, 'Klik untuk ulang', {
            fontFamily: 'monospace', fontSize: '20px', color: '#fff', stroke: '#000', strokeThickness: 4
        }).setOrigin(0.5).setScrollFactor(0).setDepth(3000);
        this.input.once('pointerdown', () => this.scene.restart({ koin: this.koinAwal }));
    }

    update(time, delta) {
        if (this.mati) return;

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

        // dialog jalan → MC beku
        if (this.dialog && this.dialog.aktif) { if (this.player.diam) this.player.diam(); return; }

        // ===== AUTO-JALAN MASUK (awal scene) =====
        if (this.autoJalan) {
            if (this.player.x < this.cfg.jalanMasukX) {
                this.player.setVelocityX(this.player.speed);
                this.player.flipX = false;
                if (this.anims.exists('run')) this.player.play('run', true);
            } else {
                this.autoJalan = false;
                this.player.setVelocityX(0);
                this.player.diam();
            }
            return;
        }

        // intro: dialog vampir muncul saat MC mendekati area mereka
        if (this.fase === 'intro' && !this._introMulai
            && this.player.x >= this.cfg.introX && this.player.body.onFloor()) {
            this.#mulaiIntroF3();
            return;
        }

        this.cekJurang();

        // combat: update musuh + cek apakah semua kalah
        if (this.fase === 'combat') {
            this.enemies.forEach(e => {
                if (e.isDead || !e.update) return;
                e.update(this.player, delta);
            });
            if (this.#sisaMusuh() === 0) { this.#mulaiTransisi(); return; }
            if (Phaser.Input.Keyboard.JustDown(this.keySerang) || this.kontrol.attackJustDown()) this.serang();
        }

        this.cekPintu();

        if (this.menyerang) this.player.setVelocityX(0);
        else this.player.gerak(this.kursor);
    }
}