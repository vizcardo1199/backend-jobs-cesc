import {inject, injectable} from "inversify";
import {Connection} from "typeorm";
import {TYPES} from "../config/types";
import {BaseRepository} from "./base.repository";
import {AccelerationWaveformEntity} from "../entities/acceleration-waveform.entity";

@injectable()
export class AccelerationWaveformRepository extends BaseRepository<AccelerationWaveformEntity, number> {

    constructor(@inject(TYPES.Connection) connection: Connection) {
        super(connection.getRepository(AccelerationWaveformEntity));
    }

}
