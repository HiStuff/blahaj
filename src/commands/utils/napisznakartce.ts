import { Client, ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder, ApplicationIntegrationType, InteractionContextType, ColorResolvable, time, TimestampStyles, PermissionFlagsBits, Embed, Attachment, AttachmentBuilder, ActionRowBuilder, ComponentBuilder, TextInputBuilder, TextInputStyle, ModalSubmitInteraction, CacheType } from "discord.js";
import config from "../../../config.json" with { type: "json" };
import { client } from "../../fembot.js";
import { CommandCategories, CommandFlags, ICommand } from "../../types.js";
import { createCanvas, loadImage } from "@napi-rs/canvas";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import { createCompletionModal } from "../../utils/modal.js";
import { createErrorEmbed, Error } from "../../utils/error.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default {
	data: new SlashCommandBuilder()
		.setName('napisznakartce')
		.setDescription('Pisze na kartce.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .setContexts(InteractionContextType.Guild)
        .addStringOption(option => option
            .setName("tekst")
            .setDescription("No tekst... xD")
            .setRequired(false)
        ),
	category: CommandCategories.Utilities,
    requiredPermission: PermissionFlagsBits.ManageMessages,
	flags: [CommandFlags.Disabled],
	async execute(interaction: ChatInputCommandInteraction) {
        let text = interaction.options.getString("tekst");
        let result: ChatInputCommandInteraction | ModalSubmitInteraction<CacheType> = interaction;
        if (!text) {
            const completion = await createCompletionModal(interaction, [text],
                new ActionRowBuilder<TextInputBuilder>()
                    .addComponents(
                        new TextInputBuilder()
                            .setLabel("Tekst")
                            .setCustomId("text")
                            .setStyle(TextInputStyle.Paragraph)
                            .setRequired(true)
                    )
            )
            if (!completion) return interaction.followUp({ embeds: [createErrorEmbed(Error.ERROR_WHILE_COLLECTING)] });
            text = completion.fields.getTextInputValue("text");
            result = completion;
        } else await interaction.deferReply();
        const canvas = createCanvas(195, 120);
		const context = canvas.getContext('2d');
        const img = await loadImage(pathToFileURL(path.join(__dirname, "../../../assets/paper.jpg")));
        context.drawImage(img, 0, 0, canvas.width, canvas.height);
        context.font = "12px Ink Free";
        context.fillStyle = "#0000FF";
        context.fillText(text, 6, 13);
        const attachment = new AttachmentBuilder(await canvas.encode("png"), { name: "rysunek.png" });
        await interaction.followUp({ files: [attachment] });
	}
}