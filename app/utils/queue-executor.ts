import {getEnvVarAsNumber, isEmptyArray} from "./app.utils";
import {injectable} from "inversify";
import {AppLogger} from "../config/log.config";
import {ExecutableProcedure} from "./executable-procedure";

class ExecutionInstance<T extends ExecutableProcedure> {

    name: string;
    actualProcedures: (T | null)[];
    queue: {
        procedure: T,
        resolve: (value?: (PromiseLike<void> | void)) => void,
        reject: (reason?: any) => void
    }[];

    constructor(name: string, size: number) {
        this.name = name;
        this.actualProcedures = new Array(size).fill(null);
        this.queue = [];
    }

}

@injectable()
export class QueueExecutor<T extends ExecutableProcedure> {

    readonly MAX_PARALLEL_EXECUTIONS: number = getEnvVarAsNumber(process.env.APP_MAX_PARALLEL_EXECUTIONS, 1);
    readonly MAX_QUEUE_SIZE: number = getEnvVarAsNumber(process.env.APP_MAX_QUEUE_SIZE, 32);

    private logger: AppLogger = AppLogger.getLogger(QueueExecutor.name);

    private instances: ExecutionInstance<T>[];

    constructor() {
        this.instances = [];
    }

    executeProcedure(procedureToExec: T): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.execute(procedureToExec, resolve, reject);
        });
    }

    private execute(procedureToExec: T,
                    resolve: (value?: (PromiseLike<void> | void)) => void,
                    reject: (reason?: any) => void) {
        this.logger.debug('Trying to execute: %s', procedureToExec.getFullName());
        const freeInstance = this.getFreeIndex(procedureToExec.getGroup());
        if (freeInstance.index >= 0) {
            this.logger.debug('Executing %s...', procedureToExec.getFullName());
            freeInstance.instance.actualProcedures[freeInstance.index] = procedureToExec;
            //execute immediate
            procedureToExec.execute().then(() => {
                this.logger.debug('Finish execution of %s', procedureToExec.getFullName());
                freeInstance.instance.actualProcedures[freeInstance.index] = null;
                resolve();
                this.executeNext(freeInstance.instance);
            }).catch(err => {
                this.logger.debug('Error in execution of %s', procedureToExec.getFullName());
                this.logger.debug('Trying to executing next of %s', procedureToExec.getGroup());
                freeInstance.instance.actualProcedures[freeInstance.index] = null;
                reject(err);
                this.executeNext(freeInstance.instance);
            });
        } else {
            if (freeInstance.instance.queue.length >= this.MAX_QUEUE_SIZE) {
                reject(`The action cannot be executed, the queue ${procedureToExec.getGroup()} is full.`);
            } else {
                this.logger.debug('Put in queue %s procedure %s', procedureToExec.getGroup(), procedureToExec.getFullName());
                //put in queue
                freeInstance.instance.queue.push({
                    procedure: procedureToExec,
                    resolve: resolve,
                    reject: reject
                });
                this.logger.debug('New queue size: %d', freeInstance.instance.queue.length);
            }
        }
    }

    private getFreeIndex(procedureGroup: string): { index: number, instance: ExecutionInstance<T> } {
        let instance = this.instances.find(x => x.name === procedureGroup);
        if (instance == null) {
            this.logger.debug('Procedure instance %s does not exists, adding', procedureGroup);
            instance = new ExecutionInstance<T>(procedureGroup, this.MAX_PARALLEL_EXECUTIONS);
            this.instances.push(instance);
        }
        return {
            index: instance.actualProcedures.findIndex(p => p == null),
            instance: instance
        }
    }

    private executeNext(instance: ExecutionInstance<T>) {
        if (!isEmptyArray(instance.queue)) {
            const first = instance.queue[0];
            this.logger.debug('Pop from queue %s procedure %s', first.procedure.getGroup(), first.procedure.getFullName());
            instance.queue.splice(0, 1);
            this.execute(first.procedure, first.resolve, first.reject);
        }
    }


}
