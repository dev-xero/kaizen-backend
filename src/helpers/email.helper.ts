import { env } from '@config/variables';
import { BadRequestError } from '@errors/badrequest.error';
import { InternalServerError } from '@errors/internal.error';
import { UnprocessableError } from '@errors/unprocessable.error';
import { EmailParams, MailerSend, Recipient, Sender } from 'mailersend';

type EmailRecipient = {
    email: string;
    name: string;
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

    // Handles sending text emails
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
    }
}
