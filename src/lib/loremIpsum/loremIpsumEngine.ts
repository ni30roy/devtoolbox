/**
 * Classic Lorem Ipsum placeholder text generation. Purely cosmetic
 * filler text, not security-sensitive in any way, so Math.random() is
 * the right tool here (unlike the Password Generator or UUID Generator,
 * which need a cryptographically secure source).
 */

export type LoremMode = 'words' | 'sentences' | 'paragraphs'

export const MIN_COUNT = 1
export const MAX_COUNT = 100

const WORDS = [
  'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit', 'sed', 'do',
  'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore', 'magna', 'aliqua', 'enim',
  'ad', 'minim', 'veniam', 'quis', 'nostrud', 'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip',
  'ex', 'ea', 'commodo', 'consequat', 'duis', 'aute', 'irure', 'in', 'reprehenderit', 'voluptate',
  'velit', 'esse', 'cillum', 'fugiat', 'nulla', 'pariatur', 'excepteur', 'sint', 'occaecat', 'cupidatat',
  'non', 'proident', 'sunt', 'culpa', 'qui', 'officia', 'deserunt', 'mollit', 'anim', 'id',
  'est', 'laborum', 'at', 'vero', 'accusamus', 'iusto', 'odio', 'dignissimos', 'ducimus', 'blanditiis',
]

const CLASSIC_OPENING = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'
const CLASSIC_WORDS = ['lorem', 'ipsum', 'dolor', 'sit', 'amet']

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function pickWord(): string {
  return WORDS[randomInt(0, WORDS.length - 1)]
}

function capitalize(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1)
}

function generateSentence(): string {
  const wordCount = randomInt(4, 12)
  const words = Array.from({ length: wordCount }, pickWord)
  if (wordCount > 6 && Math.random() < 0.5) {
    const commaPos = randomInt(2, wordCount - 3)
    words[commaPos] += ','
  }
  words[0] = capitalize(words[0])
  return words.join(' ') + '.'
}

function generateParagraph(): string {
  const sentenceCount = randomInt(3, 7)
  return Array.from({ length: sentenceCount }, generateSentence).join(' ')
}

function generateWords(count: number, startWithLorem: boolean): string {
  const words: string[] = []
  if (startWithLorem) words.push(...CLASSIC_WORDS.slice(0, count))
  while (words.length < count) words.push(pickWord())
  return words.slice(0, count).join(' ')
}

function generateSentences(count: number, startWithLorem: boolean): string {
  const sentences: string[] = []
  if (startWithLorem && count > 0) sentences.push(CLASSIC_OPENING)
  while (sentences.length < count) sentences.push(generateSentence())
  return sentences.slice(0, count).join(' ')
}

function generateParagraphs(count: number, startWithLorem: boolean): string {
  const paragraphs: string[] = []
  for (let i = 0; i < count; i++) {
    if (i === 0 && startWithLorem) {
      const sentenceCount = randomInt(3, 7)
      const rest = Array.from({ length: sentenceCount - 1 }, generateSentence)
      paragraphs.push([CLASSIC_OPENING, ...rest].join(' '))
    } else {
      paragraphs.push(generateParagraph())
    }
  }
  return paragraphs.join('\n\n')
}

export function generateLoremIpsum(mode: LoremMode, count: number, startWithLorem: boolean): string {
  const clamped = Math.min(Math.max(Math.trunc(count) || MIN_COUNT, MIN_COUNT), MAX_COUNT)
  switch (mode) {
    case 'words':
      return generateWords(clamped, startWithLorem)
    case 'sentences':
      return generateSentences(clamped, startWithLorem)
    case 'paragraphs':
      return generateParagraphs(clamped, startWithLorem)
  }
}
