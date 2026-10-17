-- Adds an optional public verification link to each certification
-- (e.g. a Coursera/Credly share link, or Microsoft's MOS certificate
-- lookup page). Nullable — certs without one just fall back to the
-- uploaded certificate image.
alter table certifications
  add column if not exists verify_url text;
