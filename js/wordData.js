// 테스트를 위해 임시로 넣어놓은 데이터입니다.
const WordData = {
    data: {
        "1": ["mouse", "keyboard", "monitor", "hardware", "printer", "speaker"],
        "2": ["internet", "file", "folder", "desktop", "website", "icon"],
        "3": ["variable", "constant", "integer", "float", "function", "operator"],
        "4": ["conditional", "loop", "array", "parameter", "return", "debugging"],
        "5": ["class", "object", "inheritance", "interface", "abstraction", "encapsulation"],
        "6": ["stack", "queue", "linkedlist", "tree", "graph", "hashtable"],
        "7": ["process", "thread", "deadlock", "mutex", "semaphore", "kernel"],
        "8": ["protocol", "network", "port", "routing", "transaction", "normalization"],
        "9": ["algorithm", "complexity", "compiler", "assembly", "memory", "paging"],
        "10": ["cluster", "virtualization", "container", "intelligence", "encryption", "automata"],
        "11": ["middleware", "pipeline", "deployment", "repository", "framework", "endpoint"],
        "12": ["blockchain", "tensor", "heuristic", "throughput", "latency", "concurrency"], 
        "13": ["microservice", "loadbalancer", "idempotency", "sharding", "replication", "telemetry"],
        "14": ["perceptron", "overfitting", "transformer", "embedding", "regression", "optimization"],
        "15": ["cryptography", "asynchronous", "immutability", "parallelism", "deterministic", "cybersecurity"]
    },

    async loadWords() {
        return this.data;
    },

    getWordsByLevel(level) {
        return this.data[String(level)] || [];
    },

    // 1. 시드 기반 난수 생성 함수
    seededRandom(seed) {
        const x = Math.sin(seed) * 10000;
        return x - Math.floor(x);
    },

    // 2. 오늘 날짜를 기반으로 한 고유 시드값 생성
    getDailySeed() {
        const today = new Date();
        return today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
    },

    // 3. 데일리 시드에 맞춰 섞인 단어 목록 반환
    getDailyWords(level) {
        const words = this.data[String(level)] || [];
        if (words.length === 0) return [];
        
        // 레벨마다 다른 시퀀스를 갖도록 시드에 레벨 값 가산
        let currentSeed = this.getDailySeed() + level; 
        
        // 원본 배열을 복사한 뒤 시드 기반으로 정렬(셔플)
        return [...words].sort(() => {
            const rand = this.seededRandom(currentSeed++);
            return rand - 0.5;
        });
    }
};
