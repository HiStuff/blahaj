import {
	ActionRowBuilder,
	ButtonInteraction,
	ChannelType,
	ComponentType,
	Message,
	MessageFlags,
	StringSelectMenuBuilder,
	StringSelectMenuOptionBuilder,
} from "discord.js";
import { FembotClient } from "../types.js";
import { getTicketFromChannel, Ticket } from "../features/ticket/ticket.js";
import { database } from "../fembot.js";
import { Questions } from "../features/ticket/questions.js";

export default {
	customId: "createticketmenu",
	async clicked(client: FembotClient, interaction: ButtonInteraction) {
		await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });
		if (!interaction.guildId) return;
		let selectionmenu = new StringSelectMenuBuilder()
			.setPlaceholder(
				client.lang.getOther(
					interaction.locale,
					"ticket_theme_selector_title",
				),
			)
			.setCustomId("createticket");
		let themes = await database.ticketTheme.findMany({
			where: {
				guildId: interaction.guildId,
			},
		});
		themes.forEach((theme) => {
			if (theme.selectionOptionIcon && theme.selectionOptionName) {
				let selectionoption = new StringSelectMenuOptionBuilder()
					.setLabel(theme.selectionOptionName)
					.setEmoji(theme.selectionOptionIcon)
					.setValue(theme.id);
				selectionmenu.addOptions(selectionoption);
			}
		});
		if (selectionmenu.options.length == 0) {
			let selectionoption = new StringSelectMenuOptionBuilder()
				.setLabel(
					client.lang.getOther(
						interaction.locale,
						"ticket_theme_selector_nothemes",
					),
				)
				.setEmoji("😶")
				.setValue("nothemes");
			selectionmenu.addOptions(selectionoption);
		}
		const res = await interaction.followUp({
			content: client.lang.getOther(
				interaction.locale,
				"ticket_theme_selector_text",
			),
			components: [
				new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
					selectionmenu,
				),
			],
			withResponse: true,
		});
		const collector = res.createMessageComponentCollector({
			componentType: ComponentType.StringSelect,
			time: 60_000,
		});
		collector.on("collect", async (i) => {
			if (
				!interaction.guild ||
				!interaction.channel ||
				!interaction.user ||
				interaction.channel.type != ChannelType.GuildText
			)
				return false;
			let ticket = new Ticket(
				client,
				interaction.guild,
				undefined,
				interaction.user,
				i.values[0],
			);
			await ticket.init(interaction.guild.id);
			const questions = new Questions(i, i.values[0]);
			if (!await questions.ask()) return false;
			try {
				await ticket.createTicket(client, questions.answers);
			} catch (err) {
				if (err instanceof Error) {
					await i.followUp(err.message);
				}
			}
			if (ticket.channel) {
				await i.followUp(`<#${ticket.channel?.id}>`);
			}
		});
	},
};
