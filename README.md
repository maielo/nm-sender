# nm-sender

Wrapper around [nodemailer](https://www.npmjs.com/package/nodemailer) for sending emails via smtp with retries and on-error email notification

- pool is automatically set to `true` (`maxConnections`: 5)
- `mailOptions` [DOCS](https://nodemailer.com/message/)

```js
// ES6 modules
import NmSender from 'nm-sender';
// commonJS
const NmSender = require('nm-sender');

/**
 * ALL OPTIONS
  retryTime?: number;
  maxRetries?: number;
  host: string;
  port: number;
  tls?: boolean; // default true
  user: string;
  password: string;
  defaultFromAddress: string;
  errorAddress?: string;
 *
 */
const e = new NmSender({
  host: 'smtp.xxxx.com',
  port: 465,
  user: 'xxx@xxx.com',
  password: 'xxxx',
  defaultFromAddress: 'x@xxx.com',
});

// ...
// DOCS:
try {
  await e.sendMail({
    to: 'yyy@yyy.com',
    subject: 'My subject',
    from: 'yyy@yyy.com',
    text: 'Hello my email world',
  });
} catch (err) {
  console.error(err);
}
```
