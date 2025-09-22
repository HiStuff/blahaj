import { ChatInputCommandInteraction, CommandInteraction, EmbedBuilder, MessageFlags, SlashCommandBuilder, SlashCommandSubcommandBuilder, SlashCommandUserOption } from "discord.js";
import { createErrorEmbed, Error } from "../../utils/error.js";
import { CommandCategories, CommandFlags } from "../../types.js";
import { User } from "../../../prisma/client/default.js";
import { database } from "../../fembot.js";

export default {
	data: new SlashCommandBuilder()
		.setName('dev')
		.setDescription('Daje lub sprawdza status developera.')
        .addSubcommand(subcommand => subcommand
		    .setName('nadaj')
		    .setDescription('Nadaj status developera.')
            .addUserOption(option => option
                .setName("user")
                .setDescription("Użytkownik któremu chcesz nadać status developera.")
                .setRequired(true)
            )
        )
        .addSubcommand(subcommand => subcommand
		    .setName('sprawdz')
		    .setDescription('Sprawdz status developera.')
            .addUserOption(option => option
                .setName("user")
                .setDescription("Użytkownik któremu chcesz sprawdzić status developera.")
                .setRequired(true)
            )
        )
        .addSubcommand(subcommand => subcommand
		    .setName('zabierz')
		    .setDescription('Zabierz status developera.')
            .addUserOption(option => option
                .setName("user")
                .setDescription("Użytkownik któremu chcesz zabrać status developera.")
                .setRequired(true)
            )
        ),
    category: CommandCategories.Developer,
    flags: [CommandFlags.DevOnly],
	async execute(interaction: ChatInputCommandInteraction, dbUser: User) {
		await interaction.deferReply({ flags: MessageFlags.Ephemeral });
        const user = interaction.options.getUser("user");
        if (!user) { interaction.followUp({ embeds: [ createErrorEmbed(Error.USER_IS_NULL) ] }); return; }
		switch (interaction.options.getSubcommand(true)) {
            case "nadaj":
                await database.user.upsert({
                    where: {
                        id: user.id
                    },
                    update: {
                        developer: true
                    },
                    create: {
                        id: user.id,
                        developer: true
                    }
                });
                const embed1 = new EmbedBuilder()
                    .setTitle("Nadano.")
                    .setDescription(`Nadano status Developera użytkownikowi ${user}!`)
                    .setColor(0x00FF00)
                    .setTimestamp(new Date())
                await interaction.followUp({ embeds: [embed1] });
                break;
            case "zabierz":
                await database.user.upsert({
                    where: {
                        id: user.id
                    },
                    update: {
                        developer: false
                    },
                    create: {
                        id: user.id,
                        developer: false
                    }
                });
                const embed2 = new EmbedBuilder()
                    .setTitle("Zabrano.")
                    .setDescription(`Zabrano status Developera użytkownikowi ${user}!`)
                    .setColor(0x00FF00)
                    .setTimestamp(new Date())
                await interaction.followUp({ embeds: [embed2] });
                break;
            case "sprawdz":
                const targetUserFromDatabase = await database.user.upsert({
                    where: {
                        id: user.id
                    },
                    update: {},
                    create: {
                        id: user.id,
                        developer: false
                    }
                });
                const embed3 = new EmbedBuilder()
                    .setTitle(targetUserFromDatabase?.developer ? "Posiada." : "Nie posiada.")
                    .setDescription(`Użytkownik ${user} ${targetUserFromDatabase?.developer ? "" : "nie"} posiada status${dbUser.developer ? "" : "u"} Developera!`)
                    .setColor(targetUserFromDatabase?.developer ? 0xFF0000 : 0x00FF00)
                    .setTimestamp(new Date());
                await interaction.followUp({ embeds: [embed3] });
                break;
        }
	}
};