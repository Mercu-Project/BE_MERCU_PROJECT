const express = require('express');
const cors = require('cors');
const path = require('path');
const routes = require('./routes');

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const uploadDir = path.join(__dirname, '../', 'public/', 'uploads/');
app.use('/uploads', express.static(uploadDir));

const imgDir = path.join(__dirname, '../', 'public/', 'uploads/');
app.use('/img', express.static(imgDir));

app.use('/api', routes);
app.use((_, res) => {
    res.status(404).json({ message: 'API not found.' });
});

module.exports = app;
