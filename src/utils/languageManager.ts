import fs from "node:fs";
import path from "node:path";

import { fileURLToPath } from "node:url";
import { Language, Languages } from "../types.js";
import { Locale } from "discord.js";
import * as log from "../utils/logger.js";
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export class LanguageManager {
	folderPath: string = "../../lang/";
	languages: Languages = {};
	async load() {
		if (fs.existsSync(path.join(__dirname, this.folderPath))) {
			fs.readdir(path.join(__dirname, this.folderPath), (err, files) => {
				if (err) {
					throw err;
				}
				files.forEach((file) => {
					if (file.endsWith(".json")) {
						fs.readFile(
							path.join(__dirname, this.folderPath, file),
							(err, data) => {
								if (err) {
									throw err;
								}
								const lang = JSON.parse(
									data.toString(),
								) as Language;
								this.languages[lang.locale] = lang;
							},
						);
					}
				});
			});
		} else {
			throw new Error("Language Folder doesn't exist.");
		}
	}
	getResponse(lang: string | null, key: string, ...args: string[]) {
		let formatted = (
			this.languages[lang || "en-US"] || this.languages["en-US"]
		).responses[key as keyof Language];
		for (let arg in args) {
			formatted = formatted.replace("{" + arg + "}", args[arg]);
		}
		return formatted;
	}
	getResponseObject(lang: string | null, key: string, ...args: string[]) {
		const object = (
			this.languages[lang || "en-US"] || this.languages["en-US"]
		).responses[key as keyof Language];
		if (typeof object != "object") return object;
		let formatted = JSON.stringify(object);
		for (let arg in args) {
			formatted = formatted.replace("{" + arg + "}", args[arg]);
		}
		return JSON.parse(formatted);
	}
	getOther(lang: string | null, key: string, ...args: string[]) {
		let formatted = (
			this.languages[lang || "en-US"] || this.languages["en-US"]
		).other[key as keyof Language];
		for (let arg in args) {
			formatted = formatted.replace("{" + arg + "}", args[arg]);
		}
		return formatted;
	}
	getOtherObject(lang: string | null, key: string, ...args: string[]) {
		const object = (
			this.languages[lang || "en-US"] || this.languages["en-US"]
		).other[key as keyof Language];
		if (typeof object != "object") return object;
		let formatted = JSON.stringify(object);
		for (let arg in args) {
			formatted = formatted.replace("{" + arg + "}", args[arg]);
		}
		return JSON.parse(formatted);
	}
	getNameLocalizations(key: string) {
		let localizations: Partial<Record<Locale, string | null>> | null = {};
		Object.keys(this.languages).forEach((language) => {
			const lang = this.languages[language] || this.languages["en-US"];
			if (!lang.localizations[key]) {
				log.error(
					`${lang.locale == "en-US" ? "[SEVERE] " : ""}Couldn't get name localization. Language: ${lang.locale}, key: ${key}`,
				);
				return;
			}
			localizations[lang.locale as keyof Record<Locale, string | null>] =
				lang.localizations[key].name;
		});
		return localizations;
	}
	getDescriptionLocalizations(key: string) {
		let localizations: Partial<Record<Locale, string | null>> | null = {};
		Object.keys(this.languages).forEach((language) => {
			const lang = this.languages[language] || this.languages["en-US"];
			if (!lang.localizations[key]) {
				log.error(
					`${lang.locale == "en-US" ? "[SEVERE] " : ""}Couldn't get description localization. Language: ${lang.locale}, key: ${key}`,
				);
				return;
			}
			localizations[lang.locale as keyof Record<Locale, string | null>] =
				lang.localizations[key].description;
		});
		return localizations;
	}
}
