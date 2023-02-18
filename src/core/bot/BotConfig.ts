import dotenv from 'dotenv';

export interface BotConfig {
	DISCORD_CLIENT_TOKEN: string|undefined
	DB_HOST: string|undefined
	DB_PORT: number|undefined
	DB_USER: string|undefined
	DB_PASSWORD: string|undefined
	DB_NAME: string|undefined
}

export function loadConfig(): BotConfig {
	dotenv.config();
	return {
		DISCORD_CLIENT_TOKEN: process.env.DISCORD_CLIENT_TOKEN,
		DB_HOST: process.env.DB_HOST,
		DB_PORT: Number.parseInt(process.env.DB_PORT || '0'),
		DB_USER: process.env.DB_USER,
		DB_PASSWORD: process.env.DB_PASSWORD,
		DB_NAME: process.env.DB_NAME,
	};
}