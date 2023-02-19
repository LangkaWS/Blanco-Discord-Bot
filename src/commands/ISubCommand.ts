import { ChatInputCommandInteraction, SlashCommandSubcommandBuilder } from 'discord.js';

export interface ISubCommand {

	slashCommandSubCommandBuilder: SlashCommandSubcommandBuilder;

	executeSubCommand: (interaction: ChatInputCommandInteraction) => Promise<void>;

}