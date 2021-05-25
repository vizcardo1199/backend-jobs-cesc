export class SurveyWaveformDb {

    surveyId: number;
    pointId: number;
    waveformId: number;
    measureX: number;
    measureY: number;

    constructor(surveyId: number, pointId: number, waveformId: number, measureX: number, measureY: number) {
        this.surveyId = surveyId;
        this.pointId = pointId;
        this.waveformId = waveformId;
        this.measureX = measureX;
        this.measureY = measureY;
    }
}
