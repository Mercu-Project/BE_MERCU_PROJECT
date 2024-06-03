const { httpResponse, serverErrorResponse } = require('../utils/httpResponse');
const db = require('../config/db');
const { validationResult } = require('express-validator');
const httpStatus = require('http-status');
const { ERR_MSG } = require('../utils/constants');
const checkValidation = require('../utils/checkValidationResult');

const createSession = async (req, res) => {
    try {
        const { name } = req.body;
    } catch (error) {
        
    }
}