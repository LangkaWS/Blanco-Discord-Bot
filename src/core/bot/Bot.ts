import { Client } from 'discord.js';
import { CommandManager } from '../../commands/CommandManager';
import * as errorUtils from '../utils/error';

export class Bot {

	public readonly client: Client;

	constructor(client: Client) {
		this.client = client;
	}

	public async init(): Promise<void> {
		try {
			// Register commands
			await CommandManager.registerAllCommands(this.client);
		} catch (error) {
			errorUtils.handleFatalError('Error while registering commands', error);
		}
	}

}