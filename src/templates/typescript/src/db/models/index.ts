import * as fs from 'fs';
import * as path from 'path';
import { Sequelize } from 'sequelize';
const sequelize = new Sequelize(sequelizeConfig);

const db = { sequelize: {}, Sequelize: {}};

fs.readdirSync(__dirname)
    .filter((file) => {
        return (file.indexOf('.') !== 0) && (file !== 'index.ts' && file !== 'index.js');
    })
    .forEach((file) => {
        const model = sequelize['import'](path.join(__dirname, file));
        db[model.name] = model;
    });

Object.keys(db).forEach((modelName) => {
    if ('associate' in db[modelName]) {
        db[modelName].associate(db);
    }
});

if (sequelizeConfig.sync) {
    sequelize.sync(sequelizeConfig.sync);
}

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export {db};