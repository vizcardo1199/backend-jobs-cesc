import {BaseEntity} from "../entities/base.entity";
import {injectable} from "inversify";
import {EntityManager, Repository} from "typeorm";
import {isNewEntity} from "../utils/app.utils";
import {AUDIT_USER} from "../config/constants.config";

@injectable()
export class BaseRepository<Entity extends BaseEntity<Key>, Key> {

    private static auditValues(state: boolean) {
        return {
            createDate: new Date(),
            updateDate: new Date(),
            createUser: AUDIT_USER,
            updateUser: AUDIT_USER,
            state: state
        };
    }

    protected repository: Repository<Entity>;

    constructor(repository: Repository<Entity>) {
        this.repository = repository;
    }

    auditEntity(entity: Entity): Entity {
        let audit = BaseRepository.auditValues(entity.state);
        if (isNewEntity(entity)) {
            entity.createDate = audit.createDate;
            entity.createUser = audit.createUser;
        }
        entity.updateDate = audit.updateDate;
        entity.updateUser = audit.updateUser;
        return entity;
    }

    save(entity: Entity): Promise<Entity> {
        const entityToSave: any = this.auditEntity(entity);
        return this.repository.save(entityToSave);
    }

    saveAll(entities: Entity[]): Promise<Entity[]> {
        const entitiesToSave: any = entities.map(x => this.auditEntity(x));
        return this.repository.save(entitiesToSave);
    }

    findById(id: Key): Promise<Entity | undefined> {
        return this.repository.findOne(id);
    }

    findByIdOrFail(id: Key): Promise<Entity> {
        return this.repository.findOneOrFail(id);
    }

    startTransaction<E>(func: (manager: EntityManager) => Promise<E>): Promise<E> {
        return this.repository.manager.transaction(func);
    }

}
