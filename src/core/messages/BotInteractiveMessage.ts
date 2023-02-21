import { ActionRowBuilder, ButtonInteraction, ChatInputCommandInteraction, Collection, CollectorFilter, ComponentType, InteractionCollector, MessageActionRowComponentBuilder, StringSelectMenuInteraction } from 'discord.js';
import { BotEmbed } from './BotEmbed';
import { BotMessage } from './BotMessage';

export class BotInteractiveMessage extends BotMessage {

	#collector: InteractionCollector<ButtonInteraction|StringSelectMenuInteraction>|undefined;
	#timeout: number;

	constructor(
		components: Array<ActionRowBuilder<MessageActionRowComponentBuilder>>,
		embed:BotEmbed,
		ephemeral = true,
		timeout: number) {
		super(components, [embed], ephemeral);
		this.#timeout = timeout;
	}

	public async replyAndAwaitOneInteraction(interaction: ChatInputCommandInteraction) {
		await super.reply(interaction);
		let userFilter: CollectorFilter<[ButtonInteraction, Collection<string, ButtonInteraction>]> | undefined;
		if (!this.ephemeral) {
			userFilter = (i: ButtonInteraction): boolean => i.user.id === interaction.user.id;
		}
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		return this._sentMessage!.awaitMessageComponent({ filter: userFilter, componentType: ComponentType.Button, time: this.#timeout });
	}

}