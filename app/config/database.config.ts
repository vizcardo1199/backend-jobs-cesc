import {injectable} from 'inversify';
import {Connection, createConnection} from 'typeorm';

@injectable()
export class DatabaseConfiguration {

    configure(): Promise<Connection> {
        const config: any = {
            type: process.env.DATABASE_TYPE,
            host: process.env.DATABASE_HOST,
            port: process.env.DATABASE_PORT,
            username: process.env.DATABASE_USERNAME,
            password: process.env.DATABASE_PASSWORD,
            database: process.env.DATABASE_NAME,
            extra: {
                connectionLimit: process.env.DATABASE_MAX_POOL_SIZE
            },
            logging: this.getLogging(),
            synchronize: false,
            entities: ['**/entities/**/*.js'],
            migrations: ['app/migration/**/*.ts'],
            subscribers: ['app/subscriber/**/*.ts'],
            cli: {
                entitiesDir: 'app/entities',
                migrationsDir: 'app/migration',
                subscribersDir: 'app/subscriber'
            }
        };
        return createConnection(config);
    }

    private getLogging(): boolean | string[] {
        if (process.env.DATABASE_LOGGING == null) {
            return false;
        }
        if (process.env.DATABASE_LOGGING.indexOf(',') >= 0) {
            return process.env.DATABASE_LOGGING.split(',').map(c => c.trim());
        }
        return process.env.DATABASE_LOGGING === 'true';
    }
}
