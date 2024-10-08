const { toBase64 } = require('./imageUtil');
const { formatRupiah } = require('./priceUtil');

const ttd = toBase64('img/ttd.jpg');

const generateTableRow = (no, ket, qty, price, total) => {
    return `
        <tr>
            <td>${no}</td>
            <td>${ket}</td>
            <td>${qty}</td>
            <td>Rp${formatRupiah(price)}</td>
            <td>Rp${formatRupiah(total)}</td>
        </tr>
    `;
};

const generatePPNRow = (ppn) => {
    return `
        <tr>
            <td colspan="3"></td>
            <td>PPN 11%</td>
            <td>Rp${formatRupiah(ppn)}</td>
        </tr>
    `;
};

const generateTotalAmountRow = (total) => {
    return `
        <tr>
            <td colspan="3"></td>
            <td class="total">Total</td>
            <td class="total_number">Rp${formatRupiah(total)}</td>
        </tr>
    `;
};

const invoiceTemplate = `<html>
    <head>
        <style>
            @page {
                size: A4;
                margin: 15mm;
            }

            body {
                margin: 0;
                padding: 0;
                font-family: 'Arial', sans-serif;
                font-size: 11pt;
                line-height: 1.6;
            }

            ul,
            li {
                list-style: none;
                margin: 0;
                padding: 0;
            }

            p {
                margin: 0;
                font-size: 11pt;
            }

            #header {
                text-align: right;
                margin-bottom: 5mm;
            }

            #header h2 {
                color: darkgreen;
                text-transform: uppercase;
                font-size: 16pt;
            }

            #divider {
                width: 100%;
                height: 0.6mm;
                border: 0.5mm solid #222;
            }

            #upper_letter {
                display: flex;
                justify-content: space-between;
                margin-top: 10mm;
                font-size: 11pt;
            }

            .date,
            .letter_id {
                display: flex;
                flex-direction: column;
            }

            .date p,
            .letter_id p {
                margin: 0;
                font-size: 11pt;
            }

            #pelanggan {
                margin-top: 5mm;
                padding: 10px;
                border: 1px solid #222;
                width: 65%;
            }

            #pelanggan .title {
                font-weight: bold;
                margin-bottom: 5mm;
                font-size: 14pt;
            }

            #pelanggan .info {
                display: flex;
                justify-content: space-between;
            }

            #pelanggan .info_title,
            #pelanggan .info_body {
                flex: 1;
            }

            #pelanggan .info_title p,
            #pelanggan .info_body p {
                margin: 0;
                font-size: 12pt;
                line-height: 1.5;
                word-wrap: break-word;
                overflow-wrap: break-word;
            }

            table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 5mm;
                font-size: 11pt;
            }

            th,
            td {
                border: 1px solid black;
                padding: 6px;
                text-align: left;
            }

            th {
                background-color: #f2f2f2;
                font-weight: bold;
            }

            #price_table .total {
                font-weight: bold;
            }
            #price_table .total_number {
                background-color: #f2f2f2;
            }

            #price_table .footer {
                margin-top: 10mm;
                text-align: right;
                font-size: 12pt;
            }

            #payment_detail {
                margin-top: 5mm;
                padding: 10px;
                border: 1px solid #222;
                width: 65%;
            }

            #payment_detail .title {
                font-weight: bold;
                margin-bottom: 5mm;
                font-size: 14pt;
            }

            #payment_detail .info {
                display: flex;
                justify-content: space-between;
            }

            #payment_detail .info_title,
            #payment_detail .info_body {
                flex: 1;
                margin-right: 20px;
            }

            #payment_detail .info_title p,
            #payment_detail .info_body p {
                margin: 0;
                font-size: 12pt;
                line-height: 1.5;
            }

            #payment_detail .info_title p:last-child,
            #payment_detail .info_body p:last-child {
                margin-bottom: 0;
            }

            #payment_detail .info_body {
                margin-right: 0;
            }

            #terbilang {
                width: 65%;
                text-align: left;
                padding: 10px;
                margin-top: 5mm;
                border: 1px solid #222;
            }

            #terbilang .title {
                font-weight: bold;
                margin-bottom: 5mm;
                font-size: 14pt;
            }

            #terbilang p {
                margin: 0;
                font-size: 12pt;
                line-height: 1.5;
                word-wrap: break-word;
                overflow-wrap: break-word;
            }

            #ttd {
                display: flex;
                flex-direction: column;
                align-items: center;
                margin-left: auto;
                width: fit-content;
            }

            #ttd img {
                max-width: 100%;
                height: auto;
            }

            #ttd p {
                margin: 0;
                text-align: center;
            }
        </style>
    </head>
    <body>
        <header id="header">
            <h2>PT Selera Citra Nusantara</h2>
            <p>Jl.Krekot Jaya Molek Blok B2 No.1</p>
            <p>Jakarta Pusat 10710</p>
            <p>seleracitranusantara@yahoo.com</p>
        </header>
        <div id="divider"></div>
        <section id="upper_letter">
            <div class="date">
                <p>INVOICE</p>
                <p>Jakarta, [NOW]</p>
            </div>
            <div class="letter_id">
                <p>001M/SCN/VII/2024</p>
            </div>
        </section>
        <section id="pelanggan">
            <p class="title">PELANGGAN</p>
            <div class="info">
                <div class="info_title">
                    <p>Unit</p>
                    <p>Nama Acara</p>
                    <p>Tanggal Acara</p>
                </div>
                <div class="info_body">
                    <p>[UNIT]</p>
                    <p>[EVENT_NAME]</p>
                    <p>[EVENT_DATE]</p>
                </div>
            </div>
        </section>
        <section id="price_table">
            <table>
                <thead>
                    <tr>
                        <th>No</th>
                        <th>Keterangan</th>
                        <th>Qty</th>
                        <th>Harga Satuan</th>
                        <th>Jumlah (Rp)</th>
                    </tr>
                </thead>
                <tbody>
                    [TABLE_ROWS]
                </tbody>
            </table>
        </section>
        <section id="payment_detail">
            <p class="title">Detail Pembayaran</p>
            <div class="info">
                <div class="info_title">
                    <p>Nama Bank</p>
                    <p>Cabang Bank</p>
                    <p>Nomor Akun Bank</p>
                    <p>Atas Nama</p>
                </div>
                <div class="info_body">
                    <p>BNI</p>
                    <p>Mercu Buana</p>
                    <p>8119128703</p>
                    <p>PT Selera Citra Nusantara</p>
                </div>
            </div>
        </section>
        <section id="terbilang">
            <p class="title">Terbilang</p>
            <p>
                [TERBILANG]
            </p>
        </section>
        <section id="ttd">
            <img src="data:image/jpeg;base64,${ttd}" alt="" />
            <p>Lisa Kusuma</p>
        </section>
    </body>
</html>
`;

module.exports = {
    invoiceTemplate,
    generateTableRow,
    generatePPNRow,
    generateTotalAmountRow,
};
