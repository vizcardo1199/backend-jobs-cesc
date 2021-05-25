import {inject, injectable} from "inversify";
import {TYPES} from "../config/types";
import {DisplacementWaveformRepository} from "../repositories/displacement-waveform.repository";
import {BaseService} from "./base.service";
import {DisplacementWaveformEntity} from "../entities/displacement-waveform.entity";

@injectable()
export class DisplacementWaveformService extends BaseService<DisplacementWaveformEntity, number> {

    constructor(
        @inject(TYPES.DisplacementWaveformRepository) displacementWaveformRepository: DisplacementWaveformRepository
    ) {
        super(displacementWaveformRepository);
    }

}
