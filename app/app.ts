//Requires
import "reflect-metadata";
import dotenv from 'dotenv';
import container, {applyConfigurationContainer, applyContainer} from "./config/inversify.config";
import {DatabaseConfiguration} from "./config/database.config";
import {TYPES} from "./config/types";
import {CrontabConfig} from "./config/crontab.config";
import {AppLogger, configureLogApp} from "./config/log.config";

//intialize dotenv
dotenv.config();

//log config
configureLogApp();

//initialize container
applyConfigurationContainer();

const logger = AppLogger.getDefaultLogger();

process.on("uncaughtException", e => {
    logger.error(e);
    process.exit(1);
});

process.on("unhandledRejection", e => {
    const obj: any = e;
    logger.error(obj);
    process.exit(1);
});

const continueConfiguration = () => {
    // Create a new express application instance
    const cronTabConfig: CrontabConfig = container.get<CrontabConfig>(TYPES.CrontabConfig);

    //cronTab
    cronTabConfig.configure();

};

//initialize database
const init = (): Promise<void> => {
    return new Promise(
        async (resolve, reject) => {
            try {
                const databaseConfiguration: DatabaseConfiguration = container.get<DatabaseConfiguration>(TYPES.DatabaseConfiguration);
                const connection = await databaseConfiguration.configure();
                applyContainer(connection);
                continueConfiguration();
                logger.info('Base de datos:\x1b[32m online \x1b[0m');
                // never resolve, because we want that this promise never ends
            } catch (err) {
                reject(err);
            }
        }
    );
};

init().catch(err => logger.error(err));
