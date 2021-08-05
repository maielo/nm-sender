import nodemailer, { SentMessageInfo, Transporter } from 'nodemailer';
import { Options } from 'nodemailer/lib/mailer';

export type NmSenderConstructor = {
  retryTime?: number;
  maxRetries?: number;
  host: string;
  port: number;
  tls?: boolean;
  user: string;
  password: string;
  defaultFromAddress: string;
  errorAddress?: string;
};

// TODO: make it queue based
export default class NmSender {
  transporter: Transporter;
  retryTime: number;
  maxRetries: number;
  defaultFromAddress: string;
  errorAddress: string | null;

  constructor({
    retryTime = 5, // 5 secs
    maxRetries = 3,
    host,
    port,
    tls = true,
    user,
    password,
    defaultFromAddress,
    errorAddress,
  }: NmSenderConstructor) {
    const options = {
      pool: true,
      host,
      port,
      secure: tls, // use TLS
      auth: {
        user: user,
        pass: password,
      },
    };

    this.retryTime = retryTime;
    this.maxRetries = maxRetries;
    this.defaultFromAddress = defaultFromAddress;
    this.errorAddress = errorAddress || null;

    this.transporter = nodemailer.createTransport(options);

    this.transporter.verify((error) => {
      if (error) {
        console.error(error);
        throw new Error(`Could not initiate connection to SMTP mail server`);
      }
    });
  }

  public sendMail(
    mailOptions: Options,
    { errorAddress }: { errorAddress?: string } = {},
    _retryCount?: number
  ): Promise<SentMessageInfo> {
    mailOptions.from = mailOptions.from || this.defaultFromAddress;
    const that = this;
    return new Promise((resolve, reject) => {
      that.transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          _retryCount = _retryCount || 1;

          if (_retryCount <= that.maxRetries) {
            setTimeout(() => {
              that.sendMail(
                mailOptions,
                { errorAddress },
                _retryCount ? _retryCount + 1 : 1
              );
            }, that.retryTime * 1000);
          } else {
            if (errorAddress || that.errorAddress) {
              const _mailOptions = { ...mailOptions };
              _mailOptions.to = errorAddress || that.errorAddress || '';

              let _to = mailOptions.to;
              if (Array.isArray(_to)) {
                _to = _to.join(',');
              }

              _mailOptions.subject = `FAILED TO SEND TO: ${_to} | subject: ${
                mailOptions.subject || 'no subject'
              }`;
              // only one chance
              that.sendMail(mailOptions, { errorAddress }, that.maxRetries);
            }

            return reject(error);
          }
        }

        return resolve(info);
      });
    });
  }
}
