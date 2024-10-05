const buildPaginationData = (limit, page, totalData) => {
    const totalPages = Math.ceil(totalData / limit);
    const hasPrevious = page > 1;
    const hasNext = page < totalPages;

    return {
        currentPage: page,
        dataPerPage: limit,
        totalPages,
        totalData,
        hasNext,
        hasPrevious,
    };
};

const parseOrUseDefault = (limit, page) => {
    const perPage = parseInt(limit) || 10;
    const currentPage = parseInt(page) || 1;

    return { perPage, currentPage };
};

const getOffset = (limit, page) => {
    return (page - 1) * limit;
};

const resetCurrentPageIfSearch = (search, currentPage) => {
    if (!search) return currentPage;
    else return 1;
};

module.exports = {
    buildPaginationData,
    parseOrUseDefault,
    getOffset,
    resetCurrentPageIfSearch,
};
