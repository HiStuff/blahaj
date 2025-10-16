import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, ChatInputCommandInteraction, ContextMenuCommandBuilder, EmbedBuilder, InteractionContextType, MessageFlags, PermissionFlagsBits, SlashCommandBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from "discord.js";
import { createErrorEmbed, Error } from "../../utils/error.js";
import { CommandCategories } from "../../types.js";
import { client, database } from "../../fembot.js";

export default {
	data: new SlashCommandBuilder()
		.setName('ticket')
        .setNameLocalizations(client.lang.getNameLocalizations("ticket"))
		.setDescription('Manage tickets.')
        .setDescriptionLocalizations(client.lang.getDescriptionLocalizations("ticket"))
        .addSubcommand(input =>
            input
                .setName("setcategory")
                .setNameLocalizations(client.lang.getNameLocalizations("ticket_setcategory"))
                .setDescription("Set category in which tickets will spawn in.")
                .setDescriptionLocalizations(client.lang.getDescriptionLocalizations("ticket_setcategory"))
                .addChannelOption(input =>
                    input
                        .setName("category")
                        .setNameLocalizations(client.lang.getNameLocalizations("ticket_category"))
                        .setDescription("Category in which tickets will spawn in.")
                        .setDescriptionLocalizations(client.lang.getDescriptionLocalizations("ticket_category"))
                        .addChannelTypes(ChannelType.GuildCategory)
                        .setRequired(true)
                )
        )
        .addSubcommand(input =>
            input
                .setName("help")
                .setNameLocalizations(client.lang.getNameLocalizations("ticket_help"))
                .setDescription("Ticket setup guide.")
                .setDescriptionLocalizations(client.lang.getDescriptionLocalizations("ticket_help"))
        )
		.setContexts(InteractionContextType.Guild)
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
	category: CommandCategories.Ticket,
	requiredPermission: PermissionFlagsBits.ManageGuild,
	flags: [],
	async execute(interaction: ChatInputCommandInteraction): Promise<boolean> {
		if (!interaction.guildId) return false;
		await interaction.deferReply();
        switch (interaction.options.getSubcommand(true)) {
            case "setcategory": {
                await database.guild.update({
                    where: { id: interaction.guildId },
                    data: { ticketCategoryId: interaction.options.getChannel("category", true).id }
                });
                await interaction.followUp(client.lang.getResponse(interaction.locale, "ticket_setcategory_set", interaction.options.getChannel("category", true).name || "???"));
                break;
            }
            case "help": {
                await interaction.followUp(client.lang.getResponse(interaction.locale, "ticket_help"));
                break;
            }
        }
		return true;
	},
};