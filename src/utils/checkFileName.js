const validateFileNameFormat = (file, nim, namaLengkap, docType) => {
    const [one, two, three] = file.originalname.split('-');
    if (nim !== one || namaLengkap !== two || docType !== three.split('.')[0]) {
        return false;
    }

    return true;
};

module.exports = {
    validateFileNameFormat,
};
