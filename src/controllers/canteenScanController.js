const db = require('../config/db');
const { httpResponse, serverErrorResponse } = require('../utils/httpResponse');
const { validationResult } = require('express-validator');
const httpStatus = require('http-status');
const moment = require('moment-timezone');

const inputScan = async (req, res) => {
    try {
        const { nim, scanned_at } = req.body;

        /* Validate time break setup */
        const [timeBreakRows] = await db.execute(
            `
                SELECT
                    session_open,
                    session_close
                FROM
                    time_break_sessions
                WHERE
                    status = '1'
            `
        );

        if (timeBreakRows.length === 0) {
            return httpResponse(
                res,
                httpStatus.BAD_REQUEST,
                'No session is active'
            );
        }

        const isInSession = timeBreakRows.some((time) => {
            const scannedTime = scanned_at;
            const sessionOpen = time.session_open;
            const sessionClose = time.session_close;

            return scannedTime >= sessionOpen && scannedTime <= sessionClose;
        });

        if (!isInSession) {
            return httpResponse(
                res,
                httpStatus.BAD_REQUEST,
                'Session is closed.'
            );
        }

        const [userRows] = await db.execute(
            `
                SELECT
                    u.id,
                    u.username,
                    l.full_name,
                    l.jabatan_akademik
                FROM
                    users u
                JOIN
                    lecturers l ON u.id = l.user_id
                WHERE
                    u.username = ?
            `,
            [nim]
        );

        const [checkScannedRows] = await db.execute(
            `
                SELECT COUNT(*) AS scan_count
                FROM canteen_scans
                WHERE user_id = ? AND DATE(created_at) = CURRENT_DATE
            `,
            [userRows[0].id]
        );

        if (checkScannedRows[0].scan_count > 0) {
            return httpResponse(
                res,
                httpStatus.BAD_REQUEST,
                'this account has been scanned'
            );
        }

        if (userRows.length === 0) {
            return httpResponse(
                res,
                httpStatus.BAD_REQUEST,
                'nim tidak ditemukan'
            );
        }

        let hideLength = userRows[0].username.length - 3;
        let mask = 'x'.repeat(hideLength);
        let hiddenNumber = userRows[0].username.substring(0, 3) + mask;

        await db.execute(
            `
                INSERT INTO canteen_scans
                (user_id, scanned_at)
                VALUES
                (?, ?)
            `,
            [userRows[0].id, scanned_at]
        );

        const response = {
            nim: hiddenNumber,
            fullName: userRows[0].full_name,
            jabatan: userRows[0].jabatan_akademik,
        };

        return httpResponse(res, httpStatus.OK, 'scan success', response);
    } catch (error) {
        return serverErrorResponse(res, error);
    }
};

const getLastScanningQr = async (req, res) => {
    try {
        const [rows] = await db.execute(
            `
                SELECT
                    u.username AS nim,
                    l.full_name AS fullName
                FROM 
                    users u
                JOIN lecturers l ON u.id = l.user_id
                JOIN canteen_scans cs ON cs.user_id = u.id
                WHERE DATE(cs.created_at) = CURDATE()
                ORDER BY
                    cs.created_at
                DESC LIMIT 5
            `
        );

        return httpResponse(res, httpStatus.OK, 'get last scanning qr', rows);
    } catch (error) {
        return serverErrorResponse(res, error);
    }
};

//! For Development Only
const resetLastScanningQR = async (req, res) => {
    try {
        const [resetLastScanning] = await db.execute(
            `
                DELETE cs
                FROM canteen_scans cs
                JOIN (
                    SELECT cs.id
                    FROM users u
                    JOIN lecturers l ON u.id = l.user_id
                    JOIN canteen_scans cs ON cs.user_id = u.id
                    WHERE DATE(cs.created_at) = CURDATE()
                    ORDER BY cs.created_at DESC
                    LIMIT 5
                ) AS subquery
                ON cs.id = subquery.id
            `
        );

        if (resetLastScanning.affectedRows === 0) {
            throw new Error('Reset failed');
        }

        return httpResponse(
            res,
            httpStatus.OK,
            'Last scanning has been reset.'
        );
    } catch (error) {
        return serverErrorResponse(res, error);
    }
};

const getStatistics = async (req, res) => {
    try {
        const { filter_by } = req.query;

        let sql;
        let periods = [];
        let queryParams = [];

        if (filter_by === 'month') {
            sql = `
                SELECT 
                    DATE_FORMAT(CONVERT_TZ(created_at, '+00:00', 'Asia/Jakarta'), '%Y-%m') AS period,
                    COUNT(*) AS scan_count
                FROM 
                    canteen_scans
                GROUP BY 
                    period
                ORDER BY 
                    period;
            `;
            const startDate = moment().startOf('year');
            const endDate = moment().endOf('year');
            while (startDate.isBefore(endDate)) {
                periods.push(startDate.format('YYYY-MM'));
                startDate.add(1, 'month');
            }
        } else if (filter_by === 'day') {
            const startDate = moment().startOf('isoWeek'); // Start of the current week (Monday)
            const endDate = moment().endOf('isoWeek'); // End of the current week (Sunday)

            sql = `
                SELECT 
                    DATE_FORMAT(CONVERT_TZ(created_at, '+00:00', 'Asia/Jakarta'), '%Y-%m-%d') AS period,
                    COUNT(*) AS scan_count
                FROM 
                    canteen_scans
                WHERE 
                    created_at BETWEEN ? AND ?
                GROUP BY 
                    period
                ORDER BY 
                    period;
            `;

            queryParams = [
                startDate.format('YYYY-MM-DD'),
                endDate.format('YYYY-MM-DD'),
            ];

            while (startDate.isBefore(endDate)) {
                periods.push(startDate.format('YYYY-MM-DD'));
                startDate.add(1, 'day');
            }
        } else if (filter_by === 'week') {
            const month = moment().format('YYYY-MM');
            sql = `
                SELECT 
                    CONCAT(YEAR(CONVERT_TZ(created_at, '+00:00', 'Asia/Jakarta')), '-W', WEEK(CONVERT_TZ(created_at, '+00:00', 'Asia/Jakarta'))) AS period,
                    COUNT(*) AS scan_count
                FROM 
                    canteen_scans
                GROUP BY 
                    period
                ORDER BY 
                    period;
            `;

            const startDate = moment(month, 'YYYY-MM').startOf('month');
            const endDate = moment(month, 'YYYY-MM').endOf('month');
            let weekNums = 1;
            while (startDate.isBefore(endDate)) {
                // periods.push(startDate.format('YYYY-[W]WW'));
                periods.push('Minggu ' + weekNums);
                startDate.add(1, 'week');
                weekNums++;
            }
        } else {
            throw new Error('Invalid filter');
        }

        const [rows] = await db.execute(sql, queryParams);

        const scanData = [];
        rows.forEach((item) => {
            scanData[item.period] = item.scan_count;
        });

        let labels, data;

        if (filter_by === 'month') {
            labels = periods.map((period) =>
                moment(period, 'YYYY-MM').format('MMMM')
            );
            data = periods.map((period) => scanData[period] || 0);
        } else if (filter_by === 'week') {
            labels = periods;
            data = periods.map((_, index) => {
                const periodKey = rows[index]?.period || `2024-W${index + 1}`;
                return scanData[periodKey] || 0;
            });
        } else {
            labels = periods;
            data = periods.map((period) => scanData[period] || 0);
        }

        const response = {
            labels,
            datasets: [
                {
                    label: `Scans per ${
                        filter_by.charAt(0).toUpperCase() + filter_by.slice(1)
                    }`,
                    data: data,
                    borderColor:
                        filter_by === 'month'
                            ? 'rgb(255, 99, 132)'
                            : filter_by === 'day'
                            ? 'rgb(53, 162, 235)'
                            : 'rgb(75, 192, 192)',
                    backgroundColor:
                        filter_by === 'month'
                            ? 'rgba(255, 99, 132, 0.5)'
                            : filter_by === 'day'
                            ? 'rgba(53, 162, 235, 0.5)'
                            : 'rgba(75, 192, 192, 0.5)',
                },
            ],
        };

        return httpResponse(res, httpStatus.OK, 'get stats', response);
    } catch (error) {
        return serverErrorResponse(res, error);
    }
};

module.exports = {
    inputScan,
    getLastScanningQr,
    resetLastScanningQR,
    getStatistics,
};
