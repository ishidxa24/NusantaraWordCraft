// src/gameobject/Awan.js
// Awan bergerak untuk latar F1 — drift pelan ke kiri, lalu muncul lagi dari kanan.
// Aman: kalau tekstur awan belum di-preload di scene, konstruktor diam saja (nggak error).
const CFG = {
    keys: ['cloud1', 'cloud2', 'cloud3', 'cloud4', 'cloud5', 'cloud6'],
    jumlah: 8,               // banyak awan di layar
    yMin: 20, yMax: 230,     // band langit (jarak dari atas layar, px)
    skalaMin: 1.8, skalaMax: 3.2,   // digedein (dulu 0.8–1.7)
    kecepatanMin: 0.12, kecepatanMax: 0.5,   // px/frame ke kiri
    alphaMin: 0.55, alphaMax: 0.95,
    depth: -10,              // di depan langit (-20) tapi di belakang tilemap/pohon (0)
    tint: null,              // mis. 0xffd0b0 buat nyemuin warna senja; null = warna asli
};

export class Awan {
    constructor(scene, opt = {}) {
        this.scene = scene;
        const keys = (opt.keys || CFG.keys).filter(k => scene.textures.exists(k));
        this.awan = [];
        if (keys.length === 0) return;   // tekstur belum di-load → diam

        const W = scene.scale.width;
        const jml = opt.jumlah ?? CFG.jumlah;
        this._keys = keys;

        for (let i = 0; i < jml; i++) {
            const s = scene.add.image(
                Phaser.Math.Between(0, W),
                Phaser.Math.Between(CFG.yMin, CFG.yMax),
                Phaser.Utils.Array.GetRandom(keys)
            ).setScrollFactor(0).setDepth(CFG.depth)
             .setScale(Phaser.Math.FloatBetween(CFG.skalaMin, CFG.skalaMax))
             .setAlpha(Phaser.Math.FloatBetween(CFG.alphaMin, CFG.alphaMax));
            if (CFG.tint != null) s.setTint(CFG.tint);
            s._spd = Phaser.Math.FloatBetween(CFG.kecepatanMin, CFG.kecepatanMax);
            this.awan.push(s);
        }
    }

    // panggil tiap frame dari update() scene
    update() {
        // aman kalau scene sudah pindah/mati (mis. sisa referensi setelah scene.restart)
        if (!this.scene || !this.scene.sys) return;
        const W = this.scene.scale.width;
        for (const s of this.awan) {
            if (!s || !s.scene) continue;   // gambar sudah dihancurkan → lewati
            s.x -= s._spd;
            const wHalf = s.displayWidth / 2;
            if (s.x < -wHalf) {
                // keluar kiri → muncul lagi dari kanan, acak ulang biar variatif
                s.x = W + wHalf;
                s.y = Phaser.Math.Between(CFG.yMin, CFG.yMax);
                s._spd = Phaser.Math.FloatBetween(CFG.kecepatanMin, CFG.kecepatanMax);
                if (this._keys && this._keys.length)
                    s.setTexture(Phaser.Utils.Array.GetRandom(this._keys));
                s.setScale(Phaser.Math.FloatBetween(CFG.skalaMin, CFG.skalaMax));
                s.setAlpha(Phaser.Math.FloatBetween(CFG.alphaMin, CFG.alphaMax));
                if (CFG.tint != null) s.setTint(CFG.tint);
            }
        }
    }
}