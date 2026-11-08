import type { Faq } from "./api"

const normalize = (value: string) => value.normalize("NFKC").toLowerCase().replace(/^\s*\d+[.)]\s*/, "").replace(/[^\p{L}\p{M}\p{N}]/gu, "")
const grams = (value: string) => new Set(Array.from({ length: Math.max(0, value.length - 2) }, (_, i) => value.slice(i, i + 3)))

// shortcut: lexical FAQ matching, use a server-side language model for open-ended conversations.
export function findFaqs(message: string, faqs: Faq[]): Faq[] {
  const query = normalize(message)
  if (query.length < 3) return []
  const exact = faqs.find(faq => normalize(faq.question) === query)
  if (exact) return [exact]
  const queryGrams = grams(query)
  return faqs.map(faq => {
    const question = normalize(faq.question)
    const questionGrams = grams(question)
    const overlap = [...queryGrams].filter(gram => questionGrams.has(gram)).length
    const coverage = overlap / queryGrams.size
    const score = question.includes(query) ? 1 : coverage >= 0.6 ? 2 * overlap / (queryGrams.size + questionGrams.size) : 0
    return { faq, score }
  }).filter(item => item.score >= 0.45).sort((a, b) => b.score - a.score).slice(0, 3).map(item => item.faq)
}
