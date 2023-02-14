import { SlashCommandBuilder, SlashCommandSubcommandsOnlyBuilder, CommandInteraction } from 'discord.js';

export interface ICommand {

	slashCommandBuilder: SlashCommandBuilder|SlashCommandSubcommandsOnlyBuilder;

	executeCommand: (interaction: CommandInteraction) => Promise<void>;
}