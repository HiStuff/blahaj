import {
	ChatInputCommandInteraction,
	DefaultWebSocketManagerOptions,
	EmbedBuilder,
	SlashCommandBuilder,
} from "discord.js";
import { createErrorEmbed, Error } from "../../utils/error.js";
import { CommandCategories, ICommand } from "../../types.js";
import { chatbot, client, lang } from "../../fembot.js";
import { User } from "../../../prisma/client/default.js";

function getSystemPrompt(dbUser: User, systemPrompt: string | null) {
	if (dbUser.customSystemPromptAllowed && systemPrompt) { return systemPrompt; } else return "You are a calm and caring assistant."
}

export default {
	data: new SlashCommandBuilder()
		.setName("llm")
		.setNameLocalizations(client.lang.getNameLocalizations("llm"))
		.setDescription("Large Language Model (AI) Features.")
		.setDescriptionLocalizations(
			client.lang.getDescriptionLocalizations("llm"),
		)
        .addSubcommand(input => input
            .setName("chat")
            .setNameLocalizations(client.lang.getNameLocalizations("llm_chat"))
			.setDescription("Chat with the chatbot.")
			.setDescriptionLocalizations(client.lang.getDescriptionLocalizations("llm_chat"))
			.addStringOption(input => input
				.setName("prompt")
				.setNameLocalizations(client.lang.getNameLocalizations("llm_chat_prompt"))
				.setDescription("User prompt.")
				.setDescriptionLocalizations(client.lang.getDescriptionLocalizations("llm_chat_prompt"))
				.setRequired(true)
			)
			.addStringOption(input => input
				.setName("systemprompt")
				.setNameLocalizations(client.lang.getNameLocalizations("llm_chat_systemprompt"))
				.setDescription("System prompt for the chatbot.")
				.setDescriptionLocalizations(client.lang.getDescriptionLocalizations("llm_chat_systemprompt"))
			)
        )
		.addSubcommand(input => input
            .setName("clearhistory")
            .setNameLocalizations(client.lang.getNameLocalizations("llm_clearhistory"))
			.setDescription("Chat with the chatbot.")
			.setDescriptionLocalizations(client.lang.getDescriptionLocalizations("llm_clearhistory"))
        ),
	category: CommandCategories.Utilities,
	flags: [],
	async execute(interaction: ChatInputCommandInteraction, dbUser: User) {
		await interaction.deferReply();
		switch (interaction.options.getSubcommand()) {
			case "chat": {
				const startDate = new Date();
				if (interaction.channel?.isSendable()) {
					await interaction.channel.sendTyping();
				}
				const completion = await chatbot.answer(
					interaction.user.id,
					getSystemPrompt(dbUser, interaction.options.getString("systemprompt")),
					interaction.options.getString("prompt", true),
				);
				const completionDate = new Date();
				let content =
					(completion.choices[0].message.content || "") +
					`\n-# AI | ${completion.usage?.total_tokens} token(s) | ${(completionDate.getTime() - startDate.getTime()) / 1000}s`;
				if (!dbUser.customSystemPromptAllowed && interaction.options.getString("systemprompt")) {
					content += `\n${client.lang.getResponse(interaction.locale, "chatbot_systemprompt_exclusive")}`;
				}
				if (content.length > 2000) {
					await interaction.followUp(
						client.lang.getResponse(
							interaction.guildLocale,
							"chatbot_answer_too_long",
						),
					);
				} else await interaction.followUp(content);
				break;
			}
			case "clearhistory": {
				chatbot.clearHistory(interaction.user.id);
				const responseobj = client.lang.getResponseObject(interaction.guildLocale, "llm_clearhistory_cleared");
				await interaction.followUp({
					embeds: [{
						title: responseobj.title,
						description: responseobj.description,
						timestamp: (new Date()).toISOString()
					}]
				});
			}
		};
		return true;
	},
};
