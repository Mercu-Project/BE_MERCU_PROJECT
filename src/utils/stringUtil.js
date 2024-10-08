const replacePlaceholders = (str, replacements) => {
    return str.replace(
        /{(\d+)}/g,
        (match, number) => replacements[number] || match
    );
};

const replaceString = (
    originalString,
    searchValue,
    replacement,
    replaceAll = false
) => {
    if (replaceAll) {
        return originalString.replace(
            new RegExp(searchValue, 'g'),
            replacement
        );
    }
    return originalString.replace(searchValue, replacement);
};

module.exports = {
    replacePlaceholders,
    replaceString,
};
