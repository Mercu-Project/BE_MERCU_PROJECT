const { DATE_FMT_TYPE, DATE_TZ } = require('./constants');
const moment = require('moment-timezone');

function convertToJakartaTime(date, type = DATE_FMT_TYPE.DATETIME) {
    const jakartaTime = moment(date).tz(DATE_TZ.JAKARTA);
    switch (type) {
        case DATE_FMT_TYPE.DATE:
            return jakartaTime.format('YYYY-MM-DD');
        case DATE_FMT_TYPE.DATETIME:
        case DATE_FMT_TYPE.TIMESTAMP:
            return jakartaTime.format('YYYY-MM-DD HH:mm:ss');
        default:
            throw new Error(
                'Invalid type specified. Use "date", "datetime", or "timestamp".'
            );
    }
}

function getCurrentTime(type = DATE_FMT_TYPE.DATETIME) {
    const nowInJakarta = moment().tz(DATE_TZ.JAKARTA);

    switch (type) {
        case DATE_FMT_TYPE.DATE:
            return nowInJakarta.format('YYYY-MM-DD');
        case DATE_FMT_TYPE.DATETIME:
        case DATE_FMT_TYPE.TIMESTAMP:
            return nowInJakarta.format('YYYY-MM-DD HH:mm:ss');
        default:
            throw new Error(
                'Invalid type specified. Use "date", "datetime", or "timestamp".'
            );
    }
}

module.exports = { convertToJakartaTime, getCurrentTime };
