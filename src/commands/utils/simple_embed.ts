import { Client, ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder, ApplicationIntegrationType, InteractionContextType, ColorResolvable, time, TimestampStyles, PermissionFlagsBits, Embed } from "discord.js";
import config from "../../../config.json" with { type: "json" };
import { client } from "../../fembot.js";
import { CommandCategories, ICommand } from "../../types.js";
import { getAverageColor } from "fast-average-color-node";

export default {
	data: new SlashCommandBuilder()
		.setName('simpleembed')
        .setNameLocalizations(client.lang.getNameLocalizations("simpleembed"))
		.setDescription('Create simple embed.')
        .setDescriptionLocalizations(client.lang.getDescriptionLocalizations("simpleembed"))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .setContexts(InteractionContextType.Guild)
        .addStringOption(option => option
            .setName("title")
            .setDescription("Title")
            .setNameLocalizations(client.lang.getNameLocalizations("simpleembed_title"))
            .setDescriptionLocalizations(client.lang.getDescriptionLocalizations("simpleembed_title"))
            .setRequired(true)
        ).addStringOption(option => option
            .setName("description")
            .setDescription("Description")
            .setNameLocalizations(client.lang.getNameLocalizations("simpleembed_description"))
            .setDescriptionLocalizations(client.lang.getDescriptionLocalizations("simpleembed_description"))
            .setRequired(true)
        ).addStringOption(option => option
            .setName("color")
            .setDescription("Color (HEX)")
            .setNameLocalizations(client.lang.getNameLocalizations("simpleembed_color"))
            .setDescriptionLocalizations(client.lang.getDescriptionLocalizations("simpleembed_color"))
        ),
	category: CommandCategories.Utilities,
    requiredPermission: PermissionFlagsBits.ManageMessages,
	flags: [],
	async execute(interaction: ChatInputCommandInteraction) {
		await interaction.deferReply();
        const embed = new EmbedBuilder()
            .setTitle(interaction.options.getString("title"))
            .setDescription(interaction.options.getString("description"))
            .setColor(interaction.options.getString("color") as ColorResolvable);
        await interaction.followUp({ embeds: [embed] });
	}
}