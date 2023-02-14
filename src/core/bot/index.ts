import { Client } from 'discord.js';
import { Bot } from './Bot';
import { loadConfig } from './BotConfig';

export const botConfig = loadConfig();

async function main(): Promise<void> {

	const client = new Client(
		{
			intents: [],
		},
	);

	try {
		await client.login(botConfig.DISCORD_CLIENT_TOKEN);

		client.on('ready', () => {
			console.log((new Date()).toLocaleString());
			console.log('Blanco is ready to work!');
		});

		const bot = new Bot(client);
		await bot.init();
	} catch (error) {
		console.log(error);
	}

}

main();