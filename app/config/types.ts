import {QueueExecutor} from "../utils/queue-executor";

export const TYPES = {
    Connection: Symbol("Connection"),

    DatabaseConfiguration: Symbol("DatabaseConfiguration"),
    CrontabConfig: Symbol("CrontabConfig"),

    SurveyRepository: Symbol("SurveyRepository"),
    MawoiRepository: Symbol("MawoiRepository"),
    AccelerationWaveformRepository: Symbol("AccelerationWaveformRepository"),
    DisplacementWaveformRepository: Symbol("DisplacementWaveformRepository"),
    VelocityWaveformRepository: Symbol("VelocityWaveformRepository"),

    SchedulerService: Symbol("SchedulerService"),
    SurveyService: Symbol("SurveyService"),
    MawoiService: Symbol("MawoiService"),
    AccelerationWaveformService: Symbol("AccelerationWaveformService"),
    DisplacementWaveformService: Symbol("DisplacementWaveformService"),
    VelocityWaveformService: Symbol("VelocityWaveformService"),

    QueueExecutor: Symbol("QueueExecutor"),
    FunctionExecutor: Symbol("FunctionExecutor"),
    StoreProcedureExecutor: Symbol("StoreProcedureExecutor"),

};

export interface KeyValue<K, V> {
    key: K;
    value: V;
}
