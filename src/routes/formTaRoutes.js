const router = require('express').Router();
const FormTA = require('../controllers/formTaController');

const { submitFormValidator } = require('../validators/formTaValidator');

const upload = require('../middlewares/upload');
const auth = require('../middlewares/auth');
const checkRole = require('../middlewares/checkRole');

const uploadFields = upload.fields([
    { name: 'formular_persetujuan', maxCount: 1 },
    { name: 'sertifikasi_kompetensi_bnsp', maxCount: 1 },
    { name: 'formular_bebas_adm_keuangan', maxCount: 1 },
    { name: 'formular_verifikasi_dosen_pembimbing_akademik', maxCount: 1 },
    { name: 'bukti_bebas_pinjaman_perpustakaan', maxCount: 1 },
    { name: 'formular_monitoring_sertifikat_skpi', maxCount: 1 },
    { name: 'bukti_upload_skpi', maxCount: 1 },
    { name: 'surat_persetujuan_pra_sidang_ta', maxCount: 1 },
    { name: 'laporan_ta', maxCount: 1 },
]);

router.post(
    '/submit-form',
    auth,
    checkRole('Mahasiswa'),
    uploadFields,
    submitFormValidator,
    FormTA.submitForm
);

router.get(
    '/get-submitted-forms',
    auth,
    checkRole('Admin'),
    FormTA.getSubmittedForms
);

module.exports = router;
