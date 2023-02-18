import { CommandInteraction, SlashCommandSubcommandBuilder } from 'discord.js';

export interface ISubCommand {

	slashCommandSubCommandBuilder: SlashCommandSubcommandBuilder;

	executeSubCommand: (interaction: CommandInteraction) => Promise<void>;

}