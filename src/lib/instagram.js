export const INSTAGRAM_HANDLE = 'love.raiz'
export const INSTAGRAM_URL = 'https://www.instagram.com/love.raiz/'

/** Latest posts to feature. Paste new links from Instagram → Share → Copy link. */
export const INSTAGRAM_POSTS = [
  {
    url: 'https://www.instagram.com/p/DY2H53UDdmQ/',
    caption: 'Talavera inspired conchas',
  },
  {
    url: 'https://www.instagram.com/p/DdcUywAoKkg/',
    caption: 'Meet the cinnamonsters',
  },
  {
    url: 'https://www.instagram.com/p/DdcT-ZwoHOU/',
    caption: 'Spooky season tastes a little sweeter',
  },
]

/** Clips filmed in the kitchen — play on the shop, no Instagram. */
export const KITCHEN_CLIPS = [
  { id: 'bake-173139', src: import.meta.env.BASE_URL + 'videos/bake-173139.mp4', caption: 'Meet the cinnamonsters' },
  { id: 'bake-173139-b', src: import.meta.env.BASE_URL + 'videos/bake-173139-b.mp4', caption: 'Spooky season' },
]

export function postUrl(post) {
  return typeof post === 'string' ? post : post?.url
}

export function instagramShortcode(url) {
  const m = String(url || '').match(/instagram\.com\/(?:p|reel|tv)\/([^/?#]+)/i)
  return m?.[1] || null
}
