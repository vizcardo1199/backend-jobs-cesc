export class CoreException {

    message: string;
    baseError: any;

    constructor(message: string, baseError?: any) {
        this.message = message;
        this.baseError = baseError;
    }

}
