const LOG_KEY = 'shortly_logs';

function readLogs() {
    try {
        return JSON.parse(localStorage.getItem(LOG_KEY) || '[]');
    } catch {
        return [];
    }
}

function writeLog(entry) {
    const logs = readLogs();
    logs.unshift(entry);
    localStorage.setItem(LOG_KEY, JSON.stringify(logs.slice(0, 200))); // keep latest 200
}

export function log(level, message, meta = {}) {
    const entry = {
        time: new Date().toISOString(),
        level,
        message,
        meta
    };
    try {
        console[level === 'error' ? 'error' : 'log'](`[Shortly:${level}]`, message, meta);
    } catch {}
    writeLog(entry);
}

export function getLogs() {
    return readLogs();
}