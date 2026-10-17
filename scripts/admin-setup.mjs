#!/usr/bin/env node
// One-time admin security setup. Nothing is sent anywhere — this just
// prints values for you to paste into Vercel / .env.local.
//
//   node scripts/admin-setup.mjs hash     -> ADMIN_PASSWORD_HASH (prompts for the password)
//   node scripts/admin-setup.mjs totp     -> ADMIN_TOTP_SECRET + the key to type into your authenticator app
import { scryptSync, randomBytes } from 'node:crypto'

const B32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
function base32Encode(buf) {
  let bits = 0, value = 0, out = ''
  for (const byte of buf) { value = (value << 8) | byte; bits += 8; while (bits >= 5) { out += B32[(value >>> (bits - 5)) & 31]; bits -= 5 } }
  if (bits > 0) out += B32[(value << (5 - bits)) & 31]
  return out
}

let pipedLines = null
async function pipedLine() {
  if (!pipedLines) {
    let data = ''
    for await (const chunk of process.stdin) data += chunk
    pipedLines = data.split(/\r?\n/)
  }
  return pipedLines.shift() ?? ''
}

function promptHidden(q) {
  return new Promise((resolve) => {
    if (!process.stdin.isTTY) {
      // Piped / non-interactive input: read stdin ONCE, then hand out one
      // line per prompt (a fresh reader per prompt would lose buffered lines).
      pipedLine().then(resolve)
      return
    }
    process.stdout.write(q)
    const stdin = process.stdin
    stdin.setRawMode(true); stdin.resume(); stdin.setEncoding('utf8')
    let buf = ''
    stdin.on('data', function onData(chunk) {
      for (const c of chunk) {
        if (c === '\n' || c === '\r' || c === '\u0004') {
          stdin.setRawMode(false); stdin.pause(); stdin.removeListener('data', onData)
          process.stdout.write('\n'); return resolve(buf)
        }
        if (c === '\u0003') process.exit(1)
        if (c === '\u007f' || c === '\b') buf = buf.slice(0, -1)
        else buf += c
      }
    })
  })
}

const cmd = process.argv[2]

if (cmd === 'hash') {
  const pw = await promptHidden('New admin password (input hidden): ')
  if (pw.length < 12) { console.error('Use at least 12 characters (a long passphrase is best).'); process.exit(1) }
  const again = await promptHidden('Repeat it: ')
  if (pw !== again) { console.error('Those did not match.'); process.exit(1) }
  const N = 65536, r = 8, p = 1
  const salt = randomBytes(16)
  const hash = scryptSync(pw.normalize('NFKC'), salt, 64, { N, r, p, maxmem: 256 * 1024 * 1024 })
  console.log('\nAdd this to Vercel (and .env.local), then REMOVE the old ADMIN_PASSWORD variable:\n')
  console.log(`ADMIN_PASSWORD_HASH=${['scrypt', N, r, p, salt.toString('base64url'), hash.toString('base64url')].join(':')}\n`)
} else if (cmd === 'totp') {
  const secret = base32Encode(randomBytes(20))
  const label = encodeURIComponent(process.argv[3] || 'Admin')
  console.log('\n1) Add this to Vercel (and .env.local):\n')
  console.log(`ADMIN_TOTP_SECRET=${secret}\n`)
  console.log('2) In your authenticator app (Google Authenticator, Authy, 1Password...)')
  console.log('   choose "Enter a setup key" and type:\n')
  console.log(`   Account: ${decodeURIComponent(label)}`)
  console.log(`   Key:     ${secret.match(/.{1,4}/g).join(' ')}`)
  console.log('   Type:    Time based\n')
  console.log('   (or open this on a phone with an authenticator installed:)')
  console.log(`   otpauth://totp/${label}?secret=${secret}&issuer=Admin&digits=6&period=30\n`)
  console.log('3) Redeploy. Login will then also require the 6-digit code.')
  console.log('   KEEP A BACKUP of the key above (password manager) — if you lose')
  console.log('   your phone, remove ADMIN_TOTP_SECRET in Vercel to turn 2FA off.\n')
} else {
  console.log('Usage:\n  node scripts/admin-setup.mjs hash\n  node scripts/admin-setup.mjs totp [account-label]')
  process.exit(1)
}
