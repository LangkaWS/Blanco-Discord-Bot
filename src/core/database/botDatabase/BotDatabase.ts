import { Database } from '../Database';

export class BotDatabase extends Database {

	constructor() {
		super('botDatabase');
	}

	/**
	 * Initialize a BotDatabase instance
	 */
	public async init(): Promise<void> {

		await this.connectDatabase();
		await super.init();

	}

}