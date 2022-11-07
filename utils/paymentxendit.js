const { nanoid } = require("nanoid"); // import nanoid untuk generate id. Untk versi nya perhatikan https://github.com/ai/nanoid/blob/main/CHANGELOG.md#40
require('dotenv').config(); // import third party module dotenv to read .env file, and config it to read .env file from this file
const xendit = new require('xendit-node'); // import third party module xendit-node

const x = new xendit({ // untk mengakses API Xendit dgn key yg sdh kita generate di Website Xendit
    secretKey: process.env.XenditAPIKey
});


const { Invoice } = x;
const invoiceSpecificOptions = {};
const i = new Invoice(invoiceSpecificOptions);




async function buatInvoice(dataUser, dataInvoiceItem) { // function untuk membuat invoice
    try { // klu sukses, maka...

        let resp = await i.createInvoice({
            externalID: `Invoice-${nanoid(10)}`,
            amount: parseInt(dataInvoiceItem.totalAmount) + parseInt(dataInvoiceItem.totalAmount * 0.03),  // total amount + 3% dari total amount (untk biaya admin)
            payerEmail: dataUser.email,
            should_send_email: true,
            description: dataInvoiceItem.descriptionInvoice,
            invoiceDuration: 86400, // untk atur brp lama invoice bisa dibayar, dalam satuan detik. 86400 = 1 hari / 24 jam
            customer: {
                given_names: dataUser.fullname,
                surname: dataUser.username,
                email: dataUser.email,
                mobile_number: dataUser.notelp,
                addresses: [{
                    city: dataUser.kota,
                    country: 'Indonesia',
                    postal_code: dataUser.kodepos,
                    state: dataUser.provinsi,
                    street_line1: dataUser.alamat,
                }]
            },
            customer_notification_preference: {
                invoice_created: [
                    'whatsapp',
                    'sms',
                    'email'
                ],
                invoice_reminder: [
                    'whatsapp',
                    'sms',
                    'email'
                ],
                invoice_paid: [
                    'whatsapp',
                    'sms',
                    'email'
                ],
                invoice_expired: [
                    'whatsapp',
                    'sms',
                    'email'
                ]
            },
            currency: 'IDR',
            locale: 'id', // untuk bahasa indonesia
            items: dataInvoiceItem.itemsInCart,
            fees: [ // biaya tambahan admin sebesar 3% dari total amount
                {
                    type: 'ADMIN (3%)',
                    value: parseInt(dataInvoiceItem.totalAmount * 0.03),
                }
            ]
        });

        return resp;

    } catch (error) { // klu gagal, maka...

        console.log(error);

    }

}


async function ambilInvoice(invoiceID) { // function untuk ambil invoice yg sdh dibuat

    try { // klu sukses, maka...

        let resp = await i.getInvoice({
            invoiceID: `${invoiceID}`
        });

        return resp;

    } catch (error) { // klu gagal, maka...

        console.log(error);

    }

}


async function tutupInvoice(invoiceID) { // function untuk cancel/tutup invoice yg sdh dibuat
    try { // klu sukses, maka...

        let resp = await i.expireInvoice({
            invoiceID: `${invoiceID}`
        });

        return resp;

    } catch (error) { // klu gagal, maka...

        console.log(error);

    }
}





module.exports = {
    buatInvoice: buatInvoice,
    ambilInvoice: ambilInvoice,
    tutupInvoice: tutupInvoice
}