import {Container} from "inversify";
import {TYPES} from "./types";

import {Connection} from "typeorm";

import {DatabaseConfiguration} from "./database.config";
import {CrontabConfig} from "./crontab.config";

import {SchedulerService} from "../services/scheduler.service";

import {MawoiRepository} from "../repositories/mawoi.repository";
import {SurveyRepository} from "../repositories/survey.repository";
import {AccelerationWaveformRepository} from "../repositories/acceleration-waveform.repository";
import {DisplacementWaveformRepository} from "../repositories/displacement-waveform.repository";
import {VelocityWaveformRepository} from "../repositories/velocity-waveform.repository";

import {MawoiService} from "../services/mawoi.service";
import {SurveyService} from "../services/survey.service";
import {AccelerationWaveformService} from "../services/acceleration-waveform.service";
import {DisplacementWaveformService} from "../services/displacement-waveform.service";
import {VelocityWaveformService} from "../services/velocity-waveform.service";

import {StoreProcedureExecutor} from "../db/store-procedure.executor";
import {FunctionExecutor} from "../utils/function.executor";
import {QueueExecutor} from "../utils/queue-executor";

const container = new Container();

export const applyConfigurationContainer = () => {
    container.bind<DatabaseConfiguration>(TYPES.DatabaseConfiguration).to(DatabaseConfiguration).inSingletonScope();
    container.bind<CrontabConfig>(TYPES.CrontabConfig).to(CrontabConfig).inSingletonScope();
};

export const applyContainer = (connection: Connection) => {
    container.bind<Connection>(TYPES.Connection).toConstantValue(connection);

    container.bind<SurveyRepository>(TYPES.SurveyRepository).to(SurveyRepository).inSingletonScope();
    container.bind<MawoiRepository>(TYPES.MawoiRepository).to(MawoiRepository).inSingletonScope();
    container.bind<AccelerationWaveformRepository>(TYPES.AccelerationWaveformRepository).to(AccelerationWaveformRepository).inSingletonScope();
    container.bind<DisplacementWaveformRepository>(TYPES.DisplacementWaveformRepository).to(DisplacementWaveformRepository).inSingletonScope();
    container.bind<VelocityWaveformRepository>(TYPES.VelocityWaveformRepository).to(VelocityWaveformRepository).inSingletonScope();

    //services
    container.bind<SchedulerService>(TYPES.SchedulerService).to(SchedulerService).inSingletonScope();
    container.bind<SurveyService>(TYPES.SurveyService).to(SurveyService).inSingletonScope();
    container.bind<MawoiService>(TYPES.MawoiService).to(MawoiService).inSingletonScope();
    container.bind<AccelerationWaveformService>(TYPES.AccelerationWaveformService).to(AccelerationWaveformService).inSingletonScope();
    container.bind<DisplacementWaveformService>(TYPES.DisplacementWaveformService).to(DisplacementWaveformService).inSingletonScope();
    container.bind<VelocityWaveformService>(TYPES.VelocityWaveformService).to(VelocityWaveformService).inSingletonScope();

    container.bind<QueueExecutor<any>>(TYPES.QueueExecutor).to(QueueExecutor).inSingletonScope();
    container.bind<FunctionExecutor>(TYPES.FunctionExecutor).to(FunctionExecutor).inSingletonScope();
    container.bind<StoreProcedureExecutor>(TYPES.StoreProcedureExecutor).to(StoreProcedureExecutor).inSingletonScope();
};

export default container;
