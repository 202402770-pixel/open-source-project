const Sound = {
    ctx: null,
    unlocked: false,
    buffers: {},
    masterGain: null,
    activeSources: {},

    sources: {
        chalk: './assets/sounds/chalk.mp3',
        bell: './assets/sounds/bell.mp3',
        levelUp: './assets/sounds/levelup.mp3'
    },

    init() {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioContext();

        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = 0.5; 
        this.masterGain.connect(this.ctx.destination);

        this.loadSounds();
        this.setupUnlock();
    },

    async loadSounds() {
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

    play(key, volume = 1.0) {
        if (!this.unlocked || !this.buffers[key]) return;

        this.stop(key); 

        const source = this.ctx.createBufferSource();
        source.buffer = this.buffers[key];

        const gainNode = this.ctx.createGain();
        gainNode.gain.value = volume;
        
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
            }
            delete this.activeSources[key];
        }
    }
};
