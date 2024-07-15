import { mailTransport } from "../config/googlapis.js"
import { mailGenerator } from "../config/mailgen.js"

export const paymentSuccessfulTemplate = (email, userName) => {
    const html = {
        body: {
            signature: false,
            greeting: `Hello ${userName}`,
            intro: 'Your payment for the blue tick was successful.',
            outro: 'Enjoy your verified status on our platform.',
        },
    };
    const template = mailGenerator.generate(html);
    const mail = {
        to: email,
        subject: 'Payment Successful',
        from: 'basseyephraim55@gmail.com',
        html: template,
    };

    return mailTransport(mail.from, mail.to, mail.subject, mail.html);
};
