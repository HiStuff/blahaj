import {
	ChatInputCommandInteraction,
	EmbedBuilder,
	SlashCommandBuilder,
	InteractionContextType,
	ColorResolvable,
	time,
	TimestampStyles,
} from "discord.js";
import { CommandCategories } from "../../types.js";
import { getAverageColor } from "fast-average-color-node";

export default {
	data: new SlashCommandBuilder()
		.setName("serverinfo")
		.setDescription("Informacje o serwerze.")
		.setContexts(InteractionContextType.Guild),
	category: CommandCategories.Info,
	flags: [],
	async execute(interaction: ChatInputCommandInteraction) {
		await interaction.deferReply();
		if (!interaction.guild) return;
		let color = null;
		const botsCount = (await interaction.guild.members.fetch()).filter(
			(member) => member.user.bot == true,
		).size;
		if (interaction.guild.iconURL()) {
			color = (await getAverageColor(interaction.guild.iconURL() || ""))
				.hex;
		}
		const embed = new EmbedBuilder()
			.setAuthor({
				name: interaction.guild.name || "",
				iconURL: interaction.guild?.iconURL() || undefined,
			})
			.setThumbnail(interaction.guild.iconURL())
			.setImage(interaction.guild.bannerURL())
			.addFields(
				{
					name: "👑 Właściciel",
					value:
						"<@" + (await interaction.guild.fetchOwner()).id + ">",
				},
				{
					name: "🕐 Data założenia",
					value: `${time(interaction.guild.createdAt)} (${time(interaction.guild.createdAt, TimestampStyles.RelativeTime)})`,
				},
				{
					name: "👥 Członkowie",
					value: `
👤 Ogólnie: **${interaction.guild.memberCount}**
🤖 Boty: **${botsCount}**
🧑🏿‍🦲 Ludzie: **${interaction.guild.memberCount - botsCount}**
                `,
					inline: true,
				},
				{
					name: "🆔 ID serwera",
					value: interaction.guild.id,
					inline: true,
				},
			)
			.setColor(color as ColorResolvable)
			.setTimestamp(new Date());
		await interaction.followUp({ embeds: [embed] });
		return true;
	},
};
