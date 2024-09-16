const db = require('../config/db');
const { httpResponse, serverErrorResponse } = require('../utils/httpResponse');
const { validationResult } = require('express-validator');
const httpStatus = require('http-status');
const moment = require('moment-timezone');
const ExcelJS = require('exceljs');
const { buildPaginationData } = require('../utils/pagination');

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
                    acc.id,
                    acc.username,
                    u.full_name,
                    u.status
                FROM
                    accounts acc
                JOIN users u ON u.account_id = acc.id
                WHERE
                    acc.username = ?
            `,
            [nim]
        );

        if (userRows.length === 0) {
            return httpResponse(
                res,
                httpStatus.NOT_FOUND,
                'User tidak ditemukan'
            );
        }

        if (userRows[0].status !== '1') {
            return httpResponse(res, httpStatus.FORBIDDEN, 'User tidak aktif');
        }

        const [checkScannedRows] = await db.execute(
            `
                SELECT COUNT(*) AS scan_count
                FROM canteen_scans
                WHERE account_id = ? AND DATE(created_at) = CURRENT_DATE
            `,
            [userRows[0].id]
        );

        if (checkScannedRows[0].scan_count > 0) {
            return httpResponse(
                res,
                httpStatus.BAD_REQUEST,
                'User ini sudah scan'
            );
        }

        let hideLength = userRows[0].username.length - 3;
        let mask = 'x'.repeat(hideLength);
        let hiddenNumber = userRows[0].username.substring(0, 3) + mask;

        await db.execute(
            `
                INSERT INTO canteen_scans
                (account_id, scanned_at)
                VALUES
                (?, ?)
            `,
            [userRows[0].id, scanned_at]
        );

        const response = {
            nim: hiddenNumber,
            fullName: userRows[0].full_name,
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
                    acc.username AS nim,
                    u.full_name AS fullName,
                    cs.scanned_at AS scannedAt
                FROM 
                    accounts acc
                JOIN users u ON acc.id = u.account_id
                JOIN canteen_scans cs ON cs.account_id = acc.id
                WHERE DATE(cs.created_at) = CURDATE()
                ORDER BY
                    cs.created_at
                DESC
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
                    FROM accounts acc
                    JOIN users u ON acc.id = u.account_id
                    JOIN canteen_scans cs ON cs.account_id = acc.id
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

const exportCanteenScan = async (req, res) => {
    try {
        const { from, to } = req.query;

        const [rows] = await db.execute(
            `
                SELECT u.full_name AS Nama, IFNULL(u.unit, '-') AS Unit, COUNT(cs.id) AS JumlahScan,
                    CONCAT(
                        DATE_FORMAT(MIN(CONVERT_TZ(cs.created_at, '+00:00', 'Asia/Jakarta')), '%e %b %Y'), ' - ',
                        DATE_FORMAT(MAX(CONVERT_TZ(cs.created_at, '+00:00', 'Asia/Jakarta')), '%e %b %Y')
                    ) AS ScanDates,
                     acc.username AS Nik
                FROM users u
                LEFT JOIN canteen_scans cs ON u.account_id = cs.account_id
                JOIN accounts acc ON u.account_id = acc.id
                WHERE DATE(CONVERT_TZ(cs.created_at, '+00:00', 'Asia/Jakarta')) BETWEEN ? AND ?
                GROUP BY u.id
                ORDER BY JumlahScan DESC
            `,
            [from, to]
        );

        // Calculate the total sum of JumlahScan
        const totalScan = rows.reduce((acc, row) => acc + row.JumlahScan, 0);

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Canteen Scan');

        // Format the 'from' and 'to' dates to Indonesian format
        const formattedFrom = moment(from)
            .tz('Asia/Jakarta')
            .format('D MMM YYYY');
        const formattedTo = moment(to).tz('Asia/Jakarta').format('D MMM YYYY');
        const mergedHeader = `Data ini diambil dari Rentang Waktu: ${formattedFrom} - ${formattedTo}`;

        // Add a merged header row
        worksheet.addRow([mergedHeader]);
        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).alignment = {
            vertical: 'middle',
            horizontal: 'left',
        };

        // Merge cells for the merged header row (across 4 columns instead of 5)
        // Adjusted to merge only across 4 columns (No, Nama, Jumlah Scan, Unit)
        worksheet.mergeCells('A1:D1');

        // Add a spacer row
        worksheet.addRow([]);

        // Add column headers manually since they disappear when merging cells
        worksheet.addRow(['No', 'Nama', 'NIK', 'Unit', 'Jumlah Scan']);

        // Apply styles to the header row (row 3)
        // Note that ExcelJS uses 1-based indexing for rows and columns
        worksheet.getRow(3).eachCell((cell) => {
            cell.font = { bold: true };
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' },
            };
        });

        // Add rows from your data
        rows.forEach((row, index) => {
            const newRow = worksheet.addRow([
                index + 1,
                row.Nama,
                row.Nik,
                row.Unit,
                row.JumlahScan,
            ]);
            newRow.eachCell((cell, colNumber) => {
                cell.alignment = {
                    vertical: 'middle',
                    horizontal:
                        colNumber === 2 || colNumber === 3 ? 'left' : 'center', // 'Nama' and 'NIK' left, others center
                };
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' },
                };
            });
        });

        // Add the Total Scan row
        worksheet.addRow([]); // Spacer row
        const totalRow = worksheet.addRow([
            '', // Empty cell for 'No'
            '', // Empty cell for 'Nama'
            '', // Empty cell for 'NIK'
            'Total Scan',
            totalScan, // Total Scan in 'Jumlah Scan' column
        ]);

        // Apply styles to the Total Scan row
        totalRow.getCell(4).font = { bold: true }; // 'Total Scan' label
        totalRow.getCell(4).alignment = {
            vertical: 'middle',
            horizontal: 'left',
        };

        totalRow.getCell(5).font = { bold: true }; // Total Scan value
        totalRow.getCell(5).alignment = {
            vertical: 'middle',
            horizontal: 'center',
        };
        // No borders for the Total Scan value cell

        // Calculate the maximum length of 'Nama' values and adjust the width
        let maxLength = 30; // Default width
        rows.forEach((row) => {
            const cellLength = row.Nama.length;
            if (cellLength > maxLength) {
                maxLength = cellLength + 5; // Add some padding
            }
        });

        // Manually set column widths
        worksheet.getColumn(1).width = 10; // Width for 'No'
        worksheet.getColumn(2).width = maxLength; // Width for 'Nama'
        worksheet.getColumn(3).width = 15; // Width for 'NIK'
        worksheet.getColumn(4).width = 15; // Width for 'Unit'
        worksheet.getColumn(5).width = 20; // Expanded width for 'Jumlah Scan'

        const filename =
            'canteen_scans_' +
            moment().tz('Asia/Jakarta').format('YYYYMMDDHHmmss');

        const buffer = await workbook.xlsx.writeBuffer();
        res.setHeader(
            'Content-Disposition',
            `attachment; filename="${filename}.xlsx"`
        );
        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );
        res.send(buffer);
    } catch (error) {
        return serverErrorResponse(res, error);
    }
};

const getScannedData = async (req, res) => {
    try {
        const { from, to, limit = 10, page = 1 } = req.query;
        const offset = (page - 1) * limit;

        const [[{ total }]] = await db.execute(
            `
                SELECT COUNT(DISTINCT u.id) AS total
                FROM users u
                LEFT JOIN canteen_scans cs ON u.account_id = cs.account_id
                WHERE CONVERT_TZ(cs.created_at, '+00:00', '+07:00') BETWEEN ? AND ?
            `,
            [from, to]
        );

        const [rows] = await db.execute(
            `
                SELECT u.full_name AS Nama, IFNULL(u.unit, '-') AS Unit, COUNT(cs.id) AS JumlahScan, 
                    CONCAT(
                        DATE_FORMAT(MIN(CONVERT_TZ(cs.created_at, '+00:00', 'Asia/Jakarta')), '%e %b %Y'), ' - ', 
                        DATE_FORMAT(MAX(CONVERT_TZ(cs.created_at, '+00:00', 'Asia/Jakarta')), '%e %b %Y')
                    ) AS ScanDates,
                     acc.username AS Nik
                FROM users u
                LEFT JOIN canteen_scans cs ON u.account_id = cs.account_id
                JOIN accounts acc ON u.account_id = acc.id
                WHERE DATE(CONVERT_TZ(cs.created_at, '+00:00', 'Asia/Jakarta')) BETWEEN ? AND ?
                GROUP BY u.id
                ORDER BY JumlahScan DESC
                LIMIT ${limit} OFFSET ${offset}

            `,
            [from, to]
        );

        const pagination = buildPaginationData(limit, page, total);

        return httpResponse(
            res,
            httpStatus.OK,
            'Get scanned data',
            rows,
            pagination
        );
    } catch (error) {
        return serverErrorResponse(res, error);
    }
};

module.exports = {
    inputScan,
    getLastScanningQr,
    resetLastScanningQR,
    getStatistics,
    exportCanteenScan,
    getScannedData,
};
