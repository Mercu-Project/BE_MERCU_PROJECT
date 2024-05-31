const { httpResponse, serverErrorResponse } = require('../utils/httpResponse');
const db = require('../config/db');
const httpStatus = require('http-status');
const checkValidation = require('../utils/checkValidationResult');
const { validationResult } = require('express-validator');
const { removeAllFiles } = require('../utils/fileSystemUtils');
const { PAGINATION } = require('../utils/constants');
const buildPaginationData = require('../utils/pagination');

const submitForm = async (req, res) => {
    try {
        checkValidation(res, 'Validation errors', validationResult(req));

        const {
            form_academic_year_id,
            nim,
            dosen_pembimbing_ta_id,
            judul,
            peminatan,
            jenis_sidang,
            bentuk_ta,
            jenis_ta,
            skema_ta,
        } = req.body;

        if (nim !== req.user.username) {
            removeAllFiles(req.files);
            return httpResponse(res, httpStatus.BAD_REQUEST, 'NIM anda salah');
        }

        const {
            formular_persetujuan,
            sertifikasi_kompetensi_bnsp,
            formular_bebas_adm_keuangan,
            formular_verifikasi_dosen_pembimbing_akademik,
            bukti_bebas_pinjaman_perpustakaan,
            formular_monitoring_sertifikat_skpi,
            bukti_upload_skpi,
            surat_persetujuan_pra_sidang_ta,
            laporan_ta,
        } = req.files;

        /* Form Validation */
        const [formRows] = await db.execute(
            'SELECT eff_date, end_eff_date FROM form_academic_years WHERE id = ?',
            [form_academic_year_id]
        );

        if (formRows.length < 1) {
            removeAllFiles(req.files);
            return httpResponse(res, httpStatus.NOT_FOUND, 'form not found.');
        }

        const effDate = new Date(formRows[0].eff_date);
        const endEffDate = new Date(formRows[0].end_eff_date);
        const currentDate = new Date();
        if (currentDate < effDate || currentDate > endEffDate) {
            removeAllFiles(req.files);
            return httpResponse(res, httpStatus.FORBIDDEN, 'form is closed.');
        }

        /* Validate dosen pembimbing */
        const [lecturerRows] = await db.execute(
            'SELECT id FROM lecturers WHERE id = ?',
            [dosen_pembimbing_ta_id]
        );

        if (lecturerRows.length < 1) {
            removeAllFiles(req.files);
            return httpResponse(res, httpStatus.NOT_FOUND, 'dosen not found.');
        }

        const [studentRows] = await db.execute(
            `
                SELECT 
                    s.id 
                FROM 
                    students s
                LEFT JOIN
                    users u
                ON 
                    u.id = s.user_id
                WHERE 
                    u.id = ? 
            `,
            [req.user.id]
        );

        await db.execute(
            `INSERT INTO form_ta (
                student_id,
                dosen_pembimbing_ta_id,
                judul,
                peminatan,
                jenis_sidang,
                bentuk_ta,
                jenis_ta,
                skema_ta,
                form_academic_year_id,
                formular_persetujuan,
                sertifikasi_kompetensi_bnsp,
                formular_bebas_adm_keuangan,
                formular_verifikasi_dosen_pembimbing_akademik,
                bukti_bebas_pinjaman_perpustakaan,
                formular_monitoring_sertifikat_skpi,
                bukti_upload_skpi,
                surat_persetujuan_pra_sidang_ta,
                laporan_ta
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
        `,
            [
                studentRows[0].id,
                dosen_pembimbing_ta_id,
                judul,
                peminatan,
                jenis_sidang,
                bentuk_ta,
                jenis_ta,
                skema_ta,
                form_academic_year_id,
                formular_persetujuan[0].filename,
                sertifikasi_kompetensi_bnsp[0].filename,
                formular_bebas_adm_keuangan[0].filename,
                formular_verifikasi_dosen_pembimbing_akademik[0].filename,
                bukti_bebas_pinjaman_perpustakaan[0].filename,
                formular_monitoring_sertifikat_skpi[0].filename,
                bukti_upload_skpi[0].filename,
                surat_persetujuan_pra_sidang_ta[0].filename,
                laporan_ta[0].filename,
            ]
        );

        return httpResponse(res, httpStatus.CREATED, 'Data has been saved.');
    } catch (error) {
        removeAllFiles(req.files);
        return serverErrorResponse(res, error);
    }
};

const getSubmittedForms = async (req, res) => {
    try {
        let { limit, page, fay, name = '', nim = '' } = req.query;

        limit = parseInt(limit) || PAGINATION.DFLT_LIMIT;
        page = parseInt(page) || PAGINATION.DFLT_PAGE;
        fay = parseInt(fay);

        const offset = (page - 1) * limit;

        const baseQuery = `
            SELECT
                u.username AS student_nim,
                s.full_name AS student_name,
                COALESCE(k.full_name, '-') AS koord_sidang_name,
                COALESCE(kp.full_name, '-') AS ketua_penguji_name,
                COALESCE(p1.full_name, '-') AS penguji_1_name,
                COALESCE(p2.full_name, '-') AS penguji_2_name,
                dpta.full_name AS dosen_pembimbing_name,
                COALESCE(r.name, '-') AS room_name,
                s.kelas,
                s.kampus,
                s.nik,
                ft.judul
            FROM
                form_ta ft
            JOIN
                students s ON ft.student_id = s.id
            JOIN
                users u ON s.user_id = u.id
            JOIN
                lecturers dpta ON ft.dosen_pembimbing_ta_id = dpta.id
            LEFT JOIN
                lecturers k ON ft.koord_sidang = k.id
            LEFT JOIN
                lecturers kp ON ft.ketua_penguji = kp.id
            LEFT JOIN
                lecturers p1 ON ft.penguji_1 = p1.id
            LEFT JOIN
                lecturers p2 ON ft.penguji_2 = p2.id
            LEFT JOIN
                rooms r ON ft.room_id = r.id
            JOIN
                form_academic_years fay ON ft.form_academic_year_id = fay.id
            WHERE
                ft.form_academic_year_id = ? AND
                s.full_name LIKE ? AND
                u.username LIKE ?
        `;

        const queryWithPagination = `   
            ORDER BY
                ft.created_at DESC
            LIMIT ${limit} OFFSET ${offset}
        `;

        const params = [fay, `%${name}%`, `%${nim}%`];

        const [rows] = await db.execute(
            `
            ${baseQuery}
            ${queryWithPagination}
        `,
            params
        );

        const [totalRows] = await db.execute(`${baseQuery}`, params);

        const pagination = buildPaginationData(limit, page, totalRows.length);

        return httpResponse(
            res,
            httpStatus.OK,
            'Get submitted form ta success',
            rows,
            pagination
        );
    } catch (error) {
        return serverErrorResponse(res, error);
    }
};

module.exports = {
    submitForm,
    getSubmittedForms,
};
