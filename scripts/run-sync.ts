import { syncAll } from '../src/lib/screen-sync'

const t0 = Date.now()
const r = await syncAll(true)
console.log('sync done in', Date.now() - t0, 'ms')
console.log(JSON.stringify(r, null, 1))
process.exit(0)
