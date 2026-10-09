import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import heroGraphic from './assets/hero.png'
import {
  ArrowRight,
  ArrowUpRight,
  Download,
  GitBranch,
  Globe,
  Mail,
  Menu,
  MoonStar,
  SunMedium,
  X,
} from 'lucide-react'

const createMotionSettings = (speed) => ({
  hidden: { opacity: 0, y: 32, scale: 0.98 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.7 / speed, ease: [0.22, 1, 0.36, 1] } },
})

const createStaggerContainer = (speed) => ({
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12 / speed, delayChildren: 0.08 / speed },
  },
})

const createFadeInUp = (speed) => ({
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.56 / speed, ease: [0.22, 1, 0.36, 1] } },
})

const MotionScopeContext = createContext({ enabled: true, group: 'content', scope: 'all' })

const useMotionLibrary = () => {
  const [motionLibrary, setMotionLibrary] = useState(null)

  useEffect(() => {
    let isMounted = true

    import('framer-motion')
      .then((module) => {
        if (isMounted) setMotionLibrary(module)
      })
      .catch(() => {
        if (isMounted) setMotionLibrary({ motion: null, AnimatePresence: ({ children }) => <>{children}</> })
      })

    return () => {
      isMounted = false
    }
  }, [])

  return motionLibrary
}

const MotionSection = ({ children, motionEnabled = true, activeMotionScope = 'all', initial, animate, whileInView, viewport, variants, ...props }) => {
  const motionLibrary = useMotionLibrary()
  const parentMotion = useContext(MotionScopeContext)
  const Component = motionLibrary?.motion?.section
  const motionGroup = props.className?.split(/\s+/).some((className) => className.includes('hero')) ? 'hero' : 'content'
  const scopeEnabled = activeMotionScope === 'all' || activeMotionScope === motionGroup
  const shouldAnimate = motionEnabled && parentMotion.enabled && scopeEnabled
  const childMotion = {
    enabled: motionEnabled && parentMotion.enabled,
    group: motionGroup,
    scope: activeMotionScope,
  }

  if (!Component) {
    return (
      <section
        {...props}
        data-motion-enabled={motionEnabled ? 'true' : 'false'}
        data-motion-group={motionGroup}
        data-motion-scope-active={shouldAnimate ? 'true' : 'false'}
      >
        <MotionScopeContext.Provider value={childMotion}>{children}</MotionScopeContext.Provider>
      </section>
    )
  }

  return (
    <Component
      {...props}
      data-motion-enabled={motionEnabled ? 'true' : 'false'}
      data-motion-group={motionGroup}
      data-motion-scope-active={shouldAnimate ? 'true' : 'false'}
      initial={shouldAnimate ? initial : false}
      animate={shouldAnimate ? animate : undefined}
      whileInView={shouldAnimate ? whileInView : undefined}
      viewport={viewport}
      variants={shouldAnimate ? variants : undefined}
    >
      <MotionScopeContext.Provider value={childMotion}>{children}</MotionScopeContext.Provider>
    </Component>
  )
}

const MotionDiv = ({ children, motionScopeGroup, ...props }) => {
  const motionLibrary = useMotionLibrary()
  const parentMotion = useContext(MotionScopeContext)
  const { initial, animate, whileInView, viewport, variants, transition, ...elementProps } = props
  const Component = motionLibrary?.motion?.div
  const scopeEnabled = parentMotion.enabled
    && (parentMotion.scope === 'all' || parentMotion.scope === (motionScopeGroup || parentMotion.group))

  if (!Component) {
    return <div {...elementProps}>{children}</div>
  }

  return (
    <Component
      {...elementProps}
      initial={scopeEnabled ? initial : false}
      animate={scopeEnabled ? animate : undefined}
      whileInView={scopeEnabled ? whileInView : undefined}
      viewport={viewport}
      variants={scopeEnabled ? variants : undefined}
      transition={scopeEnabled ? transition : undefined}
    >
      {children}
    </Component>
  )
}

const MotionArticle = ({ children, motionScopeGroup, ...props }) => {
  const motionLibrary = useMotionLibrary()
  const parentMotion = useContext(MotionScopeContext)
  const { initial, animate, whileInView, viewport, variants, transition, ...elementProps } = props
  const Component = motionLibrary?.motion?.article
  const scopeEnabled = parentMotion.enabled
    && (parentMotion.scope === 'all' || parentMotion.scope === (motionScopeGroup || parentMotion.group))

  if (!Component) {
    return <article {...elementProps}>{children}</article>
  }

  return (
    <Component
      {...elementProps}
      initial={scopeEnabled ? initial : false}
      animate={scopeEnabled ? animate : undefined}
      whileInView={scopeEnabled ? whileInView : undefined}
      viewport={viewport}
      variants={scopeEnabled ? variants : undefined}
      transition={scopeEnabled ? transition : undefined}
    >
      {children}
    </Component>
  )
}

const StaticPresence = ({ children }) => <>{children}</>

const AnimatedPresence = ({ children, ...props }) => {
  const motionLibrary = useMotionLibrary()
  const Component = motionLibrary?.AnimatePresence || StaticPresence

  return <Component {...props}>{children}</Component>
}

const ADMIN_CREDENTIALS = {
  username: import.meta.env.VITE_ADMIN_USERNAME || 'yadavabhinav551@gmail.com',
  password: import.meta.env.VITE_ADMIN_PASSWORD || '12345678',
}
const ADMIN_AUTH_STORAGE_KEY = 'portfolio-admin-auth-v2'
const DEFAULT_ADMIN_ACCESS_SETTINGS = {
  logoClickCount: 5,
  logoClickWindowSeconds: 5,
  unlockPattern: [2, 6, 4],
}
const DEFAULT_HOMEPAGE_SETTINGS = {
  activeDesign: 'placement-pro',
}
const HOMEPAGE_DESIGNS = [
  {
    id: 'placement-pro',
    name: 'Placement Pro',
    description: 'A recruiter-ready CSE engineer homepage with biodata, skills, projects, and resume actions.',
    tone: 'Professional',
  },
  {
    id: 'academic-clean',
    name: 'Academic Clean',
    description: 'A clear profile-first layout for teachers, mentors, and college submissions.',
    tone: 'Academic',
  },
  {
    id: 'recruiter-brief',
    name: 'Recruiter Brief',
    description: 'A faster placement-facing version focused on quick scan, proof, and contact.',
    tone: 'Placement',
  },
  {
    id: 'resume-grid',
    name: 'Resume Grid',
    description: 'A structured biodata grid with compact facts and document-style sections.',
    tone: 'Biodata',
  },
  {
    id: 'cosmic-studio',
    name: 'Default',
    description: 'The previous animated portfolio homepage, preserved as the original default UI.',
    tone: 'Original',
  },
]
const PROFESSIONAL_HOMEPAGE_IDS = new Set(['placement-pro', 'academic-clean', 'recruiter-brief', 'resume-grid'])
const PORTFOLIO_STORAGE_KEY = 'portfolio-content-v1'
const DEFAULT_SUN_LINK = 'https://nineplanets.org/solar-system/'
const LEGACY_DEFAULT_PLANET_LINKS = {
  sun: 'https://science.nasa.gov/sun/',
  mercury: 'https://spaceinformer.com/planets-in-order-from-the-sun/',
  venus: 'https://spaceinformer.com/planets-in-order-from-the-sun/',
  earth: 'https://spaceinformer.com/planets-in-order-from-the-sun/',
  mars: 'https://spaceinformer.com/planets-in-order-from-the-sun/',
  jupiter: 'https://spaceinformer.com/planets-in-order-from-the-sun/',
  saturn: 'https://spaceinformer.com/planets-in-order-from-the-sun/',
  uranus: 'https://spaceinformer.com/planets-in-order-from-the-sun/',
  neptune: 'https://spaceinformer.com/planets-in-order-from-the-sun/',
}
const SUN_DETAILS = {
  name: 'Sun',
  short: 'sun',
  isSun: true,
  image: '',
}
const SOLAR_SYSTEM_BODIES = [
  { name: 'Mercury', short: 'mercury', size: 13, readableOrbit: 38, distanceAu: 0.387, duration: 8, delay: 0, angle: 15, image: '/planets/mercury.svg', distanceFromSun: '57.9 million km', sourceUrl: 'https://nineplanets.org/mercury/' },
  { name: 'Venus', short: 'venus', size: 17, readableOrbit: 44, distanceAu: 0.723, duration: 11, delay: -1.4, angle: 120, image: '/planets/venus.svg', distanceFromSun: '108.2 million km', sourceUrl: 'https://nineplanets.org/venus/' },
  { name: 'Earth', short: 'earth', size: 18, readableOrbit: 50, distanceAu: 1, duration: 14, delay: -2.8, angle: 210, image: '/planets/earth.svg', distanceFromSun: '149.6 million km', sourceUrl: 'https://nineplanets.org/earth/' },
  { name: 'Mars', short: 'mars', size: 15, readableOrbit: 56, distanceAu: 1.524, duration: 18, delay: -4.2, angle: 300, image: '/planets/mars.svg', distanceFromSun: '227.9 million km', sourceUrl: 'https://nineplanets.org/mars/' },
  { name: 'Jupiter', short: 'jupiter', size: 27, readableOrbit: 62, distanceAu: 5.203, duration: 24, delay: -6.5, angle: 70, image: '/planets/jupiter.svg', distanceFromSun: '778.6 million km', sourceUrl: 'https://nineplanets.org/jupiter/' },
  { name: 'Saturn', short: 'saturn', size: 25, readableOrbit: 68, distanceAu: 9.537, duration: 30, delay: -9.2, angle: 170, image: '/planets/saturn.svg', distanceFromSun: '1.434 billion km', sourceUrl: 'https://nineplanets.org/saturn/' },
  { name: 'Uranus', short: 'uranus', size: 20, readableOrbit: 74, distanceAu: 19.191, duration: 38, delay: -12.5, angle: 330, image: '/planets/uranus.svg', distanceFromSun: '2.871 billion km', sourceUrl: 'https://nineplanets.org/uranus/' },
  { name: 'Neptune', short: 'neptune', size: 19, readableOrbit: 80, distanceAu: 30.07, duration: 48, delay: -15.5, angle: 246, image: '/planets/neptune.svg', distanceFromSun: '4.495 billion km', sourceUrl: 'https://nineplanets.org/neptune/' },
]
const DEFAULT_PLANET_LINKS = [
  { name: 'Sun', short: 'sun', url: DEFAULT_SUN_LINK },
  ...SOLAR_SYSTEM_BODIES.map(({ name, short, sourceUrl }) => ({ name, short, url: sourceUrl })),
]
const normalizePlanetLinks = (links) => (Array.isArray(links) ? links : DEFAULT_PLANET_LINKS).map((link) => {
  const defaultLink = DEFAULT_PLANET_LINKS.find((item) => item.short === link.short)
  return defaultLink && link.url === LEGACY_DEFAULT_PLANET_LINKS[link.short]
    ? { ...link, url: defaultLink.url }
    : link
})
const formatDistanceFromEarth = (distanceAu) => {
  const distanceKm = Math.abs(distanceAu - 1) * 149.6e6
  if (distanceKm === 0) return '0 km (Earth)'
  if (distanceKm >= 1e9) return `~${(distanceKm / 1e9).toFixed(2)} billion km`
  return `~${(distanceKm / 1e6).toFixed(1)} million km`
}
const DEFAULT_ABOUT = {
  heading: 'Building useful digital experiences with clarity and craft.',
  biography: 'I am a Computer Science & Engineering diploma student focused on frontend development, product thinking, and building polished web experiences. I enjoy translating ideas into interfaces that are thoughtful, responsive, and genuinely useful.',
  homepageIntro: 'I design and build polished web experiences with React, clean interfaces, and product-minded thinking—from concept to launch-ready UI.',
  photo: '',
  facts: [
    { label: 'CURRENTLY STUDYING', value: 'Diploma in Computer Science & Engineering' },
    { label: 'YEAR', value: '2nd Year' },
    { label: 'FOCUS', value: 'Web Development' },
    { label: 'LOCATION', value: 'India' },
  ],
  colleges: [],
  webinars: [],
  certificates: [],
  images: [],
  links: [],
}
const ABOUT_COLLECTIONS = [
  { key: 'facts', title: 'Quick details', fields: [{ key: 'label', label: 'Label' }, { key: 'value', label: 'Detail' }] },
  { key: 'colleges', title: 'Colleges & education', fields: [{ key: 'title', label: 'College / institution' }, { key: 'program', label: 'Course / program' }, { key: 'dates', label: 'Dates' }, { key: 'location', label: 'Location' }, { key: 'description', label: 'Additional detail', multiline: true }, { key: 'image', label: 'College image URL', type: 'url', upload: true }, { key: 'url', label: 'College link', type: 'url' }] },
  { key: 'webinars', title: 'Webinars & events', fields: [{ key: 'title', label: 'Webinar / event title' }, { key: 'organizer', label: 'Organizer' }, { key: 'date', label: 'Date' }, { key: 'description', label: 'Details', multiline: true }, { key: 'image', label: 'Event image URL', type: 'url', upload: true }, { key: 'url', label: 'Recording / event link', type: 'url' }] },
  { key: 'certificates', title: 'Certificates', fields: [{ key: 'title', label: 'Certificate title' }, { key: 'issuer', label: 'Issuer' }, { key: 'date', label: 'Date' }, { key: 'credential', label: 'Credential ID' }, { key: 'image', label: 'Certificate image URL', type: 'url', upload: true }, { key: 'url', label: 'Verification link', type: 'url' }] },
  { key: 'images', title: 'About gallery images', fields: [{ key: 'label', label: 'Image caption' }, { key: 'url', label: 'Image URL', type: 'url', upload: true }] },
  { key: 'links', title: 'Additional links', fields: [{ key: 'label', label: 'Link label' }, { key: 'url', label: 'URL', type: 'url' }] },
]
const DEFAULT_CONTACT_LINKS = [
  { label: 'Email', type: 'email', value: 'abhinavyadav.contact@gmail.com' },
  { label: 'GitHub', type: 'github', value: 'https://github.com/abhinavpersonaldata' },
  { label: 'LinkedIn', type: 'linkedin', value: 'https://www.linkedin.com' },
]
const EFFECT_OPTIONS = [
  {
    id: 'aurora',
    name: 'Aurora Drift',
    description: 'Soft gradients and floating light trails.',
    accent: 'cyan',
  },
  {
    id: 'neon-glow',
    name: 'Neon Pulse',
    description: 'Bright glow, faster movement, and stronger focus.',
    accent: 'purple',
  },
  {
    id: 'glass',
    name: 'Glass Flow',
    description: 'Frosted panels with airy layered motion.',
    accent: 'lime',
  },
  {
    id: 'sunrise',
    name: 'Sunrise Bloom',
    description: 'Warm cinematic transitions with bloom highlights.',
    accent: 'amber',
  },
  {
    id: 'orbit',
    name: 'Orbit Lines',
    description: 'Orbital rings and spaced-out motion accents.',
    accent: 'pink',
  },
]
const MOTION_SCOPES = [
  { id: 'all', name: 'Full site', description: 'Apply motion across the entire portfolio.' },
  { id: 'hero', name: 'Hero only', description: 'Keep main hero energetic, reduce motion elsewhere.' },
  { id: 'content', name: 'Content blocks', description: 'Focus animation on major content sections.' },
  { id: 'cards', name: 'Cards & tiles', description: 'Give emphasis to project cards, gallery, and panels.' },
]
const MOTION_PRESETS = [
  { id: 'studio', name: 'Studio Default', description: 'Balanced motion for a premium portfolio.', effect: 'aurora', intensity: 72, scope: 'all' },
  { id: 'cinematic', name: 'Cinematic Glow', description: 'Rich contrast and warmer transitions.', effect: 'sunrise', intensity: 88, scope: 'content' },
  { id: 'neon', name: 'Neon Pulse', description: 'High-energy interface for a bold first impression.', effect: 'neon-glow', intensity: 94, scope: 'all' },
  { id: 'minimal', name: 'Minimal Glass', description: 'Subtle motion with a clean editorial finish.', effect: 'glass', intensity: 48, scope: 'cards' },
  { id: 'orbital', name: 'Orbital Drift', description: 'More spatial motion for concept and creative layouts.', effect: 'orbit', intensity: 78, scope: 'hero' },
]
const DEFAULT_VISUAL_SETTINGS = {
  visualEffect: 'aurora',
  visualIntensity: 72,
  visualScope: 'all',
}
const DEFAULT_SITE_MOTION_SETTINGS = {
  speed: 1,
  brightness: 100,
}
const DEFAULT_EDGE_ANIMATION_SETTINGS = {
  style: 'spectrum',
  speedSeconds: 8,
  color: '#62d0ff',
  scope: 'both',
}
const EDGE_ANIMATION_STYLES = [
  { id: 'spectrum', name: 'Spectrum', description: 'A bright multicolor trail.' },
  { id: 'single', name: 'Single colour', description: 'A clean trail in your chosen color.' },
  { id: 'aurora', name: 'Aurora', description: 'A softer blended color trail.' },
  { id: 'comet', name: 'Comet', description: 'A short, focused moving highlight.' },
]
const EDGE_COLOR_SWATCHES = ['#62d0ff', '#c8ff3d', '#ff8b67', '#af7bff']
const SECTION_MOTION_DEFAULTS = {
  hero: true,
  work: true,
  about: true,
  gallery: true,
  journey: true,
  toolkit: true,
  contact: true,
}
const CUSTOM_MOTION_THEMES_KEY = 'portfolio-custom-motion-themes-v1'
const BOOT_ANIMATION_STORAGE_KEY = 'portfolio-boot-animation-enabled-v1'
const isBootAnimationEnabled = () => {
  try {
    return localStorage.getItem(BOOT_ANIMATION_STORAGE_KEY) !== 'false'
  } catch {
    return true
  }
}
const createExperienceDraft = () => ({
  company: '', role: '', type: '', dates: '', location: '', description: '',
  achievements: '', image: '', images: '', links: '',
})
const createAchievementDraft = () => ({
  title: '', organization: '', date: '', description: '', image: '', images: '', links: '',
})

const API_BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')
const apiUrl = (path) => `${API_BASE_URL}${path}`
const wait = (duration) => new Promise((resolve) => setTimeout(resolve, duration))
const apiFetch = async (path, options) => {
  let lastError

  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      return await fetch(apiUrl(path), options)
    } catch (error) {
      lastError = error
      if (attempt < 2) {
        await wait(350)
      }
    }
  }

  throw lastError
}

function ProjectVideoPlayer({ src, poster, title, controls = false, detail = false }) {
  const videoRef = useRef(null)
  const [hasPlayableFrame, setHasPlayableFrame] = useState(false)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return undefined

    setHasPlayableFrame(false)

    if (!('IntersectionObserver' in window)) {
      video.play().catch(() => {})
      return undefined
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) video.play().catch(() => {})
      else video.pause()
    }, { threshold: 0.2, rootMargin: '80px 0px' })

    observer.observe(video)
    return () => {
      observer.disconnect()
      video.pause()
    }
  }, [src])

  return (
    <div className={`project-video-frame${detail ? ' project-video-frame-detail' : ''}`}>
      {poster ? (
        <img
          className={`project-video-poster${hasPlayableFrame ? ' is-hidden' : ''}`}
          src={poster}
          alt={`${title} preview`}
          loading="lazy"
          decoding="async"
        />
      ) : !hasPlayableFrame ? (
        <div className="project-video-placeholder"><span>{title}</span></div>
      ) : null}
      <video
        ref={videoRef}
        className={`project-video-element${hasPlayableFrame ? ' is-ready' : ''}`}
        src={src}
        poster={poster || undefined}
        muted
        loop
        autoPlay
        playsInline
        controls={controls}
        preload="metadata"
        onLoadedData={() => setHasPlayableFrame(true)}
        onError={() => setHasPlayableFrame(false)}
      />
    </div>
  )
}

const BOOT_CODE_LINES = [
  ['01', 'const', 'portfolio', ' = await initialize();'],
  ['02', 'import', ' motion', ' from "experience";'],
  ['03', 'render', '(<Canvas', ' theme="aurora" />);'],
  ['04', 'async', ' function', ' buildExperience() {'],
  ['05', '  await', ' loadProjects', '({ priority: "high" });'],
  ['06', '  return', ' createInterface', '();'],
  ['07', '}', '', ' // ready to explore'],
  ['08', 'system', ' .status', ' = "online";'],
]

function SiteBootLoader({ visible }) {
  const [isMounted, setIsMounted] = useState(true)

  useEffect(() => {
    if (visible) return undefined

    const timeoutId = window.setTimeout(() => setIsMounted(false), 360)
    return () => window.clearTimeout(timeoutId)
  }, [visible])

  if (!isMounted) return null

  return (
    <div className={`site-boot-loader${visible ? ' is-visible' : ' is-leaving'}`} role="status" aria-live="polite" aria-label="Loading portfolio">
      <div className="boot-loader-card">
        <div className="boot-loader-topline">
          <span className="boot-loader-brand"><span>AY</span> DIGITAL EXPERIENCE</span>
          <span className="boot-loader-live"><i /> SYSTEM ONLINE</span>
        </div>
        <div className="boot-loader-heading">
          <span className="boot-loader-kicker">PORTFOLIO / 2026</span>
          <h1>Building your<br /><span>next experience.</span></h1>
          <p>Initializing interface<span className="boot-loader-dots">...</span></p>
        </div>
        <div className="boot-code-window" aria-hidden="true">
          <div className="boot-code-toolbar"><span /><span /><span /><b>portfolio.init</b><i>JS</i></div>
          <div className="boot-code-stream">
            {[0, 1].map((copy) => (
              <div className="boot-code-copy" key={copy}>
                {BOOT_CODE_LINES.map(([number, keyword, name, rest]) => (
                  <div className="boot-code-line" key={`${copy}-${number}`}>
                    <span className="boot-code-number">{number}</span>
                    <span className="boot-code-keyword">{keyword}</span>
                    <span className="boot-code-name">{name}</span>
                    <span>{rest}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div className="boot-code-scanline" />
        </div>
        <div className="boot-loader-progress">
          <span><i /></span>
          <b>PREPARING YOUR VIEW</b>
          <small>PLEASE WAIT</small>
        </div>
        <div className="boot-loader-index"><span>DESIGN</span><i /><span>DEVELOP</span><i /><span>DELIVER</span></div>
      </div>
    </div>
  )
}

function startBootScrollTour(onComplete) {
  const root = document.documentElement
  const originalScrollBehavior = root.style.scrollBehavior
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if (prefersReducedMotion) {
    onComplete()
    return () => {}
  }

  root.style.scrollBehavior = 'auto'
  window.scrollTo(0, 0)
  const startedAt = performance.now()
  const duration = 2400
  let frameId = 0

  const animateScroll = (now) => {
    const progress = Math.min(1, (now - startedAt) / duration)
    const downProgress = Math.min(1, progress / 0.62)
    const upProgress = Math.max(0, (progress - 0.62) / 0.38)
    const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight)
    const easedDown = 1 - ((1 - downProgress) ** 3)
    const easedUp = 1 - ((1 - upProgress) ** 3)
    const scrollPosition = progress < 0.62
      ? maxScroll * easedDown
      : maxScroll * (1 - easedUp)

    window.scrollTo(0, scrollPosition)

    if (progress < 1) {
      frameId = window.requestAnimationFrame(animateScroll)
      return
    }

    window.scrollTo(0, 0)
    root.style.scrollBehavior = originalScrollBehavior
    onComplete()
  }

  frameId = window.requestAnimationFrame(animateScroll)

  return () => {
    window.cancelAnimationFrame(frameId)
    window.scrollTo(0, 0)
    root.style.scrollBehavior = originalScrollBehavior
  }
}

function App() {
  const [isBootAnimationEnabledState, setIsBootAnimationEnabledState] = useState(isBootAnimationEnabled)
  const [isSiteBooting, setIsSiteBooting] = useState(isBootAnimationEnabled)
  const bootAnimationEnabledAtMount = useRef(isBootAnimationEnabledState)
  const [theme, setTheme] = useState('dark')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [view, setView] = useState('home')
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(() => {
    try {
      return localStorage.getItem(ADMIN_AUTH_STORAGE_KEY) === 'true'
    } catch {
      return false
    }
  })
  const [loginForm, setLoginForm] = useState({ username: '', password: '' })
  const [loginError, setLoginError] = useState('')
  const [portfolio, setPortfolio] = useState({
    profile: { name: 'Abhinav Yadav', title: 'Frontend Developer • UI Engineer • CSE Diploma Student', location: 'India', email: 'abhinavyadav.contact@gmail.com', github: 'https://github.com/abhinavpersonaldata', linkedin: 'https://www.linkedin.com' },
    contactLinks: DEFAULT_CONTACT_LINKS,
    about: DEFAULT_ABOUT,
    navItems: ['WORK', 'ABOUT', 'JOURNEY', 'TOOLKIT', 'CONTACT'],
    projects: [],
    toolkitGroups: [],
    journeyEvents: [],
    educationEntries: [],
    experienceEntries: [],
    certificateEntries: [],
    achievements: [],
    galleryItems: [],
    adminAccessSettings: DEFAULT_ADMIN_ACCESS_SETTINGS,
    homepageSettings: DEFAULT_HOMEPAGE_SETTINGS,
    planetLinks: DEFAULT_PLANET_LINKS,
    edgeAnimationSettings: DEFAULT_EDGE_ANIMATION_SETTINGS,
    motionSettings: DEFAULT_SITE_MOTION_SETTINGS,
    ...DEFAULT_VISUAL_SETTINGS,
  })
  const [selectedProjectId, setSelectedProjectId] = useState('studio-grid')
  const [activePlanetShort, setActivePlanetShort] = useState(null)
  const [isPlanetDetailOpen, setIsPlanetDetailOpen] = useState(false)
  const [isPlanetLearnMoreOpen, setIsPlanetLearnMoreOpen] = useState(false)
  const planetDetailRef = useRef(null)
  const [formState, setFormState] = useState({ name: '', email: '', subject: '', message: '' })
  const [formStatus, setFormStatus] = useState('')
  const [projectFilter, setProjectFilter] = useState('all')
  const [projectSearch, setProjectSearch] = useState('')
  const [adminSection, setAdminSection] = useState('overview')
  const [showProjectForm, setShowProjectForm] = useState(false)
  const [editingProjectId, setEditingProjectId] = useState(null)
  const [mediaUploadStatus, setMediaUploadStatus] = useState('')
  const [projectDraft, setProjectDraft] = useState({
    title: '',
    category: 'Web Experience',
    description: '',
    tech: '',
    status: 'Draft',
    date: new Date().getFullYear().toString(),
    website: '',
    repository: '',
    image: '',
    video: '',
    problem: '',
    approach: '',
    features: '',
    role: '',
    challenges: '',
    solution: '',
    results: '',
    gallery: ['', '', '', '', '', ''],
  })
  const [showSkillForm, setShowSkillForm] = useState(false)
  const [editingSkillIndex, setEditingSkillIndex] = useState(null)
  const [skillDraft, setSkillDraft] = useState({ label: '', skills: '' })
  const [showJourneyForm, setShowJourneyForm] = useState(false)
  const [editingJourneyId, setEditingJourneyId] = useState(null)
  const [journeyDraft, setJourneyDraft] = useState({
    year: '',
    title: '',
    description: '',
    location: '',
    detail: '',
    image: '',
    images: '',
    links: '',
  })
  const [aboutDraft, setAboutDraft] = useState(DEFAULT_ABOUT)
  const [aboutSaveStatus, setAboutSaveStatus] = useState('')
  const [showExperienceForm, setShowExperienceForm] = useState(false)
  const [editingExperienceIndex, setEditingExperienceIndex] = useState(null)
  const [experienceDraft, setExperienceDraft] = useState(createExperienceDraft)
  const [experienceSaveStatus, setExperienceSaveStatus] = useState('')
  const [showAchievementForm, setShowAchievementForm] = useState(false)
  const [editingAchievementIndex, setEditingAchievementIndex] = useState(null)
  const [achievementDraft, setAchievementDraft] = useState(createAchievementDraft)
  const [achievementSaveStatus, setAchievementSaveStatus] = useState('')
  const [showGalleryForm, setShowGalleryForm] = useState(false)
  const [editingGalleryIndex, setEditingGalleryIndex] = useState(null)
  const [galleryDraft, setGalleryDraft] = useState({ label: '', url: '', tone: 'normal' })
  const [gallerySaveStatus, setGallerySaveStatus] = useState('')
  const [contactLinksDraft, setContactLinksDraft] = useState(DEFAULT_CONTACT_LINKS)
  const [contactSaveStatus, setContactSaveStatus] = useState('')
  const [planetLinksDraft, setPlanetLinksDraft] = useState(DEFAULT_PLANET_LINKS)
  const [planetLinksSaveStatus, setPlanetLinksSaveStatus] = useState('')
  const [customThemeName, setCustomThemeName] = useState('')
  const [customThemes, setCustomThemes] = useState(() => {
    try {
      const rawValue = localStorage.getItem(CUSTOM_MOTION_THEMES_KEY)
      return rawValue ? JSON.parse(rawValue) : []
    } catch {
      return []
    }
  })
  const [sectionMotion, setSectionMotion] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('portfolio-section-motion-v1') || '{}')
      return { ...SECTION_MOTION_DEFAULTS, ...saved }
    } catch {
      return SECTION_MOTION_DEFAULTS
    }
  })
  const [resumeStatus, setResumeStatus] = useState('Resume last updated 2 days ago')
  const [adminAccessDraft, setAdminAccessDraft] = useState(DEFAULT_ADMIN_ACCESS_SETTINGS)
  const [adminAccessSaveStatus, setAdminAccessSaveStatus] = useState('')
  const [homepageSaveStatus, setHomepageSaveStatus] = useState('')
  const [edgeAnimationSaveStatus, setEdgeAnimationSaveStatus] = useState('')
  const [motionSettingsSaveStatus, setMotionSettingsSaveStatus] = useState('')
  const [adminUnlockStage, setAdminUnlockStage] = useState('hidden')
  const [unlockProgress, setUnlockProgress] = useState(0)
  const logoClickCountRef = useRef(0)
  const logoClickWindowTimerRef = useRef(null)
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'Aarav Singh',
      email: 'aarav@example.com',
      subject: 'Design collaboration',
      message: 'We are looking for a frontend developer for a product concept and would love to connect.',
      read: false,
      date: 'Today',
    },
    {
      id: 2,
      sender: 'Priya Sharma',
      email: 'priya@example.com',
      subject: 'Internship inquiry',
      message: 'Hi, I am exploring internship opportunities and would like to discuss your web project experience.',
      read: true,
      date: 'Yesterday',
    },
  ])
  const motionSpeed = Number(portfolio.motionSettings?.speed) || DEFAULT_SITE_MOTION_SETTINGS.speed
  const motionSettings = useMemo(() => createMotionSettings(motionSpeed), [motionSpeed])
  const staggerContainer = useMemo(() => createStaggerContainer(motionSpeed), [motionSpeed])
  const fadeInUp = useMemo(() => createFadeInUp(motionSpeed), [motionSpeed])

  useEffect(() => {
    try {
      localStorage.setItem(ADMIN_AUTH_STORAGE_KEY, String(isAdminAuthenticated))
    } catch {
      // noop
    }
  }, [isAdminAuthenticated])

  useEffect(() => {
    const isCopyAllowedTarget = (target) => (
      target instanceof Element
      && Boolean(target.closest('input, textarea, select, [contenteditable="true"], [data-allow-copy="true"]'))
    )

    const preventPageCopy = (event) => {
      if (!isCopyAllowedTarget(event.target)) {
        event.preventDefault()
      }
    }

    const preventImageContextMenu = (event) => {
      if (event.target instanceof Element && event.target.closest('img, picture, video, canvas')) {
        event.preventDefault()
      }
    }

    const preventImageDrag = (event) => {
      if (event.target instanceof Element && event.target.closest('img, picture, video, canvas')) {
        event.preventDefault()
      }
    }

    document.addEventListener('copy', preventPageCopy, true)
    document.addEventListener('contextmenu', preventImageContextMenu, true)
    document.addEventListener('dragstart', preventImageDrag, true)

    return () => {
      document.removeEventListener('copy', preventPageCopy, true)
      document.removeEventListener('contextmenu', preventImageContextMenu, true)
      document.removeEventListener('dragstart', preventImageDrag, true)
    }
  }, [])

  useEffect(() => {
    const loadMessages = async () => {
      try {
        const response = await apiFetch('/api/messages')
        const result = await response.json()
        if (result.messages?.length) {
          setMessages(result.messages)
        }
      } catch (error) {
        console.error('Failed to load messages:', error)
      }
    }

    loadMessages()
  }, [])

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (!isPlanetDetailOpen) {
        return
      }

      const clickedInsidePanel = planetDetailRef.current?.contains(event.target)
      const clickedSolarBodyButton = event.target.closest('.orbit-planet, .solar-sun')

      if (!clickedInsidePanel && !clickedSolarBodyButton) {
        setIsPlanetDetailOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
    }
  }, [isPlanetDetailOpen])

  useEffect(() => {
    if (!isPlanetDetailOpen) {
      return undefined
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsPlanetDetailOpen(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isPlanetDetailOpen])

  const savePortfolioToStorage = (nextPortfolio) => {
    try {
      localStorage.setItem(PORTFOLIO_STORAGE_KEY, JSON.stringify(nextPortfolio))
    } catch {
      // noop
    }
  }

  const clearAdminLogoClickWindow = () => {
    if (logoClickWindowTimerRef.current) {
      clearTimeout(logoClickWindowTimerRef.current)
      logoClickWindowTimerRef.current = null
    }
    logoClickCountRef.current = 0
  }

  const openAdminUnlockScreen = () => {
    clearAdminLogoClickWindow()
    setUnlockProgress(0)
    setAdminUnlockStage('active')
  }

  const handleAdminLogoClick = () => {
    logoClickCountRef.current += 1

    if (logoClickCountRef.current === 1) {
      logoClickWindowTimerRef.current = setTimeout(
        clearAdminLogoClickWindow,
        Number(portfolio.adminAccessSettings?.logoClickWindowSeconds || DEFAULT_ADMIN_ACCESS_SETTINGS.logoClickWindowSeconds) * 1000,
      )
    }

    if (logoClickCountRef.current >= Number(portfolio.adminAccessSettings?.logoClickCount || DEFAULT_ADMIN_ACCESS_SETTINGS.logoClickCount)) {
      openAdminUnlockScreen()
    }
  }

  const handleAdminHotspotClick = (slotId) => {
    if (adminUnlockStage !== 'active') {
      return
    }

    const unlockPattern = portfolio.adminAccessSettings?.unlockPattern || DEFAULT_ADMIN_ACCESS_SETTINGS.unlockPattern
    const nextProgress = slotId === unlockPattern[unlockProgress]
      ? unlockProgress + 1
      : slotId === unlockPattern[0] ? 1 : 0

    setUnlockProgress(nextProgress)

    if (nextProgress === unlockPattern.length) {
      setUnlockProgress(0)
      setAdminUnlockStage('hidden')
      setView('admin-login')
    }
  }

  const updateAdminAccessDraft = (field, value) => {
    setAdminAccessDraft((current) => ({ ...current, [field]: value }))
  }

  const addAdminUnlockPoint = (point) => {
    setAdminAccessDraft((current) => current.unlockPattern.includes(point) || current.unlockPattern.length >= 9
      ? current
      : { ...current, unlockPattern: [...current.unlockPattern, point] })
  }

  const removeLastAdminUnlockPoint = () => {
    setAdminAccessDraft((current) => ({ ...current, unlockPattern: current.unlockPattern.slice(0, -1) }))
  }

  const resetAdminUnlockPattern = () => {
    setAdminAccessDraft((current) => ({ ...current, unlockPattern: [...DEFAULT_ADMIN_ACCESS_SETTINGS.unlockPattern] }))
  }

  const saveAdminAccessSettings = async () => {
    if (adminAccessDraft.unlockPattern.length < 3) {
      setAdminAccessSaveStatus('Choose at least three unlock points.')
      return
    }

    const settings = {
      logoClickCount: Math.min(20, Math.max(2, Number(adminAccessDraft.logoClickCount) || 5)),
      logoClickWindowSeconds: Math.min(30, Math.max(2, Number(adminAccessDraft.logoClickWindowSeconds) || 5)),
      unlockPattern: adminAccessDraft.unlockPattern,
    }
    const nextPortfolio = { ...portfolio, adminAccessSettings: settings }
    setPortfolio(nextPortfolio)
    setAdminAccessDraft(settings)
    savePortfolioToStorage(nextPortfolio)
    setAdminAccessSaveStatus('Saving settings...')

    try {
      const response = await apiFetch('/api/portfolio/admin-access', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings }),
      })
      if (!response.ok) {
        let result = {}
        try {
          result = await response.json()
        } catch {
          // The local API may still be running an older server build.
        }
        throw new Error(result.message || `Settings could not sync (HTTP ${response.status}).`)
      }
      const result = await response.json()
      const savedPortfolio = {
        ...nextPortfolio,
        adminAccessSettings: result.settings || settings,
        adminAccessSettingsStorage: result.storage || 'database',
      }
      setPortfolio(savedPortfolio)
      savePortfolioToStorage(savedPortfolio)
      setAdminAccessSaveStatus(result.storage === 'memory'
        ? 'Saved for this running server only. Reconnect MongoDB for permanent storage.'
        : 'Access settings saved.')
    } catch (error) {
      setAdminAccessSaveStatus(`${error.message || 'Settings could not be saved.'} They remain saved in this browser.`)
    }
  }

  const updateEdgeAnimationSetting = (field, value) => {
    setPortfolio((current) => {
      const nextPortfolio = {
        ...current,
        edgeAnimationSettings: { ...DEFAULT_EDGE_ANIMATION_SETTINGS, ...current.edgeAnimationSettings, [field]: value },
      }
      savePortfolioToStorage(nextPortfolio)
      return nextPortfolio
    })
    setEdgeAnimationSaveStatus('')
  }

  const saveEdgeAnimationSettings = async () => {
    const settings = {
      ...DEFAULT_EDGE_ANIMATION_SETTINGS,
      ...portfolio.edgeAnimationSettings,
      speedSeconds: Math.min(20, Math.max(2, Number(portfolio.edgeAnimationSettings?.speedSeconds) || 8)),
    }
    const nextPortfolio = { ...portfolio, edgeAnimationSettings: settings }
    setPortfolio(nextPortfolio)
    savePortfolioToStorage(nextPortfolio)
    setEdgeAnimationSaveStatus('Saving edge motion...')

    try {
      const response = await apiFetch('/api/portfolio/edge-animation', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings }),
      })
      if (!response.ok) {
        let result = {}
        try {
          result = await response.json()
        } catch {
          // The local API may still be running an older server build.
        }
        throw new Error(result.message || `Settings could not sync (HTTP ${response.status}).`)
      }
      const result = await response.json()
      const savedPortfolio = {
        ...nextPortfolio,
        edgeAnimationSettings: result.settings || settings,
        edgeAnimationSettingsStorage: result.storage || 'database',
      }
      setPortfolio(savedPortfolio)
      savePortfolioToStorage(savedPortfolio)
      setEdgeAnimationSaveStatus(result.storage === 'memory'
        ? 'Saved for this running server only. Reconnect MongoDB for permanent storage.'
        : 'Edge motion settings saved.')
    } catch (error) {
      setEdgeAnimationSaveStatus(`${error.message || 'Settings could not be saved.'} They remain saved in this browser.`)
    }
  }

  const updateMotionSetting = (field, value) => {
    setPortfolio((current) => {
      const nextPortfolio = {
        ...current,
        motionSettings: { ...DEFAULT_SITE_MOTION_SETTINGS, ...current.motionSettings, [field]: value },
      }
      savePortfolioToStorage(nextPortfolio)
      return nextPortfolio
    })
    setMotionSettingsSaveStatus('')
  }

  const saveMotionSettings = async () => {
    const settings = {
      speed: Math.min(2, Math.max(0.5, Number(portfolio.motionSettings?.speed) || 1)),
      brightness: Math.min(150, Math.max(50, Number(portfolio.motionSettings?.brightness) || 100)),
    }
    const nextPortfolio = { ...portfolio, motionSettings: settings }
    setPortfolio(nextPortfolio)
    savePortfolioToStorage(nextPortfolio)
    setMotionSettingsSaveStatus('Saving motion settings...')

    try {
      const response = await apiFetch('/api/portfolio/motion-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings }),
      })
      const result = await response.json()
      if (!response.ok) {
        throw new Error(result.message || `Settings could not sync (HTTP ${response.status}).`)
      }
      const savedPortfolio = { ...nextPortfolio, motionSettings: result.settings || settings }
      setPortfolio(savedPortfolio)
      savePortfolioToStorage(savedPortfolio)
      setMotionSettingsSaveStatus(result.storage === 'memory'
        ? 'Saved for this running server only. Reconnect MongoDB for permanent storage.'
        : 'Motion settings saved.')
    } catch (error) {
      setMotionSettingsSaveStatus(`${error.message || 'Settings could not be saved.'} They remain saved in this browser.`)
    }
  }

  useEffect(() => {
    let isMounted = true
    let bootCompletionTimer
    let stopBootScrollTour = () => {}
    const bootStartedAt = typeof performance === 'undefined' ? Date.now() : performance.now()
    const loadPortfolio = async () => {
      const savedPortfolio = (() => {
        try {
          const raw = localStorage.getItem(PORTFOLIO_STORAGE_KEY)
          return raw ? JSON.parse(raw) : null
        } catch {
          return null
        }
      })()

      if (savedPortfolio && Array.isArray(savedPortfolio.toolkitGroups)) {
        setPortfolio((current) => ({ ...current, ...savedPortfolio }))
      }

      try {
        const response = await apiFetch('/api/portfolio')
        const data = await response.json()
        const hasSavedServerAbout = ['database', 'memory'].includes(data.aboutStorage)
        const hasSavedServerAccessSettings = ['database', 'memory'].includes(data.adminAccessSettingsStorage)
        const hasSavedServerHomepageSettings = ['database', 'memory'].includes(data.homepageSettingsStorage)
        const hasSavedServerPlanetLinks = data.planetLinksStorage === 'database'
        const hasSavedServerEdgeSettings = ['database', 'memory'].includes(data.edgeAnimationSettingsStorage)
        const hasSavedServerMotionSettings = ['database', 'memory'].includes(data.motionSettingsStorage)

        const hydrated = savedPortfolio && Array.isArray(savedPortfolio.toolkitGroups)
          ? {
              ...data,
              ...savedPortfolio,
              about: hasSavedServerAbout
                ? data.about || DEFAULT_ABOUT
                : savedPortfolio.about || data.about || DEFAULT_ABOUT,
              aboutStorage: hasSavedServerAbout ? data.aboutStorage : savedPortfolio.aboutStorage || data.aboutStorage,
              visualEffect: savedPortfolio.visualEffect || data.visualEffect || 'aurora',
              visualIntensity: Number(savedPortfolio.visualIntensity) || Number(data.visualIntensity) || 72,
              visualScope: savedPortfolio.visualScope || data.visualScope || 'all',
              adminAccessSettings: {
                ...DEFAULT_ADMIN_ACCESS_SETTINGS,
                ...(hasSavedServerAccessSettings
                  ? data.adminAccessSettings || {}
                  : savedPortfolio.adminAccessSettings || data.adminAccessSettings || {}),
              },
              homepageSettings: {
                ...DEFAULT_HOMEPAGE_SETTINGS,
                ...(hasSavedServerHomepageSettings
                  ? data.homepageSettings || {}
                  : savedPortfolio.homepageSettings || data.homepageSettings || {}),
              },
              planetLinks: normalizePlanetLinks(hasSavedServerPlanetLinks
                ? data.planetLinks || DEFAULT_PLANET_LINKS
                : savedPortfolio.planetLinks || data.planetLinks || DEFAULT_PLANET_LINKS),
              planetLinksStorage: hasSavedServerPlanetLinks ? data.planetLinksStorage : savedPortfolio.planetLinksStorage || data.planetLinksStorage,
              edgeAnimationSettings: {
                ...DEFAULT_EDGE_ANIMATION_SETTINGS,
                ...(hasSavedServerEdgeSettings
                  ? data.edgeAnimationSettings || {}
                  : savedPortfolio.edgeAnimationSettings || data.edgeAnimationSettings || {}),
              },
              motionSettings: {
                ...DEFAULT_SITE_MOTION_SETTINGS,
                ...(hasSavedServerMotionSettings
                  ? data.motionSettings || {}
                  : savedPortfolio.motionSettings || data.motionSettings || {}),
              },
            }
          : {
              ...data,
              visualEffect: data.visualEffect || 'aurora',
              visualIntensity: Number(data.visualIntensity) || 72,
              visualScope: data.visualScope || 'all',
              adminAccessSettings: {
                ...DEFAULT_ADMIN_ACCESS_SETTINGS,
                ...(data.adminAccessSettings || {}),
              },
              homepageSettings: {
                ...DEFAULT_HOMEPAGE_SETTINGS,
                ...(data.homepageSettings || {}),
              },
              planetLinks: normalizePlanetLinks(data.planetLinks || DEFAULT_PLANET_LINKS),
              planetLinksStorage: data.planetLinksStorage,
              edgeAnimationSettings: {
                ...DEFAULT_EDGE_ANIMATION_SETTINGS,
                ...(data.edgeAnimationSettings || {}),
              },
              motionSettings: {
                ...DEFAULT_SITE_MOTION_SETTINGS,
                ...(data.motionSettings || {}),
              },
            }
        setPortfolio(hydrated)
        setAdminAccessDraft(hydrated.adminAccessSettings)
        savePortfolioToStorage(hydrated)
        if (hydrated.projects?.length) {
          setSelectedProjectId(hydrated.projects[0].id)
        }
      } catch (error) {
        console.error('Failed to load portfolio data:', error)
      } finally {
        if (bootAnimationEnabledAtMount.current) {
          const currentTime = typeof performance === 'undefined' ? Date.now() : performance.now()
          const elapsed = currentTime - bootStartedAt
          bootCompletionTimer = window.setTimeout(
            () => {
              stopBootScrollTour = startBootScrollTour(() => {
                if (isMounted) setIsSiteBooting(false)
              })
            },
            Math.max(0, 900 - elapsed),
          )
        }
      }
    }

    loadPortfolio()
    return () => {
      isMounted = false
      window.clearTimeout(bootCompletionTimer)
      stopBootScrollTour()
    }
  }, [])

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: light)')

    const resolveTheme = (selected) => {
      if (selected === 'system') {
        return media.matches ? 'light' : 'dark'
      }
      return selected
    }

    const syncTheme = () => {
      document.documentElement.dataset.theme = resolveTheme(theme)
    }

    syncTheme()
    media.addEventListener('change', syncTheme)

    return () => media.removeEventListener('change', syncTheme)
  }, [theme])

  useEffect(() => {
    document.documentElement.dataset.effect = portfolio.visualEffect || 'aurora'
    document.documentElement.dataset.scope = portfolio.visualScope || 'all'
    document.documentElement.style.setProperty('--motion-strength', String((Number(portfolio.visualIntensity) || 72) / 100))
    const motionSettings = { ...DEFAULT_SITE_MOTION_SETTINGS, ...portfolio.motionSettings }
    document.documentElement.style.setProperty('--motion-speed', String(motionSettings.speed))
    document.documentElement.style.setProperty('--motion-brightness', String(motionSettings.brightness / 100))
    const edgeSettings = { ...DEFAULT_EDGE_ANIMATION_SETTINGS, ...portfolio.edgeAnimationSettings }
    document.documentElement.dataset.edgeStyle = edgeSettings.style
    document.documentElement.dataset.edgeScope = edgeSettings.scope
    document.documentElement.style.setProperty('--edge-speed', `${edgeSettings.speedSeconds}s`)
    document.documentElement.style.setProperty('--edge-color', edgeSettings.color)
    Object.entries(SECTION_MOTION_DEFAULTS).forEach(([key]) => {
      const enabled = Boolean(sectionMotion[key])
      document.documentElement.dataset[`motion${key.charAt(0).toUpperCase()}${key.slice(1)}`] = String(enabled)
    })
    try {
      localStorage.setItem('portfolio-section-motion-v1', JSON.stringify(sectionMotion))
    } catch {
      // The controls remain active for this page session if browser storage is unavailable.
    }
  }, [portfolio.visualEffect, portfolio.visualScope, portfolio.visualIntensity, portfolio.motionSettings, portfolio.edgeAnimationSettings, sectionMotion])

  const selectedProject = useMemo(
    () => portfolio.projects.find((project) => project.id === selectedProjectId) ?? portfolio.projects[0],
    [portfolio.projects, selectedProjectId],
  )

  const selectedPlanet = useMemo(
    () => activePlanetShort === 'sun'
      ? SUN_DETAILS
      : SOLAR_SYSTEM_BODIES.find((planet) => planet.short === activePlanetShort) ?? null,
    [activePlanetShort],
  )
  const selectedPlanetLearnMoreUrl = useMemo(() => {
    if (!selectedPlanet) return ''

    const configuredUrl = portfolio.planetLinks?.find((link) => link.short === selectedPlanet.short)?.url
    const candidate = configuredUrl || (selectedPlanet.isSun ? DEFAULT_SUN_LINK : selectedPlanet.sourceUrl)

    try {
      const parsedUrl = new URL(candidate)
      return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:' ? parsedUrl.href : ''
    } catch {
      return ''
    }
  }, [portfolio.planetLinks, selectedPlanet])

  const activeHomepageDesignId = HOMEPAGE_DESIGNS.some((design) => design.id === portfolio.homepageSettings?.activeDesign)
    ? portfolio.homepageSettings.activeDesign
    : DEFAULT_HOMEPAGE_SETTINGS.activeDesign
  const activeHomepageDesign = HOMEPAGE_DESIGNS.find((design) => design.id === activeHomepageDesignId) || HOMEPAGE_DESIGNS[0]
  const isProfessionalHomepage = PROFESSIONAL_HOMEPAGE_IDS.has(activeHomepageDesignId)
  const publicNavItems = isProfessionalHomepage
    ? ['PROFILE', 'BIODATA', 'PROJECTS', 'SKILLS', 'EDUCATION', 'CONTACT']
    : portfolio.navItems

  const adminStats = useMemo(
    () => [
      { label: 'Projects', value: String(portfolio.projects.length || 0).padStart(2, '0') },
      { label: 'Published', value: String(Math.max(1, Math.min(portfolio.projects.length, 8))).padStart(2, '0') },
      { label: 'Skills', value: String(portfolio.toolkitGroups.reduce((sum, group) => sum + group.skills.length, 0)).padStart(2, '0') },
      { label: 'Certificates', value: String(portfolio.certificateEntries.length || 0).padStart(2, '0') },
      { label: 'Experience', value: String(portfolio.experienceEntries.length || 0).padStart(2, '0') },
      { label: 'Unread Messages', value: String(messages.filter((message) => !message.read).length).padStart(2, '0') },
    ],
    [messages, portfolio.certificateEntries.length, portfolio.experienceEntries.length, portfolio.projects.length, portfolio.toolkitGroups],
  )

  const toggleTheme = () => {
    setTheme((current) => (current === 'dark' ? 'light' : 'dark'))
  }

  const openProject = (projectId) => {
    setSelectedProjectId(projectId)
    setView('project')
  }

  const handleEffectSelection = (effectId) => {
    setPortfolio((current) => {
      const nextPortfolio = { ...current, visualEffect: effectId }
      savePortfolioToStorage(nextPortfolio)
      return nextPortfolio
    })
  }

  const handleIntensitySelection = (value) => {
    setPortfolio((current) => {
      const nextPortfolio = { ...current, visualIntensity: value }
      savePortfolioToStorage(nextPortfolio)
      return nextPortfolio
    })
  }

  const handleScopeSelection = (scopeId) => {
    setPortfolio((current) => {
      const nextPortfolio = { ...current, visualScope: scopeId }
      savePortfolioToStorage(nextPortfolio)
      return nextPortfolio
    })
  }

  const resetMotionSettings = () => {
    setPortfolio((current) => {
      const nextPortfolio = { ...current, ...DEFAULT_VISUAL_SETTINGS, motionSettings: DEFAULT_SITE_MOTION_SETTINGS }
      savePortfolioToStorage(nextPortfolio)
      return nextPortfolio
    })
    setSectionMotion(SECTION_MOTION_DEFAULTS)
    setMotionSettingsSaveStatus('')
  }

  const applyMotionPreset = (preset) => {
    if (!preset) return

    setPortfolio((current) => {
      const nextPortfolio = {
        ...current,
        visualEffect: preset.effect,
        visualIntensity: preset.intensity,
        visualScope: preset.scope,
      }
      savePortfolioToStorage(nextPortfolio)
      return nextPortfolio
    })
  }

  const saveCustomMotionTheme = () => {
    const name = customThemeName.trim()
    if (!name) return

    const nextTheme = {
      id: `${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`,
      name,
      effect: portfolio.visualEffect || 'aurora',
      intensity: Number(portfolio.visualIntensity) || 72,
      scope: portfolio.visualScope || 'all',
      sections: { ...sectionMotion },
    }

    const nextThemes = [nextTheme, ...customThemes.filter((theme) => theme.name !== name)].slice(0, 8)
    setCustomThemes(nextThemes)
    setCustomThemeName('')
    try {
      localStorage.setItem(CUSTOM_MOTION_THEMES_KEY, JSON.stringify(nextThemes))
    } catch {
      // noop
    }
  }

  const applySavedMotionTheme = (theme) => {
    if (!theme) return

    setPortfolio((current) => {
      const nextPortfolio = {
        ...current,
        visualEffect: theme.effect || 'aurora',
        visualIntensity: Number(theme.intensity) || 72,
        visualScope: theme.scope || 'all',
      }
      savePortfolioToStorage(nextPortfolio)
      return nextPortfolio
    })

    setSectionMotion({ ...SECTION_MOTION_DEFAULTS, ...(theme.sections || {}) })
  }

  const removeSavedMotionTheme = (themeId) => {
    const nextThemes = customThemes.filter((theme) => theme.id !== themeId)
    setCustomThemes(nextThemes)
    try {
      localStorage.setItem(CUSTOM_MOTION_THEMES_KEY, JSON.stringify(nextThemes))
    } catch {
      // noop
    }
  }

  const handleSectionMotionToggle = (sectionKey) => {
    setSectionMotion((current) => ({
      ...current,
      [sectionKey]: !current[sectionKey],
    }))
  }

  const toggleBootAnimation = () => {
    setIsBootAnimationEnabledState((enabled) => {
      const nextEnabled = !enabled
      try {
        localStorage.setItem(BOOT_ANIMATION_STORAGE_KEY, String(nextEnabled))
      } catch {
        // The setting remains active for this page session if browser storage is unavailable.
      }
      return nextEnabled
    })
  }

  const saveHomepageSettings = async (designId) => {
    const nextSettings = {
      ...DEFAULT_HOMEPAGE_SETTINGS,
      activeDesign: HOMEPAGE_DESIGNS.some((design) => design.id === designId) ? designId : DEFAULT_HOMEPAGE_SETTINGS.activeDesign,
    }

    setPortfolio((current) => {
      const nextPortfolio = { ...current, homepageSettings: nextSettings }
      savePortfolioToStorage(nextPortfolio)
      return nextPortfolio
    })
    setHomepageSaveStatus('Saving homepage design...')

    try {
      const response = await apiFetch('/api/portfolio/homepage-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: nextSettings }),
      })
      const result = await response.json()

      if (!response.ok) throw new Error(result.message || 'Homepage design could not be saved.')

      const savedSettings = result.settings || nextSettings
      setPortfolio((current) => {
        const nextPortfolio = { ...current, homepageSettings: savedSettings, homepageSettingsStorage: result.storage || 'database' }
        savePortfolioToStorage(nextPortfolio)
        return nextPortfolio
      })
      setHomepageSaveStatus(result.storage === 'memory'
        ? 'Homepage selected for this running server only. Reconnect MongoDB for permanent storage.'
        : 'Homepage design updated.')
    } catch (error) {
      setHomepageSaveStatus(`${error.message || 'Homepage design could not be saved.'} Selection remains saved in this browser.`)
    }
  }

  const handleFormChange = (event) => {
    const { name, value } = event.target
    setFormState((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    try {
      const response = await apiFetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formState),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Failed to send message.')
      }

      setMessages((current) => [{
        id: result.payload.id,
        sender: result.payload.sender,
        email: result.payload.email,
        subject: result.payload.subject,
        message: result.payload.message,
        read: false,
        date: 'Just now',
      }, ...current])
      setFormStatus('Message sent successfully.')
      setFormState({ name: '', email: '', subject: '', message: '' })
    } catch (error) {
      setFormStatus(error.message || 'Something went wrong. Please try again.')
    }
  }

  const handleLoginChange = (event) => {
    const { name, value } = event.target
    setLoginForm((current) => ({ ...current, [name]: value }))
  }

  const handleLoginSubmit = (event) => {
    event.preventDefault()

    if (
      loginForm.username.trim() === ADMIN_CREDENTIALS.username &&
      loginForm.password === ADMIN_CREDENTIALS.password
    ) {
      setIsAdminAuthenticated(true)
      setLoginError('')
      setView('admin')
      return
    }

    setLoginError('Invalid username or password.')
  }

  const handleLogout = () => {
    setIsAdminAuthenticated(false)
    setLoginForm({ username: '', password: '' })
    setView('home')
  }

  const handleAdminAction = (action) => {
    if (action === 'messages') {
      setAdminSection('messages')
      setMessages((current) => current.map((message) => ({ ...message, read: true })))
      return
    }

    if (action === 'resume') {
      setResumeStatus('Resume update queued for review')
      setAdminSection('overview')
      return
    }

    if (action === 'project') {
      setShowProjectForm(true)
      setAdminSection('projects')
      return
    }

    setAdminSection(action)
  }

  const handleProjectDraftChange = (event) => {
    const { name, value } = event.target
    setProjectDraft((current) => ({ ...current, [name]: value }))
  }

  const resetProjectDraft = () => {
    setProjectDraft({ title: '', category: 'Web Experience', description: '', tech: '', status: 'Draft', date: new Date().getFullYear().toString(), website: '', repository: '', image: '', video: '', problem: '', approach: '', features: '', role: '', challenges: '', solution: '', results: '', gallery: ['', '', '', '', '', ''] })
    setEditingProjectId(null)
    setMediaUploadStatus('')
  }

  const handleProjectMediaUpload = async (event, type) => {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    const expectedType = type === 'video' ? 'video/' : 'image/'
    if (!file.type.startsWith(expectedType)) {
      setMediaUploadStatus(`Please select a valid ${type} file.`)
      event.target.value = ''
      return
    }

    if (file.size > 100 * 1024 * 1024) {
      setMediaUploadStatus(`${type === 'video' ? 'Video' : 'Image'} must be 100MB or smaller.`)
      event.target.value = ''
      return
    }

    setMediaUploadStatus(`Uploading ${type}...`)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await apiFetch('/api/uploads', {
        method: 'POST',
        body: formData,
      })
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Media upload failed.')
      }

      setProjectDraft((current) => {
        if (type.startsWith('gallery-')) {
          const index = Number(type.replace('gallery-', ''))
          const gallery = [...current.gallery]
          gallery[index] = result.url
          return { ...current, gallery }
        }
        return { ...current, [type]: result.url }
      })
      setMediaUploadStatus(`${type === 'image' ? 'Image' : 'Video'} uploaded successfully.`)
    } catch (error) {
      setMediaUploadStatus(error.message || 'Media upload failed.')
      event.target.value = ''
    }
  }

  const handleAddProject = async (event) => {
    event.preventDefault()

    if (!projectDraft.title || !projectDraft.description) {
      return
    }

    const techList = projectDraft.tech.split(',').map((item) => item.trim()).filter(Boolean)
    const projectPayload = {
      id: editingProjectId || projectDraft.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      number: editingProjectId ? portfolio.projects.find((project) => project.id === editingProjectId)?.number || '00' : String(portfolio.projects.length + 1).padStart(2, '0'),
      title: projectDraft.title,
      category: projectDraft.category,
      status: projectDraft.status,
      date: projectDraft.date,
      description: projectDraft.description,
      tech: techList.length ? techList : ['React', 'UI'],
      website: projectDraft.website?.trim() || '',
      repository: projectDraft.repository?.trim() || '',
      image: projectDraft.image || '',
      video: projectDraft.video || '',
      accent: ['lime', 'blue', 'neutral'][portfolio.projects.length % 3],
      problem: projectDraft.problem.trim(),
      approach: projectDraft.approach.trim(),
      features: projectDraft.features.split(',').map((item) => item.trim()).filter(Boolean),
      role: projectDraft.role.trim(),
      challenges: projectDraft.challenges.split(',').map((item) => item.trim()).filter(Boolean),
      solution: projectDraft.solution.trim(),
      results: projectDraft.results.split(',').map((item) => item.trim()).filter(Boolean),
      gallery: projectDraft.gallery.filter(Boolean).map((url, index) => ({ label: ['EDITORIAL', 'WEB', 'BUILD', 'STUDIO', 'PROCESS', 'DRAFT'][index], url })),
    }

    try {
      const response = await apiFetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectPayload),
      })
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Project could not be saved.')
      }

      setPortfolio((current) => {
        const projectList = editingProjectId
          ? current.projects.map((project) => (project.id === editingProjectId ? result.project : project))
          : [result.project, ...current.projects]

        return { ...current, projects: projectList }
      })
    } catch (error) {
      setMediaUploadStatus(error.message || 'Project could not be saved.')
      return
    }

    resetProjectDraft()
    setShowProjectForm(false)
    setAdminSection('projects')
  }

  const handleDeleteProject = async (projectId) => {
    try {
      const response = await apiFetch(`/api/projects/${projectId}`, { method: 'DELETE' })
      if (!response.ok) {
        throw new Error('Project could not be deleted.')
      }
      setPortfolio((current) => ({ ...current, projects: current.projects.filter((project) => project.id !== projectId) }))
    } catch (error) {
      setMediaUploadStatus(error.message || 'Project could not be deleted.')
    }
  }

  const beginEditProject = (project) => {
    setEditingProjectId(project.id)
    setProjectDraft({
      title: project.title,
      category: project.category,
      description: project.description,
      tech: project.tech.join(', '),
      status: project.status,
      date: project.date,
      website: project.website || '',
      repository: project.repository || '',
      image: project.image || '',
      video: project.video || '',
      problem: project.problem || '',
      approach: project.approach || '',
      features: (project.features || []).join(', '),
      role: project.role || '',
      challenges: (project.challenges || []).join(', '),
      solution: project.solution || '',
      results: (project.results || []).join(', '),
      gallery: (project.gallery || []).map((item) => item.url || item).concat(['', '', '', '', '', '']).slice(0, 6),
    })
    setShowProjectForm(true)
    setAdminSection('projects')
  }

  const handleSkillDraftChange = (event) => {
    const { name, value } = event.target
    setSkillDraft((current) => ({ ...current, [name]: value }))
  }

  const resetSkillDraft = () => {
    setSkillDraft({ label: '', skills: '' })
    setEditingSkillIndex(null)
  }

  const handleAddSkillGroup = (event) => {
    event.preventDefault()

    const label = skillDraft.label.trim()
    const parsedSkills = skillDraft.skills
      .split(/[,\n]/)
      .map((item) => item.trim())
      .filter(Boolean)

    if (!label || !parsedSkills.length) {
      return
    }

    const skillGroup = { label, skills: parsedSkills }

    setPortfolio((current) => {
      const nextGroups = editingSkillIndex !== null
        ? current.toolkitGroups.map((group, index) => (index === editingSkillIndex ? skillGroup : group))
        : [skillGroup, ...current.toolkitGroups]

      const nextPortfolio = { ...current, toolkitGroups: nextGroups }
      savePortfolioToStorage(nextPortfolio)
      return nextPortfolio
    })

    resetSkillDraft()
    setShowSkillForm(false)
    setAdminSection('skills')
  }

  const handleDeleteSkillGroup = (index) => {
    setPortfolio((current) => {
      const nextPortfolio = {
        ...current,
        toolkitGroups: current.toolkitGroups.filter((_, itemIndex) => itemIndex !== index),
      }
      savePortfolioToStorage(nextPortfolio)
      return nextPortfolio
    })
  }

  const beginEditSkillGroup = (group, index) => {
    setEditingSkillIndex(index)
    setSkillDraft({ label: group.label, skills: group.skills.join(', ') })
    setShowSkillForm(true)
    setAdminSection('skills')
  }

  const handleJourneyDraftChange = (event) => {
    const { name, value } = event.target
    setJourneyDraft((current) => ({ ...current, [name]: value }))
  }

  const resetJourneyDraft = () => {
    setJourneyDraft({ year: '', title: '', description: '', location: '', detail: '', image: '', images: '', links: '' })
    setEditingJourneyId(null)
  }

  const parseJourneyLinks = (value) => {
    if (!value) {
      return []
    }

    return value
      .split(/\n|,/)
      .map((entry) => entry.trim())
      .filter(Boolean)
      .map((entry) => {
        const [label, ...rest] = entry.split('|')
        const result = rest.join('|').trim()
        const url = result || entry

        return {
          label: label.trim() && label.trim() !== url ? label.trim() : 'Link',
          url,
        }
      })
      .filter((link) => /^https?:\/\//i.test(link.url))
  }

  const parseJourneyImages = (value) => {
    if (!value) {
      return []
    }

    return value
      .split(/\n|,/)
      .map((item) => item.trim())
      .filter(Boolean)
      .filter((item) => /^https?:\/\//i.test(item) || item.startsWith('/'))
  }

  const handleAddJourney = (event) => {
    event.preventDefault()

    if (!journeyDraft.year || !journeyDraft.title || !journeyDraft.description) {
      return
    }

    const journeyEntry = {
      year: journeyDraft.year,
      title: journeyDraft.title,
      description: journeyDraft.description,
      location: journeyDraft.location.trim(),
      detail: journeyDraft.detail.trim(),
      image: journeyDraft.image.trim(),
      images: parseJourneyImages(journeyDraft.images),
      links: parseJourneyLinks(journeyDraft.links),
    }

    setPortfolio((current) => {
      const nextPortfolio = {
        ...current,
        journeyEvents: editingJourneyId !== null
          ? current.journeyEvents.map((entry, index) => (index === editingJourneyId ? journeyEntry : entry))
          : [journeyEntry, ...current.journeyEvents],
      }
      savePortfolioToStorage(nextPortfolio)
      return nextPortfolio
    })

    resetJourneyDraft()
    setShowJourneyForm(false)
    setAdminSection('journey')
  }

  const handleDeleteJourney = (index) => {
    setPortfolio((current) => {
      const nextPortfolio = {
        ...current,
        journeyEvents: current.journeyEvents.filter((_, itemIndex) => itemIndex !== index),
      }
      savePortfolioToStorage(nextPortfolio)
      return nextPortfolio
    })
  }

  const beginEditJourney = (entry, index) => {
    setEditingJourneyId(index)
    setJourneyDraft({
      year: entry.year || '',
      title: entry.title || '',
      description: entry.description || '',
      location: entry.location || '',
      detail: entry.detail || '',
      image: entry.image || '',
      images: Array.isArray(entry.images) ? entry.images.join(', ') : '',
      links: Array.isArray(entry.links) ? entry.links.map((link) => `${link.label || 'Link'}|${link.url}`).join('\n') : '',
    })
    setShowJourneyForm(true)
    setAdminSection('journey')
  }

  const beginEditAbout = () => {
    const about = portfolio.about || DEFAULT_ABOUT
    setAboutDraft({
      ...DEFAULT_ABOUT,
      ...about,
      facts: Array.isArray(about.facts) ? about.facts.map((record) => ({ ...record })) : [],
      colleges: Array.isArray(about.colleges) ? about.colleges.map((record) => ({ ...record })) : [],
      webinars: Array.isArray(about.webinars) ? about.webinars.map((record) => ({ ...record })) : [],
      certificates: Array.isArray(about.certificates) ? about.certificates.map((record) => ({ ...record })) : [],
      images: Array.isArray(about.images) ? about.images.map((record) => ({ ...record })) : [],
      links: Array.isArray(about.links) ? about.links.map((record) => ({ ...record })) : [],
    })
    setAboutSaveStatus('')
    setAdminSection('about')
  }

  const handleAboutDraftChange = (event) => {
    const { name, value } = event.target
    setAboutDraft((current) => ({ ...current, [name]: value }))
  }

  const updateAboutRecord = (collection, index, field, value) => {
    setAboutDraft((current) => {
      const records = [...current[collection]]
      records[index] = { ...records[index], [field]: value }
      return { ...current, [collection]: records }
    })
  }

  const addAboutRecord = (collection) => {
    const definition = ABOUT_COLLECTIONS.find((item) => item.key === collection)
    if (!definition) return

    const emptyRecord = Object.fromEntries(definition.fields.map((field) => [field.key, '']))
    setAboutDraft((current) => ({ ...current, [collection]: [...current[collection], emptyRecord] }))
  }

  const removeAboutRecord = (collection, index) => {
    setAboutDraft((current) => ({
      ...current,
      [collection]: current[collection].filter((_, recordIndex) => recordIndex !== index),
    }))
  }

  const handleAboutImageUpload = async (event, collection, index) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setAboutSaveStatus('Please select a valid image file.')
      event.target.value = ''
      return
    }

    if (file.size > 20 * 1024 * 1024) {
      setAboutSaveStatus('Images must be 20MB or smaller.')
      event.target.value = ''
      return
    }

    setAboutSaveStatus('Uploading image...')

    try {
      const formData = new FormData()
      formData.append('file', file)
      const response = await apiFetch('/api/uploads', { method: 'POST', body: formData })
      const result = await response.json()

      if (!response.ok) throw new Error(result.message || 'Image upload failed.')

      if (collection === 'photo') {
        setAboutDraft((current) => ({ ...current, photo: result.url }))
      } else {
        updateAboutRecord(collection, index, collection === 'images' ? 'url' : 'image', result.url)
      }
      setAboutSaveStatus('Image uploaded. Save the About section to publish it.')
    } catch (error) {
      setAboutSaveStatus(error.message || 'Image upload failed.')
      event.target.value = ''
    }
  }

  const handleSaveAbout = async (event) => {
    event.preventDefault()
    const homepageIntro = aboutDraft.homepageIntro.trim()
    if (!homepageIntro) {
      setAboutSaveStatus('Please enter a homepage introduction before saving.')
      return
    }

    const trimRecords = (records) => records
      .filter((record) => Object.values(record).some((value) => String(value || '').trim()))
      .map((record) => Object.fromEntries(Object.entries(record).map(([key, value]) => [key, String(value || '').trim()])))
    const about = {
      heading: aboutDraft.heading.trim(),
      biography: aboutDraft.biography.trim(),
      homepageIntro,
      photo: aboutDraft.photo.trim(),
      facts: trimRecords(aboutDraft.facts),
      colleges: trimRecords(aboutDraft.colleges),
      webinars: trimRecords(aboutDraft.webinars),
      certificates: trimRecords(aboutDraft.certificates),
      images: trimRecords(aboutDraft.images),
      links: trimRecords(aboutDraft.links),
    }

    setPortfolio((current) => {
      const nextPortfolio = { ...current, about }
      savePortfolioToStorage(nextPortfolio)
      return nextPortfolio
    })
    setAboutSaveStatus('Saving About content...')

    try {
      const response = await apiFetch('/api/portfolio/about', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(about),
      })
      const result = await response.json()

      if (!response.ok) throw new Error(result.message || 'About content could not be saved.')

      const savedAbout = result.about || about
      setPortfolio((current) => {
        const nextPortfolio = { ...current, about: savedAbout, aboutStorage: result.storage || 'database' }
        savePortfolioToStorage(nextPortfolio)
        return nextPortfolio
      })
      setAboutDraft(savedAbout)
      setAboutSaveStatus(result.storage === 'memory'
        ? 'Saved for this running server only. Reconnect MongoDB for permanent storage.'
        : 'About section saved.')
    } catch (error) {
      setAboutSaveStatus(`${error.message || 'About content could not be saved.'} Changes remain saved in this browser.`)
    }
  }

  const savePortfolioCollection = async (key, entries, setStatus) => {
    setPortfolio((current) => {
      const nextPortfolio = { ...current, [key]: entries }
      savePortfolioToStorage(nextPortfolio)
      return nextPortfolio
    })
    setStatus('Saving changes...')

    try {
      const response = await apiFetch(`/api/portfolio/content/${key}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entries }),
      })
      const result = await response.json()

      if (!response.ok) throw new Error(result.message || 'Changes could not be saved.')

      const savedEntries = result.entries || entries
      setPortfolio((current) => {
        const nextPortfolio = {
          ...current,
          [key]: savedEntries,
          ...(key === 'planetLinks' ? { planetLinksStorage: result.storage || 'database' } : {}),
        }
        savePortfolioToStorage(nextPortfolio)
        return nextPortfolio
      })
      setStatus('Changes saved.')
    } catch (error) {
      setStatus(`${error.message || 'Changes could not be saved.'} Changes remain saved in this browser.`)
    }
  }

  const handleEntryImageUpload = async (event, editor) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setExperienceSaveStatus(editor === 'experience' ? 'Please select an image file.' : experienceSaveStatus)
      setAchievementSaveStatus(editor === 'achievement' ? 'Please select an image file.' : achievementSaveStatus)
      event.target.value = ''
      return
    }

    if (file.size > 20 * 1024 * 1024) {
      const message = 'Images must be 20MB or smaller.'
      if (editor === 'experience') setExperienceSaveStatus(message)
      else setAchievementSaveStatus(message)
      event.target.value = ''
      return
    }

    const setStatus = editor === 'experience' ? setExperienceSaveStatus : setAchievementSaveStatus
    setStatus('Uploading image...')

    try {
      const formData = new FormData()
      formData.append('file', file)
      const response = await apiFetch('/api/uploads', { method: 'POST', body: formData })
      const result = await response.json()
      if (!response.ok) throw new Error(result.message || 'Image upload failed.')

      if (editor === 'experience') setExperienceDraft((current) => ({ ...current, image: result.url }))
      else setAchievementDraft((current) => ({ ...current, image: result.url }))
      setStatus('Image uploaded. Save this entry to publish it.')
    } catch (error) {
      setStatus(error.message || 'Image upload failed.')
      event.target.value = ''
    }
  }

  const handleExperienceDraftChange = (event) => {
    const { name, value } = event.target
    setExperienceDraft((current) => ({ ...current, [name]: value }))
  }

  const resetExperienceDraft = () => {
    setExperienceDraft(createExperienceDraft())
    setEditingExperienceIndex(null)
  }

  const handleSaveExperience = async (event) => {
    event.preventDefault()
    const { company, role, description } = experienceDraft
    if (!company.trim() || !role.trim() || !description.trim()) return

    const experience = {
      company: company.trim(),
      role: role.trim(),
      type: experienceDraft.type.trim(),
      dates: experienceDraft.dates.trim(),
      location: experienceDraft.location.trim(),
      description: description.trim(),
      achievements: experienceDraft.achievements.split(/[\n,]/).map((item) => item.trim()).filter(Boolean),
      image: experienceDraft.image.trim(),
      images: parseJourneyImages(experienceDraft.images),
      links: parseJourneyLinks(experienceDraft.links),
    }
    const entries = editingExperienceIndex === null
      ? [experience, ...portfolio.experienceEntries]
      : portfolio.experienceEntries.map((item, index) => index === editingExperienceIndex ? experience : item)

    await savePortfolioCollection('experienceEntries', entries, setExperienceSaveStatus)
    setShowExperienceForm(false)
    resetExperienceDraft()
  }

  const beginEditExperience = (entry, index) => {
    setEditingExperienceIndex(index)
    setExperienceDraft({
      company: entry.company || '',
      role: entry.role || '',
      type: entry.type || '',
      dates: entry.dates || '',
      location: entry.location || '',
      description: entry.description || '',
      achievements: Array.isArray(entry.achievements) ? entry.achievements.join('\n') : '',
      image: entry.image || '',
      images: Array.isArray(entry.images) ? entry.images.join('\n') : '',
      links: Array.isArray(entry.links) ? entry.links.map((link) => `${link.label || 'Link'}|${link.url}`).join('\n') : '',
    })
    setExperienceSaveStatus('')
    setShowExperienceForm(true)
    setAdminSection('experience')
  }

  const handleDeleteExperience = async (index) => {
    const entries = portfolio.experienceEntries.filter((_, itemIndex) => itemIndex !== index)
    await savePortfolioCollection('experienceEntries', entries, setExperienceSaveStatus)
  }

  const handleAchievementDraftChange = (event) => {
    const { name, value } = event.target
    setAchievementDraft((current) => ({ ...current, [name]: value }))
  }

  const resetAchievementDraft = () => {
    setAchievementDraft(createAchievementDraft())
    setEditingAchievementIndex(null)
  }

  const handleSaveAchievement = async (event) => {
    event.preventDefault()
    const { title, description } = achievementDraft
    if (!title.trim() || !description.trim()) return

    const achievement = {
      title: title.trim(),
      organization: achievementDraft.organization.trim(),
      date: achievementDraft.date.trim(),
      description: description.trim(),
      image: achievementDraft.image.trim(),
      images: parseJourneyImages(achievementDraft.images),
      links: parseJourneyLinks(achievementDraft.links),
    }
    const entries = editingAchievementIndex === null
      ? [achievement, ...portfolio.achievements]
      : portfolio.achievements.map((item, index) => index === editingAchievementIndex ? achievement : item)

    await savePortfolioCollection('achievements', entries, setAchievementSaveStatus)
    setShowAchievementForm(false)
    resetAchievementDraft()
  }

  const beginEditAchievement = (entry, index) => {
    setEditingAchievementIndex(index)
    setAchievementDraft({
      title: entry.title || '',
      organization: entry.organization || '',
      date: entry.date || '',
      description: entry.description || '',
      image: entry.image || '',
      images: Array.isArray(entry.images) ? entry.images.join('\n') : '',
      links: Array.isArray(entry.links) ? entry.links.map((link) => `${link.label || 'Link'}|${link.url}`).join('\n') : '',
    })
    setAchievementSaveStatus('')
    setShowAchievementForm(true)
    setAdminSection('achievements')
  }

  const handleDeleteAchievement = async (index) => {
    const entries = portfolio.achievements.filter((_, itemIndex) => itemIndex !== index)
    await savePortfolioCollection('achievements', entries, setAchievementSaveStatus)
  }

  const handleGalleryDraftChange = (event) => {
    const { name, value } = event.target
    setGalleryDraft((current) => ({ ...current, [name]: value }))
  }

  const resetGalleryDraft = () => {
    setGalleryDraft({ label: '', url: '', tone: 'normal' })
    setEditingGalleryIndex(null)
  }

  const handleGalleryImageUpload = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setGallerySaveStatus('Please select an image file.')
      event.target.value = ''
      return
    }

    if (file.size > 20 * 1024 * 1024) {
      setGallerySaveStatus('Images must be 20MB or smaller.')
      event.target.value = ''
      return
    }

    setGallerySaveStatus('Uploading image...')

    try {
      const formData = new FormData()
      formData.append('file', file)
      const response = await apiFetch('/api/uploads', { method: 'POST', body: formData })
      const result = await response.json()
      if (!response.ok) throw new Error(result.message || 'Image upload failed.')

      setGalleryDraft((current) => ({ ...current, url: result.url }))
      setGallerySaveStatus('Image uploaded. Save this gallery item to publish it.')
    } catch (error) {
      setGallerySaveStatus(error.message || 'Image upload failed.')
      event.target.value = ''
    }
  }

  const handleSaveGalleryItem = async (event) => {
    event.preventDefault()
    const url = galleryDraft.url.trim()
    if (!url) {
      setGallerySaveStatus('Upload an image or enter an image URL.')
      return
    }

    const galleryItem = {
      label: galleryDraft.label.trim() || 'GALLERY IMAGE',
      url,
      tone: galleryDraft.tone,
    }
    const entries = editingGalleryIndex === null
      ? [galleryItem, ...portfolio.galleryItems]
      : portfolio.galleryItems.map((item, index) => index === editingGalleryIndex ? galleryItem : item)

    await savePortfolioCollection('galleryItems', entries, setGallerySaveStatus)
    setShowGalleryForm(false)
    resetGalleryDraft()
  }

  const beginEditGalleryItem = (item, index) => {
    setEditingGalleryIndex(index)
    setGalleryDraft({ label: item.label || '', url: item.url || item.image || '', tone: item.tone || 'normal' })
    setGallerySaveStatus('')
    setShowGalleryForm(true)
    setAdminSection('gallery')
  }

  const handleDeleteGalleryItem = async (index) => {
    const entries = portfolio.galleryItems.filter((_, itemIndex) => itemIndex !== index)
    await savePortfolioCollection('galleryItems', entries, setGallerySaveStatus)
  }

  const beginEditContactLinks = () => {
    setContactLinksDraft((portfolio.contactLinks || DEFAULT_CONTACT_LINKS).map((item) => ({ ...item })))
    setContactSaveStatus('')
    setAdminSection('contact')
  }

  const updateContactLink = (index, field, value) => {
    setContactLinksDraft((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item))
  }

  const addContactLink = () => {
    setContactLinksDraft((current) => [...current, { label: '', type: 'website', value: '' }])
  }

  const removeContactLink = (index) => {
    setContactLinksDraft((current) => current.filter((_, itemIndex) => itemIndex !== index))
  }

  const handleSaveContactLinks = async () => {
    const entries = contactLinksDraft
      .filter((item) => item.label.trim() && item.value.trim())
      .map((item) => ({ label: item.label.trim(), type: item.type, value: item.value.trim() }))

    await savePortfolioCollection('contactLinks', entries, setContactSaveStatus)
  }

  const beginEditPlanetLinks = () => {
    setPlanetLinksDraft(DEFAULT_PLANET_LINKS.map(({ name, short, url }) => {
      const savedLink = portfolio.planetLinks?.find((link) => link.short === short)
      return { name, short, url: savedLink?.url || url }
    }))
    setPlanetLinksSaveStatus('')
    setAdminSection('planetLinks')
  }

  const updatePlanetLink = (short, url) => {
    setPlanetLinksDraft((current) => current.map((link) => link.short === short ? { ...link, url } : link))
  }

  const handleSavePlanetLinks = async () => {
    const hasInvalidUrl = planetLinksDraft.some((link) => !/^https?:\/\/\S+$/i.test(link.url.trim()))
    if (hasInvalidUrl) {
      setPlanetLinksSaveStatus('Sun aur har planet ke liye valid http:// ya https:// link enter karein.')
      return
    }

    const entries = planetLinksDraft.map((link) => ({ ...link, url: link.url.trim() }))
    await savePortfolioCollection('planetLinks', entries, setPlanetLinksSaveStatus)
  }

  const visibleProjects = useMemo(() => {
    return portfolio.projects.filter((project) => {
      const matchesFilter = projectFilter === 'all' || project.category.toLowerCase().includes(projectFilter)
      const term = projectSearch.trim().toLowerCase()
      const matchesSearch = !term || [project.title, project.category, project.description, project.tech.join(' ')].join(' ').toLowerCase().includes(term)
      return matchesFilter && matchesSearch
    })
  }, [portfolio.projects, projectFilter, projectSearch])

  const renderProfessionalHomepageContent = () => {
    const allSkills = portfolio.toolkitGroups.flatMap((group) => group.skills).slice(0, 12)
    const educationItems = [
      ...portfolio.educationEntries,
      ...(portfolio.about?.colleges || []).map((item) => ({
        title: item.program || item.title,
        institution: item.title,
        dates: item.dates || '',
        location: item.location || '',
        description: item.description || '',
      })),
    ].slice(0, 4)
    const proofItems = [
      ...portfolio.certificateEntries.map((item) => ({ label: item.title, meta: item.issuer || item.date })),
      ...portfolio.achievements.map((item) => ({ label: item.title, meta: item.organization || item.date })),
    ].slice(0, 6)

    return (
      <>
        <MotionSection id="profile" className={`pro-hero pro-home-${activeHomepageDesignId}`} motionEnabled={sectionMotion.hero} activeMotionScope={portfolio.visualScope || 'all'} initial="hidden" animate="show" variants={motionSettings}>
          <div className="pro-hero-copy">
            <p className="section-tag">COMPUTER SCIENCE ENGINEER PROFILE</p>
            <h1>{portfolio.profile.name}</h1>
            <p className="pro-title">{portfolio.profile.title}</p>
            <p className="pro-lede">
              A placement-ready digital biodata built for teachers, recruiters, and mentors. It brings my projects, learning record, technical stack, certificates, and contact details into one clear professional website.
            </p>
            <div className="pro-action-row">
              <a href="#biodata" className="primary-btn">
                <span>View Biodata</span>
                <ArrowRight size={15} />
              </a>
              <a href="/resume.pdf" download="abhinav-yadav-resume.pdf" className="secondary-btn">
                <Download size={15} />
                <span>Download Resume</span>
              </a>
            </div>
          </div>

          <div className="pro-profile-panel" aria-label="Profile summary">
            <div className="pro-avatar">{portfolio.profile.name.split(' ').map((part) => part[0]).join('').slice(0, 2)}</div>
            <div>
              <span>Candidate</span>
              <strong>{portfolio.profile.name}</strong>
            </div>
            <div className="pro-status-grid">
              <span>CSE Diploma</span>
              <span>Frontend</span>
              <span>India</span>
              <span>Open to Internship</span>
            </div>
          </div>
        </MotionSection>

        <MotionSection id="biodata" className="pro-section pro-biodata" motionEnabled={sectionMotion.about} activeMotionScope={portfolio.visualScope || 'all'} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} variants={motionSettings}>
          <div className="section-header">
            <span className="section-tag">01 - BIODATA</span>
            <h2>Profile details for teachers and placement review.</h2>
          </div>
          <div className="pro-biodata-grid">
            {(portfolio.about?.facts || DEFAULT_ABOUT.facts).map((fact, index) => (
              <div key={`${fact.label}-${index}`} className="pro-fact">
                <span>{fact.label}</span>
                <strong>{fact.value}</strong>
              </div>
            ))}
            <div className="pro-fact">
              <span>Email</span>
              <strong>{portfolio.profile.email}</strong>
            </div>
            <div className="pro-fact">
              <span>Location</span>
              <strong>{portfolio.profile.location}</strong>
            </div>
          </div>
          <p className="pro-bio-copy">{portfolio.about?.biography || DEFAULT_ABOUT.biography}</p>
        </MotionSection>

        <MotionSection id="projects" className="pro-section" motionEnabled={sectionMotion.work} activeMotionScope={portfolio.visualScope || 'all'} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} variants={motionSettings}>
          <div className="section-header">
            <span className="section-tag">02 - PROJECTS</span>
            <h2>Selected work that shows practical skills.</h2>
          </div>
          <div className="pro-project-grid">
            {portfolio.projects.slice(0, 3).map((project) => (
              <article key={project.id} className="pro-project-card">
                <span>{project.category}</span>
                <h3>{project.title}</h3>
                <p>{project.description}</p>
                <div className="pro-chip-row">
                  {(project.tech || []).slice(0, 4).map((item) => <i key={item}>{item}</i>)}
                </div>
                <button type="button" className="inline-link" onClick={() => openProject(project.id)}>
                  VIEW PROJECT <ArrowUpRight size={14} />
                </button>
              </article>
            ))}
          </div>
        </MotionSection>

        <MotionSection id="skills" className="pro-section pro-skills" motionEnabled={sectionMotion.toolkit} activeMotionScope={portfolio.visualScope || 'all'} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} variants={motionSettings}>
          <div>
            <span className="section-tag">03 - SKILLS</span>
            <h2>Technical stack and learning focus.</h2>
          </div>
          <div className="pro-skill-cloud">
            {allSkills.map((skill, index) => <span key={`${skill}-${index}`}>{skill}</span>)}
          </div>
        </MotionSection>

        <MotionSection id="education" className="pro-section" motionEnabled={sectionMotion.about} activeMotionScope={portfolio.visualScope || 'all'} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} variants={motionSettings}>
          <div className="section-header">
            <span className="section-tag">04 - EDUCATION</span>
            <h2>Academic background and verified progress.</h2>
          </div>
          <div className="pro-timeline-list">
            {educationItems.map((item, index) => (
              <article key={`${item.title}-${index}`} className="pro-timeline-item">
                <span>{item.dates || 'Ongoing'}</span>
                <div>
                  <h3>{item.title}</h3>
                  <strong>{item.institution}</strong>
                  <p>{item.description}</p>
                </div>
              </article>
            ))}
          </div>
        </MotionSection>

        <MotionSection className="pro-section pro-proof" motionEnabled={sectionMotion.about} activeMotionScope={portfolio.visualScope || 'all'} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} variants={motionSettings}>
          <div>
            <span className="section-tag">05 - PROOF</span>
            <h2>Certificates and achievements for quick review.</h2>
          </div>
          <div className="pro-proof-list">
            {proofItems.map((item, index) => (
              <div key={`${item.label}-${index}`}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <strong>{item.label}</strong>
                <p>{item.meta}</p>
              </div>
            ))}
          </div>
        </MotionSection>

        <MotionSection id="contact" className="pro-section pro-contact" motionEnabled={sectionMotion.contact} activeMotionScope={portfolio.visualScope || 'all'} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} variants={motionSettings}>
          <div>
            <span className="section-tag">06 - CONTACT</span>
            <h2>Share this website as my biodata and portfolio.</h2>
            <div className="contact-meta">
              {(portfolio.contactLinks || DEFAULT_CONTACT_LINKS).filter((item) => item.value).map((item, index) => (
                <a
                  key={`${item.type}-${item.value}-${index}`}
                  href={item.type === 'email' ? `mailto:${item.value}` : item.value}
                  target={item.type === 'email' ? undefined : '_blank'}
                  rel={item.type === 'email' ? undefined : 'noreferrer'}
                >
                  {item.type === 'email' ? <Mail size={16} /> : item.type === 'github' ? <GitBranch size={16} /> : <Globe size={16} />}
                  {item.type === 'email' ? item.value : item.label}
                </a>
              ))}
            </div>
          </div>

          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="field-grid">
              <label>
                <span>Name</span>
                <input type="text" name="name" value={formState.name} onChange={handleFormChange} placeholder="Your name" required />
              </label>
              <label>
                <span>Email</span>
                <input type="email" name="email" value={formState.email} onChange={handleFormChange} placeholder="you@example.com" required />
              </label>
            </div>
            <label>
              <span>Subject</span>
              <input type="text" name="subject" value={formState.subject} onChange={handleFormChange} placeholder="Placement, teaching, or collaboration" />
            </label>
            <label>
              <span>Message</span>
              <textarea rows="5" name="message" value={formState.message} onChange={handleFormChange} placeholder="Write your message..." required />
            </label>
            {formStatus ? <p className="form-status">{formStatus}</p> : null}
            <button type="submit" className="primary-btn">
              <span>Send Message</span>
              <ArrowUpRight size={15} />
            </button>
          </form>
        </MotionSection>
      </>
    )
  }

  const renderHome = () => (
    <>
      {adminUnlockStage === 'active' ? (
        <div className="admin-guard-overlay" role="dialog" aria-modal="true" aria-label="Admin unlock screen">
          <div className="admin-guard-card">
            <p className="section-tag">ADMIN UNLOCK</p>
            <h2>Restricted access</h2>
            <p>Select three points in the correct order to continue.</p>

            <div className="admin-guard-grid" aria-label="Nine unlock points">
              {Array.from({ length: 9 }, (_, index) => (
                <button
                  key={index}
                  type="button"
                  className="admin-hotspot"
                  aria-label={`Unlock point ${index + 1}`}
                  onClick={() => handleAdminHotspotClick(index)}
                />
              ))}
            </div>

            <div className="admin-guard-progress" aria-hidden="true">
              <span style={{ width: `${(unlockProgress / 3) * 100}%` }} />
            </div>
            <button type="button" className="secondary-btn full-width admin-guard-cancel" onClick={() => setAdminUnlockStage('hidden')}>
              Back to portfolio
            </button>
          </div>
        </div>
      ) : null}

      <header id="top" className="topbar" data-motion-enabled={sectionMotion.hero ? 'true' : 'false'}>
        <button
          type="button"
          className="brand-mark"
          aria-label="Abhinav Yadav logo"
          onClick={handleAdminLogoClick}
        >
          AY
        </button>

        <nav id="site-navigation" className={`main-nav${isMobileMenuOpen ? ' is-open' : ''}`} aria-label="Main navigation">
          {publicNavItems.map((item) => (
            <a key={item} href={`#${item.toLowerCase()}`} onClick={() => setIsMobileMenuOpen(false)}>
              {item}
            </a>
          ))}
        </nav>

        <div className="nav-actions">
          <button
            type="button"
            className="icon-button"
            aria-label="Toggle theme"
            onClick={toggleTheme}
          >
            {theme === 'dark' ? <SunMedium size={16} /> : <MoonStar size={16} />}
          </button>
          <a href="#contact" className="primary-btn">
            <span>Let&apos;s Talk</span>
            <ArrowUpRight size={15} />
          </a>
          <button
            type="button"
            className={`mobile-menu${isMobileMenuOpen ? ' is-open' : ''}`}
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMobileMenuOpen}
            aria-controls="site-navigation"
            onClick={() => setIsMobileMenuOpen((open) => !open)}
          >
            {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </header>

      <main className={`page-content ${isProfessionalHomepage ? `pro-home-page pro-home-page-${activeHomepageDesignId}` : 'classic-home-page'}`}>
        {isProfessionalHomepage ? renderProfessionalHomepageContent() : (
          <>
        <MotionSection className="hero-panel" motionEnabled={sectionMotion.hero} activeMotionScope={portfolio.visualScope || 'all'} initial="hidden" animate="show" variants={motionSettings}>
          <div className="status-line">AVAILABLE FOR FRONTEND / PRODUCT / INTERNSHIP</div>

          <div className="hero-grid">
            <div className="hero-copy">
              <p className="eyebrow">Frontend developer & UI-focused learner</p>
              <h1>
                ABHINAV
                <span>YADAV</span>
              </h1>
              <p className="lede">
                {portfolio.about?.homepageIntro || DEFAULT_ABOUT.homepageIntro}
              </p>

              <div className="hero-stackline" aria-label="Core technology stack">
                <span className="hero-stackline-label">CORE STACK</span>
                <div>
                  {portfolio.toolkitGroups.flatMap((group) => group.skills).slice(0, 5).map((skill, index) => (
                    <span key={`${skill}-${index}`}>{skill}</span>
                  ))}
                </div>
              </div>

              <div className="info-strip" aria-label="Profile summary">
                <span>BASED IN INDIA</span>
                <span>CSE DIPLOMA</span>
                <span>2ND YEAR</span>
                <span>BUILDING FOR WEB</span>
              </div>

              <div className="cta-row">
                <a href="#work" className="primary-btn">
                  <span>Explore Work</span>
                  <ArrowRight size={15} />
                </a>
                <a href="#resume" className="secondary-btn">
                  <Download size={15} />
                  <span>Download Resume</span>
                </a>
              </div>
            </div>

            <div className="hero-visual">
              <div className="visual-core solar-scene">
                <div className="solar-system" role="group" aria-label="Interactive solar system">
                  {SOLAR_SYSTEM_BODIES.map((planet) => (
                    <div
                      key={planet.short}
                      className="orbit-planet-track"
                      style={{
                        '--orbit-size': `${planet.readableOrbit}cqw`,
                        '--planet-radius': `${(planet.readableOrbit / 2).toFixed(1)}cqw`,
                        '--planet-size': `${planet.size}px`,
                        '--orbit-duration': `${planet.duration}s`,
                        '--orbit-delay': `${planet.delay}s`,
                        '--planet-angle': `${planet.angle}deg`,
                      }}
                    >
                      <span className="planet-orbit-path" aria-hidden="true" />
                      <button
                        type="button"
                        className={`orbit-planet ${activePlanetShort === planet.short ? 'is-selected' : ''}`}
                        onClick={() => {
                          setActivePlanetShort(planet.short)
                          setIsPlanetDetailOpen(true)
                          setIsPlanetLearnMoreOpen(false)
                        }}
                        aria-label={`View details for ${planet.name}`}
                      >
                        <span className="planet-marker">
                          <img src={planet.image} alt="" className="planet-image" />
                        </span>
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    className={`solar-sun ${activePlanetShort === 'sun' ? 'is-selected' : ''}`}
                    onClick={() => {
                      setActivePlanetShort('sun')
                      setIsPlanetDetailOpen(true)
                      setIsPlanetLearnMoreOpen(false)
                    }}
                    aria-label="View details for the Sun"
                  >
                    <span>AY</span>
                  </button>
                </div>
              </div>

              <AnimatedPresence mode="wait">
                {isPlanetDetailOpen && selectedPlanet && (
                  <MotionDiv
                    ref={planetDetailRef}
                    key={selectedPlanet.short}
                    initial={{ opacity: 0, y: 18, scale: 0.92, rotateX: -8 }}
                    animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
                    exit={{ opacity: 0, y: 10, scale: 0.94, rotateX: -6 }}
                    transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                    className="planet-details-panel"
                  >
                    <button
                      type="button"
                      className="planet-close-btn"
                      onClick={() => {
                        setIsPlanetDetailOpen(false)
                        setIsPlanetLearnMoreOpen(false)
                      }}
                      aria-label={`Close details for ${selectedPlanet.name}`}
                    >
                      ×
                    </button>

                    <div className="planet-details-header">
                      {selectedPlanet.isSun ? (
                        <span className="planet-details-sun" aria-hidden="true">AY</span>
                      ) : (
                        <img src={selectedPlanet.image} alt={selectedPlanet.name} className="planet-details-image" />
                      )}
                      <div>
                        <span className="planet-details-label">{selectedPlanet.isSun ? 'Solar System Star' : 'Selected Planet'}</span>
                        <h3>{selectedPlanet.name}</h3>
                      </div>
                    </div>

                    {selectedPlanet.isSun ? (
                      <>
                        <div className="planet-detail-row">
                          <span className="planet-detail-key">Type</span>
                          <strong>Star</strong>
                        </div>
                        <div className="planet-detail-row">
                          <span className="planet-detail-key">Approx. distance from Earth</span>
                          <strong>149.6 million km</strong>
                        </div>
                        <div className="planet-detail-row">
                          <span className="planet-detail-key">Position</span>
                          <strong>Center of the solar system</strong>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="planet-detail-row">
                          <span className="planet-detail-key">Distance from Sun</span>
                          <strong>{selectedPlanet.distanceFromSun}</strong>
                        </div>
                        <div className="planet-detail-row">
                          <span className="planet-detail-key">Approx. distance from Earth</span>
                          <strong>{formatDistanceFromEarth(selectedPlanet.distanceAu)}</strong>
                        </div>
                        <div className="planet-detail-row">
                          <span className="planet-detail-key">Position in order</span>
                          <strong>{SOLAR_SYSTEM_BODIES.findIndex((planet) => planet.short === selectedPlanet.short) + 1}</strong>
                        </div>
                      </>
                    )}

                    {isPlanetLearnMoreOpen
                      ? createPortal(
                        <div className="planet-learn-more-overlay" role="dialog" aria-modal="true" aria-label={`${selectedPlanet.name} details`}>
                          <div className="planet-learn-more-toolbar">
                            <span>{selectedPlanet.name} / Learn more</span>
                            <button
                              type="button"
                              className="planet-learn-more-close"
                              onClick={() => setIsPlanetLearnMoreOpen(false)}
                            >
                              Back to planet
                            </button>
                          </div>
                          {selectedPlanetLearnMoreUrl ? (
                            <iframe
                              className="planet-learn-more-frame"
                              src={selectedPlanetLearnMoreUrl}
                              title={`${selectedPlanet.name} reference page`}
                              loading="eager"
                              referrerPolicy="no-referrer"
                              sandbox="allow-forms allow-scripts"
                            />
                          ) : (
                            <p className="planet-learn-more-error" role="alert">
                              This planet does not have a valid reference page. Update its URL in Admin → Planet Links.
                            </p>
                          )}
                        </div>,
                        document.body,
                      )
                      : null}
                    <button
                      type="button"
                      className="planet-source-link"
                      onClick={() => setIsPlanetLearnMoreOpen(true)}
                    >
                      Learn more
                    </button>
                  </MotionDiv>
                )}
              </AnimatedPresence>
              <div className="visual-list">
                <span>STUDIO</span>
                <span>BUILD</span>
                <span>LEARN</span>
              </div>
            </div>
          </div>
        </MotionSection>

        <MotionSection id="work" className="content-section" motionEnabled={sectionMotion.work} activeMotionScope={portfolio.visualScope || 'all'} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} variants={motionSettings}>
          <div className="section-header">
            <span className="section-tag">01 — SELECTED WORK</span>
            <h2>Things I&apos;ve built while learning.</h2>
          </div>

          <div className="work-toolbar">
            <div className="filter-row" aria-label="Project filters">
              {['all', 'web', 'product', 'creative'].map((filter) => (
                <button
                  key={filter}
                  type="button"
                  className={`filter-chip ${projectFilter === filter ? 'active' : ''}`}
                  onClick={() => setProjectFilter(filter)}
                >
                  {filter === 'all' ? 'All' : filter}
                </button>
              ))}
            </div>
            <label className="search-box">
              <span>Search</span>
              <input
                type="text"
                value={projectSearch}
                onChange={(event) => setProjectSearch(event.target.value)}
                placeholder="Search projects..."
              />
            </label>
          </div>

          <MotionDiv className="project-stack" motionScopeGroup="cards" variants={staggerContainer} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.12 }}>
            {visibleProjects.length ? visibleProjects.map((project, index) => (
              <MotionArticle
                key={project.title}
                className={`project-panel ${index % 2 === 1 ? 'reverse' : ''}`}
                motionScopeGroup="cards"
                variants={fadeInUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.12 }}
              >
                <div className={`project-media media-${project.accent}`}>
                  {project.video ? (
                    <ProjectVideoPlayer src={project.video} poster={project.image} title={project.title} />
                  ) : project.image ? (
                    <img
                      className="project-image"
                      src={project.image}
                      alt={project.title}
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    <div className={`project-preview project-preview-${project.accent || 'neutral'}`}>
                      <div className="preview-toolbar">
                        <div className="preview-dots" aria-hidden="true"><i /><i /><i /></div>
                        <span>ABHINAV / SELECTED WORK</span>
                        <small>{project.category}</small>
                      </div>
                      <div className="project-preview-main">
                        <span className="preview-window-label">BUILD / {project.number}</span>
                        <h4>{project.title}</h4>
                        <p>{project.description}</p>
                        <ul className="preview-tech-list">
                          {(project.tech || []).slice(0, 4).map((technology, technologyIndex) => (
                            <li key={`${technology}-${technologyIndex}`}><span>0{technologyIndex + 1}</span>{technology}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="preview-foot"><span>DESIGN / DEVELOP / SHIP</span><span>{project.date || 'WEB'}</span></div>
                    </div>
                  )}
                </div>

                <div className="project-copy">
                  <span className="project-number">{project.number}</span>
                  <h3>{project.title}</h3>
                  <p className="project-category">{project.category}</p>
                  <p className="project-description">{project.description}</p>

                  <ul className="tech-list">
                    {project.tech.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>

                  {project.website ? (
                    <a href={project.website} target="_blank" rel="noreferrer" className="inline-link project-link">
                      VISIT WEBSITE
                      <ArrowUpRight size={14} />
                    </a>
                  ) : null}

                  <button type="button" className="inline-link" onClick={() => openProject(project.id)}>
                    VIEW PROJECT
                    <ArrowUpRight size={14} />
                  </button>
                </div>
              </MotionArticle>
            )) : (
              <MotionDiv className="empty-state" variants={fadeInUp}>No projects match your current search or filter.</MotionDiv>
            )}
          </MotionDiv>
        </MotionSection>

        <MotionSection id="about" className="content-section spaced" motionEnabled={sectionMotion.about} activeMotionScope={portfolio.visualScope || 'all'} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} variants={motionSettings}>
          <div className="section-header narrow-header">
            <span className="section-tag">02 — ABOUT</span>
            <h2>{portfolio.about?.heading || DEFAULT_ABOUT.heading}</h2>
          </div>

            <div className={`about-layout ${portfolio.about?.photo ? 'about-layout-with-photo' : ''}`}>
            <div className="about-index">02</div>

              <div className={`about-copy ${portfolio.about?.photo ? 'about-copy-with-photo' : ''}`}>
                {portfolio.about?.photo ? <img className="about-photo" src={portfolio.about.photo} alt={`${portfolio.profile.name} portrait`} loading="lazy" decoding="async" /> : null}
                <p>{portfolio.about?.biography || DEFAULT_ABOUT.biography}</p>
            </div>

            <div className="about-meta">
                {(portfolio.about?.facts || DEFAULT_ABOUT.facts).map((fact, index) => (
                  <div key={`${fact.label}-${index}`}>
                    <span>{fact.label}</span>
                    <strong>{fact.value}</strong>
                  </div>
                ))}
            </div>
          </div>

            {portfolio.about?.colleges?.length ? (
              <div className="about-collection">
                <h3 className="section-tag">EDUCATION & COLLEGES</h3>
                <div className="about-record-grid">
                  {portfolio.about.colleges.map((item, index) => (
                    <article className="about-record-card" key={`${item.title}-${index}`}>
                      {item.image ? <img className="about-record-image" src={item.image} alt={item.title || 'College'} loading="lazy" decoding="async" /> : null}
                      <h4>{item.title}</h4>
                      {item.program ? <strong>{item.program}</strong> : null}
                      {(item.dates || item.location) ? <span className="about-record-meta">{[item.dates, item.location].filter(Boolean).join(' / ')}</span> : null}
                      {item.description ? <p>{item.description}</p> : null}
                      {item.url ? <a className="inline-link" href={item.url} target="_blank" rel="noreferrer">COLLEGE DETAILS <ArrowUpRight size={14} /></a> : null}
                    </article>
                  ))}
                </div>
              </div>
            ) : null}

            {portfolio.about?.webinars?.length ? (
              <div className="about-collection">
                <h3 className="section-tag">WEBINARS & EVENTS</h3>
                <div className="about-record-grid">
                  {portfolio.about.webinars.map((item, index) => (
                    <article className="about-record-card" key={`${item.title}-${index}`}>
                      {item.image ? <img className="about-record-image" src={item.image} alt={item.title || 'Webinar'} loading="lazy" decoding="async" /> : null}
                      <h4>{item.title}</h4>
                      {item.organizer ? <strong>{item.organizer}</strong> : null}
                      {item.date ? <span className="about-record-meta">{item.date}</span> : null}
                      {item.description ? <p>{item.description}</p> : null}
                      {item.url ? <a className="inline-link" href={item.url} target="_blank" rel="noreferrer">OPEN EVENT <ArrowUpRight size={14} /></a> : null}
                    </article>
                  ))}
                </div>
              </div>
            ) : null}

            {portfolio.about?.images?.length ? (
              <div className="about-collection">
                <h3 className="section-tag">ABOUT GALLERY</h3>
                <div className="about-image-grid">
                  {portfolio.about.images.map((image, index) => (
                    <figure className="about-gallery-item" key={`${image.url}-${index}`}>
                      <img src={image.url} alt={image.label || 'About gallery'} loading="lazy" decoding="async" />
                      {image.label ? <figcaption>{image.label}</figcaption> : null}
                    </figure>
                  ))}
                </div>
              </div>
            ) : null}

            {portfolio.about?.links?.length ? (
              <div className="about-links">
                {portfolio.about.links.filter((link) => /^https?:\/\//i.test(link.url || '')).map((link, index) => (
                  <a key={`${link.url}-${index}`} href={link.url} target="_blank" rel="noreferrer">{link.label || link.url}<ArrowUpRight size={14} /></a>
                ))}
              </div>
            ) : null}
        </MotionSection>

        <MotionSection id="toolkit" className="content-section spaced" motionEnabled={sectionMotion.toolkit} activeMotionScope={portfolio.visualScope || 'all'} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} variants={motionSettings}>
          <div className="section-header">
            <span className="section-tag">03 — TOOLKIT</span>
            <h2>The systems I keep learning and shipping with.</h2>
          </div>

          <div className="toolkit-grid">
            {portfolio.toolkitGroups.map((group) => (
              <div key={group.label} className="toolkit-row">
                <div className="toolkit-label">{group.label}</div>
                <div className="toolkit-skills">
                  {group.skills.map((skill) => (
                    <span key={skill}>{skill}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </MotionSection>

        <MotionSection id="journey" className="content-section spaced" motionEnabled={sectionMotion.journey} activeMotionScope={portfolio.visualScope || 'all'} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} variants={motionSettings}>
          <div className="section-header">
            <span className="section-tag">04 — JOURNEY</span>
            <h2>Career archive and learning path.</h2>
          </div>

          <div className="timeline">
            {portfolio.journeyEvents.map((event, index) => (
              <div key={`${event.year}-${event.title}-${index}`} className="timeline-item">
                <div className="timeline-year">{event.year}</div>
                <div className="timeline-line" aria-hidden="true" />
                <div className="timeline-copy">
                  <h3>{event.title}</h3>
                  {event.location ? <span className="journey-location">{event.location}</span> : null}
                  <p>{event.description}</p>
                  {event.detail ? <p className="journey-detail">{event.detail}</p> : null}
                  {event.image ? (
                    <img className="journey-image" src={event.image} alt={event.title} loading="lazy" decoding="async" />
                  ) : null}
                  {event.images?.length ? (
                    <div className="journey-gallery">
                      {event.images.map((image, imageIndex) => (
                        <img key={`${image}-${imageIndex}`} src={image} alt={`${event.title} ${imageIndex + 1}`} loading="lazy" decoding="async" />
                      ))}
                    </div>
                  ) : null}
                  {event.links?.length ? (
                    <div className="journey-links">
                      {event.links.map((link, linkIndex) => (
                        <a key={`${link.url}-${linkIndex}`} href={link.url} target="_blank" rel="noreferrer">
                          {link.label}
                        </a>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </MotionSection>

        <MotionSection id="education" className="content-section spaced" motionEnabled={sectionMotion.about} activeMotionScope={portfolio.visualScope || 'all'} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} variants={motionSettings}>
          <div className="section-header">
            <span className="section-tag">05 — EDUCATION</span>
            <h2>Academic record and learning focus.</h2>
          </div>

          <div className="list-archive">
            {[
              ...portfolio.educationEntries,
              ...(portfolio.about?.colleges || []).map((item) => ({
                title: item.program || item.title,
                institution: item.title,
                dates: item.dates || '',
                location: item.location || '',
                description: item.description || '',
                image: item.image || '',
                url: item.url || '',
              })),
            ].map((item, index) => (
              <article key={`${item.title}-${item.institution}-${index}`} className="archive-row">
                <div className="archive-meta">
                  <span>{item.dates}</span>
                  <span>{item.location}</span>
                </div>
                <div className="archive-content">
                  {item.image ? <img className="education-image" src={item.image} alt={item.institution || item.title} loading="lazy" decoding="async" /> : null}
                  <h3>{item.title}</h3>
                  <p className="archive-institution">{item.institution}</p>
                  <p>{item.description}</p>
                  {item.url ? <a className="inline-link" href={item.url} target="_blank" rel="noreferrer">COLLEGE DETAILS <ArrowUpRight size={14} /></a> : null}
                </div>
              </article>
            ))}
          </div>
        </MotionSection>

        <MotionSection id="experience" className="content-section spaced" motionEnabled={sectionMotion.journey} activeMotionScope={portfolio.visualScope || 'all'} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} variants={motionSettings}>
          <div className="section-header">
            <span className="section-tag">06 — EXPERIENCE</span>
            <h2>Professional context and working rhythm.</h2>
          </div>

          <div className="experience-grid">
            {portfolio.experienceEntries.map((item, index) => (
              <article key={`${item.company}-${item.role}-${index}`} className="experience-card">
                {item.image ? <img className="experience-image" src={item.image} alt={`${item.company} experience`} loading="lazy" decoding="async" /> : null}
                <div className="experience-header">
                  <span>{item.company}</span>
                  <strong>{item.role}</strong>
                </div>
                <div className="experience-meta">
                  <span>{item.type}</span>
                  <span>{item.location}</span>
                  <span>{item.dates}</span>
                </div>
                {item.description ? <p>{item.description}</p> : null}
                {item.achievements?.length ? <ul>
                  {item.achievements.map((achievement, achievementIndex) => (
                    <li key={`${achievement}-${achievementIndex}`}>{achievement}</li>
                  ))}
                </ul> : null}
                {item.images?.length ? <div className="entry-image-gallery">
                  {item.images.map((image, imageIndex) => <img key={`${image}-${imageIndex}`} src={image} alt={`${item.company} ${imageIndex + 1}`} loading="lazy" decoding="async" />)}
                </div> : null}
                {item.links?.length ? <div className="entry-links">
                  {item.links.map((link, linkIndex) => <a key={`${link.url}-${linkIndex}`} href={link.url} target="_blank" rel="noreferrer">{link.label || 'View details'} <ArrowUpRight size={14} /></a>)}
                </div> : null}
              </article>
            ))}
          </div>
        </MotionSection>

        <MotionSection id="certificates" className="content-section spaced" motionEnabled={sectionMotion.about} activeMotionScope={portfolio.visualScope || 'all'} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} variants={motionSettings}>
          <div className="section-header">
            <span className="section-tag">07 — CERTIFICATES</span>
            <h2>Proof of learning and technical progress.</h2>
          </div>

          <div className="certificate-list">
            {[
              ...portfolio.certificateEntries,
              ...(portfolio.about?.certificates || []),
            ].map((item, index) => (
              <article key={`${item.title}-${item.issuer}-${index}`} className="certificate-row">
                <div>
                  <span className="certificate-label">Certificate</span>
                  <h3>{item.title}</h3>
                  {item.image ? <img className="certificate-image" src={item.image} alt={item.title || 'Certificate'} loading="lazy" decoding="async" /> : null}
                </div>
                <div>
                  <span className="certificate-label">Issuer</span>
                  <p>{item.issuer}</p>
                </div>
                <div>
                  <span className="certificate-label">Date</span>
                  <p>{item.date}</p>
                </div>
                <div>
                  <span className="certificate-label">Credential</span>
                  <p>{item.credential}</p>
                </div>
                {item.url ? <a href={item.url} target="_blank" rel="noreferrer" className="inline-link">
                  VIEW <ArrowUpRight size={14} />
                </a> : null}
              </article>
            ))}
          </div>
        </MotionSection>

        <MotionSection id="achievements" className="content-section spaced" motionEnabled={sectionMotion.about} activeMotionScope={portfolio.visualScope || 'all'} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} variants={motionSettings}>
          <div className="section-header">
            <span className="section-tag">08 — ACHIEVEMENTS</span>
            <h2>Milestones shaped by iteration and curiosity.</h2>
          </div>

          <div className="achievement-list">
            {portfolio.achievements.map((item, index) => (
              <article key={`${item.title}-${index}`} className="achievement-row">
                <div className="achievement-index">{String(index + 1).padStart(2, '0')}</div>
                <div className="achievement-copy">
                  <h3>{item.title}</h3>
                  <div className="achievement-meta">
                    <span>{item.organization}</span>
                    <span>{item.date}</span>
                  </div>
                  <p>{item.description}</p>
                  {item.image ? <img className="achievement-image" src={item.image} alt={item.title} loading="lazy" decoding="async" /> : null}
                  {item.images?.length ? <div className="entry-image-gallery">
                    {item.images.map((image, imageIndex) => <img key={`${image}-${imageIndex}`} src={image} alt={`${item.title} ${imageIndex + 1}`} loading="lazy" decoding="async" />)}
                  </div> : null}
                  {item.links?.length ? <div className="entry-links">
                    {item.links.map((link, linkIndex) => <a key={`${link.url}-${linkIndex}`} href={link.url} target="_blank" rel="noreferrer">{link.label || 'View details'} <ArrowUpRight size={14} /></a>)}
                  </div> : null}
                </div>
              </article>
            ))}
          </div>
        </MotionSection>

        <MotionSection id="gallery" className="content-section spaced" motionEnabled={sectionMotion.gallery} activeMotionScope={portfolio.visualScope || 'all'} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} variants={motionSettings}>
          <div className="section-header">
            <span className="section-tag">09 — GALLERY</span>
            <h2>Visual notes from research, build, and process.</h2>
          </div>

          <div className="gallery-grid">
            {portfolio.galleryItems.map((item, index) => (
              <div key={`${item.label}-${index}`} className={`gallery-item ${item.tone || 'normal'}`}>
                {(item.url || item.image) ? <img src={item.url || item.image} alt={item.label || 'Portfolio gallery image'} loading="lazy" decoding="async" /> : null}
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </MotionSection>

        <MotionSection id="resume" className="content-section spaced" motionEnabled={sectionMotion.about} activeMotionScope={portfolio.visualScope || 'all'} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} variants={motionSettings}>
          <div className="resume-panel">
            <div>
              <span className="section-tag">10 — RESUME</span>
              <h2>Want the structured version?</h2>
            </div>
            <div className="resume-meta">
              <span>CURRENT RESUME</span>
              <strong>UPDATED 2026 • AVAILABLE FOR REVIEW</strong>
            </div>
            <div className="resume-actions">
              <a href="/resume.html" target="_blank" rel="noreferrer" className="primary-btn">
                <span>View Resume</span>
                <ArrowUpRight size={15} />
              </a>
              <a href="/resume.pdf" download="abhinav-yadav-resume.pdf" className="secondary-btn">
                <Download size={15} />
                <span>Download PDF</span>
              </a>
            </div>
          </div>
        </MotionSection>

        <MotionSection id="contact" className="content-section contact-panel" motionEnabled={sectionMotion.contact} activeMotionScope={portfolio.visualScope || 'all'} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} variants={motionSettings}>
          <div className="contact-graphic">
            <div className="contact-art-overline"><span>CONTACT / 11</span><span>BUILT WITH INTENTION</span></div>
            <h2 className="contact-graphic-title">
              <span>LET&apos;S MAKE</span>
              <span>SOMETHING</span>
              <span>USEFUL.</span>
            </h2>
            <img className="contact-visual" src={heroGraphic} alt="" aria-hidden="true" />
            <div className="contact-art-footer"><span>IDEA</span><i aria-hidden="true" /> <span>INTERFACE</span><i aria-hidden="true" /> <span>IMPACT</span></div>
          </div>

          <div className="contact-details">
            <p className="section-tag">11 — CONTACT</p>
            <p className="contact-copy">
              I&apos;m open to learning opportunities, collaborative builds, and thoughtful web
              experiences.
            </p>

            <div className="contact-meta">
              {(portfolio.contactLinks || DEFAULT_CONTACT_LINKS).filter((item) => item.value).map((item, index) => (
                <a
                  key={`${item.type}-${item.value}-${index}`}
                  href={item.type === 'email' ? `mailto:${item.value}` : item.value}
                  target={item.type === 'email' ? undefined : '_blank'}
                  rel={item.type === 'email' ? undefined : 'noreferrer'}
                >
                  {item.type === 'email' ? <Mail size={16} /> : item.type === 'github' ? <GitBranch size={16} /> : <Globe size={16} />}
                  {item.type === 'email' ? item.value : item.label}
                </a>
              ))}
            </div>

            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="field-grid">
                <label>
                  <span>Name</span>
                  <input type="text" name="name" value={formState.name} onChange={handleFormChange} placeholder="Your name" required />
                </label>
                <label>
                  <span>Email</span>
                  <input type="email" name="email" value={formState.email} onChange={handleFormChange} placeholder="you@example.com" required />
                </label>
              </div>
              <label>
                <span>Subject</span>
                <input type="text" name="subject" value={formState.subject} onChange={handleFormChange} placeholder="Project, internship, or collaboration" />
              </label>
              <label>
                <span>Message</span>
                <textarea rows="5" name="message" value={formState.message} onChange={handleFormChange} placeholder="Tell me about your idea..." required />
              </label>
              {formStatus ? <p className="form-status">{formStatus}</p> : null}
              <button type="submit" className="primary-btn">
                <span>Send Message</span>
                <ArrowUpRight size={15} />
              </button>
            </form>
          </div>
        </MotionSection>
          </>
        )}
      </main>

      <footer className="site-footer" data-motion-enabled={sectionMotion.contact ? 'true' : 'false'}>
        <div className="footer-brand">
          <div className="brand-mark small">AY</div>
          <div>
            <strong>ABHINAV YADAV</strong>
            <p>Building thoughtful web experiences while learning.</p>
          </div>
        </div>

        <div className="footer-links">
          {publicNavItems.map((item) => (
            <a key={`footer-${item}`} href={`#${item.toLowerCase()}`}>{item}</a>
          ))}
        </div>

        <div className="footer-meta">
          <a href="#resume">Resume</a>
          <a href="mailto:abhinavyadav.contact@gmail.com">Email</a>
          <span>© 2026</span>
        </div>

        <div className="footer-live">
          <span className="footer-live-status"><i aria-hidden="true" /> BUILDING FOR THE WEB</span>
          <span className="footer-live-detail">DESIGN / CODE / SHIP</span>
          <a href="#page-top">BACK TO TOP <ArrowUpRight size={14} /></a>
        </div>
      </footer>
    </>
  )

  const renderProjectDetail = () => (
    <div className="project-detail-page">
      <header className="detail-header">
        <div className="detail-breadcrumbs">
          <button type="button" className="text-link" onClick={() => setView('home')}>
            ← Back to home
          </button>
          <span>{selectedProject.number} / PROJECT PAGE</span>
        </div>
        <div className="detail-meta-row">
          <div>
            <p className="section-tag">{selectedProject.number} — {selectedProject.category}</p>
            <h1>{selectedProject.title}</h1>
          </div>
          <div className="detail-status">
            <span>{selectedProject.status}</span>
            <span>{selectedProject.date}</span>
          </div>
        </div>
      </header>

      <section className="project-hero-media">
        {selectedProject.video ? (
          <ProjectVideoPlayer src={selectedProject.video} poster={selectedProject.image} title={selectedProject.title} controls detail />
        ) : selectedProject.image ? (
          <img
            className="project-hero-image"
            src={selectedProject.image}
            alt={`${selectedProject.title} cover`}
            loading="eager"
            decoding="async"
          />
        ) : null}
        {!selectedProject.video && !selectedProject.image ? (
          <div className="project-hero-visual media-lime">
            <div className="media-surface" />
          </div>
        ) : null}
      </section>

      {(selectedProject.description || selectedProject.title) ? <section className="detail-grid two-col">
        <div>
          <p className="section-tag">Overview</p>
          <h2>{selectedProject.title}</h2>
        </div>
        {selectedProject.description ? <p className="detail-copy">{selectedProject.description}</p> : null}
      </section> : null}

      {(selectedProject.problem || selectedProject.approach || selectedProject.features?.length) ? <section className="detail-grid three-up">
        {selectedProject.problem ? <div className="detail-card">
          <p className="section-tag">The Problem</p>
          <p>{selectedProject.problem}</p>
        </div> : null}
        {selectedProject.approach ? <div className="detail-card">
          <p className="section-tag">The Approach</p>
          <p>{selectedProject.approach}</p>
        </div> : null}
        {selectedProject.features?.length ? <div className="detail-card">
          <p className="section-tag">Key Features</p>
          <ul>
            {selectedProject.features.map((feature) => (
              <li key={feature}>{feature}</li>
            ))}
          </ul>
        </div> : null}
      </section> : null}

      {(selectedProject.tech?.length || selectedProject.role || selectedProject.challenges?.length) ? <section className="detail-grid sidebar-row">
        {selectedProject.tech?.length ? <div className="detail-card metadata-card">
          <p className="section-tag">Technology</p>
          <div className="tag-list">
            {selectedProject.tech.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </div> : null}

        {selectedProject.role ? <div className="detail-card metadata-card">
          <p className="section-tag">My Role</p>
          <p>{selectedProject.role}</p>
        </div> : null}

        {selectedProject.challenges?.length ? <div className="detail-card metadata-card">
          <p className="section-tag">Challenges</p>
          <ul>
            {selectedProject.challenges.map((challenge) => (
              <li key={challenge}>{challenge}</li>
            ))}
          </ul>
        </div> : null}
      </section> : null}

      {(selectedProject.solution || selectedProject.results?.length) ? <section className="detail-grid text-split">
        {selectedProject.solution ? <div className="detail-card">
          <p className="section-tag">Solution</p>
          <p>{selectedProject.solution}</p>
        </div> : null}
        {selectedProject.results?.length ? <div className="detail-card">
          <p className="section-tag">Result</p>
          <ul>
            {selectedProject.results.map((result) => (
              <li key={result}>{result}</li>
            ))}
          </ul>
        </div> : null}
      </section> : null}

      {selectedProject.gallery?.length ? <section className="detail-gallery">
        <p className="section-tag">Project Gallery</p>
        <div className="gallery-grid detail-gallery-grid">
          {selectedProject.gallery.map((item) => (
            <div key={item.url || item.label} className={`gallery-item ${item.tone || 'normal'}`}>
              {item.url ? <img src={item.url} alt={item.label || 'Project gallery'} /> : <span>{item.label}</span>}
            </div>
          ))}
        </div>
      </section> : null}

      <section className="project-links">
        {selectedProject.website ? (
          <a href={selectedProject.website} target="_blank" rel="noreferrer" className="primary-btn">
            <span>Live Link</span>
            <ArrowUpRight size={15} />
          </a>
        ) : null}
        {selectedProject.repository ? <a href={selectedProject.repository} target="_blank" rel="noreferrer" className="secondary-btn">
          <span>Repository</span>
          <ArrowUpRight size={15} />
        </a> : null}
      </section>

      <section className="next-project-row">
        <span>Next Project</span>
        <button type="button" className="inline-link" onClick={() => openProject(portfolio.projects[(portfolio.projects.findIndex((item) => item.id === selectedProject.id) + 1) % portfolio.projects.length].id)}>
          {portfolio.projects[(portfolio.projects.findIndex((item) => item.id === selectedProject.id) + 1) % portfolio.projects.length].title}
          <ArrowRight size={15} />
        </button>
      </section>
    </div>
  )

  const renderAdmin = () => {
    if (!isAdminAuthenticated) {
      return (
        <div className="admin-login-shell">
          <div className="admin-login-card">
            <div className="brand-mark" aria-label="Admin brand">AY</div>
            <p className="section-tag">ADMIN ACCESS</p>
            <h1>Secure dashboard</h1>
            <p className="login-copy">Use your admin credentials to continue.</p>

            <form className="admin-login-form" onSubmit={handleLoginSubmit}>
              <label>
                <span>Username</span>
                <input type="text" name="username" value={loginForm.username} onChange={handleLoginChange} placeholder="admin" required />
              </label>
              <label>
                <span>Password</span>
                <input type="password" name="password" value={loginForm.password} onChange={handleLoginChange} placeholder="••••••••" required />
              </label>

              {loginError ? <p className="login-error">{loginError}</p> : null}

              <button type="submit" className="primary-btn full-width">Login to dashboard</button>
              <button type="button" className="secondary-btn full-width" onClick={() => setView('home')}>Back to public site</button>
            </form>
          </div>
        </div>
      )
    }

    return (
    <div className="admin-dashboard">
      <aside className="admin-sidebar">
        <div className="brand-mark" aria-label="Admin brand">AY</div>
        <nav className="admin-nav">
          <span className="nav-group-label">Dashboard</span>
          <button type="button" className={`nav-button ${adminSection === 'overview' ? 'active' : ''}`} onClick={() => handleAdminAction('overview')}>Overview</button>
          <button type="button" className={`nav-button ${adminSection === 'homepage' ? 'active' : ''}`} onClick={() => handleAdminAction('homepage')}>Homepage</button>
          <button type="button" className={`nav-button ${adminSection === 'projects' ? 'active' : ''}`} onClick={() => handleAdminAction('projects')}>Projects</button>
          <button type="button" className={`nav-button ${adminSection === 'about' ? 'active' : ''}`} onClick={beginEditAbout}>About</button>
          <button type="button" className={`nav-button ${adminSection === 'experience' ? 'active' : ''}`} onClick={() => handleAdminAction('experience')}>Experience</button>
          <button type="button" className={`nav-button ${adminSection === 'achievements' ? 'active' : ''}`} onClick={() => handleAdminAction('achievements')}>Achievements</button>
          <button type="button" className={`nav-button ${adminSection === 'gallery' ? 'active' : ''}`} onClick={() => handleAdminAction('gallery')}>Gallery Images</button>
          <button type="button" className={`nav-button ${adminSection === 'planetLinks' ? 'active' : ''}`} onClick={beginEditPlanetLinks}>Planet Links</button>
          <button type="button" className={`nav-button ${adminSection === 'contact' ? 'active' : ''}`} onClick={beginEditContactLinks}>Contact</button>
          <button type="button" className={`nav-button ${adminSection === 'access' ? 'active' : ''}`} onClick={() => handleAdminAction('access')}>Access Gate</button>
          <button type="button" className={`nav-button ${adminSection === 'effects' ? 'active' : ''}`} onClick={() => handleAdminAction('effects')}>Effects</button>
          <button type="button" className={`nav-button ${adminSection === 'skills' ? 'active' : ''}`} onClick={() => handleAdminAction('skills')}>Skills</button>
          <button type="button" className={`nav-button ${adminSection === 'journey' ? 'active' : ''}`} onClick={() => handleAdminAction('journey')}>Journey</button>
          <button type="button" className={`nav-button ${adminSection === 'messages' ? 'active' : ''}`} onClick={() => handleAdminAction('messages')}>Messages</button>
        </nav>
        <button type="button" className="secondary-btn admin-back" onClick={handleLogout}>
          <span>Logout</span>
        </button>
      </aside>

      <main className="admin-content">
        <header className="admin-header">
          <div>
            <p className="section-tag">CMS DASHBOARD</p>
            <h1>Portfolio control center</h1>
          </div>
          <button type="button" className="primary-btn" onClick={() => handleAdminAction('project')}>
            <span>New Project</span>
            <ArrowUpRight size={15} />
          </button>
        </header>

        <section className="stat-grid">
          {adminStats.map((stat) => (
            <div key={stat.label} className="stat-card">
              <span>{stat.label}</span>
              <strong>{stat.value}</strong>
            </div>
          ))}
        </section>

        {adminSection === 'homepage' ? (
          <section className="panel-card admin-list-panel homepage-panel">
            <div className="panel-header">
              <div>
                <span className="section-tag">HOMEPAGE SECTION</span>
                <h2>Choose default homepage</h2>
              </div>
              <span className="status-badge">{activeHomepageDesign.name}</span>
            </div>

            <div className="homepage-design-grid">
              {HOMEPAGE_DESIGNS.map((design) => (
                <article key={design.id} className={`homepage-design-card ${activeHomepageDesignId === design.id ? 'active' : ''}`}>
                  <div>
                    <span>{design.tone}</span>
                    <h3>{design.name}</h3>
                    <p>{design.description}</p>
                  </div>
                  <button
                    type="button"
                    className={activeHomepageDesignId === design.id ? 'primary-btn small-btn' : 'secondary-btn small-btn'}
                    onClick={() => saveHomepageSettings(design.id)}
                  >
                    {activeHomepageDesignId === design.id ? 'Active' : 'Set Homepage'}
                  </button>
                </article>
              ))}
            </div>

            {homepageSaveStatus ? <p className="form-status">{homepageSaveStatus}</p> : null}
          </section>
        ) : null}

        {adminSection === 'planetLinks' ? (
          <section className="panel-card admin-list-panel contact-editor-panel">
            <div className="panel-header">
              <div>
                <span className="section-tag">SOLAR SYSTEM</span>
                <h2>Sun &amp; planet reference links</h2>
                <p>Visitor ka Learn more button yahan set kiya gaya page isi website ke andar kholta hai; naya tab nahi khulta aur URL page par text ke roop mein nahi dikhaya jata.</p>
              </div>
            </div>
            <div className="contact-editor-list">
              {planetLinksDraft.map((link) => (
                <div className="contact-editor-row" key={link.short}>
                  <label>
                    <span>{link.name}</span>
                    <input
                      type="url"
                      value={link.url}
                      onChange={(event) => updatePlanetLink(link.short, event.target.value)}
                      placeholder="https://example.com/planet"
                      required
                    />
                  </label>
                </div>
              ))}
            </div>
            {planetLinksSaveStatus ? <p className="form-status" role="status">{planetLinksSaveStatus}</p> : null}
            <div className="form-actions">
              <button type="button" className="primary-btn" onClick={handleSavePlanetLinks}>Save Sun &amp; planet links</button>
            </div>
          </section>
        ) : null}

        {adminSection === 'access' ? (
          <section className="panel-card admin-list-panel access-gate-panel">
            <div className="panel-header">
              <div>
                <span className="section-tag">PRIVATE ENTRY</span>
                <h2>Access gate</h2>
              </div>
            </div>

            <div className="field-grid admin-field-grid">
              <label>
                <span>AY logo clicks</span>
                <input
                  type="number"
                  min="2"
                  max="20"
                  value={adminAccessDraft.logoClickCount}
                  onChange={(event) => updateAdminAccessDraft('logoClickCount', event.target.value)}
                />
              </label>
              <label>
                <span>Time window (seconds)</span>
                <input
                  type="number"
                  min="2"
                  max="30"
                  value={adminAccessDraft.logoClickWindowSeconds}
                  onChange={(event) => updateAdminAccessDraft('logoClickWindowSeconds', event.target.value)}
                />
              </label>
            </div>

            <div className="access-pattern-editor">
              <div className="panel-header">
                <div>
                  <span className="section-tag">UNLOCK SEQUENCE</span>
                  <h3>{adminAccessDraft.unlockPattern.length} points selected</h3>
                </div>
                <div className="mini-list-actions compact-actions">
                  <button type="button" className="ghost-btn" onClick={removeLastAdminUnlockPoint}>Undo</button>
                  <button type="button" className="ghost-btn" onClick={resetAdminUnlockPattern}>Reset</button>
                </div>
              </div>
              <div className="access-pattern-grid" aria-label="Configure unlock point order">
                {Array.from({ length: 9 }, (_, index) => {
                  const sequenceNumber = adminAccessDraft.unlockPattern.indexOf(index)
                  return (
                    <button
                      key={index}
                      type="button"
                      className={`access-pattern-point ${sequenceNumber >= 0 ? 'selected' : ''}`}
                      aria-label={`Pattern point ${index + 1}${sequenceNumber >= 0 ? `, step ${sequenceNumber + 1}` : ''}`}
                      aria-pressed={sequenceNumber >= 0}
                      onClick={() => addAdminUnlockPoint(index)}
                    >
                      {sequenceNumber >= 0 ? sequenceNumber + 1 : ''}
                    </button>
                  )
                })}
              </div>
            </div>

            {adminAccessSaveStatus ? <p className="form-status" role="status">{adminAccessSaveStatus}</p> : null}
            <div className="form-actions">
              <button type="button" className="primary-btn" onClick={saveAdminAccessSettings}>Save access settings</button>
            </div>
          </section>
        ) : null}

        {adminSection === 'about' ? (
          <form className="panel-card admin-form about-admin-form" onSubmit={handleSaveAbout}>
            <div className="panel-header">
              <div>
                <span className="section-tag">PUBLIC PROFILE</span>
                <h2>Edit About section</h2>
              </div>
              <button type="button" className="text-link" onClick={() => handleAdminAction('overview')}>Close</button>
            </div>

            <div className="field-grid admin-field-grid">
              <label>
                <span>Section heading</span>
                <input type="text" name="heading" value={aboutDraft.heading} onChange={handleAboutDraftChange} placeholder="About heading" />
              </label>
              <label>
                <span>Professional photo URL</span>
                <input type="url" name="photo" value={aboutDraft.photo} onChange={handleAboutDraftChange} placeholder="https://..." />
              </label>
            </div>
            <label>
              <span>Upload professional photo</span>
              <input type="file" accept="image/*" onChange={(event) => handleAboutImageUpload(event, 'photo', 0)} />
              {aboutDraft.photo ? <img className="about-upload-preview" src={aboutDraft.photo} alt="Professional photo preview" /> : <span className="upload-hint">Choose a portrait image</span>}
            </label>
            <label>
              <span>About biography</span>
              <textarea name="biography" value={aboutDraft.biography} onChange={handleAboutDraftChange} rows="5" placeholder="Write your professional introduction..." />
            </label>
            <label>
              <span>Homepage introduction</span>
              <textarea name="homepageIntro" value={aboutDraft.homepageIntro} onChange={handleAboutDraftChange} rows="4" maxLength="600" required placeholder="Write the introduction shown below your name on the homepage..." />
              <span className="upload-hint">This text appears in the main homepage hero section.</span>
            </label>

            {ABOUT_COLLECTIONS.map((collection) => (
              <section className="about-editor-collection" key={collection.key}>
                <div className="panel-header">
                  <h3>{collection.title}</h3>
                  <button type="button" className="secondary-btn small-btn" onClick={() => addAboutRecord(collection.key)}>Add item</button>
                </div>
                {(aboutDraft[collection.key] || []).map((record, index) => (
                  <div className="about-editor-record" key={`${collection.key}-${index}`}>
                    <div className="panel-header">
                      <strong>Item {String(index + 1).padStart(2, '0')}</strong>
                      <button type="button" className="danger-btn" onClick={() => removeAboutRecord(collection.key, index)}>Remove</button>
                    </div>
                    <div className="field-grid admin-field-grid">
                      {collection.fields.map((field) => (
                        <label key={field.key}>
                          <span>{field.label}</span>
                          {field.multiline ? (
                            <textarea rows="3" value={record[field.key] || ''} onChange={(event) => updateAboutRecord(collection.key, index, field.key, event.target.value)} />
                          ) : (
                            <input type={field.type || 'text'} value={record[field.key] || ''} onChange={(event) => updateAboutRecord(collection.key, index, field.key, event.target.value)} />
                          )}
                          {field.upload ? <input type="file" accept="image/*" onChange={(event) => handleAboutImageUpload(event, collection.key, index)} /> : null}
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </section>
            ))}

            {aboutSaveStatus ? <p className="form-status" role="status">{aboutSaveStatus}</p> : null}
            <div className="form-actions">
              <button type="submit" className="primary-btn">Save About section</button>
              <button type="button" className="secondary-btn" onClick={() => handleAdminAction('overview')}>Cancel</button>
            </div>
          </form>
        ) : null}

        {showExperienceForm ? (
          <form className="panel-card admin-form" onSubmit={handleSaveExperience}>
            <div className="panel-header">
              <h2>{editingExperienceIndex === null ? 'Add experience' : 'Edit experience'}</h2>
              <button type="button" className="text-link" onClick={() => { setShowExperienceForm(false); resetExperienceDraft() }}>Close</button>
            </div>
            <div className="field-grid admin-field-grid">
              <label><span>Company / organization</span><input name="company" value={experienceDraft.company} onChange={handleExperienceDraftChange} required /></label>
              <label><span>Role / position</span><input name="role" value={experienceDraft.role} onChange={handleExperienceDraftChange} required /></label>
              <label><span>Employment type</span><input name="type" value={experienceDraft.type} onChange={handleExperienceDraftChange} placeholder="Internship, freelance, volunteer..." /></label>
              <label><span>Dates</span><input name="dates" value={experienceDraft.dates} onChange={handleExperienceDraftChange} placeholder="Jan 2025 - Present" /></label>
              <label><span>Location</span><input name="location" value={experienceDraft.location} onChange={handleExperienceDraftChange} placeholder="City / Remote" /></label>
              <label><span>Featured image URL</span><input type="url" name="image" value={experienceDraft.image} onChange={handleExperienceDraftChange} placeholder="https://..." /></label>
            </div>
            <label>
              <span>Upload featured image</span>
              <input type="file" accept="image/*" onChange={(event) => handleEntryImageUpload(event, 'experience')} />
              {experienceDraft.image ? <img className="entry-upload-preview" src={experienceDraft.image} alt="Experience preview" /> : null}
            </label>
            <label><span>Role and experience details</span><textarea name="description" value={experienceDraft.description} onChange={handleExperienceDraftChange} rows="4" required /></label>
            <label><span>Key work / highlights (one per line)</span><textarea name="achievements" value={experienceDraft.achievements} onChange={handleExperienceDraftChange} rows="4" placeholder="Project or responsibility one&#10;Project or responsibility two" /></label>
            <label><span>Additional image URLs (one per line)</span><textarea name="images" value={experienceDraft.images} onChange={handleExperienceDraftChange} rows="3" placeholder="https://..." /></label>
            <label><span>Links (Label|https://... one per line)</span><textarea name="links" value={experienceDraft.links} onChange={handleExperienceDraftChange} rows="3" placeholder="Company|https://example.com" /></label>
            {experienceSaveStatus ? <p className="form-status" role="status">{experienceSaveStatus}</p> : null}
            <div className="form-actions">
              <button type="submit" className="primary-btn">{editingExperienceIndex === null ? 'Save experience' : 'Update experience'}</button>
              <button type="button" className="secondary-btn" onClick={() => { setShowExperienceForm(false); resetExperienceDraft() }}>Cancel</button>
            </div>
          </form>
        ) : null}

        {adminSection === 'experience' ? (
          <section className="panel-card admin-list-panel">
            <div className="panel-header">
              <h2>Experience</h2>
              <button type="button" className="primary-btn small-btn" onClick={() => { resetExperienceDraft(); setExperienceSaveStatus(''); setShowExperienceForm(true) }}>Add experience</button>
            </div>
            {!showExperienceForm && experienceSaveStatus ? <p className="form-status" role="status">{experienceSaveStatus}</p> : null}
            <div className="list-stack">
              {portfolio.experienceEntries.length ? portfolio.experienceEntries.map((item, index) => (
                <div className="mini-list-row" key={`${item.company}-${item.role}-${index}`}>
                  <div className="timeline-copy">
                    <strong>{item.role}</strong>
                    <span className="journey-location">{[item.company, item.type, item.dates].filter(Boolean).join(' / ')}</span>
                    <p>{item.description}</p>
                  </div>
                  <div className="mini-list-actions compact-actions">
                    <button type="button" className="ghost-btn" onClick={() => beginEditExperience(item, index)}>Edit</button>
                    <button type="button" className="danger-btn" onClick={() => handleDeleteExperience(index)}>Delete</button>
                  </div>
                </div>
              )) : <p className="empty-state">No experience entries yet.</p>}
            </div>
          </section>
        ) : null}

        {adminSection === 'achievements' ? (
          <>
            {showAchievementForm ? (
              <form className="panel-card admin-form" onSubmit={handleSaveAchievement}>
                <div className="panel-header">
                  <h2>{editingAchievementIndex === null ? 'Add achievement' : 'Edit achievement'}</h2>
                  <button type="button" className="text-link" onClick={() => { setShowAchievementForm(false); resetAchievementDraft() }}>Close</button>
                </div>
                <div className="field-grid admin-field-grid">
                  <label><span>Achievement title</span><input name="title" value={achievementDraft.title} onChange={handleAchievementDraftChange} required /></label>
                  <label><span>Organization</span><input name="organization" value={achievementDraft.organization} onChange={handleAchievementDraftChange} /></label>
                  <label><span>Date</span><input name="date" value={achievementDraft.date} onChange={handleAchievementDraftChange} placeholder="2026" /></label>
                  <label><span>Featured image URL</span><input type="url" name="image" value={achievementDraft.image} onChange={handleAchievementDraftChange} placeholder="https://..." /></label>
                </div>
                <label>
                  <span>Upload featured image</span>
                  <input type="file" accept="image/*" onChange={(event) => handleEntryImageUpload(event, 'achievement')} />
                  {achievementDraft.image ? <img className="entry-upload-preview" src={achievementDraft.image} alt="Achievement preview" /> : null}
                </label>
                <label><span>Achievement details</span><textarea name="description" value={achievementDraft.description} onChange={handleAchievementDraftChange} rows="4" required /></label>
                <label><span>Additional image URLs (one per line)</span><textarea name="images" value={achievementDraft.images} onChange={handleAchievementDraftChange} rows="3" placeholder="https://..." /></label>
                <label><span>Links (Label|https://... one per line)</span><textarea name="links" value={achievementDraft.links} onChange={handleAchievementDraftChange} rows="3" placeholder="View award|https://example.com" /></label>
                {achievementSaveStatus ? <p className="form-status" role="status">{achievementSaveStatus}</p> : null}
                <div className="form-actions">
                  <button type="submit" className="primary-btn">{editingAchievementIndex === null ? 'Save achievement' : 'Update achievement'}</button>
                  <button type="button" className="secondary-btn" onClick={() => { setShowAchievementForm(false); resetAchievementDraft() }}>Cancel</button>
                </div>
              </form>
            ) : null}

            <section className="panel-card admin-list-panel">
              <div className="panel-header">
                <h2>Achievements</h2>
                <button type="button" className="primary-btn small-btn" onClick={() => { resetAchievementDraft(); setAchievementSaveStatus(''); setShowAchievementForm(true) }}>Add achievement</button>
              </div>
              {!showAchievementForm && achievementSaveStatus ? <p className="form-status" role="status">{achievementSaveStatus}</p> : null}
              <div className="list-stack">
                {portfolio.achievements.length ? portfolio.achievements.map((item, index) => (
                  <div className="mini-list-row" key={`${item.title}-${index}`}>
                    <div className="timeline-copy">
                      <strong>{item.title}</strong>
                      <span className="journey-location">{[item.organization, item.date].filter(Boolean).join(' / ')}</span>
                      <p>{item.description}</p>
                    </div>
                    <div className="mini-list-actions compact-actions">
                      <button type="button" className="ghost-btn" onClick={() => beginEditAchievement(item, index)}>Edit</button>
                      <button type="button" className="danger-btn" onClick={() => handleDeleteAchievement(index)}>Delete</button>
                    </div>
                  </div>
                )) : <p className="empty-state">No achievements yet.</p>}
              </div>
            </section>
          </>
        ) : null}

        {showGalleryForm ? (
          <form className="panel-card admin-form" onSubmit={handleSaveGalleryItem}>
            <div className="panel-header">
              <h2>{editingGalleryIndex === null ? 'Add gallery image' : 'Edit gallery image'}</h2>
              <button type="button" className="text-link" onClick={() => { setShowGalleryForm(false); resetGalleryDraft() }}>Close</button>
            </div>
            <div className="field-grid admin-field-grid">
              <label>
                <span>Image caption</span>
                <input name="label" value={galleryDraft.label} onChange={handleGalleryDraftChange} placeholder="Studio project" />
              </label>
              <label>
                <span>Image URL</span>
                <input type="url" name="url" value={galleryDraft.url} onChange={handleGalleryDraftChange} placeholder="https://..." />
              </label>
              <label>
                <span>Tile layout</span>
                <select name="tone" value={galleryDraft.tone} onChange={handleGalleryDraftChange}>
                  <option value="normal">Standard</option>
                  <option value="tall">Tall</option>
                  <option value="wide">Wide</option>
                </select>
              </label>
            </div>
            <label>
              <span>Upload image</span>
              <input type="file" accept="image/*" onChange={handleGalleryImageUpload} />
            </label>
            {galleryDraft.url ? <img className="gallery-upload-preview" src={galleryDraft.url} alt={galleryDraft.label || 'Gallery image preview'} /> : null}
            {gallerySaveStatus ? <p className="form-status" role="status">{gallerySaveStatus}</p> : null}
            <div className="form-actions">
              <button type="submit" className="primary-btn">{editingGalleryIndex === null ? 'Save gallery image' : 'Update gallery image'}</button>
              <button type="button" className="secondary-btn" onClick={() => { setShowGalleryForm(false); resetGalleryDraft() }}>Cancel</button>
            </div>
          </form>
        ) : null}

        {adminSection === 'gallery' ? (
          <section className="panel-card admin-list-panel">
            <div className="panel-header">
              <h2>Gallery Images</h2>
              <button type="button" className="primary-btn small-btn" onClick={() => { resetGalleryDraft(); setGallerySaveStatus(''); setShowGalleryForm(true) }}>Add image</button>
            </div>
            {!showGalleryForm && gallerySaveStatus ? <p className="form-status" role="status">{gallerySaveStatus}</p> : null}
            <div className="gallery-admin-list">
              {portfolio.galleryItems.length ? portfolio.galleryItems.map((item, index) => (
                <article className="gallery-admin-row" key={`${item.label}-${index}`}>
                  {(item.url || item.image) ? <img src={item.url || item.image} alt={item.label || 'Gallery preview'} loading="lazy" decoding="async" /> : <div className="gallery-admin-placeholder" aria-hidden="true" />}
                  <div className="gallery-admin-copy">
                    <strong>{item.label || 'Gallery image'}</strong>
                    <span>{item.tone || 'normal'} tile</span>
                    {item.url || item.image ? <small>{item.url || item.image}</small> : <small>No image uploaded</small>}
                  </div>
                  <div className="mini-list-actions compact-actions">
                    <button type="button" className="ghost-btn" onClick={() => beginEditGalleryItem(item, index)}>Edit</button>
                    <button type="button" className="danger-btn" onClick={() => handleDeleteGalleryItem(index)}>Delete</button>
                  </div>
                </article>
              )) : <p className="empty-state">No gallery images yet.</p>}
            </div>
          </section>
        ) : null}

        {adminSection === 'contact' ? (
          <section className="panel-card admin-list-panel contact-editor-panel">
            <div className="panel-header">
              <div>
                <span className="section-tag">PUBLIC CONTACTS</span>
                <h2>Contact methods</h2>
              </div>
              <button type="button" className="primary-btn small-btn" onClick={addContactLink}>Add contact</button>
            </div>
            <div className="contact-editor-list">
              {contactLinksDraft.map((item, index) => (
                <div className="contact-editor-row" key={`${item.type}-${item.value}-${index}`}>
                  <label>
                    <span>Display label</span>
                    <input value={item.label} onChange={(event) => updateContactLink(index, 'label', event.target.value)} placeholder="GitHub" />
                  </label>
                  <label>
                    <span>Type</span>
                    <select value={item.type} onChange={(event) => updateContactLink(index, 'type', event.target.value)}>
                      <option value="email">Email</option>
                      <option value="github">GitHub</option>
                      <option value="linkedin">LinkedIn</option>
                      <option value="website">Website / other</option>
                    </select>
                  </label>
                  <label>
                    <span>{item.type === 'email' ? 'Email address' : 'Destination URL'}</span>
                    <input
                      type={item.type === 'email' ? 'email' : 'url'}
                      value={item.value}
                      onChange={(event) => updateContactLink(index, 'value', event.target.value)}
                      placeholder={item.type === 'email' ? 'name@example.com' : 'https://...'}
                    />
                  </label>
                  <button type="button" className="danger-btn" onClick={() => removeContactLink(index)}>Delete</button>
                </div>
              ))}
              {!contactLinksDraft.length ? <p className="empty-state">No contact methods. Add one to show it publicly.</p> : null}
            </div>
            {contactSaveStatus ? <p className="form-status" role="status">{contactSaveStatus}</p> : null}
            <div className="form-actions">
              <button type="button" className="primary-btn" onClick={handleSaveContactLinks}>Save contact details</button>
            </div>
          </section>
        ) : null}

        {adminSection === 'effects' ? (
          <section className="panel-card effect-admin-panel">
            <div className="panel-header">
              <div>
                <span className="section-tag">SITE MOTION</span>
                <h2>Choose a portfolio animation style</h2>
              </div>
            </div>

            <div className="boot-animation-setting">
              <div>
                <span className="section-tag">STARTUP EXPERIENCE</span>
                <h3>Code boot animation</h3>
                <p>Show the animated code loading screen and automatic page tour when the website opens.</p>
              </div>
              <button
                type="button"
                className={`section-toggle ${isBootAnimationEnabledState ? 'enabled' : 'disabled'}`}
                aria-pressed={isBootAnimationEnabledState}
                onClick={toggleBootAnimation}
              >
                <span>Boot animation</span>
                <strong>{isBootAnimationEnabledState ? 'On' : 'Off'}</strong>
              </button>
            </div>

            <section className="edge-motion-panel">
              <div className="panel-header">
                <div>
                  <span className="section-tag">HEADER & FOOTER</span>
                  <h3>Edge Motion</h3>
                </div>
              </div>

              <div className="edge-style-grid">
                {EDGE_ANIMATION_STYLES.map((style) => (
                  <button
                    key={style.id}
                    type="button"
                    className={`edge-style-option ${portfolio.edgeAnimationSettings?.style === style.id ? 'selected' : ''}`}
                    onClick={() => updateEdgeAnimationSetting('style', style.id)}
                  >
                    <strong>{style.name}</strong>
                    <span>{style.description}</span>
                  </button>
                ))}
              </div>

              <div className="edge-motion-controls">
                <div className="effect-control-block">
                  <div className="effect-control-header">
                    <label htmlFor="edge-motion-speed">Loop speed</label>
                    <strong>{portfolio.edgeAnimationSettings?.speedSeconds || DEFAULT_EDGE_ANIMATION_SETTINGS.speedSeconds}s</strong>
                  </div>
                  <input
                    id="edge-motion-speed"
                    type="range"
                    min="2"
                    max="20"
                    step="1"
                    value={portfolio.edgeAnimationSettings?.speedSeconds || DEFAULT_EDGE_ANIMATION_SETTINGS.speedSeconds}
                    onChange={(event) => updateEdgeAnimationSetting('speedSeconds', Number(event.target.value))}
                  />
                </div>

                <div className="edge-color-control">
                  <span>Accent color</span>
                  <div className="edge-color-options">
                    {EDGE_COLOR_SWATCHES.map((color) => (
                      <button
                        key={color}
                        type="button"
                        className={`edge-color-swatch ${portfolio.edgeAnimationSettings?.color === color ? 'selected' : ''}`}
                        style={{ '--swatch-color': color }}
                        aria-label={`Use color ${color}`}
                        aria-pressed={portfolio.edgeAnimationSettings?.color === color}
                        onClick={() => updateEdgeAnimationSetting('color', color)}
                      />
                    ))}
                    <label className="edge-custom-color">
                      <span>Custom</span>
                      <input
                        type="color"
                        value={portfolio.edgeAnimationSettings?.color || DEFAULT_EDGE_ANIMATION_SETTINGS.color}
                        onChange={(event) => updateEdgeAnimationSetting('color', event.target.value)}
                        aria-label="Choose custom edge color"
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div className="edge-scope-control">
                <span>Apply to</span>
                <div className="edge-scope-options" role="group" aria-label="Edge animation scope">
                  {[
                    { id: 'header', name: 'Header only' },
                    { id: 'footer', name: 'Footer only' },
                    { id: 'both', name: 'Both' },
                  ].map((scope) => (
                    <button
                      key={scope.id}
                      type="button"
                      className={`edge-scope-option ${portfolio.edgeAnimationSettings?.scope === scope.id ? 'selected' : ''}`}
                      aria-pressed={portfolio.edgeAnimationSettings?.scope === scope.id}
                      onClick={() => updateEdgeAnimationSetting('scope', scope.id)}
                    >
                      {scope.name}
                    </button>
                  ))}
                </div>
              </div>

              <div
                className="edge-motion-preview"
                data-edge-style={portfolio.edgeAnimationSettings?.style || DEFAULT_EDGE_ANIMATION_SETTINGS.style}
                data-edge-scope={portfolio.edgeAnimationSettings?.scope || DEFAULT_EDGE_ANIMATION_SETTINGS.scope}
                style={{
                  '--edge-color': portfolio.edgeAnimationSettings?.color || DEFAULT_EDGE_ANIMATION_SETTINGS.color,
                  '--edge-speed': `${portfolio.edgeAnimationSettings?.speedSeconds || DEFAULT_EDGE_ANIMATION_SETTINGS.speedSeconds}s`,
                }}
                aria-label="Live header and footer edge animation preview"
              >
                <div className="edge-preview-bar edge-preview-header">Header</div>
                <div className="edge-preview-bar edge-preview-footer">Footer</div>
              </div>

              {edgeAnimationSaveStatus ? <p className="form-status" role="status">{edgeAnimationSaveStatus}</p> : null}
              <div className="form-actions">
                <button type="button" className="primary-btn" onClick={saveEdgeAnimationSettings}>Save edge motion</button>
              </div>
            </section>

            <section className="site-motion-controls">
              <div className="panel-header">
                <div>
                  <span className="section-tag">SITE-WIDE CONTROLS</span>
                  <h3>Animation speed & brightness</h3>
                </div>
              </div>
              <div className="site-motion-control-grid">
                <div className="effect-control-block">
                  <div className="effect-control-header">
                    <label htmlFor="site-motion-speed">Animation speed</label>
                    <strong>{(portfolio.motionSettings?.speed ?? DEFAULT_SITE_MOTION_SETTINGS.speed).toFixed(1)}x</strong>
                  </div>
                  <input
                    id="site-motion-speed"
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={portfolio.motionSettings?.speed ?? DEFAULT_SITE_MOTION_SETTINGS.speed}
                    onChange={(event) => updateMotionSetting('speed', Number(event.target.value))}
                  />
                  <div className="motion-range-labels"><span>Slower</span><span>Faster</span></div>
                </div>
                <div className="effect-control-block">
                  <div className="effect-control-header">
                    <label htmlFor="site-motion-brightness">Animation brightness</label>
                    <strong>{portfolio.motionSettings?.brightness ?? DEFAULT_SITE_MOTION_SETTINGS.brightness}%</strong>
                  </div>
                  <input
                    id="site-motion-brightness"
                    type="range"
                    min="50"
                    max="150"
                    step="5"
                    value={portfolio.motionSettings?.brightness ?? DEFAULT_SITE_MOTION_SETTINGS.brightness}
                    onChange={(event) => updateMotionSetting('brightness', Number(event.target.value))}
                  />
                  <div className="motion-range-labels"><span>Darker</span><span>Brighter</span></div>
                </div>
              </div>
              {motionSettingsSaveStatus ? <p className="form-status" role="status">{motionSettingsSaveStatus}</p> : null}
              <div className="form-actions">
                <button type="button" className="primary-btn" onClick={saveMotionSettings}>Save motion settings</button>
              </div>
            </section>

            <div className="preset-grid">
              {MOTION_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  className={`preset-card ${portfolio.visualEffect === preset.effect && portfolio.visualIntensity === preset.intensity && portfolio.visualScope === preset.scope ? 'selected' : ''}`}
                  onClick={() => applyMotionPreset(preset)}
                >
                  <div className="preset-header">
                    <strong>{preset.name}</strong>
                    <span>{preset.effect}</span>
                  </div>
                  <p>{preset.description}</p>
                </button>
              ))}
            </div>

            <div className="effect-control-block">
              <div className="effect-control-header">
                <span>Motion intensity</span>
                <strong>{portfolio.visualIntensity || 72}%</strong>
              </div>
              <input
                type="range"
                min="25"
                max="100"
                step="1"
                value={portfolio.visualIntensity || 72}
                onChange={(event) => handleIntensitySelection(Number(event.target.value))}
                aria-label="Motion intensity"
              />
            </div>

            <div className="effect-scope-grid">
              {MOTION_SCOPES.map((scope) => (
                <button
                  type="button"
                  key={scope.id}
                  className={`scope-option ${portfolio.visualScope === scope.id ? 'selected' : ''}`}
                  onClick={() => handleScopeSelection(scope.id)}
                >
                  <strong>{scope.name}</strong>
                  <span>{scope.description}</span>
                </button>
              ))}
            </div>

            <div className="theme-save-panel">
              <div className="theme-save-header">
                <span>Save custom theme</span>
              </div>
              <div className="theme-save-controls">
                <input
                  type="text"
                  value={customThemeName}
                  onChange={(event) => setCustomThemeName(event.target.value)}
                  placeholder="My premium theme"
                  aria-label="Custom motion theme name"
                />
                <button type="button" className="primary-btn" onClick={saveCustomMotionTheme}>Save theme</button>
              </div>
            </div>

            <div className="section-toggle-grid">
              {Object.keys(SECTION_MOTION_DEFAULTS).map((sectionKey) => (
                <button
                  key={sectionKey}
                  type="button"
                  className={`section-toggle ${sectionMotion[sectionKey] ? 'enabled' : 'disabled'}`}
                  onClick={() => handleSectionMotionToggle(sectionKey)}
                >
                  <span>{sectionKey}</span>
                  <strong>{sectionMotion[sectionKey] ? 'On' : 'Off'}</strong>
                </button>
              ))}
            </div>

            {customThemes.length ? (
              <div className="custom-theme-list">
                {customThemes.map((theme) => (
                  <div key={theme.id} className="custom-theme-item">
                    <div className="custom-theme-preview" aria-hidden="true">
                      <span className={`theme-swatch theme-swatch-${theme.effect || 'aurora'}`} />
                    </div>
                    <div className="custom-theme-copy">
                      <strong>{theme.name}</strong>
                      <span>{theme.effect} • {theme.scope} • {theme.intensity || 72}%</span>
                    </div>
                    <div className="custom-theme-actions">
                      <button type="button" className="secondary-btn" onClick={() => applySavedMotionTheme(theme)}>Apply</button>
                      <button type="button" className="danger-btn" onClick={() => removeSavedMotionTheme(theme.id)}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}

            <div className="effect-grid">
              {EFFECT_OPTIONS.map((effect) => (
                <button
                  key={effect.id}
                  type="button"
                  className={`effect-option ${portfolio.visualEffect === effect.id ? 'selected' : ''}`}
                  onClick={() => handleEffectSelection(effect.id)}
                >
                  <div className="effect-option-header">
                    <span className={`effect-accent accent-${effect.accent}`} aria-hidden="true" />
                    <strong>{effect.name}</strong>
                  </div>
                  <p>{effect.description}</p>
                  <div className={`effect-preview effect-preview-${effect.id}`} aria-hidden="true">
                    <span className="effect-orb orb-one" />
                    <span className="effect-orb orb-two" />
                    <span className="effect-orb orb-three" />
                  </div>
                </button>
              ))}
            </div>

            <div className="effect-live-preview">
              <div
                className={`effect-preview-scene effect-scene-${portfolio.visualEffect || 'aurora'}`}
                data-preview-scope={portfolio.visualScope || 'all'}
                data-preview-effect={portfolio.visualEffect || 'aurora'}
                style={{ '--preview-strength': String((Number(portfolio.visualIntensity) || 72) / 100) }}
              >
                <div className="scene-panel">
                  <span className="scene-tag">
                    {MOTION_SCOPES.find((scope) => scope.id === (portfolio.visualScope || 'all'))?.name || 'Full site'} / {EFFECT_OPTIONS.find((effect) => effect.id === (portfolio.visualEffect || 'aurora'))?.name || 'Aurora Drift'}
                  </span>
                  <h3>{EFFECT_OPTIONS.find((effect) => effect.id === (portfolio.visualEffect || 'aurora'))?.name || 'Aurora Drift'}</h3>
                  <div className="scene-content">
                    <span className="scene-pill">UI</span>
                    <span className="scene-pill">Build</span>
                    <span className="scene-pill">Design</span>
                  </div>
                  <div className="scene-reading">
                    <span>Intensity {portfolio.visualIntensity || 72}%</span>
                    <div className="scene-meter" aria-label="Selected motion intensity">
                      <i style={{ width: `${portfolio.visualIntensity || 72}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button type="button" className="secondary-btn" onClick={resetMotionSettings}>Reset motion defaults</button>
            </div>
          </section>
        ) : null}

        {showProjectForm ? (
          <form className="panel-card admin-form" onSubmit={handleAddProject}>
            <div className="panel-header">
              <h2>{editingProjectId ? 'Edit project' : 'Add a new project'}</h2>
              <button type="button" className="text-link" onClick={() => { setShowProjectForm(false); resetProjectDraft() }}>Close</button>
            </div>
            <div className="field-grid admin-field-grid">
              <label>
                <span>Project title</span>
                <input type="text" name="title" value={projectDraft.title} onChange={handleProjectDraftChange} placeholder="Project title" required />
              </label>
              <label>
                <span>Category</span>
                <select name="category" value={projectDraft.category} onChange={handleProjectDraftChange}>
                  <option value="Web Experience">Web Experience</option>
                  <option value="Product Design">Product Design</option>
                  <option value="Creative Build">Creative Build</option>
                </select>
              </label>
            </div>
            <label>
              <span>Description</span>
              <textarea name="description" value={projectDraft.description} onChange={handleProjectDraftChange} rows="4" placeholder="Describe the project" required />
            </label>
            <label>
              <span>Website link</span>
              <input type="url" name="website" value={projectDraft.website} onChange={handleProjectDraftChange} placeholder="https://example.com" />
            </label>
            <label>
              <span>Repository URL</span>
              <input type="url" name="repository" value={projectDraft.repository} onChange={handleProjectDraftChange} placeholder="https://github.com/username/project" />
            </label>

            <div className="field-grid admin-field-grid media-upload-grid">
              <label>
                <span>Project image</span>
                <input type="file" accept="image/*" onChange={(event) => handleProjectMediaUpload(event, 'image')} />
                {projectDraft.image ? <img className="upload-preview" src={projectDraft.image} alt="Project preview" /> : <span className="upload-hint">Upload a cover image</span>}
              </label>
              <label>
                <span>Project video</span>
                <input type="file" accept="video/*" onChange={(event) => handleProjectMediaUpload(event, 'video')} />
                {projectDraft.video ? (
                  <video
                    className="upload-preview"
                    src={projectDraft.video}
                    poster={projectDraft.image || undefined}
                    controls
                    muted
                    autoPlay
                    loop
                    playsInline
                    preload="metadata"
                  />
                ) : (
                  <span className="upload-hint">Upload a promo video</span>
                )}
              </label>
            </div>
            {mediaUploadStatus ? <p className="form-status" role="status">{mediaUploadStatus}</p> : null}
            <div className="field-grid admin-field-grid media-upload-grid">
              {['Editorial', 'Web', 'Build', 'Studio', 'Process', 'Draft'].map((label, index) => (
                <label key={label}>
                  <span>Gallery: {label}</span>
                  <input type="file" accept="image/*" onChange={(event) => handleProjectMediaUpload(event, `gallery-${index}`)} />
                  {projectDraft.gallery[index] ? <img className="upload-preview" src={projectDraft.gallery[index]} alt={`${label} gallery preview`} /> : <span className="upload-hint">Upload {label.toLowerCase()} image</span>}
                </label>
              ))}
            </div>
            <div className="detail-editor-grid">
              <label>
                <span>The Problem</span>
                <textarea name="problem" value={projectDraft.problem} onChange={handleProjectDraftChange} rows="3" placeholder="What problem did this project solve?" />
              </label>
              <label>
                <span>The Approach</span>
                <textarea name="approach" value={projectDraft.approach} onChange={handleProjectDraftChange} rows="3" placeholder="How did you approach it?" />
              </label>
              <label>
                <span>Key Features</span>
                <textarea name="features" value={projectDraft.features} onChange={handleProjectDraftChange} rows="3" placeholder="Feature one, Feature two" />
              </label>
              <label>
                <span>My Role</span>
                <input type="text" name="role" value={projectDraft.role} onChange={handleProjectDraftChange} placeholder="Designer and developer" />
              </label>
              <label>
                <span>Challenges</span>
                <textarea name="challenges" value={projectDraft.challenges} onChange={handleProjectDraftChange} rows="3" placeholder="Challenge one, Challenge two" />
              </label>
              <label>
                <span>Solution</span>
                <textarea name="solution" value={projectDraft.solution} onChange={handleProjectDraftChange} rows="3" placeholder="What solution did you deliver?" />
              </label>
              <label>
                <span>Results</span>
                <textarea name="results" value={projectDraft.results} onChange={handleProjectDraftChange} rows="3" placeholder="Result one, Result two" />
              </label>
            </div>
            <div className="field-grid admin-field-grid">
              <label>
                <span>Tech stack</span>
                <input type="text" name="tech" value={projectDraft.tech} onChange={handleProjectDraftChange} placeholder="React, Tailwind, Express" />
              </label>
              <label>
                <span>Status</span>
                <select name="status" value={projectDraft.status} onChange={handleProjectDraftChange}>
                  <option value="Draft">Draft</option>
                  <option value="Prototype">Prototype</option>
                  <option value="Live concept">Live concept</option>
                </select>
              </label>
            </div>
            <div className="form-actions">
              <button type="submit" className="primary-btn">{editingProjectId ? 'Update project' : 'Save project'}</button>
              <button type="button" className="secondary-btn" onClick={() => { setShowProjectForm(false); resetProjectDraft() }}>Cancel</button>
            </div>
          </form>
        ) : null}

        {adminSection === 'overview' ? (
          <>
            <section className="admin-panels">
              <article className="panel-card large-panel">
                <div className="panel-header">
                  <h2>Recent activity</h2>
                  <span>Today</span>
                </div>
                <ul className="activity-list">
                  <li>Portfolio homepage layout refreshed</li>
                  <li>Project detail structure updated</li>
                  <li>Theme system reviewed for light mode</li>
                  <li>Messages queue checked for unread entries</li>
                </ul>
              </article>

              <article className="panel-card">
                <div className="panel-header">
                  <h2>Quick actions</h2>
                </div>
                <div className="action-stack">
                  <button type="button" className="secondary-btn" onClick={() => handleAdminAction('project')}>Add Project</button>
                  <button type="button" className="secondary-btn" onClick={() => handleAdminAction('resume')}>Update Resume</button>
                  <button type="button" className="secondary-btn" onClick={() => handleAdminAction('messages')}>Review Messages</button>
                </div>
              </article>
            </section>

            <section className="admin-panels lower-row">
              <article className="panel-card">
                <div className="panel-header">
                  <h2>Content completion</h2>
                </div>
                <div className="progress-list">
                  <div><span>Profile</span><strong>90%</strong></div>
                  <div><span>Homepage</span><strong>96%</strong></div>
                  <div><span>Projects</span><strong>82%</strong></div>
                  <div><span>SEO</span><strong>71%</strong></div>
                </div>
              </article>

              <article className="panel-card">
                <div className="panel-header">
                  <h2>Upcoming work</h2>
                </div>
                <ul className="activity-list compact-list">
                  <li>Finalize skill taxonomy</li>
                  <li>Publish resume update</li>
                  <li>Review certificate archive</li>
                </ul>
              </article>
            </section>
          </>
        ) : null}

        {adminSection === 'projects' ? (
          <section className="panel-card admin-list-panel">
            <div className="panel-header">
              <h2>Project list</h2>
              <button type="button" className="primary-btn small-btn" onClick={() => { resetProjectDraft(); setShowProjectForm(true) }}>Add project</button>
            </div>
            <div className="list-stack">
              {portfolio.projects.map((project) => (
                <div key={project.id} className="mini-list-row">
                  <div className="mini-list-content">
                    <div className="mini-list-header">
                      <strong>{project.title}</strong>
                      <span className="status-badge">{project.status}</span>
                    </div>
                    <span className="mini-list-meta">{project.category}</span>
                    <p>{project.description}</p>
                  </div>
                  <div className="mini-list-actions">
                    <button type="button" className="secondary-btn small-btn" onClick={() => openProject(project.id)}>Open</button>
                    <button type="button" className="ghost-btn" onClick={() => beginEditProject(project)}>Edit</button>
                    <button type="button" className="danger-btn" onClick={() => handleDeleteProject(project.id)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {showSkillForm ? (
          <form className="panel-card admin-form" onSubmit={handleAddSkillGroup}>
            <div className="panel-header">
              <h2>{editingSkillIndex !== null ? 'Edit skill group' : 'Add skill group'}</h2>
              <button type="button" className="text-link" onClick={() => { setShowSkillForm(false); resetSkillDraft() }}>Close</button>
            </div>
            <label>
              <span>Group label</span>
              <input type="text" name="label" value={skillDraft.label} onChange={handleSkillDraftChange} placeholder="01 FRONTEND" required />
            </label>
            <label>
              <span>Skills</span>
              <textarea name="skills" value={skillDraft.skills} onChange={handleSkillDraftChange} rows="4" placeholder="React, Vite, Tailwind, Framer Motion" required />
            </label>
            <div className="form-actions">
              <button type="submit" className="primary-btn">{editingSkillIndex !== null ? 'Update group' : 'Save group'}</button>
              <button type="button" className="secondary-btn" onClick={() => { setShowSkillForm(false); resetSkillDraft() }}>Cancel</button>
            </div>
          </form>
        ) : null}

        {adminSection === 'skills' ? (
          <section className="panel-card admin-list-panel">
            <div className="panel-header">
              <h2>Skill stack</h2>
              <button type="button" className="primary-btn small-btn" onClick={() => { resetSkillDraft(); setShowSkillForm(true) }}>Add group</button>
            </div>
            <div className="list-stack">
              {portfolio.toolkitGroups.map((group, index) => (
                <div key={`${group.label}-${index}`} className="skill-block">
                  <div className="skill-block-header">
                    <strong>{group.label}</strong>
                    <div className="mini-list-actions compact-actions">
                      <button type="button" className="ghost-btn" onClick={() => beginEditSkillGroup(group, index)}>Edit</button>
                      <button type="button" className="danger-btn" onClick={() => handleDeleteSkillGroup(index)}>Delete</button>
                    </div>
                  </div>
                  <div className="tag-list">
                    {group.skills.map((skill) => <span key={`${group.label}-${skill}`}>{skill}</span>)}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {showJourneyForm ? (
          <form className="panel-card admin-form" onSubmit={handleAddJourney}>
            <div className="panel-header">
              <h2>{editingJourneyId !== null ? 'Edit journey entry' : 'Add journey entry'}</h2>
              <button type="button" className="text-link" onClick={() => { setShowJourneyForm(false); resetJourneyDraft() }}>Close</button>
            </div>
            <div className="field-grid admin-field-grid">
              <label>
                <span>Year</span>
                <input type="text" name="year" value={journeyDraft.year} onChange={handleJourneyDraftChange} placeholder="2026" required />
              </label>
              <label>
                <span>Title</span>
                <input type="text" name="title" value={journeyDraft.title} onChange={handleJourneyDraftChange} placeholder="Learning foundations" required />
              </label>
            </div>
            <div className="field-grid admin-field-grid">
              <label>
                <span>Location</span>
                <input type="text" name="location" value={journeyDraft.location} onChange={handleJourneyDraftChange} placeholder="Remote / India" />
              </label>
              <label>
                <span>Featured image</span>
                <input type="url" name="image" value={journeyDraft.image} onChange={handleJourneyDraftChange} placeholder="https://..." />
              </label>
            </div>
            <label>
              <span>Description</span>
              <textarea name="description" value={journeyDraft.description} onChange={handleJourneyDraftChange} rows="4" placeholder="Short summary for the timeline..." required />
            </label>
            <label>
              <span>Details</span>
              <textarea name="detail" value={journeyDraft.detail} onChange={handleJourneyDraftChange} rows="4" placeholder="Add a richer story or notes for this phase..." />
            </label>
            <label>
              <span>Additional images</span>
              <textarea name="images" value={journeyDraft.images} onChange={handleJourneyDraftChange} rows="3" placeholder="Paste image URLs separated by commas or new lines" />
            </label>
            <label>
              <span>Links</span>
              <textarea name="links" value={journeyDraft.links} onChange={handleJourneyDraftChange} rows="3" placeholder="Project|https://example.com or https://example.com" />
            </label>
            <div className="form-actions">
              <button type="submit" className="primary-btn">{editingJourneyId !== null ? 'Update entry' : 'Save entry'}</button>
              <button type="button" className="secondary-btn" onClick={() => { setShowJourneyForm(false); resetJourneyDraft() }}>Cancel</button>
            </div>
          </form>
        ) : null}

        {adminSection === 'journey' ? (
          <section className="panel-card admin-list-panel">
            <div className="panel-header">
              <h2>Journey timeline</h2>
              <button type="button" className="primary-btn small-btn" onClick={() => { resetJourneyDraft(); setShowJourneyForm(true) }}>Add entry</button>
            </div>
            <div className="list-stack">
              {portfolio.journeyEvents.map((event, index) => (
                <div key={`${event.year}-${event.title}-${index}`} className="mini-list-row timeline-row">
                  <div className="timeline-year-block">{event.year}</div>
                  <div className="timeline-copy">
                    <strong>{event.title}</strong>
                    {event.location ? <span className="journey-location">{event.location}</span> : null}
                    <p>{event.description}</p>
                    {event.detail ? <p className="journey-detail">{event.detail}</p> : null}
                  </div>
                  <div className="mini-list-actions compact-actions">
                    <button type="button" className="ghost-btn" onClick={() => beginEditJourney(event, index)}>Edit</button>
                    <button type="button" className="danger-btn" onClick={() => handleDeleteJourney(index)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {adminSection === 'messages' ? (
          <section className="panel-card admin-list-panel">
            <div className="panel-header">
              <h2>Inbound messages</h2>
              <button type="button" className="ghost-btn" onClick={() => setMessages((current) => current.map((message) => ({ ...message, read: true })))}>Mark all as read</button>
            </div>
            <div className="list-stack message-stack">
              {messages.map((message) => (
                <div key={message.id} className={`message-card ${message.read ? 'read' : 'unread'}`}>
                  <div className="message-header">
                    <div>
                      <strong>{message.sender}</strong>
                      <span>{message.email}</span>
                    </div>
                    <span className="message-date">{message.date}</span>
                  </div>
                  <p className="message-subject">{message.subject}</p>
                  <p className="message-copy">{message.message}</p>
                  <div className="message-meta">
                    <span className={`status-badge ${message.read ? 'neutral' : 'highlight'}`}>{message.read ? 'Read' : 'Unread'}</span>
                    <div className="message-actions">
                      <button type="button" className="ghost-btn" onClick={() => setMessages((current) => current.map((item) => item.id === message.id ? { ...item, read: true } : item))}>Mark as read</button>
                      <button type="button" className="danger-btn" onClick={() => setMessages((current) => current.filter((item) => item.id !== message.id))}>Delete</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        <div className="admin-status-bar">{resumeStatus}</div>
      </main>
    </div>
    )
  }

  return (
    <>
      <SiteBootLoader visible={isSiteBooting} />
      <div id="page-top" className="site-shell">{view === 'home' ? renderHome() : view === 'project' ? renderProjectDetail() : renderAdmin()}</div>
    </>
  )
}

export default App
