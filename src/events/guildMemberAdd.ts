import { Client, Events, GuildMember } from "discord.js";
import { client, database } from "../fembot.js";

export default {
	name: Events.GuildMemberAdd,
	once: true,
	async execute(member: GuildMember) {
		await database.user.upsert({
			where: {
				id: member.id,
			},
			create: {
				id: member.id,
			},
			update: {},
		});
	},
};
