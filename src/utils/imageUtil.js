const fs = require('fs');
const path = require('path');

const toBase64 = (filePath) => {
    const fullPath = path.join(__dirname, '../../public', filePath);
    const image = fs.readFileSync(fullPath);
    return Buffer.from(image).toString('base64');
};

module.exports = {
    toBase64,
};
