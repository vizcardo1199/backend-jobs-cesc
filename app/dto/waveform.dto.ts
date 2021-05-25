export class WaveformDto {

    id: number;
    measureX: number;
    measureY: number;

    constructor(id: number, measureX: number, measureY: number) {
        this.id = id;
        this.measureX = measureX;
        this.measureY = measureY;
    }
}
