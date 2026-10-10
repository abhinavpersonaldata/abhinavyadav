import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { lookup } from 'node:dns/promises'
import http from 'node:http'
import https from 'node:https'
import { isIP } from 'node:net'
import { v2 as cloudinary } from 'cloudinary'
import multer from 'multer'
import mongoose from 'mongoose'

dotenv.config({ path: '../.env.local' })
dotenv.config({ path: '.env.local' })
dotenv.config()

const app = express()
const port = Number(process.env.PORT || 4000)
const configuredOrigins = (process.env.CLIENT_URL || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

const isAllowedOrigin = (origin) => {
  if (!origin) return true

  return configuredOrigins.includes(origin)
    || /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin)
    || /\.vercel\.app$/i.test(origin)
    || /\.onrender\.com$/i.test(origin)
    || /\.render\.com$/i.test(origin)
}

app.use(cors({
  origin: (origin, callback) => {
    if (isAllowedOrigin(origin)) {
      callback(null, true)
      return
    }

    callback(null, false)
  },
  credentials: true,
}))
app.use(express.json())

const renderKeepaliveUrl = process.env.RENDER_EXTERNAL_URL ? `${process.env.RENDER_EXTERNAL_URL.replace(/\/$/, '')}/api/health` : null

const keepAliveRender = async () => {
  if (!renderKeepaliveUrl) {
    return
  }

  try {
    const response = await fetch(renderKeepaliveUrl, { method: 'GET', headers: { 'Cache-Control': 'no-cache' } })
    console.log(`[keepalive] Render ping OK: ${response.status}`)
  } catch (error) {
    console.warn('[keepalive] Render ping failed:', error.message)
  }
}

const keepAliveMongo = async () => {
  if (mongoose.connection.readyState !== 1 || !mongoose.connection.db) {
    return
  }

  try {
    await mongoose.connection.db.admin().ping()
    console.log('[keepalive] MongoDB ping OK')
  } catch (error) {
    console.warn('[keepalive] MongoDB ping failed:', error.message)
  }
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter: (req, file, callback) => {
    const extension = file.originalname.split('.').pop()?.toLowerCase()
    const supportedResumeExtensions = new Set(['pdf', 'doc', 'docx', 'odt', 'rtf', 'txt', 'html', 'htm'])
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/') || supportedResumeExtensions.has(extension)) {
      callback(null, true)
      return
    }

    callback(new Error('Upload an image, video, PDF, Word, RTF, text, or HTML file.'))
  },
})

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
  timeout: 180000,
})

const messagesStore = []
const projectSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  data: { type: mongoose.Schema.Types.Mixed, required: true },
}, { timestamps: true })
const Project = mongoose.models.Project || mongoose.model('Project', projectSchema)
const portfolioContentSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  data: { type: mongoose.Schema.Types.Mixed, required: true },
}, { timestamps: true })
const PortfolioContent = mongoose.models.PortfolioContent || mongoose.model('PortfolioContent', portfolioContentSchema)
let aboutStorage = 'default'
let adminAccessSettingsStorage = 'default'
let homepageSettingsStorage = 'default'
let edgeAnimationSettingsStorage = 'default'
let motionSettingsStorage = 'default'

const portfolioData = {
  profile: {
    name: 'Abhinav Yadav',
    title: 'Frontend Developer • UI Engineer • CSE Diploma Student',
    location: 'India',
    email: 'abhinavyadav.contact@gmail.com',
    github: 'https://github.com/abhinavpersonaldata',
    linkedin: 'https://www.linkedin.com',
  },
  contactLinks: [
    { label: 'Email', type: 'email', value: 'abhinavyadav.contact@gmail.com' },
    { label: 'GitHub', type: 'github', value: 'https://github.com/abhinavpersonaldata' },
    { label: 'LinkedIn', type: 'linkedin', value: 'https://www.linkedin.com' },
  ],
  resumeEntries: [{
    title: 'Abhinav Yadav Resume',
    url: '/resume/Abhinav-Yadav-Resume.pdf',
    fileName: 'Abhinav-Yadav-Resume.pdf',
    fileType: 'application/pdf',
    displayMode: 'normal',
  }],
  planetLinks: [
    { name: 'Sun', short: 'sun', url: 'https://nineplanets.org/solar-system/' },
    { name: 'Mercury', short: 'mercury', url: 'https://nineplanets.org/mercury/' },
    { name: 'Venus', short: 'venus', url: 'https://nineplanets.org/venus/' },
    { name: 'Earth', short: 'earth', url: 'https://nineplanets.org/earth/' },
    { name: 'Mars', short: 'mars', url: 'https://nineplanets.org/mars/' },
    { name: 'Jupiter', short: 'jupiter', url: 'https://nineplanets.org/jupiter/' },
    { name: 'Saturn', short: 'saturn', url: 'https://nineplanets.org/saturn/' },
    { name: 'Uranus', short: 'uranus', url: 'https://nineplanets.org/uranus/' },
    { name: 'Neptune', short: 'neptune', url: 'https://nineplanets.org/neptune/' },
  ],
  about: {
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
  },
  projects: [
    {
      id: 'abhinav-portfolio-cms', number: '01', title: 'Abhinav Yadav Portfolio', category: 'Web Experience', status: 'Personal project', date: '2026',
      description: 'A responsive portfolio website with an admin workspace for managing projects, skills, and journey entries.', tech: ['React', 'Vite', 'Express', 'MongoDB', 'Cloudinary'], accent: 'lime',
      problem: 'Presenting projects, learning progress, and technical skills in one place without relying on a generic portfolio template.',
      approach: 'Built a responsive React experience with an Express API and a small admin workspace for portfolio content.',
      features: ['Responsive portfolio sections', 'Project management API', 'Media upload support', 'Skill and journey editors'], role: 'Designer + Developer',
      challenges: ['Keeping project media performant', 'Supporting desktop and mobile layouts', 'Connecting the frontend and API across local ports'],
      solution: 'Added lazy-loaded project media, mobile-specific layouts, API-backed project storage, and local admin editing for skills and journey entries.',
      results: ['Portfolio and admin experience in one app', 'Project data stored through MongoDB when configured', 'Image and video uploads through Cloudinary when configured'],
    },
    {
      id: 'studio-grid', number: '02', title: 'Studio Grid', category: 'Web Experience', status: 'Live concept', date: '2026',
      description: 'A curated interface concept that turns personal work into a digital studio archive.', tech: ['React', 'Tailwind', 'Motion'], accent: 'lime',
      problem: 'The challenge was to make a personal portfolio feel like a premium studio archive instead of a generic card-based listing.',
      approach: 'I structured the experience around editorial rhythm, large typography, and intentional asymmetry so the work reads like a crafted collection.',
      features: ['Editorial hierarchy', 'Smooth motion', 'Responsive layouts', 'Portfolio storytelling'], role: 'Designer + Developer + Researcher',
      challenges: ['Alignment across multiple sections', 'Avoiding generic portfolio patterns', 'Maintaining a premium visual tone'],
      solution: 'I built a spatial system using strong typography, numbered sections, and disciplined whitespace to create a more distinctive story.',
      results: ['More polished presentation', 'Clearer narrative', 'Stronger visual identity'],
    },
    {
      id: 'signal-engine', number: '03', title: 'Signal Engine', category: 'Product Design', status: 'Prototype', date: '2026',
      description: 'A concept dashboard for learning projects, milestones, and rapid iteration loops.', tech: ['UI System', 'Components', 'UX'], accent: 'blue',
      problem: 'There was no clear way to visualize personal learning progress without creating a bloated, dull dashboard.',
      approach: 'I focused the system on summarizing momentum, milestones, and iteration rather than raw metrics alone.',
      features: ['Milestone tracking', 'Project insights', 'Clean data nodes', 'Modular interface'], role: 'Product thinker + Interface builder',
      challenges: ['Avoiding overcrowded dashboards', 'Keeping it simple but credible', 'Designing for future growth'],
      solution: 'The interface organizes learning activities into a cleaner story of progress, making each step easier to interpret.',
      results: ['Better storytelling', 'Visual clarity', 'Future-ready structure'],
    },
    {
      id: 'arc-archive', number: '04', title: 'Arc Archive', category: 'Creative Build', status: 'Concept', date: '2026',
      description: 'An editorial portfolio concept focused on storytelling, composition, and code craft.', tech: ['CMS Ready', 'Motion', 'Responsive'], accent: 'neutral',
      problem: 'The main challenge was turning a portfolio into a digital archive rather than a static list of past work.',
      approach: 'I built the visual language around rhythm, sequencing, and editorial spacing to feel more like a personal archive.',
      features: ['Archive storytelling', 'Progressive layouts', 'Visual pacing', 'High-contrast typography'], role: 'Creative developer',
      challenges: ['Balancing flexibility with polish', 'Keeping it premium without feeling overbuilt', 'Maintaining readability'],
      solution: 'An asymmetric structure with numbered sections and strong editorial moments gives the project a richer sense of identity.',
      results: ['Stronger narrative flow', 'More memorable experience', 'Clearer brand direction'],
    },
  ],
  navItems: ['WORK', 'ABOUT', 'JOURNEY', 'TOOLKIT', 'CONTACT'],
  adminAccessSettings: {
    logoClickCount: 5,
    logoClickWindowSeconds: 5,
    unlockPattern: [2, 6, 4],
  },
  homepageSettings: {
    activeDesign: 'placement-pro',
  },
  edgeAnimationSettings: {
    style: 'spectrum',
    speedSeconds: 8,
    color: '#62d0ff',
    scope: 'both',
  },
  motionSettings: {
    speed: 1,
    brightness: 100,
  },
  toolkitGroups: [
    { label: '01 FRONTEND', skills: ['React', 'Vite', 'Tailwind CSS', 'Framer Motion', 'Responsive UI'] },
    { label: '02 BACKEND', skills: ['Node.js', 'Express', 'REST APIs', 'File uploads'] },
    { label: '03 DATABASE', skills: ['MongoDB', 'Mongoose', 'Project CRUD'] },
    { label: '04 TOOLS', skills: ['Git', 'GitHub', 'Cloudinary', 'Vercel'] },
  ],
  journeyEvents: [
    { year: '2024', title: 'Learning foundations', description: 'Started learning structure, logic, frontend basics, and product thinking.' },
    { year: '2025', title: 'First builds', description: 'Built early UI experiments, landing pages, and student-focused web work.' },
    { year: '2026', title: 'Deepening craft', description: 'Focused on web technology, modular systems, and more complete portfolio storytelling.' },
  ],
  educationEntries: [
    { title: 'Diploma in Computer Science & Engineering', institution: 'Computer Science & Engineering Diploma Program', dates: '2024 — 2027', location: 'India', description: 'Core curriculum and practical learning focused on software, systems, and web technologies.' },
    { title: 'Web Technology & UI Practice', institution: 'Independent Learning Path', dates: 'Ongoing', location: 'Remote / Self-directed', description: 'Structured practice in frontend architecture, interface systems, and interactive design.' },
  ],
  experienceEntries: [
    { company: 'Independent Design & Learning Studio', role: 'Frontend Learner / Product Intern', type: 'Learning Internship / Project Experience', dates: '2025 — Present', location: 'Remote', description: 'Supported learning projects, product experimentation, and interface refinement.', achievements: ['UI prototyping', 'Design iteration', 'Workflow learning'] },
    { company: 'Freelance Web Practice', role: 'Web Development Intern', type: 'Project-Based', dates: '2024 — 2025', location: 'Remote', description: 'Worked on static and dynamic web interfaces while learning reusable systems.', achievements: ['Responsive layouts', 'Component thinking', 'Code organization'] },
  ],
  certificateEntries: [
    { title: 'Frontend Fundamentals', issuer: 'Self-Directed Learning', date: '2025', credential: 'Certificate ID — Frontend Fundamentals' },
    { title: 'Web Development Essentials', issuer: 'Self-Directed Learning', date: '2025', credential: 'Certificate ID — Web Development Essentials' },
    { title: 'UI / UX Design Practice', issuer: 'Self-Directed Learning', date: '2026', credential: 'Certificate ID — UI / UX Design Practice' },
  ],
  achievements: [
    { title: 'Project-Based Learning Archive', organization: 'Independent Practice', date: '2025', description: 'A structured series of experiments and builds created while learning web product design.' },
    { title: 'Interface Experimentation', organization: 'Self-directed Studio', date: '2026', description: 'Designed and refined numerous concepts focused on clarity, interaction, and usability.' },
    { title: 'Technical Growth Milestone', organization: 'Learning Journey', date: '2026', description: 'Built momentum through repeated iteration, research, and shipping small digital products.' },
  ],
  galleryItems: [
    { label: 'EDITORIAL', tone: 'tall' }, { label: 'WEB', tone: 'wide' }, { label: 'BUILD', tone: 'tall' },
    { label: 'STUDIO', tone: 'wide' }, { label: 'PROCESS', tone: 'normal' }, { label: 'DRAFT', tone: 'normal' },
  ],
}

const isPublicAddress = (address) => {
  if (isIP(address) === 4) {
    const octets = address.split('.').map(Number)
    const [first, second] = octets
    return first !== 0
      && first !== 10
      && first !== 127
      && first < 224
      && !(first === 100 && second >= 64 && second <= 127)
      && !(first === 169 && second === 254)
      && !(first === 172 && second >= 16 && second <= 31)
      && !(first === 192 && (second === 168 || (second === 0 && [0, 2].includes(octets[2]))))
      && !(first === 192 && second === 88 && octets[2] === 99)
      && !(first === 198 && (second === 18 || second === 19 || (second === 51 && octets[2] === 100)))
      && !(first === 203 && second === 0 && octets[2] === 113)
  }
  if (isIP(address) !== 6) return false

  const normalized = address.toLowerCase()
  const nat64Address = normalized.match(/^64:ff9b::([0-9a-f]{1,4}):([0-9a-f]{1,4})$/)
  if (nat64Address) {
    const high = Number.parseInt(nat64Address[1], 16)
    const low = Number.parseInt(nat64Address[2], 16)
    return isPublicAddress(`${high >> 8}.${high & 255}.${low >> 8}.${low & 255}`)
  }
  return (normalized.startsWith('2') || normalized.startsWith('3'))
    && !normalized.startsWith('2001:db8:')
    && !normalized.startsWith('2001:0:')
    && !normalized.startsWith('2002:')
    && !normalized.startsWith('3fff:')
}

const resolvePublicAddresses = async (hostname) => {
  if (hostname.endsWith('.localhost') || hostname.endsWith('.local')) {
    throw new Error('Local network hosts are not allowed.')
  }
  const addresses = await lookup(hostname, { all: true, verbatim: true })
  if (!addresses.length || addresses.some(({ address }) => !isPublicAddress(address))) {
    throw new Error('The host does not resolve exclusively to public IP addresses.')
  }
  return addresses
}

const readFrameHeaders = async (inputUrl, referringOrigin, redirectsRemaining = 4) => {
  const target = new URL(inputUrl)
  if (!['http:', 'https:'].includes(target.protocol) || target.username || target.password) {
    throw new Error('Only public HTTP(S) URLs are supported.')
  }
  if (target.port && target.port !== (target.protocol === 'https:' ? '443' : '80')) {
    throw new Error('Non-standard ports are not allowed.')
  }

  const addresses = await resolvePublicAddresses(target.hostname)
  const requestModule = target.protocol === 'https:' ? https : http
  const headers = await new Promise((resolve, reject) => {
    const request = requestModule.request(target, {
      method: 'HEAD',
      timeout: 5000,
      lookup: (hostname, options, callback) => {
        if (options?.all) {
          callback(null, addresses)
          return
        }
        callback(null, addresses[0].address, addresses[0].family)
      },
    }, (response) => {
      const responseHeaders = response.headers
      response.resume()
      response.destroy()
      resolve({ status: response.statusCode || 0, headers: responseHeaders })
    })
    request.on('timeout', () => request.destroy(new Error('The target host timed out.')))
    request.on('error', reject)
    request.end()
  })

  const redirectLocation = headers.headers.location
  if ([301, 302, 303, 307, 308].includes(headers.status) && redirectLocation) {
    if (redirectsRemaining <= 0) throw new Error('The target exceeded the redirect limit.')
    return readFrameHeaders(new URL(redirectLocation, target).href, referringOrigin, redirectsRemaining - 1)
  }
  return { url: target, headers: headers.headers }
}

const isBlockedByFrameHeaders = (headers, targetOrigin, referringOrigin) => {
  const policy = headers['content-security-policy']
  if (policy) {
    const directive = String(policy).split(';').map((part) => part.trim()).find((part) => /^frame-ancestors(?:\s|$)/i.test(part))
    if (directive) {
      const sources = directive.split(/\s+/).slice(1).map((source) => source.replace(/^['"]|['"]$/g, '').toLowerCase())
      if (sources.includes('none')) return true
      const isAllowed = sources.some((source) => {
        if (source === '*' || source === 'https:' || source === 'http:') {
          return source === '*' || source === `${new URL(referringOrigin).protocol.slice(0, -1)}:`
        }
        if (source === 'self') return targetOrigin === referringOrigin
        try {
          const wildcard = source.match(/^(https?:\/\/)?\*\.(.+)$/)
          const sourceUrl = new URL(wildcard
            ? `${wildcard[1] || 'https://'}${wildcard[2]}`
            : source.includes('://') ? source : `https://${source}`)
          const referringUrl = new URL(referringOrigin)
          const sourceHostMatches = wildcard
            ? referringUrl.hostname.endsWith(`.${sourceUrl.hostname}`)
            : referringUrl.hostname === sourceUrl.hostname
          return sourceHostMatches
            && (!sourceUrl.port || sourceUrl.port === referringUrl.port)
            && (!source.includes('://') || sourceUrl.protocol === referringUrl.protocol)
        } catch {
          return false
        }
      })
      return !isAllowed
    }
  }

  const frameOptions = String(headers['x-frame-options'] || '').toLowerCase()
    .split(',')
    .map((value) => value.trim())
  return frameOptions.includes('deny')
    || (frameOptions.includes('sameorigin') && targetOrigin !== referringOrigin)
}

app.get('/api/frame-policy', async (req, res) => {
  let requestedUrl
  try {
    requestedUrl = new URL(req.query.url)
  } catch {
    res.status(400).json({ error: 'A valid URL is required.' })
    return
  }
  const referringOrigin = req.get('referer') ? new URL(req.get('referer')).origin : req.get('origin')
  if (!referringOrigin) {
    res.status(400).json({ error: 'The portfolio origin could not be determined.' })
    return
  }

  try {
    const response = await readFrameHeaders(requestedUrl.href, referringOrigin)
    res.set('Cache-Control', 'no-store').json({
      blocked: isBlockedByFrameHeaders(response.headers, response.url.origin, referringOrigin),
    })
  } catch (error) {
    res.set('Cache-Control', 'no-store').json({ blocked: false, unavailable: true })
    console.warn(`[frame-policy] Could not inspect ${requestedUrl.hostname}:`, error.message)
  }
})

const resumeImageHosts = new Set(['cdn.phototourl.com', 'res.cloudinary.com'])
app.get('/api/resume-image', async (req, res) => {
  let imageUrl
  try {
    imageUrl = new URL(req.query.url)
  } catch {
    res.status(400).json({ error: 'A valid resume image URL is required.' })
    return
  }
  if (imageUrl.protocol !== 'https:' || imageUrl.username || imageUrl.password || !resumeImageHosts.has(imageUrl.hostname)) {
    res.status(400).json({ error: 'This resume image host is not supported for PDF export.' })
    return
  }

  try {
    const response = await fetch(imageUrl, { redirect: 'error', signal: AbortSignal.timeout(10000) })
    const contentType = response.headers.get('content-type')?.split(';')[0].trim().toLowerCase()
    const supportedImageTypes = new Set(['image/avif', 'image/gif', 'image/jpeg', 'image/png', 'image/webp'])
    if (!response.ok || !supportedImageTypes.has(contentType)) {
      res.status(502).json({ error: 'Resume portrait could not be fetched as an image.' })
      return
    }

    const maxImageBytes = 8 * 1024 * 1024
    const contentLength = Number(response.headers.get('content-length'))
    if (Number.isFinite(contentLength) && contentLength > maxImageBytes) {
      res.status(413).json({ error: 'Resume portrait is too large to export.' })
      return
    }
    if (!response.body) {
      res.status(502).json({ error: 'Resume portrait response was empty.' })
      return
    }
    const chunks = []
    let imageSize = 0
    const reader = response.body.getReader()
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      imageSize += value.byteLength
      if (imageSize > maxImageBytes) {
        await reader.cancel()
        res.status(413).json({ error: 'Resume portrait is too large to export.' })
        return
      }
      chunks.push(value)
    }
    const image = Buffer.concat(chunks, imageSize)

    res.set({
      'Cache-Control': 'private, max-age=300',
      'Content-Length': image.length,
      'Content-Type': contentType,
      'X-Content-Type-Options': 'nosniff',
    }).send(image)
  } catch (error) {
    console.error('[resume-image] Failed to load portrait:', error.message)
    res.status(502).json({ error: 'Resume portrait could not be fetched for PDF export.' })
  }
})

app.get('/api/portfolio', async (req, res) => {
  try {
    const savedProjects = mongoose.connection.readyState === 1
      ? await Project.find().sort({ createdAt: 1 }).lean()
      : []
    const savedAbout = mongoose.connection.readyState === 1
      ? await PortfolioContent.findOne({ key: 'about' }).lean()
      : null
    const savedAdminAccess = mongoose.connection.readyState === 1
      ? await PortfolioContent.findOne({ key: 'adminAccessSettings' }).lean()
      : null
    const savedHomepageSettings = mongoose.connection.readyState === 1
      ? await PortfolioContent.findOne({ key: 'homepageSettings' }).lean()
      : null
    const savedEdgeAnimation = mongoose.connection.readyState === 1
      ? await PortfolioContent.findOne({ key: 'edgeAnimationSettings' }).lean()
      : null
    const savedMotionSettings = mongoose.connection.readyState === 1
      ? await PortfolioContent.findOne({ key: 'motionSettings' }).lean()
      : null
    const savedCollections = mongoose.connection.readyState === 1
      ? await PortfolioContent.find({ key: { $in: ['experienceEntries', 'achievements', 'galleryItems', 'contactLinks', 'planetLinks', 'resumeEntries'] } }).lean()
      : []
    const savedCollectionData = new Map(savedCollections.map((collection) => [collection.key, collection.data]))
    const savedById = new Map(savedProjects.map((project) => [project.id, project.data]))
    const defaultProjects = portfolioData.projects.map((project) => savedById.get(project.id) || project)
    const defaultIds = new Set(portfolioData.projects.map((project) => project.id))
    const additionalProjects = savedProjects
      .filter((project) => !defaultIds.has(project.id))
      .map((project) => project.data)
    const projects = [...additionalProjects, ...defaultProjects]
    res.json({
      ...portfolioData,
      about: savedAbout?.data || portfolioData.about,
      aboutStorage: savedAbout ? 'database' : aboutStorage,
      adminAccessSettings: savedAdminAccess?.data || portfolioData.adminAccessSettings,
      adminAccessSettingsStorage: savedAdminAccess ? 'database' : adminAccessSettingsStorage,
      homepageSettings: savedHomepageSettings?.data || portfolioData.homepageSettings,
      homepageSettingsStorage: savedHomepageSettings ? 'database' : homepageSettingsStorage,
      edgeAnimationSettings: savedEdgeAnimation?.data || portfolioData.edgeAnimationSettings,
      edgeAnimationSettingsStorage: savedEdgeAnimation ? 'database' : edgeAnimationSettingsStorage,
      motionSettings: savedMotionSettings?.data || portfolioData.motionSettings,
      motionSettingsStorage: savedMotionSettings ? 'database' : motionSettingsStorage,
      experienceEntries: savedCollectionData.get('experienceEntries') || portfolioData.experienceEntries,
      achievements: savedCollectionData.get('achievements') || portfolioData.achievements,
      galleryItems: savedCollectionData.get('galleryItems') || portfolioData.galleryItems,
      contactLinks: savedCollectionData.get('contactLinks') || portfolioData.contactLinks,
      planetLinks: savedCollectionData.get('planetLinks') || portfolioData.planetLinks,
      planetLinksStorage: savedCollectionData.has('planetLinks') ? 'database' : 'default',
      resumeEntries: savedCollectionData.get('resumeEntries') || portfolioData.resumeEntries,
      resumeStorage: savedCollectionData.has('resumeEntries') ? 'database' : 'default',
      projects,
    })
  } catch (error) {
    console.error('Failed to load saved projects:', error)
    res.json(portfolioData)
  }
})

app.put('/api/portfolio/motion-settings', async (req, res) => {
  const settings = req.body?.settings
  const validSettings = Number.isFinite(settings?.speed)
    && settings.speed >= 0.5
    && settings.speed <= 2
    && Number.isInteger(settings?.brightness)
    && settings.brightness >= 50
    && settings.brightness <= 150

  if (!validSettings) {
    return res.status(400).json({ success: false, message: 'Motion settings are invalid.' })
  }

  if (mongoose.connection.readyState !== 1) {
    portfolioData.motionSettings = settings
    motionSettingsStorage = 'memory'
    return res.json({ success: true, settings, storage: 'memory' })
  }

  try {
    const savedSettings = await PortfolioContent.findOneAndUpdate(
      { key: 'motionSettings' },
      { key: 'motionSettings', data: settings },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true },
    ).lean()

    motionSettingsStorage = 'database'
    return res.json({ success: true, settings: savedSettings.data, storage: 'database' })
  } catch (error) {
    console.error('Failed to save motion settings:', error)
    portfolioData.motionSettings = settings
    motionSettingsStorage = 'memory'
    return res.json({ success: true, settings, storage: 'memory' })
  }
})

app.put('/api/portfolio/admin-access', async (req, res) => {
  const settings = req.body?.settings
  const pattern = settings?.unlockPattern
  const validSettings = Number.isInteger(settings?.logoClickCount)
    && settings.logoClickCount >= 2
    && settings.logoClickCount <= 20
    && Number.isInteger(settings?.logoClickWindowSeconds)
    && settings.logoClickWindowSeconds >= 2
    && settings.logoClickWindowSeconds <= 30
    && Array.isArray(pattern)
    && pattern.length >= 3
    && pattern.length <= 9
    && pattern.every((point) => Number.isInteger(point) && point >= 0 && point <= 8)
    && new Set(pattern).size === pattern.length

  if (!validSettings) {
    return res.status(400).json({ success: false, message: 'Access settings are invalid.' })
  }

  if (mongoose.connection.readyState !== 1) {
    portfolioData.adminAccessSettings = settings
    adminAccessSettingsStorage = 'memory'
    return res.json({ success: true, settings, storage: 'memory' })
  }

  try {
    const savedSettings = await PortfolioContent.findOneAndUpdate(
      { key: 'adminAccessSettings' },
      { key: 'adminAccessSettings', data: settings },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    ).lean()

    adminAccessSettingsStorage = 'database'
    return res.json({ success: true, settings: savedSettings.data, storage: 'database' })
  } catch (error) {
    console.error('Failed to save admin access settings:', error)
    portfolioData.adminAccessSettings = settings
    adminAccessSettingsStorage = 'memory'
    return res.json({ success: true, settings, storage: 'memory' })
  }
})

app.put('/api/portfolio/homepage-settings', async (req, res) => {
  const allowedDesigns = ['placement-pro', 'academic-clean', 'recruiter-brief', 'resume-grid', 'cosmic-studio']
  const activeDesign = allowedDesigns.includes(req.body?.settings?.activeDesign)
    ? req.body.settings.activeDesign
    : 'placement-pro'
  const settings = { activeDesign }

  if (mongoose.connection.readyState !== 1) {
    portfolioData.homepageSettings = settings
    homepageSettingsStorage = 'memory'
    return res.json({ success: true, settings, storage: 'memory' })
  }

  try {
    const savedSettings = await PortfolioContent.findOneAndUpdate(
      { key: 'homepageSettings' },
      { key: 'homepageSettings', data: settings },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    ).lean()

    homepageSettingsStorage = 'database'
    return res.json({ success: true, settings: savedSettings.data, storage: 'database' })
  } catch (error) {
    console.error('Failed to save homepage settings:', error)
    portfolioData.homepageSettings = settings
    homepageSettingsStorage = 'memory'
    return res.json({ success: true, settings, storage: 'memory' })
  }
})

app.put('/api/portfolio/edge-animation', async (req, res) => {
  const settings = req.body?.settings
  const validSettings = ['spectrum', 'single', 'aurora', 'comet'].includes(settings?.style)
    && Number.isInteger(settings?.speedSeconds)
    && settings.speedSeconds >= 2
    && settings.speedSeconds <= 20
    && /^#[0-9a-f]{6}$/i.test(settings?.color || '')
    && ['header', 'footer', 'both'].includes(settings?.scope)

  if (!validSettings) {
    return res.status(400).json({ success: false, message: 'Edge motion settings are invalid.' })
  }

  if (mongoose.connection.readyState !== 1) {
    portfolioData.edgeAnimationSettings = settings
    edgeAnimationSettingsStorage = 'memory'
    return res.json({ success: true, settings, storage: 'memory' })
  }

  try {
    const savedSettings = await PortfolioContent.findOneAndUpdate(
      { key: 'edgeAnimationSettings' },
      { key: 'edgeAnimationSettings', data: settings },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    ).lean()

    edgeAnimationSettingsStorage = 'database'
    return res.json({ success: true, settings: savedSettings.data, storage: 'database' })
  } catch (error) {
    console.error('Failed to save edge animation settings:', error)
    portfolioData.edgeAnimationSettings = settings
    edgeAnimationSettingsStorage = 'memory'
    return res.json({ success: true, settings, storage: 'memory' })
  }
})

app.put('/api/portfolio/about', async (req, res) => {
  const about = req.body
  const collectionKeys = ['facts', 'colleges', 'webinars', 'certificates', 'images', 'links']

  if (typeof about?.biography !== 'string'
    || typeof about?.homepageIntro !== 'string'
    || about.homepageIntro.trim().length === 0
    || about.homepageIntro.length > 600
    || collectionKeys.some((key) => !Array.isArray(about[key]))) {
    return res.status(400).json({ success: false, message: 'About content is incomplete or invalid.' })
  }

  if (mongoose.connection.readyState !== 1) {
    portfolioData.about = about
    aboutStorage = 'memory'
    return res.json({ success: true, about, storage: 'memory' })
  }

  try {
    const savedAbout = await PortfolioContent.findOneAndUpdate(
      { key: 'about' },
      { key: 'about', data: about },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    ).lean()

    aboutStorage = 'database'
    return res.json({ success: true, about: savedAbout.data, storage: 'database' })
  } catch (error) {
    console.error('Failed to save About content:', error)
    portfolioData.about = about
    aboutStorage = 'memory'
    return res.json({ success: true, about, storage: 'memory' })
  }
})

app.put('/api/portfolio/content/:key', async (req, res) => {
  const { key } = req.params
  const allowedKeys = ['experienceEntries', 'achievements', 'galleryItems', 'contactLinks', 'planetLinks', 'resumeEntries']

  if (!allowedKeys.includes(key) || !Array.isArray(req.body?.entries)) {
    return res.status(400).json({ success: false, message: 'A valid portfolio collection is required.' })
  }

  if (key === 'resumeEntries') {
    const [resume] = req.body.entries
    const isValidResumeLink = (value) => {
      if (typeof value !== 'string') return false
      const link = value.trim()
      if (!link) return true
      if (link.startsWith('/')) return !link.startsWith('//') && !link.includes('\\')
      try {
        return ['http:', 'https:', 'mailto:', 'tel:'].includes(new URL(link).protocol)
      } catch {
        return false
      }
    }
    const design = resume?.design
    const validDesign = design === undefined || (
      design
      && typeof design === 'object'
      && ['modern', 'classic', 'editorial', 'minimal'].includes(design.template)
      && typeof design.name === 'string' && design.name.length <= 120
      && typeof design.headline === 'string' && design.headline.length <= 240
      && typeof design.location === 'string' && design.location.length <= 120
      && typeof design.portraitUrl === 'string' && design.portraitUrl.length <= 2000
      && typeof design.summary === 'string' && design.summary.length <= 5000
      && typeof design.summaryUrl === 'string' && design.summaryUrl.length <= 2000
      && ['accentColor', 'backgroundColor', 'surfaceColor', 'textColor'].every((key) => /^#[0-9a-f]{6}$/i.test(design[key]))
      && Array.isArray(design.contacts)
      && design.contacts.length <= 20
      && design.contacts.every((contact) => typeof contact?.label === 'string'
        && contact.label.length <= 80
        && typeof contact?.text === 'string'
        && contact.text.length <= 500
        && typeof contact?.url === 'string'
        && contact.url.length <= 2000
        && isValidResumeLink(contact.url))
      && Array.isArray(design.sections)
      && design.sections.length <= 20
      && design.sections.every((section) => typeof section?.title === 'string'
        && section.title.length <= 120
        && Array.isArray(section?.items)
        && section.items.length <= 30
        && section.items.every((item) => typeof item?.text === 'string'
          && item.text.length <= 2500
          && typeof item?.url === 'string'
          && item.url.length <= 2000
          && isValidResumeLink(item.url)))
      && (design.links === undefined || (Array.isArray(design.links)
      && design.links.length <= 100
      && design.links.every((link) => {
        if (!link || typeof link.field !== 'string'
          || !Number.isInteger(link.start) || !Number.isInteger(link.end)
          || link.start < 0 || link.end <= link.start
          || typeof link.text !== 'string' || link.text.length > 2500
          || typeof link.url !== 'string' || link.url.length > 2000
          || !isValidResumeLink(link.url)) return false

        let fieldText
        const contactField = /^contacts\.(\d+)\.(label|text)$/.exec(link.field)
        const sectionTextField = /^sections\.(\d+)\.items\.(\d+)\.text$/.exec(link.field)
        const sectionTitleField = /^sections\.(\d+)\.title$/.exec(link.field)
        if (link.field === 'name' || link.field === 'headline' || link.field === 'location' || link.field === 'summary') {
          fieldText = design[link.field]
        } else if (contactField) {
          fieldText = design.contacts[Number(contactField[1])]?.[contactField[2]]
        } else if (sectionTextField) {
          fieldText = design.sections[Number(sectionTextField[1])]?.items[Number(sectionTextField[2])]?.text
        } else if (sectionTitleField) {
          fieldText = design.sections[Number(sectionTitleField[1])]?.title
        } else {
          return false
        }
        return typeof fieldText === 'string'
          && link.end <= fieldText.length
          && fieldText.slice(link.start, link.end) === link.text
      })))
      && isValidResumeLink(design.summaryUrl)
      && isValidResumeLink(design.portraitUrl)
    )
    if (req.body.entries.length > 1
      || (req.body.entries.length === 1 && (!resume || typeof resume !== 'object'
        || !isValidResumeLink(resume.url)
        || !isValidResumeLink(resume.previewUrl)
        || !isValidResumeLink(resume.linkUrl)
        || typeof resume.title !== 'string'
        || typeof resume.fileName !== 'string'
        || typeof resume.fileType !== 'string'
        || (resume.displayMode !== undefined && !['normal', 'custom'].includes(resume.displayMode))
        || !validDesign))) {
      return res.status(400).json({ success: false, message: 'Resume details or links are invalid.' })
    }
  }

  if (key === 'planetLinks') {
    const expectedPlanetShorts = ['sun', 'mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune']
    const entries = req.body.entries
    const planetShorts = entries.map((entry) => entry?.short)
    const hasValidPlanetLinks = entries.length === expectedPlanetShorts.length
      && expectedPlanetShorts.every((short) => planetShorts.filter((entryShort) => entryShort === short).length === 1)
      && entries.every((entry) => typeof entry?.name === 'string'
        && typeof entry?.url === 'string'
        && /^https?:\/\/\S+$/i.test(entry.url.trim()))

    if (!hasValidPlanetLinks) {
      return res.status(400).json({ success: false, message: 'The Sun and each planet need one valid HTTP or HTTPS link.' })
    }
  }

  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ success: false, message: 'MongoDB is not connected. Changes remain saved in this browser.' })
  }

  try {
    const savedCollection = await PortfolioContent.findOneAndUpdate(
      { key },
      { key, data: req.body.entries },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    ).lean()

    return res.json({ success: true, key, entries: savedCollection.data, storage: 'database' })
  } catch (error) {
    console.error(`Failed to save ${key}:`, error)
    return res.status(503).json({ success: false, message: 'Portfolio entries could not be saved.' })
  }
})

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'portfolio-api' })
})

app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'portfolio-api' })
})

app.get('/api/messages', (req, res) => {
  res.json({ success: true, messages: messagesStore })
})

app.post('/api/projects', async (req, res) => {
  const project = req.body

  if (!project?.id || !project.title || !project.description) {
    return res.status(400).json({ success: false, message: 'Project id, title, and description are required.' })
  }

  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ success: false, message: 'MongoDB is not connected. Project changes cannot be saved yet.' })
    }

    const savedProject = await Project.findOneAndUpdate(
      { id: project.id },
      { id: project.id, data: project },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    ).lean()

    return res.status(201).json({ success: true, project: savedProject.data })
  } catch (error) {
    console.error('Failed to save project:', error)
    return res.status(503).json({ success: false, message: 'Project storage is not available.' })
  }
})

app.delete('/api/projects/:id', async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ success: false, message: 'MongoDB is not connected. Project changes cannot be saved yet.' })
  }

  try {
    await Project.deleteOne({ id: req.params.id })
    return res.json({ success: true })
  } catch (error) {
    console.error('Failed to delete project:', error)
    return res.status(503).json({ success: false, message: 'Project storage is not available.' })
  }
})

app.post('/api/uploads', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'A supported media or resume file is required.' })
  }

  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    return res.status(503).json({ success: false, message: 'Media storage is not configured on the backend.' })
  }

  try {
    const resourceType = req.file.mimetype.startsWith('video/')
      ? 'video'
      : req.file.mimetype.startsWith('image/') ? 'image' : 'raw'
    const isResumeUpload = req.body.category === 'resume'
    const safeOriginalName = req.file.originalname.replace(/[^\w.-]+/g, '-')
    const result = await new Promise((resolve, reject) => {
      const uploadMethod = resourceType === 'video'
        ? cloudinary.uploader.upload_chunked_stream
        : cloudinary.uploader.upload_stream
      const stream = uploadMethod.call(cloudinary.uploader,
        {
          folder: isResumeUpload ? 'abhinav-portfolio/resumes' : 'abhinav-portfolio/projects',
          resource_type: resourceType,
          ...(resourceType === 'raw' ? { public_id: safeOriginalName } : {}),
          chunk_size: 6 * 1024 * 1024,
        },
        (error, uploadResult) => (error ? reject(error) : resolve(uploadResult)),
      )

      stream.end(req.file.buffer)
    })

    return res.status(201).json({
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      resourceType: result.resource_type,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
    })
  } catch (error) {
    console.error('Cloudinary upload failed:', error)
    return res.status(502).json({ success: false, message: 'Media upload failed. Please try again.' })
  }
})

app.post('/api/messages', (req, res) => {
  const { name, email, subject, message } = req.body || {}

  if (!name || !email || !message) {
    return res.status(400).json({ success: false, message: 'Name, email, and message are required.' })
  }

  const savedMessage = {
    id: Date.now(), sender: name, email, subject: subject || 'General inquiry', message, read: false,
    date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
  }

  messagesStore.unshift(savedMessage)

  return res.status(201).json({ success: true, message: 'Message saved successfully.', payload: savedMessage })
})

app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ success: false, message: 'Media files must be 100MB or smaller.' })
  }

  if (error?.message === 'Upload an image, video, PDF, Word, RTF, text, or HTML file.') {
    return res.status(415).json({ success: false, message: error.message })
  }

  return next(error)
})

const server = app.listen(port, () => {
  console.log(`Portfolio API running on http://localhost:${port}`)
})

server.keepAliveTimeout = 65000
server.headersTimeout = 70000

setInterval(() => {
  void keepAliveRender()
}, 5 * 60 * 1000)

setInterval(() => {
  void keepAliveMongo()
}, 60 * 1000)

const connectDatabase = async () => {
  if (process.env.MONGODB_URI) {
    try {
      await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 })
      console.log('MongoDB connected')
    } catch (error) {
      console.error('MongoDB connection failed; using static portfolio data:', error.message)
    }
  }
}

connectDatabase()
