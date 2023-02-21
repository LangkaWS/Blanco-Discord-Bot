import { ChatInputCommandInteraction } from 'discord.js';
import { BotButton } from '../BotButton';
import { BotBaseButtonMessageBuilder } from './BotBaseButtonMessageBuilder';

export class BotButtonMessageBuilder extends BotBaseButtonMessageBuilder {

	constructor(interaction: ChatInputCommandInteraction) {
		super(interaction);
	}

	public addButtons(buttons: Array<BotButton>) {
		if (buttons.length) {
			this._buttons.push(...buttons);
		}
		return this;
	}

}