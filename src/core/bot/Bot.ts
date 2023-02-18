import { Client } from 'discord.js';
import { CommandManager } from '../../commands/CommandManager';
import { BotDatabase } from '../database/botDatabase/BotDatabase';
import * as errorUtils from '../utils/error';

export class Bot {

	public readonly client: Client;
	public readonly botDatabase: BotDatabase;

	constructor(client: Client) {
		this.client = client;
		this.botDatabase = new BotDatabase();
	}

	public async init(): Promise<void> {
		try {
			// Init database
			await this.botDatabase.init();
		} catch (error) {
			errorUtils.handleFatalError('Error while initializing database', error);
		}

		try {
			// Register commands
			await CommandManager.register(this.client);
		} catch (error) {
			errorUtils.handleFatalError('Error while registering commands', error);
		}
	}

}