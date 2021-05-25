import {Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {BaseEntity} from "./base.entity";
import {SurveyEntity} from "./survey.entity";

@Entity({
    name: 'waveforms_velocity'
})
export class VelocityWaveformEntity extends BaseEntity<number> {

    @PrimaryGeneratedColumn({
        name: 'row_waveform_velocity'
    })
    id: number | null;

    @Column({
        name: 'wfv_timestamp'
    })
    waveformTimestamp?: string;

    @Column({
        name: 'wfv_measure_x'
    })
    measureX?: number;

    @Column({
        name: 'wfv_measure_y'
    })
    measureY?: number;
    @Column({
        name: 'row_point'
    })
    pointId: number = 0;

    @JoinColumn({
        name: 'row_survey'
    })
    @ManyToOne(() => SurveyEntity, {
        eager: false
    })
    survey?: SurveyEntity;

    constructor(id: number | null = null) {
        super(id);
        this.id = id;
    }
}
