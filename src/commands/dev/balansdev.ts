import {
	Client,
	ChatInputCommandInteraction,
	EmbedBuilder,
	SlashCommandBuilder,
	Team,
	User,
	version,
	MessageFlags,
} from "discord.js";
import config from "../../../config.json" with { type: "json" };
import { client, database } from "../../fembot.js";
import os from "node:os";
import os_utils from "os-utils";
import { CommandCategories, CommandFlags, ICommand } from "../../types.js";

export default {
	data: new SlashCommandBuilder()
		.setName("balansdev")
		.setDescription("Dodaj lub usuń komuś pieniądze.")
		.addSubcommand((subcommand) =>
			subcommand
				.setName("zabierz")
				.setDescription("Zabiera pieniądze. (Odejmuje)")
				.addUserOption((option) =>
					option
						.setName("user")
						.setDescription(
							"Użytkownik któremu chcesz zabrać kase.",
						)
						.setRequired(true),
				)
				.addNumberOption((option) =>
					option
						.setName("amount")
						.setDescription("Ilość pieniędzy.")
						.setRequired(true),
				),
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName("dodaj")
				.setDescription("Dodaje pieniądze. (Dodaje)")
				.addUserOption((option) =>
					option
						.setName("user")
						.setDescription("Użytkownik któremu chcesz dodać kase.")
						.setRequired(true),
				)
				.addNumberOption((option) =>
					option
						.setName("amount")
						.setDescription("Ilość pieniędzy.")
						.setRequired(true),
				),
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName("sprawdz")
				.setDescription("Sprawdza stan konta.")
				.addUserOption((option) =>
					option
						.setName("user")
						.setDescription(
							"Użytkownik którego chcesz sprawdzić stan konta.",
						)
						.setRequired(false),
				),
		),
	category: CommandCategories.Developer,
	flags: [CommandFlags.DevOnly],
	async execute(interaction: ChatInputCommandInteraction) {
		await interaction.deferReply({ flags: MessageFlags.Ephemeral });
		const user =
			interaction.options.getUser("user", false) || interaction.user;
		const dbUser = await database.user.upsert({
			where: {
				id: user.id,
			},
			update: {},
			create: {
				id: user.id,
			},
		});
		switch (interaction.options.getSubcommand()) {
			case "dodaj":
				const amount1 = interaction.options.getNumber("amount", true);
				await database.user.update({
					where: {
						id: user.id,
					},
					data: {
						balance: dbUser.balance + amount1,
					},
				});
				const embed1 = new EmbedBuilder()
					.setTitle("Operacja wykonana pomyślnie.")
					.setDescription(
						`Dodano \`${amount1} waluty\` do konta użytkownika ${user}.\nStan konta użytkownika po tej operacji wynosi \`${dbUser.balance + amount1} waluty\`.`,
					)
					.setColor(0x00ff00)
					.setTimestamp(new Date());
				await interaction.followUp({ embeds: [embed1] });
				break;
			case "zabierz":
				const amount = interaction.options.getNumber("amount", true);
				await database.user.update({
					where: {
						id: user.id,
					},
					data: {
						balance: dbUser.balance - amount,
					},
				});
				const embed2 = new EmbedBuilder()
					.setTitle("Operacja wykonana pomyślnie.")
					.setDescription(
						`Zabrano \`${amount} waluty\` z konta użytkownika ${user}.\nStan konta użytkownika po tej operacji wynosi \`${dbUser.balance - amount} waluty\`.`,
					)
					.setColor(0x00ff00)
					.setTimestamp(new Date());
				await interaction.followUp({ embeds: [embed2] });
				break;
			case "sprawdz":
				const embed3 = new EmbedBuilder()
					.setTitle("Operacja wykonana pomyślnie.")
					.setDescription(
						`Stan konta użytkownika ${user} wynosi \`${dbUser.balance} waluty\`.`,
					)
					.setColor(0x00ff00)
					.setTimestamp(new Date());
				await interaction.followUp({ embeds: [embed3] });
				break;
		}
	},
};
