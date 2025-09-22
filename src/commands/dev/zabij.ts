import { Client, ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder, ApplicationIntegrationType, InteractionContextType, ColorResolvable, time, TimestampStyles, PermissionFlagsBits, Embed, ChannelType, GuildTextBasedChannel, MessageFlags, BaseChannel, Channel } from "discord.js";
import config from "../../../config.json" with { type: "json" };
import { client } from "../../fembot.js";
import { CommandCategories, CommandFlags, ICommand } from "../../types.js";
import { getAverageColor } from "fast-average-color-node";

export default {
	data: new SlashCommandBuilder()
		.setName('zabij')
		.setDescription('Zabija proces bota.'),
	category: CommandCategories.Developer,
	flags: [CommandFlags.DevOnly],
	async execute(interaction: ChatInputCommandInteraction) {
		interaction.deferReply();
		interaction.followUp("Zabijanie...");
		process.exit();
	}
}