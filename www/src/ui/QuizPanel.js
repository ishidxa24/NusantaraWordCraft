// src/ui/QuizPanel.js
export class QuizPanel {

    constructor(scene) {
        this.scene = scene;
        this.aktif = false;
        this.objek = [];
        this.npcAktif = null;
        this.idxSoal = 0;
        this.onBenarSatu = null;
        this.onSelesai = null;
    }

    buka(npc) {
        this.npcAktif = npc;
        this.idxSoal = 0;
        this.aktif = true;
        this.tampilSoal();
    }

    tampilSoal() {
        this.bersihkan();
        const scene = this.scene;
        const { width, height } = scene.scale;
        const soalSet = this.npcAktif.soalSet;
        const soal = soalSet[this.idxSoal];

        const cx = width / 2;
        const panelW = 680, panelH = 500;
        const top = height / 2 - panelH / 2;

        // overlay + panel gelap
        const overlay = scene.add.rectangle(cx, height / 2, width, height, 0x000000, 0.7)
            .setScrollFactor(0).setDepth(2000);
        const panel = scene.add.graphics().setScrollFactor(0).setDepth(2001);
        panel.fillStyle(0x10131c, 0.97).fillRoundedRect(cx - panelW / 2, top, panelW, panelH, 14);
        panel.lineStyle(2, 0xffd9e0, 0.7).strokeRoundedRect(cx - panelW / 2, top, panelW, panelH, 14);
        this.objek.push(overlay, panel);

        // nomor soal
        const nomor = scene.add.text(cx, top + 22, 'Soal ' + (this.idxSoal + 1) + ' / ' + soalSet.length, {
            fontFamily: 'monospace', fontSize: '14px', color: '#ffd9e0'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(2002);

        // pertanyaan
        const tanya = scene.add.text(cx, top + 58, soal.pertanyaan, {
            fontFamily: 'monospace', fontSize: '16px', color: '#ffffff',
            align: 'center', wordWrap: { width: panelW - 70 }, lineSpacing: 5
        }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(2002);
        this.objek.push(nomor, tanya);

        // tombol jawaban — mulai di bawah pertanyaan
        const btnW = 590, btnH = 44, gap = 10;
        const btnStartY = top + 58 + tanya.height + 26;
        soal.pilihan.forEach((teks, i) => {
            const by = btnStartY + i * (btnH + gap);
            const btn = scene.add.graphics().setScrollFactor(0).setDepth(2002);
            const gambar = (warna) => {
                btn.clear();
                btn.fillStyle(warna, 1).fillRoundedRect(cx - btnW / 2, by, btnW, btnH, 8);
                btn.lineStyle(1, 0xffffff, 0.12).strokeRoundedRect(cx - btnW / 2, by, btnW, btnH, 8);
            };
            gambar(0x2a2140);
            const zone = scene.add.zone(cx, by + btnH / 2, btnW, btnH).setScrollFactor(0).setDepth(2003)
                .setInteractive({ useHandCursor: true });
            const btnTeks = scene.add.text(cx - btnW / 2 + 18, by + btnH / 2, (i + 1) + '.  ' + teks, {
                fontFamily: 'monospace', fontSize: '14px', color: '#eae0f0',
                wordWrap: { width: btnW - 40 }
            }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(2004);

            zone.on('pointerover', () => gambar(0x4a2d70));
            zone.on('pointerout',  () => gambar(0x2a2140));
            zone.on('pointerdown', () => this.cek(i));

            this.objek.push(btn, zone, btnTeks);
        });

        // area feedback KHUSUS di bawah tombol (nggak numpuk)
        const fbY = btnStartY + soal.pilihan.length * (btnH + gap) + 10;
        this.feedback = scene.add.text(cx, fbY, '', {
            fontFamily: 'monospace', fontSize: '12px', color: '#ffffff',
            align: 'center', wordWrap: { width: panelW - 60 }, lineSpacing: 3
        }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(2002);
        this.objek.push(this.feedback);
    }

    cek(i) {
        const soal = this.npcAktif.soalSet[this.idxSoal];
        if (i === soal.jawabanBenar) {
            this.feedback.setColor('#8affa0').setText('BENAR!  +1 Cahaya');
            if (this.onBenarSatu) this.onBenarSatu();

            this.idxSoal++;
            if (this.idxSoal >= this.npcAktif.soalSet.length) {
                this.npcAktif.dijawab = true;
                this.npcAktif.obj.setTint(0x88ff88);
                this.scene.time.delayedCall(650, () => {
                    this.tutup();
                    if (this.onSelesai) this.onSelesai(this.npcAktif);
                });
            } else {
                this.scene.time.delayedCall(750, () => this.tampilSoal());
            }
        } else {
            this.feedback.setColor('#ffb066').setText('Belum tepat.\n' + soal.penjelasan + '\n(coba pilih lagi)');
        }
    }

    bersihkan() {
        this.objek.forEach(o => o.destroy());
        this.objek = [];
    }

    tutup() {
        this.bersihkan();
        this.aktif = false;
    }
}