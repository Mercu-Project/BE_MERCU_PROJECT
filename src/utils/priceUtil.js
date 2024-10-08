const { DEFAULT_PPN } = require('./constants');

const formatRupiah = (value, usePrefix = false) => {
    let [integerPart, decimalPart] = value.toFixed(2).split('.');

    integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

    return `${usePrefix ? 'Rp. ' : ''}${integerPart},${decimalPart}`;
};

const getPPN = (price) => {
    return price * DEFAULT_PPN;
};

const toWords = (price) => {
    const units = [
        '',
        'Satu',
        'Dua',
        'Tiga',
        'Empat',
        'Lima',
        'Enam',
        'Tujuh',
        'Delapan',
        'Sembilan',
    ];
    const teens = [
        'Sepuluh',
        'Sebelas',
        'Dua Belas',
        'Tiga Belas',
        'Empat Belas',
        'Lima Belas',
        'Enam Belas',
        'Tujuh Belas',
        'Delapan Belas',
        'Sembilan Belas',
    ];
    const tens = [
        '',
        '',
        'Dua Puluh',
        'Tiga Puluh',
        'Empat Puluh',
        'Lima Puluh',
        'Enam Puluh',
        'Tujuh Puluh',
        'Delapan Puluh',
        'Sembilan Puluh',
    ];
    const thousands = ['', 'Ribu', 'Juta', 'Miliar', 'Triliun'];

    if (price == 0) return 'Nol Rupiah';

    let words = '';
    let partCount = 0;

    while (price > 0) {
        const part = price % 1000;
        if (part > 0) {
            words =
                convertPart(part, units, teens, tens) +
                (thousands[partCount] ? ' ' + thousands[partCount] : '') +
                ' ' +
                words;
        }
        price = Math.floor(price / 1000);
        partCount++;
    }

    return words.trim() + ' Rupiah';
};

const convertPart = (price, units, teens, tens) => {
    let word = '';
    const hundred = Math.floor(price / 100);
    const ten = Math.floor((price % 100) / 10);
    const unit = price % 10;

    if (hundred === 1) {
        word += 'Seratus ';
    } else if (hundred > 1) {
        word += units[hundred] + ' Ratus ';
    }

    if (ten > 1) {
        word += tens[ten] + ' ';
        word += units[unit] + ' ';
    } else if (ten === 1) {
        word += teens[unit] + ' ';
    } else if (unit > 0) {
        word += units[unit] + ' ';
    }

    return word.trim();
};

module.exports = {
    formatRupiah,
    getPPN,
    toWords,
};
