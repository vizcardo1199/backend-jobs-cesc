export interface ExecutableProcedure {

    getFullName(): string;

    getGroup(): string;

    execute(): Promise<any>;

}
