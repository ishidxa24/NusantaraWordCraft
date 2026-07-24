export class NpcManager {

    constructor(scene, dataNpc) {
        this.scene = scene;

        if (!scene.anims.exists('npc_gandalf_walk') && scene.textures.exists('npc_gandalf')) {
            scene.anims.create({
                key: 'npc_gandalf_walk',
                frames: scene.anims.generateFrameNumbers('npc_gandalf', { start: 0, end: 12 }),
                frameRate: 6,
                repeat: -1
            });
        }
        // idle: goyang SANGAT pelan, cuma 3 frame (bukan jalan)
        if (!scene.anims.exists('npc_gandalf_idle') && scene.textures.exists('npc_gandalf')) {
            scene.anims.create({
                key: 'npc_gandalf_idle',
                frames: scene.anims.generateFrameNumbers('npc_gandalf', { start: 0, end: 2 }),
                frameRate: 2,   // sangat pelan = goyangan halus
                repeat: -1
            });
        }

        this.list = dataNpc.map(d => {
            const obj = scene.physics.add.sprite(d.x, d.y ?? 458, d.sprite || 'npc_gandalf');
            obj.setScale(2.7);
            obj.body.setAllowGravity(false);

            const prompt = scene.add.text(obj.x, obj.y - 80, '▼ Tekan SPACE', {
                fontFamily: 'monospace', fontSize: '13px',
                color: '#ffff00', stroke: '#000000', strokeThickness: 3
            }).setOrigin(0.5).setVisible(false);

            return {
                obj, prompt, dijawab: false,
                idle: d.idle === true,          // ← NPC diam dari awal kalau true
                flip: d.flip === true,          // ← arah hadap awal (opsional)
                namaNpc: d.namaNpc,             // ← nama speaker di dialog
                soalSet: d.soalSet,
                dialog: d.dialog,
                dialogSelesai: d.dialogSelesai,
                patroli: { xAwal: d.x, jarak: 80, kecepatan: 25, arah: 1 }
            };
        });

        // NPC idle: set arah hadap & langsung mainkan animasi idle sekali di awal
        for (const npc of this.list) {
            if (npc.idle || npc.dijawab) {
                npc.obj.setVelocity(0, 0);
                npc.obj.body.stop();
                if (this.scene.anims.exists('npc_gandalf_idle') &&
                    !npc.obj.anims.isPlaying) {
                    npc.obj.play('npc_gandalf_idle', true);
                }
                npc.obj.setFlipX(npc.flip);
                npc.prompt.x = npc.obj.x;
                continue;
            }
        }
    }

    update() {
        for (const npc of this.list) {
            // NPC idle ATAU sudah dijawab → diam + animasi idle, tidak patroli
            if (npc.idle || npc.dijawab) {
                npc.obj.setVelocity(0, 0);
                npc.obj.body.stop();
                if (this.scene.anims.exists('npc_gandalf_idle') &&
                    npc.obj.anims.currentAnim?.key !== 'npc_gandalf_idle') {
                    npc.obj.play('npc_gandalf_idle', true);
                }
                npc.prompt.x = npc.obj.x;
                continue;
            }

            if (this.scene.anims.exists('npc_gandalf_walk')) {
                npc.obj.play('npc_gandalf_walk', true);
            }

            const p = npc.patroli;
            npc.obj.setVelocityX(p.kecepatan * p.arah);
            npc.obj.flipX = (p.arah > 0);

            if (npc.obj.x > p.xAwal + p.jarak) p.arah = -1;
            if (npc.obj.x < p.xAwal - p.jarak) p.arah = 1;

            npc.prompt.x = npc.obj.x;
        }
    }

    hentikanSemua() {
        for (const npc of this.list) {
            npc.obj.setVelocity(0, 0);
            npc.obj.body.stop();
            if (this.scene.anims.exists('npc_gandalf_idle')) {
                npc.obj.play('npc_gandalf_idle', true);
            }
        }
    }

    cekKedekatan(player) {
        let dekat = null;
        for (const npc of this.list) {
            if (npc.dijawab) { npc.prompt.setVisible(false); continue; }
            const d = Phaser.Math.Distance.Between(player.x, player.y, npc.obj.x, npc.obj.y);
            if (d < 90) {
                npc.prompt.setVisible(true);
                dekat = npc;
            } else {
                npc.prompt.setVisible(false);
            }
        }
        return dekat;
    }

    semuaSelesai() {
        return this.list.every(n => n.dijawab);
    }
}