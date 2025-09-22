import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { createErrorEmbed, Error } from "../../utils/error.js";
import { CommandCategories } from "../../types.js";
import { client } from "../../fembot.js";

export default {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setNameLocalizations(client.lang.getNameLocalizations("ping"))
		.setDescription('Shows that the bot works!')
		.setDescriptionLocalizations(client.lang.getDescriptionLocalizations("ping")),
	category: CommandCategories.Utilities,
	flags: [],
	async execute(interaction: ChatInputCommandInteraction) {
		await interaction.deferReply();
		if (!interaction.channel?.isTextBased()) { await interaction.reply({ embeds: [createErrorEmbed(Error.COMMAND_CHANNEL_IS_TEXT)] }); return; }
		if (!interaction.channel.isSendable()) { await interaction.reply({ embeds: [createErrorEmbed(Error.CHANNEL_NOT_SENDABLE)] }); return; }
		const msg = await interaction.channel.send(client.lang.getResponse(interaction.locale, "ping_checking"));
		const latency = msg.createdTimestamp - interaction.createdTimestamp;
		await msg.delete();
		await interaction.followUp({ embeds: [
			new EmbedBuilder()
				.setTitle(client.lang.getResponseObject(interaction.locale, "ping_response").title)
				.setDescription(client.lang.getResponseObject(interaction.locale, "ping_response", latency.toString()).description)
				.setColor(0xDD2E44)
				.setTimestamp(new Date())
		]});
		return true;
	},
};