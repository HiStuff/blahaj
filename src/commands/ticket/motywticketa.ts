import {
	ChatInputCommandInteraction,
	EmbedBuilder,
	InteractionContextType,
	PermissionFlagsBits,
	SlashCommandBuilder,
} from "discord.js";
import { createErrorEmbed, Error } from "../../utils/error.js";
import { CommandCategories } from "../../types.js";
import { database } from "../../fembot.js";

export default {
	data: new SlashCommandBuilder()
		.setName("motywticketa")
		.setDescription("Zarządzaj motywami ticketa.")
		.addSubcommand((input) =>
			input
				.setName("stworz")
				.setDescription("Stwórz motyw ticketa.")
				.addStringOption((input) =>
					input
						.setName("nazwakanalu")
						.setDescription("Nazwa kanału. (np. ticket-pomoc)")
						.setRequired(true),
				)
				.addStringOption((input) =>
					input
						.setName("url")
						.setDescription("Pasek URL. (z discohooka)")
						.setRequired(true),
				)
				.addStringOption((input) =>
					input
						.setName("nazwawyboru")
						.setDescription("Nazwa w wyborze. (np. Pomoc)"),
				)
				.addStringOption((input) =>
					input
						.setName("emotkawyboru")
						.setDescription("Emotka w wyborze. (np. 😶)"),
				),
		)
		.addSubcommand((input) =>
			input
				.setName("usun")
				.setDescription("Usuń motyw ticketa.")
				.addStringOption((input) =>
					input
						.setName("idmotywu")
						.setDescription("ID motywu.")
						.setRequired(true),
				),
		)
		.addSubcommand((input) =>
			input
				.setName("lista")
				.setDescription("Wylistuj wszystkie motywy ticketów"),
		)
		.setContexts(InteractionContextType.Guild)
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
	category: CommandCategories.Ticket,
	requiredPermission: PermissionFlagsBits.ManageGuild,
	flags: [],
	async execute(interaction: ChatInputCommandInteraction) {
		await interaction.deferReply();
		if (!interaction.channel?.isSendable() || !interaction.guildId) return;
		if (interaction.options.getSubcommand(true) == "usun") {
			// USUN
			// USUN
			// USUN
			const res = await interaction.followUp("`⌛ Usuwanie...`");
			try {
				await database.ticketTheme.delete({
					where: {
						guildId: interaction.guildId,
						id: interaction.options.getString("idmotywu", true),
					},
				});
				res.edit("`✅ Usunięto!`");
			} catch (err: any) {
				console.log(err);
				if (err.code == "P2025") {
					res.edit("`❌ Ten motyw nie istnieje.`");
				}
			}
		} else if (interaction.options.getSubcommand(true) == "lista") {
			// LISTA
			// LISTA
			// LISTA
			let themes = await database.ticketTheme.findMany({
				where: { guildId: interaction.guildId },
			});
			let content = "";
			if (themes.length > 0) {
				themes.forEach((theme) => {
					content += `**${theme.id}**\n`;
					content += `Wybór: \`${theme.selectionOptionIcon || "⚫"} -  ${theme.selectionOptionName || "BRAK"}\`\n`;
					content += `Nazwa kanału: \`#${theme.channelName}\`\n`;
				});
			} else {
				content = "Brak.";
			}
			await interaction.followUp(content);
		} else if (interaction.options.getSubcommand(true) == "stworz") {
			// STWORZ
			// STWORZ
			// STWORZ
			let res = await interaction.followUp("`⌛ Przetwarzanie...`");
			try {
				const url = new URL(interaction.options.getString("url", true));
				const data = url.searchParams.get("data");
				if (data) {
					const json = JSON.parse(
						Buffer.from(data, "base64").toString(),
					);
					const msg = json.messages[0].data;
					if (res.channel.isSendable()) {
						const ticketTheme = await database.ticketTheme.create({
							data: {
								selectionOptionName:
									interaction.options.getString(
										"nazwawyboru",
									),
								selectionOptionIcon:
									interaction.options.getString(
										"emotkawyboru",
									),
								channelName: interaction.options.getString(
									"nazwakanalu",
									true,
								),
								guildId: interaction.guildId,
								ticketIntro: JSON.stringify(msg),
							},
						});
						await res.edit(
							`\`✅ Stworzono motyw ticketa z ID ${ticketTheme.id}, nazwą kanału #${interaction.options.getString("nazwakanalu", true)} i wyborem ${interaction.options.getString("emotkawyboru") || "⚫"} - ${interaction.options.getString("nazwawyboru") || "BRAK"}.\``,
						);
					}
				} else {
					await res.edit("`⚠️ Podał*ś nieprawidłowy adres URL.`");
				}
			} catch (err) {
				await res.edit(
					"`⚠️ Wystąpił błąd podczas przetwarzania. Upewnij się że podał*ś prawidłowy adres URL.`",
				);
			}
		}
		return true;
	},
};
