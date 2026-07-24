import { MainMenu } from './scenes/MainMenu.js';
import { IslandSelect } from './scenes/IslandSelect.js';
import { Start } from './scenes/Forest/Start.js';
import { StartForest3 } from './scenes/Forest/StartForest3.js';
import { StartForest4 } from './scenes/Forest/StartForest4.js';
import { StartForest5 } from './scenes/Forest/StartForest5.js';
import { StartForest6 } from './scenes/Forest/StartForest6.js';
import { SettingsScene } from './scenes/SettingsScene.js';
import { CreditsScene } from './scenes/CreditsScene.js';

const config = {
    type: Phaser.AUTO,
    title: 'Nusantara WordCraft',
    parent: 'game-container',
    width: 1280,
    height: 720,
    backgroundColor: '#000000',
    pixelArt: true,
    roundPixels: true,
    physics: {
        default: 'arcade',
        arcade: { gravity: { y: 800 }, debug: false }   // debug hitbox fisika (nonaktif untuk rilis)
    },
    // scene PERTAMA = yang jalan duluan → MainMenu
    scene: [MainMenu, SettingsScene, IslandSelect, Start, StartForest3, StartForest4, StartForest5, StartForest6, CreditsScene],
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
}

const game = new Phaser.Game(config);

// ===== FIX: display kecil saat launch di WebView Android =====
// WebView kadang belum "menetap" ukurannya saat Phaser pertama menghitung skala,
// sehingga canvas tampil kecil. Paksa hitung ulang saat launch + tiap perubahan ukuran.
window.addEventListener('resize', () => game.scale.refresh());
window.addEventListener('orientationchange', () => {
    setTimeout(() => game.scale.refresh(), 200);
});
// hitung ulang beberapa kali di awal (WebView butuh waktu menetap)
setTimeout(() => game.scale.refresh(), 100);
setTimeout(() => game.scale.refresh(), 400);
setTimeout(() => game.scale.refresh(), 1000);