import { ButtonStyle, ChatInputCommandInteraction } from 'discord.js';
import { BotBaseButtonMessageBuilder } from './BotBaseButtonMessageBuilder';
import { BotButton } from '../BotButton';

export class BotYesNoButtonMessageBuilder extends BotBaseButtonMessageBuilder {

	constructor(interaction: ChatInputCommandInteraction) {

		super(interaction);

		const yesButton = new BotButton()
			.setCustomId('yes')
			.setLabel('Oui')
			.setStyle(ButtonStyle.Success);

		const noButton = new BotButton()
			.setCustomId('no')
			.setLabel('Non')
			.setStyle(ButtonStyle.Danger);

		this._buttons.push(yesButton, noButton);

	}

}