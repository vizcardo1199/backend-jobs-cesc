import {Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {BaseEntity} from "./base.entity";
import {SystemEntity} from "./system.entity";

@Entity({
    name: 'mawois'
})
export class MawoiEntity extends BaseEntity<number> {

    @PrimaryGeneratedColumn({
        name: 'row_mawoi'
    })
    id: number | null;

    @Column({
        nullable: true,
        name: 'mw_code'
    })
    code?: string;

    @Column({
        nullable: true,
        name: 'mw_alarm_factor'
    })
    alarmFactor?: number;

    @Column({
        nullable: true,
        name: 'mw_description'
    })
    description?: string;

    @Column({
        name: 'mw_current_state'
    })
    currentState?: string;

    @Column({
        nullable: true,
        name: 'mw_last_active_timestamp'
    })
    lastActiveTimestamp?: Date;

    @Column({
        nullable: true,
        name: 'mw_last_temperature'
    })
    temperature?: number;

    @JoinColumn({
        name: 'row_system'
    })
    @ManyToOne(() => SystemEntity, {
        eager: false
    })
    system?: SystemEntity;

    constructor(id: number | null = null) {
        super(id);
        this.id = id;
    }
}
