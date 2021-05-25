import {Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {BaseEntity} from "./base.entity";
import {SurveyEntity} from "./survey.entity";

@Entity({
    name: 'waveforms_acceleration'
})
export class AccelerationWaveformEntity extends BaseEntity<number> {

    @PrimaryGeneratedColumn({
        name: 'row_waveform_acceleration'
    })
    id: number | null;

    @Column({
        name: 'wfa_timestamp'
    })
    waveformTimestamp?: string;

    @Column({
        name: 'wfa_measure_x'
    })
    measureX?: number;

    @Column({
        name: 'wfa_measure_y'
    })
    measureY?: number;

    @Column({
        name: 'row_point'
    })
    pointId: number = 0;

    @JoinColumn({
        name: 'row_survey'
    })
    @ManyToOne(() => SurveyEntity, survey => survey.accelerationsWaveform, {
        eager: false
    })
    survey?: SurveyEntity;

    constructor(id: number | null = null) {
        super(id);
        this.id = id;
    }
}
