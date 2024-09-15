const exportCanteenScan = async (req, res) => {
    try {
        const { from, to } = req.query;

        const [rows] = await db.execute(
            `
                SELECT u.full_name AS Nama, IFNULL(u.unit, '-') AS Unit, COUNT(cs.id) AS JumlahScan,
                    CONCAT(
                        DATE_FORMAT(MIN(CONVERT_TZ(cs.created_at, '+00:00', 'Asia/Jakarta')), '%e %b %Y'), ' - ',
                        DATE_FORMAT(MAX(CONVERT_TZ(cs.created_at, '+00:00', 'Asia/Jakarta')), '%e %b %Y')
                    ) AS ScanDates
                FROM users u
                LEFT JOIN canteen_scans cs ON u.account_id = cs.account_id
                WHERE DATE(CONVERT_TZ(cs.created_at, '+00:00', 'Asia/Jakarta')) BETWEEN ? AND ?
                GROUP BY u.id
                ORDER BY JumlahScan DESC
            `,
            [from, to]
        );

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Canteen Scan');

        // Format the 'from' and 'to' dates to Indonesian format
        const formattedFrom = moment(from)
            .tz('Asia/Jakarta')
            .format('D MMM YYYY');
        const formattedTo = moment(to).tz('Asia/Jakarta').format('D MMM YYYY');
        const mergedHeader = `Rentang Tanggal Waktu: ${formattedFrom} - ${formattedTo}`;

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

        // Add your column headers after the merged row and spacer
        // Ensure headers are added correctly
        worksheet.columns = [
            { header: 'No', key: 'No', width: 10 },
            { header: 'Nama', key: 'Nama', width: 30 },
            { header: 'Jumlah Scan', key: 'JumlahScan', width: 15 },
            { header: 'Unit', key: 'Unit', width: 15 },
        ];

        // Add column headers manually since they disappear when merging cells
        worksheet.addRow(['No', 'Nama', 'Jumlah Scan', 'Unit']);

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
            const newRow = worksheet.addRow({ No: index + 1, ...row });
            newRow.eachCell((cell) => {
                cell.alignment = { vertical: 'middle', horizontal: 'center' };
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' },
                };
            });
        });

        // Adjust column width for 'Nama'
        const column = worksheet.getColumn('Nama');
        let maxLength = 30;
        rows.forEach((row) => {
            if (row.Nama.length > maxLength) {
                maxLength = row.Nama.length + 5;
            }
        });
        column.width = maxLength;

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
