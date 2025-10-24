import { Client, Events } from "discord.js";
import { client } from "../fembot.js";
import { eventsCounter } from "../handler.js";
import config from "../../config.json" with { type: "json" };
import { deployGuild } from "../utils/deploy.js";
import { listen } from "../http/server.js";

export default {
	name: Events.ClientReady,
	once: true,
	execute(readyClient: Client<true>) {
		process.stdout.write("\x1Bc");
		console.log();
		console.log(`   ${client.version.name}`);
		console.log(`   Gotowy jako @${readyClient.user.tag}`);
		console.log(`   🤖 Komendy: ${client.commands.size}`);
		console.log(`   🎉 Eventy: ${eventsCounter}`);
		console.log(`   🔴 Przyciski: ${client.buttons.size}`);
		console.log();
		deployGuild(config.guildId);
		listen();
	},
};
