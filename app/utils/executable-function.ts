import {ExecutableProcedure} from "./executable-procedure";
import {replaceAll, uuidv4} from "./app.utils";

export class ExecutableFunction implements ExecutableProcedure {

    private static DEFAULT_GROUP = 'FUNCTION_DEFAULT_GROUP';

    private readonly functionToExecute: () => Promise<any>;
    private readonly group: string;
    private readonly name: string;
    private readonly uuid: string;

    constructor(functionToExecute: () => Promise<any>, group: string = ExecutableFunction.DEFAULT_GROUP) {
        this.functionToExecute = functionToExecute;
        this.group = group;
        this.name = functionToExecute.name;
        this.uuid = replaceAll(uuidv4(), '-', '_');
    }

    execute(): Promise<any> {
        return this.functionToExecute();
    }

    getFullName(): string {
        return this.name + '-' + this.uuid;
    }

    getGroup(): string {
        return this.group;
    }

}
