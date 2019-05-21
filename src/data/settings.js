const allSettings = [
    {
        name: 'Backend',
        default: 'Express',
        message: 'The HTTP Backend',
        type: 'list',
        choices: ['Express', 'Koa', 'Hapi'],
    },
    {
        name: 'ORM',
        message: 'The ORM to use',
        default: 'Sequelize',
        type: 'list',
        choices: ['Sequelize', 'Knex', 'Mongoose', 'None'],
    },
    {
        name: 'TypeScript',
        message: 'Use TypeScript?',
        default: false,
        type: 'confirm',
    },
    {
        name: 'Compression',
        message: 'Use Compression middleware?',
        default: true,
        type: 'confirm',
        when: (answers) => {
            return answers.Backend !== 'Hapi';
        },
    },
    {
        name: 'CookieParser',
        message: 'Use cookie middleware?',
        default: true,
        type: 'confirm',
        when: (answers) => {
            return answers.Backend !== 'Hapi';
        },
    },
    {
        name: 'Logger',
        message: 'The logger to use?',
        default: 'Morgan',
        type: 'list',
        choices: ['Morgan', 'Pino (Hapi Only)', 'None'],
    },
    {
        name: 'BodyParser',
        message: 'Use body-parser middleware?',
        default: true,
        type: 'confirm',
        when: (answers) => {
            return answers.Backend === 'Express' || answers.Backend === 'Koa';
        },
    },
    {
        name: 'BodyParserJSON',
        message: 'Use body-parser JSON middleware?',
        default: true,
        type: 'confirm',
        when: (answers) => {
            return !!answers.BodyParser;
        },
    },
    {
        name: 'BodyParserUrlEncoded',
        message: 'Use body-parser raw middleware?',
        default: true,
        type: 'confirm',
        when: (answers) => {
            return !!answers.BodyParser;
        },
    },
];

export default allSettings;
