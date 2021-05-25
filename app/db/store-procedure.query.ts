import { Connection, EntityManager, Repository } from 'typeorm';
import { isEmptyArray, replaceAll, uuidv4 } from '../utils/app.utils';
import { CoreException } from '../exceptions/core.exception';
import moment from 'moment';
import { ISO_8601_FORMAT_TIMESTAMP } from '../config/constants.config';
import { ExecutableProcedure } from '../utils/executable-procedure';

export type WithParameterMode = 'in' | 'out'
export type ParameterType = 'number' | 'string' | 'date' | 'boolean' | 'object'

export class StoredProcedureQuery implements ExecutableProcedure {

    private static DEFAULT_GROUP = 'STORE_DEFAULT_GROUP';

    private readonly uuid: string;
    private readonly nameProcedure: string;
    private readonly group: string;

    private readonly inputParameters: any;
    private readonly outputParameters: any;
    private connection: Connection | Repository<any> | EntityManager;
    private result: any;
    private executed: boolean;

    constructor(
        connection: Connection | Repository<any> | EntityManager,
        nameProcedure: string,
        group: string = StoredProcedureQuery.DEFAULT_GROUP
    ) {
        this.connection = connection;
        this.nameProcedure = nameProcedure;
        this.group = group;
        this.uuid = replaceAll(uuidv4(), '-', '_');
        this.inputParameters = {};
        this.outputParameters = {};
        this.result = {};
        this.executed = false;
    }

    getFullName(): string {
        return this.nameProcedure + '-' + this.uuid;
    }

    getGroup(): string {
        return this.group;
    }

    registerStoredProcedureParameter(parameter: string, mode: WithParameterMode, parameterTpe: ParameterType = 'string') {
        if (mode === 'in') {
            this.inputParameters[parameter] = {
                type: parameterTpe,
                value: null
            };
        } else {
            this.outputParameters[parameter] = null;
        }
    }

    setParameter(parameter: string, value: any) {
        const key = Object.keys(this.inputParameters).find(k => k === parameter);
        if (key) {
            this.inputParameters[key].value = value;
            return;
        }
        throw new CoreException(`Input parameter "${parameter}" not registered!`);
    }

    getOutputParameterValue(parameter: string): any {
        const key = Object.keys(this.outputParameters).find(k => k === parameter);
        if (key) {
            return this.outputParameters[key];
        }
        throw new CoreException(`Output parameter "${parameter}" not registered!`);
    }

    async execute() {
        if (this.executed) {
            throw new CoreException(`The store procedure has already been executed!`);
        }
        this.executed = true;
        let callProcedureSql = `CALL ${this.nameProcedure}(`;
        const outKeys = Object.keys(this.outputParameters).map(key => `@${key}_${this.uuid}`);
        const params: string = Object.keys(this.inputParameters).map(key => {
            const type: ParameterType = this.inputParameters[key].type;
            const inputValue: ParameterType = this.inputParameters[key].value;
            switch (type) {
                case 'boolean':
                case 'number':
                    return inputValue;
                case 'object':
                    return JSON.stringify(inputValue);
                case 'date':
                    return moment(inputValue).format(ISO_8601_FORMAT_TIMESTAMP);
                case 'string':
                    return `'${inputValue}'`;
            }
            return null;
        }).concat(outKeys).join(', ');
        callProcedureSql = `${callProcedureSql} ${params});`;
        console.log("PROCEUDRE", callProcedureSql)
        this.result = await this.connection.query(callProcedureSql);
        this.checkProcedureExecution(this.result);
        if (!isEmptyArray(outKeys)) {
            this.result = await this.connection.query(`SELECT ${outKeys.join()};`);
            if (!isEmptyArray(this.result)) {
                Object.keys(this.outputParameters).forEach(key => this.outputParameters[key] = this.result[0][`@${key}_${this.uuid}`]);
            }
        }
    }

    private checkProcedureExecution(value: any[]) {
        const dbError = value[0];
        if (dbError == null) {
            return value;
        }
        const specificError = dbError[0];
        let msg = `Error while executing procedure (${this.getFullName()}).`;
        if (specificError != null) {


            if (specificError.MYSQL_ERROR != null) {
                msg = msg + ' Code: ' + specificError.MYSQL_ERROR;
            } else {
                msg = msg + ' Code: ' + JSON.stringify(specificError);
            }
        } else {
            msg = 'Unknown ' + msg.toLowerCase();
        }
        throw new CoreException(msg);
    }

}
