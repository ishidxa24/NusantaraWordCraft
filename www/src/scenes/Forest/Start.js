// src/scenes/Forest/Start.js
import { Player } from '../../gameobject/Player.js';
import { MatchingPanel } from '../../ui/MatchingPanel.js';
import { LengkapiPanel } from '../../ui/LengkapiPanel.js';
import { Hud } from '../../ui/Hud.js';
import { setSoal, pasanganForest } from '../../data/soalForest.js';
import { setLengkapi } from '../../data/lengkapiForest.js';
import { segmenForest, dialogForest, suasanaForest, cfgMusik, cfgSfx } from '../../data/mapForest.js';
import { DialogBox } from '../../gameobject/DialogBox.js';
import { KontrolMobile } from '../../gameobject/KontrolMobile.js';
import { Awan } from '../../gameobject/Awan.js';

const CFG_F2 = {
    jarakTrigger:    1450,
    countessOffsetX: 160,
    countessLift:    120,
    countessScale:   1.9,
};

// ===== AURORA: muncul transisi (fade-in) di posisi TETAP (mapForest), lalu dialog + soal =====
const CFG_PENYIHIR = {
    offsetX: 150,   // trigger muncul sejauh ini SEBELUM posisi Aurora
    lift:    40,    // dipakai kalau npc di mapForest TIDAK punya y (ikut tanah MC)
    scale:   2.4,
};

// jeda setelah MC mendarat sebelum monolog muncul (ms)
const JEDA_MONOLOG = 700;

// ===== AIR TERJUN vertikal — animasi scroll ke bawah (null = mati) =====
const CFG_AIR = {
    aktifDiSegmen: null,
    x: 470, y: 188,
    lebar: 435, tinggi: 1066,
    kecepatan: 2,
    tileScale: 2.25,
    depth: 1,
};

// ===== AIR KOLAM: satu bentangan selebar map (di belakang tanah, nongol di lubang) =====
const CFG_KOLAM = {
    permukaanY: { 0: 600, 1: 600 },   // angka KECIL = air NAIK; angka BESAR = air TURUN
    dasarY: 720,
    delayAnim: 130,
    tileScale: 2.25,
    depth: -2,
};

const GELAP_ALPHA = [0.0, 0.14];
const HP_MAX = 100;
const HP_JATUH = 25;

function keDialogBox(arr, nama) {
    return (arr || []).map(t => ({ nama, teks: t }));
}

export class Start extends Phaser.Scene {

    constructor() { super('Start'); }

    init(data) {
        this.idxSegmen = (data && data.idx != null) ? data.idx : 0;
        this.cfg = segmenForest[this.idxSegmen];
        this.koinAwal = (data && data.koin != null) ? data.koin : 0;
    }

    preload() {
        this.load.spritesheet('mc_idle', 'assets/Forest_MC/Idle-Sheet.png', { frameWidth: 64, frameHeight: 80 });
        this.load.spritesheet('mc_run',  'assets/Forest_MC/Run-Sheet.png',  { frameWidth: 80, frameHeight: 80 });
        this.load.spritesheet('mc_jump', 'assets/Forest_MC/Jump-All-Sheet.png', { frameWidth: 64, frameHeight: 80 });

        this.load.tilemapTiledJSON(this.cfg.mapKey, this.cfg.mapFile);
        this.cfg.tilesets.forEach(ts => this.load.image(ts.key, ts.file));
        (this.cfg.npcSprites || []).forEach(s => {
            this.load.spritesheet(s.key, s.file, { frameWidth: s.frameW, frameHeight: s.frameH });
        });

        // awan F1
        if (this.idxSegmen === 0) {
            for (let i = 1; i <= 6; i++)
                this.load.image('cloud' + i, 'assets/background/Forest/AssetForest/cloud' + i + '.png');
        }

        this.load.image('air_terjun_baru', 'assets/background/Forest/AssetForest/air_terjun_baru.png');
        this.load.spritesheet('air_kolam', 'assets/background/Forest/AssetForest/Sprite-0001.png', { frameWidth: 16, frameHeight: 16 });

        if (this.idxSegmen === 1) {
            this.load.spritesheet('countess_idle', 'assets/boss_vampire/Idle.png', { frameWidth: 128, frameHeight: 128 });
        }

        if (!this.cache.audio.exists('btn_click'))
            this.load.audio('btn_click', 'assets/audio/Button_click_SFX.mp3');

        if (!this.cache.audio.exists(cfgSfx.jump.key))
            this.load.audio(cfgSfx.jump.key, cfgSfx.jump.file);

        // ===== MUSIK segmen ini (kalau ada) =====
        const mus = cfgMusik.segmen[this.idxSegmen];
        if (mus && !this.cache.audio.exists(mus.key)) this.load.audio(mus.key, mus.file);

        if (this.idxSegmen === 1 && !this.cache.audio.exists(cfgMusik.countess.key))
            this.load.audio(cfgMusik.countess.key, cfgMusik.countess.file);
        
        [cfgSfx.step1, cfgSfx.step2].forEach(s => {
            if (!this.cache.audio.exists(s.key)) this.load.audio(s.key, s.file);
        });

        // gunung latar F2
        if (this.idxSegmen === 1)
            this.load.image('gunung_f2', 'assets/background/Forest/AssetForest/3.png');

    }

    create() {
        this.awan = (this.idxSegmen === 0) ? new Awan(this) : null;
        this.#buatSuasana();
        this.#mulaiMusik();
        this.cameras.main.fadeIn(400, 0, 0, 0);

        const map = this.make.tilemap({ key: this.cfg.mapKey });
        const tilesetObjs = this.cfg.tilesets.map(ts => map.addTilesetImage(ts.nama, ts.key));

        // ===== AIR KOLAM: satu bentangan selebar map (dibuat DULU, depth -2) =====
        this.airKolam = null;
        const permukaan = CFG_KOLAM.permukaanY[this.idxSegmen];
        if (permukaan != null) {
            const lebarMap = 4320;
            const h = CFG_KOLAM.dasarY - permukaan;
            this.airKolam = this.add.tileSprite(lebarMap / 2, permukaan + h / 2, lebarMap, h, 'air_kolam', 0)
                .setDepth(CFG_KOLAM.depth)
                .setTileScale(CFG_KOLAM.tileScale, CFG_KOLAM.tileScale);
            this._fAirKolam = 0;
            this.time.addEvent({
                delay: CFG_KOLAM.delayAnim, loop: true,
                callback: () => {
                    this._fAirKolam = (this._fAirKolam + 1) % 4;
                    if (this.airKolam) this.airKolam.setTexture('air_kolam', this._fAirKolam);
                }
            });
        }

        this.cfg.layerHias.forEach(nama => {
            const l = map.createLayer(nama, tilesetObjs, 0, 0);
            if (l) l.setScale(2.25);
        });

        this.collisionLayers = [];
        this.cfg.layerCollision.forEach(nama => {
            const l = map.createLayer(nama, tilesetObjs, 0, 0);
            if (l) { l.setScale(2.25); l.setCollisionByExclusion([-1, 0]); this.collisionLayers.push(l); }
        });
        const utama = this.collisionLayers[0];

        (this.cfg.layerHiasDepan || []).forEach(nama => {
            const l = map.createLayer(nama, tilesetObjs, 0, 0);
            if (l) l.setScale(2.25);
        });

        // ===== AIR TERJUN vertikal (mati kalau aktifDiSegmen null) =====
        if (CFG_AIR.aktifDiSegmen != null && this.idxSegmen === CFG_AIR.aktifDiSegmen) {
            this.airTerjun = this.add.tileSprite(CFG_AIR.x, CFG_AIR.y, CFG_AIR.lebar, CFG_AIR.tinggi, 'air_terjun_baru')
                .setDepth(CFG_AIR.depth)
                .setTileScale(CFG_AIR.tileScale, CFG_AIR.tileScale);
        }

        const gelapAlpha = GELAP_ALPHA[this.idxSegmen] ?? 0;
        if (gelapAlpha > 0) {
            this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x1a1030, gelapAlpha)
                .setOrigin(0).setScrollFactor(0).setDepth(80)
                .setBlendMode(Phaser.BlendModes.MULTIPLY);
        }

        this.spawnX = this.cfg.spawnX;
        this.spawnY = this.cfg.spawnY;
        this.player = new Player(this, this.spawnX, this.spawnY);
        this.collisionLayers.forEach(l => this.physics.add.collider(this.player, l));

        const lebar = utama ? utama.displayWidth : 2160;
        const tinggi = utama ? utama.displayHeight : 720;
        this.physics.world.setBounds(0, 0, lebar, tinggi);
        this.cameras.main.setBounds(0, 0, lebar, tinggi);
        this.cameras.main.startFollow(this.player, true);

        this.cursors = this.input.keyboard.createCursorKeys();

        // ===== KONTROL MOBILE =====
        this.kontrol = new KontrolMobile(this, { attack: false, ngobrol: false, knight: false });
        this.kursor = this.kontrol.buatKursor(this.cursors);

        // ===== HUD =====
        this.hud = new Hud(this, { cahaya: this.koinAwal, hpMax: HP_MAX });
        this.mati = false;

        // auto-jalan masuk (hanya kalau segmen punya jalanMasukX, mis. F2). F1 tanpa ini = jatuh dari langit.
        this.autoJalan = (this.cfg.jalanMasukX != null);

        // ===== MONOLOG MC (hanya F1) — muncul setelah MC mendarat + jeda =====
        this.monologF1 = (this.idxSegmen === 0);
        this.monologMulai = false;
        this.monologSelesai = !this.monologF1;   // selain F1 dianggap selesai (skip)

        this.zonaAir = this.cfg.zonaAir;
        this.batasTenggelam = 550;

        // ===== DIALOG =====
        this.dialog = new DialogBox(this);
        this._dialogNpcAktif = false;

        // ===== AURORA (sprite, invisible dulu → fade-in saat trigger) =====
        const setUntukSegmen = (this.idxSegmen === 0) ? setSoal.forest1 : setLengkapi.forest2;
        const dataNpc = (this.cfg.npc && this.cfg.npc[0]) ? this.cfg.npc[0] : null;

        if (!this.anims.exists('penyihir_idle') && this.textures.exists('npc_gandalf')) {
            this.anims.create({
                key: 'penyihir_idle',
                frames: this.anims.generateFrameNumbers('npc_gandalf', { start: 0, end: 3 }),
                frameRate: 5, repeat: -1
            });
        }

        this.penyihir = this.add.sprite(0, 0, 'npc_gandalf')
            .setScale(CFG_PENYIHIR.scale).setDepth(6).setAlpha(0).setVisible(false);
        if (this.anims.exists('penyihir_idle')) this.penyihir.play('penyihir_idle');

        this.npcData = dataNpc ? {
            namaNpc: dataNpc.namaNpc,
            dialog: dataNpc.dialog,
            dialogSelesai: dataNpc.dialogSelesai,
            soalSet: setUntukSegmen,
            pasanganSet: (this.idxSegmen === 0) ? pasanganForest.forest1 : null, // dipakai MatchingPanel di F1
            obj: this.penyihir,
            dijawab: false,
            posX: dataNpc.x,
            posY: dataNpc.y ?? null,
        } : null;

        this.triggerPenyihirX = dataNpc ? (dataNpc.x - CFG_PENYIHIR.offsetX) : null;
        this.penyihirMulai = false;
        this.npcSelesai = false;

        // ===== PANEL SOAL: F1 pakai MatchingPanel, F2 pakai LengkapiPanel =====
        this.matching = new MatchingPanel(this);
        this.lengkapi = new LengkapiPanel(this);
        this.panelSoal = (this.idxSegmen === 0) ? this.matching : this.lengkapi;

        const onBenarSatu = () => this.hud.tambahKoin(1);

        const onSelesai = (npc) => {
            // dialog penutup + (khusus F1) tutorial kontrol
            let penutupArr = (npc.dialogSelesai || []).slice();
            if (this.idxSegmen === 0) {
                penutupArr = penutupArr.concat([
                    'Sebelum kau pergi, ingat baik-baik cara menapaki dunia ini.',
                    'Melangkah: gunakan tombol PANAH KIRI / KANAN — atau tombol ◀ ▶ di layar sentuhmu.',
                    'Melompat: tekan PANAH ATAS — atau tombol JMP. Tekan dua kali untuk melompat ganda di udara.',
                    'Dan bila nanti kegelapan menghadang... kau akan belajar menyerang dengan tombol J — atau tombol A. Tapi itu cerita nanti.',
                    'Pergilah, Liora. Ingatan dan keberanianmu adalah senjata pertamamu.'
                ]);
            }
            const penutup = keDialogBox(penutupArr, npc.namaNpc || 'Aurora');

            const selesaikan = () => {
                this.npcSelesai = true;
                this.perbaruiPintu();
                this.tampilSelesai();
                if (this.penyihir && this.penyihir.visible) {
                    this.penyihir.clearTint();
                    this.tweens.add({
                        targets: this.penyihir, alpha: 0, y: this.penyihir.y - 40, duration: 600,
                        onComplete: () => { if (this.penyihir) this.penyihir.setVisible(false); }
                    });
                }
            };
            if (penutup.length) {
                this._dialogNpcAktif = true;
                this.dialog.tampil(penutup, () => { this._dialogNpcAktif = false; selesaikan(); });
            } else {
                selesaikan();
            }
        };

        // pasang callback ke KEDUA panel (yang aktif ditentukan panelSoal)
        this.matching.onBenarSatu = onBenarSatu;
        this.matching.onSelesai = onSelesai;
        this.lengkapi.onBenarSatu = onBenarSatu;
        this.lengkapi.onSelesai = onSelesai;

        this.sedangTransisi = false;
        if (this.cfg.exitX != null && this.cfg.next != null) {
            this.pintu = this.add.rectangle(this.cfg.exitX, 420, 40, 180, 0x888888, 0.5)
                .setStrokeStyle(3, 0xd8b6ff);
            this.pintuTeks = this.add.text(this.cfg.exitX, 290, '', {
                fontFamily: 'monospace', fontSize: '14px',
                color: '#ffffff', stroke: '#000000', strokeThickness: 4, align: 'center'
            }).setOrigin(0.5);
            this.perbaruiPintu();
        }

        if (this.idxSegmen === 1) {
            this.introCountessMulai = false;
            this.introCountessSelesai = false;
            if (!this.anims.exists('countess_idle') && this.textures.exists('countess_idle')) {
                this.anims.create({
                    key: 'countess_idle',
                    frames: this.anims.generateFrameNumbers('countess_idle', { start: 0, end: 4 }),
                    frameRate: 6, repeat: -1
                });
            }
        }

        const label = this.add.text(this.scale.width / 2, 40, this.cfg.nama, {
            fontFamily: 'monospace', fontSize: '20px',
            color: '#ffffff', stroke: '#000000', strokeThickness: 4
        }).setOrigin(0.5).setScrollFactor(0).setDepth(1500);
        this.time.delayedCall(1500, () => label.destroy());

        // ===== Tombol Setting (pojok kanan atas) =====
        this._setBtn = this.add.circle(this.scale.width - 44, 44, 22, 0x000000, 0.45)
            .setStrokeStyle(2, 0xffffff, 0.6)
            .setScrollFactor(0).setDepth(3000)
            .setInteractive({ useHandCursor: true });
        this._setIco = this.add.text(this.scale.width - 44, 44, '\u2699', {
            fontFamily: 'monospace', fontSize: '22px', color: '#ffffff'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(3001);
        this._setBtn.on('pointerdown', () => {
            // jangan buka Setting saat dialog/soal/transisi/mati
            this.sound.play('btn_click', { volume: 0.5 });
            if (this.mati || this.sedangTransisi) return;
            if (this.panelSoal && this.panelSoal.aktif) return;
            if (this.dialog && this.dialog.aktif) return;
            this.scene.pause();
            this.scene.launch('SettingsScene', { kembali: this.scene.key });
            this.scene.bringToTop('SettingsScene');
        });
    }

    // ===== SUASANA: langit senja (F1) / malam berbulan (F2) — config di mapForest.js =====
    #buatSuasana() {
        const su = suasanaForest[this.idxSegmen];
        if (!su) { this.cameras.main.setBackgroundColor('#7ec0ee'); return; }

        this.cameras.main.setBackgroundColor(su.langit);
        const W = this.scale.width, H = this.scale.height;

        // --- F1: matahari terbenam ---
        if (su.matahari) {
            const m = su.matahari;
            const mx = W * m.x, my = H * m.y;
            const sc = m.scroll ?? 0;
            m.halo.forEach(hl => {
                this.add.circle(mx, my, hl.r, m.warna, hl.a)
                    .setScrollFactor(sc).setDepth(-20);      // ← sc, bukan 0
            });
            this.add.circle(mx, my, m.r, m.warna, 1)
                .setScrollFactor(sc).setDepth(-20);          // ← sc, bukan 0
            if (su.rona) {
                this.add.rectangle(0, 0, W, H, su.rona.warna, su.rona.alpha)
                    .setOrigin(0).setScrollFactor(0).setDepth(78);   // rona tetap 0, biarin
            }
        }

        // ===== Gunung latar (khusus F2) =====
        if (this.idxSegmen === 1 && this.textures.exists('gunung_f2')) {
            const W = this.scale.width, H = this.scale.height;
            this.add.image(W / 2, H * 0.72, 'gunung_f2')   // ← 0.72 = posisi vertikal (kecilin = naik)
                .setOrigin(0.5, 1)
                .setScrollFactor(0)          // dipatok ke layar (kayak langit/bulan) → stabil, gak turun sendiri
                .setDepth(-15)
                .setDisplaySize(W * 1.5, H * 0.55);   // lebar × tinggi (gedein H*0.55 buat gunung lebih tinggi)
        }

        // --- F2: bulan + bintang ---
        if (su.bulan) {
            const b = su.bulan;
            const bx = W * b.x, by = H * b.y;
            b.halo.forEach(hl => {
                this.add.circle(bx, by, hl.r, b.warna, hl.a)
                    .setScrollFactor(0).setDepth(-20);
            });
            this.add.circle(bx, by, b.r, b.warna, 1)
                .setScrollFactor(0).setDepth(-20);
            // kawah tipis biar berasa bulan
            this.add.circle(bx - b.r * 0.3, by - b.r * 0.2, b.r * 0.18, 0xd8d4c0, 0.7)
                .setScrollFactor(0).setDepth(-20);
            this.add.circle(bx + b.r * 0.25, by + b.r * 0.3, b.r * 0.12, 0xd8d4c0, 0.6)
                .setScrollFactor(0).setDepth(-20);
        }
        if (su.bintang) {
            const bt = su.bintang;
            for (let i = 0; i < bt.jumlah; i++) {
                const s = this.add.circle(
                    Phaser.Math.Between(0, W),
                    Phaser.Math.Between(0, H * bt.yMaks),
                    Phaser.Math.FloatBetween(bt.rMin, bt.rMaks),
                    0xffffff, Phaser.Math.FloatBetween(0.4, 0.9)
                ).setScrollFactor(0).setDepth(-20);
                if (bt.kedip && Math.random() < 0.5) {
                    this.tweens.add({
                        targets: s, alpha: 0.15,
                        duration: Phaser.Math.Between(900, 2200),
                        yoyo: true, repeat: -1,
                        delay: Phaser.Math.Between(0, 1500),
                    });
                }
            }
        }
    }

     #mulaiMusik() {
        const m = cfgMusik.segmen[this.idxSegmen];
        if (!m || !this.cache.audio.exists(m.key)) return;

        this.musik = this.sound.add(m.key, { loop: true, volume: 0 });
        this.musik.play();
        this.tweens.add({ targets: this.musik, volume: m.volume, duration: cfgMusik.fadeIn });

        // wajib: hentikan saat pindah/restart scene biar tidak menumpuk
        this.events.once('shutdown', () => { if (this.musik) { this.musik.stop(); this.musik.destroy(); this.musik = null; } });
    }

    // ===== Aurora muncul (fade-in) di posisi TETAP (mapForest), lalu dialog → soal =====
    #mulaiPenyihir() {
        this.penyihirMulai = true;
        this.player.setVelocity(0, 0);
        this.player.diam();

        const px = this.npcData.posX;
        const py = (this.npcData.posY != null)
            ? this.npcData.posY
            : this.player.body.bottom - CFG_PENYIHIR.lift;

        this.penyihir.setPosition(px, py).setVisible(true).setAlpha(0);
        // hadap otomatis: Aurora selalu menghadap MC, MC menghadap Aurora
        const diKananMc = px > this.player.x;
        this.penyihir.setFlipX(!diKananMc);
        this.player.setFlipX(!diKananMc);
        if (this.anims.exists('penyihir_idle')) this.penyihir.play('penyihir_idle');

        this.cameras.main.flash(300, 180, 160, 255);
        this.tweens.add({
            targets: this.penyihir, alpha: 1, duration: 600,
            onComplete: () => {
                const pembuka = keDialogBox(this.npcData.dialog, this.npcData.namaNpc || 'Aurora');
                if (pembuka.length) {
                    this._dialogNpcAktif = true;
                    this.dialog.tampil(pembuka, () => {
                        this._dialogNpcAktif = false;
                        this.panelSoal.buka(this.npcData);
                    });
                } else {
                    this.panelSoal.buka(this.npcData);
                }
            }
        });
    }

    perbaruiPintu() {
        if (!this.pintuTeks) return;
        if (this.npcSelesai) {
            this.pintu.setFillStyle(0x4caf50, 0.6);
            this.pintuTeks.setText('PINTU TERBUKA →');
        } else {
            this.pintu.setFillStyle(0x888888, 0.5);
            this.pintuTeks.setText('TERKUNCI\nTemui Aurora');
        }
    }

    cekPintu() {
        if (this.sedangTransisi || this.cfg.exitX == null || this.cfg.next == null) return;
        if (this.player.x >= this.cfg.exitX && this.npcSelesai) {
            this.sedangTransisi = true;
            this.player.setVelocity(0, 0);
            this.cameras.main.fadeOut(500, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                if (typeof this.cfg.next === 'string') {
                    this.scene.start(this.cfg.next, { koin: this.hud.koin });
                } else {
                    this.scene.restart({ idx: this.cfg.next, koin: this.hud.koin });
                }
            });
        }
    }

#mulaiIntroCountess() {
        this.introCountessMulai = true;

        // musik F2 memudar → musik Countess masuk
        if (this.musik && this.musik.isPlaying) {
            this.tweens.add({
                targets: this.musik, volume: 0, duration: cfgMusik.fadeOut,
                onComplete: () => { this.musik.stop(); }
            });
        }
        if (this.cache.audio.exists(cfgMusik.countess.key)) {
            this.musikCountess = this.sound.add(cfgMusik.countess.key, { loop: true, volume: 0 });
            this.musikCountess.play();
            this.tweens.add({ targets: this.musikCountess, volume: cfgMusik.countess.volume, duration: cfgMusik.fadeIn });
            this.events.once('shutdown', () => { if (this.musikCountess) { this.musikCountess.stop(); this.musikCountess.destroy(); this.musikCountess = null; } });
        }

        this.player.setVelocity(0, 0);
        this.player.diam();

        const groundBottom = this.player.body.bottom;
        const cx = this.player.x + CFG_F2.countessOffsetX;
        const cy = groundBottom - CFG_F2.countessLift;

        this.countess = this.add.sprite(cx, cy - 50, 'countess_idle')
            .setScale(CFG_F2.countessScale).setDepth(6).setAlpha(0);
        // Countess Lethe menghadap MC (muncul di kanan MC → flip biar hadap kiri)
        this.countess.setFlipX(true);
        this.player.setFlipX(false);
        if (this.anims.exists('countess_idle')) this.countess.play('countess_idle');

        this.cameras.main.flash(300, 120, 0, 40);
        this.tweens.add({
            targets: this.countess, alpha: 1, y: cy, duration: 600,
            onComplete: () => {
                this.bobCountess = this.tweens.add({
                    targets: this.countess, y: cy - 12, duration: 1400, yoyo: true, repeat: -1, ease: 'Sine.inOut'
                });
            }
        });

        this.dialog.tampil(dialogForest.f2Countess, () => {
            if (this.bobCountess) { this.bobCountess.stop(); this.bobCountess = null; }
            this.tweens.add({
                targets: this.countess, alpha: 0, y: this.countess.y - 40, duration: 600,
                onComplete: () => { if (this.countess) { this.countess.destroy(); this.countess = null; } }
            });
            this.introCountessSelesai = true;
        });
    }

    cekAir() {
        if (!this.zonaAir || this.zonaAir.length === 0) return;
        const px = this.player.x, bawah = this.player.body.bottom;
        for (const z of this.zonaAir) {
            const batas = (z.batas != null) ? z.batas : this.batasTenggelam;
            if (px >= z.x1 && px <= z.x2 && bawah > batas) { this.kenaAir(); return; }
        }
    }

    kenaAir() {
        this.mati = true;
        const sisa = this.hud.kurangiHp(HP_JATUH);
        if (sisa <= 0) { this.gameOver(); return; }
        this.player.respawn(this.spawnX, this.spawnY);
        this.time.delayedCall(300, () => { this.mati = false; });
    }

    gameOver() {
        this.player.setVelocity(0, 0);
        const cx = this.scale.width / 2, cy = this.scale.height / 2;
        this.add.text(cx, cy - 20, 'GAME OVER', {
            fontFamily: 'monospace', fontSize: '40px', color: '#ffffff', stroke: '#aa0000', strokeThickness: 6
        }).setOrigin(0.5).setScrollFactor(0).setDepth(3000);
        this.add.text(cx, cy + 30, 'Klik untuk ulang', {
            fontFamily: 'monospace', fontSize: '20px', color: '#ffffff', stroke: '#000000', strokeThickness: 4
        }).setOrigin(0.5).setScrollFactor(0).setDepth(3000);
        this.input.once('pointerdown', () => this.scene.restart({ idx: this.idxSegmen, koin: this.koinAwal }));
    }

    tampilSelesai() {
        this.add.text(this.scale.width / 2, 80, 'Semua soal selesai! Pintu terbuka 🎓', {
            fontFamily: 'monospace', fontSize: '16px', color: '#ffffff', stroke: '#1f7a1f', strokeThickness: 5
        }).setOrigin(0.5).setScrollFactor(0).setDepth(1500);
    }

    update() {
        if (this.awan) this.awan.update();
        if (this.airTerjun) this.airTerjun.tilePositionY -= CFG_AIR.kecepatan;

        if (this.mati || this.sedangTransisi) return;

        // auto-hide tombol kontrol saat panel soal/dialog terbuka
        const uiSibuk = (this.panelSoal && this.panelSoal.aktif) || (this.dialog && this.dialog.aktif);
        if (this.kontrol) this.kontrol.sembunyikan(uiSibuk);
        // tombol Setting ikut sembunyi saat dialog/soal terbuka
        if (this._setBtn) { this._setBtn.setVisible(!uiSibuk); this._setIco.setVisible(!uiSibuk); }

        if (this.panelSoal && this.panelSoal.aktif) { this.player.diam(); return; }
        if (this.dialog && this.dialog.aktif) { this.player.diam(); return; }

        // ===== F1: MONOLOG MC (setelah mendarat → jeda → monolog) =====
        if (this.monologF1 && !this.monologSelesai) {
            this.player.setVelocityX(0);
            if (!this.monologMulai && this.player.body.onFloor()) {
                this.monologMulai = true;
                this.player.diam();
                this.time.delayedCall(JEDA_MONOLOG, () => {
                    this._dialogNpcAktif = true;
                    this.dialog.tampil(keDialogBox(dialogForest.f1Monolog, '???'), () => {
                        this._dialogNpcAktif = false;
                        this.monologSelesai = true;
                    });
                });
            }
            return;
        }

        // ===== AUTO-JALAN MASUK (F2 / segmen dgn jalanMasukX) =====
        if (this.autoJalan) {
            if (this.player.x < this.cfg.jalanMasukX) {
                this.player.setVelocityX(this.player.speed);
                this.player.flipX = false;
                if (this.textures.exists('mc_run')) this.player.play('run', true);
            } else {
                this.autoJalan = false;
                this.player.setVelocityX(0);
                this.player.diam();
            }
            return;
        }

        // trigger Aurora: muncul saat MC mendekati posisi Aurora
        if (!this.penyihirMulai && !this.npcSelesai && this.triggerPenyihirX != null
            && this.player.x >= this.triggerPenyihirX && this.player.body.onFloor()) {
            this.#mulaiPenyihir();
            return;
        }

        // intro Countess Lethe (F2) — setelah soal selesai
        if (this.idxSegmen === 1 && !this.introCountessMulai
            && this.cfg.exitX != null
            && this.npcSelesai
            && this.player.x >= (this.cfg.exitX - CFG_F2.jarakTrigger)) {
            this.#mulaiIntroCountess();
            return;
        }

        this.cekAir();

        const tahanPintu = this.idxSegmen === 1 && !this.introCountessSelesai;
        if (!tahanPintu) this.cekPintu();

        this.player.gerak(this.kursor);
    }
}