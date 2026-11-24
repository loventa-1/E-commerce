# Local order email

Order confirmations are sent through Nodemailer to Mailpit. Mailpit captures the messages locally; this setup does not send email to a real mailbox.

1. Start Laragon and make sure Mailpit is running.
2. Keep the backend settings in `.env` pointed at `127.0.0.1:1025` (the defaults in `.env.example`).
3. Start the project with `start-project.bat`.
4. Enter the customer's email during checkout and place an order.
5. View the captured message at <http://localhost:8025>.

If Mailpit is unavailable, the order is still saved and the API returns `emailSent: false`; the backend logs the delivery error.

## Stripe hosted Checkout (test mode)

Add the Stripe **test mode** API keys to `Backend/.env`. Keep the secret and webhook signing keys private; do not commit `.env` or send the values in chat. Stripe Checkout hosts the card entry form, so this application never receives or stores card details.

1. In the Stripe Dashboard, switch to **Test mode**, then open **Developers > API keys**. Copy the publishable key (`pk_test_...`) and secret key (`sk_test_...`) into `STRIPE_PUBLISHABLE_KEY` and `STRIPE_SECRET_KEY`.
2. Set `FRONTEND_URL=http://localhost:4200` and `STRIPE_CURRENCY=usd` (change currency only if your Stripe account and catalog prices use that currency). Restart the backend after editing `.env`.
3. Start the app and choose **Credit or debit card** at checkout. Stripe redirects back to `/buy`; the app verifies the session through the backend before showing the paid receipt or clearing the cart.
4. For a test payment, use `4242 4242 4242 4242`, any future expiration date, any three-digit CVC, and any postal code. Use Stripe's other documented test cards to exercise declines and authentication flows.

To receive local webhook events, install and authenticate the Stripe CLI, then run:

```powershell
stripe listen --forward-to localhost:5000/api/stripe/webhook
```

Copy the `whsec_...` signing secret printed by `stripe listen` into `STRIPE_WEBHOOK_SECRET` in `Backend/.env`, restart the backend, and leave the listener running. Complete a test checkout to trigger `checkout.session.completed`. The CLI secret is distinct from API keys and must also remain private.

Validation commands from the repository root:

```powershell
npm.cmd --prefix Frontend run build
node verify_all.js
```

`verify_all.js` starts MongoDB using the configured executable and its default `data/db` path; use a separate temporary database path when you need to preserve local development data. The Angular workspace currently has no configured test target or spec files, so `npm.cmd --prefix Frontend test` cannot run tests yet.