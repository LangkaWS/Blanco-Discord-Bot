import { ChatInputCommandInteraction, CommandInteraction, SlashCommandBuilder } from 'discord.js';
import { readdirSync } from 'fs';
import { BotErrorEmbed } from '../../core/messages/BotErrorEmbed';
import { BotMessageBuilder } from '../../core/messages/builders/BotMessageBuilder';
import { ICommand } from '../ICommand';
import { ISubCommand } from '../ISubCommand';

/**
 * Execute the command or the subcommand if there is one
 * @param commandInteraction
 */
async function executeCommand(commandInteraction: CommandInteraction): Promise<void> {

	const interaction = commandInteraction as ChatInputCommandInteraction;

	const subcommand = interaction.options.getSubcommand();
	const index = subcommands.map(sc => sc.slashCommandSubcommandBuilder.name).indexOf(subcommand);

	if (index < 0) {
		new BotMessageBuilder(interaction)
			.addEmbed(new BotErrorEmbed().setDescription(`La commande ${interaction.commandName}/${subcommand} n'existe pas`))
			.build()
			.reply(interaction);
		return;
	}

	await subcommands[index].executeSubcommand(interaction);

}

/**
 * Build the command
 * @returns the command
 */
function buildCommand(): SlashCommandBuilder {
	const command = new SlashCommandBuilder()
		.setName('anniversaires')
		.setDescription('Gère les anniversaires.');
	const subcommands = getSubcommands();
	subcommands.forEach(async subcommandName => {
		const subcommand = await loadSubcommand(subcommandName);
		if (subcommand) {
			command.addSubcommand(subcommand.slashCommandSubcommandBuilder);
		}
	});
	return command;
}

const subcommands: Array<ISubCommand> = [];

/**
 * Get the subcommand names
 * @returns the names of the subcommands
 */
function getSubcommands(): Array<string> {
	const subcommandFiles = readdirSync(`${__dirname}/subcommands`);

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
async function loadSubcommand(subcommandName: string): Promise<ISubCommand|undefined> {

	const subcommandInfo = (await import(`${__dirname}/subcommands/${subcommandName}.js`)).subcommandInfo as ISubCommand;

	if (!subcommandInfo || !subcommandInfo.slashCommandSubcommandBuilder) {
		console.error(`Command ${subcommandInfo} is not a subcommand`);
		return;
	}

	subcommands.push(subcommandInfo);

	return subcommandInfo;

}


export const commandInfo: ICommand = {
	slashCommandBuilder: buildCommand(),
	executeCommand,
	additionalPermissions: [],
	unnecessaryPermissions: [],
};