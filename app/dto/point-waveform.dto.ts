import {WaveformDto} from "./waveform.dto";

export class PointWaveformDto {

    id: number;
    waveformDto: WaveformDto[];

    constructor(id: number) {
        this.id = id;
        this.waveformDto = [];
    }

}
