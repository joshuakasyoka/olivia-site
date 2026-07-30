/**
 * Fetch Olivia Hingley's latest articles from It's Nice That.
 *
 * There's no public API — this scrapes the author listing pages and
 * each article's og:image. Re-run periodically to refresh content:
 *
 *   npm run fetch:articles
 *
 * Writes:
 *   src/data/int-articles.json
 *   public/int/<slug>.jpg
 */
import { mkdir, writeFile } from 'node:fs/promises'
import { createWriteStream } from 'node:fs'
import { pipeline } from 'node:stream/promises'
import { Readable } from 'node:stream'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const OUT_JSON = path.join(ROOT, 'src/data/int-articles.json')
const OUT_IMG_DIR = path.join(ROOT, 'public/int')

const AUTHOR_URL = 'https://www.itsnicethat.com/authors/olivia-hingley'
const ORIGIN = 'https://www.itsnicethat.com'
const TARGET = 30
const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

const MONTHS = {
  january: '01',
  february: '02',
  march: '03',
  april: '04',
  may: '05',
  june: '06',
  july: '07',
  august: '08',
  september: '09',
  october: '10',
  november: '11',
  december: '12',
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

async function fetchText(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': UA, Accept: 'text/html' },
  })
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`)
  return res.text()
}

function decodeEntities(str) {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#x27;/g, "'")
    .replace(/&nbsp;/g, ' ')
}

function stripTags(str) {
  return decodeEntities(str.replace(/<[^>]+>/g, '')).trim()
}

/** "14 July 2026" → "14.07.2026" */
function formatDate(raw) {
  const m = raw.match(/(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})/)
  if (!m) return raw
  const day = m[1].padStart(2, '0')
  const month = MONTHS[m[2].toLowerCase()]
  if (!month) return raw
  return `${day}.${month}.${m[3]}`
}

function slugFromHref(href) {
  return href
    .replace(/^\/(articles|features|news)\//, '')
    .replace(/\/$/, '')
}

/** Keep the original og:image URL — resized variants often 403. */
function thumbUrl(ogImage) {
  return ogImage || null
}

function parseListingPage(html) {
  const articles = []
  // Only split on the listing-item wrapper class, not listing-item-title/image
  const parts = html.split(/class="listing-item"/)
  for (const part of parts.slice(1)) {
    const href = part.match(
      /href="(\/(?:articles|features|news)\/[^"]+)"/
    )?.[1]
    const titleHtml = part.match(
      /listing-item-title[^>]*>([\s\S]*?)<\/span>/
    )?.[1]
    const dateRaw = part.match(/(\d{1,2}\s+[A-Za-z]+\s+\d{4})/)?.[1]
    if (!href || !titleHtml) continue
    articles.push({
      href,
      slug: slugFromHref(href),
      title: stripTags(titleHtml),
      date: dateRaw ? formatDate(dateRaw) : '',
      url: `${ORIGIN}${href}`,
    })
  }
  const seen = new Set()
  return articles.filter((a) => {
    if (seen.has(a.slug)) return false
    seen.add(a.slug)
    return true
  })
}

function parseArticleMeta(html) {
  const ogImage =
    html.match(/property="og:image"\s+content="([^"]+)"/)?.[1] ||
    html.match(/content="(https:\/\/admin\.itsnicethat\.com\/images\/[^"]+)"\s+property="og:image"/)?.[1]
  const ogTitle =
    html.match(/property="og:title"\s+content="([^"]+)"/)?.[1] ||
    html.match(/content="([^"]+)"\s+property="og:title"/)?.[1]
  return {
    image: ogImage ? decodeEntities(ogImage) : null,
    title: ogTitle ? decodeEntities(ogTitle) : null,
  }
}

async function downloadImage(url, dest) {
  const res = await fetch(url, {
    headers: {
      'User-Agent': UA,
      Referer: 'https://www.itsnicethat.com/',
      Accept: 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
    },
  })
  if (!res.ok) throw new Error(`Image HTTP ${res.status}`)
  await pipeline(Readable.fromWeb(res.body), createWriteStream(dest))
}

async function collectListings() {
  const all = []
  const seen = new Set()
  for (let page = 1; page <= 8 && all.length < TARGET; page += 1) {
    const url = page === 1 ? AUTHOR_URL : `${AUTHOR_URL}?page=${page}`
    console.log(`Listing page ${page}…`)
    const html = await fetchText(url)
    const batch = parseListingPage(html)
    let added = 0
    for (const item of batch) {
      if (seen.has(item.slug)) continue
      seen.add(item.slug)
      all.push(item)
      added += 1
      if (all.length >= TARGET) break
    }
    console.log(`  +${added} (total ${all.length})`)
    if (added === 0) break
    await sleep(400)
  }
  return all.slice(0, TARGET)
}

async function main() {
  await mkdir(OUT_IMG_DIR, { recursive: true })
  const listings = await collectListings()
  if (!listings.length) throw new Error('No articles found — site markup may have changed')

  const articles = []
  for (let i = 0; i < listings.length; i += 1) {
    const item = listings[i]
    process.stdout.write(`[${i + 1}/${listings.length}] ${item.slug}… `)
    try {
      const html = await fetchText(item.url)
      const meta = parseArticleMeta(html)
      const title = meta.title || item.title
      const remote = thumbUrl(meta.image)
      let image = null
      if (remote) {
        const file = `${item.slug}.jpg`
        const dest = path.join(OUT_IMG_DIR, file)
        try {
          await downloadImage(remote, dest)
          image = `/int/${file}`
        } catch {
          // CDN sometimes blocks downloads — keep a remote thumb so the UI still works
          image = remote
        }
      }
      articles.push({
        id: i + 1,
        type: 'article',
        date: item.date,
        title,
        image,
        url: item.url,
        slug: item.slug,
      })
      console.log(image ? 'ok' : 'ok (no image)')
    } catch (err) {
      console.log('FAIL', err.message)
      articles.push({
        id: i + 1,
        type: 'article',
        date: item.date,
        title: item.title,
        image: null,
        url: item.url,
        slug: item.slug,
      })
    }
    await sleep(350)
  }

  await writeFile(OUT_JSON, `${JSON.stringify(articles, null, 2)}\n`, 'utf8')
  console.log(`\nWrote ${articles.length} articles → ${path.relative(ROOT, OUT_JSON)}`)
  console.log(`Images → ${path.relative(ROOT, OUT_IMG_DIR)}/`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
