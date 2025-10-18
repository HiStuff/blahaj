import { Client, ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder, Team, User, version, Embed, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } from "discord.js";
import config from "../../../config.json" with { type: "json" };
import { client } from "../../fembot.js";
import os from "node:os";
import os_utils from "os-utils";
import packagejson from "../../../package.json" with { type: "json" };
import { CommandCategories, CommandFlags } from "../../types.js";
import { update } from "../../updater.js";

let areYouSureEmbed = new EmbedBuilder()
    .setTitle("Jesteś pewien?")
    .setDescription("Zatwierdź przyciskiem jeśli jesteś pewien.")
    .setColor(0xFFFFFF);

let wrongContentTypeEmbed = new EmbedBuilder()
    .setTitle("Błąd")
    .setDescription("Paczka aktualizacji jest wadliwa.")
    .setColor(0xFF0000);

let updateCancelledEmbed = new EmbedBuilder()
    .setTitle("Anulowano.")
    .setDescription("Anulowano aktualizacje.")
    .setColor(0xFF0000);

let updateEmbed = new EmbedBuilder()
    .setTitle("Aktualizowanie...")
    .setDescription("Trwa pobieranie aktualizacji...")
    .setColor(0xFFFFFF);

export default {
	data: new SlashCommandBuilder()
		.setName('update')
		.setDescription('Aktualizuje bota!')
        .addAttachmentOption(input =>
            input
                .setName("package")
                .setDescription("Paczka aktualizacji.")
                .setRequired(true)
        ),
	category: CommandCategories.Developer,
	flags: [CommandFlags.DevOnly],
	async execute(interaction: ChatInputCommandInteraction) {
		await interaction.deferReply();
        const updateAttachment = interaction.options.getAttachment("package", true);
		if (updateAttachment.contentType == "application/zip") {
            const reply = await interaction.followUp({ embeds: [updateEmbed.setTimestamp(new Date())] });
            const updateRes = await fetch(updateAttachment.url);
            const updateBuffer = await updateRes.arrayBuffer();
            await reply.edit({ embeds: [areYouSureEmbed.setTimestamp(new Date())], components: [new ActionRowBuilder<ButtonBuilder>().addComponents(new ButtonBuilder().setLabel("Zaktualizuj").setCustomId("updateConfirm").setStyle(ButtonStyle.Success))] })
            const collector = reply.awaitMessageComponent({ componentType: ComponentType.Button, time: 10_000, filter: (interaction2, _) => interaction2.user.id == interaction.user.id && interaction2.customId == "updateConfirm" })
            collector.then(async () => {
                updateEmbed.setDescription("Aktualizowanie...");
                updateEmbed.setTimestamp(new Date());
                await reply.edit({ embeds: [updateEmbed], components: [] });
                const updated = await update(Buffer.from(updateBuffer), false);
                const date = new Date();
                if (updated) {
                    updateEmbed.setTitle("Zaktualizowano.");
                    updateEmbed.setDescription(`Zaktualizowano w ${updateEmbed.data.timestamp ? (date.getTime() - new Date(updateEmbed.data.timestamp).getTime())/1000 : "???"}s.\nKończenie procesu...`);
                    updateEmbed.setTimestamp(date);
                    updateEmbed.setColor(0x00FF00);
                    await reply.edit({ embeds: [updateEmbed] })
                    process.exit();
                } else {
                    updateEmbed.setTitle("Błąd");
                    updateEmbed.setDescription(`Coś poszło nie tak podczas aktualizacji.\nSprawdź terminal.`);
                    updateEmbed.setTimestamp(date);
                    updateEmbed.setColor(0xFF0000);
                    await reply.edit({ embeds: [updateEmbed] })
                }
            }).catch(async () => {
                await reply.edit({ embeds: [updateCancelledEmbed.setTimestamp(new Date())], components: [] })
            })
        } else {
            await interaction.followUp({ embeds: [wrongContentTypeEmbed.setTimestamp(new Date())] });
        }
		return true;
	}
}