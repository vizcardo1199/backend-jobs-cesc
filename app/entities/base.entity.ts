import {Column} from "typeorm";

export class BaseEntity<T> {

    @Column({
        nullable: false
    })
    state: boolean;

    @Column({
        nullable: true,
        name: 'create_user'
    })
    createUser?: string;

    @Column({
        nullable: true,
        name: 'update_user'
    })
    updateUser?: string;

    @Column({
        nullable: true,
        name: 'create_date'
    })
    createDate?: Date;

    @Column({
        nullable: true,
        name: 'update_date'
    })
    updateDate?: Date;

    constructor(id: T | null) {
        this.state = true;
    }
}
