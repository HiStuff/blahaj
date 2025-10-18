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
			.setTitle(`${client.version.name} (${client.version.codename}) ${client.version.developmental ? "(dev)" : ""}`)
			.setColor(0x96EFFF)
			.setDescription(packagejson.description);
		const ownerUsername = ((client.application?.owner || await client.users.fetch(config.ownerId)) as User).username
		const infoEmbed = new EmbedBuilder()
			.setTimestamp(new Date())
			.addFields(
				{ name: client.lang.getResponse(interaction.guildLocale, "info_libraries"), value: `
[Node.js](https://nodejs.org/) \`${process.version}\`
[Discord.js](https://discord.js.org/) \`${version}\``, inline: true },
				{ name: client.lang.getResponse(interaction.guildLocale, "info_bot_owner"), value: `@${ownerUsername}\n${config.ownerId}`, inline: true },
				{ name: client.lang.getResponse(interaction.guildLocale, "info_important_links"), value: `
[${client.lang.getResponse(interaction.guildLocale, "info_advertise")}](${config.invite_link})
				`, inline: true },
				{ name: client.lang.getResponse(interaction.guildLocale, "info_uptime"), value: timeToString(process.uptime()*1000) },
				{ name: client.lang.getResponse(interaction.guildLocale, "info_build_date"), value: client.version.build_date ? new Date(client.version.build_date).toLocaleString(interaction.guildLocale || "en-US") : client.lang.getResponse(interaction.guildLocale, "info_not_deployed")}
			)
			.setFooter({ text: client.lang.getResponse(interaction.guildLocale, "info_footer") });
		await interaction.followUp({
			embeds: [labelEmbed, infoEmbed]
		});
		return true;
	}
}