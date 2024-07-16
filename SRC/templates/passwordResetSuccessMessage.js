import { mailTransport } from "../config/googlapis.js"
import { mailGenerator } from "../config/mailgen.js"

export const sendSuccessEmail = async (email, name) => {
    try {
        const html = {
            body: {
                signature: false,
                greeting: `Hello ${name}`,
                intro: `Your password has been successfully reset.`,
                outro: [
                    `If you did not perform this action, please contact us immediately. 🐸🐸🐸🐸🐸🐸🐸🐸🐸🐸`,
                ]
            }
        };

        const template = mailGenerator.generate(html);

        const mail = {
            to: email,
            subject: `Password Reset Successful`,
            from: 'basseyephraim55@gmail.com',
            html: template
        };

        await mailTransport(mail.to, mail.from, mail.subject, mail.html);
        console.log(`Success email sent to ${email}`);
    } catch (error) {
        console.error('Error sending success email:', error);
    }
};