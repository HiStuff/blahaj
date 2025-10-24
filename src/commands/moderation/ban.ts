import {
	ActionRowBuilder,
	ChatInputCommandInteraction,
	EmbedBuilder,
	GuildMember,
	InteractionContextType,
	PermissionFlagsBits,
	SlashCommandBuilder,
	TextInputBuilder,
	TextInputStyle,
} from "discord.js";
import { createCompletionModal } from "../../utils/modal.js";
import { createErrorEmbed, Error } from "../../utils/error.js";
import { validateReason } from "../../utils/validators.js";
import { CommandFlags } from "../../types.js";

export default {
	data: new SlashCommandBuilder()
		.setName("ban")
		.setDescription("Bans!")
		.setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
		.setContexts(InteractionContextType.Guild)
		.addUserOption((option) =>
			option
				.setName("user")
				.setDescription("Użytkownik do zbanowania.")
				.setRequired(true),
		)
		.addStringOption((option) =>
			option.setName("reason").setDescription("Powód bana."),
		),
	requiredPermission: PermissionFlagsBits.BanMembers,
	flags: [CommandFlags.Disabled],
	async execute(interaction: ChatInputCommandInteraction) {
		let reason = interaction.options.getString("reason");
		let submitted = null;
		if (!reason) {
			submitted = await createCompletionModal(
				interaction,
				[reason],
				new ActionRowBuilder<TextInputBuilder>().addComponents(
					new TextInputBuilder()
						.setCustomId("reason")
						.setLabel("Powód")
						.setStyle(TextInputStyle.Short)
						.setMaxLength(1500)
						.setRequired(false),
				),
			);
			if (!submitted) {
				await interaction.followUp({
					embeds: [createErrorEmbed(Error.ERROR_WHILE_COLLECTING)],
				});
				return null;
			}
			reason = reason || submitted.fields.getTextInputValue("reason");
		} else {
			await interaction.deferReply();
		}
		const response = submitted || interaction;
		const member = interaction.options.get("user")?.member;
		if (!member) {
			await interaction.followUp({
				embeds: [createErrorEmbed(Error.USER_IS_NULL)],
			});
			return;
		}
		// validate arguments
		reason = validateReason(reason);
		const guildMember = member as GuildMember;
		if (guildMember.bannable) {
			const embed = new EmbedBuilder()
				.setTitle("Zostałeś zbanowany!")
				.setColor(0xff0000)
				.setTimestamp(new Date()).setDescription(`
Przez: ${interaction.user}
Powód: ${reason}`);
			try {
				await guildMember.send({ embeds: [embed] });
			} catch (err) {}
			await guildMember.ban({ reason: reason });
			await response.followUp(
				`Zbanowano ${guildMember.user} za \`${reason}\`.`,
			);
		} else {
			response.followUp({
				embeds: [createErrorEmbed(Error.USER_NOT_BANNABLE)],
			});
		}
	},
};
