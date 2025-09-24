import { Client, ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder, Team, User, version } from "discord.js";
import config from "../../../config.json" with { type: "json" };
import { client } from "../../fembot.js";
import os from "node:os";
import os_utils from "os-utils";
import packagejson from "../../../package.json" with { type: "json" };
import { CommandCategories } from "../../types.js";
import { timeToString } from "../../utils/time.js";

export default {
	data: new SlashCommandBuilder()
		.setName('info')
		.setDescription('Wysyła informacje o bocie!'),
	category: CommandCategories.Info,
	flags: [],
	async execute(interaction: ChatInputCommandInteraction) {
		await interaction.deferReply();
		const labelEmbed = new EmbedBuilder()
			.setTitle(`${client.version.name} (${client.version.codename})`)
			.setColor(0x96EFFF)
			.setDescription(packagejson.description);
		const ownerUsername = ((client.application?.owner || await client.users.fetch(config.ownerId)) as User).username
		const infoEmbed = new EmbedBuilder()
			.setTimestamp(new Date())
			.addFields(
				{ name: "Biblioteka", value: `
[Node.js](https://nodejs.org/) \`${process.version}\`
[Discord.js](https://discord.js.org/) \`${version}\``, inline: true },
				{ name: "Właściciel bota", value: `@${ownerUsername}\n${config.ownerId}`, inline: true },
				{ name: "Ważne linki", value: `
[Dołącz na nasz serwer!](${config.invite_link})
				`, inline: true },
				{ name: "Uptime", value: timeToString(process.uptime()*1000) }
			)
			.setFooter({ text: "Psst... Obczaj komende /pomoc." });
		await interaction.followUp({
			embeds: [labelEmbed, infoEmbed]
		});
		return true;
	}
}