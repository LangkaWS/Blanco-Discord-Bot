import { Client } from 'discord.js';
import { Bot } from './Bot';
import { loadConfig } from './BotConfig';
import * as errorUtils from '../utils/error';

export const botConfig = loadConfig();

async function main(): Promise<void> {

	const client = new Client(
		{
			intents: [],
		},
	);

	try {
		await client.login(botConfig.DISCORD_CLIENT_TOKEN);
		console.log('✔️ Bot successfully logged in');
	} catch (error) {
		errorUtils.handleFatalError('Error while logging in bot', error);
	}

	client.on('ready', async () => {

		const bot = new Bot(client);
		try {
			await bot.init();
			console.log('✔️ Bot initialized successfully');
		} catch (error) {
			errorUtils.handleFatalError('Error while initializing bot', error);
		}

	});

}

main();