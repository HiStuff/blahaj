export const __dirname = import.meta.dirname;

import {
	ActionRowBuilder,
	CategoryChannelResolvable,
	ChannelType,
	Client,
	Collection,
	Events,
	GatewayIntentBits,
	Interaction,
	InteractionType,
	MessageFlags,
	ModalBuilder,
	OverwriteType,
	TextInputBuilder,
	TextInputComponent,
	TextInputStyle,
} from "discord.js";
import * as log from "./utils/logger.js";
import {
	CommandCategories,
	CommandFlags,
	FembotClient,
	IButton,
	ICommand,
} from "./types.js";
import path from "path";
import fs from "fs";
import config from "../config.json" with { type: "json" };
import OpenAI from "openai";

import { fileURLToPath, pathToFileURL } from "node:url";
import { Guild, PrismaClient, User } from "../prisma/client/default.js";
import { createErrorEmbed, Error } from "./utils/error.js";
import {
	handleAutocomplete,
	handleChatInputCommandInteraction,
	handleContextMenuCommandInteraction,
	loadButtons,
	loadCommands,
	loadContextMenuCommands,
	loadEvents,
} from "./handler.js";
import {
	getTicketFromChannel,
	handleCustomMenuButtonClick,
	Ticket,
} from "./features/ticket/ticket.js";

import { LanguageManager } from "./utils/languageManager.js";
import { getVersion } from "./updater.js";
import Chatbot from "./features/chatbot/chatbot.js";

export const lang = new LanguageManager();
export const client = new FembotClient(getVersion(), lang, {
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.GuildMessageReactions,
	],
});
export const database = new PrismaClient();
export const chatbot = new Chatbot(
	new OpenAI({
		apiKey: process.env.LLM_API_KEY,
		baseURL: config.llm_api_host,
	}),
	{},
);

client.lang.load();

loadContextMenuCommands();
loadCommands();
loadEvents();
loadButtons();

client.on(Events.InteractionCreate, async (interaction) => {
	try {
		const user: User = await database.user.upsert({
			where: {
				id: interaction.user.id,
			},
			create: {
				id: interaction.user.id,
			},
			update: {},
		});

		let guild: Guild | null = null;
		if (interaction.guildId) {
			guild = await database.guild.upsert({
				where: {
					id: interaction.guildId,
				},
				create: {
					id: interaction.guildId,
				},
				update: {},
			});
		}

		if (interaction.isButton() && guild) {
			if (interaction.customId.startsWith("cmt-")) {
				await handleCustomMenuButtonClick(client, interaction);
			}
			let button = client.buttons.get(interaction.customId);
			if (button) {
				try {
					await button.clicked(client, interaction, guild);
					return;
				} catch (err) {
					log.error(err);
				}
			}
		}

		if (interaction.isContextMenuCommand()) {
			await handleContextMenuCommandInteraction(interaction, user, guild);
		}

		if (interaction.isChatInputCommand()) {
			await handleChatInputCommandInteraction(interaction, user, guild);
		} else if (interaction.isAutocomplete()) {
			await handleAutocomplete(interaction, user, guild);
		}
	} catch (err) {
		log.error(err);
		if (interaction.isRepliable()) {
			await interaction.reply({ content: lang.getResponse(interaction.locale, "generic_interaction_error"), flags: MessageFlags.Ephemeral });
		}
	}
});

client.login(process.env.TOKEN);
