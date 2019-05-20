import {config} from './index'

import { Options, Dialect } from 'sequelize';

const sequelizeConfig: Options = {
    database: config.db.database,
    username: config.db.username,
    password: config.db.password,
    host: config.db.host,
    dialect: config.db.dialect as Dialect,
    pool: {
        max: 10,
        min: 1,
        acquire: 30000,
        idle: 10000,
    },
    sync: {
        force: false,
    },
};

export { sequelizeConfig };