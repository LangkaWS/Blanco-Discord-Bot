import { ChatInputCommandInteraction, SlashCommandSubcommandBuilder } from 'discord.js';
import Birthday from '../../../core/database/botDatabase/models/Birthday';
import { BotEmbed } from '../../../core/messages/BotEmbed';
import { BotErrorEmbed } from '../../../core/messages/BotErrorEmbed';
import { BotSuccessEmbed } from '../../../core/messages/BotSuccessEmbed';
import { BotMessageBuilder } from '../../../core/messages/builders/BotMessageBuilder';
import { handleError } from '../../../core/utils/error';
import { ISubCommand } from '../../ISubCommand';

async function executeSubcommand(interaction: ChatInputCommandInteraction): Promise<void> {

	let replyEmbed: BotEmbed;
	let replyMessage: string;

	const guildId = interaction.guildId;
	const userId = interaction.user.id;

	// Check if the interaction has been executed in a guild
	if (!guildId) {
		replyEmbed = new BotErrorEmbed().setDescription('Serveur non trouvé');
		return;
	}

	const birthdays: Array<Birthday> = [];

	const showAllOption = interaction.options.getBoolean('tous');
	const userOption = interaction.options.getUser('utilisateur');

	try {

		if (showAllOption) {

			// Get all birthdays and prepare reply message
			birthdays.push(...await Birthday.getAll(guildId));
			replyMessage = birthdays.length
				? `Voici les anniversaires programmés : ${birthdays.map(birthday => `\n\r- <@${birthday.userId}> : ${birthday.day}/${birthday.month}`)}`
				: 'Aucun anniversaire enregistré';

		} else {

			// Get chosen member birthday or his own birthday and prepare reply message
			const birthday = await Birthday.getById(guildId, userOption?.id || userId);

			if (birthday) {
				replyMessage = `${userOption ? `L'anniversaire de <@${birthday.userId}>` : 'Ton anniversaire'} est programmé au : ${birthday.day}/${birthday.month}`;
			} else {
				replyMessage = 'Aucun anniversaire enregistré.';
			}

		}

	} catch (error) {

		replyEmbed = handleError('Error while accessing data', error, 'Une erreur est survenue lors de l\'accès aux données');
		return;

	}

	replyEmbed = new BotSuccessEmbed().setDescription(replyMessage);

	new BotMessageBuilder(interaction)
		.addEmbed(replyEmbed)
		.build()
		.reply(interaction);

}

const subcommand = {
	name: 'afficher',
	description: 'afficher les anniversaires',
	userOption: {
		name: 'utilisateur',
		description: 'afficher l\'anniversaire d\'un autre utilisateur du serveur',
		required: false,
	},
	showAllOption: {
		name: 'tous',
		description: 'afficher les anniversaires de tous les utilisateurs du serveur',
		required: false,
	},
};

export const subcommandInfo: ISubCommand = {
	slashCommandSubcommandBuilder: new SlashCommandSubcommandBuilder()
		.setName(subcommand.name)
		.setDescription(subcommand.description)
		.addUserOption(option =>
			option
				.setName(subcommand.userOption.name)
				.setDescription(subcommand.userOption.description)
				.setRequired(subcommand.userOption.required))
		.addBooleanOption(option =>
			option
				.setName(subcommand.showAllOption.name)
				.setDescription(subcommand.showAllOption.description)
				.setRequired(subcommand.showAllOption.required)),
	executeSubcommand,
};