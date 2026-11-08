import { createClient } from '@supabase/supabase-js'
import { spawnSync } from 'node:child_process'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { resolve, join } from 'node:path'
import { createHash } from 'node:crypto'
import { createReadStream } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { archiveStorage, restoreStorage } from './storage-archive.mjs'

function databaseTool(name, args) {
  const url = new URL(process.env.RECOVERY_DATABASE_URL)
  if (!['postgres:', 'postgresql:'].includes(url.protocol)) throw new Error('Invalid recovery database connection')
  const env = {...process.env, PGHOST:url.hostname, PGPORT:url.port || '5432',
    PGDATABASE:decodeURIComponent(url.pathname.slice(1)) || 'postgres', PGUSER:decodeURIComponent(url.username),
    PGPASSWORD:decodeURIComponent(url.password), PGSSLMODE:url.searchParams.get('sslmode') || 'require'}
  const proc = spawnSync(name,args,{encoding:'utf8',env})
  if (proc.error || proc.status !== 0) throw new Error(name+' failed: '+(proc.error?.code || proc.stderr.trim()))
  return proc.stdout.trim()
}
async function fileHash(path) {
  const hash = createHash('sha256')
  for await (const bytes of createReadStream(path)) hash.update(bytes)
  return hash.digest('hex')
}

const policyQuery = `select format('create policy %I on %I.%I as %s for %s to %s%s%s;',policyname,schemaname,tablename,permissive,cmd,
  (select string_agg(quote_ident(role_name),',') from unnest(roles) as role_name),
  case when qual is null then '' else ' using ('||qual||')' end,
  case when with_check is null then '' else ' with check ('||with_check||')' end)
  from pg_policies where schemaname='storage' and tablename in ('objects','buckets') order by tablename,policyname`

async function run() {
  const [action, folder] = process.argv.slice(2)
  if (!['create','restore'].includes(action) || !folder) throw new Error('Use: node scripts/recovery.mjs create|restore DIRECTORY')
  const {RECOVERY_DATABASE_URL,RECOVERY_SUPABASE_URL,RECOVERY_SERVICE_ROLE_KEY} = process.env
  if (!RECOVERY_DATABASE_URL || !RECOVERY_SUPABASE_URL || !RECOVERY_SERVICE_ROLE_KEY) throw new Error('Set the three RECOVERY connection variables described in SECURITY-OPERATIONS.md')
  const origin = new URL(RECOVERY_SUPABASE_URL).origin
  const db = createClient(origin,RECOVERY_SERVICE_ROLE_KEY,{auth:{persistSession:false,autoRefreshToken:false}})
  const directory = resolve(folder)
  const dump = join(directory,'public.sql'), policies = join(directory,'storage-policies.sql')
  const manifest = join(directory,'manifest.json')
  if (action === 'create') {
    await mkdir(directory,{mode:0o700})
    await writeFile(join(directory,'.gitignore'),'*\n',{mode:0o600})
    databaseTool('pg_dump',['--schema=public','--clean','--if-exists','--no-owner','-f',dump])
    await writeFile(policies,databaseTool('psql',['-XAt','-v','ON_ERROR_STOP=1','-c',policyQuery]),{mode:0o600})
    const buckets = await archiveStorage(db.storage,directory)
    await writeFile(manifest,JSON.stringify({version:1,origin,createdAt:new Date().toISOString(),
      sqlHash:await fileHash(dump), policiesHash:await fileHash(policies),buckets},null,2),{mode:0o600})
    console.log('Recovery bundle complete:',buckets.length,'buckets;',buckets.reduce((n,b)=>n+b.files.length,0),'files')
    return
  }
  const backup = JSON.parse(await readFile(manifest,'utf8'))
  if (backup.version !== 1 || backup.origin === origin) throw new Error('Choose a different empty recovery project')
  if (backup.sqlHash !== await fileHash(dump) || backup.policiesHash !== await fileHash(policies)) throw new Error('Database dump checksum mismatch')
  const empty = databaseTool('psql',['-XAt','-v','ON_ERROR_STOP=1','-c',
    "select not exists(select from pg_class where relnamespace='public'::regnamespace) and not exists(select from pg_proc where pronamespace='public'::regnamespace) and not exists(select from pg_policies where schemaname='storage' and tablename in ('objects','buckets'))"])
  if (empty !== 't') throw new Error('Restore requires an empty public schema and no preexisting Storage policies')
  await restoreStorage(db.storage,directory,backup.buckets,async () => {
    databaseTool('psql',['-X','-q','-v','ON_ERROR_STOP=1',
      '-v','source_storage='+new URL(backup.origin).origin+'/storage/v1/',
      '-v','target_storage='+origin+'/storage/v1/','--single-transaction',
      '-f',dump,'-f',policies,'-f',fileURLToPath(new URL('./rebase-storage.sql',import.meta.url))])
  })
  console.log('Public schema restored and uploaded files verified.')
}
run().catch(error => { console.error(error.message); process.exitCode=1 })
