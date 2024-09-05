module.exports = {
    /* Error message */
    ERR_MSG: {
        ID_NOTFOUND_UPD: 'Failed executing query update : Id not found',
        ID_NOTFOUND_REM: 'Failed executing query delete : Id not found',
        FAIL_UPD: 'Failed executing query update',
        FAIL_REM: 'Failed executing query delet',
    },

    /* Detail table based on role */
    RO_TBL: {
        Mahasiswa: 'students',
        Dosen: 'lecturers',
        Admin: 'admins',
        User: 'users',
    },

    /* Pagination */
    PAGINATION: {
        DFLT_LIMIT: 10,
        DFLT_PAGE: 1,
    },

    /* Status Canteen Preorder */
    PO_STAT: {
        PENDING_PAYLOAD: 'Menunggu Persetujuan',
        PENDING: 'Menunggu Persetujuan {0}',
        REJECT_PAYLOAD: 'Ditolak',
        REJECT: 'Ditolak oleh {0}',
        REJECT_BY_SYSTEM: 'Ditolak oleh Sistem',
        APPROVE_PAYLOAD: 'Disetujui',
        APPROVE: 'Disetujui oleh {0}',
        CANTEEN_PROCESS: 'Menunggu Proses Kantin',
    },

    /* Role Constants */
    ROLES: {
        TU: 'TU',
        ADMIN: 'Admin',
        USER: 'User',
        DEKAN: 'Dekan',
        BAK: 'BAK',
    },

    /* Date Format Type */
    DATE_FMT_TYPE: {
        DATE: 'date',
        DATETIME: 'datetime',
        TIMESTAMP: 'timestamp',
    },

    /* Date Timezone */
    DATE_TZ: {
        JAKARTA: 'Asia/Jakarta',
    },
};
