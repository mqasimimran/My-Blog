-- Previously, unsubscribe worked with just ?email=x — anyone who knew or
-- guessed a subscriber's email could unsubscribe them without their
-- consent. This adds a random per-subscriber token; the unsubscribe link
-- now requires both the email and its matching token. Existing rows each
-- get their own freshly-generated token too, not a shared one.
alter table newsletter_subscribers
  add column if not exists unsubscribe_token text not null default encode(gen_random_bytes(16), 'hex');
