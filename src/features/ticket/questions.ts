import {
	ActionRowBuilder,
	ButtonInteraction,
	CacheType,
	ChatInputCommandInteraction,
	Interaction,
	ModalBuilder,
	ModalSubmitInteraction,
	StringSelectMenuInteraction,
	TextInputBuilder,
	TextInputStyle,
} from "discord.js";
import { database } from "../../fembot.js";
import { randomUUID } from "node:crypto";
import { TicketQuestion } from "../../../prisma/client/index.js";

export type Answer = {
	name: string;
	answer: string;
};

export class Questions {
	interaction:
		| ChatInputCommandInteraction
		| ButtonInteraction
		| StringSelectMenuInteraction<CacheType>;
	themeId: string;
	answers: Answer[] = [];
	constructor(
		interaction:
			| ChatInputCommandInteraction
			| ButtonInteraction
			| StringSelectMenuInteraction<CacheType>,
		themeId: string,
	) {
		this.interaction = interaction;
		this.themeId = themeId;
	}
	async ask(): Promise<boolean> {
		const modal = new ModalBuilder()
			.setTitle("Pytania/Questions")
			.setCustomId("questionsModal");
		const questions: TicketQuestion[] =
			await database.ticketQuestion.findMany({
				where: {
					themeId: this.themeId,
				},
			});
		if (questions.length < 1) {
			return false;
		}
		questions.forEach((question) => {
			const modalInput = new TextInputBuilder()
				.setLabel(question.question)
				.setCustomId(question.id.toString())
				.setStyle(question.style);
			modal.addComponents(
				new ActionRowBuilder<TextInputBuilder>().addComponents(
					modalInput,
				),
			);
		});
		await this.interaction.showModal(modal);
		try {
			const result = await this.interaction.awaitModalSubmit({
				time: 300_000,
				filter: (i) => {
					i.deferUpdate();
					return i.user.id == this.interaction.user.id;
				},
			});
			let answers: Answer[] = [];
			result.fields.fields.forEach((field) => {
				answers.push({
					name:
						questions.find(
							(question) =>
								question.id.toString() === field.customId,
						)?.question || "* BRAK NAZWY *",
					answer: field.value,
				});
			});
			this.answers = answers;
			return true;
		} catch (err) {
			throw err;
		}
	}
}
