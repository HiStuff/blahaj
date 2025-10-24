import {
	ChatInputCommandInteraction,
	EmbedBuilder,
	InteractionContextType,
	MessageFlags,
	PermissionFlagsBits,
	SlashCommandBuilder,
} from "discord.js";
import { CommandFlags } from "../../types.js";
import { client, database } from "../../fembot.js";
import { Guild, User } from "../../../prisma/client/index.js";

export default {
	data: new SlashCommandBuilder()
		.setName("warn")
		.setNameLocalizations(client.lang.getNameLocalizations("warn"))
		.setDescription("It... Warns!")
		.setDescriptionLocalizations(
			client.lang.getDescriptionLocalizations("warn"),
		)
		.setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
		.setContexts(InteractionContextType.Guild)
		.addUserOption((option) =>
			option
				.setName("user")
				.setNameLocalizations(
					client.lang.getNameLocalizations("warn_user"),
				)
				.setDescription("User to warn")
				.setDescriptionLocalizations(
					client.lang.getDescriptionLocalizations("warn_user"),
				)
				.setRequired(true),
		)
		.addStringOption((option) =>
			option
				.setName("reason")
				.setNameLocalizations(
					client.lang.getNameLocalizations("warn_reason"),
				)
				.setDescription("Warn reason")
				.setDescriptionLocalizations(
					client.lang.getDescriptionLocalizations("warn_reason"),
				)
				.setRequired(true),
		),
	requiredPermission: PermissionFlagsBits.ModerateMembers,
	flags: [],
	async execute(
		interaction: ChatInputCommandInteraction,
		_: User,
		guild: Guild,
	) {
		if (!guild || !interaction.guild) return false;
		await interaction.deferReply();
		const warn = await database.warn.create({
			data: {
				authorId: interaction.user.id,
				userId: interaction.options.getUser("user", true).id,
				reason: interaction.options.getString("reason", true),
			},
		});
		if (guild.penaltyChannelId) {
			const embed = new EmbedBuilder()
				.setTitle(
					client.lang.getResponseObject(
						interaction.guildLocale,
						"warn_warned_public",
					).title,
				)
				.setDescription(
					client.lang.getResponseObject(
						interaction.guildLocale,
						"warn_warned_public",
						interaction.options.getUser("user", true).toString(),
						interaction.user.toString(),
						interaction.options.getString("reason", true),
					).description,
				)
				.setColor(0xff0000)
				.setTimestamp(new Date())
				.setFooter({
					text: `ID: ${warn.id}`,
				});
			const channel = await interaction.guild.channels.fetch(
				guild.penaltyChannelId,
			);
			if (!channel?.isSendable()) return;
			channel.send({ embeds: [embed] });
		}
		await interaction.followUp(
			client.lang.getResponse(
				interaction.guildLocale,
				"warn_warned",
				interaction.options.getUser("user", true).id,
				interaction.options.getString("reason", true),
				warn.id.toString(),
			),
		);
		return true;
	},
};
