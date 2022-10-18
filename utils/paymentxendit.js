const { nanoid } = require("nanoid"); // import nanoid untuk generate id. Untk versi nya perhatikan https://github.com/ai/nanoid/blob/main/CHANGELOG.md#40
const xendit = new require('xendit-node'); // import third party module xendit-node
const x = new xendit({ // untk mengakses API Xendit dgn key yg sdh kita generate di Website Xendit
    secretKey: 'xnd_development_XbtPHfRIymrOpxPJpxDWPhNmrSiYTO0Khc7URANxrkqmhYntojeEZBYOiMrmp0o'
});


const { Invoice } = x;
const invoiceSpecificOptions = {};
const i = new Invoice(invoiceSpecificOptions);




async function buatInvoice(dataUser, dataInvoiceItem) { // function untuk membuat invoice
    try { // klu sukses, maka...

        let resp = await i.createInvoice({
            externalID: `Invoice-${nanoid(10)}`,
            amount: dataInvoiceItem.totalAmount,
            payerEmail: dataUser.email,
            should_send_email: true,
            description: dataInvoiceItem.descriptionInvoice,
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
                    'email'
                ],
                invoice_paid: [
                    'email'
                ],
            },
            currency: 'IDR',
            items: dataInvoiceItem.itemsInCart

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