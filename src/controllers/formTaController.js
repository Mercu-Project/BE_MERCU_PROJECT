const { httpResponse, serverErrorResponse } = require('../utils/httpResponse');
const db = require('../config/db');
const httpStatus = require('http-status');
const checkValidation = require('../utils/checkValidationResult');
const { validationResult } = require('express-validator');
const { validateFileNameFormat } = require('../utils/checkFileName');

const submitForm = async (req, res) => {
    try {
        checkValidation(res, 'Validation errors', validationResult(req));

        const {
            form_id,
            nim,
            nama_lengkap,
            kelas_perkuliahan,
            kampus,
            nik,
            phone,
            email,
            dosen_pembimbing_ta_id,
            judul,
            peminatan,
            jenis_sidang,
            bentuk_ta,
            jenis_ta,
            skema_ta,
        } = req.body;

        if (nim !== req.user.username) {
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
            'SELECT status, eff_date, end_eff_date FROM forms WHERE id = ?',
            [form_id]
        );

        if (formRows.length < 1) {
            return httpResponse(res, httpStatus.NOT_FOUND, 'form not found.');
        }

        if (formRows[0].status != '1') {
            return httpResponse(res, httpStatus.FORBIDDEN, 'form is closed.');
        }

        const effDate = new Date(formRows[0].eff_date);
        const endEffDate = new Date(formRows[0].end_eff_date);
        const currentDate = new Date();
        if (currentDate < effDate || currentDate > endEffDate) {
            return httpResponse(res, httpStatus.FORBIDDEN, 'form is closed.');
        }

        /* Validate dosen pembimbing */
        const [lecturerRows] = await db.execute(
            'SELECT id FROM lecturers WHERE id = ?',
            [dosen_pembimbing_ta_id]
        );

        if (lecturerRows.length < 1) {
            return httpResponse(res, httpStatus.NOT_FOUND, 'dosen not found.');
        }

        const filePaths = {
            formular_persetujuan: formular_persetujuan[0].filename,
            sertifikasi_kompetensi_bnsp:
                sertifikasi_kompetensi_bnsp[0].filename,
            formular_bebas_adm_keuangan:
                formular_bebas_adm_keuangan[0].filename,
            formular_verifikasi_dosen_pembimbing_akademik:
                formular_verifikasi_dosen_pembimbing_akademik[0].filename,
            bukti_bebas_pinjaman_perpustakaan:
                bukti_bebas_pinjaman_perpustakaan[0].filename,
            formular_monitoring_sertifikat_skpi:
                formular_monitoring_sertifikat_skpi[0].filename,
            bukti_upload_skpi: bukti_upload_skpi[0].filename,
            surat_persetujuan_pra_sidang_ta:
                surat_persetujuan_pra_sidang_ta[0].filename,
            laporan_ta: laporan_ta[0].filename,
        };

        const filePathsArray = Object.values(filePaths);

        await db.execute(
            `INSERT INTO form_ta (
                                nim,
                                nama_lengkap,
                                kelas_perkuliahan,
                                kampus,
                                nik,
                                phone,
                                email,
                                dosen_pembimbing_ta_id,
                                judul,
                                peminatan,
                                jenis_sidang,
                                bentuk_ta,
                                jenis_ta,
                                skema_ta,
                                form_id,
                                formular_persetujuan,
                                sertifikasi_kompetensi_bnsp,
                                formular_bebas_adm_keuangan,
                                formular_verifikasi_dosen_pembimbing_akademik,
                                bukti_bebas_pinjaman_perpustakaan,
                                formular_monitoring_sertifikat_skpi,
                                bukti_upload_skpi,
                                surat_persetujuan_pra_sidang_ta,
                                laporan_ta
                            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
        `,
            [
                nim,
                nama_lengkap,
                kelas_perkuliahan,
                kampus,
                nik,
                phone,
                email,
                dosen_pembimbing_ta_id,
                judul,
                peminatan,
                jenis_sidang,
                bentuk_ta,
                jenis_ta,
                skema_ta,
                form_id,
                ...filePathsArray,
            ]
        );

        return httpResponse(res, httpStatus.CREATED, 'Data has been saved.');
    } catch (error) {
        return serverErrorResponse(res, error);
    }
};

module.exports = {
    submitForm,
};
