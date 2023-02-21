import { ChatInputCommandInteraction, CommandInteraction } from 'discord.js';

export class BotBaseMessageBuilder {

	protected _ephemeral = true;
	protected _interaction: ChatInputCommandInteraction|CommandInteraction;

	constructor(interaction: ChatInputCommandInteraction|CommandInteraction) {
		this._interaction = interaction;
	}

	public setEphemeral(ephemeral: boolean) {
		this._ephemeral = ephemeral;
		return this;
	}

}