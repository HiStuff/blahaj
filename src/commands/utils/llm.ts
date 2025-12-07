import {
	ChatInputCommandInteraction,
	EmbedBuilder,
	SlashCommandBuilder,
} from "discord.js";
import { createErrorEmbed, Error } from "../../utils/error.js";
import { CommandCategories } from "../../types.js";
import { chatbot, client } from "../../fembot.js";

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
	async execute(interaction: ChatInputCommandInteraction) {
		await interaction.deferReply();
		switch (interaction.options.getSubcommand()) {
			case "chat": {
				try {
					await fetch(chatbot.llmClient.baseURL);
				} catch (err) {
					await interaction.followUp(
						client.lang.getResponse(
							interaction.guildLocale,
							"chatbot_failed_to_connect",
						),
					);
					return true;
				}
				const startDate = new Date();
				if (interaction.channel?.isSendable()) {
					await interaction.channel.sendTyping();
				}
				const completion = await chatbot.answer(
					interaction.user.id,
					"You are a helpful assistant.",
					interaction.options.getString("prompt", true),
				);
				const completionDate = new Date();
				const content =
					(completion.choices[0].message.content || "") +
					`\n-# AI | ${completion.usage?.total_tokens} token(s) | ${(completionDate.getTime() - startDate.getTime()) / 1000}s`;
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
