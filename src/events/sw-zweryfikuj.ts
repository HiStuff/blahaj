import { Client, Events, Message } from "discord.js";

export default {
	name: Events.MessageCreate,
	once: false,
	async execute(message: Message) {
		if (
			message.guildId == "1423927041690173472" &&
			message.content.startsWith("!zweryfikuj") &&
			message.member?.roles.cache.has("1448025682579034133")
		) {
			const member = message.mentions.members?.first();
			if (member) {
				if (message.channel.isSendable()) {
					await member.roles.add("1424016053083570310");
					await message.channel.send(`
# Został\\*ś zweryfikowan\\*!
Przywitaj się na kanale <#1424017185218756700> i jeżeli nie masz żadnych pytań, to zamknij ticketa. ^^
                        `);
                    await message.react("✅");
                } else {
                    await message.react("❌");
                    await message.react("💬");
                }
            } else {
                await message.react("❌");
                await message.react("👤");
            }
		}
	},
};
