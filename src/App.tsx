import {
  FormEvent,
  KeyboardEvent,
  ReactNode,
  useEffect,
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
  faPause,
  faPlay,
  faEnvelope,
  faLocationDot,
  faPenToSquare,
} from "@fortawesome/free-solid-svg-icons"
import { faFacebookF, faYoutube } from "@fortawesome/free-brands-svg-icons"
import assetData from "./data/assets.json"
import newsData from "./data/news.json"
import newsExcerpts from "./data/news-excerpts.json"
import decrees from "./data/decrees.json"
import legalDocuments from "./data/legal-documents.json"
import fsnpDocuments from "./data/fsnp.json"
import bilateralArticles from "./data/bilateral.json"
import iadiParagraphs from "./data/iadi.json"
import pageContent from "./data/content.json"
import dutiesContent from "./data/duties.json"
import organization from "./data/organization.json"
import faqData from "./data/faq.json"
import informationDocuments from "./data/information.json"
import partners from "./data/partners.json"

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
  cooperationCategory: "/category/ການຮ່ວມມືສາກົນ/",
  international: "/ການເຄື່ອນໄຫວວຽກງານຮ່ວມ/",
  news: "/ຂ່າວສານ/",
  contact: "/ຕິດຕໍ່/",
  faq: "/ຄຳຖາມທີ່ພົບເລື່ອຍ/",
  connections: "/ເຊື່ອມຕໍ່/",
  information: "/ຂໍ້ມູນ/",
  about: "/ກ່ຽວກັບ/",
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
const homeAssets: Record<string, MediaAsset | undefined> = assetData

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
  const [failedSource, setFailedSource] = useState("")
  const loaded = asset && failedSource !== asset.src
  const ref = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ width, height })
  useEffect(() => {
    const node = ref.current
    if (!node) return
    const update = () =>
      setSize({
        width: Math.round(node.getBoundingClientRect().width),
        height: Math.round(node.getBoundingClientRect().height),
      })
    update()
    const observer = new ResizeObserver(update)
    observer.observe(node)
    return () => observer.disconnect()
  }, [])
  return (
    <div
      ref={ref}
      className={`asset-placeholder ${
        loaded ? "asset-loaded" : ""
      } ${className}`}
      data-asset-id={id}
      style={
        {
          "--slot-w": `${width}px`,
          "--slot-ratio": `${width} / ${height}`,
          "--mobile-w": `${mobileWidth}px`,
          "--mobile-ratio": `${mobileWidth} / ${mobileHeight}`,
        } as React.CSSProperties
      }
    >
      {loaded ? (
        asset.kind === "map" ? (
          <iframe
            src={asset.src}
            title={asset.alt}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        ) : asset.kind === "audio" ? (
          <audio
            controls
            preload="none"
            src={asset.src}
            aria-label={asset.alt}
            onError={() => setFailedSource(asset.src)}
          />
        ) : (
          <img
            src={asset.src}
            alt={asset.alt || label}
            width={width}
            height={height}
            loading={
              id.startsWith("home.hero") || id.startsWith("shared.")
                ? "eager"
                : "lazy"
            }
            style={{ objectFit: asset.fit === "cover" ? "cover" : "contain" }}
            onError={() => setFailedSource(asset.src)}
          />
        )
      ) : (
        <>
          <span>{label}</span>
          <small>
            {size.width} × {size.height} px
          </small>
          <code>{id}</code>
        </>
      )}
    </div>
  )
}

function navigate(path: string) {
  window.history.pushState({}, "", path)
  window.dispatchEvent(new PopStateEvent("popstate"))
  window.scrollTo({ top: 0, behavior: "smooth" })
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
    to: paths.about,
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
    to: paths.cooperationCategory,
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
        <Link to="/en/" className="mobile-language" aria-label="English">
          <FontAwesomeIcon icon={faLanguage} />
        </Link>
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
      <nav className="main-nav" aria-label="ເມນູຫຼັກ">
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
                  {item.label}
                  {item.children && <span aria-hidden="true">⌄</span>}
                </Link>
              ) : (
                <button type="button">
                  {item.label} <span aria-hidden="true">⌄</span>
                </button>
              )}
              {item.children && (
                <div className="dropdown">
                  {item.children.map((child) => (
                    child.children ? (
                      <div className={`nested-dropdown ${child.children.some((sub) => sub.to === path) ? "current" : ""}`} key={child.label} tabIndex={0}>
                        <div className="nested-dropdown-trigger">{child.label}<FontAwesomeIcon icon={faChevronRight} aria-hidden="true" /></div>
                        <div className="nested-dropdown-panel">{child.children.map((sub) => <Link to={sub.to!} key={sub.to} className={sub.to === path ? "current" : ""}>{sub.label}</Link>)}</div>
                      </div>
                    ) : <Link to={child.to!} key={child.to} className={child.to === path ? "current" : ""}>{child.label}</Link>
                  ))}
                </div>
              )}
            </div>
          ))}
          <div className="header-tools">
            <div className="utility-links">
              <Link to={paths.information}>ຂໍ້ມູນ</Link>
              <Link to={paths.connections}>ເຊື່ອມຕໍ່</Link>
            </div>
            <details className="language-select">
              <summary>
                <AssetPlaceholder
                  id="shared.flag-la"
                  label="LA"
                  width={18}
                  height={12}
                />{" "}
                LA ⌄
              </summary>
              <Link to="/en/" className="language">
                <AssetPlaceholder
                  id="shared.flag-en"
                  label="EN"
                  width={18}
                  height={12}
                />{" "}
                EN
              </Link>
            </details>
          </div>
        </div>
      </nav>
      <nav
        id="mobile-menu"
        className={`mobile-menu ${mobileOpen ? "open" : ""}`}
        aria-label="ເມນູມືຖື"
      >
        {menu.map((item) => (
          <div className="mobile-nav-item" key={item.label}>
            <div>
              {item.to ? (
                <Link to={item.to}>{item.label}</Link>
              ) : (
                <span>{item.label}</span>
              )}
              {item.children && (
                <button
                  aria-expanded={expanded.includes(item.label)}
                  onClick={() => toggle(item.label)}
                  aria-label={`ເປີດ ${item.label}`}
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
                      <summary>{child.label}<FontAwesomeIcon icon={faChevronDown} aria-hidden="true" /></summary>
                      <div className="mobile-submenu">{child.children.map((sub) => <Link to={sub.to!} key={sub.to}>{sub.label}</Link>)}</div>
                    </details>
                  ) : <Link to={child.to!} key={child.to}>{child.label}</Link>
                ))}
              </div>
            )}
          </div>
        ))}
        <div className="mobile-utilities">
          <Link to={paths.connections}>ເຊື່ອມຕໍ່</Link>
          <Link to={paths.information}>ຂໍ້ມູນ</Link>
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
            aria-label="ເມນູຫຼັກ"
          >
            {menu.map((item) => (
              <div key={item.label}>
                {item.children ? (
                  <details onToggle={(event) => rotateArrow(event.currentTarget)}>
                    <summary><span>{item.label}</span><FontAwesomeIcon icon={faChevronDown} className="menu-chevron" /></summary>
                    <div className="sticky-submenu">
                      {item.children.map((child) => (
                        child.children ? <details className="sticky-nested" key={child.label} onToggle={(event) => rotateArrow(event.currentTarget)}>
                          <summary><span>{child.label}</span><FontAwesomeIcon icon={faChevronDown} className="menu-chevron" /></summary>
                          <div className="sticky-submenu">{child.children.map((sub) => <Link key={sub.to} to={sub.to!}><span className="menu-guide" aria-hidden="true" />{sub.label}</Link>)}</div>
                        </details> : <Link key={child.to} to={child.to!}><span className="menu-guide" aria-hidden="true" />{child.label}</Link>
                      ))}
                    </div>
                  </details>
                ) : (
                  <Link to={item.to!}>{item.label}</Link>
                )}
              </div>
            ))}
          </nav>
        </div>
      </div>
    </header>
  )
}

function Footer() {
  return (
    <footer>
      <div className="footer-main">
        <div className="container footer-grid">
          <div>
            <h3>ແຜນທີ່</h3>
            <AssetPlaceholder
              id="footer.map"
              label="Footer map"
              width={260}
              height={240}
              mobileWidth={358}
              mobileHeight={240}
            />
          </div>
          <div>
            <h3>ຂ່າວຫຼ້າສຸດ</h3>
            <ul className="footer-links">
              {newsData.slice(0, 5).map((news) => (
                <li key={news.slug}>
                  <Link to={`/${news.slug}/`}>{news.title}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3>ຕິດຕໍ່</h3>
            <p>
              <a href="mailto:info@dpo.gov.la">ອິເມວ: info@dpo.gov.la</a>
            </p>
            <p>
              <a
                href="https://www.facebook.com/dpolaos"
                target="_blank"
                rel="noreferrer"
              >
                Facebook Page: ສໍານັກງານປົກປ້ອງເງິນຝາກ: ສປງ
              </a>
            </p>
            <p>
              <a href="tel:+85621330005">ເບີໂທ: +85621-330005</a>
            </p>
            <p>ແຟ໊ກ: 021-330631</p>
            <p>
              <a href="tel:1524">ເບີໂທສາຍດ່ວນ: 1524</a>
            </p>
            <p>
              ທີ່ຢູ່ ຊັ້ນ 4 ຕຶກສຳນັກງານ ຄະນະກຳມະການຄຸ້ມຄອງຫຼັກຊັບ, ຖະໜົນໄກສອນພົມວິຫານ,
              ບ້ານໂພນສະອາດ, ເມືອງໄຊເສດຖາ, ນະຄອນຫຼວງວຽງຈັນ, ສປປ ລາວ.
            </p>
          </div>
          <div>
            <h3>ສະຖິຕິຜູ້ເຂົ້າຊົມ</h3>
            <p className="visitor-note">ຂໍ້ມູນຜູ້ເຂົ້າຊົມຍັງບໍ່ມີ</p>
            <dl className="stats-list">
              <div>
                <dt>ມື້ນີ້</dt>
                <dd>—</dd>
              </div>
              <div>
                <dt>ທັງໝົດ</dt>
                <dd>—</dd>
              </div>
            </dl>
            <AssetPlaceholder
              id="footer.audio-1"
              label="Audio player"
              width={260}
              height={54}
            />
            <p className="audio-caption">ສະປອດໂຄສະນາ ປົກປ້ອງເງິນຝາກ 2024</p>
            <AssetPlaceholder
              id="footer.audio-2"
              label="Audio player"
              width={260}
              height={54}
            />
            <p className="audio-caption">ສະປອດໂຄສະນາ ປົກປ້ອງເງິນຝາກ ພາສາຊົນເຜົ່າ</p>
          </div>
        </div>
      </div>
      <div className="copyright">
        <div className="container">
          <span>Copyright © 2020 ສໍານັກງານປົກປ້ອງເງິນຝາກ</span>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            ກັບຂຶ້ນເທິງ ↑
          </button>
        </div>
      </div>
    </footer>
  )
}

function PageTitle({ title }: { title: string }) {
  return (
    <div className="title-band">
      <div className="container">
        <p>
          <Link to="/" className="breadcrumb-home"><FontAwesomeIcon icon={faHouse} aria-hidden="true" /> ໜ້າຫຼັກ</Link> <span>/</span> {title}
        </p>
        <h1>{title}</h1>
      </div>
    </div>
  )
}

const newsItems = newsData.slice(0, 5).map((item) => item.title)

function Home() {
  const [slide, setSlide] = useState(0)
  const [paused, setPaused] = useState(false)
  const [reduceMotion, setReduceMotion] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  )
  const changingSlide = useRef(false)
  const homeRef = useRef<HTMLDivElement>(null)
  const { contextSafe } = useGSAP({ scope: homeRef })
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)")
    const update = () => setReduceMotion(media.matches)
    media.addEventListener("change", update)
    return () => media.removeEventListener("change", update)
  }, [])
  const changeSlide = contextSafe((next: number) => {
    if (changingSlide.current || next === slide) return
    const slides = homeRef.current?.querySelectorAll<HTMLElement>(".hero-slide")
    if (!slides || reduceMotion) { setSlide(next); return }
    const outgoing = slides[slide]
    const incoming = slides[next]
    changingSlide.current = true
    // Keep the old image opaque underneath until the incoming layer fully covers it.
    gsap.set(outgoing, { autoAlpha: 1, zIndex: 1 })
    gsap.set(incoming, { autoAlpha: 0, zIndex: 2 })
    gsap.to(incoming, {
      autoAlpha: 1, duration: 0.9, ease: "power1.inOut", overwrite: "auto",
      onComplete: () => {
        gsap.set(outgoing, { autoAlpha: 0, zIndex: 0 })
        gsap.set(incoming, { zIndex: 1 })
        changingSlide.current = false
        setSlide(next)
      },
    })
  })
  useEffect(() => {
    if (paused || reduceMotion) return
    const timer = window.setInterval(() => {
      if (!document.hidden) changeSlide((slide + 1) % 5)
    }, 8000)
    return () => window.clearInterval(timer)
  }, [slide, paused, reduceMotion, changeSlide])
  useGSAP(
    () => {
      const media = gsap.matchMedia()
      media.add(
        "(prefers-reduced-motion: no-preference)",
        (context) => {
          const counters = Array.from(
            homeRef.current?.querySelectorAll<HTMLElement>(".counter-value") ??
              [],
          )
          const section = homeRef.current?.querySelector(".protection-copy")
          if (!section || !counters.length) return
          context.add("countUp", () => {
            gsap.fromTo(counters, { textContent: 0 }, {
              textContent: (_index: number, element: HTMLElement) =>
                Number(element.dataset.countTarget),
              snap: { textContent: 1 },
              duration: 1.8,
              ease: "power2.out",
            })
          })
          const observer = new IntersectionObserver(
            (entries) => {
              if (entries.some((entry) => entry.isIntersecting)) {
                context.countUp()
                observer.disconnect()
              }
            },
            { threshold: 0.25 },
          )
          observer.observe(section)
          return () => observer.disconnect()
        },
        homeRef,
      )
      return () => media.revert()
    },
    { scope: homeRef },
  )
  const [newsStart, setNewsStart] = useState(0)
  const newsRef = useRef<HTMLDivElement>(null)
  const moveNews = (direction: number) => {
    const next = Math.max(
      0,
      Math.min(newsData.length - 3, newsStart + direction),
    )
    setNewsStart(next)
    const track = newsRef.current
    if (track)
      track.scrollTo({
        left:
          next *
          ((track.firstElementChild?.getBoundingClientRect().width ?? 0) +
            (window.innerWidth <= 768 ? 28 : 10)),
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth",
      })
  }
  return (
    <div className="home-page" ref={homeRef}>
      <section
        className="hero"
        aria-label="ຂ່າວເດັ່ນ"
        aria-roledescription="carousel"
        onFocusCapture={() => setPaused(true)}
      >
        {Array.from({ length: 5 }, (_, index) => (
          <div key={index} className="hero-slide" aria-hidden={index !== slide}
            style={{ opacity: index === slide ? 1 : 0, visibility: index === slide ? "visible" : "hidden", zIndex: index === slide ? 1 : 0 }}>
            <AssetPlaceholder id={`home.hero-${index + 1}`} label={`DPO banner ${index + 1}`}
              width={1440} height={1000} mobileWidth={390} mobileHeight={845} />
          </div>
        ))}
        <button
          className="hero-arrow prev"
          onClick={() => changeSlide((slide + 4) % 5)}
          aria-label="ກ່ອນໜ້າ"
        >
          <FontAwesomeIcon icon={faChevronLeft} />
        </button>
        <button
          className="hero-arrow next"
          onClick={() => changeSlide((slide + 1) % 5)}
          aria-label="ຕໍ່ໄປ"
        >
          <FontAwesomeIcon icon={faChevronRight} />
        </button>
        <button
          className="hero-playback"
          onClick={() => setPaused(!paused)}
          aria-label={paused ? "Play slideshow" : "Pause slideshow"}
          aria-pressed={paused}
          disabled={reduceMotion}
        >
          <FontAwesomeIcon icon={paused ? faPlay : faPause} />
        </button>
      </section>
      <section className="section container home-news">
        <h1 className="latest-title">ຂ່າວຫຼ້າສຸດ</h1>
        <div className="news-carousel">
          <button
            className="news-arrow prev"
            aria-label="ຂ່າວກ່ອນໜ້າ"
            disabled={newsStart === 0}
            onClick={() => moveNews(-1)}
          >
            ‹
          </button>
          <div className="news-cards" ref={newsRef}>
            {newsData.map((news, index) => (
              <article className="news-card" key={news.slug}>
                <Link to={`/${news.slug}/`}>
                  <AssetPlaceholder
                    id={`home.news-${index + 1}`}
                    label={news.title}
                    width={300}
                    height={300}
                  />
                </Link>
                <div>
                  <h3>
                    <Link to={`/${news.slug}/`}>{news.title}</Link>
                  </h3>
                  <time>{news.date}</time>
                </div>
              </article>
            ))}
          </div>
          <button
            className="news-arrow next"
            aria-label="ຂ່າວຕໍ່ໄປ"
            disabled={newsStart >= newsData.length - 3}
            onClick={() => moveNews(1)}
          >
            ›
          </button>
        </div>
      </section>
      <section className="section intro-section">
        <div className="container split">
          <div>
            <h2>ກ່ຽວກັບສໍານັກງານປົກປ້ອງເງິນຝາກ</h2>
            <p>
              ໃນໄລຍະຜ່ານມາ ສໍານັກງານປົກປ້ອງເງິນຝາກ
              ເຄື່ອນໄຫວວຽກງານພາຍໃຕ້ກົດລະບຽບວ່າດ້ວຍກອງທຶນປົກປ້ອງຜູ້ຝາກເງິນ ສະບັບເລກທີ 283/ທຫລ,
              ລົງວັນທີ 30 ສິງຫາ 1999 ຊຶ່ງມີພາລະບົດບາດເປັນເສນາທິການ ໃຫ້ແກ່ກະຊວງການເງິນ ແລະ
              ທະນາຄານແຫ່ງ ສປປ ລາວ ໃນການປົກປ້ອງສິດຜົນປະໂຫຍດຂອງຜູ້ຝາກເງິນ
              ທີ່ຝາກໄວ້ຢູ່ນຳທະນາຄານທຸລະກິດ ທີ່ເປັນສະມາຊິກຂອງກອງທຶນປົກປ້ອງຜູ້ຝາກເງິນ. ມາໃນຊຸມປີ 2014
              ເພື່ອຍົກບົດບາດ ຂອງກອງທຶນປົກປ້ອງຜູ້ຝາກເງິນໃຫ້ສູງຂຶ້ນ
              ສະນັ້ນຈຶ່ງໄດ້ຍົກ​ລະ​ດັບ​​ກົດ​ລະ​ບຽບດັ່ງກ່າວ​ເປັນດຳ​ລັດວ່າດ້ວຍການປົກປ້ອງເງິນຝາກ
              ຈຸດປະສົງເພື່ອຮັບປະກັນຄວາມສາມາດໃນການປົກປ້ອງເງິນຝາກໃຫ້ກວ້າງຂຶ້ນ
              ເພື່ອໃຫ້ສອດຄ່ອງກັບເງື່ອນໄຂ ແລະ ຄວາມຮຽກຮ້ອງຕ້ອງການ ຂອງໜ້າທີ່ວຽກງານ
              ກໍຄືລະບຽບຫຼັກການທັງພາຍໃນ ແລະ ສາກົນ, ໃນນັ້ນ, ຈຶ່ງໄດ້ປັບປຸງພາລະບົດບາດ ແລະ
              ໜ້າທີ່ຂອງສໍານັກງານປົກປ້ອງເງິນຝາກເຊັ່ນ: ໂຄງປະກອບການຈັດຕັ້ງ,
              ເງື່ອນໄຂການເຂົ້າເປັນສະມາຊິກສໍານັກງານປົກປ້ອງເງິນຝາກ
              ຂອງສະຖາບັນການເງິນຈຸລະພາກທີ່ຮັບເງິນຝາກ, ຂັ້ນຕອນການຈ່າຍເງິນປົກປ້ອງ, ການຊໍາລະສະສາງ,
              ຄັງປົກປ້ອງເງິນຝາກ, ການຄຸ້ມຄອງ ການກວດກາ ແລະ ອື່ນໆ.
            </p>
            <Link to={paths.history} className="button primary">
              ອ່ານເພີ່ມເຕີມ
            </Link>
          </div>
          <AssetPlaceholder
            id="home.office-photo"
            label="ສຳນັກງານ ສປງ"
            width={570}
            height={380}
            mobileWidth={358}
            mobileHeight={239}
          />
        </div>
      </section>
      <section
        className="protection"
        style={{
          backgroundImage: `url(${homeAssets["protection.background"]?.src})`,
        }}
      >
        <div className="container split">
          <div className="protection-copy">
            <h2>ສຳນັກງານປົກປ້ອງເງິນຝາກ</h2>
            <h4>Deposit Protection office of Lao PDR.</h4>
            <div className="stat-grid">
              <div>
                <strong aria-label="100ລ້ານກີບ">
                  <span
                    className="counter-value"
                    data-count-target="100"
                    aria-hidden="true"
                  >
                    100
                  </span>
                  ລ້ານກີບ
                </strong>
                <span>ວົງເງິນປົກປ້ອງ</span>
              </div>
              <div>
                <strong aria-label="35ທະນາຄານ">
                  <span
                    className="counter-value"
                    data-count-target="35"
                    aria-hidden="true"
                  >
                    35
                  </span>
                  ທະນາຄານ
                </strong>
                <span>ສະມາຊິກ ສປງ ທີ່ເປັນທະນາຄານທຸລະກິດ</span>
              </div>
              <div>
                <strong aria-label="6ສະຖາບັນ">
                  <span
                    className="counter-value"
                    data-count-target="6"
                    aria-hidden="true"
                  >
                    6
                  </span>
                  ສະຖາບັນ
                </strong>
                <span>ສະມາຊິກ ສປງ ທີ່ເປັນສະຖາບັນການເງິນຈຸລະພາກທີ່ຮັບເງິນຝາກ</span>
              </div>
            </div>
          </div>
          <AssetPlaceholder
            id="home.protection-poster"
            label="ໂພສະເຕີ ການປົກປ້ອງເງິນຝາກ"
            width={570}
            height={808}
            mobileWidth={358}
            mobileHeight={508}
          />
        </div>
      </section>
      <section className="container home-members">
        <AssetPlaceholder
          id="home.member-logo-montage"
          label="Membership logos 2026"
          width={1170}
          height={560}
          mobileWidth={358}
          mobileHeight={171}
        />
      </section>
    </div>
  )
}

function SectionHeading({
  eyebrow,
  title,
  align = "center",
}: {
  eyebrow?: string
  title: string
  align?: "center" | "left"
}) {
  return (
    <div className={`section-heading ${align}`}>
      {eyebrow && <span>{eyebrow}</span>}
      <h2>{title}</h2>
      <i />
    </div>
  )
}

function InstitutionalPage({ type }: { type: "duties" | "history" | "about" }) {
  const isDuties = type === "duties"
  const title = isDuties ? "ພາລະບົດບາດ ແລະ ໜ້າທີ່" : type === "history" ? "ປະຫວັດຄວາມເປັນມາ" : "ກ່ຽວກັບ"
  if (type !== "about") return <>
    <PageTitle title={title} />
    <article className={`section container institutional-source-page ${isDuties ? "duties-page" : "history-page"}`}>
      <h2 className="institutional-heading">{isDuties ? title : "ປະຫວັດຄວາມເປັນມາ ສຳນັກງານປົກປ້ອງເງິນຝາກ"}</h2>
      {isDuties ? <>
        <AssetPlaceholder id="institutional.duties.photo-1" label="ຮູບໝູ່ ສປງ" width={1170} height={600} mobileWidth={358} mobileHeight={239} />
        <div className="duties-copy"><p>{dutiesContent.intro}</p><ul>{dutiesContent.items.map((text) => <li key={text}>{text}</li>)}</ul></div>
      </> : <div className="history-copy">
        {pageContent.history.slice(1).map((block, index) => block.id ?
          <AssetPlaceholder key={block.id} id={block.id} label={block.id.endsWith("1") ? "ອາຄານສຳນັກງານເກົ່າ" : "ອາຄານສຳນັກງານປັດຈຸບັນ"} width={1170} height={780} mobileWidth={358} mobileHeight={239} /> :
          <p key={index}>{block.text}</p>)}
      </div>}
      <PhoneLink className="faq-phone phone-cta-link" label="ເບີໂທ:" />
    </article>
  </>
  return <>
    <PageTitle title={title} />
    <article className="section container article-body">
      <SectionHeading title="ຮູ້ຈັກອົງການປົກປ້ອງເງິນຝາກ" />
      <AssetPlaceholder id="institutional.about.photo-1" label="Historical office photo" width={770} height={513} mobileWidth={358} mobileHeight={239} />
      {[1, 2, 3, 4].map((item) => <div className="pending-copy" key={item}>
        <h3>ຂໍ້ມູນສ່ວນທີ {item}</h3>
        <p>ພື້ນທີ່ໂຄງສ້າງສຳລັບເນື້ອຫາພາສາລາວຕາມຕົ້ນສະບັບ. ຂໍ້ຄວາມທາງການສະບັບເຕັມຍັງບໍ່ມີໃນຊຸດຂໍ້ມູນ ແລະ ຈະບໍ່ຖືກສ້າງຂຶ້ນໃໝ່.</p>
        {item === 2 && <AssetPlaceholder id="institutional.about.photo-2" label="Office building photo" width={770} height={513} mobileWidth={358} mobileHeight={239} />}
      </div>)}
      <Link to="/dpo-organization-chart/" className="wide-cta">ເບິ່ງໂຄງຮ່າງການຈັດຕັ້ງ →</Link>
    </article>
  </>
}

function Accordion({
  items,
  initial = -1,
  faq = false,
  board = false,
}: {
  items: string[]
  initial?: number
  faq?: boolean
  board?: boolean
}) {
  const [open, setOpen] = useState<number[]>(initial >= 0 ? [initial] : [])
  const toggle = (index: number) =>
    setOpen((items) =>
      items.includes(index)
        ? items.filter((item) => item !== index)
        : [...items, index],
    )
  return (
    <div className={`accordion ${board ? "board-accordion" : ""}`}>
      {items.map((item, index) => (
        <div className="accordion-item" key={`${item}-${index}`}>
          <button
            onClick={() => toggle(index)}
            aria-expanded={open.includes(index)}
            aria-controls={`panel-${faq ? "faq" : "org"}-${index}`}
          >
            <span>
              {faq ? `${index + 1}. ` : ""}
              {item}
            </span>
            {board ? <FontAwesomeIcon icon={faChevronDown} className={open.includes(index) ? "board-chevron open" : "board-chevron"} aria-hidden="true" /> : <b aria-hidden="true">{open.includes(index) ? "−" : "+"}</b>}
          </button>
          {open.includes(index) && (
            <div
              id={`panel-${faq ? "faq" : "org"}-${index}`}
              className="accordion-panel"
            >
              {faq ? (
                <p>ເນື້ອຫາຄຳຕອບລໍຖ້າການຢືນຢັນ — Answer content pending.</p>
              ) : board ? (
                <AssetPlaceholder id={`organization.board.panel-${index + 1}.chart`} label={item} width={1170} height={500} mobileWidth={358} mobileHeight={160} />
              ) : (
                <div className="org-panel">
                  <AssetPlaceholder
                    id={`organization.panel-${index + 1}.chart`}
                    label="Organization chart"
                    width={770}
                    height={500}
                    mobileWidth={358}
                    mobileHeight={233}
                  />
                  <AssetPlaceholder
                    id={`organization.panel-${index + 1}.portrait`}
                    label="Organization portrait"
                    width={160}
                    height={200}
                    mobileWidth={128}
                    mobileHeight={160}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function OrganizationItem({ group, item, index, open, onToggle }: { group: "board" | "party" | "state"; item: string; index: number; open: boolean; onToggle: () => void }) {
  const itemRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const { contextSafe } = useGSAP({ scope: itemRef })
  useGSAP(() => {
    const panel = panelRef.current
    if (!panel) return
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    gsap.to(panel, {
      height: open ? "auto" : 0, duration: reduced ? 0 : 0.4,
      ease: "power2.inOut", overwrite: "auto",
      onComplete: open ? contextSafe(() => {
        const header = document.querySelector<HTMLElement>(".sticky-inner")
        const item = itemRef.current
        if (!item) return
        gsap.to(window, {
          scrollTo: { y: item, offsetY: (header?.offsetHeight ?? 0) + 12, autoKill: true },
          duration: reduced ? 0 : 0.55, ease: "power2.out", overwrite: "auto",
        })
      }) : undefined,
    })
  }, { scope: itemRef, dependencies: [open] })
  return <div className="accordion-item" ref={itemRef}>
    <button onClick={onToggle} aria-expanded={open} aria-controls={`${group}-panel-${index}`}>
      <span>{item}</span><FontAwesomeIcon icon={faChevronDown} className={open ? "board-chevron open" : "board-chevron"} aria-hidden="true" />
    </button>
    <div id={`${group}-panel-${index}`} ref={panelRef} className="board-panel-wrap" aria-hidden={!open} inert={!open}>
      <div className="accordion-panel">{Object.keys(homeAssets)
        .filter((id) => id === `organization.${group}.panel-${index + 1}.chart` || id.startsWith(`organization.${group}.panel-${index + 1}.chart-`))
        .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
        .map((id) => <AssetPlaceholder key={id} id={id} label={item} width={1170} height={500} mobileWidth={358} mobileHeight={160} />)}
      </div>
    </div>
  </div>
}

function OrganizationAccordion({ group }: { group: "board" | "party" | "state" }) {
  const [open, setOpen] = useState<number | null>(null)
  return <div className="accordion board-accordion">{organization[group].map((item, index) =>
    <OrganizationItem key={item} group={group} item={item} index={index} open={open === index} onToggle={() => setOpen((current) => current === index ? null : index)} />
  )}</div>
}

function OrganizationPage({ type }: { type: "board" | "party" | "state" }) {
  const titles = {
    board: "ໂຄງຮ່າງການຈັດຕັ້ງ ສະພາບໍລິຫານ",
    party: "ໂຄງຮ່າງການຈັດຕັ້ງ ສາຍພັກ ແລະ ອົງການມະຫາຊົນ",
    state: "ໂຄງຮ່າງການຈັດຕັ້ງ ສາຍລັດ",
  }
  const headings = {
    board: "ໂຄງຮ່າງການຈັດຕັ້ງ ສະພາບໍລິຫານ ຕັ້ງແຕ່ ປີ 1999 ຮອດ ປະຈຸບັນ",
    party: "ໂຄງຮ່າງການຈັດຕັ້ງສາຍພັກ ແລະ ອົງການຈັດຕັ້ງມະຫາຊົນປະຈຸບັນຂອງ ສປງ",
    state: "ໂຄງຮ່າງການຈັດຕັ້ງ ສາຍລັດ ຂອງ ສປງ",
  }
  return <>
    <PageTitle title={titles[type]} />
    <section className="section container narrow board-page">
      <h2 className="board-heading"><span><FontAwesomeIcon icon={faCircleQuestion} /></span>{headings[type]}</h2>
      {type === "state" && <AssetPlaceholder id="organization.state.overview" label={headings.state} width={1080} height={529} mobileWidth={358} mobileHeight={175} className="state-overview" />}
      <OrganizationAccordion key={type} group={type} />
      {type === "state" && <AssetPlaceholder id="organization.state.poster" label="ສຳນັກງານປົກປ້ອງເງິນຝາກ" width={663} height={1024} mobileWidth={358} mobileHeight={553} className="state-poster" />}
    </section>
  </>
}

const libraryCounts: Record<string, number> = {
  decrees: 3,
  decisions: 4,
  notices: 8,
  forms: 2,
  guidance: 4,
  fsnp: 8,
  information: 6,
}

const libraryTitles: Record<string, string> = {
  decrees: "ດຳລັດ",
  decisions: "ຂໍ້ຕົກລົງ",
  notices: "ແຈ້ງການ",
  forms: "ແບບພິມ",
  guidance: "ບົດແນະນໍາ ແລະ ຄໍາແນະນໍາ",
  fsnp: "Lao PDR Financial Sector Safety Net Strengthening",
  information: "ຂໍ້ມູນ",
}

type LegalCategory = "decrees" | "decisions" | "notices" | "forms" | "guidance" | "fsnp" | "information"
type LegalFile = { id: string; title: string; download: string; local?: string; preview?: string; size: string; hits: string; dates: string[]; ext?: string }

function DecreesPage({ type }: { type: LegalCategory }) {
  const [query, setQuery] = useState("")
  const term = query.trim().toLocaleLowerCase()
  const title = libraryTitles[type]
  const documents: LegalFile[] = type === "decrees" ? decrees : type === "fsnp" ? fsnpDocuments : type === "information" ? informationDocuments.map((file) => ({ ...file, download: `/assets/dpo/documents/${file.id}.pdf`, local: `/assets/dpo/documents/${file.id}.pdf` })) : legalDocuments[type]
  const files = documents.filter((file) => file.title.toLocaleLowerCase().includes(term))
  return <>
    <PageTitle title={title} />
    <section className="section container decrees-page">
      <h1>{type === "fsnp" ? title : type === "information" ? "ເອກະສານ ຂໍ້ມຸນຕ່າງໆ" : `ເອກະສານໄຟລ໌ ${title}`}</h1>
      {type !== "fsnp" && <div className="decrees-search">
        <label htmlFor="decrees-search" className="sr-only">ຄົ້ນຫາເອກະສານ</label>
        <FontAwesomeIcon icon={faMagnifyingGlass} aria-hidden="true" />
        <input id="decrees-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search files..." type="search" />
      </div>}
      <div className="decrees-category">» {type === "fsnp" ? "FSNP" : title}</div>
      <div className="decrees-layout">
        <div className="decrees-tree" aria-hidden="true" />
        {files.length ? <div className="decrees-grid">{files.map((file) =>
          <article key={file.id} className="decree-card">
            <img className="decree-icon" src={file.ext === "xlsx" ? "/assets/dpo/excel.png" : "/assets/dpo/pdf.svg"} alt="" />
            <div className="decree-content">
              <h2><a href={file.local || file.download} download={file.local ? true : undefined}>{file.title}</a></h2>
              <dl>
                <div><dt>Size:</dt><dd>{file.size}</dd></div>
                <div title="Captured 5 November 2026"><dt>Hits:</dt><dd>{file.hits}</dd></div>
                <div><dt>Date added:</dt><dd>{file.dates[0]}</dd></div>
                <div><dt>Date modified:</dt><dd>{file.dates[1]}</dd></div>
              </dl>
            </div>
            <div className="decree-actions">
              <a className="decree-download" href={file.local || file.download} download={file.local ? true : undefined}>ດາວໂຫລດ <FontAwesomeIcon icon={faCloudArrowDown} aria-hidden="true" /></a>
              {file.ext !== "xlsx" && <a className="decree-preview" href={file.local || file.preview} target="_blank" rel="noopener noreferrer">ເປີດເບີ່ງ <FontAwesomeIcon icon={faExpand} aria-hidden="true" /><span className="sr-only"> (opens in a new tab)</span></a>}
            </div>
          </article>
        )}</div> : <p className="decrees-empty" role="status">ບໍ່ພົບເອກະສານ</p>}
      </div>
    </section>
  </>
}

function DocumentLibrary({ type }: { type: keyof typeof libraryCounts }) {
  const [query, setQuery] = useState("")
  const [preview, setPreview] = useState<number | null>(null)
  const [status, setStatus] = useState("")
  const docs = Array.from({ length: libraryCounts[type] }, (_, index) => ({
    title:
      index === 0 && type === "decrees"
        ? "DECREE ON DEPOSIT PROTECTION 329"
        : `${libraryTitles[type]} — ເອກະສານ ${String(index + 1).padStart(2, "0")}`,
    index,
  })).filter((doc) => doc.title.toLowerCase().includes(query.toLowerCase()))
  useEffect(() => {
    if (preview === null) return
    const close = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") setPreview(null)
    }
    window.addEventListener("keydown", close)
    return () => window.removeEventListener("keydown", close)
  }, [preview])
  return (
    <>
      <PageTitle title={libraryTitles[type]} />
      <section className="section container">
        <div className="library-search">
          <label htmlFor="file-search">ຄົ້ນຫາເອກະສານ</label>
          <input
            id="file-search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search files..."
          />
        </div>
        <div className="library-layout">
          <aside className="category-tree">
            <h3>ໝວດໝູ່ເອກະສານ</h3>
            <button className="selected">▾ {libraryTitles[type]}</button>
            <button>› ປີ 2026</button>
            <button>› ປີ 2025</button>
            <button>› ເອກະສານເກົ່າ</button>
          </aside>
          <div>
            {status && (
              <div className="inline-status" role="status">
                {status}
              </div>
            )}
            <div className="document-grid">
              {docs.map((doc) => (
                <article className="document-card" key={doc.index}>
                  <div className="pdf-mark">PDF</div>
                  <div>
                    <h3>{doc.title}</h3>
                    <dl>
                      <div>
                        <dt>Size</dt>
                        <dd>Pending</dd>
                      </div>
                      <div>
                        <dt>Hits</dt>
                        <dd>—</dd>
                      </div>
                      <div>
                        <dt>Date added</dt>
                        <dd>Pending</dd>
                      </div>
                      <div>
                        <dt>Date modified</dt>
                        <dd>Pending</dd>
                      </div>
                    </dl>
                    <div className="card-actions">
                      <button
                        onClick={() =>
                          setStatus(
                            "File asset pending — no download was started.",
                          )
                        }
                      >
                        ດາວໂຫຼດ
                      </button>
                      <button
                        className="secondary"
                        onClick={() => setPreview(doc.index)}
                      >
                        ເບິ່ງຕົວຢ່າງ
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
            {!docs.length && <PendingState title="ບໍ່ພົບເອກະສານ" />}
          </div>
        </div>
      </section>
      {preview !== null && (
        <div
          className="modal-backdrop"
          role="presentation"
          onMouseDown={() => setPreview(null)}
        >
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="preview-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="modal-head">
              <h2 id="preview-title">ຕົວຢ່າງເອກະສານ</h2>
              <button onClick={() => setPreview(null)} aria-label="ປິດ">
                ×
              </button>
            </div>
            <AssetPlaceholder
              id={`${type}.document-${preview + 1}.pdf-preview`}
              label="PDF preview"
              width={770}
              height={600}
              mobileWidth={358}
              mobileHeight={400}
            />
          </div>
        </div>
      )}
    </>
  )
}

function Bilateral() {
  return (
    <>
      <PageTitle title="ການຮ່ວມມືສອງຝ່າຍ" />
      <section className="section container editorial-feed bilateral-feed">
        {bilateralArticles.map((article, index) => (
          <article key={article.id}>
            <a href={index === 0 ? "/iadi-earc-aprc/" : article.url}>
            <AssetPlaceholder
              id={`bilateral.article-${index + 1}.photo`}
              label="Bilateral article photo"
              width={570}
              height={380}
              mobileWidth={358}
              mobileHeight={239}
            />
            </a>
            <div>
              <h2><a href={index === 0 ? "/iadi-earc-aprc/" : article.url}>{article.title}</a></h2>
              <time>{article.date}</time>
              <p>{article.excerpt.split("ອ່ານເພີ່ມເຕີມ")[0].trim()}</p>
              <a className="button primary" href={index === 0 ? "/iadi-earc-aprc/" : article.url}>ອ່ານເພີ່ມເຕີມ</a>
            </div>
          </article>
        ))}
        <nav className="bilateral-pagination" aria-label="ການແບ່ງໜ້າໂພສ">
          <span aria-current="page">1</span><span>2</span><span>...</span><span>4</span><span aria-hidden="true">»</span>
        </nav>
      </section>
    </>
  )
}

function CooperationArchive() {
  return (
    <>
      <PageTitle title="ການຮ່ວມມືສາກົນ" />
      <section className="section container content-sidebar cooperation-archive">
        <div>
          <div className="cooperation-list">
            {bilateralArticles.slice(0, 4).map((article, index) => (
              <article key={article.id}>
                <div className="cooperation-image">
                  <img src={homeAssets[`bilateral.article-${index + 1}.photo`]?.src} alt={article.title} />
                  <time>{article.date}</time>
                </div>
                <div>
                  <h2>{article.title}</h2>
                  <p>{index === 0 ? `${article.excerpt.split("ອ່ານເພີ່ມເຕີມ")[0].trim().slice(0, 200)}…` : "..."}</p>
                  <span className="button primary">ອ່ານເພີ່ມເຕີມ</span>
                </div>
              </article>
            ))}
          </div>
          <nav className="bilateral-pagination" aria-label="ການແບ່ງໜ້າໂພສ">
            <span aria-current="page">1</span><span>2</span><span>...</span><span>5</span><span aria-hidden="true">»</span>
          </nav>
        </div>
        <CooperationSidebar />
      </section>
    </>
  )
}

function CooperationSidebar() {
  return (
        <aside className="cooperation-sidebar">
          <div className="cooperation-widget"><SearchBox /></div>
          {[5, 3].map((count) => (
            <div key={count}>
            {count === 3 && <div className="cooperation-widget"><SearchBox /></div>}
            <div className="cooperation-widget">
              <h3>ຂ່າວສານ ອື່ນໆ</h3>
              {newsData.slice(0, count).map((news, index) => (
                <div className="cooperation-recent" key={news.slug}>
                  <img src={homeAssets[`sidebar.news-${index + 1}`]?.src} alt="" />
                  <strong>{news.title}</strong>
                  <time>◷ {news.date}</time>
                </div>
              ))}
            </div>
            </div>
          ))}
          <div className="cooperation-widget cooperation-partners">
            <h3>ໜ້າເຊື່ອມຕໍ່ເວັບຕ່າງໆ</h3>
            {[1, 2, 3, 4, 5].map((number) => <img key={number} src={homeAssets[`sidebar.partner-${number}`]?.src} alt={homeAssets[`sidebar.partner-${number}`]?.alt} />)}
          </div>
        </aside>
  )
}

function IadiArticle() {
  const [selectedImage, setSelectedImage] = useState<number | null>(null)
  useEffect(() => {
    if (selectedImage === null) return
    const close = (event: globalThis.KeyboardEvent) => { if (event.key === "Escape") setSelectedImage(null) }
    window.addEventListener("keydown", close)
    return () => window.removeEventListener("keydown", close)
  }, [selectedImage])
  return (
    <>
      <PageTitle title={bilateralArticles[0].title} />
      <section className="section container content-sidebar cooperation-archive iadi-page">
        <article>
          <div className="iadi-gallery">
            {[1, 2, 3, 4].map((number) => (
              <button key={number} onClick={() => setSelectedImage(number)} aria-label={`ເບິ່ງຮູບ ${number}`}>
                <img src={`/assets/dpo/iadi-${number}.jpeg`} alt={`${bilateralArticles[0].title} ${number}`} />
              </button>
            ))}
          </div>
          <div className="iadi-copy">{iadiParagraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>
          <div className="iadi-categories"><Link to={paths.cooperationCategory}>ການຮ່ວມມືສາກົນ</Link><Link to={paths.news}>ຂ່າວສານ</Link></div>
          <h2 className="iadi-related-title">ຂ່າວທີ່ກ່ຽວຂ້ອງ...</h2>
          <div className="iadi-related">{newsData.slice(0, 3).map((news, index) => (
            <Link key={news.slug} to={`/${news.slug}/`}>
              <img src={homeAssets[`home.news-${index + 1}`]?.src} alt="" />
              <strong>{news.title}</strong><span>ຂ່າວສານ</span>
            </Link>
          ))}</div>
        </article>
        <CooperationSidebar />
      </section>
      {selectedImage !== null && <div className="iadi-lightbox" role="dialog" aria-modal="true" aria-label="ຮູບພາບ" onClick={() => setSelectedImage(null)}><button autoFocus onClick={() => setSelectedImage(null)} aria-label="ປິດ">×</button><img src={`/assets/dpo/iadi-${selectedImage}.jpeg`} alt={bilateralArticles[0].title} /></div>}
    </>
  )
}

function NewsSidebar() {
  return (
    <aside className="news-sidebar">
      <SearchBox />
      <h3>ຂ່າວຫຼ້າສຸດ</h3>
      {newsItems.slice(0, 4).map((title, index) => (
        <Link
          className="recent-item"
          to={index === 0 ? "/dporaw/" : paths.news}
          key={title}
        >
          <AssetPlaceholder
            id={`sidebar.news-${index + 1}`}
            label="Sidebar thumbnail"
            width={80}
            height={80}
            mobileWidth={64}
            mobileHeight={64}
          />
          <span>{title}</span>
        </Link>
      ))}
      <AssetPlaceholder
        id="sidebar.partner-1"
        label="Partner logo"
        width={240}
        height={100}
      />
      <AssetPlaceholder
        id="sidebar.partner-2"
        label="Partner logo"
        width={240}
        height={100}
      />
    </aside>
  )
}

function NewsArchive({ page = 1 }: { page?: number }) {
  return (
    <>
      <PageTitle title="ຂ່າວສານ" />
      <section className="section container content-sidebar cooperation-archive news-archive-page">
        <div>
          {page === 1 ? (
            <div className="archive-list">
              {newsData.slice(0, 5).map((news, index) => (
                <article key={news.slug}>
                  <Link to={`/${news.slug}/`} className="news-archive-image">
                    <img src={`/assets/dpo/news-archive-${index + 1}.jpg`} alt={news.title} />
                  </Link>
                  <div>
                    <h2><Link to={`/${news.slug}/`}>{news.title}</Link></h2>
                    <time>{news.date}</time>
                    <p>{newsExcerpts[index]}</p>
                    <Link className="button primary" to={`/${news.slug}/`}>
                      ອ່ານເພີ່ມເຕີມ
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <PendingState title={`Archive content pending — page ${page}`} />
          )}
          <nav className="pagination" aria-label="ໜ້າຂ່າວ">
            {[1, 2].map((number) => (
              <Link
                className={page === number ? "active" : ""}
                to={number === 1 ? paths.news : `${paths.news}page/${number}/`}
                key={number}
              >
                {number}
              </Link>
            ))}
            <span>…</span>
            <Link
              className={page === 29 ? "active" : ""}
              to={`${paths.news}page/29/`}
            >
              29
            </Link>
            <Link to={`${paths.news}page/${Math.min(page + 1, 29)}/`} aria-label="ໜ້າຖັດໄປ">»</Link>
          </nav>
        </div>
        <CooperationSidebar />
      </section>
    </>
  )
}

function NewsArticle({ slug }: { slug: string }) {
  const main = slug === "dporaw"
  return (
    <>
      <PageTitle title={main ? newsItems[0] : "ຂ່າວສານ"} />
      <section className="section container content-sidebar">
        <article className="detail-article">
          <p className="article-meta">05 / 11 / 2026 · ອົງການປົກປ້ອງເງິນຝາກ</p>
          <AssetPlaceholder
            id={`article.${slug}.photo-1`}
            label="Article photo"
            width={770}
            height={513}
            mobileWidth={358}
            mobileHeight={239}
          />
          <p>
            {main
              ? "ໂຄງສ້າງບົດຄວາມລາຍລະອຽດຕາມໜ້າຂ່າວຕົ້ນສະບັບ. ຂໍ້ຄວາມສະບັບເຕັມຈະຖືກນຳເຂົ້າຫຼັງຈາກຢືນຢັນເນື້ອຫາທາງການ."
              : "Article content pending. This discovered route has a complete detail-page structure, but no verified article dataset was supplied."}
          </p>
          <AssetPlaceholder
            id={`article.${slug}.photo-2`}
            label="Article supporting photo"
            width={770}
            height={513}
            mobileWidth={358}
            mobileHeight={239}
          />
          <div className="article-end">
            <span>ແບ່ງປັນ:</span>
            <button>Facebook</button>
            <button>ສຳເນົາລິ້ງ</button>
          </div>
        </article>
        <NewsSidebar />
      </section>
    </>
  )
}

function PhoneLink({ className, label }: { className: string; label: string }) {
  const ref = useRef<HTMLAnchorElement>(null)
  useGSAP(() => {
    const link = ref.current
    if (!link) return
    const overlay = link.querySelector(".phone-hover")
    const text = link.querySelector(".phone-label")
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)")
    const animation = gsap.timeline({ paused: true })
      .to(overlay, { opacity: 1, duration: 0.4, ease: "power2.inOut" })
      .to(text, { letterSpacing: "0.08em", duration: 0.4, ease: "power2.out" }, 0)
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
  return <a ref={ref} className={`${className} animated-phone`} href="tel:+85621330005"><span className="phone-hover" aria-hidden="true" /><span className="phone-content"><FontAwesomeIcon icon={faPhoneVolume} aria-hidden="true" /><span className="phone-label">{label} +85621330005</span></span></a>
}

function Contact() {
  const [status, setStatus] = useState("")
  return (
    <div className="contact-page">
      <PageTitle title="ຕິດຕໍ່" />
      <section className="section container">
        <div className="contact-cards">
          <div className="contact-item"><FontAwesomeIcon icon={faEnvelope} aria-hidden="true" /><div><b>ອີເມວ</b><a href="mailto:info@dpo.gov.la">info@dpo.gov.la</a></div></div>
          <div className="contact-item"><FontAwesomeIcon icon={faPhoneVolume} aria-hidden="true" /><div><b>ເບີໂທ</b><a href="tel:+85621330005">+85621-330005</a></div></div>
          <div className="contact-item"><FontAwesomeIcon icon={faLocationDot} aria-hidden="true" /><div><b>ທີ່ຢູ່</b><a className="contact-address" href="https://maps.google.com/?q=Deposit+Protection+Office+Lao+PDR" target="_blank" rel="noreferrer">ຊັ້ນ 4 ຕຶກສຳນັກງານ ຄະນະກຳມະການຄຸ້ມຄອງຫຼັກຊັບ, ຖະໜົນໄກສອນພົມວິຫານ, ບ້ານໂພນສະອາດ, ເມືອງໄຊເສດຖາ, ນະຄອນຫຼວງວຽງຈັນ, ສປປ ລາວ.</a></div></div>
        </div>
        <div className="contact-grid">
          <div>
            <h2>ກາລຸ​ນາ​ໃຫ້​ຄຳຄິດເຫັນ​ໃນ​ຟອມລຸ່ມ​ນີ້</h2>
            <form className="inquiry-form" onSubmit={(event) => { event.preventDefault(); setStatus("ຟອມນີ້ຍັງບໍ່ສາມາດສົ່ງຂໍ້ຄວາມໄດ້. ກະລຸນາຕິດຕໍ່ຜ່ານອີເມວ info@dpo.gov.la") }}>
              <label>ຊື່ (*)<input name="name" required /></label>
              <label>ອີເມວ (*)<input name="email" type="email" required /></label>
              <label>ເລື່ອງ<input name="subject" /></label>
              <label>ຄຳຖາມ/ຄວາມຄິດເຫັນ<textarea name="message" rows={5} /></label>
              <button className="button primary" type="submit">ສົ່ງ</button>
              {status && <p className="contact-status" role="status">{status}</p>}
            </form>
          </div>
          <iframe className="contact-map" src={homeAssets["contact.map"]?.src} title="Deposit Protection Office map" loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen />
        </div>
        <div className="qr-wrap"><h2>QR CODE MAPS</h2><a href="https://maps.google.com/?q=Deposit+Protection+Office+Lao+PDR" target="_blank" rel="noreferrer"><img src="/assets/dpo/contact-qr.png" width="202" height="202" alt="QR code ແຜນທີ່ສຳນັກງານປົກປ້ອງເງິນຝາກ" /></a></div>
        <PhoneLink className="contact-phone" label="ໂທ:" />
      </section>
    </div>
  )
}

function FAQItem({ item, index }: { item: (typeof faqData)[number]; index: number }) {
  const [open, setOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  useGSAP(() => {
    if (!panelRef.current) return
    gsap.to(panelRef.current, {
      height: open ? "auto" : 0,
      duration: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 0.4,
      ease: "power2.inOut",
      overwrite: "auto",
    })
  }, { dependencies: [open] })
  const memberLink = "ລາຍຊື່ສະມາຊິກ ສປງ ສະບັບປັບປຸງ ລ່າສຸດ"
  return <div className={`faq-item${open ? " is-open" : ""}`}>
    <button type="button" aria-expanded={open} aria-controls={`faq-answer-${index}`} onClick={() => setOpen(!open)}>
      {item.question}<FontAwesomeIcon icon={faChevronDown} aria-hidden="true" />
    </button>
    <div ref={panelRef} id={`faq-answer-${index}`} className="faq-panel" aria-hidden={!open} inert={!open}>
      <div className="faq-answer">{item.answer.map((part, partIndex) => {
        const [before, after] = part.text.split(memberLink)
        const content = after === undefined ? part.text : <>{before}<a href="https://bit.ly/3ub2Nve" target="_blank" rel="noreferrer">{memberLink}</a>{after}</>
        return part.type === "li" ? <div className="faq-list-answer" key={partIndex}>• {content}</div> : <p key={partIndex}>{content}</p>
      })}</div>
    </div>
  </div>
}

function FAQ() {
  const [status, setStatus] = useState("")
  return (
    <div className="faq-page">
      <PageTitle title="ຄຳຖາມທີ່ພົບເລື້ອຍ" />
      <section className="section container">
        <h2 className="faq-hero-title">ຫາກທ່ານມີ ຄຳຖາມ ?</h2>
        <PhoneLink className="faq-phone" label="ເບີໂທ:" />
        <div className="faq-layout">
          <div>
            <h2 className="faq-heading"><FontAwesomeIcon icon={faCircleQuestion} aria-hidden="true" />ຄໍາຖາມທີ່ພົບເລື້ອຍ</h2>
            <div className="faq-list">{faqData.map((item, index) => <FAQItem key={item.question} item={item} index={index} />)}</div>
          </div>
          <div>
            <h2 className="faq-heading"><FontAwesomeIcon icon={faPenToSquare} aria-hidden="true" />ສອບຖາມພວກເຮົາ</h2>
            <form className="faq-inquiry" onSubmit={(event) => { event.preventDefault(); setStatus("ຟອມນີ້ຍັງບໍ່ສາມາດສົ່ງຂໍ້ຄວາມໄດ້. ກະລຸນາຕິດຕໍ່ info@dpo.gov.la") }}>
              <input name="name" aria-label="ຊື່" placeholder="ຊື່ (***)" required />
              <input name="email" type="email" aria-label="ອີເມວ" placeholder="ອີເມວ (***)" required />
              <input name="subject" aria-label="ຫົວຂໍ້" placeholder="ຫົວຂໍ້" />
              <textarea name="message" aria-label="ຄວາມຄິດເຫັນ" placeholder="ຄວາມຄິດເຫັນ" rows={10} />
              <button type="submit">ສົ່ງ</button>
              {status && <p role="status">{status}</p>}
            </form>
          </div>
        </div>
      </section>
    </div>
  )
}

function Connections() {
  return <>
    <PageTitle title="ເຊື່ອມຕໍ່" />
    <section className="section container connections-page">
      <h2>ໜ້າເຊຶ່ອມຕໍ່ເວັບໄຊພາກສ່ວນລັດຖະບານ ແລະ ສາກົນ</h2>
      <div className="connections-grid">{partners.map((partner) => {
        const image = homeAssets[`connections.partner-${partner.id}.logo`]
        return <a className="connection-card" key={partner.id} href={partner.url} target="_blank" rel="noopener noreferrer">
          <img src={image?.src} alt={partner.text[0]} loading="lazy" />
          <div className="connection-copy"><hr /><h3>{partner.text[0]}</h3>{partner.text.slice(1).map((line, index) => {
            const colon = line.indexOf(":")
            return <p key={index}>{colon >= 0 ? <><strong>{line.slice(0, colon + 1)}</strong> {line.slice(colon + 1)}</> : line}</p>
          })}</div>
        </a>
      })}</div>
    </section>
  </>
}

function PendingState({ title, text }: {
  title: string
  text?: string
}) {
  return (
    <div className="pending-state">
      <span>CONTENT STATUS</span>
      <h2>{title}</h2>
      <p>{text ?? "ໂຄງສ້າງໜ້ານີ້ສຳເລັດແລ້ວ. ເນື້ອຫາທາງການຍັງລໍຖ້າການຢືນຢັນ."}</p>
    </div>
  )
}

function SearchResults() {
  const query = new URLSearchParams(window.location.search).get("q") ?? ""
  return (
    <>
      <PageTitle title="ຜົນການຄົ້ນຫາ" />
      <section className="section container narrow">
        <SearchBox />
        <PendingState
          title={query ? `ບໍ່ພົບຜົນສຳລັບ “${query}”` : "ປ້ອນຄຳຄົ້ນຫາ"}
          text="Search structure is active. No complete searchable content index is available at this stage."
        />
      </section>
    </>
  )
}

function NotFound({ legacy = false }: { legacy?: boolean }) {
  return (
    <>
      <PageTitle title="ບໍ່ພົບໜ້າ" />
      <section className="not-found container">
        <strong>404</strong>
        <h2>{legacy ? "Legacy page is unavailable" : "Page not found"}</h2>
        <p>
          {legacy
            ? "The observed ?page_id=1341 address returned 404. Use the canonical organization chart route below."
            : "The requested route is not part of the discovered public site structure."}
        </p>
        <SearchBox />
        <Link
          className="button primary"
          to={legacy ? "/dpo-organization-chart/" : "/"}
        >
          {legacy ? "Open canonical organization chart" : "ກັບໜ້າຫຼັກ"}
        </Link>
      </section>
    </>
  )
}

function resolvePage(path: string) {
  if (window.location.search.includes("page_id=1341"))
    return <NotFound legacy />
  if (path === "/") return <Home />
  if (path === paths.duties) return <InstitutionalPage type="duties" />
  if (path === paths.history) return <InstitutionalPage type="history" />
  if (path === paths.about) return <InstitutionalPage type="about" />
  if (path === "/dpo_bod/") return <OrganizationPage type="board" />
  if (path === paths.party) return <OrganizationPage type="party" />
  if (path === "/dpo-organization-chart/")
    return <OrganizationPage type="state" />
  const legal = (["decrees", "decisions", "notices", "forms", "guidance"] as const).find((type) => paths[type] === path)
  if (legal) return <DecreesPage key={legal} type={legal} />
  if (path === "/fsnp/") return <DecreesPage key="fsnp" type="fsnp" />
  if (path === paths.information) return <DecreesPage key="information" type="information" />
  const libraries: [string, keyof typeof libraryCounts][] = []
  const library = libraries.find(([route]) => path === route)
  if (library) return <DocumentLibrary type={library[1]} />
  if (path === paths.bilateral) return <Bilateral />
  if (path === "/iadi-earc-aprc/") return <IadiArticle />
  if (path === paths.cooperationCategory) return <CooperationArchive />
  if (path === paths.international)
    return (
      <>
        <PageTitle title="ການເຄື່ອນໄຫວວຽກງານຮ່ວມມືສາກົນ" />
        <section className="section container">
        </section>
      </>
    )
  if (path === paths.news) return <NewsArchive />
  const archiveMatch = path.match(/\/ຂ່າວສານ\/page\/(\d+)\/?$/)
  if (archiveMatch) return <NewsArchive page={Number(archiveMatch[1])} />
  if (path === paths.contact) return <Contact />
  if (path === paths.faq) return <FAQ />
  if (path === paths.connections) return <Connections />
  if (path === "/en/")
    return (
      <>
        <PageTitle title="English" />
        <section className="section container">
          <PendingState
            title="503 — English version unavailable"
            text="The source English route was observed returning Service Unavailable. Translation coverage cannot be inferred."
          />
        </section>
      </>
    )
  const articleSlugs = [
    "dporaw",
    "dpoxdiv",
    "anv27year",
    "kdicglobaltrainingprogram",
    "laogoldfestival2026",
    "dponewlaw",
  ]
  const slug = articleSlugs.find((item) => path === `/${item}/`)
  if (slug) return <NewsArticle slug={slug} />
  if (path === "/search/") return <SearchResults />
  return <NotFound />
}

function SocialRail() {
  const rail = useRef<HTMLDivElement>(null)
  const [collapsed, setCollapsed] = useState(false)
  const { contextSafe } = useGSAP({ scope: rail })
  const expand = contextSafe((link: HTMLAnchorElement, open: boolean) => {
    gsap.to(link.querySelector(".social-label"), {
      xPercent: open ? -100 : 0,
      autoAlpha: open ? 1 : 0,
      duration: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? 0
        : 0.25,
      ease: "power2.out",
      overwrite: "auto",
    })
  })
  return (
    <div
      ref={rail}
      className={`social-rail ${collapsed ? "collapsed" : ""}`}
      aria-label="Social links"
    >
      <button
        aria-label={collapsed ? "Expand social links" : "Collapse social links"}
        aria-expanded={!collapsed}
        onClick={() => setCollapsed(!collapsed)}
      >
        <FontAwesomeIcon icon={faArrowRight} />
      </button>
      {[
        {
          label: "DPO LAOS",
          href: "https://www.facebook.com/dpolaos",
          icon: faFacebookF,
        },
        {
          label: "YouTube",
          href: "https://www.youtube.com/@dpolaos",
          icon: faYoutube,
        },
      ].map((item) => (
        <a
          key={item.label}
          href={item.href}
          target="_blank"
          rel="noreferrer"
          aria-label={item.label}
          onMouseEnter={(e) => expand(e.currentTarget, true)}
          onMouseLeave={(e) => expand(e.currentTarget, false)}
          onFocus={(e) => expand(e.currentTarget, true)}
          onBlur={(e) => expand(e.currentTarget, false)}
        >
          <span className="social-label" aria-hidden="true">
            {item.label}
          </span>
          <FontAwesomeIcon icon={item.icon} />
        </a>
      ))}
    </div>
  )
}

export default function App() {
  const [location, setLocation] = useState(() => ({
    path: decodeURI(window.location.pathname),
    search: window.location.search,
  }))
  useEffect(() => {
    const update = () =>
      setLocation({
        path: decodeURI(window.location.pathname),
        search: window.location.search,
      })
    window.addEventListener("popstate", update)
    return () => window.removeEventListener("popstate", update)
  }, [])
  return (
    <>
      <Header path={location.path} />
      <main id="main-content">{resolvePage(location.path)}</main>
      <Footer />
      <SocialRail />
    </>
  )
}
