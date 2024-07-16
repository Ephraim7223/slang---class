import { mailTransport } from "../config/googlapis.js";
import { mailGenerator } from "../config/mailgen.js";

export const tickExpiryTemplate = (email, userName, tickType) => {
    const html = {
        body: {
            signature: false,
            greeting: `Hello ${userName}`,
            intro: `Your ${tickType} tick has expired.`,
            action: {
                instructions: 'To renew your tick, please click the button below:',
                button: {
                    color: '#22BC66',
                    text: 'Renew Tick',
                    link: '🐸🐸🐸🐸🐸🐸🐸🐸🐸🐸🐸🐸🐸🐸🐸🐸🐸🐸🐸v',
                },
            },
            outro: 'If you did not request this action, no further action is required from your side.',
        },
    };
    const template = mailGenerator.generate(html);
    const mail = {
        to: email,
        subject: `${tickType.charAt(0).toUpperCase() + tickType.slice(1)} Tick Expiry Notification`,
        from: 'basseyephraim55@gmail.com',
        html: template,
    };

    return mailTransport(mail.from, mail.to, mail.subject, mail.html);
};
