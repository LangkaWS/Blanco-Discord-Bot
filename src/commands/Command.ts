import { ChatInputCommandInteraction, CommandInteraction, CommandInteractionOption, SlashCommandBuilder } from 'discord.js';
import { readdirSync } from 'fs';
import { BotErrorEmbed } from '../core/messages/BotErrorEmbed';
import { BotMessageBuilder } from '../core/messages/builders/BotMessageBuilder';
import { ICommand } from './ICommand';
import { ISubCommand } from './ISubCommand';

export class Command {

	#commandName: string;
	#commandDescription: string;
	#functionalityName: string;
	#subcommands: Array<ISubCommand> = [];
	#execute: ((interaction: ChatInputCommandInteraction) => void) | undefined;

	constructor(
		functionalityName: string,
		commandName: string,
		commandDescription: string,
		executeFunction?: (interaction: ChatInputCommandInteraction) => void,
	) {
		this.#commandName = commandName;
		this.#commandDescription = commandDescription;
		this.#functionalityName = functionalityName;
		this.#execute = executeFunction;
	}

	get commandInfo(): ICommand {
		return {
			slashCommandBuilder: this.#buildCommand(),
			additionalPermissions: [],
			unnecessaryPermissions: [],
			command: this,
		};
	}

	/**
	 * Build the command by setting name, description, options, etc.
	 */
	#buildCommand(): SlashCommandBuilder {

		const command = new SlashCommandBuilder()
			.setName(this.#commandName)
			.setDescription(this.#commandDescription);

		const subcommands = this.#getSubcommands();

		subcommands.forEach(async subcommandName => {
			const subcommand = await this.#loadSubcommand(subcommandName);
			if (subcommand) {
				command.addSubcommand(subcommand.slashCommandSubcommandBuilder);
			}
		});

		return command;

	}

	/**
	 * Execute the command or the subcommand if there is one
	 * @param commandInteraction
	 */
	async executeCommand(commandInteraction: CommandInteraction): Promise<void> {

		const interaction = commandInteraction as ChatInputCommandInteraction;

		if (Command.#hasOptions(interaction) && Command.#isSubcommand(interaction.options.data[0])) {

			const subcommand = interaction.options.getSubcommand();
			const index = this.#subcommands.map(sc => sc.slashCommandSubcommandBuilder.name).indexOf(subcommand);

			if (index < 0) {
				new BotMessageBuilder(interaction)
					.addEmbed(new BotErrorEmbed().setDescription(`La commande ${interaction.commandName}/${subcommand} n'existe pas`))
					.build()
					.reply(interaction);
				return;
			}

			await this.#subcommands[index].executeSubcommand(interaction);

		} else if (this.#execute !== undefined) {
			this.#execute(interaction);
		}

	}

	/**
	 * Check if the interaction has options
	 * @param interaction
	 */
	static #hasOptions(interaction: ChatInputCommandInteraction): boolean {
		return interaction.options.data.length > 0;
	}

	/**
	 * Check if the option is a subcommand
	 * @param option
	 */
	static #isSubcommand(option: CommandInteractionOption): boolean {
		return option.type === 1;
	}

	/**
	 * Get the subcommand names
	 * @returns the names of the subcommands
	 */
	#getSubcommands(): Array<string> {

		let subcommandFiles: Array<string> = [];

		try {
			subcommandFiles = readdirSync(`${__dirname}/${this.#functionalityName}/subcommands`);
		} catch (error) {
			return subcommandFiles;
		}

		const subcommandNames = [];

		for (const subcommandFile of subcommandFiles) {
			const [subcommandName, subcommandSplit] = subcommandFile.split(/\.(.*)/);

			if (subcommandSplit !== 'js' || subcommandSplit.length !== 2) continue;
			subcommandNames.push(subcommandName);

		}

		return subcommandNames;

	}

	/**
	 * Load the subcommand
	 * @param subcommand the subcommand name
	 * @returns the subcommand
	 */
	async #loadSubcommand(subcommandName: string): Promise<ISubCommand|undefined> {

		const subcommandInfo = (await import(`${__dirname}/${this.#functionalityName}/subcommands/${subcommandName}.js`)).subcommandInfo as ISubCommand;

		if (!subcommandInfo || !subcommandInfo.slashCommandSubcommandBuilder) {
			console.error(`Command ${subcommandInfo} is not a subcommand`);
			return;
		}

		this.#subcommands.push(subcommandInfo);

		return subcommandInfo;

	}

}