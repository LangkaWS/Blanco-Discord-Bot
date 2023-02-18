import { IntentsBitField } from 'discord.js';

export abstract class Intents {
	static readonly LIST =
		[
			IntentsBitField.Flags.Guilds,
		];
}