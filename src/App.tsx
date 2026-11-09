import {
  FormEvent,
  KeyboardEvent,
  ReactNode,
  useEffect,
  useId,
  useRef,
  useState,
} from "react"
import { gsap } from "gsap"
import { ScrollToPlugin } from "gsap/ScrollToPlugin"
import { useGSAP } from "@gsap/react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faBars,
  faHouse,
  faPhoneVolume,
  faCloudArrowDown,
  faExpand,
  faCircleQuestion,
  faMagnifyingGlass,
  faLanguage,
  faArrowRight,
  faChevronLeft,
  faChevronRight,
  faChevronDown,
  faAnglesRight,
  faPause,
  faPlay,
  faEnvelope,
  faLocationDot,
  faPenToSquare,
  faXmark,
  faPaperPlane,
} from "@fortawesome/free-solid-svg-icons"
import { faFacebookF, faYoutube } from "@fortawesome/free-brands-svg-icons"
import { request, useApi, mediaUrl, date, trackVisit, type ChatReply, type ChatSource, type ChatSuggestion, type VisitorStats, type List, type News, type Document, type Faq, type Partner, type Page, type Settings, type Home } from "./api"
import { chatCopy, useLocale } from "./locale"
import { ChatThinking, LoadingSkeleton, TypedAnswer } from "./feedback"
import { chatLanguage } from "./chat"
import { recordPageView, keepVisitorSessionActive } from "./analytics"

gsap.registerPlugin(useGSAP, ScrollToPlugin)

const paths = {
  duties: "/ພາລະບົດບາດ-ແລະ-ໜ້າທີ່/",
  history: "/ປະຫວັດຄວາມເປັນມາ/",
  party: "/ໂຄງຮ່າງການຈັດຕັ້ງ-ສາຍພັ/",
  decrees: "/ດຳລັດ/",
  decisions: "/ຂໍ້ຕົກລົງ/",
  notices: "/ແຈ້ງການ/",
  forms: "/ແບບພິມ/",
  guidance: "/ບົດແນະນໍາ-ແລະ-ຄໍາແນະນໍາ/",
  bilateral: "/ການຮ່ວມມືສອງຝ່າຍ/",
  international: "/ການເຄື່ອນໄຫວວຽກງານຮ່ວມ/",
  news: "/ຂ່າວສານ/",
  contact: "/ຕິດຕໍ່/",
  faq: "/ຄຳຖາມທີ່ພົບເລື່ອຍ/",
  connections: "/ເຊື່ອມຕໍ່/",
  information: "/ຂໍ້ມູນ/",
}

type Slot = {
  id: string
  label: string
  width: number
  height: number
  mobileWidth?: number
  mobileHeight?: number
  className?: string
}

type MediaAsset = {
  kind: string
  src: string
  alt: string
  fit?: string
  natural?: boolean
}
const homeAssets: Record<string, MediaAsset | undefined> = {
  "shared.brand-logo": { kind: "image", src: mediaUrl("/api/assets/dpo/22844fe243f16f4e.png"), alt: "DPO" },
  "shared.flag-la": { kind: "image", src: mediaUrl("/api/assets/dpo/2645823a0e1ba640.png"), alt: "LA" },
  "shared.flag-en": { kind: "image", src: mediaUrl("/api/assets/dpo/d5c7675bf1b02712.png"), alt: "EN" },
}

function AssetPlaceholder({
  id,
  label,
  width,
  height,
  mobileWidth = width,
  mobileHeight = height,
  className = "",
}: Slot) {
  const asset = /^(home|shared|footer|bilateral|organization\.(board|party|state))\./.test(id) || /^institutional\.(duties|history)\./.test(id)
    ? homeAssets[id]
    : undefined
  if (!asset) return null
  return <div className={`asset-placeholder asset-loaded ${className}`} style={{ "--slot-w": `${width}px`, "--slot-ratio": `${width} / ${height}`, "--mobile-w": `${mobileWidth}px`, "--mobile-ratio": `${mobileWidth} / ${mobileHeight}` } as React.CSSProperties}><img src={asset.src} alt={asset.alt || label} width={width} height={height} style={{ objectFit: asset.fit === "cover" ? "cover" : "contain" }} /></div>
}

function navigate(path: string) {
  if (new URL(path, window.location.href).href === window.location.href) return
  window.history.pushState({}, "", path)
  window.dispatchEvent(new Event("dpo:navigate"))
}

function Link({
  to,
  children,
  className = "",
  onClick,
}: {
  to: string
  children: ReactNode
  className?: string
  onClick?: () => void
}) {
  return (
    <a
      href={to}
      className={className}
      onClick={(event) => {
        if (
          !event.defaultPrevented &&
          to.startsWith("/") && !to.startsWith("//") && !to.startsWith("/api/") && !to.startsWith("/assets/") &&
          event.button === 0 &&
          !event.metaKey &&
          !event.ctrlKey &&
          !event.shiftKey
        ) {
          event.preventDefault()
          navigate(to)
          onClick?.()
        }
      }}
    >
      {children}
    </a>
  )
}

type MenuItem = { label: string; to?: string; children?: MenuItem[] }

const menu: MenuItem[] = [
  { label: "ໜ້າຫຼັກ", to: "/" },
  {
    label: "ກ່ຽວກັບ ສປງ",
    children: [
      { label: "ພາລະບົດບາດ ແລະ ໜ້າທີ່", to: paths.duties },
      { label: "ປະຫວັດຄວາມເປັນມາ", to: paths.history },
      { label: "ໂຄງຮ່າງການຈັດຕັ້ງ", children: [
        { label: "ໂຄງຮ່າງການຈັດຕັ້ງ ສະພາບໍລິຫານ", to: "/dpo_bod/" },
        { label: "ໂຄງຮ່າງການຈັດຕັ້ງ ສາຍພັກ ແລະ ອົງການຈັດຕັ້ງມະຫາຊົນ", to: paths.party },
        { label: "ໂຄງຮ່າງການຈັດຕັ້ງ ສາຍລັດ", to: "/dpo-organization-chart/" },
      ] },
    ],
  },
  {
    label: "ນິຕິກຳ",
    children: [
      { label: "ດຳລັດ", to: paths.decrees },
      { label: "ຂໍ້ຕົກລົງ", to: paths.decisions },
      { label: "ແຈ້ງການ", to: paths.notices },
      { label: "ແບບພິມ", to: paths.forms },
      { label: "ບົດແນະນໍາ ແລະ ຄໍາແນະນໍາ", to: paths.guidance },
    ],
  },
  {
    label: "ຮ່ວມມືສາກົນ",
    children: [
      { label: "ການຮ່ວມມືສອງຝ່າຍ", to: paths.bilateral },
      { label: "ການເຄື່ອນໄຫວວຽກງານຮ່ວມມືສາກົນ", to: paths.international },
      { label: "FSNP", to: "/fsnp/" },
    ],
  },
  { label: "ຂ່າວສານ", to: paths.news },
  {
    label: "ຕິດຕໍ່",
    to: paths.contact,
    children: [{ label: "ຄຳຖາມທີ່ພົບເລື້ອຍ", to: paths.faq }],
  },
]

function SearchBox({ compact = false }: { compact?: boolean }) {
  const [query, setQuery] = useState("")
  const submit = (event: FormEvent) => {
    event.preventDefault()
    navigate(`/search/?q=${encodeURIComponent(query)}`)
  }
  return (
    <form
      className={`search-box ${compact ? "compact" : ""}`}
      onSubmit={submit}
    >
      <label
        className="sr-only"
        htmlFor={compact ? "header-search" : "page-search"}
      >
        ຄົ້ນຫາ
      </label>
      <input
        id={compact ? "header-search" : "page-search"}
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="ຄົ້ນຫາ..."
      />
      <button type="submit" aria-label="ຄົ້ນຫາ">
        ຄົ້ນຫາ
      </button>
    </form>
  )
}

function Header({ path }: { path: string }) {
  const { locale, setLocale, t } = useLocale()
  const [languageOpen, setLanguageOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [stickyVisible, setStickyVisible] = useState(false)
  const [stickyMenuOpen, setStickyMenuOpen] = useState(false)
  const headerRef = useRef<HTMLElement>(null)
  const stickyRef = useRef<HTMLDivElement>(null)
  const stickyMenuRef = useRef<HTMLDivElement>(null)
  const { contextSafe } = useGSAP({ scope: headerRef })
  useGSAP(() => {
    gsap.to(stickyMenuRef.current, {
      height: stickyMenuOpen ? "auto" : 0,
      opacity: stickyMenuOpen ? 1 : 0,
      duration: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 0.35,
      ease: "power2.inOut",
      overwrite: "auto",
    })
  }, { scope: headerRef, dependencies: [stickyMenuOpen] })
  const rotateArrow = contextSafe((details: HTMLDetailsElement) => {
    gsap.to(details.querySelector(".menu-chevron"), {
      rotation: details.open ? 180 : 0,
      duration: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 0.2,
      ease: "power2.out", overwrite: "auto",
    })
  })
  useEffect(() => {
    if (!stickyMenuOpen) return
    const closeOutside = (event: Event) => {
      if (event.target instanceof Node && !stickyRef.current?.contains(event.target)) setStickyMenuOpen(false)
    }
    document.addEventListener("pointerdown", closeOutside, true)
    document.addEventListener("focusin", closeOutside)
    return () => {
      document.removeEventListener("pointerdown", closeOutside, true)
      document.removeEventListener("focusin", closeOutside)
    }
  }, [stickyMenuOpen])
  useEffect(() => {
    let frame = 0
    const update = () => {
      frame = 0
      const past = (headerRef.current?.getBoundingClientRect().bottom ?? 1) <= 0
      setStickyVisible(past)
      if (!past) setStickyMenuOpen(false)
    }
    const schedule = () => { if (!frame) frame = window.requestAnimationFrame(update) }
    window.addEventListener("scroll", schedule, { passive: true })
    window.addEventListener("resize", schedule)
    update()
    return () => {
      window.removeEventListener("scroll", schedule)
      window.removeEventListener("resize", schedule)
      window.cancelAnimationFrame(frame)
    }
  }, [path, mobileOpen])
  useGSAP(() => {
    const bar = stickyRef.current
    if (!bar) return
    if (stickyVisible) {
      gsap.fromTo(bar, { yPercent: -100, autoAlpha: 0 }, {
        yPercent: 0, autoAlpha: 1,
        duration: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 0.35,
        ease: "power2.out", overwrite: "auto",
      })
    } else gsap.set(bar, { yPercent: -100, autoAlpha: 0 })
  }, { scope: headerRef, dependencies: [stickyVisible], revertOnUpdate: true })
  const [expanded, setExpanded] = useState<string[]>([])
  useEffect(() => {
    setMobileOpen(false)
    setStickyMenuOpen(false)
  }, [path])
  useEffect(() => {
    const close = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileOpen(false)
        setStickyMenuOpen(false)
      }
    }
    window.addEventListener("keydown", close)
    return () => window.removeEventListener("keydown", close)
  }, [])
  const toggle = (label: string) =>
    setExpanded((items) =>
      items.includes(label)
        ? items.filter((item) => item !== label)
        : [...items, label],
    )
  return (
    <header ref={headerRef}>
      <div className="masthead container">
        <Link to="/" className="brand-link">
          <AssetPlaceholder
            id="shared.brand-logo"
            label="Brand logo"
            width={615}
            height={150}
            mobileWidth={205}
            mobileHeight={50}
          />
        </Link>
        <button type="button" className="mobile-language" aria-label={locale === "lo" ? "Switch to English" : "ປ່ຽນເປັນພາສາລາວ"} onClick={() => setLocale(locale === "lo" ? "en" : "lo")}>
          <FontAwesomeIcon icon={faLanguage} />
        </button>
        <button
          className="menu-trigger"
          aria-expanded={mobileOpen}
          aria-controls="mobile-menu"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          <FontAwesomeIcon icon={faBars} />
          <span className="sr-only">ເມນູ</span>
        </button>
      </div>
      <nav className="main-nav" lang={locale} aria-label={locale === "en" ? "Main navigation" : "ເມນູຫຼັກ"}>
        <div className="container nav-inner">
          <details className="nav-search">
            <summary aria-label="ຄົ້ນຫາ">
              <FontAwesomeIcon icon={faMagnifyingGlass} />
            </summary>
            <SearchBox compact />
          </details>
          {menu.map((item) => (
            <div className="nav-item" key={item.label}>
              {item.to ? (
                <Link to={item.to} className={path === item.to || item.children?.some((child) => child.to === path || child.children?.some((sub) => sub.to === path)) ? "active" : ""}>
                  {t(item.label)}
                  {item.children && <span aria-hidden="true">⌄</span>}
                </Link>
              ) : (
                <button type="button" className={item.children?.some((child) => child.to === path || child.children?.some((sub) => sub.to === path)) ? "active" : ""}>
                  {t(item.label)} <span aria-hidden="true">⌄</span>
                </button>
              )}
              {item.children && (
                <div className="dropdown">
                  {item.children.map((child) => (
                    child.children ? (
                      <div className={`nested-dropdown ${child.children.some((sub) => sub.to === path) ? "current" : ""}`} key={child.label} tabIndex={0}>
                        <div className="nested-dropdown-trigger">{t(child.label)}<FontAwesomeIcon icon={faChevronRight} aria-hidden="true" /></div>
                        <div className="nested-dropdown-panel">{child.children.map((sub) => <Link to={sub.to!} key={sub.to} className={sub.to === path ? "current" : ""}>{t(sub.label)}</Link>)}</div>
                      </div>
                    ) : <Link to={child.to!} key={child.to} className={child.to === path ? "current" : ""}>{t(child.label)}</Link>
                  ))}
                </div>
              )}
            </div>
          ))}
          <div className="header-tools">
            <div className="utility-links">
              <Link to={paths.information}>{t("ຂໍ້ມູນ")}</Link>
              <Link to={paths.connections}>{t("ເຊື່ອມຕໍ່")}</Link>
            </div>
            <div className="language-select" onKeyDown={event => { if (event.key === "Escape") setLanguageOpen(false) }} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setLanguageOpen(false) }}>
              <button type="button" className="language-trigger" aria-label={locale === "lo" ? "ເລືອກພາສາ" : "Choose language"} aria-expanded={languageOpen} aria-controls="language-options" onClick={() => setLanguageOpen(!languageOpen)}>
                <AssetPlaceholder
                  id={locale === "lo" ? "shared.flag-la" : "shared.flag-en"}
                  label={locale.toUpperCase()}
                  width={18}
                  height={12}
                />{" "}
                {locale === "lo" ? "LA" : "EN"} ⌄
              </button>
              <button id="language-options" type="button" className="language" hidden={!languageOpen} onClick={() => { setLocale(locale === "lo" ? "en" : "lo"); setLanguageOpen(false) }}>
                <AssetPlaceholder
                  id={locale === "lo" ? "shared.flag-en" : "shared.flag-la"}
                  label={locale === "lo" ? "EN" : "LA"}
                  width={18}
                  height={12}
                />{" "}
                {locale === "lo" ? "EN" : "LA"}
              </button>
            </div>
          </div>
        </div>
      </nav>
      <nav
        id="mobile-menu"
        className={`mobile-menu ${mobileOpen ? "open" : ""}`}
        lang={locale}
        aria-label={locale === "en" ? "Mobile navigation" : "ເມນູມືຖື"}
      >
        {menu.map((item) => (
          <div className="mobile-nav-item" key={item.label}>
            <div>
              {item.to ? (
                <Link to={item.to}>{t(item.label)}</Link>
              ) : (
                <span>{t(item.label)}</span>
              )}
              {item.children && (
                <button
                  aria-expanded={expanded.includes(item.label)}
                  onClick={() => toggle(item.label)}
                  aria-label={`ເປີດ ${t(item.label)}`}
                >
                  {expanded.includes(item.label) ? "−" : "+"}
                </button>
              )}
            </div>
            {item.children && expanded.includes(item.label) && (
              <div className="mobile-submenu">
                {item.children.map((child) => (
                  child.children ? (
                    <details className="mobile-nested" key={child.label}>
                      <summary>{t(child.label)}<FontAwesomeIcon icon={faChevronDown} aria-hidden="true" /></summary>
                      <div className="mobile-submenu">{child.children.map((sub) => <Link to={sub.to!} key={sub.to}>{t(sub.label)}</Link>)}</div>
                    </details>
                  ) : <Link to={child.to!} key={child.to}>{t(child.label)}</Link>
                ))}
              </div>
            )}
          </div>
        ))}
        <div className="mobile-utilities">
          <Link to={paths.connections}>{t("ເຊື່ອມຕໍ່")}</Link>
          <Link to={paths.information}>{t("ຂໍ້ມູນ")}</Link>
        </div>
      </nav>
      <div
        ref={stickyRef}
        className="sticky-header"
        aria-hidden={!stickyVisible}
        inert={!stickyVisible}
      >
        <div className="container sticky-inner">
          <Link to="/" className="sticky-brand">
            <AssetPlaceholder
              id="shared.brand-logo"
              label="DPO"
              width={350}
              height={85}
              mobileWidth={180}
              mobileHeight={44}
            />
          </Link>
          <button
            className="sticky-menu-toggle"
            aria-expanded={stickyMenuOpen}
            aria-controls="sticky-menu"
            aria-label="ເມນູ"
            onClick={() => setStickyMenuOpen(!stickyMenuOpen)}
          >
            <FontAwesomeIcon icon={faBars} />
          </button>
        </div>
        <div ref={stickyMenuRef} className="sticky-menu-panel" aria-hidden={!stickyMenuOpen} inert={!stickyMenuOpen}>
          <nav
            id="sticky-menu"
            className="container sticky-menu"
            lang={locale}
            aria-label={locale === "en" ? "Main navigation" : "ເມນູຫຼັກ"}
          >
            {menu.map((item) => (
              <div key={item.label}>
                {item.children ? (
                  <details onToggle={(event) => rotateArrow(event.currentTarget)}>
                    <summary><span>{t(item.label)}</span><FontAwesomeIcon icon={faChevronDown} className="menu-chevron" /></summary>
                    <div className="sticky-submenu">
                      {item.children.map((child) => (
                        child.children ? <details className="sticky-nested" key={child.label} onToggle={(event) => rotateArrow(event.currentTarget)}>
                          <summary><span>{t(child.label)}</span><FontAwesomeIcon icon={faChevronDown} className="menu-chevron" /></summary>
                          <div className="sticky-submenu">{child.children.map((sub) => <Link key={sub.to} to={sub.to!}><span className="menu-guide" aria-hidden="true" />{t(sub.label)}</Link>)}</div>
                        </details> : <Link key={child.to} to={child.to!}><span className="menu-guide" aria-hidden="true" />{t(child.label)}</Link>
                      ))}
                    </div>
                  </details>
                ) : (
                  <Link to={item.to!}>{t(item.label)}</Link>
                )}
              </div>
            ))}
          </nav>
        </div>
      </div>
    </header>
  )
}


function PageTitle({ title }: { title: string }) {
  const { locale, t } = useLocale()
  return <nav className="title-band" aria-label="Breadcrumb"><div className="container breadcrumb-content"><Link to="/" aria-label={t("ໜ້າຫຼັກ")}><FontAwesomeIcon icon={faHouse} aria-hidden="true" /></Link><FontAwesomeIcon className="breadcrumb-separator" icon={faAnglesRight} aria-hidden="true" /><span lang={t(title) !== title ? locale : "lo"} aria-current="page">{t(title)}</span></div></nav>
}
function ApiState({ loading, error, empty }: { loading: boolean; error: string; empty?: boolean }) {
  const { locale } = useLocale()
  return loading ? <LoadingSkeleton label={locale === "en" ? "Loading content…" : "ກຳລັງໂຫຼດຂໍ້ມູນ..."} /> : error ? <p role="alert">{error} · ກະລຸນາລອງໃໝ່</p> : empty ? <p role="status">ບໍ່ພົບຂໍ້ມູນ</p> : null
}
function Footer() {
  const settings = useApi<Settings>("/site-settings")
  const news = useApi<List<News>>("/news?limit=5")
  const data = settings.data
  const [visitors, setVisitors] = useState<VisitorStats | null>(null)
  const [visitorError, setVisitorError] = useState(false)
  useEffect(() => { let active = true; trackVisit().then(stats => { if (active) setVisitors(stats) }).catch(() => { if (active) setVisitorError(true) }); return () => { active = false } }, [])
  return <footer><div className="footer-main"><div className="container footer-grid">
    <div><h3>ແຜນທີ່</h3>{data?.mapEmbedUrl && <iframe src={data.mapEmbedUrl} title="ແຜນທີ່" loading="lazy" className="api-footer-map" />}</div>
    <div><h3>ຂ່າວຫຼ້າສຸດ</h3><ul className="footer-links">{news.data?.data.map(item => <li key={item.id}><Link to={`/${item.slug}/`}>{item.title}</Link></li>)}</ul><ApiState loading={news.loading} error={news.error} /></div>
    <div><h3>ຕິດຕໍ່ພົວພັນໄດ້ທີ່</h3>{data && <div className="footer-contact"><p><FontAwesomeIcon icon={faEnvelope} aria-hidden="true" /><span>ອີເມວ: <a href={`mailto:${data.email}`}>{data.email}</a></span></p>{data.facebookUrl && <p><FontAwesomeIcon icon={faFacebookF} aria-hidden="true" /><a href={data.facebookUrl} target="_blank" rel="noreferrer">Facebook Page: ສໍານັກງານປົກປ້ອງເງິນຝາກ: ສປງ</a></p>}<p><FontAwesomeIcon icon={faPhoneVolume} aria-hidden="true" /><span>ເບີໂທ: <a href={`tel:${data.phone}`}>{data.phone}</a></span></p><p><FontAwesomeIcon icon={faLocationDot} aria-hidden="true" /><span>ທີ່ຢູ່: {data.address}</span></p>{data.youtubeUrl && <p><FontAwesomeIcon icon={faYoutube} aria-hidden="true" /><a href={data.youtubeUrl} target="_blank" rel="noreferrer">YouTube</a></p>}</div>}<ApiState loading={settings.loading} error={settings.error} /></div>
    <div><h3>ຈຳນວນຜູ້ເຂົ້າຊົມ</h3><dl className="stats-list">{([['ຈຳນວນມື້ນີ້', 'today'], ['ຈຳນວນມື້ວານນີ້', 'yesterday'], ['ຈຳນວນອາທິດນີ້', 'week'], ['ຈຳນວນເດືອນນີ້', 'month'], ['ຈຳນວນທັງໝົດ', 'total']] as const).map(([label, key]) => <div key={key}><dt>{label}:</dt><dd>{visitors ? visitors[key].toLocaleString("lo-LA") : "—"}</dd></div>)}</dl>{visitorError && <p role="status">ບໍ່ສາມາດໂຫຼດສະຖິຕິໄດ້</p>}{data?.footerAudioUrl && <><audio controls preload="none" src={mediaUrl(data.footerAudioUrl)} aria-label="ສະປອດໂຄສະນາ ປົກປ້ອງເງິນຝາກ 2024" /><p className="audio-caption">ສະປອດໂຄສະນາ ປົກປ້ອງເງິນຝາກ 2024</p></>}{data?.footerAudioUrl2 && <><audio controls preload="none" src={mediaUrl(data.footerAudioUrl2)} aria-label="ສະປອດໂຄສະນາ ປົກປ້ອງເງິນຝາກ ພາສາຊົນເຜົ່າ" /><p className="audio-caption">ສະປອດໂຄສະນາ ປົກປ້ອງເງິນຝາກ ພາສາຊົນເຜົ່າ</p></>}</div>
  </div></div><div className="copyright"><div className="container"><span>© {new Date().getFullYear()} ສໍານັກງານປົກປ້ອງເງິນຝາກ</span><button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>ກັບຂຶ້ນເທິງ ↑</button></div></div></footer>
}
function NewsCard({ item }: { item: News }) {
  return <article className="news-card"><Link to={`/${item.slug}/`}>{item.coverImageUrl && <img className="api-news-image" src={mediaUrl(item.coverImageUrl)} alt="" loading="lazy" />}</Link><div><h3><Link to={`/${item.slug}/`}>{item.title}</Link></h3><time>{date(item.publishedAt)}</time></div></article>
}
function CountUp({ value }: { value: string }) {
  const numberRef = useRef<HTMLSpanElement>(null)
  const match = value.match(/^(\s*)(\d[\d,]*(?:\.\d+)?)(.*)$/)
  useGSAP((_, contextSafe) => {
    const element = numberRef.current
    if (!element || !match || !contextSafe || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const raw = match[2].replace(/,/g, "")
    const target = Number(raw)
    const decimals = raw.split(".")[1]?.length ?? 0
    const counter = { value: 0 }
    element.textContent = "0"
    const start = contextSafe(() => {
      gsap.to(counter, { value: target, duration: 2, ease: "power2.out", onUpdate: () => {
        element.textContent = counter.value.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals, useGrouping: match[2].includes(",") })
      } })
    })
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) { observer.disconnect(); start() }
    }, { threshold: 0.25 })
    observer.observe(element)
    return () => observer.disconnect()
  }, { dependencies: [value], revertOnUpdate: true })
  if (!match) return <>{value}</>
  return <span aria-label={value}>{match[1]}<span ref={numberRef} aria-hidden="true">{match[2]}</span>{match[3]}</span>
}
function HomePage() {
  const home = useApi<Home>("/home")
  const news = useApi<List<News>>("/news?limit=10")
  const protection = useApi<Page>("/pages/home-protection")
  const members = useApi<Page>("/pages/home-members")
  const [slide, setSlide] = useState(0)
  const newsTrack = useRef<HTMLDivElement>(null)
  const [paused, setPaused] = useState(false)
  const banners = home.data?.banners ?? []
  useEffect(() => { if (paused || banners.length < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return; const timer = window.setInterval(() => setSlide(current => (current + 1) % banners.length), 8000); return () => window.clearInterval(timer) }, [paused, banners.length])
  const banner = banners[slide % (banners.length || 1)]
  return <div className="home-page">
    {banner && <section className="hero" aria-label="ປ້າຍໜ້າຫຼັກ" onFocusCapture={() => setPaused(true)}>{banners.map((item, index) => <div key={item.id} className={`hero-slide ${index === slide % banners.length ? "is-active" : ""}`} aria-hidden={index !== slide % banners.length} inert={index !== slide % banners.length}>{item.linkUrl ? <a href={item.linkUrl}><img className="api-hero-image" src={mediaUrl(item.imageUrl)} alt={item.title} /></a> : <img className="api-hero-image" src={mediaUrl(item.imageUrl)} alt={item.title} />}</div>)}{banners.length > 1 && <><button className="hero-arrow prev" onClick={() => setSlide((slide + banners.length - 1) % banners.length)} aria-label="ກ່ອນໜ້າ"><FontAwesomeIcon icon={faChevronLeft} /></button><button className="hero-arrow next" onClick={() => setSlide((slide + 1) % banners.length)} aria-label="ຕໍ່ໄປ"><FontAwesomeIcon icon={faChevronRight} /></button><button className="hero-playback" onClick={() => setPaused(!paused)} aria-label={paused ? "ເລີ່ມ" : "ຢຸດ"}><FontAwesomeIcon icon={paused ? faPlay : faPause} /></button></>}</section>}
    {(home.loading || home.error) && <section className="section container"><ApiState loading={home.loading} error={home.error} /></section>}
    <section className="section container home-news"><h1 className="latest-title">ຂ່າວຫຼ້າສຸດ</h1><div className="news-carousel"><button className="news-arrow prev" aria-label="ຂ່າວກ່ອນໜ້າ" onClick={() => newsTrack.current?.scrollBy({ left: -(newsTrack.current.clientWidth / 3), behavior: "smooth" })}>‹</button><div className="news-cards" ref={newsTrack}>{news.data?.data.map(item => <NewsCard key={item.id} item={item} />)}</div><button className="news-arrow next" aria-label="ຂ່າວຕໍ່ໄປ" onClick={() => newsTrack.current?.scrollBy({ left: newsTrack.current.clientWidth / 3, behavior: "smooth" })}>›</button></div><ApiState loading={news.loading} error={news.error} empty={news.data?.data.length === 0} /><p className="api-more"><Link to={paths.news} className="button primary">ຂ່າວທັງໝົດ →</Link></p></section>
    {home.data?.intro && (home.data.intro.title || home.data.intro.content || home.data.intro.imageUrl) && <section className="section intro-section"><div className="container split"><div><h2>{home.data.intro.title}</h2><p className="api-prose">{home.data.intro.content}</p><Link to={paths.history} className="button primary">ອ່ານເພີ່ມເຕີມ</Link></div>{home.data.intro.imageUrl && <img className="api-intro-image" src={mediaUrl(home.data.intro.imageUrl)} alt="" />}</div></section>}
    {protection.data && <section className="protection"><div className="container split"><div className="protection-copy"><h2>{protection.data.title}</h2><h4>Deposit Protection office of Lao PDR.</h4><div className="stat-grid">{protection.data.content.split("\n").filter(Boolean).map((line, index) => { const [value, label] = line.split("|"); return <div key={index}><strong><CountUp value={value} /></strong><span>{label}</span></div> })}</div></div>{protection.data.imageUrl && <img className="api-protection-poster" src={mediaUrl(protection.data.imageUrl)} alt="ຂໍ້ມູນການປົກປ້ອງເງິນຝາກ" loading="lazy" />}</div></section>}
    {members.data?.imageUrl && <section className="container home-members"><img className="api-members-image" src={mediaUrl(members.data.imageUrl)} alt={members.data.title} loading="lazy" /></section>}
  </div>
}
const documentCategories: Record<string, { category: string; title: string }> = {
  [paths.decrees]: { category: "decree", title: "ດຳລັດ" }, [paths.decisions]: { category: "agreement", title: "ຂໍ້ຕົກລົງ" }, [paths.notices]: { category: "notice", title: "ແຈ້ງການ" }, [paths.forms]: { category: "form", title: "ແບບພິມ" }, [paths.guidance]: { category: "guideline", title: "ບົດແນະນໍາ" }, "/fsnp/": { category: "fsnp", title: "FSNP" }, [paths.information]: { category: "general", title: "ຂໍ້ມູນ" },
}
function Pagination({ page, totalPages, setPage }: { page: number; totalPages: number; setPage: (n: number) => void }) {
  if (totalPages <= 1) return null
  return <nav className="api-pagination" aria-label="ປ່ຽນໜ້າ"><button disabled={page <= 1} onClick={() => setPage(page - 1)}>← ກ່ອນໜ້າ</button><span>{page} / {totalPages}</span><button disabled={page >= totalPages} onClick={() => setPage(page + 1)}>ຕໍ່ໄປ →</button></nav>
}
function DocumentsPage({ category, title }: { category: string; title: string }) {
  const [query, setQuery] = useState(""); const [term, setTerm] = useState(""); const [page, setPage] = useState(1)
  const params = new URLSearchParams({ category, page: String(page), limit: "12" }); if (term) params.set("q", term)
  const result = useApi<List<Document>>(`/documents?${params}`)
  if (["decree", "agreement", "notice", "form", "guideline", "fsnp", "general"].includes(category)) return <><PageTitle title={title} /><section className="section container decrees-page"><h1>{category === "fsnp" ? "Lao PDR Financial Sector Safety Net Strengthening" : category === "general" ? "ເອກະສານ ຂໍ້ມູນຕ່າງໆ" : `ເອກະສານໄຟລ໌ ${title}`}</h1>{category !== "fsnp" && <form className="decrees-search decree-search-form" onSubmit={event => { event.preventDefault(); setTerm(query.trim()); setPage(1) }}><FontAwesomeIcon icon={faMagnifyingGlass} aria-hidden="true" /><input type="search" aria-label="ຄົ້ນຫາເອກະສານ" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search files..." /><button type="submit">ຄົ້ນຫາ</button></form>}<div className="decrees-category">» {title}</div><div className="decrees-layout"><div className="decrees-tree" aria-hidden="true" /><div><div className="decrees-grid">{result.data?.data.map(file => <article className="decree-card" key={file.id}><img className="decree-icon" src={mediaUrl(file.fileType?.toLowerCase() === "xlsx" ? "/api/assets/dpo/excel.png" : "/api/assets/dpo/pdf.svg")} alt="" /><div className="decree-content"><h2>{file.title}</h2><dl>{file.fileSize != null && <div><dt>Size:</dt><dd>{(file.fileSize / 1048576).toFixed(2)} MB</dd></div>}{file.documentDate && <div><dt>Date:</dt><dd>{date(file.documentDate)}</dd></div>}</dl></div>{file.fileUrl && <div className="decree-actions"><a className="decree-download" href={mediaUrl(file.fileUrl)} target="_blank" rel="noreferrer">ດາວໂຫລດ <FontAwesomeIcon icon={faCloudArrowDown} aria-hidden="true" /></a>{file.fileType?.toLowerCase() !== "xlsx" && <a className="decree-preview" href={mediaUrl(file.fileUrl)} target="_blank" rel="noreferrer">ເປີດເບິ່ງ <FontAwesomeIcon icon={faExpand} aria-hidden="true" /></a>}</div>}</article>)}</div><ApiState loading={result.loading} error={result.error} empty={result.data?.data.length === 0} /><Pagination page={page} totalPages={result.data?.totalPages ?? 0} setPage={setPage} /></div></div></section></>
  return <><PageTitle title={title} /><section className="section container decrees-page"><h1>{title}</h1><form className="decrees-search" onSubmit={event => { event.preventDefault(); setTerm(query.trim()); setPage(1) }}><FontAwesomeIcon icon={faMagnifyingGlass} /><input aria-label="ຄົ້ນຫາເອກະສານ" value={query} onChange={event => setQuery(event.target.value)} placeholder="ຄົ້ນຫາເອກະສານ..." /><button type="submit">ຄົ້ນຫາ</button></form><div className="decrees-grid">{result.data?.data.map(file => <article className="decree-card" key={file.id}><img className="decree-icon" src={mediaUrl(file.fileType?.toLowerCase() === "xlsx" ? "/api/assets/dpo/excel.png" : "/api/assets/dpo/pdf.svg")} alt="" /><div className="decree-content"><h2>{file.title}</h2><p>{date(file.documentDate)} {file.fileSize ? ` · ${(file.fileSize / 1024).toFixed(0)} KB` : ""}</p></div>{file.fileUrl && <div className="decree-actions"><a className="decree-download" href={mediaUrl(file.fileUrl)} target="_blank" rel="noreferrer">ເປີດໄຟລ໌ <FontAwesomeIcon icon={faCloudArrowDown} /></a></div>}</article>)}</div><ApiState loading={result.loading} error={result.error} empty={result.data?.data.length === 0} /><Pagination page={page} totalPages={result.data?.totalPages ?? 0} setPage={setPage} /></section></>
}
function BilateralPage() {
  const [page, setPage] = useState(1)
  const result = useApi<List<News>>(`/news?category=international&page=${page}&limit=5`)
  return <><PageTitle title="ການຮ່ວມມືສອງຝ່າຍ" /><section className="section container editorial-feed bilateral-feed">{result.data?.data.map(item => <article key={item.id}>{item.coverImageUrl && <Link to={`/${item.slug}/`}><img className="bilateral-image" src={mediaUrl(item.coverImageUrl)} alt="" loading="lazy" /></Link>}<div><h2><Link to={`/${item.slug}/`}>{item.title}</Link></h2>{item.publishedAt && <time>{date(item.publishedAt)}</time>}{item.excerpt && <p>{item.excerpt}</p>}<Link className="button primary" to={`/${item.slug}/`}>ອ່ານເພີ່ມເຕີມ</Link></div></article>)}<ApiState loading={result.loading} error={result.error} empty={result.data?.data.length === 0} /><div className="bilateral-page-pagination"><Pagination page={page} totalPages={result.data?.totalPages ?? 0} setPage={setPage} /></div></section></>
}
function NewsListPage({ initialPage = 1 }: { initialPage?: number }) {
  const [page, setPage] = useState(initialPage)
  const result = useApi<List<News>>(`/news?page=${page}&limit=5`)
  const title = "ຂ່າວສານ"
  return <><PageTitle title={title} /><section className="section container content-sidebar cooperation-archive news-archive-page"><div><div className="archive-list">{result.data?.data.map(item => <article key={item.id}>{item.coverImageUrl && <Link to={`/${item.slug}/`} className="news-archive-image"><img src={mediaUrl(item.coverImageUrl)} alt="" loading="lazy" /></Link>}<div><h2><Link to={`/${item.slug}/`}>{item.title}</Link></h2>{item.publishedAt && <time>{date(item.publishedAt)}</time>}{item.excerpt && <p>{item.excerpt}</p>}<Link className="button primary" to={`/${item.slug}/`}>ອ່ານເພີ່ມເຕີມ</Link></div></article>)}</div><ApiState loading={result.loading} error={result.error} empty={result.data?.data.length === 0} /><Pagination page={page} totalPages={result.data?.totalPages ?? 0} setPage={setPage} /></div><NewsArchiveSidebar /></section></>
}
function NewsArchiveSidebar({ showSearch = true }: { showSearch?: boolean } = {}) {
  const news = useApi<List<News>>("/news?limit=5")
  const partners = useApi<List<Partner>>("/partners?limit=5")
  return <aside className="cooperation-sidebar">{showSearch && <div className="cooperation-widget"><SearchBox /></div>}<div className="cooperation-widget"><h3>ຂ່າວສານ ອື່ນໆ</h3>{news.data?.data.map(item => <Link className="cooperation-recent" key={item.id} to={`/${item.slug}/`}>{item.coverImageUrl && <img src={mediaUrl(item.coverImageUrl)} alt="" loading="lazy" />}<strong>{item.title}</strong>{item.publishedAt && <time>{date(item.publishedAt)}</time>}</Link>)}<ApiState loading={news.loading} error={news.error} /></div>{!!partners.data?.data.length && <div className="cooperation-widget cooperation-partners"><h3>ໜ້າເຊື່ອມຕໍ່ເວັບຕ່າງໆ</h3>{partners.data.data.filter(item => item.logoUrl).map(item => <a key={item.id} href={item.url} target="_blank" rel="noreferrer"><img src={mediaUrl(item.logoUrl)} alt={item.name} loading="lazy" /></a>)}</div>}</aside>
}
function ArticlePage({ slug }: { slug: string }) {
  const result = useApi<News>(`/news/${encodeURIComponent(slug)}`)
  const article = result.data
  const paragraphs = article?.content?.split(/\n\s*\n/).filter(paragraph => paragraph.trim()) ?? []
  return <>
    <PageTitle title={article?.title || "ຂ່າວສານ"} />
    <section className="section container content-sidebar cooperation-archive news-archive-page dporaw-page news-detail-page">
      <div>
      <ApiState loading={result.loading} error={result.error} />
      {article && <article className="detail-article" aria-labelledby="news-detail-title">
        <h1 id="news-detail-title" className="sr-only">{article.title}</h1>
        {article.coverImageUrl && <img className="dporaw-photo" src={mediaUrl(article.coverImageUrl)} alt={article.title} />}
        <div className="dporaw-copy">
          {paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
          {article.gallery?.filter(image => image !== article.coverImageUrl).map((image, index) => <img className="dporaw-photo" key={image} src={mediaUrl(image)} alt={`${article.title} — ${index + 2}`} loading="lazy" />)}
          {article.publishedAt && <time dateTime={article.publishedAt}>{date(article.publishedAt)}</time>}
        </div>
        <p className="dporaw-category"><Link to={paths.news}>ຂ່າວສານ</Link></p>
        {!!article.related?.length && <section aria-labelledby="news-related-title"><h2 id="news-related-title" className="iadi-related-title">ຂ່າວທີ່ກ່ຽວຂ້ອງ...</h2><div className="api-news-grid news-detail-related">{article.related.map(item => <NewsCard key={item.id} item={item} />)}</div></section>}
      </article>}
      </div>
      <NewsArchiveSidebar />
    </section>
  </>
}
function IadiArticle() {
  const result = useApi<News>("/news/iadi-earc-aprc")
  const recent = useApi<List<News>>("/news?limit=5")
  const partners = useApi<List<Partner>>("/partners?limit=5")
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  useEffect(() => {
    if (!selectedImage) return
    const close = (event: globalThis.KeyboardEvent) => { if (event.key === "Escape") setSelectedImage(null) }
    window.addEventListener("keydown", close)
    return () => window.removeEventListener("keydown", close)
  }, [selectedImage])
  return <><PageTitle title={result.data?.title || "ຂ່າວສານ"} /><section className="section container content-sidebar cooperation-archive iadi-page"><article><ApiState loading={result.loading} error={result.error} />{result.data && <><div className="iadi-gallery">{result.data.gallery?.map((url, index) => <button key={url} onClick={() => setSelectedImage(mediaUrl(url))} aria-label={`ເບິ່ງຮູບ ${index + 1}`}><img src={mediaUrl(url)} alt="" loading="lazy" /></button>)}</div><div className="iadi-copy">{result.data.content?.split(/\n\s*\n/).filter(Boolean).map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div><div className="iadi-categories"><span>ການຮ່ວມມືສາກົນ</span></div>{!!result.data.related?.length && <><h2 className="iadi-related-title">ຂ່າວທີ່ກ່ຽວຂ້ອງ...</h2><div className="iadi-related">{result.data.related.map(item => <Link key={item.id} to={`/${item.slug}/`}>{item.coverImageUrl && <img src={mediaUrl(item.coverImageUrl)} alt="" loading="lazy" />}<strong>{item.title}</strong></Link>)}</div></>}</>}</article><aside className="cooperation-sidebar"><div className="cooperation-widget"><SearchBox /></div><div className="cooperation-widget"><h3>ຂ່າວສານ ອື່ນໆ</h3>{recent.data?.data.map(item => <Link className="cooperation-recent" key={item.id} to={`/${item.slug}/`}>{item.coverImageUrl && <img src={mediaUrl(item.coverImageUrl)} alt="" loading="lazy" />}<strong>{item.title}</strong>{item.publishedAt && <time>{date(item.publishedAt)}</time>}</Link>)}<ApiState loading={recent.loading} error={recent.error} /></div>{!!partners.data?.data.length && <div className="cooperation-widget cooperation-partners"><h3>ໜ້າເຊື່ອມຕໍ່ເວັບຕ່າງໆ</h3>{partners.data.data.filter(item => item.logoUrl).map(item => <a key={item.id} href={item.url} target="_blank" rel="noreferrer"><img src={mediaUrl(item.logoUrl)} alt={item.name} loading="lazy" /></a>)}</div>}</aside></section>{selectedImage && <div className="iadi-lightbox" role="dialog" aria-modal="true" aria-label="ຮູບພາບ" onClick={() => setSelectedImage(null)}><button autoFocus onClick={() => setSelectedImage(null)} aria-label="ປິດ">×</button><img src={selectedImage} alt={result.data?.title || ""} /></div>}</>
}
function ContentPage({ slug, title }: { slug: string; title: string }) {
  const result = useApi<Page>(`/pages/${encodeURIComponent(slug)}`)
  return <><PageTitle title={result.data?.title || title} /><section className="section container api-article"><ApiState loading={result.loading} error={result.error} />{result.data && <><h1>{result.data.title}</h1>{result.data.imageUrl && <img className="api-article-image" src={mediaUrl(result.data.imageUrl)} alt="" />}<div className="api-prose">{result.data.content}</div></>}</section></>
}
function PhoneLink({ phone, className = "phone-cta-link" }: { phone: string; className?: string }) {
  const ref = useRef<HTMLAnchorElement>(null)
  useGSAP(() => {
    const link = ref.current
    if (!link) return
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)")
    const animation = gsap.timeline({ paused: true })
      .to(link.querySelector(".phone-hover"), { opacity: 1, duration: 0.4, ease: "power2.inOut" })
      .to(link.querySelector(".phone-label"), { letterSpacing: "0.08em", duration: 0.4, ease: "power2.out" }, 0)
    const update = () => {
      const active = link.matches(":hover") || link.matches(":focus-visible")
      if (motion.matches) animation.progress(active ? 1 : 0).pause()
      else if (active) animation.play()
      else animation.reverse()
    }
    link.addEventListener("mouseenter", update)
    link.addEventListener("mouseleave", update)
    link.addEventListener("focus", update)
    link.addEventListener("blur", update)
    return () => {
      link.removeEventListener("mouseenter", update)
      link.removeEventListener("mouseleave", update)
      link.removeEventListener("focus", update)
      link.removeEventListener("blur", update)
    }
  }, { scope: ref })
  return <a ref={ref} className={`${className} animated-phone`} href={`tel:${phone}`}><span className="phone-hover" aria-hidden="true" /><span className="phone-content"><span className="phone-icon"><FontAwesomeIcon icon={faPhoneVolume} aria-hidden="true" /></span><span className="phone-label">ເບີໂທ: {phone}</span></span></a>
}
function MissionPage() {
  const page = useApi<Page>("/pages/mission")
  const settings = useApi<Settings>("/site-settings")
  const paragraphs = page.data?.content.split(/\n\s*\n/).map(part => part.trim()).filter(Boolean) ?? []
  return <><PageTitle title={page.data?.title || "ພາລະບົດບາດ ແລະ ໜ້າທີ່"} /><section className="container institutional-source-page mission-page"><ApiState loading={page.loading} error={page.error} />{page.data && <><h1 className="institutional-heading">{page.data.title}</h1>{page.data.imageUrl && <img className="mission-image" src={mediaUrl(page.data.imageUrl)} alt="" />}<div className="duties-copy">{paragraphs[0] && <p>{paragraphs[0]}</p>}{paragraphs.length > 1 && <ul>{paragraphs.slice(1).map((paragraph, index) => <li key={index}>{paragraph}</li>)}</ul>}</div>{settings.data?.phone && <PhoneLink phone={settings.data.phone} />}</>}</section></>
}
function HistoryPage() {
  const page = useApi<Page>("/pages/history")
  const home = useApi<Home>("/home")
  const settings = useApi<Settings>("/site-settings")
  const paragraphs = page.data?.content.split(/\n\s*\n/).map(part => part.trim()).filter(Boolean) ?? []
  return <><PageTitle title={page.data?.title || "ປະຫວັດຄວາມເປັນມາ"} /><section className="container institutional-source-page history-page"><ApiState loading={page.loading} error={page.error} />{page.data && <><h1 className="institutional-heading">{paragraphs[0] || page.data.title}</h1><div className="history-copy">{paragraphs.slice(1).map((paragraph, index) => <div key={index}><p>{paragraph}</p>{index === 2 && page.data?.imageUrl && <img className="history-image" src={mediaUrl(page.data.imageUrl)} alt="" loading="lazy" />}{index === 4 && home.data?.intro.imageUrl && <img className="history-image" src={mediaUrl(home.data.intro.imageUrl)} alt="" loading="lazy" />}</div>)}</div>{settings.data?.phone && <PhoneLink phone={settings.data.phone} />}</>}</section></>
}
function InquiryForm({ source }: { source: "contact" | "faq" }) {
  const [status, setStatus] = useState(""); const [pending, setPending] = useState(false)
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form = event.currentTarget; const fields = new FormData(form)
    setPending(true); setStatus("")
    try { await request("/inquiries", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: String(fields.get("name") || ""), email: String(fields.get("email") || ""), subject: String(fields.get("subject") || ""), message: String(fields.get("message") || ""), source }) }); form.reset(); setStatus("ສົ່ງຂໍ້ຄວາມສຳເລັດແລ້ວ") }
    catch (error) { setStatus(error instanceof Error ? error.message : "ສົ່ງຂໍ້ຄວາມບໍ່ສຳເລັດ") } finally { setPending(false) }
  }
  return <form className={source === "faq" ? "faq-inquiry" : "inquiry-form"} onSubmit={submit}><label>ຊື່ *<input name="name" required maxLength={120} /></label><label>ອີເມວ *<input name="email" type="email" required maxLength={254} /></label><label>ຫົວຂໍ້<input name="subject" maxLength={200} /></label><label>ຂໍ້ຄວາມ *<textarea name="message" rows={6} required maxLength={5000} /></label><button className="button primary" type="submit" disabled={pending}>{pending ? "ກຳລັງສົ່ງ..." : "ສົ່ງ"}</button>{status && <p role="status">{status}</p>}</form>
}
function ContactPage() {
  const settings = useApi<Settings>("/site-settings"); const data = settings.data
  return <div className="contact-page"><PageTitle title="ຕິດຕໍ່" /><section className="section container"><ApiState loading={settings.loading} error={settings.error} />{data && <div className="contact-cards"><div className="contact-item"><FontAwesomeIcon icon={faEnvelope} aria-hidden="true" /><div><b>ອີເມວ</b><a href={`mailto:${data.email}`}>{data.email}</a></div></div><div className="contact-item"><FontAwesomeIcon icon={faPhoneVolume} aria-hidden="true" /><div><b>ເບີໂທ</b><a href={`tel:${data.phone}`}>{data.phone}</a></div></div><div className="contact-item"><FontAwesomeIcon icon={faLocationDot} aria-hidden="true" /><div><b>ທີ່ຢູ່</b><span className="contact-address">{data.address}</span></div></div></div>}<div className="contact-grid"><div><h2>ກາລຸນາໃຫ້ຄຳຄິດເຫັນໃນຟອມລຸ່ມນີ້</h2><InquiryForm source="contact" /></div>{data?.mapEmbedUrl && <iframe className="contact-map" src={data.mapEmbedUrl} title="ແຜນທີ່" loading="lazy" />}</div><div className="qr-wrap"><h2>QR CODE MAPS</h2><img src={mediaUrl("/api/assets/dpo/contact-qr.png")} width="202" height="202" alt="QR code ແຜນທີ່ສຳນັກງານປົກປ້ອງເງິນຝາກ" /></div>{data?.phone && <PhoneLink phone={data.phone} className="contact-phone" />}</section></div>
}
function FaqItem({ item }: { item: Faq }) {
  const [open, setOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const panelId = useId()
  useGSAP(() => {
    if (!panelRef.current) return
    gsap.to(panelRef.current, { height: open ? "auto" : 0, duration: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 0.4, ease: "power2.inOut", overwrite: "auto" })
  }, { dependencies: [open], scope: panelRef })
  return <div className={`faq-item${open ? " is-open" : ""}`}><button type="button" aria-expanded={open} aria-controls={panelId} onClick={() => setOpen(!open)}>{item.question}<FontAwesomeIcon icon={faChevronDown} aria-hidden="true" /></button><div ref={panelRef} id={panelId} className="faq-panel" aria-hidden={!open} inert={!open}><p className="faq-answer api-prose">{item.answer}</p></div></div>
}
function FaqPage() {
  const result = useApi<List<Faq>>("/faqs?limit=100")
  const settings = useApi<Settings>("/site-settings")
  return <div className="faq-page"><PageTitle title="ຄຳຖາມທີ່ພົບເລື້ອຍ" /><section className="section container"><h1 className="faq-hero-title">ຫາກທ່ານມີ ຄຳຖາມ ?</h1>{settings.data?.phone && <PhoneLink phone={settings.data.phone} className="faq-phone" />}<div className="faq-layout"><div><h2 className="faq-heading"><FontAwesomeIcon icon={faCircleQuestion} aria-hidden="true" /> ຄໍາຖາມທີ່ພົບເລື້ອຍ</h2><div className="faq-list">{result.data?.data.map(item => <FaqItem key={item.id} item={item} />)}</div><ApiState loading={result.loading} error={result.error} empty={result.data?.data.length === 0} /></div><div><h2 className="faq-heading"><FontAwesomeIcon icon={faPenToSquare} aria-hidden="true" /> ສອບຖາມພວກເຮົາ</h2><InquiryForm source="faq" /></div></div></section></div>
}
function PartnersPage() {
  const [page, setPage] = useState(1); const result = useApi<List<Partner>>(`/partners?page=${page}&limit=20`)
  return <><PageTitle title="ເຊື່ອມຕໍ່" /><section className="section container connections-page"><h1>ໜ້າເຊື່ອມຕໍ່ເວັບໄຊພາກສ່ວນລັດຖະບານ ແລະ ສາກົນ</h1><div className="connections-grid">{result.data?.data.map(partner => <a className="connection-card" key={partner.id} href={partner.url} target="_blank" rel="noreferrer">{partner.logoUrl && <img src={mediaUrl(partner.logoUrl)} alt="" loading="lazy" />}<div className="connection-copy"><hr /><h3>{partner.name}</h3>{partner.address && <p>{partner.address}</p>}{partner.phone && <p>{partner.phone}</p>}{partner.email && <p>{partner.email}</p>}</div></a>)}</div><ApiState loading={result.loading} error={result.error} empty={result.data?.data.length === 0} /><Pagination page={page} totalPages={result.data?.totalPages ?? 0} setPage={setPage} /></section></>
}
function SearchResults() {
  const { locale } = useLocale()
  const en = locale === "en"
  const query = new URLSearchParams(window.location.search).get("q")?.trim() || ""
  const [draft, setDraft] = useState(query)
  const [filter, setFilter] = useState("all")
  const [page, setPage] = useState(1)
  const result = useApi<{ news: News[]; documents: Document[]; pages: Page[] }>(query ? `/search?q=${encodeURIComponent(query)}&limit=100` : null)
  const items = [
    ...(result.data?.news ?? []).map(item => ({ key: `news:${item.id}`, type: "news", title: item.title, url: `/${item.slug}/`, image: item.coverImageUrl, publishedAt: item.publishedAt })),
    ...(result.data?.documents ?? []).map(item => ({ key: `document:${item.id}`, type: "documents", title: item.title, url: item.fileUrl ? mediaUrl(item.fileUrl) : null, image: null, publishedAt: item.documentDate })),
    ...(result.data?.pages ?? []).map(item => ({ key: `page:${item.slug}`, type: "pages", title: item.title, url: `/pages/${item.slug}/`, image: null, publishedAt: null })),
  ]
  const labels: Record<string, string> = { all: en ? "All results" : "ທັງໝົດ", news: en ? "News" : "ຂ່າວສານ", documents: en ? "Documents" : "ເອກະສານ", pages: en ? "Pages" : "ໜ້າເວັບ" }
  const filtered = filter === "all" ? items : items.filter(item => item.type === filter)
  const totalPages = Math.max(1, Math.ceil(filtered.length / 8))
  const visible = filtered.slice((page - 1) * 8, page * 8)
  const search = (value: string) => { if (value.trim()) navigate(`/search/?q=${encodeURIComponent(value.trim())}`) }
  const suggestions = ["ປົກປ້ອງເງິນຝາກ", "ສະມາຊິກ", "ຄະນະ"]
  return <div className="search-page">
    <PageTitle title={en ? "Search results" : "ຜົນການຄົ້ນຫາ"} />
    <section className="container search-workspace" aria-labelledby="search-title">
      <div className="search-intro"><header className="search-heading"><span className="search-eyebrow">DPO / {en ? "Website search" : "ຄົ້ນຫາຂໍ້ມູນ"}</span><h1 id="search-title">{en ? "Find information from DPO" : "ຄົ້ນຫາຂໍ້ມູນຈາກ ສປງ"}</h1><p>{en ? "News, published documents and information about our office." : "ຂ່າວສານ, ເອກະສານ ແລະ ຂໍ້ມູນກ່ຽວກັບສຳນັກງານ."}</p></header>
      <form className="search-query-form" role="search" onSubmit={event => { event.preventDefault(); search(draft) }}>
        <label htmlFor="search-query">{en ? "Search the website" : "ຄຳຄົ້ນຫາ"}</label>
        <div><FontAwesomeIcon icon={faMagnifyingGlass} aria-hidden="true" /><input id="search-query" type="search" maxLength={200} value={draft} onChange={event => setDraft(event.target.value)} placeholder={en ? "What are you looking for?" : "ທ່ານຕ້ອງການຄົ້ນຫາຫຍັງ?"} /><button type="submit" disabled={!draft.trim()}>{en ? "Search" : "ຄົ້ນຫາ"}<FontAwesomeIcon icon={faArrowRight} aria-hidden="true" /></button></div>
      </form></div>
      <div className="search-layout">
        <div className="search-main">
          <div className="search-result-heading"><h2>{query ? <>{en ? "Results for" : "ຜົນຄົ້ນຫາສຳລັບ"} <span>“{query}”</span></> : en ? "Start your search" : "ເລີ່ມຄົ້ນຫາຂໍ້ມູນ"}</h2><span role="status">{query && result.data && !result.loading && `${items.length}${[result.data.news, result.data.documents, result.data.pages].some(group => group.length === 100) ? "+" : ""} ${en ? "results" : "ຜົນລັບ"}`}</span></div>
          {query && <div className="search-filters" role="group" aria-label={en ? "Filter results" : "ປະເພດຜົນຄົ້ນຫາ"}>{Object.entries(labels).map(([key, label]) => <button type="button" key={key} aria-pressed={filter === key} onClick={() => { setFilter(key); setPage(1) }}>{label}<span>{key === "all" ? items.length : items.filter(item => item.type === key).length}</span></button>)}</div>}
          {result.loading ? <LoadingSkeleton label={en ? "Searching the website…" : "ກຳລັງຄົ້ນຫາຂໍ້ມູນ..."} /> : result.error ? <div className="search-feedback" role="alert"><h3>{en ? "We could not load the results" : "ບໍ່ສາມາດໂຫຼດຜົນຄົ້ນຫາໄດ້"}</h3><p>{result.error}</p><button type="button" onClick={() => window.location.reload()}>{en ? "Try again" : "ລອງໃໝ່"}</button></div> : !query || filtered.length === 0 ? <div className="search-feedback"><FontAwesomeIcon icon={faMagnifyingGlass} aria-hidden="true" /><h3>{!query ? en ? "What would you like to know?" : "ທ່ານຕ້ອງການຮູ້ກ່ຽວກັບຫຍັງ?" : en ? "No matching results" : "ບໍ່ພົບຂໍ້ມູນທີ່ກົງກັນ"}</h3><p>{en ? "Try a shorter keyword, check your spelling, or choose a topic below." : "ລອງໃຊ້ຄຳທີ່ສັ້ນລົງ, ກວດກາການສະກົດ ຫຼື ເລືອກຫົວຂໍ້ດ້ານລຸ່ມ."}</p>{filter !== "all" && items.length > 0 && <button type="button" onClick={() => setFilter("all")}>{en ? "View all results" : "ເບິ່ງຜົນລັບທັງໝົດ"}</button>}<div className="search-topic-links">{suggestions.map(topic => <button type="button" key={topic} onClick={() => search(topic)}>{topic}<span aria-hidden="true">↗</span></button>)}</div></div> : <>
            <div className="search-result-list" aria-label={labels[filter]}>{visible.map(item => <article className="search-result-row" key={item.key}>
              <div className="search-result-image">{item.image ? <Link to={item.url!}><img src={mediaUrl(item.image)} alt={item.title} loading="lazy" /></Link> : <FontAwesomeIcon icon={item.type === "documents" ? faCloudArrowDown : faPenToSquare} aria-hidden="true" />}</div>
              <div className="search-result-copy"><span className="search-result-type">{labels[item.type]}</span><h3>{!item.url ? item.title : item.type === "documents" ? <a href={item.url} target="_blank" rel="noreferrer">{item.title}<span className="sr-only"> ({en ? "opens in a new tab" : "ເປີດໃນແຖບໃໝ່"})</span></a> : <Link to={item.url}>{item.title}</Link>}</h3>{item.publishedAt && <time dateTime={item.publishedAt}>{date(item.publishedAt)}</time>}{!item.url && <span className="search-file-missing">{en ? "File currently unavailable" : "ໄຟລ໌ຍັງບໍ່ພ້ອມໃຫ້ດາວໂຫຼດ"}</span>}</div>
            </article>)}</div><Pagination page={page} totalPages={totalPages} setPage={next => { setPage(next); document.querySelector(".search-result-heading")?.scrollIntoView({ block: "start", behavior: "instant" }) }} />
          </>}
        </div>
        <div className="search-results-sidebar"><NewsArchiveSidebar showSearch={false} /></div>
      </div>
    </section>
  </div>
}
function AppPage({ path }: { path: string }) {
  if (path === "/") return <HomePage />
  const document = documentCategories[path]; if (document) return <DocumentsPage key={document.category} {...document} />
  if (path === paths.news) return <NewsListPage />
  const newsArchive = path.match(/^\/ຂ່າວສານ\/page\/(\d+)\/$/); if (newsArchive) return <NewsListPage initialPage={Number(newsArchive[1])} />
  if (path === paths.bilateral) return <BilateralPage />
  if (path === paths.international) return <><PageTitle title="ການເຄື່ອນໄຫວວຽກງານຮ່ວມມືສາກົນ" /><div className="section container content-sidebar"><section /><aside /></div></>
  if (path === paths.contact) return <ContactPage />
  if (path === paths.faq) return <FaqPage />
  if (path === paths.connections) return <PartnersPage />
  if (path === "/search/") return <SearchResults />
  if (path === paths.duties) return <MissionPage />
  if (path === paths.history) return <HistoryPage />
  const knownPages: Record<string, string> = { [paths.party]: "organization-party", "/dpo_bod/": "organization-board", "/dpo-organization-chart/": "structure" }
  if (knownPages[path]) return <ContentPage slug={knownPages[path]} title="ກ່ຽວກັບ ສປງ" />
  const page = path.match(/^\/pages\/([^/]+)\/$/); if (page) return <ContentPage slug={page[1]} title="ຂໍ້ມູນ" />
  const article = path.match(/^\/(?:news\/)?([^/]+)\/$/); if (article) return article[1] === "iadi-earc-aprc" ? <IadiArticle /> : <ArticlePage slug={article[1]} />
  return <><PageTitle title="ບໍ່ພົບໜ້າ" /><section className="section container">ບໍ່ພົບໜ້າທີ່ທ່ານຄົ້ນຫາ</section></>
}
function SocialRail() {
  const rail = useRef<HTMLDivElement>(null)
  const [collapsed, setCollapsed] = useState(false)
  const { contextSafe } = useGSAP({ scope: rail })
  const expand = contextSafe((link: HTMLAnchorElement, open: boolean) => {
    gsap.to(link.querySelector(".social-label"), { xPercent: open ? -100 : 0, autoAlpha: open ? 1 : 0, duration: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 0.25, ease: "power2.out", overwrite: "auto" })
  })
  const settings = useApi<Settings>("/site-settings")
  const links = [{ label: "DPO LAOS", href: settings.data?.facebookUrl, icon: faFacebookF, className: "social-facebook" }, { label: "YouTube", href: settings.data?.youtubeUrl, icon: faYoutube, className: "social-youtube" }].filter(link => link.href)
  if (!links.length) return null
  return <div ref={rail} className={`social-rail${collapsed ? " collapsed" : ""}`} aria-label="Social links"><button type="button" aria-label={collapsed ? "Expand social links" : "Collapse social links"} aria-expanded={!collapsed} onClick={() => setCollapsed(!collapsed)}><FontAwesomeIcon icon={faArrowRight} className="social-toggle-icon" /></button>{links.map(link => <a className={link.className} key={link.label} href={link.href} target="_blank" rel="noreferrer" aria-label={link.label} onMouseEnter={event => expand(event.currentTarget, true)} onMouseLeave={event => expand(event.currentTarget, false)} onFocus={event => expand(event.currentTarget, true)} onBlur={event => expand(event.currentTarget, false)}><span className="social-label" aria-hidden="true">{link.label}</span><FontAwesomeIcon icon={link.icon} /></a>)}</div>
}
function DpoChat() {
  const locale = "lo"
  const copy = chatCopy.lo
  const [pending, setPending] = useState(false)
  const [chatError, setChatError] = useState(false)
  const requestRef = useRef<AbortController | null>(null)
  useEffect(() => () => requestRef.current?.abort(), [])
  const faq = useApi<ChatSuggestion[]>(`/chat/suggestions?locale=${locale}`)
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState("")
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; text: string; sources?: ChatSource[]; choices?: string[]; language?: "lo" | "en"; mode?: "search" }[]>([])
  const [hintIndex, setHintIndex] = useState(0)
  const rootRef = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const launcherRef = useRef<HTMLButtonElement>(null)
  const messagesRef = useRef<HTMLDivElement>(null)
  const hintRef = useRef<HTMLButtonElement>(null)
  const followMessages = useRef(true)
  const scrollMessages = () => {
    const element = messagesRef.current
    if (element && followMessages.current) element.scrollTop = element.scrollHeight
  }
  const questions = faq.data ?? []
  const hint = questions[hintIndex % (questions.length || 1)]
  const close = () => { setOpen(false); launcherRef.current?.focus({ preventScroll: true }) }
  const answer = async (question: string, selected?: ChatSuggestion) => {
    const text = question.trim()
    if (!text || requestRef.current) return
    const language = chatLanguage(text)
    followMessages.current = true
    setChatError(false)
    setDraft("")
    setMessages(current => [...current, { role: "user", text, language }])
    if (selected) {
      setMessages(current => [...current, { role: "assistant", text: selected.answer, language: selected.language, sources: [{ id: selected.id, title: selected.question, url: paths.faq, excerpt: selected.answer.slice(0, 220), language: selected.language }] }])
      return
    }
    const controller = new AbortController()
    requestRef.current = controller
    setPending(true)
    const timer = window.setTimeout(() => controller.abort(), 30000)
    try {
      const result = await request<ChatReply>("/chat", {
        method: "POST", headers: { "Content-Type": "application/json" }, signal: controller.signal,
        body: JSON.stringify({ message: text, history: messages.slice(-6).map(item => ({ role: item.role, text: item.text.slice(0, 2000), choices: item.choices })) }),
      })
      setMessages(current => [...current, { role: "assistant", text: result.answer, language: chatLanguage(result.answer), sources: result.sources, choices: result.choices, mode: result.mode }])
    } catch {
      setDraft(text)
      setChatError(true)
    } finally {
      window.clearTimeout(timer)
      requestRef.current = null
      setPending(false)
    }
  }
  useEffect(() => {
    if (open) {
      inputRef.current?.focus({ preventScroll: true })
      scrollMessages()
    }
  }, [open, messages])
  useGSAP(() => {
    const duration = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : open ? 0.35 : 0.25
    gsap.to(overlayRef.current, { autoAlpha: open ? 1 : 0, duration, overwrite: "auto" })
    gsap.to(panelRef.current, {
      autoAlpha: open ? 1 : 0, y: open ? 0 : 28, scale: open ? 1 : 0.96,
      duration,
      ease: open ? "power3.out" : "power2.in", overwrite: "auto",
    })
  }, { scope: rootRef, dependencies: [open] })
  useGSAP(() => {
    const element = hintRef.current
    if (open || !element || !questions.length) return
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const timeline = gsap.timeline({ repeat: -1, repeatDelay: reduced ? 1 : 0.75 })
      .call(() => {
        const offset = 1 + Math.floor(Math.random() * Math.max(1, questions.length - 1))
        setHintIndex(index => (index + offset) % questions.length)
      })
      .fromTo(element, { autoAlpha: 0, y: reduced ? 0 : 12, scale: reduced ? 1 : 0.97 }, { autoAlpha: 1, y: 0, scale: 1, duration: reduced ? 0 : 0.35, ease: "power3.out" }, 0)
      .to(element, { autoAlpha: 0, y: reduced ? 0 : 8, duration: reduced ? 0 : 0.25, ease: "power2.in" }, 3)
    const updatePlayback = () => { timeline.paused(document.hidden || element.matches(":hover, :focus")) }
    const events = ["mouseenter", "mouseleave", "focus", "blur"]
    events.forEach(event => element.addEventListener(event, updatePlayback))
    document.addEventListener("visibilitychange", updatePlayback)
    updatePlayback()
    return () => {
      events.forEach(event => element.removeEventListener(event, updatePlayback))
      document.removeEventListener("visibilitychange", updatePlayback)
    }
  }, { scope: rootRef, dependencies: [open, questions.length], revertOnUpdate: true })
  return <div ref={rootRef} className="dpo-chat" lang={locale}>
    <button ref={overlayRef} type="button" className="dpo-chat-overlay" tabIndex={-1} aria-hidden="true" disabled={!open} onClick={close} />
    <section ref={panelRef} id="dpo-chat-panel" className="dpo-chat-panel" aria-label={copy.title} aria-hidden={!open} inert={!open} onKeyDown={event => { if (event.key === "Escape") { event.stopPropagation(); close() } }}>
      <header className="dpo-chat-header"><img src={mediaUrl("/api/assets/dpo/chat-logo.png")} alt="" /><div><strong>{copy.title}</strong><span>{copy.subtitle}</span></div><button type="button" onClick={close} aria-label={copy.close}><FontAwesomeIcon icon={faXmark} /></button></header>
      <div ref={messagesRef} onScroll={event => { const element = event.currentTarget; followMessages.current = element.scrollHeight - element.clientHeight - element.scrollTop < 48 }} className="dpo-chat-messages" role="log" aria-live="polite" aria-relevant="additions" aria-label={copy.history}>
        <div className="dpo-chat-message assistant"><p>{copy.greeting}</p></div>
        {messages.map((message, index) => <div key={index} className={`dpo-chat-message ${message.role}`}>{message.role === "assistant" ? <TypedAnswer text={message.text} language={message.language} onProgress={scrollMessages} /> : <p className="api-prose" lang={message.language}>{message.text}</p>}{!!message.choices?.length && <div className="dpo-chat-choices" role="group" aria-label="ເລືອກຫົວຂໍ້">{message.choices.map((choice, choiceIndex) => <button type="button" className="dpo-chat-choice" key={choice} lang={chatLanguage(choice)} disabled={pending} onClick={() => answer(choice)}>{choiceIndex + 1}. {choice}</button>)}</div>}{message.mode && <small className="dpo-chat-mode">{copy.search}</small>}{!!message.sources?.length && <div className="dpo-chat-sources"><strong>{copy.sources}</strong>{message.sources.map(source => <div key={source.id}>{message.language === "en" && source.language === "lo" && <small lang="en">{chatCopy.en.laoSource}</small>}<Link to={mediaUrl(source.url)} onClick={() => setOpen(false)}>{source.title} ↗</Link></div>)}</div>}</div>)}
        {pending && <ChatThinking label={copy.pending} />}
        {chatError && <p role="alert">{copy.error}</p>}
      </div>
      {faq.loading && <p className="dpo-chat-notice" role="status">{copy.suggestionsLoading}</p>}{faq.error && <p className="dpo-chat-notice" role="status">{copy.suggestionsError}</p>}
      <div className="dpo-chat-suggestions">{questions.map(item => <button type="button" key={item.id} disabled={pending} onClick={() => answer(item.question, item)}>{item.question}</button>)}</div>
      <p className="dpo-chat-notice">{copy.notice}<Link to={paths.contact} onClick={() => setOpen(false)}>{copy.contact}</Link></p>
      <form className="dpo-chat-form" onSubmit={event => { event.preventDefault(); answer(draft) }}>
        <input ref={inputRef} value={draft} onChange={event => setDraft(event.target.value)} maxLength={500} placeholder={copy.placeholder} aria-label={copy.question} disabled={pending} />
        <button type="submit" disabled={!draft.trim() || pending} aria-label={copy.send}><FontAwesomeIcon icon={faPaperPlane} /></button>
      </form>
    </section>
    {!open && hint && <button ref={hintRef} type="button" className="dpo-chat-hint" onClick={() => { answer(hint.question, hint); setOpen(true) }}><span className="dpo-chat-hint-label">{copy.suggestion}</span><span className="dpo-chat-hint-question">{hint.question}</span><span className="dpo-chat-hint-action">{copy.viewAnswer} <span aria-hidden="true">→</span></span></button>}
    <button ref={launcherRef} className="dpo-chat-launcher" type="button" onClick={() => setOpen(current => !current)} aria-controls="dpo-chat-panel" aria-expanded={open} aria-label={open ? copy.closeChat : copy.openChat}><img src={mediaUrl("/api/assets/dpo/chat-logo.png")} alt="" /></button>
  </div>
}
export default function App() {
  const readLocation = () => ({ path: decodeURI(window.location.pathname).replace(/\/?$/, "/"), search: window.location.search })
  const [location, setLocation] = useState(readLocation)
  const currentLocation = useRef(location)
  const navigationType = useRef<"initial" | "push" | "pop">("initial")
  const mainRef = useRef<HTMLElement>(null)

  useEffect(() => { recordPageView(location.path,location.search) }, [location.path,location.search])
  useEffect(keepVisitorSessionActive, [])

  useGSAP((_, contextSafe) => {
    if (!contextSafe) return
    const update = contextSafe((event: Event) => {
      const main = mainRef.current
      if (!main) return
      const next = readLocation()
      gsap.killTweensOf(main)
      if (next.path === currentLocation.current.path && next.search === currentLocation.current.search) {
        main.inert = false
        gsap.to(main, { opacity: 1, y: 0, duration: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 0.15, clearProps: "opacity,transform,willChange", overwrite: true })
        return
      }
      const commit = () => {
        currentLocation.current = next
        navigationType.current = event.type === "dpo:navigate" ? "push" : "pop"
        setLocation(next)
      }
      if (event.type === "popstate" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        commit()
      } else {
        main.inert = true
        gsap.set(main, { willChange: "transform,opacity" })
        gsap.to(main, { opacity: 1, y: -4, duration: 0.08, ease: "power1.in", overwrite: true, onComplete: commit })
      }
    })
    window.addEventListener("dpo:navigate", update)
    window.addEventListener("popstate", update)
    return () => {
      window.removeEventListener("dpo:navigate", update)
      window.removeEventListener("popstate", update)
      if (mainRef.current) mainRef.current.inert = false
    }
  }, { scope: mainRef })

  useGSAP(() => {
    const main = mainRef.current
    if (!main || navigationType.current === "initial") return
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (navigationType.current === "push") window.scrollTo({ top: 0, behavior: "instant" })
    main.inert = false
    if (!document.activeElement?.closest(".dpo-chat")) main.focus({ preventScroll: true })
    gsap.fromTo(main, { opacity: 1, y: reduced ? 0 : 10, willChange: reduced ? "auto" : "transform,opacity" }, {
      opacity: 1, y: 0, duration: reduced ? 0 : 0.38, ease: "power3.out",
      overwrite: true, clearProps: "opacity,transform,willChange",
    })
  }, { scope: mainRef, dependencies: [location.path, location.search], revertOnUpdate: true })

  return <><Header path={location.path} /><main ref={mainRef} id="main-content" tabIndex={-1}><AppPage key={`${location.path}${location.search}`} path={location.path} /></main><Footer /><SocialRail /><DpoChat /></>
}
