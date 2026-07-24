// src/Settings.js
// Penyimpanan setting global game — persist ke localStorage.
// Dibaca oleh KontrolMobile, SettingsScene, dan boot audio.
// Catatan: localStorage aman di build web/Capacitor (bukan di preview artifact).
const KEY = 'nwc_settings';   // nwc = Nusantara WordCraft

const DEFAULT = {
    volume:     0.8,      // 0..1  — master; berlaku ke SEMUA suara via sound manager Phaser
    mute:       false,
    kontrol:    'auto',   // 'auto' (deteksi touch) | 'always' | 'never'
    fullscreen: false,
};

function muat() {
    try {
        const raw = localStorage.getItem(KEY);
        return raw ? { ...DEFAULT, ...JSON.parse(raw) } : { ...DEFAULT };
    } catch (e) {
        return { ...DEFAULT };
    }
}

let _data = muat();

export const Settings = {
    get(k)   { return _data[k]; },
    getAll() { return { ..._data }; },
    set(k, v) { _data[k] = v; this._simpan(); return v; },
    reset()  { _data = { ...DEFAULT }; this._simpan(); },

    _simpan() {
        try { localStorage.setItem(KEY, JSON.stringify(_data)); } catch (e) { /* abaikan */ }
    },

    // Terapkan volume & mute ke sound manager global Phaser.
    // Panggil di scene boot / MainMenu.create(), dan tiap kali volume/mute berubah.
    terapkanAudio(game) {
        if (!game || !game.sound) return;
        game.sound.mute   = _data.mute;
        game.sound.volume = _data.volume;   // Phaser tetap simpan volume walau mute
    },

    // Dipakai KontrolMobile: apakah kontrol harus aktif, diberi hasil deteksi touch.
    kontrolAktif(touch) {
        if (_data.kontrol === 'always') return true;
        if (_data.kontrol === 'never')  return false;
        return !!touch;   // 'auto'
    },
};