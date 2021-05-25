import "moment-timezone";
import moment from 'moment';
import {UpdateResult} from "typeorm";
import {
    DATABASE_FORMAT_DATE,
    DATABASE_FORMAT_TIMESTAMP,
    NO_TIMEZONE,
    SP_MESSAGES_SEPARATOR,
    WAVEFORMS_FORMAT
} from "../config/constants.config";
import {AppLogger} from "../config/log.config";
import {LeveledLogMethod} from "winston";
import {AccelerationWaveformEntity} from "../entities/acceleration-waveform.entity";
import {DisplacementWaveformEntity} from "../entities/displacement-waveform.entity";
import {VelocityWaveformEntity} from "../entities/velocity-waveform.entity";
import {WaveformDto} from "../dto/waveform.dto";

export const isNewEntity = (entity: any) => {
    return (entity == null || entity.id == null || entity.id <= 0);
};

export const isEmptyString = (value: string | undefined) => {
    return value == null || value.length === 0;
};

export const isEmptyArray = (value: any[]) => {
    return value == null || value.length === 0;
};

export const isBlankString = (value: string | undefined) => {
    return isEmptyString(value) || isEmptyString(value?.trim());
};

export const formatDate = (inputDate: Date | undefined, format: string): string | undefined => {
    if (inputDate == null) {
        return inputDate;
    }
    return moment(inputDate).format(format);
};

export const getStartOfDay = (inputDate: Date | undefined): Date | undefined => {
    if (inputDate == null) {
        return inputDate;
    }
    return moment(inputDate).startOf('day').toDate();
};

export const getEndOfDay = (inputDate: Date | undefined): Date | undefined => {
    if (inputDate == null) {
        return inputDate;
    }
    return moment(inputDate).endOf('day').toDate();
};

export const addDays = (inputDate: Date | undefined, amount: number): Date | undefined => {
    if (inputDate == null) {
        return inputDate;
    }
    return moment(inputDate).add(amount, 'days').toDate();
};

export const timeout = <E>(data: any, interval: number) => {
    return new Promise<E>((resolve, reject) => setTimeout(() => reject(data), interval));
};

export const secureSum = (first: number | string | undefined, second: number | string | undefined): number => {
    let a: number | string = first ? first : 0;
    let b: number | string = second ? second : 0;
    a = typeof a === 'string' ? parseFloat(a) : a;
    b = typeof b === 'string' ? parseFloat(b) : b;
    return a + b;
};

export const mapSimilarProps = (inputObject: any, outputObject: any): void => {
    Object.keys(inputObject).forEach(key => {
        if (inputObject[key] != null && typeof inputObject[key] !== 'object') {
            outputObject[key] = inputObject[key];
        }
    });
};

export const updateResultWasSuccessFully = (deleteResult: UpdateResult) => {
    if (deleteResult.raw.affectedRows != null && deleteResult.raw.affectedRows > 0) {
        return true;
    }
    return (deleteResult.affected != null && deleteResult.affected > 0);
};

export const updateResultNoErrors = (deleteResult: UpdateResult) => {
    if (deleteResult.raw.affectedRows != null && deleteResult.raw.affectedRows >= 0) {
        return true;
    }
    return (deleteResult.affected != null && deleteResult.affected >= 0);
};

export const getActualDate = (timezone: string | undefined = undefined): Date => {
    return new Date();
};

export const calculateRms = (numberSet: number[]): number => {
    if (numberSet.length > 0) {
        const sum = numberSet.map(x => x * x).reduce((x1, x2) => x1 + x2);
        return Math.sqrt(sum / numberSet.length);
    }
    return 0;
};

export const uuidv4 = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        // tslint:disable-next-line:no-bitwise
        const r = Math.random() * 16 | 0;
        // tslint:disable-next-line:no-bitwise
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

export const replaceAll = (input: string, searchValue: string | RegExp, replaceValue: string): string => {
    let last: string;
    do {
        last = input;
        input = input.replace(searchValue, replaceValue);
    } while (input != last);
    return input;
};

export const printMessages = (
    outMessage: string,
    logLevel: (LeveledLogMethod | null) = null,
    mapMessage: ((msg: string) => string) | null = null
): void => {
    if (!isEmptyString(outMessage)) {
        const messages = outMessage.split(SP_MESSAGES_SEPARATOR);
        let logMethod: LeveledLogMethod;
        if (logLevel == null) {
            const logger = AppLogger.getDefaultLogger();
            logMethod = logger.info;
        } else {
            logMethod = logLevel;
        }
        if (messages && mapMessage) {
            messages.map(msg => mapMessage(msg)).forEach(msg => logMethod(msg));
        } else {
            logMethod(messages);
        }
    }
};

export const getEnvVarAsNumber = (envVar: string | undefined, defaultValue: number = 0): number => {
    return envVar ? parseInt(envVar, 10) : defaultValue;
};

export const getEnvVarAsString = (envVar: string | undefined, defaultValue: string = ''): string => {
    return envVar ? envVar : defaultValue;
};

export const getEnvVarAsBoolean = (envVar: string | undefined, defaultValue: boolean = false): boolean => {
    return envVar ? (envVar == 'true') : defaultValue;
};

export const calculateAverage = (values: number[]): number => {
    return isEmptyArray(values) ? 0 : (values.reduce((x, y) => x + y) / values.length);
};

export const calculateWaveformAverage = (waveforms: (WaveformDto | AccelerationWaveformEntity | DisplacementWaveformEntity | VelocityWaveformEntity)[]): number => {
    return calculateAverage(waveforms.map(x => x.measureY ? x.measureY : 0));
};

export const centerWaveformValues = (waveforms: (AccelerationWaveformEntity | DisplacementWaveformEntity | VelocityWaveformEntity)[]): (AccelerationWaveformEntity | DisplacementWaveformEntity | VelocityWaveformEntity)[] => {
    const inverseAvg = calculateWaveformAverage(waveforms) * -1;
    AppLogger.getDefaultLogger().debug('Inverse prom is: %d', inverseAvg);
    return waveforms.map(waveform => {
        waveform.measureY = secureSum(waveform.measureY, inverseAvg);
        return {...waveform};
    });
};

export const calculateNextWaveformValue = (waveforms: (WaveformDto | DisplacementWaveformEntity)[],
                                           output: (DisplacementWaveformEntity | VelocityWaveformEntity),
                                           index: number) => {
    const firstWaveform = waveforms[0];
    const actualWaveform = waveforms[index];
    const nextWaveform = waveforms[index + 1];

    const firstWaveformY = parseFloat(firstWaveform.measureY ? String(firstWaveform.measureY) : '0');
    const actualWaveformY = parseFloat(actualWaveform.measureY ? String(actualWaveform.measureY) : '0');
    const nextWaveformY = parseFloat(nextWaveform.measureY ? String(nextWaveform.measureY) : '0');

    output.measureX = actualWaveform.measureX;
    output.measureY = firstWaveformY + ((nextWaveformY + actualWaveformY) / 2);
    output.waveformTimestamp = moment().format(WAVEFORMS_FORMAT);
};

export const getDateForQuery = (inputDate: Date, includeTime: boolean = true): string => {
    return moment(inputDate).tz(NO_TIMEZONE).format(includeTime ? DATABASE_FORMAT_TIMESTAMP : DATABASE_FORMAT_DATE);
};
