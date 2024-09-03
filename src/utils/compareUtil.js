const isEqual = (val1, val2) => {
    return val1 === val2;
};

const isNotEqual = (val1, val2) => {
    return !isEqual(val1, val2);
};

const isContains = (str, search) => {
    return str.includes(search);
};

const isNotContains = (str, search) => {
    return !isContains(str, search);
};

function isModified(oldData, newData) {
    const modifiedFields = {};

    for (let key in newData) {
        if (newData.hasOwnProperty(key) && newData[key] !== oldData[key]) {
            modifiedFields[key] = newData[key];
        }
    }

    return Object.keys(modifiedFields).length > 0 ? modifiedFields : null;
}

const isBlank = (val) => {
    return val === '' || val === null || val === undefined;
};

const isNotBlank = (val) => {
    return !isBlank(val);
};

module.exports = {
    isEqual,
    isNotEqual,
    isModified,
    isContains,
    isNotContains,
    isBlank,
    isNotBlank,
};
