
const rimraf = require('rimraf');
const path = require('path');

(async () => {
    const target = path.resolve('./dist');
    console.log(`Removing ${target}`);
    await rimraf.sync(target);
})();
