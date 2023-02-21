import { ChatInputCommandInteraction, DiscordjsError, SlashCommandSubcommandBuilder } from 'discord.js';
import Birthday from '../../../core/database/botDatabase/models/Birthday';
import { BotEmbed } from '../../../core/messages/BotEmbed';
import { BotErrorEmbed } from '../../../core/messages/BotErrorEmbed';
import { BotSuccessEmbed } from '../../../core/messages/BotSuccessEmbed';
import { BotMessageBuilder } from '../../../core/messages/builders/BotMessageBuilder';
import { BotYesNoButtonMessageBuilder } from '../../../core/messages/builders/BotYesNoButtonMessageBuilder';
import { handleError } from '../../../core/utils/error';
import BirthdayLibrary from '../../../lib/Birthday';
import { ISubCommand } from '../../ISubCommand';

async function executeSubcommand(interaction: ChatInputCommandInteraction): Promise<void> {

	let replyEmbed: BotEmbed;

	const guildId = interaction.guildId;
	const userId = interaction.user.id;

	// Check if the interaction has been executed in a guild
	if (!guildId) {
		replyEmbed = new BotErrorEmbed().setDescription('Serveur non trouvé');
		return;
	}

	let birthday: Birthday|null;

	// Get member's birthday
	try {

		birthday = await Birthday.getById(guildId, userId);

	} catch (error) {

		replyEmbed = handleError('Error while accessing data', error, 'Une erreur est survenue lors de l\'accès aux données');
		return;

	}

	// If birthday is found, ask confirmation
	if (birthday) {

		const msgAskConfirmation = `Ton anniversaire est actuellement programmé au ${birthday.day}/${birthday.month}. Veux-tu vraiment le supprimer ?`;

		const botReply = new BotYesNoButtonMessageBuilder(interaction)
			.setEmbed(new BotEmbed().setDescription(msgAskConfirmation))
			.build();

		let userReply;

		try {

			userReply = await botReply.replyAndAwaitOneInteraction(interaction);

		} catch (error) {

			if (error instanceof DiscordjsError && error.code === 'InteractionCollectorError') {
				replyEmbed = new BotErrorEmbed().setDescription('Tu as mis trop de temps à répondre. L\'interaction est annulée.');
				return;
			}

		}

		if (userReply?.customId === 'yes') {

			replyEmbed = await BirthdayLibrary.removeBirthday(guildId, userId);

		} else {

			replyEmbed = new BotSuccessEmbed().setDescription('Ton anniversaire n\'a pas été supprimé.');

		}

	} else {
		replyEmbed = new BotErrorEmbed().setDescription('Aucun anniversaire à supprimer.');
	}

	new BotMessageBuilder(interaction)
		.addEmbed(replyEmbed)
		.build()
		.reply(interaction);

}

export const subcommandInfo: ISubCommand = {
	slashCommandSubcommandBuilder: new SlashCommandSubcommandBuilder()
		.setName('retirer')
		.setDescription('retirer anniversaire'),
	executeSubcommand,
};