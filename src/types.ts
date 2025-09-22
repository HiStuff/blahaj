import { Guild, User } from "../prisma/client/default.js"
import { AutocompleteInteraction, ButtonInteraction, ChatInputCommandInteraction, Client, ClientOptions, Collection, ContextMenuCommandBuilder, ContextMenuCommandInteraction, SlashCommandBuilder } from "discord.js";
import { LanguageManager } from "./utils/languageManager.js";

export interface IVersion {
    name: string,
    codename: string,
    color: string
}

export class FembotClient extends Client {
    commands: Collection<string, ICommand>;
    context_menu_commands: Collection<string, IContextMenuCommand>;
    buttons: Collection<string, IButton>;
    version: IVersion;
    lang: LanguageManager;
    constructor(version: IVersion, lang: LanguageManager, options: ClientOptions) {
        super(options);
        this.version = version;
        this.lang = lang;
        this.commands = new Collection<string, ICommand>();
        this.context_menu_commands = new Collection<string, IContextMenuCommand>();
        this.buttons = new Collection<string, IButton>();
    }
}

export interface IContextMenuCommand {
    data: ContextMenuCommandBuilder;
    requiredPermission?: bigint;
    flags: CommandFlags[];
    execute(interaction: ContextMenuCommandInteraction, dbUser: User, dbGuild: Guild | null | undefined): Promise<boolean>;
}

export interface ICommand {
    data: SlashCommandBuilder;
    category: CommandCategories;
    requiredPermission?: bigint;
    flags: CommandFlags[];
    autocomplete?(interaction: AutocompleteInteraction, dbUser: User, dbGuild: Guild | null | undefined): Promise<boolean>;
    execute(interaction: ChatInputCommandInteraction, dbUser: User, dbGuild: Guild | null | undefined): Promise<boolean>; 
}

export interface IButton {
    customId: string
    clicked(client: FembotClient, interaction: ButtonInteraction, guild: Guild): Promise<boolean>; 
}

export enum CommandCategories {
    Info = "😉 Informacyjne",
    Ticket = "✉️ Ticket",
    Moderation = "🔨 Moderacja",
    Utilities = "🛠️ Przydatne",
    Developer = "⌨️ Developer",
}

export enum CommandFlags {
    DevOnly = 0,
    Disabled = 1
}

// api

export interface SessionUser {
    discord_id: string,
    discord_access_token: string,
    is_developer: boolean
}

export interface APIUserResponse {
    session: SessionUser,
    user: User | null
}

export class APIResponsePayload<Type> {
    code: APIResponseCode;
    data: Type;
    constructor(code: APIResponseCode, data?: any) {
        this.code = code;
        this.data = data;
    }
}

export enum APIResponseCode {
    Success = "SUCCESS",
    FailedToUpdate = "FAILED_TO_UPDATE",
}