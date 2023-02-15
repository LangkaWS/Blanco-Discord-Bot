import { ApplicationCommand, Client } from 'discord.js';
import { readdirSync } from 'fs';
import { readdir } from 'fs/promises';
import { ICommand } from './ICommand';
import * as errorUtils from '../core/utils/error';

export class CommandManager {

	static commands = new Map<string, ICommand>();
	static commandInstances = new Map<string, ApplicationCommand>();

	/**
	 * Register all commands
	 * @param client
	 */
	public static async registerAllCommands(client: Client) {

		// Get application commands
		try {
			if (!client.application) throw new Error('Client application not found');
			const commands = await client.application.commands.fetch();
			// Store command instances
			if (commands) {
				for (const command of commands) {
					CommandManager.commandInstances.set(command[1].name, command[1]);
				}
			}
		} catch (error) {
			errorUtils.handleFatalError('Error while fetching commands', error);
		}

		const commandsToRegister: Promise<void>[] = [];

		try {
			// Get commands to register
			const commandsFromFiles = await CommandManager.getAllCommandsFromFiles();

			// Register new or update exsting commands
			for (const commandFromFile of commandsFromFiles) {
				CommandManager.setCommandDefaultParameters(commandFromFile);
				const registeredCommand = CommandManager.commandInstances.get(commandFromFile.slashCommandBuilder.name);
				commandsToRegister.push(CommandManager.createOrUpdateCommand(client, registeredCommand, commandFromFile));
				CommandManager.commands.set(commandFromFile.slashCommandBuilder.name, commandFromFile);
			}
		} catch (error) {
			errorUtils.handleFatalError('Error while getting commands', error);
		}

		try {
			await Promise.all(commandsToRegister);
		} catch (error) {
			errorUtils.handleFatalError('Error while registering commands', error);
		}

		// Delete commands that have no file
		const commandsToDelete: Promise<void>[] = [];
		for (const command of CommandManager.commandInstances.values()) {
			if (!CommandManager.commands.has(command.name)) {
				commandsToDelete.push(CommandManager.deleteCommand(client, command));
			}
		}
		try {
			await Promise.all(commandsToDelete);
		} catch (error) {
			errorUtils.handleFatalError('Error while deleting commands', error);
		}

	}

	/**
	 * Create or update command if needed
	 * @param client
	 * @param command
	 * @param commandInfo
	 * @private
	 */
	private static async createOrUpdateCommand(client: Client, registeredCommand: ApplicationCommand|undefined, commandToRegister: ICommand): Promise<void> {

		try {

			if (registeredCommand) {

				const hasCommandChanged = CommandManager.hasCommandChanged(commandToRegister, registeredCommand);

				if (!hasCommandChanged) return;

				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
				await client.application!.commands.edit(registeredCommand.id, commandToRegister.slashCommandBuilder.toJSON());
				console.log(`Global command '${commandToRegister.slashCommandBuilder.name}' edited`);

			} else {

				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
				await client.application!.commands.create(commandToRegister.slashCommandBuilder.toJSON());
				console.log(`Global command '${commandToRegister.slashCommandBuilder.name}' created`);

			}

		} catch (error) {
			errorUtils.handleFatalError('Error while registering commands', error);
		}

	}

	/**
	 * Delete command
	 * @param client
	 * @param command
	 */
	private static async deleteCommand(client: Client, command: ApplicationCommand): Promise<void> {
		try {
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			await client.application!.commands.delete(command.id);
			console.log(`Global command '${command.name}' deleted`);
		} catch (error) {
			errorUtils.handleFatalError('Error while deleting commands', error);
		}
	}

	/**
	 * Get the list of commands info
	 * @returns commands info
	 * @private
	 */
	private static async getAllCommandsFromFiles(): Promise<ICommand[]> {

		const commands: Promise<ICommand[]>[] = [];

		// Get categories
		try {

			const categories = await readdir(`${__dirname}`);
			for (const category of categories) {
				if (category.endsWith('.js') || category.endsWith('.js.map')) {
					continue;
				}

				// Get commands of the category
				commands.push(this.getCommandsFromCategory(category));
			}

		} catch (error) {
			errorUtils.handleFatalError('Error while reading commands directory', error);
		}

		let commandsToRegister:ICommand[][] = [];
		try {
			commandsToRegister = await Promise.all(commands);
		} catch (error) {
			errorUtils.handleFatalError('Error while importing commands info', error);
		}
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
				console.error(`Command ${category}/${commandFile} is not a slash command`);
				continue;
			}

			commands.push(commandInfo);

		}

		return commands;
	}

	/**
	 * Check if a command has changed
	 * @param commandInfo
	 * @param command
	 * @returns if command has changed
	 * @private
	 */
	private static hasCommandChanged(commandInfo: ICommand, command: ApplicationCommand): boolean {
		return (
			// Description change
			command.description !== commandInfo.slashCommandBuilder.description
		);
	}

	/**
	 * Set command with default parameters
	 * @param commandInfo
	 * @private
	 */
	private static setCommandDefaultParameters(commandInfo: ICommand): void {
		commandInfo.slashCommandBuilder.setDMPermission(false);
	}

}