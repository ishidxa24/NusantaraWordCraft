// src/ui/Hud.js
// HUD: HP bar (0–100) + Cahaya (dulu "koin"). Sistem nyawa/hati lama DIHAPUS.
export class Hud {

    constructor(scene, opsi = {}) {
        this.scene = scene;

        // properti internal tetap `koin` (biar scene lain tak perlu ganti nama),
        // TAPI ditampilkan sebagai "Cahaya".
        this.koin = (opsi.cahaya != null) ? opsi.cahaya : 0;

        this.hpMax = (opsi.hpMax != null) ? opsi.hpMax : 100;
        this.hp = this.hpMax;

        // ===== HP BAR (atas) =====
        this.barX = 16; this.barY = 30; this.barW = 220; this.barH = 18;

        this.lblHp = scene.add.text(this.barX, 10, 'HP', {
            fontFamily: 'monospace', fontSize: '14px',
            color: '#ffffff', stroke: '#000000', strokeThickness: 3
        }).setScrollFactor(0).setDepth(1001);

        this.barBg   = scene.add.graphics().setScrollFactor(0).setDepth(1000);
        this.barFill = scene.add.graphics().setScrollFactor(0).setDepth(1001);

        // ===== CAHAYA (bawah HP bar) =====
        this.teksKoin = scene.add.text(this.barX, this.barY + this.barH + 8, '', {
            fontFamily: 'monospace', fontSize: '15px',
            color: '#ffe08a', stroke: '#000000', strokeThickness: 3
        }).setScrollFactor(0).setDepth(1001);

        this.gambarHp();
        this.updateCahaya();
    }

    // ---------- CAHAYA ----------
    tambahKoin(jumlah = 1) { this.koin += jumlah; this.updateCahaya(); }
    setKoin(n) { this.koin = n; this.updateCahaya(); }
    updateCahaya() {
        if (this.teksKoin) this.teksKoin.setText('✦ Cahaya: ' + this.koin);
    }

    // ---------- HP ----------
    setHp(n) { this.hp = Phaser.Math.Clamp(n, 0, this.hpMax); this.gambarHp(); return this.hp; }
    kurangiHp(n) { return this.setHp(this.hp - n); }
    resetHp() { return this.setHp(this.hpMax); }

    gambarHp() {
        const rasio = this.hpMax > 0 ? this.hp / this.hpMax : 0;
        let warna = 0x4caf50;                         // hijau
        if (rasio <= 0.30) warna = 0xe53935;          // merah
        else if (rasio <= 0.60) warna = 0xffb300;     // kuning

        this.barBg.clear();
        this.barBg.fillStyle(0x000000, 0.55).fillRoundedRect(this.barX - 2, this.barY - 2, this.barW + 4, this.barH + 4, 5);
        this.barBg.fillStyle(0x3a1212, 1).fillRoundedRect(this.barX, this.barY, this.barW, this.barH, 4);

        this.barFill.clear();
        if (rasio > 0) {
            const w = this.barW * rasio;
            const r = Math.min(4, w / 2);
            this.barFill.fillStyle(warna, 1).fillRoundedRect(this.barX, this.barY, w, this.barH, r);
        }
    }

    // ---------- kompat lama (F4 masih panggil setNyawa; dibiarkan no-op biar tak error) ----------
    setNyawa() { /* sistem nyawa dihapus — stub agar scene lama tidak crash */ }
}