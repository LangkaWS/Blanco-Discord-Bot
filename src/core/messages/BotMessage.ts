import { ActionRowBuilder, ChatInputCommandInteraction, CommandInteraction, InteractionReplyOptions, InteractionResponse, Message, MessageActionRowComponentBuilder } from 'discord.js';
import { BotEmbed } from './BotEmbed';

export class BotMessage implements InteractionReplyOptions {

	public embeds: Array<BotEmbed>;
	public components: Array<ActionRowBuilder<MessageActionRowComponentBuilder>>;
	public ephemeral: boolean;

	protected _sentMessage: InteractionResponse | Message | undefined;

	constructor(components: Array<ActionRowBuilder<MessageActionRowComponentBuilder>>, embeds:Array<BotEmbed>, ephemeral = true) {
		this.components = components;
		this.embeds = embeds;
		this.ephemeral = ephemeral;
	}

	public async reply(interaction: ChatInputCommandInteraction|CommandInteraction) {
		this._sentMessage = interaction.replied
			? await interaction.editReply(this)
			: await interaction.reply(this);
		return this._sentMessage;
	}

}