import { ChatInputCommandInteraction, ActionRowBuilder, MessageActionRowComponentBuilder } from 'discord.js';
import { BotInteractiveMessage } from '../BotInteractiveMessage';
import { BotBaseInteractiveMessageBuilder } from './BotBaseInteractiveMessageBuilder';

export class BotInteractiveMessageBuilder extends BotBaseInteractiveMessageBuilder {


	constructor(interaction: ChatInputCommandInteraction) {
		super(interaction);
	}

	public addComponent(component: ActionRowBuilder<MessageActionRowComponentBuilder>) {
		this._components.push(component);
		return this;
	}

	public build() {
		return new BotInteractiveMessage(
			this._components,
			this._embed,
			this._ephemeral,
			this._timeout,
		);
	}

}