import {inject, injectable} from "inversify";
import {TYPES} from "../config/types";
import {AccelerationWaveformRepository} from "../repositories/acceleration-waveform.repository";
import {AccelerationWaveformEntity} from "../entities/acceleration-waveform.entity";
import {BaseService} from "./base.service";

@injectable()
export class AccelerationWaveformService extends BaseService<AccelerationWaveformEntity, number> {

    constructor(
        @inject(TYPES.AccelerationWaveformRepository)
        private accelerationWaveformRepository: AccelerationWaveformRepository
    ) {
        super(accelerationWaveformRepository);
    }

}
