import { ActionRowBuilder } from 'discord.js';
import { BotButton } from './BotButton';
import { BotEmbed } from './BotEmbed';
import { BotInteractiveMessage } from './BotInteractiveMessage';

export class BotButtonMessage extends BotInteractiveMessage {

	constructor(
		embed: BotEmbed,
		buttons: Array<BotButton>,
		ephemeral: boolean,
		timeout: number,
	) {

		const buttonActionRows: Array<ActionRowBuilder<BotButton>> = [];

		if (buttons.length) {

			// Maximum 5 buttons per row
			const chunkSize = 5;
			let rowCount = 0;

			// Maximum 5 rows
			while (rowCount < 5 || rowCount < buttons.length) {

				const chunk = buttons.slice(rowCount, rowCount + chunkSize);
				rowCount += chunkSize;

				const row = new ActionRowBuilder()
					.addComponents(chunk) as ActionRowBuilder<BotButton>;
				buttonActionRows.push(row);

			}

		}

		super(buttonActionRows, embed, ephemeral, timeout);

	}

}