import { ApplicationCommand, Client } from 'discord.js';
import { readdirSync } from 'fs';
import { readdir } from 'fs/promises';
import { ICommand } from './ICommand';

export class CommandManager {

	static commands = new Map<string, ICommand>();
	static commandInstances = new Map<string, ApplicationCommand>();

	/**
	 * Register all commands
	 */
	public static async registerAllCommands(client: Client) {
		// Get application commands
		const commands = (await client.application!.commands.fetch());
		// Get commands to register
		const commandsToRegister = await this.getAllCommands();

		// Store command instances
		if (commands) {
			for (const command of commands) {
				CommandManager.commandInstances.set(command[1].name, command[1]);
			}
		}

		const commandsToCheck = [];

		for (const commandToRegister of commandsToRegister) {
			this.setCommandDefaultParameters(commandToRegister);
			commandsToCheck.push(this.createOrUpdateCommand(client, CommandManager.commandInstances.get(commandToRegister.slashCommandBuilder.name), commandToRegister));
			CommandManager.commands.set(commandToRegister.slashCommandBuilder.name, commandToRegister);
		}
		await Promise.all(commandsToCheck);
		await this.deleteCommands(client);
	}

	private static async deleteCommands(client: Client): Promise<void> {
		for (const command of CommandManager.commandInstances.values()) {
			if (!CommandManager.commandInstances.has(command.name)) {
				await client.application!.commands.delete(command.id);
				console.log(`Global command '${command.name}' deleted`);
			}
		}
	}

	/**
	 * Set command with default parameters
	 * @param commandInfo
	 * @private
	 */
	private static setCommandDefaultParameters(commandInfo: ICommand): void {
		commandInfo.slashCommandBuilder.setDMPermission(false);
	}

	/**
	 * Create or update command if needed
	 * @param client
	 * @param command
	 * @param commandInfo
	 * @private
	 */
	private static async createOrUpdateCommand(client: Client, command: ApplicationCommand|undefined, commandInfo: ICommand): Promise<void> {
		const hasCommandChanged = command ? CommandManager.hasCommandChanged(commandInfo, command) : true;

		if (!hasCommandChanged) return;

		try {
			if (command) {
				await client.application!.commands.edit(command.id, commandInfo.slashCommandBuilder.toJSON());
				console.log(`Global command '${commandInfo.slashCommandBuilder.name}' edited`);
			} else {
				await client.application!.commands.create(commandInfo.slashCommandBuilder.toJSON());
				console.log(`Global command '${commandInfo.slashCommandBuilder.name}' created`);
			}
		} catch (error) {
			console.log(error);
			// Do not start the bot if commands cannot be registered
			process.exit(1);
		}

	}

	/**
	 * Check if a command has changed
	 * @param commandInfo
	 * @param command
	 * @returns if command has changed
	 * @private
	 */
	private static hasCommandChanged(commandInfo: ICommand, command: ApplicationCommand): boolean {
		let change = false;

		// Name change
		change ||= command.name !== commandInfo.slashCommandBuilder.name;

		// Description change
		change ||= command.description !== commandInfo.slashCommandBuilder.description;

		return change;
	}

	/**
	 * Get the list of commands info
	 * @returns commands info
	 * @private
	 */
	private static async getAllCommands(): Promise<ICommand[]> {
		// Get categories
		const categories = await readdir(`${__dirname}`);
		const commands = [];
		for (const category of categories) {
			if (category.endsWith('.js') || category.endsWith('.js.map')) {
				continue;
			}

			// Get commands of the category
			commands.push(this.getCommandsFromCategory(category));
		}
		const commandsToRegister = await Promise.all(commands);
		return commandsToRegister.flat();
	}

	/**
	 * Get all commands info from a category
	 * @param category
	 * @returns commands info from the category
	 * @private
	 */
	private static async getCommandsFromCategory(category: string): Promise<ICommand[]> {
		const commands: ICommand[] = [];
		// Get command files
		const commandFiles = readdirSync(`${__dirname}/${category}`).filter(command => command.endsWith('.js'));

		for (const commandFile of commandFiles) {
			// Get command info
			const commandInfo = (await import(`${__dirname}/${category}/${commandFile}`)).commandInfo as ICommand;

			if (!commandInfo || !commandInfo.slashCommandBuilder) {
				console.error(`Command ${category}/${commandFile} is not a slash command.`);
				continue;
			}

			commands.push(commandInfo);

		}

		return commands;
	}

}