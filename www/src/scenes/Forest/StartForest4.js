// src/scenes/Forest/StartForest4.js
// Forest 4 — Desa: penyihir puzzle (transisi fade-in), archer, perahu, penyihir ujung (portal).
//   Konfigurasi scene di mapForest.js (cfgForest4).

import { Player } from '../../gameobject/Player.js';
import { PuzzlePanel } from '../../ui/PuzzlePanel.js';
import { Hud } from '../../ui/Hud.js';
import { setPuzzle } from '../../data/puzzleForest.js';
import { DialogBox } from '../../gameobject/DialogBox.js';
import { dialogForest, cfgForest4, cfgMusik, cfgSfx } from '../../data/mapForest.js';
import { KontrolMobile } from '../../gameobject/KontrolMobile.js';

const A = 'assets/background/Forest/AssetForest/';
const A4 = 'assets/background/Forest/AssetForest/assetForest4/';

const HP_MAX = 100;
const HP_JATUH = 25;

// jarak MC melewati titik ini SEBELUM posisi penyihir → penyihir puzzle muncul
const OFFSET_TRIGGER_PUZZLE = 150;

function keDialogBox(arr, nama) {
    return (arr || []).map(t => ({ nama, teks: t }));
}

const CFG = cfgForest4;

export class StartForest4 extends Phaser.Scene {

    constructor() { super('StartForest4'); }

    init(data) {
        this.cfg = CFG;
        this.koinAwal = (data && data.koin != null) ? data.koin : 0;
    }

    preload() {
        this.load.spritesheet('mc_idle', 'assets/Forest_MC/Idle-Sheet.png', { frameWidth: 64, frameHeight: 80 });
        this.load.spritesheet('mc_run',  'assets/Forest_MC/Run-Sheet.png',  { frameWidth: 80, frameHeight: 80 });
        this.load.spritesheet('mc_jump', 'assets/Forest_MC/Jump-All-Sheet.png', { frameWidth: 64, frameHeight: 80 });

        this.load.tilemapTiledJSON(this.cfg.mapKey, this.cfg.mapFile);
        this.cfg.tilesets.forEach(ts => this.load.image(ts.key, ts.file));
        (this.cfg.npcSprites || []).forEach(s =>
            this.load.spritesheet(s.key, s.file, { frameWidth: s.frameW, frameHeight: s.frameH }));

        this.load.spritesheet('boat', A4 + 'Boat.png', { frameWidth: 80, frameHeight: 32 });
        this.load.spritesheet('air4', A + 'Sprite-0001.png', { frameWidth: 16, frameHeight: 16 });
        this.load.spritesheet('archer',  'assets/bot/MapForest/npcForest4/GandalfHardcore_Archer_sheet.png', { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet('cooking', A4 + 'Cooking_area.png', { frameWidth: 64, frameHeight: 64 });
        
        if (!this.cache.audio.exists('btn_click'))
            this.load.audio('btn_click', 'assets/audio/Button_click_SFX.mp3');
        if (!this.cache.audio.exists(cfgSfx.jump.key))
            this.load.audio(cfgSfx.jump.key, cfgSfx.jump.file);
        // ===== MUSIK F4 =====
        if (!this.cache.audio.exists(cfgMusik.forest4.key))
            this.load.audio(cfgMusik.forest4.key, cfgMusik.forest4.file);
        
        [cfgSfx.step1, cfgSfx.step2].forEach(s => {
            if (!this.cache.audio.exists(s.key)) this.load.audio(s.key, s.file);
        });
        
    }

    create() {
        this.#mulaiMusik();
        this.cameras.main.setBackgroundColor('#1a1a3a');
        this.cameras.main.fadeIn(400, 0, 0, 0);

        const map = this.make.tilemap({ key: this.cfg.mapKey });
        const tilesetObjs = this.cfg.tilesets.map(ts => map.addTilesetImage(ts.nama, ts.key));

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

        const daratan = this.collisionLayers.find(l => l.layer && l.layer.name === 'daratan');
        if (daratan) {
            daratan.forEachTile(t => {
                if (t.index === -1) return;
                const wx = t.pixelX * 2.25, wy = t.pixelY * 2.25;
                if (wx >= 1700 && wx <= 2320 && wy < 530) t.setCollision(false);
            });
        }

        // ===== BULAN (background) =====
        this.#buatBulan();

        // ===== AIR =====
        {
            const atas = this.cfg.air.atas, bawah = 720, lebar = 7200;
            this.air = this.add.tileSprite(lebar / 2, (atas + bawah) / 2, lebar, bawah - atas, 'air4', 0)
                .setDepth(-1).setTileScale(2.25, 2.25);
            this._f = 0;
            this.time.addEvent({ delay: 130, loop: true, callback: () => {
                this._f = (this._f + 1) % 4; this.air.setTexture('air4', this._f);
            }});
        }

        // ===== SUASANA MALAM =====
        this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x0a1030, 0.42)
            .setOrigin(0).setScrollFactor(0).setDepth(80)
            .setBlendMode(Phaser.BlendModes.MULTIPLY);
        this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x2a3a6a, 0.14)
            .setOrigin(0).setScrollFactor(0).setDepth(81)
            .setBlendMode(Phaser.BlendModes.ADD);

        // ===== PERAHU =====
        const pr = this.cfg.perahu;
        this.berlayar = false;
        this.perahuDiKanan = false;
        this.perahu = this.add.sprite(pr.x1, pr.y, 'boat', 0).setScale(2.25).setDepth(4);
        this.keyE = this.input.keyboard.addKey('E');
        this.promptPerahu = this.add.text(pr.x1, pr.y - 80, '▼ Tekan E / B untuk berlayar', {
            fontFamily: 'monospace', fontSize: '13px',
            color: '#ffff00', stroke: '#000000', strokeThickness: 3
        }).setOrigin(0.5).setVisible(false);

        this.spawnX = this.cfg.spawnX; this.spawnY = this.cfg.spawnY;
        this.player = new Player(this, this.spawnX, this.spawnY);
        this.player.setDepth(5);
        this.collisionLayers.forEach(l => this.physics.add.collider(this.player, l));

        const lebar = utama ? utama.displayWidth : 7200;
        const tinggi = utama ? utama.displayHeight : 720;
        this.physics.world.setBounds(0, 0, lebar, tinggi);
        this.cameras.main.setBounds(0, 0, lebar, tinggi);
        this.cameras.main.startFollow(this.player, true);

        this.cursors = this.input.keyboard.createCursorKeys();
        this.keySpace = this.input.keyboard.addKey('SPACE');

        // ===== KONTROL MOBILE: gerak + JMP + B (interaksi kontekstual) =====
        this.kontrol = new KontrolMobile(this, { attack: false, ngobrol: true, knight: false });
        this.kursor  = this.kontrol.buatKursor(this.cursors);

        // ===== HUD =====
        this.hud = new Hud(this, { cahaya: this.koinAwal, hpMax: HP_MAX });
        this.mati = false;

        this.zonaAir = this.cfg.zonaAir;
        this.batasTenggelam = 550;

        // ===== DIALOG + STATE =====
        this.dialog = new DialogBox(this);
        this._dialogNpcAktif = false;
        this.penyihir = null;          // penyihir UJUNG desa (portal)
        this.penyihirMulai = false;
        this.sedangTransisi = false;
        this.autoJalan = true;

        // ===== PORTAL ke F5 =====
        this.portalAktif = false;
        this.pintu = this.add.rectangle(this.cfg.exitX, 420, 40, 180, 0x888888, 0.4)
            .setStrokeStyle(3, 0xd8b6ff);
        this.pintuTeks = this.add.text(this.cfg.exitX, 290, 'Temui Aurora', {
            fontFamily: 'monospace', fontSize: '13px',
            color: '#ffffff', stroke: '#000000', strokeThickness: 4, align: 'center'
        }).setOrigin(0.5);

        // ===== PUZZLE =====
        this.quiz = new PuzzlePanel(this);
        this.quiz.onBenarSatu = () => { this.hud.tambahKoin(1); };
        this.quiz.onSelesai = (npc) => {
            const penutup = keDialogBox(npc.dialogSelesai, npc.namaNpc || 'Sang Penyihir');
            const selesaikan = () => {
                this.puzzleSelesai = true;
                // penyihir puzzle menghilang (fade out)
                if (this.penyihirPuzzle && this.penyihirPuzzle.visible) {
                    this.penyihirPuzzle.clearTint();
                    this.tweens.add({
                        targets: this.penyihirPuzzle, alpha: 0, y: this.penyihirPuzzle.y - 40, duration: 600,
                        onComplete: () => { if (this.penyihirPuzzle) this.penyihirPuzzle.setVisible(false); }
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

        // ===== ANIM penyihir (dipakai penyihir puzzle & penyihir ujung) =====
        if (!this.anims.exists('penyihir_idle') && this.textures.exists('npc_gandalf')) {
            this.anims.create({ key: 'penyihir_idle',
                frames: this.anims.generateFrameNumbers('npc_gandalf', { start: 0, end: 3 }),
                frameRate: 5, repeat: -1 });
        }

        // ===== PENYIHIR PUZZLE (awal desa) — sprite invisible, fade-in saat trigger =====
        const dataNpc = (this.cfg.npc && this.cfg.npc[0]) ? this.cfg.npc[0] : null;
        this.penyihirPuzzle = this.add.sprite(0, 0, 'npc_gandalf')
            .setScale(2.6).setDepth(6).setAlpha(0).setVisible(false);
        if (this.anims.exists('penyihir_idle')) this.penyihirPuzzle.play('penyihir_idle');

        this.npcData = dataNpc ? {
            namaNpc: dataNpc.namaNpc,
            dialog: dataNpc.dialog,
            dialogSelesai: dataNpc.dialogSelesai,
            soalSet: setPuzzle.forest4,
            obj: this.penyihirPuzzle,
            dijawab: false,
            posX: dataNpc.x,
            posY: dataNpc.y ?? null,
        } : null;

        this.triggerPuzzleX = dataNpc ? (dataNpc.x - OFFSET_TRIGGER_PUZZLE) : null;
        this.puzzleMulai = false;
        this.puzzleSelesai = false;

        // ===== ARCHER (NPC bisa dialog) =====
        this.archerSelesai = false;
        this.archers = [];
        if (this.textures.exists('archer')) {
            if (!this.anims.exists('archer_idle')) {
                this.anims.create({ key: 'archer_idle',
                    frames: this.anims.generateFrameNumbers('archer', { start: 0, end: 4 }),
                    frameRate: 5, repeat: -1 });
            }
            this.archers = this.cfg.archer.map(a => {
                const s = this.add.sprite(a.x, a.y, 'archer').setScale(2.7).setDepth(3);
                s.play('archer_idle');
                s.setFlipX(!!a.flip);
                return s;
            });
        }
        this.promptArcher = this.add.text(0, 0, '▼ Tekan SPACE / B', {
            fontFamily: 'monospace', fontSize: '13px',
            color: '#ffff00', stroke: '#000000', strokeThickness: 3
        }).setOrigin(0.5).setDepth(1400).setVisible(false);

        // ===== Cooking (dekorasi) =====
        if (this.textures.exists('cooking')) {
            if (!this.anims.exists('cooking_anim')) {
                this.anims.create({ key: 'cooking_anim',
                    frames: this.anims.generateFrameNumbers('cooking', { start: 0, end: 11 }),
                    frameRate: 8, repeat: -1 });
            }
            this.cooking = this.add.sprite(this.cfg.cooking.x, this.cfg.cooking.y, 'cooking')
                .setScale(2.25).setDepth(3);
            this.cooking.play('cooking_anim');
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

    // ===== MUSIK F4: putar, berhenti saat scene ditutup =====
    #mulaiMusik() {
        const m = cfgMusik.forest4;
        if (!m || !this.cache.audio.exists(m.key)) return;

        this.musik = this.sound.add(m.key, { loop: true, volume: 0 });
        this.musik.play();
        this.tweens.add({ targets: this.musik, volume: m.volume, duration: cfgMusik.fadeIn });

        // wajib: hentikan saat pindah/restart scene biar tidak menumpuk
        this.events.once('shutdown', () => { if (this.musik) { this.musik.stop(); this.musik.destroy(); this.musik = null; } });
    }

    #buatBulan() {
        const c = this.cfg.bulan;
        const m = this.add.container(c.x, c.y).setScrollFactor(c.scroll).setDepth(c.depth);
        for (let i = 5; i >= 1; i--) m.add(this.add.circle(0, 0, c.radius * (1 + i * 0.6), c.warna, 0.09));
        m.add(this.add.circle(0, 0, c.radius, c.warna, 1));
        const kawah = 0xd9d4b0;
        m.add(this.add.circle(-c.radius * 0.30, -c.radius * 0.18, c.radius * 0.20, kawah, 0.45));
        m.add(this.add.circle( c.radius * 0.28,  c.radius * 0.10, c.radius * 0.13, kawah, 0.45));
        this.bulan = m;
    }

    // ===== PENYIHIR PUZZLE muncul (fade-in) di posisi tetap → dialog → puzzle otomatis =====
    #mulaiPenyihirPuzzle() {
        this.puzzleMulai = true;
        this.player.setVelocity(0, 0);
        this.player.diam();

        const px = this.npcData.posX;
        const py = (this.npcData.posY != null)
            ? this.npcData.posY
            : this.player.body.bottom - 40;

        this.penyihirPuzzle.setPosition(px, py).setVisible(true).setAlpha(0);
        // hadap otomatis (npc_gandalf default hadap kiri): penyihir & MC saling hadap
        const diKananMc = px > this.player.x;
        this.penyihirPuzzle.setFlipX(!diKananMc);
        this.player.setFlipX(!diKananMc);
        if (this.anims.exists('penyihir_idle')) this.penyihirPuzzle.play('penyihir_idle');

        this.cameras.main.flash(300, 180, 160, 255);
        this.tweens.add({
            targets: this.penyihirPuzzle, alpha: 1, duration: 600,
            onComplete: () => {
                const pembuka = keDialogBox(this.npcData.dialog, this.npcData.namaNpc || 'Sang Penyihir');
                if (pembuka.length) {
                    this._dialogNpcAktif = true;
                    this.dialog.tampil(pembuka, () => {
                        this._dialogNpcAktif = false;
                        this.quiz.buka(this.npcData);
                    });
                } else {
                    this.quiz.buka(this.npcData);
                }
            }
        });
    }

    // buka dialog archer
    #bukaArcher(archer) {
        this.player.setVelocity(0, 0);
        this.player.diam();
        this.player.setFlipX(archer.x < this.player.x);
        archer.setFlipX(this.player.x < archer.x);   // MC di kiri archer → flip archer biar hadap kiri (ke MC)
        this.promptArcher.setVisible(false);
        this.dialog.tampil(dialogForest.f4Archer, () => {
            this.archerSelesai = true;
        });
    }

    // ===== PENYIHIR UJUNG desa → dialog f4Magic → BUKA PORTAL =====
    #mulaiPenyihir() {
        this.penyihirMulai = true;
        this.player.setVelocity(0, 0);
        this.player.diam();

        const px = this.cfg.penyihirX;
        const py = this.cfg.penyihirY;
        this.penyihir = this.add.sprite(px, py, 'npc_gandalf').setScale(2.6).setDepth(6).setAlpha(0);
        this.penyihir.setFlipX(px < this.player.x);
        if (this.anims.exists('penyihir_idle')) this.penyihir.play('penyihir_idle');

        this.cameras.main.flash(300, 180, 160, 255);
        this.tweens.add({ targets: this.penyihir, alpha: 1, duration: 600 });

        this.dialog.tampil(dialogForest.f4Magic, () => {
            this.cameras.main.flash(240, 180, 160, 255);
            if (this.penyihir) {
                this.tweens.add({
                    targets: this.penyihir, alpha: 0, y: this.penyihir.y - 40, duration: 600,
                    onComplete: () => { if (this.penyihir) { this.penyihir.destroy(); this.penyihir = null; } }
                });
            }
            this.portalAktif = true;
            if (this.pintu) {
                this.pintu.setFillStyle(0x4caf50, 0.6);
                this.pintuTeks.setText('PINTU TERBUKA →');
            }
        });
    }

    #keForest5() {
        if (this.sedangTransisi) return;
        this.sedangTransisi = true;
        this.player.setVelocity(0, 0);
        this.cameras.main.fadeOut(700, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.start(this.cfg.next, { koin: this.hud.koin });
        });
    }

    // ===== PERAHU =====
    mulaiBerlayar() {
        this.berlayar = true;
        this.promptPerahu.setVisible(false);
        this.player.body.setAllowGravity(false);
        this.player.setVelocity(0, 0);
        const pr = this.cfg.perahu;
        const tujuan = this.perahuDiKanan ? pr.x1 : pr.x2;
        this.tweens.add({
            targets: this.perahu, x: tujuan, duration: pr.durasi, ease: 'Sine.easeInOut',
            onComplete: () => this.selesaiBerlayar()
        });
    }

    saatBerlayar() {
        const pr = this.cfg.perahu;
        this.player.x = this.perahu.x;
        this.player.y = this.perahu.y - pr.offset;
        this.player.setVelocity(0, 0);
        this.player.diam();
    }

    selesaiBerlayar() {
        this.berlayar = false;
        this.player.body.setAllowGravity(true);
        this.perahuDiKanan = !this.perahuDiKanan;
        this.player.x = this.perahuDiKanan ? this.perahu.x + 70 : this.perahu.x - 70;
        this.player.y = 440;
    }

    cekAir() {
        if (!this.zonaAir || this.zonaAir.length === 0) return;
        const px = this.player.x, bawah = this.player.body.bottom;
        for (const z of this.zonaAir) {
            const batas = (z.batas != null) ? z.batas : this.batasTenggelam;
            if (px >= z.x1 && px <= z.x2 && bawah > batas) { this.kenaAir(); return; }
        }
    }

    resetPerahu() {
        this.tweens.killTweensOf(this.perahu);
        this.perahu.x = this.cfg.perahu.x1;
        this.perahu.y = this.cfg.perahu.y;
        this.perahuDiKanan = false;
        if (this.berlayar) {
            this.berlayar = false;
            this.player.body.setAllowGravity(true);
        }
        this.promptPerahu.setVisible(false);
    }

    kenaAir() {
        this.mati = true;
        this.resetPerahu();
        const sisa = this.hud.kurangiHp(HP_JATUH);
        if (sisa <= 0) { this.gameOver(); return; }
        this.player.respawn(this.spawnX, this.spawnY);
        this.time.delayedCall(300, () => { this.mati = false; });
    }

    gameOver() {
        this.player.setVelocity(0, 0);
        const cx = this.scale.width / 2, cy = this.scale.height / 2;
        this.add.text(cx, cy - 20, 'GAME OVER', {
            fontFamily: 'monospace', fontSize: '40px',
            color: '#ffffff', stroke: '#aa0000', strokeThickness: 6
        }).setOrigin(0.5).setScrollFactor(0).setDepth(3000);
        this.add.text(cx, cy + 30, 'Klik untuk ulang', {
            fontFamily: 'monospace', fontSize: '20px',
            color: '#ffffff', stroke: '#000000', strokeThickness: 4
        }).setOrigin(0.5).setScrollFactor(0).setDepth(3000);
        this.input.once('pointerdown', () => this.scene.restart({ koin: this.koinAwal }));
    }

    update() {
        if (this.mati || this.sedangTransisi) return;

        // auto-hide tombol kontrol saat quiz/dialog terbuka
        if (this.kontrol) this.kontrol.sembunyikan(
            (this.quiz && this.quiz.aktif) || (this.dialog && this.dialog.aktif)
        );

        // tombol Setting ikut sembunyi saat UI sibuk / cutscene
        if (this._setBtn) {
            const _sibuk = (this.dialog && this.dialog.aktif) || (this.quiz && this.quiz.aktif)
                || this.transforming || this.endingMulai || this.berlayar
                || this.sedangTransisi || this._pindah;
            this._setBtn.setVisible(!_sibuk);
            this._setIco.setVisible(!_sibuk);
        }

        if (this.berlayar) { this.saatBerlayar(); return; }
        if (this.quiz && this.quiz.aktif) { this.player.diam(); return; }
        if (this.dialog && this.dialog.aktif) { this.player.diam(); return; }

        // ===== AUTO-JALAN MASUK =====
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

        // trigger PENYIHIR PUZZLE (awal desa) — muncul saat MC mendekati posisinya
        if (!this.puzzleMulai && this.triggerPuzzleX != null
            && this.player.x >= this.triggerPuzzleX && this.player.body.onFloor()) {
            this.#mulaiPenyihirPuzzle();
            return;
        }

        // trigger PENYIHIR UJUNG desa (portal)
        if (!this.penyihirMulai && this.player.x >= this.cfg.triggerPenyihir && this.player.body.onFloor()) {
            this.#mulaiPenyihir();
            return;
        }

        // portal ke F5 (aktif setelah dialog penyihir ujung)
        if (this.portalAktif && !this.sedangTransisi && this.player.x >= this.cfg.exitX) {
            this.#keForest5();
            return;
        }

        this.cekAir();

        // interaksi archer (opsional) — SPACE atau tombol B
        if (!this.archerSelesai && this.archers.length) {
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

        // boarding perahu — E atau tombol B
        const dekatPerahu = Math.abs(this.player.x - this.perahu.x) < 90;
        this.promptPerahu.setVisible(dekatPerahu);
        if (dekatPerahu && (Phaser.Input.Keyboard.JustDown(this.keyE) || this.kontrol.ngobrolJustDown())) {
            this.mulaiBerlayar();
            return;
        }

        this.player.gerak(this.kursor);
    }
}