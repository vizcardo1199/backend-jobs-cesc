import {Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {BaseEntity} from "./base.entity";
import {PlantEntity} from "./plant.entity";

@Entity({
    name: 'areas'
})
export class AreaEntity extends BaseEntity<number> {

    @PrimaryGeneratedColumn({
        name: 'row_area'
    })
    id: number | null;

    @Column({
        nullable: true,
        name: 'ar_code'
    })
    code?: string;

    @Column({
        nullable: true,
        name: 'ar_description'
    })
    description?: string;

    @JoinColumn({
        name: 'row_plant'
    })
    @ManyToOne(() => PlantEntity, {
        eager: false
    })
    plant?: PlantEntity;

    constructor(id: number | null = null) {
        super(id);
        this.id = id;
    }
}
