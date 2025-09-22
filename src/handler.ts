import path from "path";
import fs from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { client } from "./fembot.js";
import config from '../config.json' with { type: "json" };
import * as log from "./utils/logger.js";
import { CommandFlags } from "./types.js";
import { AutocompleteInteraction, ChatInputCommandInteraction, CommandInteraction, ContextMenuCommandInteraction, MessageFlags } from "discord.js";
import { Guild, User } from "../prisma/client/index.js";
import { createErrorEmbed, Error } from "./utils/error.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const commandsFolderPath = path.join(__dirname, 'commands');
const contextMenuCommandsFolderPath = path.join(__dirname, 'contextmenu_commands'); // chyba do zmiany
const buttonsPath = path.join(__dirname, 'buttons');
const commandFolders = fs.readdirSync(commandsFolderPath);
const contextMenuCommandFolders = fs.readdirSync(contextMenuCommandsFolderPath);

let deployed = true;
if (process.argv[2] == "--development") {
    deployed = false;
}

export async function loadCommands() {
    for (const folder of commandFolders) {
        const commandsPath = path.join(commandsFolderPath, folder);
        const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(deployed ? ".js" : ".ts"));
        for (const file of commandFiles) {
            const filePath = path.join(commandsPath, file);
            const command = (await import(pathToFileURL(filePath).href)).default;
            if (!command) { log.warn(`The command at ${filePath} is corrupted.`); continue; }
            if ('data' in command && 'execute' in command) {
                if (command.flags.includes(CommandFlags.Disabled)) continue;
                client.commands.set(command.data.name, command);
            } else {
                log.warn(`The command at ${filePath} is missing a required "data" or "execute" property.`);
            }
        }
    }
}

export async function loadContextMenuCommands() {
    //for (const folder of contextMenuCommandFolder) {
        //const commandsPath = path.join(contextMenuCommandsFolderPath, folder);
        const commandFiles = fs.readdirSync(contextMenuCommandsFolderPath).filter(file => file.endsWith(deployed ? ".js" : ".ts"));
        for (const file of commandFiles) {
            const filePath = path.join(contextMenuCommandsFolderPath, file);
            const command = (await import(pathToFileURL(filePath).href)).default;
            if (!command) { log.warn(`The context menu command at ${filePath} is corrupted.`); continue; }
            if ('data' in command && 'execute' in command) {
                if (command.flags.includes(CommandFlags.Disabled)) continue;
                client.context_menu_commands.set(command.data.name, command);
            } else {
                log.warn(`The context menu command at ${filePath} is missing a required "data" or "execute" property.`);
            }
        }
    //}
}

export let eventsCounter = 0;
export async function loadEvents() {
    const eventsPath = path.join(__dirname, 'events');
    const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith(deployed ? ".js" : ".ts"));
    for (const file of eventFiles) {
        const filePath = path.join(eventsPath, file);
        const event = (await import(pathToFileURL(filePath).href)).default;
        eventsCounter++;
        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args));
        } else {
            client.on(event.name, (...args) => event.execute(...args));
        }
    }
}

export async function loadButtons() {
    const buttonsFiles = fs.readdirSync(buttonsPath).filter(file => file.endsWith(deployed ? ".js" : ".ts"));
    for (const file of buttonsFiles) {
        const filePath = path.join(buttonsPath, file);
        const button = (await import(pathToFileURL(filePath).href)).default;
        if (!button) { log.warn(`The button at ${filePath} is corrupted.`); continue; }
        if ('customId' in button && 'clicked' in button) {
            client.buttons.set(button.customId, button);
        } else {
            log.warn(`The button at ${filePath} is missing a required "customid" or "clicked" property.`);
        }
    }
}

export async function handleChatInputCommandInteraction(interaction: ChatInputCommandInteraction, user: User, guild: Guild | null) {
    const command = client.commands.get(interaction.commandName);
    
    if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`);
        return;
    }

    try {
        if (command.flags.includes(CommandFlags.DevOnly) && !user.developer) {
            await interaction.reply({ embeds: [ createErrorEmbed(Error.COMMAND_USER_NOT_A_DEVELOPER) ], flags: MessageFlags.Ephemeral });
            return;
        };
        if (command.requiredPermission) {
            if (!interaction.memberPermissions?.has(command.requiredPermission)) {
                await interaction.reply({ embeds: [ createErrorEmbed(Error.NO_USER_PERMISSIONS) ], flags: MessageFlags.Ephemeral });
                return;
            }
        }
        let result = await command.execute(interaction, user, guild);
        if (!result) await interaction.reply({ embeds: [ createErrorEmbed(Error.SOMETHING_WENT_WRONG) ], flags: MessageFlags.Ephemeral });
        return;
    } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
        } else {
            await interaction.reply({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
        }
        return;
    }
}

export async function handleAutocomplete(interaction: AutocompleteInteraction, user: User, guild: Guild | null) {
    const command = client.commands.get(interaction.commandName);
    
    if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`);
        return;
    }

    try {
        if (command.autocomplete) {
            await command.autocomplete(interaction, user, guild);
        }
    } catch (error) {
        log.error(error);
    }
}

export async function handleContextMenuCommandInteraction(interaction: ContextMenuCommandInteraction, user: User, guild: Guild | null) {
    const command = client.context_menu_commands.get(interaction.commandName);
    
    if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`);
        return;
    }

    try {
        if (command.flags.includes(CommandFlags.DevOnly) && !user.developer) {
            await interaction.reply({ embeds: [ createErrorEmbed(Error.COMMAND_USER_NOT_A_DEVELOPER) ], flags: MessageFlags.Ephemeral });
            return;
        };
        if (command.requiredPermission) {
            if (!interaction.memberPermissions?.has(command.requiredPermission)) {
                await interaction.reply({ embeds: [ createErrorEmbed(Error.NO_USER_PERMISSIONS) ], flags: MessageFlags.Ephemeral });
                return;
            }
        }
        let result = await command.execute(interaction, user, guild);
        if (!result) await interaction.reply({ embeds: [ createErrorEmbed(Error.SOMETHING_WENT_WRONG) ], flags: MessageFlags.Ephemeral });
        return;
    } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
        } else {
            await interaction.reply({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
        }
        return;
    }
}