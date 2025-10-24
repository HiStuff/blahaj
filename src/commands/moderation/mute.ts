import {
	ActionRowBuilder,
	ChatInputCommandInteraction,
	DiscordAPIError,
	EmbedBuilder,
	GuildMember,
	InteractionContextType,
	ModalBuilder,
	PermissionFlagsBits,
	SlashCommandBuilder,
	SlashCommandUserOption,
	TextInputBuilder,
	TextInputStyle,
} from "discord.js";
import { Error, createErrorEmbed } from "../../utils/error.js";
import {
	getPenaltyDurationTimeString,
	getPenaltyTimeLeftString,
} from "../../utils/number.js";
import { CommandCategories, CommandFlags } from "../../types.js";

const muteModal = new ModalBuilder()
	.setTitle("Mute")
	.setCustomId("mute")
	.addComponents(
		new ActionRowBuilder<TextInputBuilder>().addComponents(
			new TextInputBuilder()
				.setCustomId("reason")
				.setLabel("Powód")
				.setStyle(TextInputStyle.Short)
				.setMaxLength(1500)
				.setRequired(false),
		),
	)
	.addComponents(
		new ActionRowBuilder<TextInputBuilder>().addComponents(
			new TextInputBuilder()
				.setCustomId("time")
				.setLabel("Czas (W minutach)")
				.setStyle(TextInputStyle.Short)
				.setMaxLength(60),
		),
	);

export default {
	data: new SlashCommandBuilder()
		.setName("mute")
		.setDescription("Wycisza kogoś na ustalony czas!")
		.setDefaultMemberPermissions(PermissionFlagsBits.MuteMembers)
		.setContexts(InteractionContextType.Guild)
		.addUserOption((option) =>
			option
				.setName("user")
				.setDescription("Użytkownik do zbanowania.")
				.setRequired(true),
		)
		.addStringOption((option) =>
			option.setName("reason").setDescription("Powód mute."),
		)
		.addStringOption((option) =>
			option.setName("time").setDescription("Czas mute."),
		),
	category: CommandCategories.Moderation,
	requiredPermission: PermissionFlagsBits.ModerateMembers,
	flags: [CommandFlags.Disabled],
	async execute(interaction: ChatInputCommandInteraction) {
		let reason = interaction.options.get("reason")?.value?.toString();
		let timeString = interaction.options.get("time")?.value?.toString();
		let submitted = null;
		if (!reason && !timeString) {
			await interaction.showModal(muteModal);
			submitted = await interaction
				.awaitModalSubmit({
					time: 30000,
					filter: (i) => i.user.id === interaction.user.id,
				})
				.catch(async (error) => {
					await interaction.followUp({
						embeds: [
							createErrorEmbed(Error.ERROR_WHILE_COLLECTING),
						],
					});
					return null;
				});
			if (!submitted) {
				return;
			}
			await submitted.deferReply();
			reason = submitted?.fields.getField("reason").value;
			timeString = submitted?.fields.getField("time").value;
		} else {
			await interaction.deferReply();
		}
		let response = submitted || interaction;
		const member = interaction.options.get("user")?.member;
		let time = null;
		if (Number(timeString)) {
			time = Number(timeString) * 60 * 1000;
		}
		if (!member) {
			await interaction.followUp({
				embeds: [createErrorEmbed(Error.USER_IS_NULL)],
			});
			return;
		}
		if (!reason) reason = "Nie podano powodu.";
		const guildMember = member as GuildMember;
		if (guildMember.moderatable) {
			const embed = new EmbedBuilder()
				.setTitle("Zostałeś zmutowany!")
				.setColor(0xff0000)
				.setTimestamp(new Date()).setDescription(`
Przez: ${interaction.user}
Powód: ${reason}
Czas: ${getPenaltyDurationTimeString(time)}
Mija ${getPenaltyTimeLeftString(time)}
            `);
			try {
				await guildMember.send({ embeds: [embed] });
			} catch (err) {}
			await guildMember.timeout(time, reason);
			await response.followUp(
				`Wyciszono ${guildMember.user} za \`${reason}\` na \`${getPenaltyDurationTimeString(time)}\`.`,
			);
		} else {
			await response.followUp({
				embeds: [createErrorEmbed(Error.USER_NOT_MUTABLE)],
			});
		}
	},
};
