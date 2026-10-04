#!/usr/bin/env bash
# Attacks your own database the way an outsider would — using only the
# public anon key (the one anyone can copy out of your site's JavaScript).
# Every "should be BLOCKED" check must fail, and the "should WORK" checks
# must still succeed.
#
#   SUPABASE_URL=https://xxxx.supabase.co SUPABASE_ANON_KEY=eyJ... ./scripts/verify-lockdown.sh
set -u
: "${SUPABASE_URL:?set SUPABASE_URL}"
: "${SUPABASE_ANON_KEY:?set SUPABASE_ANON_KEY}"
H=(-H "apikey: $SUPABASE_ANON_KEY" -H "Authorization: Bearer $SUPABASE_ANON_KEY" -H "Content-Type: application/json")
pass=0; fail=0

blocked() { # name, expected: non-2xx OR empty array for reads
  local name="$1"; shift
  local out code
  out=$(curl -s -o /tmp/vl_body -w "%{http_code}" "$@"); code=$out
  if [[ "$code" =~ ^2 ]] && [[ "$(cat /tmp/vl_body)" != "[]" ]] && [[ -s /tmp/vl_body ]]; then
    echo "FAIL  (should be blocked, got HTTP $code): $name"; fail=$((fail+1))
  else echo "PASS  blocked: $name"; pass=$((pass+1)); fi
}
works() {
  local name="$1"; shift
  local code; code=$(curl -s -o /tmp/vl_body -w "%{http_code}" "$@")
  if [[ "$code" =~ ^2 ]]; then echo "PASS  works:   $name"; pass=$((pass+1))
  else echo "FAIL  (should work, got HTTP $code): $name"; fail=$((fail+1)); fi
}
R="$SUPABASE_URL/rest/v1"

echo "== WRITES (all must be blocked) =="
blocked "insert article"          -X POST   "$R/articles" "${H[@]}" -d '{"title":"hacked","slug":"hacked","category":"x","content":"x"}'
blocked "update every article"    -X PATCH  "$R/articles?id=not.is.null" "${H[@]}" -d '{"title":"hacked"}'
blocked "delete every article"    -X DELETE "$R/articles?id=not.is.null" "${H[@]}"
blocked "insert fake order"       -X POST   "$R/orders" "${H[@]}" -d '{"status":"paid"}'
blocked "mark orders paid"        -X PATCH  "$R/orders?id=not.is.null" "${H[@]}" -d '{"status":"paid"}'
blocked "insert subscriber"       -X POST   "$R/newsletter_subscribers" "${H[@]}" -d '{"email":"x@x.com"}'
blocked "change site settings"    -X PATCH  "$R/site_settings?id=not.is.null" "${H[@]}" -d '{"jazzcash_number":"0000"}'
blocked "insert client logo"      -X POST   "$R/client_logos" "${H[@]}" -d '{"name":"x","image_url":"x"}'

echo "== PRIVATE DATA (all reads must be blocked or empty) =="
blocked "read messages"               "$R/messages?select=*" "${H[@]}"
blocked "read orders"                 "$R/orders?select=*" "${H[@]}"
blocked "read subscriber emails"      "$R/newsletter_subscribers?select=*" "${H[@]}"
blocked "read login attempts"         "$R/login_attempts?select=*" "${H[@]}"
blocked "read paid file URLs"         "$R/products?select=digital_file_url" "${H[@]}"

echo "== PUBLIC SITE (must still work) =="
works "read published articles"       "$R/articles?select=title,slug&published=eq.true&limit=1" "${H[@]}"
works "read projects"                 "$R/projects?select=title&limit=1" "${H[@]}"
works "read shop catalog"             "$R/products?select=id,name,price&limit=1" "${H[@]}"
works "read site settings"            "$R/site_settings?select=available_for_work&limit=1" "${H[@]}"

echo "== STORAGE (anonymous upload must be blocked) =="
blocked "anon upload to blog-images"  -X POST "$SUPABASE_URL/storage/v1/object/blog-images/lockdown-test.png" "${H[@]}" -H "Content-Type: image/png" --data-binary "x"

echo; echo "RESULT: $pass passed, $fail failed"
[[ $fail -eq 0 ]] && echo "Lockdown verified." || { echo "Something is still open — do not consider this done."; exit 1; }
