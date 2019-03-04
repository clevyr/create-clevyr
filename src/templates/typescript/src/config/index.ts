const config = {
    http: {
        port: process.env.PORT || 3000,
        host: process.env.HOST || 'http://localhost:' + (process.env.PORT || 3000),
        listenHost: '127.0.0.1'
    },
    db: {
        database: process.env.DB_DATABASE || 'database',
        username: process.env.DB_USERNAME || 'username',
        password: process.env.DB_PASSWORD || 'password',
        host: process.env.DB_HOST || 'localhost',
        dialect: process.env.DB_DIALECT || 'postgres',
    }
};

export {config};
