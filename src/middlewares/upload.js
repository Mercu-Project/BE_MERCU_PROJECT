const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const createUploadDir = (outr_fldr, inr_fldr) => {
    const uploadDir = path.join(
        __dirname,
        '../',
        '../',
        'public/',
        'uploads/',
        outr_fldr,
        inr_fldr
    );

    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }

    return uploadDir;
};

const removeEmptyDir = (dirName) => {
    const dirPath = path.join(
        __dirname,
        '../',
        '../',
        'public/',
        'uploads/',
        dirName
    );
    const items = fs.readdirSync(dirPath);
    if (items.length > 0) {
        items.forEach((item) => {
            const fullPath = path.join(dirPath, item);
            const stats = fs.statSync(fullPath);
            if (stats.isDirectory()) {
                const subdirItems = fs.readdirSync(fullPath);
                if (subdirItems.length === 0) {
                    fs.rmdirSync(fullPath);
                }
            }
        });
    }
};

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const namaLengkap = req.body.nama_lengkap
            .toLowerCase()
            .replace(' ', '-');
        let uploadDir = path.join(
            __dirname,
            '../',
            '../',
            'public/',
            'uploads/'
        );
        if (req.baseUrl.includes('form-ta')) {
            removeEmptyDir('TA');
            uploadDir = createUploadDir('TA', namaLengkap);
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // const ext = path.extname(file.originalname);
        // const filenameWithoutExt = path.basename(file.originalname, ext);
        // const randChars = crypto.randomBytes(8).toString('hex');
        // const filename = filenameWithoutExt + '-' + randChars + ext;
        cb(null, file.originalname);
    },
});

const upload = multer({ storage });

module.exports = upload;
