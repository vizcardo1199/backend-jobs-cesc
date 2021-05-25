import {StoredProcedureQuery} from "./store-procedure.query";
import {injectable} from "inversify";
import {QueueExecutor} from "../utils/queue-executor";

@injectable()
export class StoreProcedureExecutor extends QueueExecutor<StoredProcedureQuery> {

}

