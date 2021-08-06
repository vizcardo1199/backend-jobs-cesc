import cron from 'node-cron';
import {inject, injectable} from "inversify";
import container from "./inversify.config";
import {TYPES} from "./types";
import {SchedulerService} from "../services/scheduler.service";
import {DEFAULT_CRON_EXPRESSION, ISO_8601_FORMAT_TIMESTAMP} from "./constants.config";
import moment from "moment";
import {AppLogger} from "./log.config";
import {getEnvVarAsBoolean, getEnvVarAsString} from "../utils/app.utils";

@injectable()
export class CrontabConfig {

    private logger = AppLogger.getLogger(CrontabConfig.name);

    constructor(@inject(TYPES.SchedulerService) private schedulerService: SchedulerService) {
    }

    configure() {
        const bandsTask = cron.schedule(
            getEnvVarAsString(process.env.CRON_EXPRESSION_CALCULATE_SURVEYS, DEFAULT_CRON_EXPRESSION),
            () => this.runTask(this.taskExecuteProccessSurveys, 'taskExecuteProccessSurveys'),
            {
                scheduled: false
            }
        );
        if (getEnvVarAsBoolean(process.env.CRON_ACTIVE_CALCULATE_SURVEYS, true)) {
            bandsTask.start();
        }

        const waveformsTask = cron.schedule(
            getEnvVarAsString(process.env.CRON_EXPRESSION_CALCULATE_WAVEFORMS, DEFAULT_CRON_EXPRESSION),
            () => this.runTask(this.taskExecuteCalculateWaveforms, 'taskExecuteCalculateWaveforms'),
            {
                scheduled: false
            }
        );
        if (getEnvVarAsBoolean(process.env.CRON_ACTIVE_CALCULATE_WAVEFORMS, true)) {
            waveformsTask.start();
        }

        const mqttTask = cron.schedule(
            getEnvVarAsString(process.env.CRON_EXPRESSION_PROCESS_MQTT, DEFAULT_CRON_EXPRESSION),
            () => this.runTask(this.taskExecuteProcessMqtt, 'taskExecuteProcessMqtt'),
            {
                scheduled: false
            }
        );
        if (getEnvVarAsBoolean(process.env.CRON_ACTIVE_PROCESS_MQTT, true)) {
            mqttTask.start();
        }

        const stateMawoiTask = cron.schedule(
            getEnvVarAsString(process.env.CRON_EXPRESSION_MAWOI_STATE, DEFAULT_CRON_EXPRESSION),
            () => this.runTask(this.taskTurnOffUnusedMawois, 'taskTurnOffUnusedMawois'),
            {
                scheduled: false
            }
        );
        if (getEnvVarAsBoolean(process.env.CRON_ACTIVE_MAWOI_STATE, true)) {
            stateMawoiTask.start();
        }
    }

    private runTask = async (realAction: () => void, fncName: string) => {
        const start = moment();
        this.initializeRepositories();
        fncName = fncName ? fncName : realAction.name;
        this.logger.info(`running ${fncName} at: ${start.format(ISO_8601_FORMAT_TIMESTAMP)}`);
        let end;
        try {
            await realAction();
            end = moment();
            this.logger.info(`finish ${fncName} at: ${end.format(ISO_8601_FORMAT_TIMESTAMP)} and took ${end.diff(start, 'seconds', true)} seconds`);
        } catch (e) {
            end = moment();
            this.logger.error(e);
            this.logger.error(`finish ${fncName} with errors at: ${end.format(ISO_8601_FORMAT_TIMESTAMP)} and took ${end.diff(start, 'seconds', true)} seconds`);
        }
    };

    private taskExecuteProccessSurveys = () => {
        console.log("task surveys");
        return this.schedulerService.processSurveys();
    };

    private taskExecuteCalculateWaveforms = () => {
        return this.schedulerService.processWaveforms();
    };

    private taskExecuteProcessMqtt = () => {
        return this.schedulerService.processMqtt();
    };

    private taskTurnOffUnusedMawois = () => {
        return this.schedulerService.processTurnOffUnusedMawois();
    };

    private initializeRepositories = () => {
        if (this.schedulerService == null) {
            this.schedulerService = container.get<SchedulerService>(TYPES.SchedulerService);
        }
    };

}
