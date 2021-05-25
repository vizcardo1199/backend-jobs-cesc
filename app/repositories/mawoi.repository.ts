import {inject, injectable} from "inversify";
import {Connection} from "typeorm";
import {TYPES} from "../config/types";
import {BaseRepository} from "./base.repository";
import {MawoiEntity} from "../entities/mawoi.entity";

@injectable()
export class MawoiRepository extends BaseRepository<MawoiEntity, number> {

    constructor(@inject(TYPES.Connection) connection: Connection) {
        super(connection.getRepository(MawoiEntity));
    }

}
