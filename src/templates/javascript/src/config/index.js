module.exports = {
    db: {
        host: process.env.DB_HOST || 'localhost',
        username: process.env.DB_USERNAME || 'username',
        password: process.env.DB_PASSWORD || 'password',
        database: process.env.DB_DATABASE || 'database',
        dialect: process.env.DB_DIALECT || 'postgres',
    },
    http: {
        port: process.env.PORT || 3000,
        host: process.env.HOST || 'http://localhost:' + (process.env.PORT || 3000),
    },
};
