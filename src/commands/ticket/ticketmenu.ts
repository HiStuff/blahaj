import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, ChatInputCommandInteraction, ContextMenuCommandBuilder, EmbedBuilder, InteractionContextType, MessageFlags, PermissionFlagsBits, SlashCommandBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from "discord.js";
import { createErrorEmbed, Error } from "../../utils/error.js";
import { CommandCategories } from "../../types.js";
import { client, database } from "../../fembot.js";

function getEmbedTitle(interaction: ChatInputCommandInteraction) {
	if (interaction.options.getSubcommand(true) == "custom") { return interaction.options.getString("embedtitle", true) } else { return `✉️ ${client.lang.getOther(interaction.guildLocale, "open_ticket_embed_title")}` }
}

function getEmbedDescription(interaction: ChatInputCommandInteraction) {
	if (interaction.options.getSubcommand(true) == "custom") { return interaction.options.getString("embeddescription", true) } else { return client.lang.getOther(interaction.guildLocale, "open_ticket_embed_description") }
}

function getButtonId(interaction: ChatInputCommandInteraction) {
	if (interaction.options.getSubcommand(true) == "custom") { return "cmt-" + interaction.options.getString("themeid", true) } else { return "createticketmenu" }
}

export default {
	data: new SlashCommandBuilder()
		.setName('ticketmenu')
		.setNameLocalizations(client.lang.getNameLocalizations("ticketmenu"))
		.setDescription('Sends ticket menu.')
		.setDescriptionLocalizations(client.lang.getDescriptionLocalizations("ticketmenu"))
		.addSubcommand(input =>
			input
				.setName("custom")
				.setNameLocalizations(client.lang.getNameLocalizations("ticketmenu_custom"))
				.setDescription("Custom menu.")
				.setDescriptionLocalizations(client.lang.getDescriptionLocalizations("ticketmenu_custom"))
				.addStringOption(input =>
					input
						.setName("embedtitle")
						.setNameLocalizations(client.lang.getNameLocalizations("ticketmenu_custom_embedtitle"))
						.setRequired(true)
						.setDescription("Embed title.")
						.setDescriptionLocalizations(client.lang.getDescriptionLocalizations("ticketmenu_custom_embedtitle"))
						.setMaxLength(100)
				).addStringOption(input =>
					input
						.setName("embeddescription")
						.setNameLocalizations(client.lang.getNameLocalizations("ticketmenu_custom_embeddescription"))
						.setRequired(true)
						.setDescription("embeddescription")
						.setDescriptionLocalizations(client.lang.getDescriptionLocalizations("ticketmenu_custom_embeddescription"))
						.setMaxLength(500)
				).addStringOption(input =>
					input
						.setName("themeid")
						.setNameLocalizations(client.lang.getNameLocalizations("ticketmenu_custom_themeid"))
						.setRequired(true)
						.setDescription("Theme ID.")
						.setDescriptionLocalizations(client.lang.getDescriptionLocalizations("ticketmenu_custom_themeid"))
						.setMaxLength(100)
				)
		).addSubcommand(input =>
			input
				.setName("selector")
				.setNameLocalizations(client.lang.getNameLocalizations("ticketmenu_selector"))
				.setDescription("Selector menu.")
				.setDescriptionLocalizations(client.lang.getDescriptionLocalizations("ticketmenu_selector"))
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
				.setLabel(client.lang.getOther(interaction.guildLocale, "open_ticket_button_text"))
				.setEmoji("✉️")
				.setStyle(ButtonStyle.Secondary)
		)
		if (interaction.channel?.isSendable()) {
			await interaction.channel.send({ embeds: [embed], components: [actionRow] });
			await interaction.followUp(client.lang.getResponse(interaction.locale, "ticketmenu_sent"))
		} else {
			await interaction.followUp(client.lang.getResponse(interaction.locale, "ticketmenu_cant_send"));
		}
		
		return true;
	},
};