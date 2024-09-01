const replacePlaceholrders = (str, replacements) => {
    return str.replace(
        /{(\d+)}/g,
        (match, number) => replacements[number] || match
    );
};

module.exports = {
    replacePlaceholrders,
};
