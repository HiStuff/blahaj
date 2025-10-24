import {
	Client,
	ChatInputCommandInteraction,
	EmbedBuilder,
	SlashCommandBuilder,
	ApplicationIntegrationType,
	InteractionContextType,
	ColorResolvable,
	time,
	TimestampStyles,
	PermissionFlagsBits,
	Embed,
	ChannelType,
	GuildTextBasedChannel,
	MessageFlags,
	BaseChannel,
	Channel,
} from "discord.js";
import config from "../../../config.json" with { type: "json" };
import { client } from "../../fembot.js";
import { CommandCategories, CommandFlags, ICommand } from "../../types.js";
import { getAverageColor } from "fast-average-color-node";

export default {
	data: new SlashCommandBuilder()
		.setName("wyslij")
		.setDescription("Wyślij wiadomość botem.")
		.addStringOption((option) =>
			option.setName("tekst").setDescription("Tekst").setRequired(true),
		)
		.addStringOption((option) =>
			option.setName("kanal").setDescription("Kanał (ID)"),
		),
	category: CommandCategories.Utilities,
	flags: [CommandFlags.DevOnly],
	async execute(interaction: ChatInputCommandInteraction) {
		await interaction.deferReply({ flags: MessageFlags.Ephemeral });
		let channel = interaction.channel as Channel | null;
		const channelId = interaction.options.getString("kanal");
		if (channelId)
			channel = await interaction.client.channels.fetch(channelId);
		if (channel && channel.isSendable()) {
			await channel.send(interaction.options.getString("tekst", true));
			await interaction.followUp({
				content: "`✅ Wysłano.`",
				flags: MessageFlags.Ephemeral,
			});
		} else {
			await interaction.followUp({
				content: "`❌ Kanał nie istnieje lub nie da się na nim pisać.`",
				flags: MessageFlags.Ephemeral,
			});
		}
		return true;
	},
};
