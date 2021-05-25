import {injectable} from "inversify";
import {QueueExecutor} from "./queue-executor";
import {ExecutableFunction} from "./executable-function";

@injectable()
export class FunctionExecutor extends QueueExecutor<ExecutableFunction> {

}

