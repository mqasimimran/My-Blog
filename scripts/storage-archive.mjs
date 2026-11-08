import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

export const sha256 = bytes => createHash('sha256').update(bytes).digest('hex')

function checked(result) {
  if (result.error) throw new Error(result.error.message)
  return result.data
}

async function* pages(load) {
  for (let offset = 0; ;) {
    const rows = checked(await load(offset))
    if (!rows.length) return
    yield* rows
    offset += rows.length
  }
}

async function inventory(storage) {
  const buckets = []
  for await (const bucket of pages(offset => storage.listBuckets({limit:100, offset, sortColumn:'id', sortOrder:'asc'}))) {
    const files = []
    const objects = storage.from(bucket.id)
    const folders = ['']
    while (folders.length) {
      const folder = folders.pop()
      for await (const entry of pages(offset => objects.list(folder,{limit:100, offset, sortBy:{column:'name',order:'asc'}}))) {
        const path = folder ? folder+'/'+entry.name : entry.name
        if (!entry.id) folders.push(path)
        else files.push({path, updated:entry.updated_at, size:entry.metadata?.size, contentType:entry.metadata?.mimetype,
          cacheControl:entry.metadata?.cacheControl?.match(/max-age=(\d+)/)?.[1], metadata:entry.user_metadata})
      }
    }
    buckets.push({id:bucket.id, public:bucket.public, fileSizeLimit:bucket.file_size_limit,
      allowedMimeTypes:bucket.allowed_mime_types, files})
  }
  return buckets
}

export async function archiveStorage(storage, directory) {
  await mkdir(join(directory,'objects'))
  const buckets = await inventory(storage)
  const signature = JSON.stringify(buckets)
  const saved = new Set()
  for (const bucket of buckets) {
    for (const file of bucket.files) {
      const blob = checked(await storage.from(bucket.id).download(file.path))
      const bytes = Buffer.from(await blob.arrayBuffer())
      if (file.size != null && Number(file.size) !== bytes.length) throw new Error('Storage file size changed during backup')
      file.sha256 = sha256(bytes)
      if (!saved.has(file.sha256)) {
        await writeFile(join(directory,'objects',file.sha256),bytes,{mode:0o600})
        saved.add(file.sha256)
      }
    }
  }
  if (JSON.stringify(await inventory(storage)) !== signature) throw new Error('Storage changed during backup. Retry when uploads are quiet.')
  return buckets
}

async function verifiedFile(directory, file) {
  if (!/^[a-f0-9]{64}$/.test(file.sha256)) throw new Error('Invalid object digest')
  const bytes = await readFile(join(directory,'objects',file.sha256))
  if (sha256(bytes) !== file.sha256) throw new Error('Storage checksum mismatch for '+file.path)
  return bytes
}

export async function restoreStorage(storage, directory, buckets, restoreDatabase) {
  const existing = checked(await storage.listBuckets({limit:1}))
  if (existing.length) throw new Error('Restore requires an empty target Storage project')
  for (const bucket of buckets) {
    for (const file of bucket.files) await verifiedFile(directory,file)
  }
  const created = []
  try {
    for (const bucket of buckets) {
      checked(await storage.createBucket(bucket.id,{public:bucket.public, fileSizeLimit:bucket.fileSizeLimit, allowedMimeTypes:bucket.allowedMimeTypes}))
      const staged = {id:bucket.id,files:[]}
      created.push(staged)
      const api = storage.from(bucket.id)
      for (const file of bucket.files) {
        const bytes = await verifiedFile(directory,file)
        checked(await api.upload(file.path,bytes,{upsert:false,contentType:file.contentType,cacheControl:file.cacheControl,metadata:file.metadata}))
        staged.files.push(file.path)
        const restored = checked(await api.download(file.path))
        if (sha256(Buffer.from(await restored.arrayBuffer())) !== file.sha256) throw new Error('Restored file differs: '+file.path)
      }
    }
    await restoreDatabase()
  } catch (cause) {
    for (const bucket of created.reverse()) {
      for (let i=0; i<bucket.files.length; i+=100) checked(await storage.from(bucket.id).remove(bucket.files.slice(i,i+100)))
      checked(await storage.deleteBucket(bucket.id))
    }
    throw cause
  }
}
