import { HexColorString } from 'discord.js';
import { Constants } from '../Constants';
import { BotEmbed } from './BotEmbed';

export class BotErrorEmbed extends BotEmbed {

	constructor(message: string) {
		super();
		this.setDescription(message);
		this.#setErrorColor();
	}

	/**
	 * Set the error color
	 * @private
	 */
	#setErrorColor() {
		this.setColor(<HexColorString>Constants.MESSAGES.COLORS.ERROR);
	}

}