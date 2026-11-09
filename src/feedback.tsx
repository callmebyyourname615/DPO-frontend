import { useRef, type ReactNode } from "react"
import { gsap } from "gsap"
import { useGSAP } from "@gsap/react"

gsap.registerPlugin(useGSAP)

function Shimmer({ children, className = "" }: { children: ReactNode; className?: string }) {
  const root = useRef<HTMLDivElement>(null)
  const shine = useRef<HTMLSpanElement>(null)
  useGSAP(() => {
    const media = gsap.matchMedia()
    media.add("(prefers-reduced-motion: no-preference)", () => {
      const element = root.current
      if (!element) return
      const tween = gsap.fromTo(shine.current, { xPercent: 0, willChange: "transform" }, { xPercent: 350, duration: 1.5, repeat: -1, repeatDelay: 0.25, ease: "none" })
      let visible = false
      const update = () => { tween.paused(!visible || document.hidden) }
      const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; update() })
      observer.observe(element)
      document.addEventListener("visibilitychange", update)
      update()
      return () => { observer.disconnect(); document.removeEventListener("visibilitychange", update) }
    })
    return () => media.revert()
  }, { scope: root })
  return <div ref={root} className={`motion-shimmer ${className}`}>{children}<span ref={shine} className="motion-shimmer-sheen" aria-hidden="true" /></div>
}

export function LoadingSkeleton({ label }: { label: string }) {
  return <div className="loading-skeleton" role="status" aria-busy="true"><span className="sr-only">{label}</span><Shimmer><div className="skeleton-art" aria-hidden="true" /><div className="skeleton-lines" aria-hidden="true"><span /><span /><span /></div></Shimmer></div>
}

export function ChatThinking({ label }: { label: string }) {
  const root = useRef<HTMLDivElement>(null)
  useGSAP(() => {
    const media = gsap.matchMedia()
    media.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.fromTo(".thinking-dot", { y: 0, opacity: 0.35 }, { y: -3, opacity: 1, duration: 0.45, stagger: 0.12, repeat: -1, yoyo: true, ease: "power1.inOut" })
    }, root)
    return () => media.revert()
  }, { scope: root })
  return <div ref={root} className="dpo-chat-thinking" role="status"><span className="sr-only">{label}</span><Shimmer><div className="thinking-content" aria-hidden="true"><span className="thinking-dots"><i className="thinking-dot" /><i className="thinking-dot" /><i className="thinking-dot" /></span><span>{label}</span></div></Shimmer></div>
}

export function TypedAnswer({ text, language, onProgress }: { text: string; language?: string; onProgress: () => void }) {
  const root = useRef<HTMLParagraphElement>(null)
  const visible = useRef<HTMLSpanElement>(null)
  useGSAP(() => {
    const media = gsap.matchMedia()
    media.add({ motion: "(prefers-reduced-motion: no-preference)", reduced: "(prefers-reduced-motion: reduce)" }, context => {
      const element = visible.current
      if (!element) return
      if (context.conditions?.reduced) { element.textContent = text; onProgress(); return }
      const segments = [...new Intl.Segmenter(language, { granularity: "grapheme" }).segment(text)].map(part => part.segment)
      const count = { value: 0 }
      let rendered = -1
      const render = () => {
        const length = Math.floor(count.value)
        if (length === rendered) return
        rendered = length
        element.textContent = segments.slice(0, length).join("")
        onProgress()
      }
      render()
      gsap.to(count, { value: segments.length, duration: Math.min(2.4, Math.max(0.35, segments.length / 100)), ease: "none", onUpdate: render, onComplete: () => { element.textContent = text; onProgress() } })
    })
    return () => media.revert()
  }, { scope: root, dependencies: [text, language], revertOnUpdate: true })
  return <p ref={root} className="api-prose typed-answer" lang={language}><span ref={visible} aria-hidden="true">{text}</span><span className="sr-only">{text}</span></p>
}
