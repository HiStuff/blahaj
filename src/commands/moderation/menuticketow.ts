import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, ChatInputCommandInteraction, ContextMenuCommandBuilder, EmbedBuilder, InteractionContextType, MessageFlags, PermissionFlagsBits, SlashCommandBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from "discord.js";
import { createErrorEmbed, Error } from "../../utils/error.js";
import { CommandCategories } from "../../types.js";
import { client, database } from "../../fembot.js";

function getEmbedTitle(interaction: ChatInputCommandInteraction) {
	if (interaction.options.getSubcommand(true) == "custom") { return interaction.options.getString("tytulembeda", true) } else { return "✉️ Stwórz ticketa." }
}

function getEmbedDescription(interaction: ChatInputCommandInteraction) {
	if (interaction.options.getSubcommand(true) == "custom") { return interaction.options.getString("opisembeda", true) } else { return "Kliknij przycisk poniżej aby otworzyć ticketa." }
}

function getButtonId(interaction: ChatInputCommandInteraction) {
	if (interaction.options.getSubcommand(true) == "custom") { return "cmt-" + interaction.options.getString("idmotywu", true) } else { return "createticketmenu" }
}

export default {
	data: new SlashCommandBuilder()
		.setName('menuticketow')
		.setDescription('Wysyła menu ticketa.')
		.addSubcommand(input =>
			input
				.setName("custom")
				.setDescription("Customowe menu.")
				.addStringOption(input =>
					input
						.setName("tytulembeda")
						.setRequired(true)
						.setDescription("Tytuł embeda.")
						.setMaxLength(100)
				).addStringOption(input =>
					input
						.setName("opisembeda")
						.setRequired(true)
						.setDescription("Opis embeda.")
						.setMaxLength(500)
				).addStringOption(input =>
					input
						.setName("idmotywu")
						.setRequired(true)
						.setDescription("ID motywu.")
						.setMaxLength(100)
				)
		).addSubcommand(input =>
			input
				.setName("normalne")
				.setDescription("Normalne menu.")
		)
		.setContexts(InteractionContextType.Guild)
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
	category: CommandCategories.Ticket,
	requiredPermission: PermissionFlagsBits.ManageGuild,
	flags: [],
	async execute(interaction: ChatInputCommandInteraction): Promise<boolean> {
		if (!interaction.guildId) return false;
		await interaction.deferReply({ flags: MessageFlags.Ephemeral });
		let embed = new EmbedBuilder()
			.setColor(0xFFFFFF)
			.setTitle(getEmbedTitle(interaction))
			.setDescription(getEmbedDescription(interaction))
			.setTimestamp(interaction.createdTimestamp)
		let actionRow: ActionRowBuilder<ButtonBuilder> = new ActionRowBuilder<ButtonBuilder>()
			.addComponents(new ButtonBuilder()
				.setCustomId(getButtonId(interaction))
				.setLabel("Stwórz ticket!")
				.setEmoji("✉️")
				.setStyle(ButtonStyle.Secondary)
		)
		if (interaction.channel?.isSendable()) {
			await interaction.channel.send({ embeds: [embed], components: [actionRow] });
			await interaction.followUp("`✅ Wysłano`")
		} else {
			await interaction.followUp("`⚠️ Nie udało się wysłać menu ticketów. (Powód: Na kanał nie da się wysyłać wiadomości.)`");
		}
		
		return true;
	},
};