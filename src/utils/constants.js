module.exports = {
    /* Error message */
    ERR_MSG: {
        ID_NOTFOUND_UPD: 'Failed executing query update : Id not found',
        ID_NOTFOUND_REM: 'Failed executing query delete : Id not found',
    },

    /* Detail table based on role */
    RO_TBL: {
        Mahasiswa: 'students',
        Dosen: 'lecturers',
        Admin: 'admins',
    },

    /* Pagination */
    PAGINATION: {
        DFLT_LIMIT: 10,
        DFLT_PAGE: 1,
    },
};
