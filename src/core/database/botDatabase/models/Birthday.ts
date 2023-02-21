import { DataTypes, ModelAttributes, Sequelize } from 'sequelize';
import moment from 'moment';
import { IModel } from './IModel';

export default class Birthday extends IModel {

	declare guildId: string;
	declare userId: string;
	declare day: number;
	declare month: number;

	public static modelAttributes: ModelAttributes = {
		createdAt: {
			type: DataTypes.DATE,
			defaultValue: moment().format('YYYY-MM-DD HH:mm:ss'),
		},
		updatedAt: {
			type: DataTypes.DATE,
		},
		userId: {
			type: DataTypes.STRING,
			primaryKey: true,
			allowNull: false,
		},
		guildId: {
			type: DataTypes.STRING,
			primaryKey: true,
			allowNull: false,
		},
		month: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		day : {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
	};

	public static async getById(guildId: string, userId: string) {
		return await Birthday.findOne({
			where: {
				guildId: guildId,
				userId: userId,
			},
		});
	}

	public static async getAll(guildId: string) {
		return await Birthday.findAll({
			where: {
				guildId: guildId,
			},
			raw: true,
		});
	}

}

export function initModel(sequelize: Sequelize): void {
	Birthday.init(Birthday.modelAttributes, {
		sequelize,
		tableName: 'birthdays',
		freezeTableName: true,
	});

	Birthday.beforeSave(instance => {
		instance.set('updatedAt', moment().toDate());
	});
}