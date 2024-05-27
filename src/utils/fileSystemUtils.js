const fs = require('fs');

const removeAllFiles = (files) => {
    Object.keys(files).forEach((key) => {
        try {
            fs.unlinkSync(files[key][0].path);
        } catch (err) {
            console.error(
                `Error removing file: ${files[key][0].path}, Error: ${err.message}`
            );
        }
    });
};

const removeDirIfEmpty = (files) => {
    const [firstKey, _] = Object.entries(files)[0];
    const uploadPath = files[firstKey][0].destination;
    try {
        const uploadFiles = fs.readdirSync(uploadPath);
        if (uploadFiles.length === 0) {
            fs.rmdirSync(uploadPath);
        }
    } catch (err) {
        console.error(
            `Error reading/removing directory: ${uploadPath}, Error: ${err.message}`
        );
    }
};

module.exports = {
    removeAllFiles,
    removeDirIfEmpty,
};
