import NmSender from '../src/index';
import credentials from '../config/credentials';

const nm = new NmSender({
  host: credentials.EMAIL_SMTP_HOST,
  password: credentials.EMAIL_SMTP_PASSWORD,
  user: credentials.EMAIL_SMTP_LOGIN,
  port: credentials.EMAIL_SMTP_PORT,
  defaultFromAddress: credentials.EMAIL_DEFAULT_ADDRESS,
  retryTime: 1, // in SEC
  maxRetries: 2,
});

describe('nm-sender', () => {
  it('Should be able to send email`', async () => {
    expect.assertions(1);
    const info = await nm.sendMail({
      to: credentials.EMAIL_TO_TEST_ADDRESS,
      subject: 'hey test',
      text: 'Hello there, email should be fine',
    });

    expect(info.accepted[0]).toEqual(credentials.EMAIL_TO_TEST_ADDRESS);
  });

  it('When fails it should retry and gives up', async () => {
    expect(async () => {
      await nm.sendMail({
        to: 'nonexistentinal-email-email@email-asd-asd-asd-asd.com',
        subject: 'hey test',
        text: 'Hello there, email should not be sent',
      });
    }).rejects.toBeDefined();
  });
});
