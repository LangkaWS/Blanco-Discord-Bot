import { ApplicationCommand, Client, CommandInteraction, GuildChannel, PermissionsBitField, SlashCommandBuilder, SlashCommandSubcommandsOnlyBuilder } from 'discord.js';
import { readdirSync } from 'fs';
import { readdir } from 'fs/promises';
import { ICommand } from './ICommand';
import * as errorUtils from '../core/utils/error';
import { NormalizedObject } from './NormalizedObject';
import { botClient } from '../core/bot';

export class CommandManager {

	static commands = new Map<string, ICommand>();
	static commandInstances = new Map<string, ApplicationCommand>();

	public static async register(client: Client): Promise<void> {
		await CommandManager.registerAllCommands(client);
		CommandManager.manageInteractionCreate(client);
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

				const hasCommandChanged = CommandManager.hasCommandChanged(registeredCommand, commandToRegister.slashCommandBuilder);

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
	 * @private
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
			categories.forEach(category => {
				if (category.endsWith('.js') || category.endsWith('.js.map')) return;

				// Get commands of the category
				commands.push(CommandManager.getCommandsFromCategory(category));
			});

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
	 * Check if array from command to register is the same as in registered command
	 * @param registeredArray the array of registered command
	 * @param arrayToRegister the array of command to register
	 * @returns `true` is array has changed
	 * @private
	 */
	private static hasArrayChanged(registeredArray: Array<object>, arrayToRegister: Array<object>): boolean {

		// Normalize property names
		const normalizedRegisteredArray = registeredArray.map(el => CommandManager.normalizePropertyNames(el));
		const normalizedArrayToRegister = arrayToRegister.map(el => CommandManager.normalizePropertyNames(el));

		if (normalizedRegisteredArray.length !== normalizedArrayToRegister.length) {
			return true;
		}

		for (let i = 0; i < normalizedRegisteredArray.length; i++) {

			const obj1 = normalizedRegisteredArray[i];
			const obj2 = normalizedArrayToRegister[i];

			for (const key in obj2) {

				if (Object.prototype.hasOwnProperty.call(obj1, key) && key !== 'defaultpermission') {
					if (Array.isArray(obj1[key]) && Array.isArray(obj2[key])) {
						if (CommandManager.hasArrayChanged(obj1[key], obj2[key])) {
							return true;
						}
						// some props in SlashCommandBuilder are empty arrays while are undefined on ApplicationCommand
					} else if (Array.isArray(obj2[key]) && !obj2[key].length && obj1[key] === undefined) {
						continue;
						// default_permission is deprecated in SlashCommandBuilder but still exists
					} else if (key !== 'defaultpermission' && obj1[key] != obj2[key]) {
						return true;
					}
				}

			}
		}

		return false;

	}

	/**
	 * Check if command to register is the same as registered command
	 * @param registeredCommand the registered command
	 * @param commandtoRegister the command to register
	 * @returns `true` is command has changed
	 * @private
	 */
	private static hasCommandChanged(registeredCommand: ApplicationCommand, commandToRegister: SlashCommandBuilder|SlashCommandSubcommandsOnlyBuilder): boolean {

		// Normalize command property names
		const normalizedRegisteredCommand = CommandManager.normalizePropertyNames(registeredCommand);
		const normalizedCommandToRegister = CommandManager.normalizePropertyNames(commandToRegister);

		// Iterate through command to register because it has less properties that registered command
		const keys2 = Object.keys(normalizedCommandToRegister);

		for (const key of keys2) {

			// If property is not found in registered command
			if (!(key in normalizedRegisteredCommand) && key !== 'defaultpermission') {
				return true;
			}

			if (Array.isArray(normalizedRegisteredCommand[key]) && Array.isArray(normalizedCommandToRegister[key])) {
				if (CommandManager.hasArrayChanged(normalizedRegisteredCommand[key], normalizedCommandToRegister[key])) {
					return true;
				}
				// default_permission is deprecated in SlashCommandBuilder but still exists
			} else if (key !== 'defaultpermission' && normalizedRegisteredCommand[key] != normalizedCommandToRegister[key]) {
				return true;
			}

		}

		return false;

	}

	/**
	 * Set all object properties to lower case and remove underscore
	 * @param obj the object to normalize
	 * @returns the normalized object
	 * @private
	 */
	private static normalizePropertyNames(obj: object): NormalizedObject {

		const normalizedObject: NormalizedObject = {};

		for (const [key, value] of Object.entries(obj)) {
			const normalizedKey = key.toLowerCase().replace(/_/g, '');
			normalizedObject[normalizedKey] = value;
		}

		return normalizedObject;

	}

	/**
	 * Register all commands
	 * @param client
	 * @private
	 */
	private static async registerAllCommands(client: Client):Promise<void> {

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
			commandsFromFiles.forEach(commandFromFile => {

				CommandManager.setCommandDefaultParameters(commandFromFile);

				const registeredCommand = CommandManager.commandInstances.get(commandFromFile.slashCommandBuilder.name);
				commandsToRegister.push(CommandManager.createOrUpdateCommand(client, registeredCommand, commandFromFile));

				CommandManager.commands.set(commandFromFile.slashCommandBuilder.name, commandFromFile);

			});
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
	 * Set command with default parameters
	 * @param commandInfo
	 * @private
	 */
	private static setCommandDefaultParameters(commandInfo: ICommand): void {
		commandInfo.slashCommandBuilder.setDMPermission(false);
	}

	/**
	 * Handle the interaction's command
	 * @param interaction
	 * @private
	 */
	private static async handleCommand(interaction: CommandInteraction): Promise<void> {

		if (!interaction.commandName) return;

		const commandInfo = CommandManager.commands.get(interaction.commandName);
		if (!commandInfo) {
			errorUtils.replyErrorMessage(interaction, 'La commande n\'existe pas');
			return;
		}

		const channelAccess = CommandManager.hasChannelPermissions(commandInfo, interaction.channel as GuildChannel);
		if (channelAccess.length) {
			errorUtils.replyErrorMessage(interaction, `Permissions manquantes: ${channelAccess.join(', ')}`);
			return;
		}

		// log command usage in db
		await commandInfo.executeCommand(interaction);

	}

	/**
	 * Check if the bot has the needed permissions in the channel where the command is executed
	 * @param channel
	 * @returns the list of missing permissions
	 * @private
	 */
	private static hasChannelPermissions(commandInfo: ICommand, channel: GuildChannel): Array<string> {

		const missingPermissions: Array<string> = [];

		const permissions: Array<keyof typeof PermissionsBitField.Flags> = [];

		// Add additional permissions for command
		commandInfo.additionalPermissions?.forEach(permission => {
			if (!permissions.includes(permission)) {
				permissions.push(permission);
			}
		});

		// Remove unnecessary permissions for command
		commandInfo.unnecessaryPermissions?.forEach(permission => {
			const index = permissions.indexOf(permission);
			if (index >= 0) {
				permissions.splice(index, 1);
			}
		});

		permissions.forEach(permission => {
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			if (!channel.permissionsFor(botClient.user!)?.has(PermissionsBitField.Flags[permission])) {
				missingPermissions.push(permission);
			}
		});

		return missingPermissions;

	}

	/**
	 * Manage the slash commands
	 * @param client
	 * @private
	 */
	private static manageInteractionCreate(client: Client): void {
		client.on('interactionCreate', async interaction => {

			if (!interaction.isCommand() || interaction.user.bot) return;

			await CommandManager.handleCommand(interaction);

		});
	}

}