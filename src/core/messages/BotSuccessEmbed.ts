import { HexColorString } from 'discord.js';
import { Constants } from '../Constants';
import { BotEmbed } from './BotEmbed';

export class BotSuccessEmbed extends BotEmbed {

	constructor(message: string) {
		super();
		this.setDescription(message);
		this.#setSuccessColor();
	}

	/**
	 * Set the success color
	 * @private
	 */
	#setSuccessColor() {
		this.setColor(<HexColorString>Constants.MESSAGES.COLORS.SUCCESS);
	}

}