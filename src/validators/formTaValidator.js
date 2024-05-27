const { serverErrorResponse, httpResponse } = require('../utils/httpResponse');
const { validateFileNameFormat } = require('../utils/checkFileName');
const fs = require('fs');
const httpStatus = require('http-status');
const { removeAllFiles } = require('../utils/fileSystemUtils');

const submitFormValidator = async (req, res, next) => {
    try {
        const { nim, nama_lengkap } = req.body;
        const {
            sertifikasi_kompetensi_bnsp,
            formular_bebas_adm_keuangan,
            formular_verifikasi_dosen_pembimbing_akademik,
            bukti_bebas_pinjaman_perpustakaan,
            formular_monitoring_sertifikat_skpi,
            bukti_upload_skpi,
            surat_persetujuan_pra_sidang_ta,
            laporan_ta,
        } = req.files;

        const fileNameFormatErrors = [];

        /* Validate file name format */
        if (
            !validateFileNameFormat(
                sertifikasi_kompetensi_bnsp[0],
                nim,
                nama_lengkap,
                'sertifikat BNSP'
            )
        ) {
            fileNameFormatErrors.push('Nama file Sertifikat BNSP tidak valid');
        }

        if (
            !validateFileNameFormat(
                formular_bebas_adm_keuangan[0],
                nim,
                nama_lengkap,
                'BAK'
            )
        ) {
            fileNameFormatErrors.push(
                'Nama file Formular Bebas Adm Keuangan tidak valid'
            );
        }

        if (
            !validateFileNameFormat(
                formular_verifikasi_dosen_pembimbing_akademik[0],
                nim,
                nama_lengkap,
                'VDPA'
            )
        ) {
            fileNameFormatErrors.push(
                'Nama file Formular Verifikasi Dosen Pembimbing Akademik tidak valid'
            );
        }

        if (
            !validateFileNameFormat(
                bukti_bebas_pinjaman_perpustakaan[0],
                nim,
                nama_lengkap,
                'PERPUS'
            )
        ) {
            fileNameFormatErrors.push(
                'Nama file Bukti Bebas Pinjaman Perpustakaan tidak valid'
            );
        }

        if (
            !validateFileNameFormat(
                formular_monitoring_sertifikat_skpi[0],
                nim,
                nama_lengkap,
                'FMSS'
            )
        ) {
            fileNameFormatErrors.push(
                'Nama file Formular Monitoring Sertifikat SKPI tidak valid'
            );
        }

        if (
            !validateFileNameFormat(
                bukti_upload_skpi[0],
                nim,
                nama_lengkap,
                'SKPI'
            )
        ) {
            fileNameFormatErrors.push(
                'Nama file Bukti Upload SKPI tidak valid'
            );
        }

        if (
            !validateFileNameFormat(
                surat_persetujuan_pra_sidang_ta[0],
                nim,
                nama_lengkap,
                'PPSTA'
            )
        ) {
            fileNameFormatErrors.push(
                'Nama file Surat Persetujuan Pra Sidang TA tidak valid'
            );
        }

        if (!validateFileNameFormat(laporan_ta[0], nim, nama_lengkap, 'LTA')) {
            fileNameFormatErrors.push('Nama file Laporan TA tidak valid');
        }

        if (fileNameFormatErrors.length > 0) {
            removeAllFiles(req.files);
            return httpResponse(
                res,
                httpStatus.BAD_REQUEST,
                'File name format errors',
                fileNameFormatErrors
            );
        }

        return next();
    } catch (error) {
        return serverErrorResponse(res, error);
    }
};

module.exports = {
    submitFormValidator,
};
