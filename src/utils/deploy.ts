import "dotenv/config";
import config from "../../config.json" with { type: "json" };
import {
	REST,
	RESTPostAPIChatInputApplicationCommandsJSONBody,
	RESTPostAPIContextMenuApplicationCommandsJSONBody,
	Routes,
	Snowflake,
} from "discord.js";
import { client } from "../fembot.js";
import * as log from "../utils/logger.js";
import { CommandFlags } from "../types.js";

if (!process.env.TOKEN) {
	throw new Error("TOKEN is null.");
}
const rest = new REST().setToken(process.env.TOKEN);

export async function deployGlobal() {
	const commands: (
		| RESTPostAPIChatInputApplicationCommandsJSONBody
		| RESTPostAPIContextMenuApplicationCommandsJSONBody
	)[] = [];
	client.commands.forEach((command) => {
		if (!command.flags.includes(CommandFlags.DevOnly))
			commands.push(command.data.toJSON());
	});
	client.context_menu_commands.forEach((command) => {
		if (!command.flags.includes(CommandFlags.DevOnly))
			commands.push(command.data.toJSON());
	});
	log.info(`Started refreshing ${commands.length} application commands.`);
	await rest.put(Routes.applicationCommands(config.clientId), {
		body: commands,
	});
	log.success(
		`Successfully reloaded ${commands.length} application commands.`,
	);
}

export async function deployGuild(guildId: Snowflake) {
	const commands: (
		| RESTPostAPIChatInputApplicationCommandsJSONBody
		| RESTPostAPIContextMenuApplicationCommandsJSONBody
	)[] = [];
	client.commands.forEach((command) => {
		commands.push(command.data.toJSON());
	});
	client.context_menu_commands.forEach((command) => {
		commands.push(command.data.toJSON());
	});
	log.info(`Started refreshing ${commands.length} application commands.`);
	await rest.put(Routes.applicationGuildCommands(config.clientId, guildId), {
		body: commands,
	});
	log.success(
		`Successfully reloaded ${commands.length} application commands.`,
	);
}

export async function cleanGlobal() {
	log.info(`Started removing global commands.`);
	await rest.put(Routes.applicationCommands(config.clientId), { body: [] });
	log.success(`Removed server commands.`);
}

export async function cleanServer(guildId: Snowflake) {
	log.info(`Started removing guild commands.`);
	await rest.put(Routes.applicationGuildCommands(config.clientId, guildId), {
		body: [],
	});
	log.success(`Removed server commands.`);
}
