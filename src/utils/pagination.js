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

module.exports = buildPaginationData;
