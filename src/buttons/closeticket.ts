import { ButtonInteraction, ChannelType, MessageFlags } from "discord.js";
import { FembotClient } from "../types.js";
import { getTicketFromChannel } from "../features/ticket/ticket.js";

export default {
    customId: "closeticket",
    async clicked(client: FembotClient, interaction: ButtonInteraction) {
        if (interaction.guild && interaction.channel && interaction.channel.type == ChannelType.GuildText) {
            await interaction.deferReply();
            let ticket = await getTicketFromChannel(client, interaction.guild, interaction.channel);
            await ticket?.close(client, interaction);
        }
    }
}