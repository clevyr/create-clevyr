import {config} from './index'

const sequelizeConfig = {
    database: config.db.database,
    username: config.db.username,
    password: config.db.password,
    host: config.db.host,
    dialect: config.db.dialect,
    pool: {
        max: 10,
        min: 1,
        acquire: 30000,
        idle: 10000,
    },
    operatorsAliases: false,
    sync: {
        force: false,
    },
};

export { sequelizeConfig };