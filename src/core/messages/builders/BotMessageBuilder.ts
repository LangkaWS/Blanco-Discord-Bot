import { ChatInputCommandInteraction, CommandInteraction } from 'discord.js';
import { BotEmbed } from '../BotEmbed';
import { BotMessage } from '../BotMessage';
import { BotBaseMessageBuilder } from './BotBaseMessageBuilder';

export class BotMessageBuilder extends BotBaseMessageBuilder {

	#embeds: Array<BotEmbed> = [];

	constructor(interaction: ChatInputCommandInteraction|CommandInteraction) {
		super(interaction);
	}

	public addEmbed(embed: BotEmbed) {
		this.#embeds.push(embed);
		return this;
	}

	public build() {
		return new BotMessage(
			[],
			this.#embeds,
			this._ephemeral,
		);
	}

}