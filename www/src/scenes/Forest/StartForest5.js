import { Player } from '../../gameobject/Player.js';
import { Hud } from '../../ui/Hud.js';
import { Enemy } from '../../gameobject/Enemy.js';
import { DialogBox } from '../../gameobject/DialogBox.js';
import { dialogForest, cfgForest5, cfgMusik, cfgSfx } from '../../data/mapForest.js';
import { KontrolMobile } from '../../gameobject/KontrolMobile.js';

const A  = 'assets/background/Forest/AssetForest/';
const A4 = A + 'assetForest4/';
const MC = 'assets/Forest_MC/';

const HP_MAX = 100;

const CFG = cfgForest5;

export class StartForest5 extends Phaser.Scene {

    constructor() { super('StartForest5'); }

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
        this.load.spritesheet('petir', 'assets/effects/petir_merah.png', { frameWidth: 64, frameHeight: 128 });
        this.load.audio('sfx_thunder', 'assets/audio/sfx_thunder.mp3');
        this.load.audio('sfx_rain',    'assets/audio/sfx_rain.mp3');

        // ===== SFX KARAKTER + TAWA COUNTESS — config di cfgSfx (mapForest.js) =====
        [cfgSfx.jump, cfgSfx.slash1, cfgSfx.slash2, cfgSfx.transform, cfgSfx.countessLaugh, cfgSfx.countessDead, cfgSfx.pelayanDead, cfgSfx.zombieDead, cfgSfx.pelayanSlash1, cfgSfx.pelayanSlash2, cfgSfx.step1, cfgSfx.step2].forEach(s => {
            if (!this.cache.audio.exists(s.key)) this.load.audio(s.key, s.file);
        });

        const PMC = MC + 'PowerUpMC/';
        this.load.spritesheet('knight_idle',   PMC + 'Idle_sheet.png',    { frameWidth: 80, frameHeight: 80 });
        this.load.spritesheet('knight_run',    PMC + 'Run_sheet.png',     { frameWidth: 80, frameHeight: 80 });
        this.load.spritesheet('knight_jump',   PMC + 'Jump_sheet.png',    { frameWidth: 80, frameHeight: 80 });
        this.load.spritesheet('knight_attack', PMC + 'Attack1_sheet.png', { frameWidth: 86, frameHeight: 80 });
        this.load.spritesheet('knight_dead',   PMC + 'Dead_sheet.png',    { frameWidth: 80, frameHeight: 80 });
        this.load.spritesheet('knight_defend', PMC + 'Defend_sheet.png',  { frameWidth: 80, frameHeight: 80 });

        // === 3 sheet variasi attack knight (5 frame tiap sheet) ===
        this.load.spritesheet('knight_atk1', PMC + 'Attack1_sheet.png', { frameWidth: 86, frameHeight: 80 });
        this.load.spritesheet('knight_atk2', PMC + 'Attack2_sheet.png', { frameWidth: 86, frameHeight: 80 });
        this.load.spritesheet('knight_atk3', PMC + 'Attack3_sheet.png', { frameWidth: 80, frameHeight: 80 });

        this.load.tilemapTiledJSON(this.cfg.mapKey, this.cfg.mapFile);
        this.cfg.tilesets.forEach(ts => this.load.image(ts.key, ts.file));

        const VB = 'assets/bot/MapForest/vampire_bawahan/';
        const ZB = 'assets/bot/MapForest/zombie/';
        this.load.spritesheet('countess_idle',   'assets/boss_vampire/Idle.png',          { frameWidth: 128, frameHeight: 128 });
        this.load.spritesheet('countess_walk',   'assets/boss_vampire/Walk.png',          { frameWidth: 128, frameHeight: 128 });
        this.load.spritesheet('countess_attack', 'assets/boss_vampire/Attack_1.png',      { frameWidth: 128, frameHeight: 128 });
        this.load.spritesheet('countess_hurt',   'assets/boss_vampire/Hurt.png',          { frameWidth: 128, frameHeight: 128 });
        this.load.spritesheet('countess_dead',   'assets/boss_vampire/Dead.png',          { frameWidth: 128, frameHeight: 128 });
        this.load.spritesheet('blood_shot',      'assets/boss_vampire/Blood_Charge_1.png',{ frameWidth: 48,  frameHeight: 48 });
        this.load.spritesheet('pelayan_idle',   VB + 'Idle.png',     { frameWidth: 128, frameHeight: 128 });
        this.load.spritesheet('pelayan_walk',   VB + 'Walk.png',     { frameWidth: 128, frameHeight: 128 });
        this.load.spritesheet('pelayan_attack', VB + 'Attack_1.png', { frameWidth: 128, frameHeight: 128 });
        this.load.spritesheet('pelayan_attack2', VB + 'Attack_2.png', { frameWidth: 128, frameHeight: 128 });
        this.load.spritesheet('pelayan_attack3', VB + 'Attack_3.png', { frameWidth: 128, frameHeight: 128 });
        this.load.spritesheet('pelayan_hurt',   VB + 'Hurt.png',     { frameWidth: 128, frameHeight: 128 });
        this.load.spritesheet('pelayan_dead',   VB + 'Dead.png',     { frameWidth: 128, frameHeight: 128 });
        this.load.spritesheet('zombie_idle',   ZB + 'Idle.png',     { frameWidth: 96, frameHeight: 96 });
        this.load.spritesheet('zombie_walk',   ZB + 'Walk.png',     { frameWidth: 96, frameHeight: 96 });
        this.load.spritesheet('zombie_attack', ZB + 'Attack_1.png', { frameWidth: 96, frameHeight: 96 });
        this.load.spritesheet('zombie_hurt',   ZB + 'Hurt.png',     { frameWidth: 96, frameHeight: 96 });
        this.load.spritesheet('zombie_dead',   ZB + 'Dead.png',     { frameWidth: 96, frameHeight: 96 });

        // ===== MUSIK F5 + BOSS + TEMA COUNTESS (buat dialog kematian) =====
        if (!this.cache.audio.exists(cfgMusik.forest5.key))
            this.load.audio(cfgMusik.forest5.key, cfgMusik.forest5.file);
        if (!this.cache.audio.exists(cfgMusik.boss5.key))
            this.load.audio(cfgMusik.boss5.key, cfgMusik.boss5.file);
        if (!this.cache.audio.exists(cfgMusik.countess.key))
            this.load.audio(cfgMusik.countess.key, cfgMusik.countess.file);
        
        if (!this.cache.audio.exists('btn_click'))
            this.load.audio('btn_click', 'assets/audio/Button_click_SFX.mp3');
    }

    create() {
        this.#buatSuasanaF5();
        this.#mulaiMusik();
        this.cameras.main.fadeIn(400, 0, 0, 0);
        this.autoJalan = true;

        // tawa Countess (dipakai di intro)
        this.sfxLaugh = this.cache.audio.exists(cfgSfx.countessLaugh.key)
            ? this.sound.add(cfgSfx.countessLaugh.key, { volume: cfgSfx.countessLaugh.volume })
            : null;
        this.events.once('shutdown', () => { if (this.sfxLaugh) { this.sfxLaugh.destroy(); this.sfxLaugh = null; } });

        this.sfxDead = this.cache.audio.exists(cfgSfx.countessDead.key)
            ? this.sound.add(cfgSfx.countessDead.key, { volume: 0 })
            : null;
        this.events.once('shutdown', () => { if (this.sfxDead) { this.sfxDead.destroy(); this.sfxDead = null; } });

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

        this.#buatAnim();

        // ===== PLAYER =====
        this.spawnX = this.cfg.spawnX; this.spawnY = this.cfg.spawnY;
        this.player = new Player(this, this.spawnX, this.spawnY);
        this.player.setDepth(5);
        this.collisionLayers.forEach(l => this.physics.add.collider(this.player, l));

        const lebar  = utama ? utama.displayWidth  : 7200;
        const tinggi = utama ? utama.displayHeight : 720;
        this.physics.world.setBounds(0, 0, lebar, tinggi);
        this.cameras.main.setBounds(0, 0, lebar, tinggi);
        this.cameras.main.startFollow(this.player, true);

        // ===== INPUT ===== (K/transform DIHAPUS — transform kini otomatis saat terdesak)
        this.cursors  = this.input.keyboard.createCursorKeys();
        this.keySpace = this.input.keyboard.addKey('SPACE');
        this.keySerang = this.input.keyboard.addKey('J');
        this.keyDefend = this.input.keyboard.addKey('L');

        // ===== KONTROL MOBILE: gerak + JMP + A(serang). TF dihapus, DEF muncul saat knight =====
        this.kontrol = new KontrolMobile(this, { attack: true, ngobrol: false, transform: false, knight: false });
        this.kursor  = this.kontrol.buatKursor(this.cursors);

        // ===== HUD =====
        this.hud = new Hud(this, { cahaya: this.koinAwal, hpMax: HP_MAX });

        // ===== STATE =====
        this.mati = false;
        this.kebal = false;
        this.menyerang = false;
        this.bisaSerang = true;
        this.bertahan = false;
        this.sudahKnight = false;
        this.transforming = false;
        this._pindah = false;
        this._gameover = false;
        this.fase = 'intro';
        this._introMulai = false;
        this.attackDamage = this.cfg.attack.damage;

        this.comboIdx = 0;
        this._lastCombo = 0;

        // ===== DIALOG =====
        this.dialog = new DialogBox(this);

        // ===== MUSUH (disembunyikan dulu) =====
        this.proyektil = this.physics.add.group();
        this.enemies = [];
        this.boss = null;
        this.cfg.musuh.forEach(m => {
            const e = new Enemy(this, m.x, this.cfg.musuhY, m.tipe);
            if (!e.sprite) return;
            e.isBoss = !!m.boss;
            e.sprite.setDepth(4);
            this.collisionLayers.forEach(l => this.physics.add.collider(e.sprite, l));
            if (e.isBoss) {
                this.boss = e;
                e.sprite.setVisible(false);
                e.sprite.body.enable = false;
            } else {
                e.sprite.setVisible(false);
            }
            this.enemies.push(e);
        });

        this.collisionLayers.forEach(l =>
            this.physics.add.collider(this.proyektil, l, p => p.destroy()));
        this.physics.add.overlap(this.player, this.proyektil, (pl, p) => {
            p.destroy();
            this.kenaSerang(1);
        });

        // ===== BOSS BAR =====
        this.boxBoss = this.add.graphics().setScrollFactor(0).setDepth(1000).setVisible(false);
        this.lblBoss = this.add.text(this.scale.width / 2, 24, 'KANJENG RATU SIRNA',
            { fontFamily: 'monospace', fontSize: '16px', color: '#ffd9e0', stroke: '#000', strokeThickness: 3 })
            .setOrigin(0.5, 0).setScrollFactor(0).setDepth(1001).setVisible(false);

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

   // ===== SUASANA PUNCAK: malam mencekam — config di cfgForest5.suasana (mapForest.js) =====
    #buatSuasanaF5() {
        const su = this.cfg.suasana;
        if (!su) { this.cameras.main.setBackgroundColor('#0b1020'); return; }

        this.cameras.main.setBackgroundColor(su.langit);
        const W = this.scale.width, H = this.scale.height;

        // bulan darah + halo
        if (su.bulan) {
            const b = su.bulan;
            const bx = W * b.x, by = H * b.y;
            b.halo.forEach(hl => {
                this.add.circle(bx, by, hl.r, b.warna, hl.a).setScrollFactor(0).setDepth(-20);
            });
            this.add.circle(bx, by, b.r, b.warna, 1).setScrollFactor(0).setDepth(-20);
            this.add.circle(bx - b.r * 0.3, by - b.r * 0.2, b.r * 0.18, 0x7a2e2e, 0.7)
                .setScrollFactor(0).setDepth(-20);
            this.add.circle(bx + b.r * 0.25, by + b.r * 0.3, b.r * 0.12, 0x7a2e2e, 0.6)
                .setScrollFactor(0).setDepth(-20);
        }

        // kabut tebal melayang pelan
        if (su.kabut) {
            const k = su.kabut;
            for (let i = 0; i < k.jumlah; i++) {
                const kw = Phaser.Math.Between(k.wMin, k.wMaks);
                const kx = Phaser.Math.Between(0, W);
                const ky = Phaser.Math.Between(H * k.yMin, H * k.yMaks);
                const e = this.add.ellipse(kx, ky, kw, kw * 0.22, k.warna, k.alpha)
                    .setScrollFactor(0).setDepth(76);
                this.tweens.add({
                    targets: e, x: kx + Phaser.Math.Between(60, 150),
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

        // gelap pekat (MULTIPLY) + denyut "bernapas"
        if (su.gelap) {
            this.malam = this.add.rectangle(0, 0, W, H, su.gelap.warna, su.gelap.alpha)
                .setOrigin(0).setScrollFactor(0).setDepth(80)
                .setBlendMode(Phaser.BlendModes.MULTIPLY);
            if (su.denyut) {
                this.tweens.add({
                    targets: this.malam, fillAlpha: su.denyut.alphaMaks,
                    duration: su.denyut.durasi, yoyo: true, repeat: -1, ease: 'Sine.inOut',
                });
            }
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
                    // sprite petir di posisi acak atas layar
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

    // ===== MUSIK F5: fase horde =====
    #mulaiMusik() {
        const m = cfgMusik.forest5;
        if (!m || !this.cache.audio.exists(m.key)) return;
        this.musik = this.sound.add(m.key, { loop: true, volume: 0 });
        this.musik.play();
        this.tweens.add({ targets: this.musik, volume: m.volume, duration: cfgMusik.fadeIn });
        this.events.once('shutdown', () => { if (this.musik) { this.musik.stop(); this.musik.destroy(); this.musik = null; } });
    }

    // ===== MUSIK BOSS: musik horde memudar → tema Lethe masuk =====
    #mulaiMusikBoss() {
        if (this.musik && this.musik.isPlaying) {
            this.tweens.add({
                targets: this.musik, volume: 0, duration: cfgMusik.fadeOut,
                onComplete: () => { this.musik.stop(); }
            });
        }
        const b = cfgMusik.boss5;
        if (!b || !this.cache.audio.exists(b.key)) return;
        this.musikBoss = this.sound.add(b.key, { loop: true, volume: 0 });
        this.musikBoss.play();
        this.tweens.add({ targets: this.musikBoss, volume: b.volume, duration: cfgMusik.fadeIn });
        this.events.once('shutdown', () => { if (this.musikBoss) { this.musikBoss.stop(); this.musikBoss.destroy(); this.musikBoss = null; } });
    }

    // ===== MUSIK KEMATIAN COUNTESS: boss music memudar → tema Dialog_Countess masuk pelan =====
    #mulaiMusikKalah() {
        if (this.musikBoss && this.musikBoss.isPlaying) {
            this.tweens.add({
                targets: this.musikBoss, volume: 0, duration: cfgMusik.fadeOut,
                onComplete: () => { this.musikBoss.stop(); }
            });
        }
        const c = cfgMusik.countess;
        if (!c || !this.cache.audio.exists(c.key)) return;
        this.musikKalah = this.sound.add(c.key, { loop: true, volume: 0 });
        this.musikKalah.play();
        this.tweens.add({ targets: this.musikKalah, volume: c.volume, duration: cfgMusik.fadeIn });
        this.events.once('shutdown', () => { if (this.musikKalah) { this.musikKalah.stop(); this.musikKalah.destroy(); this.musikKalah = null; } });
    }

    #buatAnim() {
        const A_ = (key, sheet, start, end, rate, repeat) => {
            if (!this.anims.exists(key) && this.textures.exists(sheet))
                this.anims.create({ key, frames: this.anims.generateFrameNumbers(sheet, { start, end }), frameRate: rate, repeat });
        };
        A_('mc_attack', 'mc_attack', 0, 7, 16, 0);
        A_('mc_dead',   'mc_dead',   0, 7, 10, 0);
        A_('knight_attack', 'knight_attack', 0, 4, 16, 0);
        A_('knight_dead',   'knight_dead',   0, 5, 10, 0);
        A_('knight_defend', 'knight_defend', 0, 4, 12, 0);
        A_('knight_atk1', 'knight_atk1', 0, 4, 16, 0);
        A_('knight_atk2', 'knight_atk2', 0, 4, 16, 0);
        A_('knight_atk3', 'knight_atk3', 0, 4, 16, 0);
        A_('zombie_idle','zombie_idle',0,7,5,-1); A_('zombie_walk','zombie_walk',0,7,6,-1);
        A_('zombie_attack','zombie_attack',0,4,8,0); A_('zombie_hurt','zombie_hurt',0,2,8,0); A_('zombie_dead','zombie_dead',0,4,6,0);
        A_('pelayan_idle','pelayan_idle',0,4,6,-1); A_('pelayan_walk','pelayan_walk',0,7,10,-1);
        A_('pelayan_attack','pelayan_attack',0,4,12,0); A_('pelayan_hurt','pelayan_hurt',0,0,1,0); A_('pelayan_dead','pelayan_dead',0,7,8,0);
        A_('pelayan_attack2','pelayan_attack2',0,2,12,0);  
        A_('pelayan_attack3','pelayan_attack3',0,3,12,0);   
        A_('countess_idle','countess_idle',0,4,6,-1); A_('countess_walk','countess_walk',0,5,8,-1);
        A_('countess_attack','countess_attack',0,5,10,0); A_('countess_hurt','countess_hurt',0,1,8,0); A_('countess_dead','countess_dead',0,7,8,0);
        A_('blood_shot','blood_shot',0,3,12,-1);
    }

    #sisaBawahan() {
        return this.enemies.filter(e => !e.isBoss && !e.isDead).length;
    }

    // ===== INTRO: TAWA + kilat merah → Countess fade in (hadap MC) → dialog =====
    #mulaiIntro() {
        this._introMulai = true;
        this.player.setVelocity(0, 0);
        this.player.diam();

        const b = this.boss;
        if (b && b.sprite) {
            b.sprite.setPosition(this.player.x + 240, this.player.body.bottom - this.cfg.introLift);
            b.sprite.setVisible(true).setAlpha(0);
            b.sprite.play(b.cfg.keys.idle);
            b.sprite.setFlipX(this.player.x < b.sprite.x);
        }

        // 🔊 tawa Countess menggema bareng kilat merah
        if (this.sfxLaugh) this.sfxLaugh.play();
        this.cameras.main.flash(450, 140, 0, 30);

        if (b && b.sprite) {
            this.tweens.add({
                targets: b.sprite, alpha: 1, duration: 700, ease: 'Sine.easeOut',
                onComplete: () => this.#introDialog()
            });
        } else {
            this.#introDialog();
        }
    }

    #introDialog() {
        const b = this.boss;
        this.dialog.tampil(dialogForest.f5Intro, () => {
            if (b && b.sprite) {
                this.tweens.add({ targets: b.sprite, alpha: 0, duration: 500,
                    onComplete: () => b.sprite.setVisible(false) });
            }
            this.enemies.forEach(e => {
                if (e.isBoss || !e.sprite) return;
                e.sprite.setVisible(true).setAlpha(0);
                this.tweens.add({ targets: e.sprite, alpha: 1, duration: 400 });
            });
            this.fase = 'horde';
        });
    }

    #munculBoss() {
        this.fase = 'menuju_bos';
        const b = this.boss;
        if (b && b.sprite) {
            b.sprite.body.enable = true;
            b.sprite.setPosition(this.cfg.arenaX, this.cfg.arenaY);   // ← this.cfg.arenaY (pakai .cfg!)
            b.sprite.setVisible(true).setAlpha(0);
            b.sprite.play(b.cfg.keys.idle);
            b.sprite.setFlipX(true);
            this.tweens.add({ targets: b.sprite, alpha: 1, duration: 600 });
        }
    }

    #mulaiBangkit() {
        this.#mulaiMusikBoss();
        this.fase = 'bangkit';
        this.dialog.tampil(dialogForest.f5Bangkit, () => {
            if (this.boss && this.boss.sprite && this.boss.sprite.body)
                this.boss.sprite.body.setAllowGravity(false);
            this.fase = 'fight';
        });
    }

    // ===== TRANSFORMASI DARURAT: HP habis di fase fight → ingatan menjelma jadi zirah =====
    // (Janji Aurora di F4: "saat kau paling terdesak, panggil semua yang telah kau ingat")
    #transformDarurat() {
        if (this.sudahKnight) return;
        this.sudahKnight = true;
        this.transforming = true;
        this.kebal = true;                       // kebal selama sekuens biar nggak dihajar pas dialog
        const p = this.player;
        p.setVelocity(0, 0);
        p.diam();

        this.hud.setHp(1);                       // bertahan di ambang — belum pulih

        this.cameras.main.flash(320, 255, 255, 255);
        this.dialog.tampil(dialogForest.f5Transform, () => {
            this.player.sfxTransform();          // 🔊 SFX transformasi
            this.cameras.main.flash(260, 255, 255, 255);
            p.setTintFill(0xffffff);
            const sx = p.scaleX, sy = p.scaleY;
            this.tweens.add({ targets: p, scaleX: sx * 1.18, scaleY: sy * 1.18, duration: 200, yoyo: true });

            this.time.delayedCall(230, () => {
                p.clearTint();
                p.setSkin('knight');
                this.attackDamage = this.cfg.knight.damage;
                this.hud.setHp(Math.min(HP_MAX, this.cfg.knight.reviveHp));   // bangkit dengan HP baru
                this.cameras.main.flash(180, 200, 220, 255);
                this.kontrol.aturModeKnight(true);   // tombol DEF muncul di mobile
            });

            this.time.delayedCall(650, () => { this.transforming = false; });
            this.time.delayedCall(this.cfg.iframe + 650, () => { this.kebal = false; });
        });
    }

   #bossTumbang() {
        if (this.fase === 'menang') return;
        this.fase = 'menang';
        this.#mulaiMusikKalah();                 // 🎵 tema Countess masuk pelan untuk dialog kematian
        this.time.delayedCall(1300, () => {
            this.dialog.tampil(dialogForest.f5Kalah, () => {
                // 🔊 SFX kematian Countess: fade in pelan → fade out → lanjut F6
                const cd = cfgSfx.countessDead;
                if (this.sfxDead) {
                    this.sfxDead.play();
                    this.tweens.add({ targets: this.sfxDead, volume: cd.volume, duration: cd.fadeIn });
                    this.time.delayedCall(cd.fadeIn + 400, () => {
                        this.tweens.add({ targets: this.sfxDead, volume: 0, duration: cd.fadeOut });
                    });
                    // tunggu sekuens suara selesai baru pindah scene
                    this.time.delayedCall(cd.fadeIn + 400 + cd.fadeOut, () => this.toF6());
                } else {
                    this.toF6();
                }
            });
        });
    }

    serang() {
        if (this.menyerang || !this.bisaSerang || this.mati) return;
        this.menyerang = true; this.bisaSerang = false;
        this.player.setVelocityX(0);

        this.player.sfxSlash();   // 🔊 Slash1 (mc) / Slash2 (knight) — otomatis dari Player.js

        // pilih animasi + stat serangan
        let atkAnim, dmg, reachW, durasi, cooldown;
        if (this.player.skin === 'knight') {
            const now = this.time.now;
            if (now - this._lastCombo > this.cfg.knightCombo.resetMs) this.comboIdx = 0;
            this._lastCombo = now;

            const step = this.cfg.knightCombo.langkah[this.comboIdx];
            atkAnim  = step.anim;
            dmg      = step.dmg;
            reachW   = step.reach;
            durasi   = step.durasi;
            cooldown = step.cooldown;

            this.comboIdx = (this.comboIdx + 1) % this.cfg.knightCombo.langkah.length;
        } else {
            atkAnim  = 'mc_attack';
            dmg      = this.attackDamage;
            reachW   = this.cfg.attack.w;
            durasi   = this.cfg.attack.durasi;
            cooldown = this.cfg.attack.cooldown;
        }

        if (this.anims.exists(atkAnim)) this.player.play(atkAnim, true);

        const arah = this.player.flipX ? -1 : 1;
        const hx = this.player.x + arah * (reachW * 0.5 + 18);
        const hy = this.player.y + this.cfg.attack.offsetY;
        const hb = this.add.zone(hx, hy, reachW, this.cfg.attack.h);
        this.physics.add.existing(hb);
        hb.body.setAllowGravity(false);

        const kena = new Set();
        this.enemies.forEach(e => {
            if (!e.sprite) return;
            this.physics.add.overlap(hb, e.sprite, () => {
                if (kena.has(e) || e.isDead) return;
                kena.add(e);
                e.takeDamage(dmg);
            });
        });

        this.time.delayedCall(durasi, () => { hb.destroy(); this.menyerang = false; });
        this.time.delayedCall(cooldown, () => { this.bisaSerang = true; });
    }

    kenaSerang(jml = 1) {
        if (this.kebal || this.mati) return;
        this.kebal = true;
        const reduksi = this.bertahan ? this.cfg.knight.defendReduksi : 1;
        const sisa = this.hud.kurangiHp(this.cfg.hp.damage * jml * reduksi);
        this.tweens.add({ targets: this.player, alpha: 0.4, yoyo: true, repeat: 3, duration: 90,
            onComplete: () => this.player.setAlpha(1) });
        if (sisa <= 0) {
            // HP habis saat fase fight & belum knight → BUKAN game over: transformasi darurat!
            if (this.fase === 'fight' && !this.sudahKnight) { this.#transformDarurat(); return; }
            this.gameOver(); return;
        }
        this.time.delayedCall(this.cfg.iframe, () => { this.kebal = false; });
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
        const sisa = this.hud.kurangiHp(this.cfg.hp.jurang);
        if (sisa <= 0) {
            if (this.fase === 'fight' && !this.sudahKnight) {
                // jatuh jurang di fase fight → tetap dapat momen transformasi
                this.player.respawn(this.spawnX, this.spawnY);
                this.mati = false;
                this.#transformDarurat();
                return;
            }
            this.gameOver(); return;
        }
        this.player.respawn(this.spawnX, this.spawnY);
        this.time.delayedCall(300, () => { this.mati = false; });
    }

    updateBossBar() {
        const tampil = this.fase === 'fight' && this.boss && !this.boss.isDead && this.boss.sprite && this.boss.sprite.active;
        if (!tampil) { this.boxBoss.setVisible(false); this.lblBoss.setVisible(false); return; }
        const dekat = Math.abs(this.player.x - this.boss.sprite.x) < this.scale.width;
        this.boxBoss.setVisible(dekat); this.lblBoss.setVisible(dekat);
        if (!dekat) return;
        const W = this.scale.width * 0.5, H = 16, X = (this.scale.width - W) / 2, Y = 44;
        const rasio = Phaser.Math.Clamp(this.boss.hp / this.boss.hpMax, 0, 1);
        this.boxBoss.clear();
        this.boxBoss.fillStyle(0x000000, 0.6).fillRect(X - 2, Y - 2, W + 4, H + 4);
        this.boxBoss.fillStyle(0x4a0d1a, 1).fillRect(X, Y, W, H);
        this.boxBoss.fillStyle(0xc81e3a, 1).fillRect(X, Y, W * rasio, H);
    }

    toF6() {
        if (this._pindah) return;
        this._pindah = true;
        this.cameras.main.fadeOut(600, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
            if (this.scene.manager.keys[this.cfg.next]) {
                // bawa Cahaya + wujud (knight/mc) ke F6
                this.scene.start(this.cfg.next, { koin: this.hud.koin, skin: this.player.skin });
            } else {
                this.scene.restart({ koin: this.koinAwal });
            }
        });
    }

    gameOver() {
        if (this._gameover) return;
        this._gameover = true;
        this.mati = true;
        this.player.setVelocity(0, 0);
        const deadAnim = this.player.skin === 'knight' ? 'knight_dead' : 'mc_dead';
        if (this.anims.exists(deadAnim)) {
            this.player.play(deadAnim, true);
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

        // auto-hide tombol kontrol saat dialog terbuka / sedang transform
        if (this.kontrol) this.kontrol.sembunyikan(
            (this.dialog && this.dialog.aktif) || this.transforming
        );
        

        if (this.dialog && this.dialog.aktif) { if (this.player.diam) this.player.diam(); return; }
        if (this.transforming) { this.player.setVelocityX(0); return; }

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

        if (this.fase === 'intro' && !this._introMulai && this.player.x > this.cfg.introX && this.player.body.onFloor()) { this.#mulaiIntro(); return; }
        if (this.fase === 'horde' && this.#sisaBawahan() === 0) { this.#munculBoss(); }
        if (this.fase === 'menuju_bos' && this.player.x > this.cfg.bangkitX && this.player.body.onFloor()) { this.#mulaiBangkit(); return; }

        this.cekJurang();

        this.enemies.forEach(e => {
            if (e.isDead || !e.update) return;
            if (e.isBoss) { if (this.fase === 'fight') e.update(this.player, delta); }
            else          { if (this.fase === 'horde') e.update(this.player, delta); }
        });
        this.updateBossBar();

        if (this.fase === 'fight' && this.boss && (this.boss.isDead || this.boss.hp <= 0)) {
            this.#bossTumbang();
        }

        if (Phaser.Input.Keyboard.JustDown(this.keySerang) || this.kontrol.attackJustDown()) this.serang();

        const sedangDefend = this.player.skin === 'knight'
                          && (this.keyDefend.isDown || this.kontrol.tangkis.isDown)
                          && this.player.body.blocked.down && !this.menyerang;
        if (sedangDefend) {
            if (!this.bertahan) {
                this.bertahan = true;
                if (this.anims.exists('knight_defend')) this.player.play('knight_defend', true);
            }
            this.player.setVelocityX(0);
        } else {
            this.bertahan = false;
            if (this.menyerang) this.player.setVelocityX(0);
            else this.player.gerak(this.kursor);
        }
    }
}