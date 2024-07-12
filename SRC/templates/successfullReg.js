import { mailTransport } from "../config/googlapis.js"
import { mailGenerator } from "../config/mailgen.js"

import dotenv from 'dotenv';
dotenv.config()

export const successfullRegistration = async (email, userName, loginID) => {
    const html = {
        body: {
            signature: false,
            greeting: `Hello ${userName}`,
            intro: `Welcome to SLANG your loginID is ${loginID}`,
            outro: [
                `If you did not request a loginId , please ignore or contact us`,
            ]
        }
    }
    const template = mailGenerator.generate(html)
    const mail = {
        to: email,
        subject: `Successful Registration`,
        from: 'basseyephraim55@gmail.com',
        html: template
    }

    return mailTransport(mail.to, mail.from,mail.subject,mail.html)

}