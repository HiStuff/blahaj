import { Client, Events, Message } from "discord.js";

export default {
	name: Events.MessageCreate,
	once: false,
	async execute(message: Message) {
		if (
			message.guildId == "1371509532878049311" &&
			message.content.startsWith("!slodziak") &&
			message.member?.roles.cache.has("1397677659307376640")
		) {
			const member = message.mentions.members?.first();
			if (member) {
				if (member.roles.cache.has("1395924643038367744")) {
					await member.roles.remove("1395924643038367744");
				} else {
					await message.reply(
						"Użytkownik nie miał roli weryfikacja słodziaka. Trochę dziwne co nie?",
					);
				}
				await member.roles.add("1375814858217357395");
				await message.react("✅");
			} else {
				await message.react("❌");
			}
		}
	},
};
