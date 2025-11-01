import {
	ActionRowBuilder,
	ButtonInteraction,
	CacheType,
	ChatInputCommandInteraction,
	CommandInteraction,
	ModalBuilder,
	ModalSubmitInteraction,
	TextInputBuilder,
} from "discord.js";
import { createErrorEmbed, Error } from "./error.js";

function getEmptyArguments(
	args: (string | undefined | null)[],
	components: ActionRowBuilder<TextInputBuilder>[],
): ActionRowBuilder<TextInputBuilder>[] {
	let result = [];
	for (let i = 0; i < args.length; i++) {
		if (!args[i] && components[i]) {
			result.push(components[i]);
		}
	}
	return result;
}

export async function createCompletionModal(
	interaction:
		| ButtonInteraction<CacheType>
		| CommandInteraction<CacheType>
		| ChatInputCommandInteraction<CacheType>,
	args: (string | undefined | null)[],
	...components: ActionRowBuilder<TextInputBuilder>[]
): Promise<ModalSubmitInteraction<CacheType> | undefined> {
	if (interaction.deferred) {
		await interaction.followUp({
			embeds: [createErrorEmbed(Error.SOMETHING_WENT_WRONG)],
		});
	}
	const modal = new ModalBuilder()
		.setTitle("Potrzebne informacje.")
		.setCustomId("infoneeded")
		.addComponents(getEmptyArguments(args, components));
	await interaction.showModal(modal);
	const submitted = await interaction
		.awaitModalSubmit({
			time: 30000,
			filter: (i) => i.user.id === interaction.user.id,
		})
		.catch(async (error) => {
			await interaction.followUp({
				embeds: [createErrorEmbed(Error.ERROR_WHILE_COLLECTING)],
			});
			return undefined;
		});
	if (!submitted) {
		return undefined;
	}
	await submitted.deferReply();
	return submitted;
}
