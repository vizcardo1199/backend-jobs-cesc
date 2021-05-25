import {inject, injectable} from "inversify";
import {TYPES} from "../config/types";
import {VelocityWaveformRepository} from "../repositories/velocity-waveform.repository";
import {BaseService} from "./base.service";
import {VelocityWaveformEntity} from "../entities/velocity-waveform.entity";

@injectable()
export class VelocityWaveformService extends BaseService<VelocityWaveformEntity, number> {

    constructor(@inject(TYPES.VelocityWaveformRepository)  velocityWaveformRepository: VelocityWaveformRepository) {
        super(velocityWaveformRepository);
    }

}
