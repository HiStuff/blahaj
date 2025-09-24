export function timeToString(ms: number) {
    let seconds = Math.floor(ms / 1000);

    if (seconds < 60) {
        return `${seconds}s`;
    }

    const days = Math.floor(seconds / (24 * 3600));
    seconds %= 24 * 3600;

    const hours = Math.floor(seconds / 3600);
    seconds %= 3600;

    const minutes = Math.floor(seconds / 60);
    seconds %= 60;

    let result = '';

    if (days > 0) {
        result += `${days}d`;
    }
    if (hours > 0) {
        if (result) result += ', ';
        result += `${hours}h`;
    }
    if (minutes > 0) {
        if (result) result += ', ';
        result += `${minutes}min`;
    }
    if (seconds > 0 || result === '') {
        if (result) result += ' and ';
        result += `${seconds}s`;
    }

    return result;
}