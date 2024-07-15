import { mailTransport } from "../config/googlapis.js"
import { mailGenerator } from "../config/mailgen.js"

export const blueTickExpiryTemplate = (email, userName) => {
    const html = {
        body: {
            signature: false,
            greeting: `Hello ${userName}`,
            intro: 'Your blue tick verification has expired.',
            outro: 'Please renew your subscription to continue enjoying the verified status.',
        },
    };
    const template = mailGenerator.generate(html);
    const mail = {
        to: email,
        subject: 'Blue Tick Expiry',
        from: 'basseyephraim55@gmail.com',
        html: template,
    };

    return mailTransport(mail.from, mail.to, mail.subject, mail.html);
};
