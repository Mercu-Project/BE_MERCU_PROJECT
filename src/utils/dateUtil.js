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

function getDayDifference(inputDate) {
    const date = moment.tz(inputDate, DATE_TZ.JAKARTA);
    const today = moment.tz(DATE_TZ.JAKARTA).startOf('day');
    const dayDifference = date.diff(today, 'days');
    return dayDifference;
}

function is7DaysAway(inputDateTime) {
    // Parse the input datetime string to a Date object
    const inputDate = new Date(inputDateTime);

    // Get today's date (only the date part, without time)
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset the time part of today to midnight

    // Calculate the difference in time (milliseconds) between inputDate and today
    const timeDifference = inputDate.getTime() - today.getTime();

    // Convert the difference from milliseconds to days
    const dayDifference = timeDifference / (1000 * 60 * 60 * 24);

    // Check if the difference is exactly 7 days
    return dayDifference === 7;
}

function formatIndonesianDate(dateInput) {
    const months = [
        'Januari',
        'Februari',
        'Maret',
        'April',
        'Mei',
        'Juni',
        'Juli',
        'Agustus',
        'September',
        'Oktober',
        'November',
        'Desember',
    ];

    const date = new Date(dateInput);
    const day = String(date.getDate()).padStart(2, '0');
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    return `${day} ${month} ${year}`;
}

module.exports = {
    convertToJakartaTime,
    getCurrentTime,
    is7DaysAway,
    getDayDifference,
    formatIndonesianDate,
};
