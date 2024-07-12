import { mailTransport } from "../config/googlapis.js"
import { mailGenerator } from "../config/mailgen.js"

import dotenv from 'dotenv';
dotenv.config()

export const otpGeneration = async (email, otp ) => {
    const html = {
        body: {
            signature: false,
            greeting: `Hello User`,
            intro: `Welcome to SLANG your otp is ${otp}`,
            outro: [
                `If you did not request an otp , please ignore or contact us`,
            ]
        }
    }
    const template = mailGenerator.generate(html)
    const mail = {
        to: email,
        subject: `Forgot Password Mail`,
        from: 'basseyephraim55@gmail.com',
        html: template
    }

    return mailTransport(mail.to, mail.from,mail.subject,mail.html)

}