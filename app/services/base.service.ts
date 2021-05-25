import {injectable} from "inversify";
import {BaseRepository} from "../repositories/base.repository";
import {isEmptyArray, isNewEntity} from "../utils/app.utils";
import {CoreException} from "../exceptions/core.exception";
import {ObjectType} from "typeorm";
import {BaseEntity} from "../entities/base.entity";
import {AppLogger} from "../config/log.config";

@injectable()
export class BaseService<Entity extends BaseEntity<Key>, Key> {

    private readonly logger = AppLogger.getLogger(BaseService.name);

    protected repository: BaseRepository<Entity, Key>;

    protected constructor(repository: BaseRepository<Entity, Key>) {
        this.repository = repository;
    }

    update(entity: Entity): Promise<Entity> {
        return this.repository.save(entity);
    }

    executeWriteAsTransaction(valuesToSave: any[][], types: ObjectType<unknown>[], useUpdate: boolean = false): Promise<any> {
        if (isEmptyArray(types) || isEmptyArray(valuesToSave)) {
            return Promise.reject(new CoreException('Array types and array values should have at least one element.'));
        }
        if (types.length !== valuesToSave.length) {
            return Promise.reject(new CoreException('Array types and array values should have the same length.'));
        }

        this.logger.debug('Start transaction...');
        return this.repository.startTransaction(async manager => {
            for (let index = 0; index < valuesToSave.length; index++) {
                const inserts: any[] = [];
                const saves: any[] = [];
                valuesToSave[index].forEach(x => isNewEntity(x) ? inserts.push(x) : saves.push(x));
                this.logger.debug('Inserting %d values and saving %d of: %s', inserts.length, saves.length, types[index]);

                if (!isEmptyArray(inserts)) {
                    await manager.insert(types[index], inserts.map(x => this.repository.auditEntity(x)));
                }
                if (!isEmptyArray(saves)) {
                    if (useUpdate) {
                        for (let j = 0; j < saves.length; j++) {
                            await manager.update(types[index], saves[j].id, this.auditForUpdate(saves[j]));
                        }
                    } else {
                        await manager.save(types[index], saves.map(x => this.repository.auditEntity(x)));
                    }
                }
            }
        });
    }

    private auditForUpdate(entity: Entity) {
        const copy = {...entity};
        const auditedEntity: any = this.repository.auditEntity(copy);
        delete auditedEntity.id;
        return auditedEntity;
    }

}
