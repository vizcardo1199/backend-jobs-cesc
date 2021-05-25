import {inject, injectable} from "inversify";
import {Connection} from "typeorm";
import {TYPES} from "../config/types";
import {BaseRepository} from "./base.repository";
import {DisplacementWaveformEntity} from "../entities/displacement-waveform.entity";

@injectable()
export class DisplacementWaveformRepository extends BaseRepository<DisplacementWaveformEntity, number> {

    constructor(@inject(TYPES.Connection) connection: Connection) {
        super(connection.getRepository(DisplacementWaveformEntity));
    }

}
