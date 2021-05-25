import {inject, injectable} from "inversify";
import {TYPES} from "../config/types";
import {SurveyRepository} from "../repositories/survey.repository";
import {SurveyEntity} from "../entities/survey.entity";
import {BaseService} from "./base.service";
import {SurveyWaveformDto} from "../dto/survey-waveform.dto";
import {PointWaveformDto} from "../dto/point-waveform.dto";
import {WaveformDto} from "../dto/waveform.dto";
import {AppLogger} from "../config/log.config";

@injectable()
export class SurveyService extends BaseService<SurveyEntity, number> {

    private readonly appLogger = AppLogger.getLogger(SurveyService.name);

    constructor(@inject(TYPES.SurveyRepository) private surveyRepository: SurveyRepository) {
        super(surveyRepository);
    }

    async getNotProcessedSurveyForWaveforms(): Promise<SurveyWaveformDto[]> {
        try {
            const all = await this.surveyRepository.findAllNotProcessedWaveform();
            const result: SurveyWaveformDto[] = [];
            let lastSurveyId = -1;
            let lastPointId = -1;
            all.forEach(surveyWaveformDb => {

                if (surveyWaveformDb.surveyId != lastSurveyId) {
                    result.push(new SurveyWaveformDto(surveyWaveformDb.surveyId));
                    lastSurveyId = surveyWaveformDb.surveyId;
                }
                const lastSurvey = result[result.length - 1];
                if (surveyWaveformDb.pointId != lastPointId) {
                    lastSurvey.points.push(new PointWaveformDto(surveyWaveformDb.pointId));
                    lastPointId = surveyWaveformDb.pointId;
                }
                const lastPoint = lastSurvey.points[lastSurvey.points.length - 1];
                if (!lastPoint) {
                    this.appLogger.info(surveyWaveformDb);

                }
                lastPoint.waveformDto.push(new WaveformDto(surveyWaveformDb.waveformId, surveyWaveformDb.measureX, surveyWaveformDb.measureY))
            });
            return result;
        } catch (e) {
            this.appLogger.error(e);
            throw e;
        }
    }

}
