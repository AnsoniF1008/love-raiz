import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import {
  INSTAGRAM_HANDLE,
  INSTAGRAM_POSTS,
  INSTAGRAM_URL,
  KITCHEN_CLIPS,
  instagramShortcode,
  postUrl,
} from '../lib/instagram'

export function IconInstagram({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  )
}

function useInstagramEmbed(ready) {
  useEffect(() => {
    if (!ready) return
    const process = () => window.instgrm?.Embeds.process()
    if (window.instgrm) {
      process()
      return
    }
    let script = document.querySelector('script[data-ig-embed]')
    if (!script) {
      script = document.createElement('script')
      script.src = 'https://www.instagram.com/embed.js'
      script.async = true
      script.dataset.igEmbed = '1'
      document.body.appendChild(script)
    }
    script.addEventListener('load', process)
    const id = setInterval(() => { if (window.instgrm) { process(); clearInterval(id) } }, 250)
    return () => {
      script.removeEventListener('load', process)
      clearInterval(id)
    }
  }, [ready])
}

export default function InstagramFeed({ products = [] }) {
  const reduced = useReducedMotion()
  const feedId = import.meta.env.VITE_BEHOLD_ID
  const [live, setLive] = useState(null)

  useEffect(() => {
    if (!feedId) return
    let cancelled = false
    fetch(`https://feeds.behold.so/${feedId}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => {
        if (cancelled) return
        const posts = (data.posts || data).slice(0, 6).map((p) => ({
          key: p.id,
          href: p.permalink,
          src: p.sizes?.medium?.mediaUrl || p.sizes?.medium?.url || p.mediaUrl,
          alt: p.caption || `@${INSTAGRAM_HANDLE}`,
        }))
        setLive(posts.filter((p) => p.src))
      })
      .catch(() => { if (!cancelled) setLive([]) })
    return () => { cancelled = true }
  }, [feedId])

  const fromProducts = products
    .filter((p) => instagramShortcode(p.instagram_url))
    .map((p) => ({ url: p.instagram_url, caption: p.name }))
  const featured = [...INSTAGRAM_POSTS, ...fromProducts]
    .filter((p, i, all) => instagramShortcode(postUrl(p)) && all.findIndex((x) => postUrl(x) === postUrl(p)) === i)
    .slice(0, 3)

  useInstagramEmbed(featured.length > 0)

  const tiles = (live?.length ? live : products.filter((p) => p.image_url).slice(0, 6).map((p) => ({
    key: p.id,
    href: p.instagram_url || INSTAGRAM_URL,
    src: p.image_url,
    alt: p.name,
  })))

  return (
    <section id="instagram" className="mt-4 bg-cocoa text-milk">
      <div className="mx-auto max-w-6xl px-5 md:px-6 pt-12 pb-12 md:py-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-caramel">Instagram</p>
            <h2 className="mt-2 font-display font-extrabold tracking-tight text-3xl md:text-5xl">Follow the bake</h2>
            <p className="mt-2 max-w-md text-sm text-milk/70">Daily drops, sold-out flavors, and what’s coming out of the oven — at @{INSTAGRAM_HANDLE}.</p>
          </div>
          <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" className="btn bg-milk text-cocoa hover:bg-oat px-5 py-3 text-sm">
            <IconInstagram />
            @{INSTAGRAM_HANDLE}
          </a>
        </div>

        {featured.length > 0 && (
          <div className="mt-8 grid sm:grid-cols-3 gap-3">
            {featured.map((post) => {
              const url = postUrl(post)
              return (
                <article key={url} className="flex flex-col overflow-hidden rounded-tile bg-milk text-cocoa">
                  <a href={url} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-3 text-sm font-semibold">
                    <IconInstagram size={16} />
                    @{INSTAGRAM_HANDLE}
                  </a>
                  <p className="px-4 pb-3 font-display text-xl font-bold leading-tight">{post.caption}</p>
                  <blockquote
                    className="instagram-media !m-0 !min-w-0 !w-full !max-w-full"
                    data-instgrm-permalink={`${url}?utm_source=ig_embed`}
                    data-instgrm-version="14"
                  >
                    <a href={url} target="_blank" rel="noreferrer" className="block px-4 pb-4 text-sm font-semibold text-raspberry">
                      View on Instagram
                    </a>
                  </blockquote>
                </article>
              )
            })}
          </div>
        )}

        {KITCHEN_CLIPS.length > 0 && (
          <div className="mt-3 grid sm:grid-cols-2 gap-3">
            {KITCHEN_CLIPS.map((clip) => (
              <article key={clip.id} className="flex flex-col overflow-hidden rounded-tile bg-milk text-cocoa">
                <p className="px-4 py-3 text-sm font-semibold text-cocoa2">Kitchen</p>
                <p className="px-4 pb-3 font-display text-xl font-bold leading-tight">{clip.caption}</p>
                <video
                  src={clip.src}
                  controls
                  playsInline
                  preload="metadata"
                  className="w-full bg-cocoa aspect-[9/16] max-h-[32rem] object-cover"
                >
                  Your browser can’t play this clip.
                </video>
              </article>
            ))}
          </div>
        )}

        {tiles.length > 0 && (live?.length || featured.length === 0) ? (
          <div className="mt-8 grid grid-cols-2 md:grid-cols-3 gap-3 pb-8">
            {tiles.map((t, i) => (
              <motion.a
                key={t.key}
                href={t.href}
                target="_blank"
                rel="noreferrer"
                aria-label={`${t.alt} on Instagram`}
                initial={reduced ? false : { opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.4, delay: reduced ? 0 : i * 0.05, ease: [0.22, 0.8, 0.2, 1] }}
                whileTap={{ scale: 0.98 }}
                className="group relative aspect-square overflow-hidden rounded-tile bg-milk"
              >
                <img src={t.src} alt="" loading="lazy" className="h-full w-full object-contain p-4 transition-transform duration-200 ease-out group-hover:scale-[1.04]" />
                <span aria-hidden="true" className="pointer-events-none absolute inset-0 grid place-items-center bg-cocoa/0 text-milk opacity-0 transition-[opacity,background-color] duration-200 group-hover:bg-cocoa/45 group-hover:opacity-100">
                  <span className="flex items-center gap-2 text-sm font-semibold">
                    <IconInstagram size={16} />
                    Open
                  </span>
                </span>
              </motion.a>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  )
}
