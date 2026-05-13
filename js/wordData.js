// 테스트를 위해 임시로 넣어놓은 데이터입니다.
export const wordData = {
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
  "12": ["blockchain", "tensor", "heuristic", "throughput", "latency", "concurrency"]
};

export async function loadWords() {
    return wordData;
}

export function getWordsByLevel(level) {
    return wordData[String(level)] || [];
}