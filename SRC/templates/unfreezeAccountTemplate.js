import { mailTransport } from "../config/googlapis.js"
import { mailGenerator } from "../config/mailgen.js"

export const unfrozenAccountTemplate = async (email, userName) => {
    const html = {
        body: {
            signature: false,
            greeting: `Hello ${userName}`,
            intro: 'Your account has been unfrozen and you can now access all our services.',
            outro: 'If you have any questions, please contact our support team.'
        }
    };
    const template = mailGenerator.generate(html);
    const mail = {
        to: email,
        subject: 'Account Unfrozen Notification',
        from: 'your-email@example.com',
        html: template
    };

    return mailTransport(mail.from, mail.to, mail.subject, mail.html);
};
