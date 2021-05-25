import {PointWaveformDto} from "./point-waveform.dto";

export class SurveyWaveformDto {

    id: number;
    points: PointWaveformDto[];

    constructor(id: number) {
        this.id = id;
        this.points = [];
    }

}
