const bcrypt = require('bcryptjs');
require('dotenv').config();

const saltRounds = process.env.BCRYPT_SALT_ROUNDS;

const hashPassword = (password) => {
    const genSalt = bcrypt.genSaltSync(parseInt(saltRounds));
    const hash = bcrypt.hashSync(password, genSalt);
    return hash;
};

const comparePassword = (literal, hashed) => {
    return bcrypt.compareSync(literal, hashed);
};

module.exports = {
    hashPassword,
    comparePassword,
};
