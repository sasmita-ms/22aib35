const MAP_KEY = 'shortly_mappings';
const STATS_KEY = 'shortly_stats';

function read(key, fallback) {
    try {
        return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));
    } catch {
        return fallback;
    }
}

function write(key, val) {
    try {
        localStorage.setItem(key, JSON.stringify(val));
    } catch {}
}

export function getMappings() {
    return read(MAP_KEY, {});
}

export function saveMapping(code, mapping) {
    const m = getMappings();
    m[code] = mapping;
    write(MAP_KEY, m);
}

export function deleteMapping(code) {
    const m = getMappings();
    delete m[code];
    write(MAP_KEY, m);
}

export function existsCode(code) {
    return Object.prototype.hasOwnProperty.call(getMappings(), code);
}

export function getStats() {
    return read(STATS_KEY, {});
}

export function addClick(code, clickData) {
    const stats = getStats();
    if (!stats[code]) stats[code] = { clicks: [] };
    stats[code].clicks.unshift(clickData);
    write(STATS_KEY, stats);
}

export function getClicks(code) {
    const stats = getStats();
    return stats[code] ?.clicks || [];
}