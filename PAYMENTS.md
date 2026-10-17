# Payments

Buyers pay by **manual transfer** — they send the money, enter the transaction ID,
and you verify it. The methods offered are JazzCash, EasyPaisa, Bank Transfer and Payoneer.

## Setting it up
1. **Account details:** Admin → Site Settings → *Payment Accounts*. A method with no
   details filled in shows buyers a "not set up yet" notice instead of blanks.
2. **Which methods appear:** `site.config.ts` → `payments.manualMethods`. Delete a line
   to remove that method from checkout, from the admin settings form, and from what the
   server accepts. `pkr: true` shows the price in Pakistani rupees (live rate).

## How an order moves
| Status | Meaning |
|---|---|
| `pending_verification` | Buyer says they've paid; waiting for you |
| `paid` | You verified it; the download link was emailed |
| `rejected` | You couldn't find the transaction |

You are emailed on every new order. Open **/admin/orders**, check the transaction in your
wallet/bank app, then click **Verify & release**.

Clicking *Verify* twice (or double-clicking) is now harmless: the second click reports
"already paid" and does not issue a second download link, take stock off twice, or send a
second email.

## Not built in
There is no card processor. If a customer of yours wants card checkout, that is a separate
add-on (and the right provider depends on the seller's country).
