import Birthday from '../core/database/botDatabase/models/Birthday';
import { BotSuccessEmbed } from '../core/messages/BotSuccessEmbed';
import { handleError } from '../core/utils/error';

export default class BirthdayLibrary {

	/**
	 * Create the member's birthday in the database
	 * @param day the birthday day
	 * @param month the birhtday month
	 * @param guildId the ID of the guild in which birthday will be registered
	 * @param userId the ID of the user whose birthday is
	 * @returns an embed with the success message or an error message if any
	 */
	public static async createBirthday(day: number, month: number, guildId: string, userId: string) {

		try {

			await Birthday.create({
				guildId: guildId,
				userId: userId,
				day: day,
				month: month,
			});

			return new BotSuccessEmbed().setDescription('Ton anniversaire a bien été ajouté !');

		} catch (error) {
			return handleError('Error while inserting data', error, 'Une erreur est survenue lors de l\'insertion des données');
		}


	}

	/**
	 * Update the member's birthday in database
	 * @param day the birthday day
	 * @param month the birhtday month
	 * @param guildId the ID of the guild in which birthday will be updated
	 * @param userId the ID of the user whose birthday is
	 * @returns an embed with the success message or an error message if any
	 */
	public static async editBirthday(day: number, month: number, guildId: string, userId: string) {

		try {

			await Birthday.update({
				day: day,
				month: month,
			}, {
				where: {
					guildId: guildId,
					userId: userId,
				},
			});

			return new BotSuccessEmbed().setDescription('Ton anniversaire a bien été mis à jour !');

		} catch (error) {
			return handleError('Error while updating data', error, 'Une erreur est survenue lors de la mise à jour des données');
		}

	}

	/**
	 * Remove the member's birthday from database
	 * @param guildId the ID of the guild in which birthday will be removed
	 * @param userId the ID of the user whose birthday is
	 * @returns an embed with the success message or an error message if any
	 */
	public static async removeBirthday(guildId: string, userId: string) {

		try {

			await Birthday.destroy({
				where: {
					guildId: guildId,
					userId: userId,
				},
			});

			return new BotSuccessEmbed().setDescription('Ton anniversaire a bien été supprimé !');

		} catch (error) {
			return handleError('Error while inserting data', error, 'Une erreur est survenue lors de la suppression des données');
		}

	}

}