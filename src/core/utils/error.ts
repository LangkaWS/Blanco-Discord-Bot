import { CommandInteraction } from 'discord.js';
import { BotErrorEmbed } from '../messages/BotErrorEmbed';

/**
 * Handle fatal error and exit process
 * @param message the message to display
 * @param error
 */
export function handleFatalError(message: string, error: any) {
	handleError(message, error);
	process.exit(1);
}

/**
 * Handle the error with logging the error
 * @param message the message to display
 * @param error
 */
export function handleError(message: string, error: any) {
	console.error((new Date()).toLocaleString());
	console.error('❌ ', message);
	console.error(error);
}

/**
 * Reply to an interaction with an error message
 * @param interaction the interaction to reply
 * @param message the message to send
 */
export async function replyErrorMessage(interaction: CommandInteraction, message: string) {
	await interaction.reply({
		embeds: [new BotErrorEmbed(message)],
		ephemeral: true,
	});
}