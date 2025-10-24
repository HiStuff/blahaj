import { time, TimestampStyles } from "discord.js";

export function getPenaltyTimeLeftString(
	miliseconds: number | null,
): number | string {
	if (miliseconds) {
		const date = new Date();
		date.setMilliseconds(date.getMilliseconds() + miliseconds);
		return time(date, TimestampStyles.RelativeTime);
	} else return "`Nigdy`";
}

export function getPenaltyDurationTimeString(ms: number | null) {
	if (!ms) return "Na zawsze.";
	let seconds = Math.floor(ms / 1000);

	if (seconds < 60) {
		return `${seconds} ${seconds !== 1 ? "sekund" : "sekunda"}`;
	}

	const days = Math.floor(seconds / (24 * 3600));
	seconds %= 24 * 3600;

	const hours = Math.floor(seconds / 3600);
	seconds %= 3600;

	const minutes = Math.floor(seconds / 60);
	seconds %= 60;

	let result = "";

	if (days > 0) {
		result += `${days} ${days > 1 ? "dni" : "dzien"}`;
	}
	if (hours > 0) {
		if (result) result += ", ";
		result += `${hours} ${hours > 1 ? "godzin" : "godzina"}`;
	}
	if (minutes > 0) {
		if (result) result += ", ";
		result += `${minutes} ${minutes > 1 ? "minut" : "minuta"}`;
	}
	if (seconds > 0 || result === "") {
		if (result) result += " i ";
		result += `${seconds} ${seconds > 1 ? "sekund" : "sekunda"}`;
	}

	return result;
}
