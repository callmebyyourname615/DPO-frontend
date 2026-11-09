const endpoint = `${(import.meta.env.VITE_DPO_API_BASE_URL || '').replace(/\/$/, '')}/api/analytics/visitors`
const SESSION_MS = 30 * 60 * 1000
let memoryVisitor: string = crypto.randomUUID()
let memorySession: { id: string; lastActivity: number; referrer: string } | null = null
let previousNavigation = ''
let previousTime = 0

function identity(now: number) {
  let visitorId = memoryVisitor
  try {
    const storedVisitor = localStorage.getItem('dpo-analytics-visitor')
    visitorId = storedVisitor && /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(storedVisitor) ? storedVisitor : memoryVisitor
    localStorage.setItem('dpo-analytics-visitor', visitorId)
    memoryVisitor = visitorId
    const stored = JSON.parse(localStorage.getItem('dpo-analytics-session') || 'null')
    if (stored && typeof stored.id === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(stored.id) && Number.isFinite(stored.lastActivity) && stored.lastActivity <= now && typeof stored.referrer === 'string') memorySession = stored
  } catch { /* In-memory tracking still works when storage is unavailable. */ }
  if (!memorySession || now - memorySession.lastActivity >= SESSION_MS || now < memorySession.lastActivity) {
    let referrer = document.referrer
    try {
      const url=new URL(referrer)
      referrer = url.origin === window.location.origin || !['http:','https:'].includes(url.protocol) ? '' : url.origin
    } catch { referrer = '' }
    memorySession = { id: crypto.randomUUID(), lastActivity: now, referrer }
  }
  memorySession.lastActivity = now
  try { memorySession.referrer = new URL(memorySession.referrer).origin } catch { memorySession.referrer = '' }
  try { localStorage.setItem('dpo-analytics-session', JSON.stringify(memorySession)) } catch { /* Storage can be disabled. */ }
  return { visitorId, sessionId: memorySession.id, referrer: memorySession.referrer }
}

export function recordPageView(path: string, navigation = '') {
  const now = Date.now()
  const key = `${path}${navigation}`
  // React effects can run twice for one navigation in development.
  if (previousNavigation === key && now - previousTime < 1000) return
  previousNavigation = key
  previousTime = now
  const title = document.querySelector('#main-content h1')?.textContent?.trim() || (path === '/' ? 'ໜ້າທຳອິດ' : path.replace(/^\/|\/$/g,''))
  const payload = { id: crypto.randomUUID(), ...identity(now), path: path.split(/[?#]/)[0].slice(0,500), title: title.replace(/[\x00-\x1f\x7f]/g,' ').slice(0,200) }
  const send = () => fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), keepalive: true })
  // A retry reuses the event ID, so a lost response cannot double-count a visit.
  void send().then(response => { if (response.status >= 500) setTimeout(() => { void send().catch(()=>undefined) },1500) }).catch(()=>{ setTimeout(()=>{ void send().catch(()=>undefined) },1500) })
}

export function keepVisitorSessionActive() {
  let lastTouch = 0
  const touch = () => {
    const now = Date.now()
    if (now - lastTouch < 30000) return
    lastTouch = now
    identity(now)
  }
  window.addEventListener('pointerdown',touch,{passive:true})
  window.addEventListener('keydown',touch)
  return () => { window.removeEventListener('pointerdown',touch); window.removeEventListener('keydown',touch) }
}
