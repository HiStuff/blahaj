import { ActionRowBuilder, ChatInputCommandInteraction, EmbedBuilder, GuildMember, InteractionContextType, ModalBuilder, PermissionFlagsBits, SlashCommandBuilder, SlashCommandUserOption, TextInputBuilder, TextInputStyle } from "discord.js";
import { createCompletionModal } from "../../utils/modal.js";
import { Error, createErrorEmbed } from "../../utils/error.js";
import { validateReason } from "../../utils/validators.js";
import { CommandCategories, CommandFlags } from "../../types.js";

export default {
	data: new SlashCommandBuilder()
		.setName('kick')
		.setDescription('Wyrzuca z serwera!')
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
        .setContexts(InteractionContextType.Guild)
        .addUserOption(option =>
            option
                .setName("user")
                .setDescription("Użytkownik do wyrzucenia.")
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName("reason")
                .setDescription("Powód wyrzucenia.")
        ),
    category: CommandCategories.Moderation,
    requiredPermission: PermissionFlagsBits.KickMembers,
    flags: [CommandFlags.Disabled],
	async execute(interaction: ChatInputCommandInteraction) {
        let reason = interaction.options.get("reason")?.value?.toString();
        let submitted = null;
        if (!reason) {
            submitted = await createCompletionModal(interaction, [reason], new ActionRowBuilder<TextInputBuilder>().addComponents(
                new TextInputBuilder()  
                    .setCustomId("reason")
                    .setLabel("Powód")
                    .setStyle(TextInputStyle.Short)
                    .setMaxLength(1500)
                    .setRequired(false)
            ));
            if (!submitted) { await interaction.followUp({ embeds: [ createErrorEmbed(Error.ERROR_WHILE_COLLECTING) ] }); return null; }
            reason = reason || submitted.fields.getTextInputValue("reason");
        } else {
            await interaction.deferReply();
        }
        let response = submitted || interaction;
        const member = interaction.options.get("user")?.member;
        if (!member) {
            await response.followUp({ embeds: [ createErrorEmbed(Error.USER_IS_NULL) ] });
            return;
        }
        reason = validateReason(reason);
        const guildMember = member as GuildMember;
        if (guildMember.kickable) {
            const embed = new EmbedBuilder()
                .setTitle("Zostałeś wyrzucony!")
                .setColor(0xFF0000)
                .setTimestamp(new Date())
                .setDescription(`
Przez: ${interaction.user}
Powód: ${reason}`);
            try {
                await guildMember.send({ embeds: [embed] });
            } catch (err) {}
            await guildMember.kick(reason);
            await response.followUp(`Wyrzucono ${guildMember.user} za \`${reason}\`.`);
        } else {
            await response.followUp({ embeds: [ createErrorEmbed(Error.USER_NOT_KICKABLE) ] });
        }
	}
};