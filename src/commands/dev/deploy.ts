import { ChatInputCommandInteraction, EmbedBuilder, MessageFlags, SlashCommandBuilder } from "discord.js";
import { createErrorEmbed, Error } from "../../utils/error.js";
import { User } from "../../../prisma/client/default.js";
import { CommandCategories, CommandFlags } from "../../types.js";
import { cleanGlobal, cleanServer, deployGlobal, deployGuild } from "../../utils/deploy.js";
import config from '../../../config.json' with { type: "json" };

export default {
	data: new SlashCommandBuilder()
		.setName('deploy')
		.setDescription('Deployuje komendy. (nwm jak to sie nazywa po polsku lol)')
        .addSubcommand(subcommand => subcommand
            .setName("serwer")
            .setDescription("Deployuj komendy na serwerze. (Najlepiej na swój prywatny)")
            .addStringOption(option => option
                .setName("id")
                .setDescription("ID serwera.")
            )
        ).addSubcommand(subcommand => subcommand
            .setName("globalnie")
            .setDescription("Deployuj komendy globalnie.")
        ).addSubcommand(subcommand => subcommand
            .setName("wyczysc-serwerowo")
            .setDescription("Wyczyść komendy na serwerze.")
			.addStringOption(option => option
                .setName("id")
                .setDescription("ID serwera.")
            )
        ).addSubcommand(subcommand => subcommand
            .setName("wyczysc-globalnie")
            .setDescription("Wyczyść komendy globalnie.")
        ),
	category: CommandCategories.Developer,
	flags: [CommandFlags.DevOnly],
	async execute(interaction: ChatInputCommandInteraction, dbUser: User) {
		await interaction.deferReply();
		const message = await interaction.followUp({ embeds: [
			new EmbedBuilder()
				.setTitle("Deploy")
				.setDescription(`Deploy trwa...`)
				.setColor(0x00BBFF)
				.setTimestamp(new Date())
		] });
        if (interaction.options.getSubcommand() == "serwer") {
            await deployGuild(interaction.options.getString("id") || config.guildId);
        } else if (interaction.options.getSubcommand() == "globalnie") {
            await deployGlobal();
        } else if (interaction.options.getSubcommand() == "wyczysc-serwerowo") {
			await cleanServer(interaction.options.getString("id") || config.guildId);
		} else if (interaction.options.getSubcommand() == "wyczysc-globalnie") {
			await cleanGlobal();
		}
        await message.edit({ embeds: [
			new EmbedBuilder()
				.setTitle("Deploy")
				.setDescription(`Deploy udał się pomyślnie!`)
				.setColor(0x00FF00)
				.setTimestamp(new Date())
		] });
	},
};