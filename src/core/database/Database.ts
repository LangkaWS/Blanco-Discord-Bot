import { readdir } from 'fs/promises';
import { Sequelize } from 'sequelize';
import { botConfig } from '../bot';

export class Database {

	public sequelize!: Sequelize;
	private readonly databaseName: string;

	public constructor(databaseName: string) {
		this.databaseName = databaseName;
	}

	/**
	 * Initialize the database
	 */
	public async init(): Promise<void> {

		await this.connectDatabase();
		await this.initModels();

	}

	/**
	 * Connect to the database
	 * @protected
	 */
	protected async connectDatabase(): Promise<void> {

		// Ignore if already connected
		if (this.sequelize) return;

		const missingParameter = botConfig.DB_HOST === undefined
			|| botConfig.DB_PORT === undefined
			|| botConfig.DB_USER === undefined
			|| botConfig.DB_PASSWORD === undefined
			|| botConfig.DB_NAME === undefined;
		if (missingParameter) {
			throw new Error('Database initialization: missing required parameters.');
		}

		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		this.sequelize = new Sequelize(botConfig.DB_NAME!, botConfig.DB_USER!, botConfig.DB_PASSWORD, {
			dialect: 'mysql',
			host: botConfig.DB_HOST,
			port: botConfig.DB_PORT,
			logging: false,
		});

		try {
			await this.sequelize.authenticate();
		} catch (error) {
			throw new Error('Database initialization: Cannot authenticate.');
		}

	}

	/**
	 * Initialize database models
	 * @private
	 */
	private async initModels(): Promise<void> {

		const modelFiles = await readdir(`${__dirname}/${this.databaseName}/models`);

		for (const modelFile of modelFiles) {
			await this.initModelFromFile(modelFile);
		}

		try {
			await this.sequelize.sync({ alter: true });
		} catch (error) {
			throw new Error('Error while syncing sequelize');
		}

	}

	/**
	 * Initialize a model from its model file
	 * @param modelFile
	 * @private
	 */
	private async initModelFromFile(modelFile: string): Promise<void> {

		const models = [];
		const [modelName, modelSplit] = modelFile.split(/\.(.*)/);

		if (modelSplit !== 'js' || modelSplit.length !== 2) return;

		const model = await import(`./${this.databaseName}/models/${modelName}`);
		models.push(model);

		if (model.initModel) {
			try {
				await model.initModel(this.sequelize);
			} catch (error) {
				throw new Error(`Error while initializing model ${modelName}`);
			}
		}

	}

}