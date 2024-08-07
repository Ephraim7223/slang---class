import { mailTransport } from "../config/googlapis.js"
import { mailGenerator } from "../config/mailgen.js"

export const frozenAccountTemplate = (email, userName) => {
    const html = {
        body: {
            signature: false,
            greeting: `Hello ${userName}`,
            intro: 'Your account has been frozen due to a violation of our terms of service.',
            outro: 'If you believe this is a mistake, please contact our support team. 🐸🐸🐸🐸🐸🐸🐸🐸🐸🐸'
        }
    };
    const template = mailGenerator.generate(html);
    const mail = {
        to: email,
        subject: 'Account Frozen',
        from: 'basseyephraim55@gmail.com',
        html: template,
    };

    return mailTransport(mail.from, mail.to, mail.subject, mail.html);
};
