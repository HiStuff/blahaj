import {
	ChatInputCommandInteraction,
	EmbedBuilder,
	InteractionContextType,
	PermissionFlagsBits,
	SlashCommandBuilder,
} from "discord.js";
import { createErrorEmbed, Error } from "../../utils/error.js";
import { CommandCategories } from "../../types.js";
import { database, lang } from "../../fembot.js";

export default {
	data: new SlashCommandBuilder()
		.setName("tickettheme")
		.setNameLocalizations(lang.getNameLocalizations("tickettheme"))
		.setDescription("Manage ticket themes.")
		.setDescriptionLocalizations(lang.getDescriptionLocalizations("tickettheme"))
		.addSubcommand((input) =>
			input
				.setName("create")
				.setNameLocalizations(lang.getNameLocalizations("tickettheme_create"))
				.setDescription("Create a new ticket theme.")
				.setDescriptionLocalizations(lang.getDescriptionLocalizations("tickettheme_create"))
				.addStringOption((input) =>
					input
						.setName("channelname")
						.setNameLocalizations(lang.getNameLocalizations("tickettheme_create_channelname"))
						.setDescription("Channel name. (ex. ticket-help)")
						.setDescriptionLocalizations(lang.getDescriptionLocalizations("tickettheme_create_channelname"))
						.setRequired(true),
				)
				.addStringOption((input) =>
					input
						.setName("url")
						.setNameLocalizations(lang.getNameLocalizations("tickettheme_create_url"))
						.setDescription("URL address bar. (from discohook.app)")
						.setDescriptionLocalizations(lang.getDescriptionLocalizations("tickettheme_create_url"))
						.setRequired(true),
				)
				.addStringOption((input) =>
					input
						.setName("selectorname")
						.setNameLocalizations(lang.getNameLocalizations("tickettheme_create_selectorname"))
						.setDescription("Name in selector. (ex. Help)")
						.setDescriptionLocalizations(lang.getDescriptionLocalizations("tickettheme_create_selectorname")),
				)
				.addStringOption((input) =>
					input
						.setName("selectoremote")
						.setNameLocalizations(lang.getNameLocalizations("tickettheme_create_selectoremote"))
						.setDescription("Name in selector. (ex. 😶)")
						.setDescriptionLocalizations(lang.getDescriptionLocalizations("tickettheme_create_selectoremote")),
				),
		)
		.addSubcommand((input) =>
			input
				.setName("delete")
				.setNameLocalizations(lang.getNameLocalizations("tickettheme_delete"))
				.setDescription("Delete a ticket theme.")
				.setDescriptionLocalizations(lang.getDescriptionLocalizations("tickettheme_delete"))
				.addStringOption((input) =>
					input
						.setName("themeid")
						.setNameLocalizations(lang.getNameLocalizations("tickettheme_delete_themeid"))
						.setDescription("Theme ID.")
						.setDescriptionLocalizations(lang.getDescriptionLocalizations("tickettheme_delete_themeid"))
						.setRequired(true),
				),
		)
		.addSubcommand((input) =>
			input
				.setName("list")
				.setNameLocalizations(lang.getNameLocalizations("tickettheme_list"))
				.setDescription("List all ticket themes.")
				.setDescriptionLocalizations(lang.getDescriptionLocalizations("tickettheme_list")),
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
