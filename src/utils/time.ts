export function timeToString(ms: number) {
    let seconds = Math.floor(ms / 1000);

    if (seconds < 60) {
        return `${seconds} ${seconds !== 1 ? 'sekund' : 'sekunda'}`;
    }

    const days = Math.floor(seconds / (24 * 3600));
    seconds %= 24 * 3600;

    const hours = Math.floor(seconds / 3600);
    seconds %= 3600;

    const minutes = Math.floor(seconds / 60);
    seconds %= 60;

    let result = '';

    if (days > 0) {
        result += `${days} ${days > 1 ? 'dni' : 'dzien'}`;
    }
    if (hours > 0) {
        if (result) result += ', ';
        result += `${hours} ${hours > 1 ? 'godzin' : 'godzina'}`;
    }
    if (minutes > 0) {
        if (result) result += ', ';
        result += `${minutes} ${minutes > 1 ? 'minut' : 'minuta'}`;
    }
    if (seconds > 0 || result === '') {
        if (result) result += ' i ';
        result += `${seconds} ${seconds > 1 ? 'sekund' : 'sekunda'}`;
    }

    return result;
}