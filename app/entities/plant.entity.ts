import {Column, Entity, PrimaryGeneratedColumn} from "typeorm";
import {BaseEntity} from "./base.entity";

@Entity({
    name: 'plants'
})
export class PlantEntity extends BaseEntity<number> {

    @PrimaryGeneratedColumn({
        name: 'row_plant'
    })
    id: number | null;

    @Column({
        nullable: true,
        name: 'pl_code'
    })
    code?: string;

    @Column({
        nullable: true,
        name: 'pl_description'
    })
    description?: string;

    @Column({
        nullable: true,
        name: 'pl_gmt'
    })
    gmt?: string;

    constructor(id: number | null = null) {
        super(id);
        this.id = id;
    }
}
