import {inject, injectable} from "inversify";
import {Connection} from "typeorm";
import {TYPES} from "../config/types";
import {BaseRepository} from "./base.repository";
import {SurveyEntity} from "../entities/survey.entity";
import {SurveyWaveformDb} from "../db/dto/survey-waveform.db";
import {getDateForQuery} from "../utils/app.utils";

@injectable()
export class SurveyRepository extends BaseRepository<SurveyEntity, number> {

    constructor(@inject(TYPES.Connection) connection: Connection) {
        super(connection.getRepository(SurveyEntity));
    }

    findAllNotProcessedWaveform(): Promise<SurveyWaveformDb[]> {
        return this.repository.createQueryBuilder('survey')
            .innerJoin('survey.accelerationsWaveform', 'acceleration', 'acceleration.state = :state', {state: true})
            .where('survey.state = :state', {state: true})
            .andWhere('survey.waveformProcessed = :waveformProcessed', {waveformProcessed: false})
            .andWhere('survey.endDate < date_add(:actualDate, interval fn_get_gmt(survey.gmt) hour)', {
                actualDate: getDateForQuery(new Date())
            })
            .select('survey.id', 'surveyId')
            .addSelect('acceleration.pointId', 'pointId')
            .addSelect('acceleration.id', 'waveformId')
            .addSelect('acceleration.measureX', 'measureX')
            .addSelect('acceleration.measureY', 'measureY')
            .orderBy('survey.id')
            .addOrderBy('acceleration.pointId')
            .getRawMany();
    }

}
