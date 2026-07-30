import intArticles from './int-articles.json'
import { TALKS } from './talks'

// Fallback thumb if a fetch missed an image
import OH01 from '../assets/Oh_01.png'

const articles = intArticles.map((item, index) => ({
  ...item,
  id: index + 1,
  type: 'article',
  image: item.image || OH01,
}))

const talks = TALKS.map((item, index) => ({
  ...item,
  id: articles.length + index + 1,
  image: item.image || OH01,
}))

export const ITEMS = [...articles, ...talks]
