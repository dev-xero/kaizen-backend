import { env } from '@config/variables';
import { InternalServerError } from '@errors/internal.error';
import { UnprocessableError } from '@errors/unprocessable.error';
import { EmailParams, MailerSend, Recipient, Sender } from 'mailersend';
import { promises as fs } from 'node:fs';

import logger from '@utils/logger';
import path from 'node:path';
import Handlebars from 'handlebars';

type EmailRecipient = {
    email: string;
    name: string;
};

type VerificationEmailTemplate = {
    verificationLink: string;
};

// Email sending helper
class EmailHelper {
    private mailService: MailerSend;
    private sender: Sender;

    constructor() {
        const apiKey = env.mailerSendKey;
        const kaizenEmail = env.kaizen.email;
        const kaizenEmailName = env.kaizen.emailName;

        if (!apiKey) {
            throw new InternalServerError('Mail service API key missing.');
        }

        if (!(kaizenEmail && kaizenEmailName)) {
            throw new InternalServerError(
                'Email address and name not properly configured.'
            );
        }

        this.mailService = new MailerSend({ apiKey });
        this.sender = new Sender(kaizenEmail, kaizenEmailName);
    }

    // Converts an array of email recipients into a mailer format
    private generateMailingList(recipients: EmailRecipient[]): Recipient[] {
        const mailingList = [];

        for (const recipient of recipients) {
            const newRecipient = new Recipient(recipient.email, recipient.name);
            mailingList.push(newRecipient);
        }

        return mailingList;
    }

    // Parses and returns a html string (must be inside templates directory)
    private async parseHTMLFromPath(
        htmlFile: string,
        templateData: any = null
    ) {
        const htmlFilePath = path.join(__dirname, '..', 'templates', htmlFile);

        try {
            // Read the html file asynchronously
            const content = await fs.readFile(htmlFilePath, {
                encoding: 'utf8',
            });

            let parsedHTML = content;

            // If there are template literals to parse, compile that with handlebars
            if (templateData) {
                const template = Handlebars.compile(content);
                const html = template(templateData);

                parsedHTML = html;
            }

            return parsedHTML;
        } catch (err) {
            console.error(err);
            throw new InternalServerError(
                'Unable to complete email sending request.'
            );
        }
    }

    /**
     * Asynchronously sends a text email.
     *
     * @param recipients An array of email recipients which is a map of email and names.
     * @param subject The email subject.
     * @param text The email text.
     */
    public async sendTextEmail(
        recipients: EmailRecipient[],
        subject: string,
        text: string
    ) {
        if (!(subject.trim().length == 0 && text.trim().length == 0)) {
            throw new UnprocessableError(
                'Provide both a subject and text to send email.'
            );
        }

        const mailingList = this.generateMailingList(recipients);

        const emailParameters = new EmailParams()
            .setFrom(this.sender)
            .setTo(mailingList)
            .setReplyTo(this.sender)
            .setSubject(subject)
            .setText(text);

        await this.mailService.email.send(emailParameters);

        logger.info('Successfully sent text email.');
    }

    /**
     * Asynchronously sends a html email.
     *
     * @param recipients An array of email recipients which is a map of email and names.
     * @param subject The email subject.
     * @param htmlpath Path to the html file under the `templates` directory
     * @param templateData Handlebars compilable template data (nullable).
     */
    public async sendHTMLEmail(
        recipients: EmailRecipient[],
        subject: string,
        htmlpath: string,
        templateData: any | null = null
    ) {
        if (subject.trim().length == 0 && htmlpath.trim().length == 0) {
            throw new UnprocessableError(
                'Provide both a subject and html path to send email.'
            );
        }

        const mailingList = this.generateMailingList(recipients);
        const parsedHTML = await this.parseHTMLFromPath(htmlpath, templateData);

        const emailParameters = new EmailParams()
            .setFrom(this.sender)
            .setTo(mailingList)
            .setReplyTo(this.sender)
            .setSubject(subject)
            .setHtml(parsedHTML);

        await this.mailService.email.send(emailParameters);
    }

    /**
     * Asynchronously sends a user verification email.
     *
     * @param recipients An array of email recipients which is a map of email and names.
     * @param subject The email subject.
     * @param templateData Handlebars compilable template data.
     */
    public async sendUserVerificationEmail(
        recipients: EmailRecipient[],
        subject: string,
        templateData: VerificationEmailTemplate
    ) {
        await this.sendHTMLEmail(
            recipients,
            subject,
            'mail.html', // default verification email file name
            templateData
        );

        logger.info('Successfully sent verification email.');
    }
}

const emailHelper = new EmailHelper();

export default emailHelper;
