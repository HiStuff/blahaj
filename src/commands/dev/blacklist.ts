import { ChatInputCommandInteraction, CommandInteraction, EmbedBuilder, MessageFlags, SlashCommandBuilder, SlashCommandSubcommandBuilder, SlashCommandUserOption } from "discord.js";
import { createErrorEmbed, Error } from "../../utils/error.js";
import { CommandCategories, CommandFlags } from "../../types.js";
import { User } from "../../../prisma/client/default.js";
import { database } from "../../fembot.js";

export default {
	data: new SlashCommandBuilder()
		.setName('blacklist')
		.setDescription('Dodaje lub usuwa z blacklisty.')
        .addSubcommand(subcommand => subcommand
		    .setName('dodaj')
		    .setDescription('Dodaj do blacklisty.')
            .addUserOption(option => option
                .setName("user")
                .setDescription("Użytkownik którego chcesz dodać do blacklisty.")
                .setRequired(false)
            )
            .addStringOption(option => option
                .setName("guild")
                .setDescription("Serwer który chcesz dodać do blacklisty. (ID)")
                .setRequired(false)
            )
        )
        .addSubcommand(subcommand => subcommand
		    .setName('usun')
		    .setDescription('Usuwa z blacklisty.')
            .addUserOption(option => option
                .setName("user")
                .setDescription("Użytkownik którego chcesz usunąć z blacklisty.")
                .setRequired(false)
            )
            .addStringOption(option => option
                .setName("guild")
                .setDescription("Serwer który chcesz usunąć z blacklisty. (ID)")
                .setRequired(false)
            )
        ).addSubcommand(subcommand => subcommand
		    .setName('sprawdz')
		    .setDescription('Sprawdza, czy dany serwer lub użytkownik znajduje się na blackliście.')
            .addUserOption(option => option
                .setName("user")
                .setDescription("Użytkownik którego chcesz sprawdzić czy jest na blackliście.")
                .setRequired(false)
            )
            .addStringOption(option => option
                .setName("guild")
                .setDescription("Serwer, który chcesz sprawdzić czy jest na blackliście. (ID)")
                .setRequired(false)
            )
        ),
    category: CommandCategories.Developer,
    flags: [CommandFlags.DevOnly],
	async execute(interaction: ChatInputCommandInteraction, dbUser: User) {
		await interaction.deferReply({ flags: MessageFlags.Ephemeral });
        const guild = interaction.options.getString("guild");
        const user = interaction.options.getUser("user");
        if (!user && !guild) { interaction.followUp({ embeds: [ createErrorEmbed(Error.NO_ARGUMENTS_SPECIFIED) ] }); return; }
		switch (interaction.options.getSubcommand(true)) {
            case "dodaj":
                if (guild) {
                    await database.guild.upsert({
                        where: {
                            id: guild
                        },
                        update: {
                            blacklisted: true
                        },
                        create: {
                            id: guild,
                            blacklisted: true
                        }
                    });
                    const embed = new EmbedBuilder()
                        .setTitle("Dodano do blacklisty.")
                        .setDescription(`Dodano serwer z ID ${guild} do blacklisty!`)
                        .setColor(0x00FF00)
                        .setTimestamp(new Date());
                    await interaction.followUp({ embeds: [embed] });
                } else if (user) {
                    if (user == interaction.user) {
                        await interaction.followUp({ embeds: [ createErrorEmbed(Error.USER_TRIED_TO_BLACKLIST_THEMSELF) ] });
                    }
                    await database.user.upsert({
                        where: {
                            id: user.id
                        },
                        update: {
                            blacklisted: true
                        },
                        create: {
                            id: user.id,
                            blacklisted: true
                        }
                    });
                    const embed = new EmbedBuilder()
                        .setTitle("Dodano do blacklisty.")
                        .setDescription(`Dodano ${user} (ID: ${user.id}) do blacklisty!`)
                        .setColor(0x00FF00)
                        .setTimestamp(new Date());
                    await interaction.followUp({ embeds: [embed] });
                }
                break;
            case "usun":
                if (guild) {
                    await database.guild.upsert({
                        where: {
                            id: guild
                        },
                        update: {
                            blacklisted: false
                        },
                        create: {
                            id: guild,
                            blacklisted: false
                        }
                    });
                    const embed = new EmbedBuilder()
                        .setTitle("Usunięto z blacklisty.")
                        .setDescription(`Usunięto serwer z ID ${guild} do blacklisty!`)
                        .setColor(0x00FF00)
                        .setTimestamp(new Date());
                    await interaction.followUp({ embeds: [embed] });
                } else if (user) {
                    await database.user.upsert({
                        where: {
                            id: user.id
                        },
                        update: {
                            blacklisted: false
                        },
                        create: {
                            id: user.id,
                            blacklisted: false
                        }
                    });
                    const embed = new EmbedBuilder()
                        .setTitle("Usunięto z blacklisty.")
                        .setDescription(`Usunięto ${user} (ID: ${user.id}) z blacklisty!`)
                        .setColor(0x00FF00)
                        .setTimestamp(new Date());
                    await interaction.followUp({ embeds: [embed] });
                }
                break;
            case "sprawdz":
                let embed = new EmbedBuilder()
                if (guild) {
                    const dbGuild = await database.guild.upsert({
                        where: {
                            id: guild
                        },
                        update: {},
                        create: {
                            id: guild,
                        }
                    });
                    embed = embed
                        .setTitle(dbGuild ? "Jest na blackliście." : "Nie jest na blackliście.")
                        .setDescription(`Serwer ${guild} ${dbGuild?.blacklisted ? "" : "nie"} znajduje się na blackliście!`)
                        .setColor(dbGuild?.blacklisted ? 0xFF0000 : 0x00FF00)
                        .setTimestamp(new Date());
                } else if (user) {
                    const dbUserUh = await database.user.upsert({
                        where: {
                            id: user.id
                        },
                        update: {},
                        create: {
                            id: user.id,
                        }
                    });
                    embed = embed
                        .setTitle(dbUserUh ? "Jest na blackliście." : "Nie jest na blackliście.")
                        .setDescription(`${user} ${dbUserUh?.blacklisted ? "" : "nie"} znajduje się na blackliście!`)
                        .setColor(dbUserUh?.blacklisted ? 0xFF0000 : 0x00FF00)
                        .setTimestamp(new Date());
                }
                await interaction.followUp({ embeds: [embed] });
        }
        
	}
};