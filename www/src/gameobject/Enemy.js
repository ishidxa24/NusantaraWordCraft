/* ============================================================================
   Enemy.js — Class musuh reusable (config-driven)
   Nusantara WordCraft
   ========================================================================== */

const ENEMY_COMMON = {
  hurtMs:   160,
  tintHurt: 0xff6666,
};

export const ENEMY_TYPES = {
  zombie: {
    hp: 2, speed: 35, scale: 2.0, range: 'melee', damage: 1,
    aggroRange: 320, attackRange: 58, attackCD: 1200, hitDelay: 375, gravityY: 900,
    bodySize: { w: 22, h: 17 }, bodyOffset: { x: 37, y: 60 },
    keys: { idle:'zombie_idle', walk:'zombie_walk', attack:'zombie_attack', hurt:'zombie_hurt', dead:'zombie_dead' },
    deadSfx: { key: 'sfx_zombie_dead', volume: 0.5 },
  },
  pelayan: {
    hp: 3, speed: 60, scale: 1.6, range: 'melee', damage: 1,
    aggroRange: 380, attackRange: 70, attackCD: 700, gravityY: 900,
    bodySize: { w: 40, h: 56 }, bodyOffset: { x: 44, y: 48 },
    keys: { idle:'pelayan_idle', walk:'pelayan_walk', attack:'pelayan_attack', hurt:'pelayan_hurt', dead:'pelayan_dead' },
    deadSfx: { key: 'sfx_pelayan_dead', volume: 0.5 },
    attackCombo: [
      { anim: 'pelayan_attack',  hitDelay: 250, sfx: 'sfx_pelayan_slash1', vol: 0.5 },
      { anim: 'pelayan_attack2', hitDelay: 170, sfx: 'sfx_pelayan_slash2', vol: 0.5 },
      { anim: 'pelayan_attack3', hitDelay: 210, sfx: 'sfx_pelayan_slash1', vol: 0.5 },
    ],
  },
  countess: {
    hp: 12, speed: 40, scale: 1.9, range: 'ranged', damage: 1,
    aggroRange: 800, attackRange: 420, attackCD: 1800, blinkCD: 3500, blinkJarak: 150, blinkLift: 82, gravityY: 900,
    projectile: 'blood_shot', projSpeed: 240, projScale: 1.4,
    bodySize: { w: 44, h: 65 }, bodyOffset: { x: 42, y: 42 },
    keys: { idle:'countess_idle', walk:'countess_walk', attack:'countess_attack', hurt:'countess_hurt', dead:'countess_dead' },
  },
};

const _ANIM_DONE = Phaser.Animations.Events.ANIMATION_COMPLETE;

export class Enemy {
  constructor(scene, x, y, tipe) {
    this.scene = scene;
    this.tipe  = tipe;
    this.cfg   = ENEMY_TYPES[tipe];
    if (!this.cfg) { console.warn('[Enemy] tipe tak dikenal:', tipe); return; }

    this.hpMax      = this.cfg.hp;
    this.hp         = this.cfg.hp;
    this.isDead     = false;
    this.isBoss     = false;
    this.busy       = false;
    this.lastAttack = 0;
    this.lastBlink  = 0;
    this.blinking   = false;
    this._deadSnd   = null;
    this._comboIdx  = 0;

    const s = scene.physics.add.sprite(x, y, this.cfg.keys.idle);
    s.setScale(this.cfg.scale || 1);
    s.setCollideWorldBounds(true);
    if (this.cfg.bodySize)   s.body.setSize(this.cfg.bodySize.w, this.cfg.bodySize.h);
    if (this.cfg.bodyOffset) s.body.setOffset(this.cfg.bodyOffset.x, this.cfg.bodyOffset.y);
    if (scene.anims.exists(this.cfg.keys.idle)) s.play(this.cfg.keys.idle);

    s.enemyRef = this;
    this.sprite = s;
  }

  #play(key) {
    if (this.busy) return;
    if (this.sprite.anims.getName() !== key && this.scene.anims.exists(key))
      this.sprite.play(key, true);
  }

  update(mc, dt) {
    if (this.isDead || !this.sprite || !mc) return;
    const s = this.sprite;

    if (this.busy) { s.body.setVelocityX(0); return; }

    const dx   = mc.x - s.x;
    const dist = Math.abs(dx);
    const dir  = dx < 0 ? -1 : 1;

    s.setFlipX(dir < 0);

    if (dist > this.cfg.aggroRange) {
      s.body.setVelocityX(0);
      this.#play(this.cfg.keys.idle);
      return;
    }

    if (this.cfg.range === 'ranged') {
      if (this.blinking) { s.body.setVelocityX(0); return; }
      s.body.setVelocityX(0);

      const now = this.scene.time.now;
      const perluBlink = (now - this.lastBlink > (this.cfg.blinkCD ?? 3000))
                      || (dist > this.cfg.attackRange);
      if (perluBlink && now - this.lastBlink > 700) {
        this.#blink(mc);
        return;
      }

      if (dist <= this.cfg.attackRange) {
        this.#tembak(mc);
        this.#play(this.cfg.keys.idle);
      } else {
        this.#play(this.cfg.keys.idle);
      }
    } else {
      if (dist > this.cfg.attackRange) {
        s.body.setVelocityX(dir * this.cfg.speed);
        this.#play(this.cfg.keys.walk);
      } else {
        s.body.setVelocityX(0);
        this.#serang();
        this.#play(this.cfg.keys.idle);
      }
    }
  }

  #serang() {
    const now = this.scene.time.now;
    if (this.busy || now - this.lastAttack < this.cfg.attackCD) return;
    this.lastAttack = now;
    this.busy = true;

    let animKey, hitDelay, sfxKey, sfxVol;
    if (this.cfg.attackCombo && this.cfg.attackCombo.length) {
      const step = this.cfg.attackCombo[this._comboIdx % this.cfg.attackCombo.length];
      this._comboIdx = (this._comboIdx + 1) % this.cfg.attackCombo.length;
      animKey  = step.anim;
      hitDelay = step.hitDelay ?? 250;
      sfxKey   = step.sfx;
      sfxVol   = step.vol ?? 0.5;
    } else {
      animKey  = this.cfg.keys.attack;
      hitDelay = this.cfg.hitDelay ?? 250;
      sfxKey   = null;
    }

    if (this.scene.anims.exists(animKey)) this.sprite.play(animKey, true);

    // 🔊 SFX ayunan pedang bawahan (barengan frame tebasan)
    if (sfxKey && this.scene.cache.audio.exists(sfxKey)) {
      this.scene.time.delayedCall(hitDelay, () => {
        if (!this.isDead) this.scene.sound.play(sfxKey, { volume: sfxVol });
      });
    }

    // DAMAGE pas frame tebasan
    this.scene.time.delayedCall(hitDelay, () => {
      if (this.isDead || !this.sprite) return;
      const mc = this.scene.player;
      if (!mc || typeof this.scene.kenaSerang !== 'function') return;
      const dx = Math.abs(mc.x - this.sprite.x);
      const dy = Math.abs(mc.y - this.sprite.y);
      if (dx < this.cfg.attackRange + 12 && dy < 90) this.scene.kenaSerang(1);
    });

    this.sprite.once(_ANIM_DONE, () => { this.busy = false; });
  }

  #tembak(mc) {
    const now = this.scene.time.now;
    if (this.busy || now - this.lastAttack < this.cfg.attackCD) return;
    this.lastAttack = now;
    this.busy = true;
    const s = this.sprite;
    s.play(this.cfg.keys.attack, true);

    this.scene.time.delayedCall(260, () => {
      if (this.isDead || !this.scene.proyektil) return;
      const p = this.scene.proyektil.create(s.x, s.y - 8, this.cfg.projectile);
      if (!p) return;
      p.setScale(this.cfg.projScale || 1);
      p.body.setAllowGravity(false);
      if (this.scene.anims.exists(this.cfg.projectile)) p.play(this.cfg.projectile);

      const tx = mc.x - s.x, ty = (mc.y - 8) - s.y;
      const len = Math.hypot(tx, ty) || 1;
      p.setVelocity(tx / len * this.cfg.projSpeed, ty / len * this.cfg.projSpeed);
      p.setFlipX(tx < 0);

      this.scene.time.delayedCall(4000, () => p && p.active && p.destroy());
    });

    s.once(_ANIM_DONE, () => { this.busy = false; });
  }

  #blink(mc) {
    if (this.blinking || this.isDead) return;
    this.blinking = true;
    this.lastBlink = this.scene.time.now;
    const s = this.sprite;
    s.body.setVelocity(0, 0);

    this.scene.tweens.add({
      targets: s, alpha: 0, duration: 220,
      onComplete: () => {
        if (this.isDead) { this.blinking = false; return; }
        const sisi  = Math.random() < 0.5 ? -1 : 1;
        const jarak = this.cfg.blinkJarak ?? 150;
        const ly    = mc.body ? mc.body.bottom - (this.cfg.blinkLift ?? 82) : mc.y;
        s.setPosition(mc.x + sisi * jarak, ly);
        if (s.body) s.body.setVelocity(0, 0);
        s.setFlipX(sisi > 0);
        this.scene.tweens.add({
          targets: s, alpha: 1, duration: 220,
          onComplete: () => { this.blinking = false; }
        });
      }
    });
  }

  takeDamage(n = 1) {
    if (this.isDead) return;
    this.hp -= n;
    const s = this.sprite;

    s.setTint(ENEMY_COMMON.tintHurt);
    this.scene.time.delayedCall(ENEMY_COMMON.hurtMs, () => {
      if (!this.isDead && s.active) s.clearTint();
    });

    if (this.hp <= 0) { this.#mati(); return; }

    if (!this.isBoss) {
      this.busy = true;
      s.play(this.cfg.keys.hurt, true);
      s.once(_ANIM_DONE, () => { this.busy = false; });
    }
  }

  #mainkanDeadSfx() {
    const sfx = this.cfg.deadSfx;
    if (sfx && this.scene.cache.audio.exists(sfx.key)) {
      this._deadSnd = this.scene.sound.add(sfx.key, { volume: sfx.volume ?? 0.5 });
      this._deadSnd.play();
    }
  }

  #stopDeadSfx() {
    if (this._deadSnd) {
      this._deadSnd.stop();
      this._deadSnd.destroy();
      this._deadSnd = null;
    }
  }

  #mati() {
    this.isDead = true;
    this.blinking = false;
    const s = this.sprite;
    this.scene.tweens.killTweensOf(s);
    s.setAlpha(1);
    s.body.setVelocity(0, 0);
    s.body.enable = false;
    s.clearTint();

    this.#mainkanDeadSfx();

    s.play(this.cfg.keys.dead, true);

    s.once(_ANIM_DONE, () => {
      const delay = this.isBoss ? 300 : 0;
      this.scene.tweens.add({
        targets: s, alpha: 0, duration: this.isBoss ? 700 : 300, delay,
        onComplete: () => {
          this.#stopDeadSfx();
          s.destroy();
        },
      });
    });
  }
}