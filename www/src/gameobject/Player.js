// src/gameobject/Player.js
import { cfgSfx } from '../data/mapForest.js';

// jeda antar langkah kaki (ms) — kecilin kalau mau langkah lebih rapat, gedein kalau kejauhan.
// ~300 cocok buat run MC (8 frame @12fps). Bisa dipisah per skin kalau perlu.
const CFG_LANGKAH = { jeda: 300 };

export class Player extends Phaser.Physics.Arcade.Sprite {

    constructor(scene, x, y) {
        super(scene, x, y, 'mc_idle');
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setScale(2.5);

        this.skin = 'mc';   // 'mc' atau 'knight'

        // hitbox per skin (knight frame 80px → body diturunin biar kaki napak)
        this.HITBOX = {
            mc:     { w: 24, h: 36, x: 20, y: 13 },
            knight: { w: 26, h: 48, x: 27, y: 20 },   // naikin y = body turun (biar gak ngambang)
        };

        this.speed = 300;
        this.jumpPower = 550;
        this.maxJumps = 2;

        this.setCollideWorldBounds(true);
        this.terapkanHitbox();

        this.createAnims(scene);
        this.play('idle');
        this.jumpCount = 0;
        this._upSebelumnya = false;   // buat deteksi "baru ditekan" (keyboard & sentuh)

        this.#buatSfx(scene);

        // langkah kaki (footstep): gantian step1/step2, dibatasi cadence CFG_LANGKAH.jeda
        this._langkahKiri = true;
        this._langkahTerakhir = 0;
    }

    // ===== SFX KARAKTER: POOL instance (anti-delay & anti-hilang saat di-spam) =====
    // Kenapa pool? stop()+play() di instance yang SAMA secara beruntun bikin bunyi hangus.
    // Dengan pool, tiap tebasan pakai instance berikutnya bergiliran → selalu bunyi.
    // Scene yang belum preload audionya → pool null → method sfx diam aja (nggak error).
    #buatSfx(scene) {
        const buatPool = (cfg) => {
            if (!cfg || !scene.cache.audio.exists(cfg.key)) return null;
            const jml = cfg.pool || 1;
            const list = [];
            for (let i = 0; i < jml; i++) list.push(scene.sound.add(cfg.key, { volume: cfg.volume }));
            return { list, idx: 0 };
        };

        this._sfxJump      = buatPool(cfgSfx.jump);
        this._sfxSlash1    = buatPool(cfgSfx.slash1);     // MC
        this._sfxSlash2    = buatPool(cfgSfx.slash2);     // Knight
        this._sfxTransform = buatPool(cfgSfx.transform);
        this._sfxStep1     = buatPool(cfgSfx.step1);      // langkah kaki (kiri)
        this._sfxStep2     = buatPool(cfgSfx.step2);      // langkah kaki (kanan)

        // bersih-bersih pas player di-destroy (scene shutdown/restart) → nggak numpuk
        this.once(Phaser.GameObjects.Events.DESTROY, () => {
            [this._sfxJump, this._sfxSlash1, this._sfxSlash2, this._sfxTransform,
             this._sfxStep1, this._sfxStep2].forEach(p => {
                if (p) p.list.forEach(s => s.destroy());
            });
            this._sfxJump = this._sfxSlash1 = this._sfxSlash2 = this._sfxTransform = null;
            this._sfxStep1 = this._sfxStep2 = null;
        });
    }

    // ambil instance berikutnya dari pool → play. Round-robin = nggak pernah bentrok sama diri sendiri.
    #mainkanSfx(pool) {
        if (!pool) return;
        const s = pool.list[pool.idx];
        pool.idx = (pool.idx + 1) % pool.list.length;
        if (s.isPlaying) s.stop();   // jaga-jaga kalau pool keburu muter penuh
        s.play();
    }

    // langkah kaki: dipanggil tiap frame saat lari di tanah; di-throttle oleh cadence.
    // step1 & step2 gantian biar berasa kiri-kanan. Aman kalau audio belum di-preload (pool null → diam).
    #langkah() {
        const now = this.scene.time.now;
        if (now - this._langkahTerakhir < CFG_LANGKAH.jeda) return;
        this._langkahTerakhir = now;
        this.#mainkanSfx(this._langkahKiri ? this._sfxStep1 : this._sfxStep2);
        this._langkahKiri = !this._langkahKiri;
    }

    // dipanggil scene (F3/F5) dari serang() — otomatis pilih Slash1 (mc) / Slash2 (knight)
    sfxSlash() {
        this.#mainkanSfx(this.skin === 'knight' ? this._sfxSlash2 : this._sfxSlash1);
    }

    // dipanggil scene (F5) pas transformasi knight
    sfxTransform() { this.#mainkanSfx(this._sfxTransform); }

    // keepFeet=true → resize TAPI kaki (body.bottom) tetap di tempat (anti-jatuh & anti-loncat)
    terapkanHitbox(keepFeet = false) {
        const h = this.HITBOX[this.skin] || this.HITBOX.mc;

        let feetY = null;
        if (keepFeet) {
            this.body.updateFromGameObject();
            feetY = this.body.bottom;            // posisi kaki SEBELUM resize
        }

        this.body.setSize(h.w, h.h, false);      // false = jangan auto-center
        this.body.setOffset(h.x, h.y);
        this.body.updateFromGameObject();

        if (keepFeet) {
            const diff = feetY - this.body.bottom;
            if (diff !== 0) {
                this.y += diff;                  // geser balik biar kaki di posisi semula
                this.body.updateFromGameObject();
            }
        }
    }

    // key animasi sesuai skin: mc -> 'idle', knight -> 'knight_idle'
    #anim(base) {
        return this.skin === 'knight' ? 'knight_' + base : base;
    }

    // ganti wujud mc <-> knight
    setSkin(skin) {
        if (this.skin === skin) return;

        // guard: mau jadi knight tapi teksturnya belum di-preload di scene ini → batal + warning
        if (skin === 'knight' && !this.scene.textures.exists('knight_idle')) {
            console.warn('[Player] setSkin(knight) dibatalin: tekstur knight belum di-load di scene ini. Cek preload F5.');
            return;
        }

        this.skin = skin;
        this.createAnims(this.scene);            // pastiin anim skin baru sudah ada (aman diulang, guard per-anim)
        this.terapkanHitbox(true);               // kunci kaki → transform mulus, gak jatoh
        this.play(this.#anim('idle'), true);
    }

    // idempotent: aman dipanggil berkali-kali & di scene mana pun.
    // tiap anim cuma kebuat kalau (belum ada) DAN (teksturnya udah di-load).
    createAnims(scene) {
        const A = (key, tex, end, rate, repeat) => {
            if (!scene.anims.exists(key) && scene.textures.exists(tex))
                scene.anims.create({
                    key,
                    frames: scene.anims.generateFrameNumbers(tex, { start: 0, end }),
                    frameRate: rate,
                    repeat,
                });
        };

        // ----- MC base -----
        A('idle', 'mc_idle', 3, 6,  -1);   // 4 frame
        A('run',  'mc_run',  7, 12, -1);   // 8 frame
        A('jump', 'mc_jump', 3, 10,  0);   // 4 frame

        // ----- KNIGHT (PowerUp) — kebuat begitu teksturnya siap -----
        A('knight_idle', 'knight_idle', 3, 6,  -1);  // 4 frame
        A('knight_run',  'knight_run',  6, 12, -1);  // 7 frame
        A('knight_jump', 'knight_jump', 5, 10,  0);  // 6 frame
    }

    gerak(cursors) {
        const onGround = this.body.blocked.down;
        if (onGround) this.jumpCount = 0;

        if (cursors.left.isDown) {
            this.setVelocityX(-this.speed);
            this.flipX = true;
        } else if (cursors.right.isDown) {
            this.setVelocityX(this.speed);
            this.flipX = false;
        } else {
            this.setVelocityX(0);
        }

        // deteksi "baru ditekan" manual — jalan untuk keyboard ASLI maupun tombol sentuh
        const upSekarang = cursors.up.isDown;
        const upBaruDitekan = upSekarang && !this._upSebelumnya;
        this._upSebelumnya = upSekarang;

        let melompat = false;
        if (upBaruDitekan && this.jumpCount < this.maxJumps) {
            this.setVelocityY(-this.jumpPower);
            this.jumpCount++;
            melompat = true;
            this.#mainkanSfx(this._sfxJump);   // bunyi tiap lompat (termasuk double jump)
        }

        const JUMP = this.#anim('jump');
        if (melompat) {
            this.play(JUMP);
        } else if (!onGround) {
            if (this.anims.currentAnim?.key !== JUMP) this.play(JUMP, true);
        } else if (this.body.velocity.x !== 0) {
            this.play(this.#anim('run'), true);
            this.#langkah();                   // 🔊 langkah kaki saat lari di tanah
        } else {
            this.play(this.#anim('idle'), true);
        }
    }

    diam() {
        this.setVelocityX(0);
        this.play(this.#anim('idle'), true);
        this._upSebelumnya = false;   // reset biar habis dialog/quiz nggak auto-lompat
    }

    respawn(x, y) {
        this.setPosition(x, y);
        this.setVelocity(0, 0);
        this.jumpCount = 0;
        this._upSebelumnya = false;
    }
}