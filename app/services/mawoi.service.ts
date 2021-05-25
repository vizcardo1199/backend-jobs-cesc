import {inject, injectable} from "inversify";
import {TYPES} from "../config/types";
import {BaseService} from "./base.service";
import {MawoiEntity} from "../entities/mawoi.entity";
import {MawoiRepository} from "../repositories/mawoi.repository";

@injectable()
export class MawoiService extends BaseService<MawoiEntity, number> {

    constructor(@inject(TYPES.MawoiRepository) mawoiRepository: MawoiRepository) {
        super(mawoiRepository);
    }

}
