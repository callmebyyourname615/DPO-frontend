import { useEffect, useState } from "react"

const origin = (import.meta.env.VITE_DPO_API_BASE_URL || "").replace(/\/$/, "")
export const mediaUrl = (url?: string | null) => url?.startsWith("/api/") ? `${origin}${url}` : url || ""
export async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${origin}/api${path}`, init)
  if (!response.ok) throw new Error(response.status === 404 ? "ບໍ່ພົບຂໍ້ມູນ" : `ບໍ່ສາມາດໂຫຼດຂໍ້ມູນ (${response.status})`)
  return response.json() as Promise<T>
}
export function useApi<T>(path: string | null) {
  const [state, setState] = useState<{ data: T | null; loading: boolean; error: string }>({ data: null, loading: !!path, error: "" })
  useEffect(() => {
    if (!path) { setState({ data: null, loading: false, error: "" }); return }
    const controller = new AbortController()
    setState({ data: null, loading: true, error: "" })
    request<T>(path, { signal: controller.signal }).then(data => setState({ data, loading: false, error: "" })).catch(error => { if (!controller.signal.aborted) setState({ data: null, loading: false, error: error instanceof Error ? error.message : "ບໍ່ສາມາດເຊື່ອມຕໍ່ API" }) })
    return () => controller.abort()
  }, [path])
  return state
}
export type List<T> = { data: T[]; page: number; totalPages: number; total: number }
export type News = { id: string; slug: string; title: string; excerpt?: string; content?: string; coverImageUrl?: string | null; gallery?: string[]; publishedAt?: string | null; related?: News[] }
export type Document = { id: string; title: string; fileUrl: string | null; fileType: string; fileSize: number | null; documentDate: string | null }
export type Faq = { id: string; question: string; answer: string }
export type Partner = { id: string; name: string; logoUrl: string | null; url: string; address: string; phone: string; email: string }
export type Page = { title: string; slug: string; content: string; imageUrl: string | null }
export type Settings = { email: string; phone: string; address: string; facebookUrl: string; youtubeUrl: string; mapEmbedUrl: string; footerAudioUrl: string | null; footerAudioUrl2: string | null }
export type Home = { banners: { id: string; title: string; imageUrl: string | null; linkUrl: string | null }[]; intro: { title: string; content: string; imageUrl: string | null } }
export function date(value?: string | null) { return value ? new Intl.DateTimeFormat("lo-LA", { day: "numeric", month: "short", year: "numeric" }).format(new Date(value)) : "" }

export type VisitorStats = { date: string; today: number; yesterday: number; week: number; month: number; total: number }
let visitRequest: { day: string; promise: Promise<VisitorStats> } | null = null
export function trackVisit(): Promise<VisitorStats> {
  const day = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Vientiane", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date())
  if (visitRequest?.day === day) return visitRequest.promise
  const key = `dpo-visit-${day}`
  let recorded = false
  try { recorded = sessionStorage.getItem(key) === "1" } catch { /* Storage can be disabled. */ }
  const promise = request<VisitorStats>("/visitors", recorded ? undefined : { method: "POST" }).then(stats => {
    if (!recorded) { try { sessionStorage.setItem(key, "1") } catch { /* The in-memory request still prevents duplicates in this page. */ } }
    return stats
  }).catch(error => { visitRequest = null; throw error })
  visitRequest = { day, promise }
  return promise
}

export type ChatSource = { id: string; title: string; url: string; excerpt: string }
export type ChatReply = { answer: string; mode: "ai" | "search"; sources: ChatSource[] }
