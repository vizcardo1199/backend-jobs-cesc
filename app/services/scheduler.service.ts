import {inject, injectable} from "inversify";
import {TYPES} from "../config/types";
import {StoreProcedureExecutor} from "../db/store-procedure.executor";
import {StoredProcedureQuery} from "../db/store-procedure.query";
import {Connection} from "typeorm";
import {calculateNextWaveformValue, centerWaveformValues, printMessages} from "../utils/app.utils";
import {AUDIT_USER} from "../config/constants.config";
import {AppLogger} from "../config/log.config";
import {SurveyService} from "./survey.service";
import {AccelerationWaveformService} from "./acceleration-waveform.service";
import {VelocityWaveformEntity} from "../entities/velocity-waveform.entity";
import {DisplacementWaveformEntity} from "../entities/displacement-waveform.entity";
import {AccelerationWaveformEntity} from "../entities/acceleration-waveform.entity";
import {SurveyEntity} from "../entities/survey.entity";
import {FunctionExecutor} from "../utils/function.executor";
import {ExecutableFunction} from "../utils/executable-function";

@injectable()
export class SchedulerService {

    private readonly logger = AppLogger.getLogger(SchedulerService.name);

    constructor(
        @inject(TYPES.Connection) private connection: Connection,
        @inject(TYPES.SurveyService) private surveyService: SurveyService,
        @inject(TYPES.AccelerationWaveformService) private accelerationWaveformService: AccelerationWaveformService,
        @inject(TYPES.StoreProcedureExecutor) private storeProcedureService: StoreProcedureExecutor,
        @inject(TYPES.FunctionExecutor) private functionExecutor: FunctionExecutor
    ) {
    }

    async processSurveys(): Promise<void> {
        return await this.executeProcessSurveysSP();
    }

    async processWaveforms(): Promise<void> {
        const executableFunction: ExecutableFunction = new ExecutableFunction(async () => {
            await this.executeProcessWaveforms();
        });
        await this.functionExecutor.executeProcedure(executableFunction);
    }

    async processMqtt(): Promise<void> {
        await this.executeBaseMqttSP('sp_process_mqtt_ao');
        await this.executeBaseMqttSP('sp_process_mqtt_hf');
        await this.executeBaseMqttSP('sp_process_mqtt_aw');
        await this.executeBaseMqttSP('sp_process_mqtt_as');
        await this.executeBaseMqttSP('sp_process_mqtt_bands');
    }

    async processTurnOffUnusedMawois(): Promise<void> {
        return this.connection.transaction(async entityManager => {
            const sp: StoredProcedureQuery = new StoredProcedureQuery(entityManager, 'sp_auto_turn_off_mawois', 'sp_auto_turn_off_mawois');
            sp.registerStoredProcedureParameter('in_user_audit', 'in');
            sp.registerStoredProcedureParameter('out_messages', 'out');
            sp.setParameter('in_user_audit', AUDIT_USER);
            await this.storeProcedureService.executeProcedure(sp);
            const outMessages: string = sp.getOutputParameterValue('out_messages');
            printMessages(outMessages);
        });
    }

    private executeProcessSurveysSP(): Promise<void> {
        return this.connection.transaction(async entityManager => {
            const sp: StoredProcedureQuery = new StoredProcedureQuery(entityManager, 'sp_process_survey');
            sp.registerStoredProcedureParameter('in_user_audit', 'in');
            sp.registerStoredProcedureParameter('out_messages_step', 'out');
            sp.registerStoredProcedureParameter('out_messages_tmp', 'out');
            sp.registerStoredProcedureParameter('out_detailed_messages_tmp', 'out');
            sp.registerStoredProcedureParameter('out_messages_presion', 'out');
            sp.registerStoredProcedureParameter('out_detailed_messages_presion', 'out');

            sp.setParameter('in_user_audit', AUDIT_USER);
            printMessages('DEDEDEDEDE', this.logger.debug);
            console.log("d1",sp.getFullName())
            printMessages(sp.getFullName(), this.logger.debug);

            await this.storeProcedureService.executeProcedure(sp);

            let message = sp.getOutputParameterValue('out_messages_step');
            printMessages(message, this.logger.debug);

            message = sp.getOutputParameterValue('out_messages_tmp');
            printMessages(message);
            message = sp.getOutputParameterValue('out_detailed_messages_tmp');
            printMessages(message, this.logger.debug);

            message = sp.getOutputParameterValue('out_messages_presion');
            printMessages(message);
            message = sp.getOutputParameterValue('out_detailed_messages_presion');
            printMessages(message, this.logger.debug);

        });
    }

    private executeBaseMqttSP(procedureName: string): Promise<void> {
        return this.connection.transaction(async entityManager => {
            const sp: StoredProcedureQuery = new StoredProcedureQuery(entityManager, procedureName);
            sp.registerStoredProcedureParameter('in_user_audit', 'in');
            sp.registerStoredProcedureParameter('out_messages', 'out');
            sp.registerStoredProcedureParameter('out_points_error', 'out');
            sp.setParameter('in_user_audit', AUDIT_USER);
            await this.storeProcedureService.executeProcedure(sp);
            const outMessages: string = sp.getOutputParameterValue('out_messages');
            printMessages(outMessages);
            const outPointsError: string = sp.getOutputParameterValue('out_points_error');
            printMessages(outPointsError, this.logger.warn, msg => `Point ${msg} does not exists, skipping...`);
        });
    }

    private async executeProcessWaveforms(): Promise<void> {
        //1. get all not processed surveys
        const surveys = await this.surveyService.getNotProcessedSurveyForWaveforms();
        for (let i = 0; i < surveys.length; i++) {
            const survey = surveys[i];
            this.logger.info('Processing survey %s ', survey.id);

            //2.- get acceleration waveforms points
            for (let j = 0; j < survey.points.length; j++) {
                const point = survey.points[j];
                this.logger.debug('Processing point %s ', point.id);

                let accelerations = point.waveformDto;
                this.logger.debug('I\'ve read %s values', accelerations.length);

                //3.- center accel values
                let accelEntities: AccelerationWaveformEntity[] = accelerations.map(x => {
                    const entity = new AccelerationWaveformEntity(x.id);
                    entity.measureY = parseFloat(String(x.measureY));
                    entity.pointId = point.id;
                    return entity;
                });
                accelEntities = centerWaveformValues(accelEntities);

                //4.- calc velocity values
                let velocities: VelocityWaveformEntity[] = [];
                for (let k = 0; k < accelerations.length - 1; k++) {
                    const velocity: VelocityWaveformEntity = new VelocityWaveformEntity();
                    velocity.survey = new SurveyEntity(survey.id);
                    velocity.pointId = point.id;
                    calculateNextWaveformValue(accelerations, velocity, k);
                    velocities.push(velocity);
                }
                this.logger.debug('I\'ve calc %s vel values', velocities.length);
                //5.- center vel values
                velocities = centerWaveformValues(velocities);

                //6.- calc disp values
                let displacements: DisplacementWaveformEntity[] = [];
                for (let k = 0; k < velocities.length - 1; k++) {
                    const displacement: DisplacementWaveformEntity = new DisplacementWaveformEntity();
                    displacement.survey = new SurveyEntity(survey.id);
                    displacement.pointId = point.id;
                    calculateNextWaveformValue(velocities, displacement, k);
                    displacements.push(displacement);
                }
                this.logger.debug('I\'ve calc %s dis values', displacements.length);
                //7.- center vel values
                displacements = centerWaveformValues(displacements);

                //save accel, vel, disp & survey
                await this.surveyService.executeWriteAsTransaction(
                    [accelEntities, velocities, displacements],
                    [AccelerationWaveformEntity, VelocityWaveformEntity, DisplacementWaveformEntity],
                    true
                );
            }
            const surveyEntity = new SurveyEntity(survey.id);
            surveyEntity.waveformProcessed = true;
            await this.surveyService.update(surveyEntity);
        }
    }

}
