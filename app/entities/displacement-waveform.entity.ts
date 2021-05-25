import {Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {BaseEntity} from "./base.entity";
import {SurveyEntity} from "./survey.entity";

@Entity({
    name: 'waveforms_displacement'
})
export class DisplacementWaveformEntity extends BaseEntity<number> {

    @PrimaryGeneratedColumn({
        name: 'row_waveform_displacement'
    })
    id: number | null;

    @Column({
        name: 'wfd_timestamp'
    })
    waveformTimestamp?: string;

    @Column({
        name: 'wfd_measure_x'
    })
    measureX?: number;

    @Column({
        name: 'wfd_measure_y'
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
