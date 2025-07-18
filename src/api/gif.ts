const API_URL = 'https://api.giphy.com/v1/gifs'
const API_KEY = import.meta.env.VITE_GIPHY_API_KEY

export async function getTrendingGifs(limit = 30, page = 1) {
  const offset = (page - 1) * limit
  const res = await fetch(`${API_URL}/trending?api_key=${API_KEY}&limit=${limit}&offset=${offset}`)
  const json = await res.json()
  return json.data
}

export async function searchGifs(query: string, limit = 30, page = 1) {
  const offset = (page - 1) * limit
  const res = await fetch(`${API_URL}/search?api_key=${API_KEY}&q=${encodeURIComponent(query)}&limit=${limit}&offset=${offset}`)
  const json = await res.json()
  return json.data
}

export async function getGifById(id: string) {
  const res = await fetch(`${API_URL}/${id}?api_key=${API_KEY}`)
  const data = await res.json()
  return data.data
}

export async function getRandomGif() {
  const res = await fetch(`${API_URL}/random?api_key=${API_KEY}`)
  const data = await res.json()
  return data.data
}

export async function getRandomGifs(count = 20) {
  const promises = Array.from({ length: count }, () => getRandomGif())
  const gifs = await Promise.all(promises)
  return gifs
}

export async function getUserProfileByUsername(username: string) {
  const res = await fetch(`${API_URL}/search?api_key=${API_KEY}&q=${encodeURIComponent(username)}&limit=1`)
  const json = await res.json()
  const gif = json.data?.[0]
  return gif?.user || null
}



