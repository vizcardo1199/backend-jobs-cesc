import {Column, Entity, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import {BaseEntity} from "./base.entity";
import {AccelerationWaveformEntity} from "./acceleration-waveform.entity";

@Entity({
    name: 'surveys'
})
export class SurveyEntity extends BaseEntity<number> {

    @PrimaryGeneratedColumn({
        name: 'row_survey'
    })
    id: number | null;

    @Column({
        nullable: false,
        name: 'sv_measure_timestamp'
    })
    measureTimestamp?: Date;

    @Column({
        nullable: false,
        name: 'sv_init_date'
    })
    initDate?: Date;

    @Column({
        nullable: false,
        name: 'sv_end_date'
    })
    endDate?: Date;

    @Column({
        nullable: false,
        name: 'sv_gmt'
    })
    gmt?: string;

    @Column({
        nullable: false,
        name: 'sv_waveform_processed'
    })
    waveformProcessed?: boolean;

    @OneToMany(() => AccelerationWaveformEntity, accelerationWaveform => accelerationWaveform.survey, {
        lazy: true
    })
    accelerationsWaveform?: Promise<AccelerationWaveformEntity[]>;

    constructor(id: number | null = null) {
        super(id);
        this.id = id;
    }
}
