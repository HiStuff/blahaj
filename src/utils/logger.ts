import chalk from "chalk";

function getTime() {
	return chalk.gray(new Date().toTimeString().split(" ")[0]);
}

export function info(text: any) {
	console.log(`${getTime()} ℹ️  ${text}`);
}

export function warn(text: any) {
	console.log(`${getTime()} ⚠️  ${text}`);
}

export function error(text: any) {
	console.log(`${getTime()} ❌ ${text}`);
}

export function success(text: any) {
	console.log(`${getTime()} ✅ ${text}`);
}
