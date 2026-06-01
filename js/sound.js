const Sound = {
    ctx: null,
    unlocked: false,
    buffers: {},
    masterGain: null,
    bgmGain: null,
    activeSources: {},

    settings: {
        sfxVolume:
            typeof CONFIG !== 'undefined' && CONFIG.AUDIO
                ? CONFIG.AUDIO.SFX_VOLUME_DEFAULT
                : 0.7,
        bgmVolume:
            typeof CONFIG !== 'undefined' && CONFIG.AUDIO
                ? CONFIG.AUDIO.BGM_VOLUME_DEFAULT
                : 0.3,
        keyboardSound: true,
        levelupSound: true,
    },

    sources: {
        chalk: './assets/sounds/chalk.mp3',
        bell: './assets/sounds/bell.mp3',
        levelUp: './assets/sounds/levelup.mp3'
    },

    init() {
        if (this.ctx) return;

        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioContext();

        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value =
            typeof CONFIG !== 'undefined' && CONFIG.AUDIO
                ? CONFIG.AUDIO.MASTER_VOLUME_DEFAULT
                : 0.6;
        this.masterGain.connect(this.ctx.destination);

        this.bgmGain = this.ctx.createGain();
        this.bgmGain.gain.value = this.settings.bgmVolume;
        this.bgmGain.connect(this.masterGain);

        this.loadSavedSettings();
        this.applyGainSettings();
        this.loadSounds();
        this.setupUnlock();
    },

    loadSavedSettings() {
        const soundKey =
            typeof CONFIG !== 'undefined' && CONFIG.STORAGE && CONFIG.STORAGE.SETTINGS_SOUND
                ? CONFIG.STORAGE.SETTINGS_SOUND
                : 'td_settings_sound';

        try {
            const raw = localStorage.getItem(soundKey);
            if (!raw) return;

            const saved = JSON.parse(raw);

            this.setSettings({
                sfxVolume:
                    typeof saved.sfxVolume === 'number'
                        ? saved.sfxVolume / 100
                        : this.settings.sfxVolume,
                bgmVolume:
                    typeof saved.bgmVolume === 'number'
                        ? saved.bgmVolume / 100
                        : this.settings.bgmVolume,
                keyboardSound:
                    typeof saved.keyboardSound === 'boolean'
                        ? saved.keyboardSound
                        : this.settings.keyboardSound,
                levelupSound:
                    typeof saved.levelupSound === 'boolean'
                        ? saved.levelupSound
                        : this.settings.levelupSound,
            });
        } catch (e) {
            console.warn('[Sound] 저장된 사운드 설정 로드 실패:', e);
        }
    },

    setSettings(nextSettings = {}) {
        this.settings = {
            ...this.settings,
            ...nextSettings,
        };

        this.applyGainSettings();
    },

    applyGainSettings() {
        if (this.bgmGain) {
            this.bgmGain.gain.value = this.settings.bgmVolume;
        }
    },

    async loadSounds() {
        if (!this.ctx) return;

        for (const [key, url] of Object.entries(this.sources)) {
            try {
                const response = await fetch(url);
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

                const arrayBuffer = await response.arrayBuffer();
                const audioBuffer = await this.ctx.decodeAudioData(arrayBuffer);

                this.buffers[key] = audioBuffer;
            } catch (e) {
                console.warn(`[Sound] 음원 로드 실패 (${key}):`, e);
            }
        }
    },

    setupUnlock() {
        const unlockHandler = () => {
            if (this.unlocked) return;
            if (!this.ctx) return;

            if (this.ctx.state === 'suspended') {
                this.ctx.resume();
            }

            const buffer = this.ctx.createBuffer(1, 1, 22050);
            const source = this.ctx.createBufferSource();
            source.buffer = buffer;
            source.connect(this.ctx.destination);
            source.start(0);

            this.unlocked = true;
            console.log('[Sound] AudioContext Unlocked');

            window.removeEventListener('keydown', unlockHandler);
            window.removeEventListener('mousedown', unlockHandler);
            window.removeEventListener('touchstart', unlockHandler);
        };

        window.addEventListener('keydown', unlockHandler, { once: true });
        window.addEventListener('mousedown', unlockHandler, { once: true });
        window.addEventListener('touchstart', unlockHandler, { once: true });
    },

    canPlay(key) {
        if (key === 'chalk' && !this.settings.keyboardSound) return false;
        if (key === 'levelUp' && !this.settings.levelupSound) return false;

        return true;
    },

    play(key, volume = 1.0) {
        if (!this.unlocked || !this.buffers[key]) return;
        if (!this.canPlay(key)) return;

        this.stop(key);

        const source = this.ctx.createBufferSource();
        source.buffer = this.buffers[key];

        const gainNode = this.ctx.createGain();
        gainNode.gain.value = volume * this.settings.sfxVolume;

        source.connect(gainNode);
        gainNode.connect(this.masterGain);

        source.start(0);

        this.activeSources[key] = source;

        source.onended = () => {
            if (this.activeSources[key] === source) {
                delete this.activeSources[key];
            }
        };
    },

    stop(key) {
        if (this.activeSources[key]) {
            try {
                this.activeSources[key].stop();
            } catch (e) {
                // 이미 종료된 source는 무시
            }

            delete this.activeSources[key];
        }
    },

    stopAll() {
        Object.keys(this.activeSources).forEach((key) => {
            this.stop(key);
        });
    }
};