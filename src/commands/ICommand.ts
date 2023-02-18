import { SlashCommandBuilder, SlashCommandSubcommandsOnlyBuilder, CommandInteraction, PermissionsBitField } from 'discord.js';

export interface ICommand {

	slashCommandBuilder: SlashCommandBuilder|SlashCommandSubcommandsOnlyBuilder;

	executeCommand: (interaction: CommandInteraction) => Promise<void>;

	additionalPermissions?: Array<keyof typeof PermissionsBitField.Flags>;

	unnecessaryPermissions?: Array<keyof typeof PermissionsBitField.Flags>;
}