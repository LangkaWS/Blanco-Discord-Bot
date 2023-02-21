import { ChatInputCommandInteraction, SlashCommandSubcommandBuilder } from 'discord.js';

export interface ISubCommand {

	slashCommandSubcommandBuilder: SlashCommandSubcommandBuilder;

	executeSubcommand: (interaction: ChatInputCommandInteraction) => Promise<void>;

}