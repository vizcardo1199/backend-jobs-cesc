import {inject, injectable} from "inversify";
import {Connection} from "typeorm";
import {TYPES} from "../config/types";
import {BaseRepository} from "./base.repository";
import {VelocityWaveformEntity} from "../entities/velocity-waveform.entity";

@injectable()
export class VelocityWaveformRepository extends BaseRepository<VelocityWaveformEntity, number> {

    constructor(@inject(TYPES.Connection) connection: Connection) {
        super(connection.getRepository(VelocityWaveformEntity));
    }

}
