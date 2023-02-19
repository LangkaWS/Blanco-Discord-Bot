import { Model } from 'sequelize';

export abstract class IModel extends Model {

	declare createdAt: Date;
	declare updatedAt: Date;

}