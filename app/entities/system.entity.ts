import {Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {BaseEntity} from "./base.entity";
import {AreaEntity} from "./area.entity";

@Entity({
    name: 'systems'
})
export class SystemEntity extends BaseEntity<number> {

    @PrimaryGeneratedColumn({
        name: 'row_system'
    })
    id: number | null;

    @Column({
        nullable: true,
        name: 'sy_code'
    })
    code?: string;

    @Column({
        nullable: true,
        name: 'sy_description'
    })
    description?: string;

    @JoinColumn({
        name: 'row_area'
    })
    @ManyToOne(() => AreaEntity, {
        eager: false
    })
    area?: AreaEntity;

    constructor(id: number | null = null) {
        super(id);
        this.id = id;
    }
}
