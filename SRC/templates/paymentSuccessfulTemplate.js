import { mailTransport } from "../config/googlapis.js";
import { mailGenerator } from "../config/mailgen.js";

export const paymentSuccessfulTemplate = (email, userName, tickType, expiryDate) => {
    const html = {
        body: {
            signature: false,
            greeting: `Hello ${userName}`,
            intro: `Your payment for the ${tickType} tick was successful.`,
            table: {
                data: [
                    {
                        'Tick Type': tickType.charAt(0).toUpperCase() + tickType.slice(1),
                        'Expiry Date': new Date(expiryDate).toLocaleDateString(),
                    },
                ],
                columns: {
                    customWidth: {
                        'Tick Type': '20%',
                        'Expiry Date': '80%',
                    },
                    customAlignment: {
                        'Tick Type': 'left',
                        'Expiry Date': 'right',
                    },
                },
            },
            outro: 'Enjoy your verified status on our platform. 🐸🐸🐸🐸🐸🐸🐸',
        },
    };
    const template = mailGenerator.generate(html);
    const mail = {
        to: email,
        subject: `${tickType.charAt(0).toUpperCase() + tickType.slice(1)} Tick Payment Successful`,
        from: 'basseyephraim55@gmail.com',
        html: template,
    };

    return mailTransport(mail.from, mail.to, mail.subject, mail.html);
};
