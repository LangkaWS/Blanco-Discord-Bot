import { Client } from 'discord.js';
import { Bot } from './Bot';
import { loadConfig } from './BotConfig';
import * as errorUtils from '../utils/error';
import { Intents } from '../Intents';

export const botConfig = loadConfig();
export let botClient: Client;

async function main(): Promise<void> {

	const client = new Client(
		{
			intents: Intents.LIST,
		},
	);

	try {
		await client.login(botConfig.DISCORD_CLIENT_TOKEN);
		console.log('✔️ Bot successfully logged in');
	} catch (error) {
		errorUtils.handleFatalError('Error while logging in bot', error);
	}

	client.on('ready', async () => {
		console.log('ready');
	});

	const bot = new Bot(client);
	try {
		console.log('initializing...');
		await bot.init();
		console.log('✔️ Bot initialized successfully');
	} catch (error) {
		errorUtils.handleFatalError('Error while initializing bot', error);
	}

	botClient = client;

}

main();