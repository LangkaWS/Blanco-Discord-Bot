import dotenv from 'dotenv';

export interface BotConfig {
	DISCORD_CLIENT_TOKEN: string|undefined
}

export function loadConfig(): BotConfig {
	dotenv.config();
	return {
		DISCORD_CLIENT_TOKEN: process.env.DISCORD_CLIENT_TOKEN,
	};
}