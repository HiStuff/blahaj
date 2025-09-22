import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, ChatInputCommandInteraction, ContextMenuCommandBuilder, EmbedBuilder, InteractionContextType, MessageFlags, PermissionFlagsBits, SlashCommandBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from "discord.js";
import { createErrorEmbed, Error } from "../../utils/error.js";
import { CommandCategories } from "../../types.js";
import { client, database } from "../../fembot.js";

export default {
	data: new SlashCommandBuilder()
		.setName('ticket')
		.setDescription('Zarządzaj ticketami.')
        .addSubcommand(input =>
            input
                .setName("ustawkategorie")
                .setDescription("Ustaw kategorie w której mają pojawiać się tickety.")
                .addChannelOption(input =>
                    input
                        .setName("kategoria")
                        .setDescription("Kategoria w której mają pojawiać się tickety.")
                        .addChannelTypes(ChannelType.GuildCategory)
                        .setRequired(true)
                )
        )
        .addSubcommand(input =>
            input
                .setName("pomoc")
                .setDescription("Pomoc jak ustawić funkcję ticketów.")
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
            case "ustawkategorie": {
                await database.guild.update({
                    where: { id: interaction.guildId },
                    data: { ticketCategoryId: interaction.options.getChannel("kategoria", true).id }
                });
                await interaction.followUp(`\`✅ Ustawiono kategorie na ${interaction.options.getChannel("kategoria", true).name}.\``);
                break;
            }
            case "pomoc": {
                await interaction.followUp(`
# Jak ustawić tickety?
- Ustaw kategorię komendą /ticket ustawkategorie
- Dodaj motyw komendą /motywticketa stworz
- Wyślij menu ticketów komendą /menuticketow normalne/custom
                `);
                break;
            }
        }
		return true;
	},
};