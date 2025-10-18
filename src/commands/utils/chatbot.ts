import { Client, ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder, ApplicationIntegrationType, InteractionContextType, ColorResolvable, time, TimestampStyles, PermissionFlagsBits, Embed, ChannelType, GuildTextBasedChannel, MessageFlags, BaseChannel, Channel } from "discord.js";
import config from "../../../config.json" with { type: "json" };
import { client, chatbot } from "../../fembot.js";
import { CommandCategories, CommandFlags, ICommand } from "../../types.js";
import { getAverageColor } from "fast-average-color-node";
import { ChatCompletionMessageParam } from "openai/resources";

export default {
	data: new SlashCommandBuilder()
		.setName('chatbot')
        .setNameLocalizations(client.lang.getNameLocalizations("chatbot"))
		.setDescription('Large language model. Yuh-')
        .setDescriptionLocalizations(client.lang.getDescriptionLocalizations("chatbot"))
        .addSubcommand(input => input
            .setName("chat")
            .setNameLocalizations(client.lang.getNameLocalizations("chatbot_chat"))
            .setDescription("Chat.")
            .setDescriptionLocalizations(client.lang.getDescriptionLocalizations("chatbot_chat"))
            .addStringOption(input => input
                .setName("message")
                .setNameLocalizations(client.lang.getNameLocalizations("chatbot_chat_message"))
                .setDescription("Message you want to send to the chatbot.")
                .setDescriptionLocalizations(client.lang.getDescriptionLocalizations("chatbot_chat_message"))
                .setRequired(true)
            )
        ),
	category: CommandCategories.Utilities,
	flags: [],
	async execute(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply();
        try {
            await fetch(chatbot.llmClient.baseURL);
        } catch(err) {
            await interaction.followUp(client.lang.getResponse(interaction.guildLocale, "chatbot_failed_to_connect"));
            return true;
        }
		switch (interaction.options.getSubcommand(true)) {
            case "chat": {
                const startDate = new Date();
                const completion = await chatbot.answer(interaction.user.id, interaction.options.getString("message", true));
                const completionDate = new Date();
                await interaction.followUp((completion.choices[0].message.content || "") + `\n-# AI | ${completion.usage?.total_tokens} token(s) | ${(completionDate.getTime() - startDate.getTime())/1000}s`);
            }
        }
        return true;
	}
}