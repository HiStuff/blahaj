import { Client, Events, Message } from 'discord.js';

export default {
	name: Events.MessageCreate,
	once: false,
	async execute(message: Message) {
		if (message.guildId == "1371509532878049311" && message.content.startsWith("!v") && message.member?.roles.cache.has("1397677659307376640")) {
			const member = message.mentions.members?.first()
			if (member) {
				if (member.roles.cache.has("1395924643038367744")) {
					await member.roles.remove("1395924643038367744");
				} else {
					await message.reply("Użytkownik nie miał roli weryfikacja słodziaka. Trochę dziwne co nie?");
				}
				await member.roles.add("1375814858217357395");
				if (message.channel.isSendable()) {
					await message.channel.send(`
════════════════════════════
︶⊹︶︶୨୧︶︶⊹︶︶⊹︶︶୨୧︶︶⊹︶︶⊹︶

࿐ ࿔: TWOJA WERYFIKACJA ZOSTAŁA ZAAKCEPTOWANA! ˖࿐:

${member}

Bardzo byśmy prosili o :

:krecha:  Zaznaczenie ⁠🌵﹒self-role﹒୧

:krecha: Przeczytanie ⁠☆﹒—﹒regulamin﹒⟢﹒🌱 

:krecha: Przywitanie się na ⁠☆﹒—﹒ogólny﹒⟢﹒🍡 

:krecha: Jeśli chcesz to ustawienie sobie koloru twojej nazwy na ⁠⊕﹒˚🌾﹕▧﹒kolor-nicku 

Jeśli chcesz nas wesprzeć możesz ustawić nasz tag który mamy na serwerze lub dać nam boosta/boosty możesz przeczytać sobie jakie są korzyści z boostowania nas jest od tego kanał ⁠꒰💦ㆍboosty-infoㆍ⸝⸝ oczywiście nie zmuszamy lecz jak będziesz chciał/chciała będzie nam bardzo miło 

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
	}
};