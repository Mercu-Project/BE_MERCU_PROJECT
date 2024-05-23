const app = require('./src/server');

require('dotenv').config();
require('colors');

const { PORT } = process.env;

app.listen(PORT, () => {
    console.log(`📢\t: http://127.0.0.1:${PORT}`.blue.underline);
});
