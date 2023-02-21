import { ActionRowBuilder, ChatInputCommandInteraction, MessageActionRowComponentBuilder } from 'discord.js';
import { BotBaseMessageBuilder } from './BotBaseMessageBuilder';
import { BotEmbed } from '../BotEmbed';
import { Constants } from '../../Constants';

export class BotBaseInteractiveMessageBuilder extends BotBaseMessageBuilder {

	protected _components: Array<ActionRowBuilder<MessageActionRowComponentBuilder>> = [];
	protected _embed: BotEmbed = new BotEmbed();
	protected _timeout = Constants.MESSAGES.COLLECTOR_TIME;

	constructor(interaction: ChatInputCommandInteraction) {
		super(interaction);
	}

	public setEmbed(embed: BotEmbed) {
		this._embed = embed;
		return this;
	}

	public setTimeout(timeout: number) {
		this._timeout = timeout;
	}

}