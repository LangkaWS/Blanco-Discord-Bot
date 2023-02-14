import { Client } from 'discord.js';
import { CommandManager } from '../../commands/CommandManager';

export class Bot {

	public readonly client: Client;

	constructor(client: Client) {
		this.client = client;
	}

	public async init(): Promise<void> {
		// Register commands
		await CommandManager.registerAllCommands(this.client);
	}

}