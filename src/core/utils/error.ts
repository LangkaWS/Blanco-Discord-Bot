import { BotErrorEmbed } from '../messages/BotErrorEmbed';

/**
 * Handle fatal error and exit process
 * @param message the message to display
 * @param error
 */
export function handleFatalError(message: string, error: unknown) {
	logError(message, error);
	process.exit(1);
}

/**
 * Log an error
 * @param message the message to display
 * @param error
 */
export function logError(message: string, error: unknown) {
	console.error((new Date()).toLocaleString());
	console.error('❌ ', message);
	console.error(error);
}

/**
 * Handle the error by logging it and return en error embed
 * @param errorMessage the error message to log
 * @param error
 * @param embedErrorMessage the error message to send to user
 * @returns the error message embed
 */
export function handleError(errorMessage: string, error: unknown, embedErrorMessage: string) {
	logError(errorMessage, error);
	return new BotErrorEmbed()
		.setDescription(embedErrorMessage);
}