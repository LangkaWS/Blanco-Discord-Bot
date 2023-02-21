import { ChatInputCommandInteraction } from 'discord.js';
import { BotBaseInteractiveMessageBuilder } from './BotBaseInteractiveMessageBuilder';
import { BotButton } from '../BotButton';
import { BotButtonMessage } from '../BotButtonMessage';

export class BotBaseButtonMessageBuilder extends BotBaseInteractiveMessageBuilder {

	protected _buttons: Array<BotButton> = [];

	constructor(interaction: ChatInputCommandInteraction) {
		super(interaction);
	}

	build() {
		return new BotButtonMessage(
			this._embed,
			this._buttons,
			this._ephemeral,
			this._timeout,
		);
	}

}