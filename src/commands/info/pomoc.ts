import {
	Client,
	ChatInputCommandInteraction,
	EmbedBuilder,
	SlashCommandBuilder,
} from "discord.js";
import config from "../../../config.json" with { type: "json" };
import { client } from "../../fembot.js";
import { CommandCategories } from "../../types.js";

export default {
	data: new SlashCommandBuilder()
		.setName("pomoc")
		.setDescription("Pomocy!!!"),
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
					(description += `\n/${command.data.name}\n- ${command.data.description}\n`),
			);
			if (commands.size <= 0) description += "Ta kategoria jest pusta.";
			description += "```\n";
		});
		const embed = new EmbedBuilder()
			.setTitle("Pomoc")
			.setDescription(description)
			.setColor(0x00bbff)
			.setTimestamp(new Date());
		await interaction.followUp({ embeds: [embed] });
		return true;
	},
};
