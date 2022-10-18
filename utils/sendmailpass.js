const nodemailer = require('nodemailer'); // import third party module nodemailer, untk send email via gmail dari web server



async function sendMailForgotPass(Mail, passRecovery, user) {
    try { // klu sukses, maka...

        let transporter = await nodemailer.createTransport({ // To send emails we need a transporter object yg isinya setup" untk kirim email via gmail
            service: 'gmail', // kita kasih tau transporter bahwa kita akan menggunakan service gmail untk send email
            auth: {
                user: 'frizfoo@gmail.com',
                pass: 'yfdzhypgkfhhecla'  // passnya ini kita generate dri App passwords
            }
        });


        let mailOptions = { // Jdi semua data ini ttg dari mana emailnya dari siapa, kepada siapa, subjectnya, isi dari emailnya, dan lainnya.
            from: 'frizfoo@gmail.com',
            to: `${Mail}`,
            subject: '[Frizfoo] Reset Your Password',
            // text: `Name: ${name} \nContact Number: ${contact}`
            html:
                `
        <div style="max-width: 600px; margin: 0 auto;">

            <div style="text-align: center; max-width: 600px; background-color: white;  margin:0px auto; border-radius: 5px;"> 
                <img src="cid:frizfooembedlogo" class="logo" alt="Logo Frizfoo" width="160" height="60">
            </div>

            <hr style="border: 1px solid #e0e0e0;">

            <div style="text-align: center; max-width: 600px; background-color: white; margin:0px auto; padding:5px; border-radius: 5px;"> 
                <h1>Haii ${user.fullname}</h1>
                <p style="font-size: 13px">Anda telah melakukan permintaan untuk mereset password akun Frizfoo anda.</p>
                <p>Email Anda : ${Mail}</p>
                <p>Password baru Anda : 
                    <span style="font-weight: bolder; font-size: 20px; color: #2286ff;">${passRecovery}</span>
                </p>
                <p>Silahkan Login kembali dan Segera Menggantinya dengan Password Baru Anda</p>
                <p>❤ Terima Kasih ❤</p>
            </div>

            <hr style="border: 1px solid #e0e0e0;">

            <div style="text-align: center; max-width: 600px; background-color: #c1ccfd;  margin:0px auto; border-radius: 5px; padding: 30px"> 
                Created With ❤ By Liella! | © 2022 All rights reserved.
            </div>

        </div>

            `,
            attachments: [
                {
                    path: './public/img/logo.png',
                    cid: 'frizfooembedlogo' //same cid value as in the html img src, MUST UNIQUE
                }
            ]

        };

        let emailSendResult = await transporter.sendMail(mailOptions); // kirim emailnya dengan transporter yg sudah kita buat tadi

        return emailSendResult;

    } catch (error) { // klu gagal, maka...

        console.log(error);

    }
}





module.exports = {
    sendMailForgotPass: sendMailForgotPass
}