import { EmbedBuilder } from "discord.js";

export enum Error {
	NO_USER_PERMISSIONS = "spierdalaj",
	COMMAND_NO_BOT_PERMISSIONS = "Bot nie ma uprawnień żeby wykonać tą komende!",
	ERROR_WHILE_COLLECTING = "Nastąpił problem podczas czekania na odpowiedź użytkownika.",
	GUILD_IS_NULL = "Podany serwer nie istnieje.",
	USER_IS_NULL = "Użytkownik nie istnieje.",
	USER_NOT_BANNABLE = "Tego użytkownika nie da się zbanować!",
	USER_NOT_KICKABLE = "Tego użytkownika nie da się wyrzucić!",
	USER_NOT_MUTABLE = "Tego użytkownika nie da się wyciszyć!",
	SOMETHING_IS_NULL = "Jakaś zmienna nie istnieje xD", // deprecated
	SOMETHING_WENT_WRONG = "Coś poszło nie tak.",
	CHANNEL_NOT_SENDABLE = "Nie można wysyłać wiadomości na tym kanale!",
	COMMAND_CHANNEL_IS_TEXT = "Nie można wykonać tej komendy na kanale tekstowym!",
	COMMAND_USER_NOT_A_DEVELOPER = "Nie jesteś developerem tego bota więc nie możesz użyć tej komendy!",
	NO_ARGUMENTS_SPECIFIED = "Nie wypełniłeś wymaganych argumentów!",
	USER_BLACKLISTED = "Znajdujesz się na blackliście więc nie możesz wykonać tej akcji!",
	GUILD_BLACKLISTED = "Ten serwer znajduje się na blackliście więc nie możesz mnie tutaj używać!",
	USER_TRIED_TO_BLACKLIST_THEMSELF = "Nie możesz dodać samego siebie do blacklisty!",
	HIDDEN_CODE_IS_DISABLED_ON_THIS_GUILD = "Funkcja Ukrytych Kodów jest wyłączona na tym serwerze.",
	CODE_IS_NULL = "Podany kod nie istnieje.",
}

export function createErrorEmbed(
	text: Error | string,
	date?: Date | number,
): EmbedBuilder {
	return new EmbedBuilder()
		.setTitle("Błąd")
		.setDescription(text)
		.setTimestamp(date || new Date())
		.setColor(0xff0000);
}
