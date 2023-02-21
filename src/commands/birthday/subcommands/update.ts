import { ChatInputCommandInteraction, DiscordjsError, SlashCommandSubcommandBuilder } from 'discord.js';
import Birthday from '../../../core/database/botDatabase/models/Birthday';
import { BotMessageBuilder } from '../../../core/messages/builders/BotMessageBuilder';
import { BotSuccessEmbed } from '../../../core/messages/BotSuccessEmbed';
import { handleError } from '../../../core/utils/error';
import { ISubCommand } from '../../ISubCommand';
import { BotEmbed } from '../../../core/messages/BotEmbed';
import { BotErrorEmbed } from '../../../core/messages/BotErrorEmbed';
import BirthdayLibrary from '../../../lib/Birthday';
import { BotYesNoButtonMessageBuilder } from '../../../core/messages/builders/BotYesNoButtonMessageBuilder';

async function executeSubcommand(interaction: ChatInputCommandInteraction): Promise<void> {

	let replyEmbed: BotEmbed;

	const guildId = interaction.guildId;
	const userId = interaction.user.id;

	// Check if the interaction has been executed in a guild
	if (!guildId) {
		replyEmbed = new BotErrorEmbed().setDescription('Serveur non trouvé');
		return;
	}

	// Check required options
	const dayOption = interaction.options.getInteger(subcommand.dayOption.name);
	const monthOption = interaction.options.getInteger(subcommand.monthOption.name);

	if (dayOption === null) {
		replyEmbed = new BotErrorEmbed().setDescription('Option \'jour\' manquante');
		return;
	}

	if (monthOption === null) {
		replyEmbed = new BotErrorEmbed().setDescription('Option \'jour\' manquante');
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

	// If birthday is found, ask to edit else ask to create a new one
	if (birthday) {

		const msgAskConfirmation = `Ton anniversaire est actuellement programmé au ${birthday.day}/${birthday.month}. Veux-tu le modifier ?`;

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

			replyEmbed = await BirthdayLibrary.editBirthday(dayOption, monthOption, guildId, userId);

		} else {

			replyEmbed = new BotSuccessEmbed().setDescription('Ton anniversaire n\'a pas été mis à jour.');

		}

	} else {

		const msgAskCreate = 'Ton anniversaire n\'est pas encore enregistré. Veux-tu le créer ?';

		const botReply = new BotYesNoButtonMessageBuilder(interaction)
			.setEmbed(new BotEmbed().setDescription(msgAskCreate))
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

			replyEmbed = await BirthdayLibrary.createBirthday(dayOption, monthOption, guildId, userId);

		} else {

			replyEmbed = new BotSuccessEmbed().setDescription('Ton anniversaire n\'a pas été créé.');

		}

	}

	new BotMessageBuilder(interaction)
		.addEmbed(replyEmbed)
		.build()
		.reply(interaction);

}

const subcommand = {
	name: 'modifier',
	description: 'modifier un anniversaire',
	dayOption: {
		name: 'jour',
		description: 'jour',
		required: true,
		minValue: 1,
		maxValue: 31,
	},
	monthOption: {
		name: 'mois',
		description: 'mois',
		required: true,
		minValue: 1,
		maxValue: 12,
	},
};

export const subcommandInfo: ISubCommand = {
	slashCommandSubcommandBuilder: new SlashCommandSubcommandBuilder()
		.setName(subcommand.name)
		.setDescription(subcommand.description)
		.addIntegerOption(option =>
			option
				.setName(subcommand.dayOption.name)
				.setDescription(subcommand.dayOption.description)
				.setRequired(subcommand.dayOption.required)
				.setMinValue(subcommand.dayOption.minValue)
				.setMaxValue(subcommand.dayOption.maxValue),
		)
		.addIntegerOption(option =>
			option
				.setName(subcommand.monthOption.name)
				.setDescription(subcommand.monthOption.description)
				.setRequired(subcommand.monthOption.required)
				.setMinValue(subcommand.monthOption.minValue)
				.setMaxValue(subcommand.monthOption.maxValue),
		),
	executeSubcommand,
};