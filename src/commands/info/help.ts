import {
	Client,
	ChatInputCommandInteraction,
	EmbedBuilder,
	SlashCommandBuilder,
} from "discord.js";
import config from "../../../config.json" with { type: "json" };
import { client, lang } from "../../fembot.js";
import { CommandCategories } from "../../types.js";

export default {
	data: new SlashCommandBuilder()
		.setName("help")
		.setNameLocalizations(lang.getNameLocalizations("help"))
		.setDescription("Help!!!")
		.setDescriptionLocalizations(lang.getDescriptionLocalizations("help")),
	category: CommandCategories.Info,
	flags: [],
	async execute(interaction: ChatInputCommandInteraction) {
		await interaction.deferReply();
		let description = ``;
		const categories = Object.values(CommandCategories);
		categories.forEach((category) => {
			const commands = client.commands.filter(
				(command) => command.category == category,
			);
			description += `**${category}**\`\`\``;
			commands.forEach(
				(command) =>
					(description += `\n/${
						lang.getNameLocalizations(command.data.name)[interaction.guildLocale || "en-US"] || command.data.name
					}\n- ${
						lang.getDescriptionLocalizations(command.data.name)[interaction.guildLocale || "en-US"] || command.data.description
					}\n`),
			);
			if (commands.size <= 0) description += lang.getResponse(interaction.guildLocale, "help_category_is_empty");
			description += "```\n";
		});
		const embed = new EmbedBuilder()
			.setTitle(lang.getResponse(interaction.guildLocale, "help_embed_title"))
			.setDescription(description)
			.setColor(0x00bbff)
			.setTimestamp(new Date());
		await interaction.followUp({ embeds: [embed] });
		return true;
	},
};
