import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, CategoryChannel, ChannelType, EmbedBuilder, EmbedField, Guild, GuildChannelResolvable, GuildMember, GuildMemberResolvable, Message, MessageCreateOptions, MessageFlags, MessagePayload, ModalBuilder, PermissionOverwrites, RoleFlags, RoleFlagsBitField, TextChannel, TextChannelResolvable, TextInputStyle, User } from "discord.js";
import { FembotClient } from "../../types.js";
import { randomInt, randomUUID } from "crypto";
import { database } from "../../fembot.js";
import { Prisma, PrismaClient, TicketTheme } from "../../../prisma/client/index.js";

let openButton: ButtonBuilder = new ButtonBuilder().setLabel("Otwórz").setCustomId("openticket").setStyle(ButtonStyle.Primary).setEmoji("🚪");
let closeButton: ButtonBuilder = new ButtonBuilder().setLabel("Zamknij").setCustomId("closeticket").setStyle(ButtonStyle.Danger).setEmoji("⛔");
let closeMessagePayload: MessageCreateOptions = {
    components: [ new ActionRowBuilder<ButtonBuilder>().addComponents(closeButton) ]
}

let deleteButton: ButtonBuilder = new ButtonBuilder().setLabel("Usuń").setCustomId("deleteticket").setStyle(ButtonStyle.Danger).setEmoji("🗑️")

export async function getTicketFromChannel(bot: FembotClient, guild: Guild, channel: TextChannel) {
    if (!channel.topic) return null;
    let jsonString = Buffer.from(channel.topic, "base64").toString("ascii");
    let jsonObj = JSON.parse(jsonString);
    if ("themeKey" in jsonObj && "authorId" in jsonObj) {
        let user = await bot.users.fetch(jsonObj.authorId);
        let ticket = new Ticket(bot, guild, channel, user, jsonObj.themeKey);
        await ticket.init(guild.id);
        return ticket;
    } else {
        return null;
    }
}

export async function handleCustomMenuButtonClick(client: FembotClient, interaction: ButtonInteraction) {
    if (!interaction.guild) return;
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    let theme = interaction.customId.substring(4)
    let ticket = new Ticket(client, interaction.guild, undefined, interaction.user, theme);
    if (!(await ticket.init(interaction.guild.id))) { await interaction.followUp({ content: "Te menu tworzenia ticketa jest zepsute, proszę skontaktować się z administracją serwera.", flags: MessageFlags.Ephemeral }); return; }
    await ticket.createTicket(client);
    if (ticket.channel) {
        await interaction.followUp(`<#${ticket.channel.id}>`);
    } else {
        await interaction.followUp(`Stworzono ticket.`);
    }
}

export class Ticket {
    guild: Guild
    channel?: TextChannel
    themeKey: string
    theme?: TicketTheme | null
    author: User
    constructor(bot: FembotClient, guild: Guild, channel: TextChannel | undefined, author: User, themeKey: string) {
        this.channel = channel
        this.guild = guild
        this.author = author
        this.themeKey = themeKey
    }
    async init(guildId: string) {
        this.theme = await database.ticketTheme.findFirst({ where: { guildId: guildId, id: this.themeKey } });
        return this.theme;
    }
    async createTicket(bot: FembotClient, answers?: { name: string, answer: string }[]): Promise<TextChannel> {
        const categoryId = (await database.guild.upsert({
            where: { id: this.guild.id },
            create: { id: this.guild.id },
            update: { id: this.guild.id },
        })).ticketCategoryId
        if (!categoryId) throw new Error(`Ten serwer nie ma wybranej kategorii do której trafiają tickety.\nUżyj komendy \`/ticket pomoc\` aby dowiedzieć się, jak skonfigurować funkcje ticketów.`);
        if (!this.theme) throw new Error(`Wybrany temat ticketa nie istnieje. (${this.themeKey})`);
        let json = {
            themeKey: this.themeKey,
            authorId: this.author.id
        }
        this.channel = await this.guild.channels.create({
            name: this.theme.channelName,
            topic: Buffer.from(JSON.stringify(json)).toString("base64"),
            parent: categoryId
        });
        await this.channel.permissionOverwrites.edit(this.channel.guild.roles.everyone, { ViewChannel: false });
        await this.channel.permissionOverwrites.edit(this.author, { SendMessages: true, ViewChannel: true });
        let themeJson = await JSON.parse(this.theme.ticketIntro);
        themeJson.content = `<@${this.author.id}>\n${themeJson.content || ""}`;

        if (answers) {
            let answersEmbedFields: EmbedField[] = [];
            
            answers.forEach(answer => {
                answersEmbedFields.push({ name: answer.name, value: answer.answer, inline: false });
            });
             
            const answersEmbed = new EmbedBuilder()
                .setTitle("Odpowiedzi na pytania")
                .addFields(answersEmbedFields);
                
            themeJson.embeds.push(answersEmbed)
        }
        
        await this.channel.send({ ...themeJson, ...closeMessagePayload });
        return this.channel
    }
    async close(bot: FembotClient, interaction?: ButtonInteraction) {
        if (!this.channel) return;
        if (interaction) {
            await interaction.followUp("Ticket zostanie zamknięty za 5 sekund.");
        } else { await this.channel.send("Ticket zostanie zamknięty za 5 sekund."); };
        setTimeout(async () => {
            if (!this.channel) return;
            await this.channel.send({ content: `Ticket został zamknięty przez ${interaction?.user || "bota"}.`, components: [ new ActionRowBuilder<ButtonBuilder>().addComponents(openButton, deleteButton) ] })
            if (this.guild.members.cache.has(this.author.id)) {
                await this.channel.permissionOverwrites.edit(this.author, { SendMessages: false, ViewChannel: false });
            };
        }, 5000);
    }
    async open(bot: FembotClient, interaction?: ButtonInteraction) {
        if (!this.channel) return;
        await this.channel.send({ content: `Ticket został otwarty przez ${interaction?.user || "bota"}.`, components: [ new ActionRowBuilder<ButtonBuilder>().addComponents(closeButton) ] })
        if (this.guild.members.cache.has(this.author.id)) {
            await this.channel.permissionOverwrites.edit(this.author, { SendMessages: true, ViewChannel: true })
        }
    }
    async delete(bot: FembotClient, interaction?: ButtonInteraction) {
        if (!this.channel) return;
        if (interaction) {
            await interaction.followUp("Ticket zostanie usunięty za 5 sekund.");
        } else { await this.channel.send("Ticket zostanie usunięty za 5 sekund."); };
        setTimeout(async () => {
            if (!this.channel) return;
            await this.channel.send(`Ticket został usunięty przez ${interaction?.user || "bota"}.`);
            await this.channel.delete();
        }, 5000);
    }
}
