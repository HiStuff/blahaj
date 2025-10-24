import {
	Client,
	Events,
	GuildEmoji,
	GuildMember,
	Message,
	MessageReaction,
	MessageReactionEventDetails,
	PartialMessageReaction,
	PartialUser,
	ReactionEmoji,
	User,
} from "discord.js";
import { client, database } from "../fembot.js";

export default {
	name: Events.MessageReactionAdd,
	once: false,
	async execute(
		reaction: MessageReaction | PartialMessageReaction,
		user: User | PartialUser,
		details: MessageReactionEventDetails,
	) {
		if (reaction.message.author?.id == "1165643083535364230") {
			if (reaction.message.deletable) {
				await reaction.message.delete();
			}
		}
		if (user.id == "1213541885403205693" && reaction.emoji.name == "🗑️") {
			if (reaction.message.deletable) {
				await reaction.message.delete();
			}
		}
	},
};
