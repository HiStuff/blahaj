import { Client, Events, Message } from "discord.js";

export default {
	name: Events.MessageCreate,
	once: false,
	async execute(message: Message) {
		if (
			message.guildId == "1371509532878049311" &&
			message.content.startsWith("!v") &&
			message.member?.roles.cache.has("1397677659307376640")
		) {
			const member = message.mentions.members?.first();
			if (member) {
				if (message.channel.isSendable()) {
					await message.channel.send(`
════════════════════════════
︶⊹︶︶୨୧︶︶⊹︶︶⊹︶︶୨୧︶︶⊹︶︶⊹︶

࿐ ࿔: TWOJA WERYFIKACJA ZOSTAŁA ZAAKCEPTOWANA! ˖࿐:

${member}

Bardzo byśmy prosili o :

<:krecha:1395936235826057328>  Zaznaczenie <#1395865561203867678>

<:krecha:1395936235826057328> Przeczytanie <#1405147760621256724>

<:krecha:1395936235826057328> Jeśli chcesz to ustawienie sobie koloru twojej nazwy na <#1403111234190184469>

Jeśli chcesz nas wesprzeć możesz ustawić nasz tag który mamy na serwerze lub dać nam boosta/boosty możesz przeczytać sobie jakie są korzyści z boostowania nas jest od tego kanał <#1400235770832228454> oczywiście nie zmuszamy lecz jak będziesz chciał/chciała będzie nam bardzo miło 

Życzymy Tobie Miłego Pobytu na Serwerku! :3

Mamy nadzieję że zostaniesz z nami na dłużej i że nie pożegnamy się tak szybko ^^

︶⊹︶︶୨୧︶︶⊹︶︶⊹︶︶୨୧︶︶⊹︶︶⊹︶　
════════════════════════════ 
					`);
					await message.react("✅");
				} else {
					await message.react("❌");
				}
			}
		}
	},
};
