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
const assistantCollectionKeys = [
  'homepageSettings',
  'toolkitGroups',
  'journeyEvents',
  'educationEntries',
  'experienceEntries',
  'achievements',
  'galleryItems',
  'contactLinks',
  'planetLinks',
  'resumeEntries',
]
const assistantRateLimit = new Map()
let aboutStorage = 'default'
let adminAccessSettingsStorage = 'default'
let homepageSettingsStorage = 'default'
let edgeAnimationSettingsStorage = 'default'
let motionSettingsStorage = 'default'
let animationControlsStorage = 'default'

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
    colleges: [{
      type: 'college',
      title: 'Government Polytechnic Sahjanwa, Gorakhpur',
      program: 'Computer Science and Engineering',
      dates: '2024 - 2027',
      location: 'Gorakhpur',
      description: 'Institution and program details from the existing profile. The attached campus artwork is an illustration for layout testing, not an official college photograph.',
      image: '/demo-assets/demo-campus-life.svg',
      images: ['/demo-assets/demo-education.svg', '/demo-assets/demo-learning-lab.svg'],
      linkLabel: 'Institution website',
      url: '',
    }],
    webinars: [
      { title: 'SAMPLE EVENT - Accessible Interface Basics', organizer: 'DEMO ONLY - fictional event', date: 'Sample listing - attendance not claimed', description: 'Fictional event card for testing this section. It does not represent an event attended or a certificate earned.', image: '/demo-assets/demo-webinar-accessibility.svg', url: '' },
      { title: 'SAMPLE WEBINAR - Designing Clear Dashboards', organizer: 'DEMO ONLY - fictional event', date: 'Sample listing - attendance not claimed', description: 'Illustrative webinar entry for testing image and text layout.', image: '/demo-assets/demo-webinar-dashboard.svg', url: '' },
      { title: 'SAMPLE WORKSHOP - Responsive Web Foundations', organizer: 'DEMO ONLY - fictional event', date: 'Sample listing - attendance not claimed', description: 'Illustrative workshop entry for testing image and text layout.', image: '/demo-assets/demo-webinar-responsive.svg', url: '' },
    ],
    certificates: [
      { title: 'SAMPLE - Frontend Foundations', issuer: 'DEMO ONLY - no certificate issuer', date: 'Sample only', credential: 'Not issued - not a real credential', image: '/demo-assets/demo-certificate-foundations.svg', url: '' },
      { title: 'SAMPLE - Responsive Web Interfaces', issuer: 'DEMO ONLY - no certificate issuer', date: 'Sample only', credential: 'Not issued - not a real credential', image: '/demo-assets/demo-certificate-responsive.svg', url: '' },
      { title: 'SAMPLE - Interface Design Practice', issuer: 'DEMO ONLY - no certificate issuer', date: 'Sample only', credential: 'Not issued - not a real credential', image: '/demo-assets/demo-certificate-interface.svg', url: '' },
      { title: 'SAMPLE - Accessibility Review Basics', issuer: 'DEMO ONLY - no certificate issuer', date: 'Sample only', credential: 'Not issued - not a real credential', image: '/demo-assets/demo-certificate-accessibility.svg', url: '' },
    ],
    images: [
      { label: 'DEMO UI CONCEPT - portfolio layout preview', url: '/demo-assets/demo-portfolio.svg' },
      { label: 'DEMO ILLUSTRATION - campus visual, not an official photograph', url: '/demo-assets/demo-campus-life.svg' },
      { label: 'DEMO WORKFLOW - fictional project practice', url: '/demo-assets/demo-experience.svg' },
      { label: 'DEMO PRODUCT CONCEPT - learning dashboard', url: '/demo-assets/demo-dashboard.svg' },
    ],
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
      id: 'studio-grid', number: '02', title: 'DEMO — Studio Grid', category: 'Web Experience', status: 'DEMO — fictional concept', date: 'Sample',
      description: 'A curated interface concept that turns personal work into a digital studio archive.', tech: ['React', 'Tailwind', 'Motion'], accent: 'lime',
      image: '/demo-assets/demo-editorial.svg', gallery: ['/demo-assets/demo-portfolio.svg', '/demo-assets/demo-dashboard.svg'],
      problem: 'The challenge was to make a personal portfolio feel like a premium studio archive instead of a generic card-based listing.',
      approach: 'I structured the experience around editorial rhythm, large typography, and intentional asymmetry so the work reads like a crafted collection.',
      features: ['Editorial hierarchy', 'Smooth motion', 'Responsive layouts', 'Portfolio storytelling'], role: 'Designer + Developer + Researcher',
      challenges: ['Alignment across multiple sections', 'Avoiding generic portfolio patterns', 'Maintaining a premium visual tone'],
      solution: 'I built a spatial system using strong typography, numbered sections, and disciplined whitespace to create a more distinctive story.',
      results: ['More polished presentation', 'Clearer narrative', 'Stronger visual identity'],
    },
    {
      id: 'signal-engine', number: '03', title: 'DEMO — Metagram', category: 'Product Design', status: 'DEMO — fictional prototype', date: 'Sample',
      description: 'A concept dashboard for learning projects, milestones, and rapid iteration loops.', tech: ['UI System', 'Components', 'UX'], accent: 'blue',
      image: '/demo-assets/demo-dashboard.svg', gallery: ['/demo-assets/demo-webinar-dashboard.svg', '/demo-assets/demo-learning-lab.svg'],
      problem: 'There was no clear way to visualize personal learning progress without creating a bloated, dull dashboard.',
      approach: 'I focused the system on summarizing momentum, milestones, and iteration rather than raw metrics alone.',
      features: ['Milestone tracking', 'Project insights', 'Clean data nodes', 'Modular interface'], role: 'Product thinker + Interface builder',
      challenges: ['Avoiding overcrowded dashboards', 'Keeping it simple but credible', 'Designing for future growth'],
      solution: 'The interface organizes learning activities into a cleaner story of progress, making each step easier to interpret.',
      results: ['Better storytelling', 'Visual clarity', 'Future-ready structure'],
    },
    {
      id: 'arc-archive', number: '04', title: 'DEMO — Arc Archive', category: 'Creative Build', status: 'DEMO — fictional concept', date: 'Sample',
      description: 'An editorial portfolio concept focused on storytelling, composition, and code craft.', tech: ['CMS Ready', 'Motion', 'Responsive'], accent: 'neutral',
      image: '/demo-assets/demo-editorial.svg', gallery: ['/demo-assets/demo-campus-life.svg', '/demo-assets/demo-certificate-interface.svg'],
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
    heroName: '',
    heroRole: '',
    availabilityText: 'Available for Frontend / Product / Internship',
    nameColor: '#123B5B',
    nameHighlightColor: '#177A56',
    heroAnimation: 'gradient',
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
  animationControls: {
    sections: { hero: true, work: true, about: true, gallery: true, journey: true, toolkit: true, contact: true },
    areas: {},
    effects: {},
  },
  toolkitGroups: [
    { label: '01 FRONTEND', skills: ['React', 'Vite', 'Tailwind CSS', 'Framer Motion', 'Responsive UI'] },
    { label: '02 BACKEND', skills: ['Node.js', 'Express', 'REST APIs', 'File uploads'] },
    { label: '03 DATABASE', skills: ['MongoDB', 'Mongoose', 'Project CRUD'] },
    { label: '04 TOOLS', skills: ['Git', 'GitHub', 'Cloudinary', 'Vercel'] },
  ],
  journeyEvents: [
    { year: '2024', title: 'DEMO — Learning foundations', description: 'Sample timeline entry for testing: foundational programming, web concepts, and interface practice.', image: '/demo-assets/demo-education.svg', images: ['/demo-assets/demo-learning-lab.svg', '/demo-assets/demo-campus-life.svg'] },
    { year: '2025', title: 'DEMO — First interface builds', description: 'Sample timeline entry for testing: small responsive layouts and early component experiments.', image: '/demo-assets/demo-portfolio.svg', images: ['/demo-assets/demo-study-planner.svg', '/demo-assets/demo-webinar-responsive.svg'] },
    { year: '2026', title: 'DEMO — Product thinking practice', description: 'Sample timeline entry for testing: organizing a concept into a user flow, dashboard, and reusable interface patterns.', image: '/demo-assets/demo-dashboard.svg', images: ['/demo-assets/demo-marketplace.svg', '/demo-assets/demo-webinar-dashboard.svg'] },
    { year: 'SAMPLE', title: 'DEMO — Iteration and reflection', description: 'Fictional portfolio milestone for previewing the timeline design; this is not a verified personal achievement.', image: '/demo-assets/demo-experience.svg', images: ['/demo-assets/demo-editorial.svg', '/demo-assets/demo-webinar-accessibility.svg'] },
  ],
  educationEntries: [
    { title: 'DEMO — Self-directed Web Practice', institution: 'Illustrative learning outline · not a qualification', dates: 'Sample / ongoing', location: 'Self-directed', description: 'Sample curriculum card for layout testing: HTML and CSS foundations, responsive interface patterns, React components, accessibility checks, and project documentation. This is not a course certificate or formal education record.', image: '/demo-assets/demo-education.svg', images: ['/demo-assets/demo-learning-lab.svg', '/demo-assets/demo-study-planner.svg'] },
  ],
  experienceEntries: [
    { company: 'DEMO ONLY — Fictional Product Studio', role: 'Simulated Frontend Practice Sprint', type: 'Sample case study · not employment or an internship', dates: 'Sample timeline', location: 'Fictional / remote', description: 'A fictional experience-card example showing how an interface project could move from a brief to a responsive prototype. No employer, client, or placement is being claimed.', achievements: ['Map a sample user flow', 'Build reusable interface components', 'Review responsive states'], image: '/demo-assets/demo-experience.svg', images: ['/demo-assets/demo-portfolio.svg', '/demo-assets/demo-dashboard.svg'] },
    { company: 'DEMO ONLY — Fictional Learning Lab', role: 'Simulated UI Design Exercise', type: 'Sample project · not employment or an internship', dates: 'Sample timeline', location: 'Fictional / self-directed', description: 'A fictional dashboard exercise for testing portfolio content and image layouts; all metrics and interface content in the artwork are illustrative.', achievements: ['Organize sample dashboard data', 'Create a visual hierarchy', 'Document iteration steps'], image: '/demo-assets/demo-dashboard.svg', images: ['/demo-assets/demo-learning-lab.svg', '/demo-assets/demo-study-planner.svg'] },
  ],
  certificateEntries: [
    { title: 'SAMPLE — Frontend Foundations', issuer: 'DEMO ONLY — no certificate issuer', date: 'Sample only', credential: 'Not issued · not a real credential', image: '/demo-assets/demo-certificate-foundations.svg' },
    { title: 'SAMPLE — Responsive Web Interfaces', issuer: 'DEMO ONLY — no certificate issuer', date: 'Sample only', credential: 'Not issued · not a real credential', image: '/demo-assets/demo-certificate-responsive.svg' },
    { title: 'SAMPLE — Interface Design Practice', issuer: 'DEMO ONLY — no certificate issuer', date: 'Sample only', credential: 'Not issued · not a real credential', image: '/demo-assets/demo-certificate-interface.svg' },
    { title: 'SAMPLE — Accessibility Review Basics', issuer: 'DEMO ONLY — no certificate issuer', date: 'Sample only', credential: 'Not issued · not a real credential', image: '/demo-assets/demo-certificate-accessibility.svg' },
  ],
  achievements: [
    { title: 'DEMO — Project-Based Learning Archive', organization: 'Sample content · not an award', date: 'Sample', description: 'A fictional milestone card demonstrating how learning notes and project artifacts can appear in this section.', image: '/demo-assets/demo-portfolio.svg', images: ['/demo-assets/demo-learning-lab.svg', '/demo-assets/demo-study-planner.svg'] },
    { title: 'DEMO — Interface Iteration', organization: 'Sample content · not an award', date: 'Sample', description: 'A sample reflection about reviewing layout, hierarchy, and responsive states; it does not claim a verified award or result.', image: '/demo-assets/demo-editorial.svg', images: ['/demo-assets/demo-campus-life.svg', '/demo-assets/demo-webinar-responsive.svg'] },
    { title: 'DEMO — Dashboard Prototype', organization: 'Sample content · not an award', date: 'Sample', description: 'An illustrative product concept used to test the achievement image and description layout.', image: '/demo-assets/demo-dashboard.svg', images: ['/demo-assets/demo-webinar-dashboard.svg', '/demo-assets/demo-marketplace.svg'] },
    { title: 'DEMO — Marketplace Concept', organization: 'Sample content · not an award', date: 'Sample', description: 'A fictional shop concept for practicing product cards, navigation, and responsive composition.', image: '/demo-assets/demo-marketplace.svg', images: ['/demo-assets/demo-experience.svg', '/demo-assets/demo-webinar-accessibility.svg'] },
  ],
  galleryItems: [
    { label: 'EDITORIAL · DEMO CONCEPT', url: '/demo-assets/demo-editorial.svg', tone: 'tall' },
    { label: 'PORTFOLIO UI · DEMO SAMPLE', url: '/demo-assets/demo-portfolio.svg', tone: 'wide' },
    { label: 'LEARNING DASHBOARD · DEMO', url: '/demo-assets/demo-dashboard.svg', tone: 'tall' },
    { label: 'MARKETPLACE · FICTIONAL', url: '/demo-assets/demo-marketplace.svg', tone: 'wide' },
    { label: 'CAMPUS ILLUSTRATION · DEMO', url: '/demo-assets/demo-education.svg', tone: 'normal' },
    { label: 'WORKFLOW MOCKUP · DEMO', url: '/demo-assets/demo-experience.svg', tone: 'normal' },
  ],
}

const omittedAssistantFields = new Set([
  'image',
  'images',
  'photo',
  'video',
  'poster',
  'previewUrl',
  'publicId',
  'thumbnail',
])
const assistantStopWords = new Set([
  'a', 'about', 'all', 'an', 'and', 'are', 'can', 'did', 'do', 'does', 'for', 'from',
  'has', 'have', 'he', 'her', 'his', 'how', 'i', 'in', 'is', 'it', 'me', 'my', 'of',
  'on', 'or', 'tell', 'the', 'there', 'they', 'this', 'to', 'was', 'what', 'when',
  'where', 'which', 'who', 'with', 'you', 'your', 'kya', 'ka', 'ke', 'ki', 'ko',
  'hai', 'hain', 'tha', 'the', 'ye', 'yeh', 'us', 'uske', 'iske', 'mujhe', 'batao',
  'bata', 'about', 'kuch', 'sab', 'aur', 'mein', 'par', 'se', 'kaun', 'kab', 'kahan',
])
const assistantTopicAliases = {
  certificate: ['certificate', 'certificates', 'certification', 'certifications', 'credential', 'credentials'],
  project: ['project', 'projects', 'build', 'built', 'banaya', 'banaye'],
  skill: ['skill', 'skills', 'tool', 'tools', 'technology', 'technologies', 'stack', 'tech', 'technology'],
  experience: ['experience', 'employment', 'job', 'internship', 'role', 'career', 'tajurba', 'anubhav'],
  education: ['education', 'college', 'study', 'studies', 'course', 'diploma', 'padhai'],
  achievement: ['achievement', 'achievements', 'award', 'awards', 'milestone'],
  contact: ['contact', 'email', 'github', 'linkedin'],
}

const loadAssistantPortfolioData = async () => {
  if (mongoose.connection.readyState !== 1) {
    throw new Error('Portfolio database is unavailable.')
  }

  const [savedProjects, savedContent] = await Promise.all([
    Project.find().sort({ createdAt: 1 }).lean(),
    PortfolioContent.find({ key: { $in: ['about', ...assistantCollectionKeys] } }).lean(),
  ])
  const savedById = new Map(savedProjects.map((project) => [project.id, project.data]))
  const defaultProjects = portfolioData.projects.map((project) => savedById.get(project.id) || project)
  const defaultProjectIds = new Set(portfolioData.projects.map((project) => project.id))
  const addedProjects = savedProjects
    .filter((project) => !defaultProjectIds.has(project.id))
    .map((project) => project.data)
  const savedContentByKey = new Map(savedContent.map((entry) => [entry.key, entry.data]))

  return {
    profile: portfolioData.profile,
    homepageSettings: savedContentByKey.get('homepageSettings') || portfolioData.homepageSettings,
    about: savedContentByKey.get('about') || portfolioData.about,
    projects: [...addedProjects, ...defaultProjects],
    toolkitGroups: savedContentByKey.get('toolkitGroups') || portfolioData.toolkitGroups,
    journeyEvents: savedContentByKey.get('journeyEvents') || portfolioData.journeyEvents,
    educationEntries: savedContentByKey.get('educationEntries') || portfolioData.educationEntries,
    experienceEntries: savedContentByKey.get('experienceEntries') || portfolioData.experienceEntries,
    certificateEntries: savedContentByKey.get('about')?.certificates || portfolioData.about.certificates || [],
    achievements: savedContentByKey.get('achievements') || portfolioData.achievements,
    galleryItems: savedContentByKey.get('galleryItems') || portfolioData.galleryItems,
    contactLinks: savedContentByKey.get('contactLinks') || portfolioData.contactLinks,
    planetLinks: savedContentByKey.get('planetLinks') || portfolioData.planetLinks,
    resumeEntries: savedContentByKey.get('resumeEntries') || portfolioData.resumeEntries,
  }
}

const getAssistantDocuments = (portfolio) => {
  const documents = []
  const addDocument = (section, record, fallbackTitle) => {
    const parts = []
    const collectText = (value, key = '', depth = 0) => {
      if (depth > 6 || omittedAssistantFields.has(key)) return
      if (typeof value === 'string' || typeof value === 'number') {
        const text = String(value).trim()
        if (text) parts.push(text)
        return
      }
      if (Array.isArray(value)) {
        value.forEach((entry) => collectText(entry, key, depth + 1))
        return
      }
      if (value && typeof value === 'object') {
        Object.entries(value).forEach(([childKey, childValue]) => {
          if (['id', 'number', 'tone'].includes(childKey)) return
          parts.push(`${childKey}:`)
          collectText(childValue, childKey, depth + 1)
        })
      }
    }

    collectText(record)
    const text = [...new Set(parts)].join(' ').slice(0, 2400)
    if (!text) return

    const title = String(
      record?.title
      || record?.company
      || record?.label
      || record?.name
      || record?.year
      || fallbackTitle
      || section,
    ).slice(0, 140)
    documents.push({
      id: `S${documents.length + 1}`,
      section,
      title,
      text: `${section}: ${title}. ${text}`,
      record,
    })
  }
  const addCollection = (section, entries) => {
    if (!Array.isArray(entries)) return
    entries.forEach((entry, index) => addDocument(section, entry, `${section} ${index + 1}`))
  }

  addDocument('Profile', portfolio.profile, 'Profile')
  addDocument('Homepage introduction', {
    name: portfolio.homepageSettings?.heroName,
    role: portfolio.homepageSettings?.heroRole,
    availability: portfolio.homepageSettings?.availabilityText,
  }, 'Homepage introduction')
  const about = portfolio.about || {}
  const { colleges = [], webinars = [], certificates = [], images = [], links = [], ...aboutOverview } = about
  addDocument('About', aboutOverview, 'About')
  addCollection('Education and colleges', colleges)
  addCollection('Webinars and events', webinars)
  addCollection('Certificates', certificates)
  addCollection('About gallery', images)
  addCollection('About links', links)
  addCollection('Projects', portfolio.projects)
  addCollection('Skills and tools', portfolio.toolkitGroups)
  addCollection('Journey', portfolio.journeyEvents)
  addCollection('Education', portfolio.educationEntries)
  addCollection('Experience', portfolio.experienceEntries)
  addCollection('Achievements', portfolio.achievements)
  addCollection('Gallery', portfolio.galleryItems)
  addCollection('Resume', portfolio.resumeEntries)
  addCollection('Contact', portfolio.contactLinks)
  addCollection('Planet references', portfolio.planetLinks)
  return documents
}

const rankAssistantDocuments = (question, documents) => {
  const normalizedQuestion = question.toLocaleLowerCase()
  const queryTokens = new Set(
    (normalizedQuestion.match(/[\p{L}\p{N}]{2,}/gu) || [])
      .filter((token) => !assistantStopWords.has(token)),
  )

  Object.entries(assistantTopicAliases).forEach(([topic, aliases]) => {
    if (aliases.some((alias) => normalizedQuestion.includes(alias))) queryTokens.add(topic)
  })

  const ranked = documents.map((document) => {
    const documentText = document.text.toLocaleLowerCase()
    const titleText = document.title.toLocaleLowerCase()
    let score = 0
    queryTokens.forEach((token) => {
      if (titleText.includes(token)) score += 5
      if (documentText.includes(token)) score += 2
    })
    return { document, score }
  }).sort((left, right) => right.score - left.score)

  return ranked
    .filter((entry) => entry.score > 0)
    .slice(0, 18)
    .map(({ document }) => document)
}

const assistantTopicSections = {
  certificate: ['certificates', 'webinars and events'],
  project: ['projects'],
  skill: ['skills and tools'],
  experience: ['experience', 'journey'],
  education: ['education', 'education and colleges'],
  achievement: ['achievements'],
  contact: ['contact'],
}

const getAssistantRecordSummary = (document) => {
  const { record = {}, section } = document
  const describe = (...keys) => keys
    .map((key) => record[key])
    .find((value) => typeof value === 'string' && value.trim())
    ?.trim()
  const list = (...keys) => {
    const value = keys.map((key) => record[key]).find(Array.isArray)
    return value ? value.filter((item) => typeof item === 'string' && item.trim()) : []
  }

  if (section === 'Projects') {
    const description = describe('description', 'summary', 'problem', 'approach')
    const technologies = list('tech', 'technologies', 'stack')
    const category = describe('category')
    return [
      category,
      description,
      technologies.length ? `Built with ${technologies.join(', ')}` : '',
    ].filter(Boolean).join(' · ')
  }
  if (section === 'Skills and tools') {
    const group = describe('label', 'title')
      ?.replace(/^\d+\s*/, '')
      .replace(/[_-]+/g, ' ')
    return [group, list('skills', 'tools').join(', ')].filter(Boolean).join(': ')
  }
  if (section === 'Certificates' || section === 'Webinars and events') {
    const details = [describe('issuer', 'organization'), describe('date', 'year'), describe('credential')]
      .filter(Boolean)
    return details.join(' · ')
  }
  if (section === 'Experience' || section === 'Journey') {
    const role = describe('role', 'type')
    const organization = describe('company', 'organization')
    const dates = describe('dates', 'year', 'date')
    const description = describe('description', 'summary')
    return [
      [role, organization, dates].filter(Boolean).join(' · '),
      description,
      list('achievements', 'highlights').join('; '),
    ].filter(Boolean).join(' — ')
  }
  if (section === 'Education' || section === 'Education and colleges') {
    return [
      [describe('program', 'degree', 'course'), describe('institution', 'college'), describe('dates', 'year')]
        .filter(Boolean).join(' · '),
      describe('description', 'summary'),
    ].filter(Boolean).join(' — ')
  }
  if (section === 'Achievements') {
    return [
      [describe('organization'), describe('date', 'year')].filter(Boolean).join(' · '),
      describe('description', 'summary'),
    ].filter(Boolean).join(' — ')
  }
  if (section === 'Contact') {
    return [describe('label', 'type'), describe('value', 'url')].filter(Boolean).join(': ')
  }
  return [describe('description', 'biography', 'summary', 'value'), list('skills', 'tech').join(', ')]
    .filter(Boolean)
    .join(' — ')
}

const isHindiAssistantQuestion = (question) => (
  /[\u0900-\u097f]/u.test(question)
  || /\b(kya|kaun|kaunsi|kaise|batao|bataiye|hai|hain|ke|ki|ka|ko|mein|mujhe|uske|padhai|tajurba)\b/i.test(question)
)

const getAssistantTopic = (question) => {
  const normalizedQuestion = question.toLocaleLowerCase()
  return Object.entries(assistantTopicAliases).find(([, aliases]) => (
    aliases.some((alias) => normalizedQuestion.includes(alias))
  ))?.[0]
}

const createAssistantAnswer = (question, documents, history = []) => {
  const normalizedQuestion = question.toLocaleLowerCase().trim()
  const isHindi = isHindiAssistantQuestion(question)
  const followUpPattern = /^(and|also|more|why|how so|tell me more|more details|what else|examples|aur|aur batao|thoda aur|kyun|kaise|details|more about it|uske baare mein)\b/i
  const isFollowUp = followUpPattern.test(normalizedQuestion)
  const previousQuestion = history
    .filter((message) => message?.role === 'user' && typeof message.content === 'string')
    .slice(-3)
    .reverse()
    .find((message) => getAssistantTopic(message.content))
  const topic = getAssistantTopic(normalizedQuestion)
    || (isFollowUp && previousQuestion ? getAssistantTopic(previousQuestion.content) : undefined)
  const greetingPattern = /^(hi|hello|hey|namaste|नमस्ते|salaam)[!. ]*$/iu
  if (greetingPattern.test(normalizedQuestion)) {
    return {
      answer: isHindi
        ? 'Namaste! Main ABHI hoon, Abhinav ka portfolio assistant. Main unke projects, skills, certificates, education aur public portfolio details dhoondh sakta hoon.'
        : 'Hi! I’m ABHI, Abhinav’s portfolio assistant. I can search his projects, skills, certificates, education, and other public portfolio details.',
      sources: [],
    }
  }

  const topicSections = assistantTopicSections[topic]
  const topicDocuments = topicSections
    ? documents.filter((document) => topicSections.includes(document.section.toLocaleLowerCase()))
    : documents
  const queryForRanking = isFollowUp && !getAssistantTopic(normalizedQuestion) && previousQuestion
    ? previousQuestion.content
    : question
  const rankedMatches = rankAssistantDocuments(queryForRanking, topicDocuments.length ? topicDocuments : documents)
  const selectedDocuments = rankedMatches.slice(0, topic === 'skill' ? 5 : topic === 'certificate' ? 5 : topic ? 3 : 3)

  if (!selectedDocuments.length) {
    return {
      answer: isHindi
        ? 'Mujhe public portfolio details mein iska relevant jawab nahi mila. Aap projects, skills, certificates, education ya experience ke baare mein pooch sakte hain.'
        : 'I couldn’t find a matching answer in the public portfolio details. Try asking about projects, skills, certificates, education, or experience.',
      sources: [],
    }
  }

  const answerLines = selectedDocuments.map((document) => {
    const summary = getAssistantRecordSummary(document)
    const isSample = /\b(demo|sample|fictional|simulated|not a real|not employment|not a qualification|not an award|not issued)\b/i
      .test(`${document.title} ${document.text}`)
    const label = isSample ? `${isHindi ? 'Sample entry' : 'Sample entry'} — ${document.title}` : document.title
    return `• ${label}${summary ? ` — ${summary}` : ''}`
  })
  const hasMore = Boolean(topicSections && topicDocuments.length > selectedDocuments.length)
  const closing = hasMore
    ? (isHindi ? '\n\nAap kisi ek entry ka naam lekar uske baare mein aur pooch sakte hain.' : '\n\nAsk about a specific entry if you’d like more detail.')
    : ''

  return {
    answer: `${isHindi ? 'Portfolio ke mutabik:' : 'Based on the portfolio:'}\n\n${answerLines.join('\n')}${closing}`,
    sources: selectedDocuments.map(({ id, section, title }) => ({ id, section, title })),
  }
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
    const savedAnimationControls = mongoose.connection.readyState === 1
      ? await PortfolioContent.findOne({ key: 'animationControls' }).lean()
      : null
    const savedCollections = mongoose.connection.readyState === 1
      ? await PortfolioContent.find({ key: { $in: ['toolkitGroups', 'journeyEvents', 'educationEntries', 'experienceEntries', 'achievements', 'galleryItems', 'contactLinks', 'planetLinks', 'resumeEntries'] } }).lean()
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
      projectsStorage: mongoose.connection.readyState === 1 ? 'database' : 'default',
      adminAccessSettings: savedAdminAccess?.data || portfolioData.adminAccessSettings,
      adminAccessSettingsStorage: savedAdminAccess ? 'database' : adminAccessSettingsStorage,
      homepageSettings: savedHomepageSettings?.data || portfolioData.homepageSettings,
      homepageSettingsStorage: savedHomepageSettings ? 'database' : homepageSettingsStorage,
      edgeAnimationSettings: savedEdgeAnimation?.data || portfolioData.edgeAnimationSettings,
      edgeAnimationSettingsStorage: savedEdgeAnimation ? 'database' : edgeAnimationSettingsStorage,
      motionSettings: savedMotionSettings?.data || portfolioData.motionSettings,
      motionSettingsStorage: savedMotionSettings ? 'database' : motionSettingsStorage,
      animationControls: savedAnimationControls?.data || portfolioData.animationControls,
      animationControlsStorage: savedAnimationControls ? 'database' : animationControlsStorage,
      educationEntries: savedCollectionData.get('educationEntries') || portfolioData.educationEntries,
      educationStorage: savedCollectionData.has('educationEntries') ? 'database' : 'default',
      experienceEntries: savedCollectionData.get('experienceEntries') || portfolioData.experienceEntries,
      experienceStorage: savedCollectionData.has('experienceEntries') ? 'database' : 'default',
      achievements: savedCollectionData.get('achievements') || portfolioData.achievements,
      achievementsStorage: savedCollectionData.has('achievements') ? 'database' : 'default',
      galleryItems: savedCollectionData.get('galleryItems') || portfolioData.galleryItems,
      galleryStorage: savedCollectionData.has('galleryItems') ? 'database' : 'default',
      contactLinks: savedCollectionData.get('contactLinks') || portfolioData.contactLinks,
      planetLinks: savedCollectionData.get('planetLinks') || portfolioData.planetLinks,
      planetLinksStorage: savedCollectionData.has('planetLinks') ? 'database' : 'default',
      resumeEntries: savedCollectionData.get('resumeEntries') || portfolioData.resumeEntries,
      resumeStorage: savedCollectionData.has('resumeEntries') ? 'database' : 'default',
      toolkitGroups: savedCollectionData.get('toolkitGroups') || portfolioData.toolkitGroups,
      toolkitStorage: savedCollectionData.has('toolkitGroups') ? 'database' : 'default',
      journeyEvents: savedCollectionData.get('journeyEvents') || portfolioData.journeyEvents,
      journeyStorage: savedCollectionData.has('journeyEvents') ? 'database' : 'default',
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

app.put('/api/portfolio/animation-controls', async (req, res) => {
  const settings = req.body?.settings
  const allowedKeys = {
    sections: new Set(['hero', 'work', 'about', 'gallery', 'journey', 'toolkit', 'contact']),
    areas: new Set(['background', 'header', 'hero', 'content', 'contact', 'footer', 'loaders', 'admin']),
    effects: new Set([
      'pageAmbient', 'headerFloat', 'headerColorFlow', 'headerEdge', 'heroColorFlow', 'heroDrift',
      'planetOrbit', 'planetSignal', 'sunCorona', 'infoFloat', 'sectionColorFlow', 'projectColorFlow',
      'projectMediaColorFlow', 'projectMediaPulse', 'projectMediaSweep', 'contactSweep',
      'contactTextShine', 'contactArtworkDrift', 'footerColorFlow', 'footerEdge', 'footerStatusPulse',
      'bootPattern', 'bootAmbience', 'bootParticles', 'bootOrbit', 'bootTyping', 'bootCodeScroll',
      'bootScan', 'bootProgress', 'bootLivePulse', 'linkPromptPulse', 'linkPromptStylePulse',
      'linkLoaderGrid', 'linkLoaderPulse', 'linkLoaderScan', 'planetLoaderOrbit',
      'planetLoaderCodeScroll', 'planetLoaderPulse', 'adminDashboardDrift', 'effectPreviewOrbs',
      'effectPreviewDrift', 'effectPreviewPulse', 'effectPreviewOrbit', 'adminLoginDrift',
      'adminLoginPulse', 'adminLoginFloat',
    ]),
  }
  const isValidBooleanMap = (value, allowed) => value
    && typeof value === 'object'
    && !Array.isArray(value)
    && Object.entries(value).every(([key, enabled]) => allowed.has(key) && typeof enabled === 'boolean')
  const validSettings = settings
    && isValidBooleanMap(settings.sections, allowedKeys.sections)
    && isValidBooleanMap(settings.areas, allowedKeys.areas)
    && isValidBooleanMap(settings.effects, allowedKeys.effects)

  if (!validSettings) {
    return res.status(400).json({ success: false, message: 'Animation control settings are invalid.' })
  }

  if (mongoose.connection.readyState !== 1) {
    portfolioData.animationControls = settings
    animationControlsStorage = 'memory'
    return res.json({ success: true, settings, storage: 'memory' })
  }

  try {
    const savedSettings = await PortfolioContent.findOneAndUpdate(
      { key: 'animationControls' },
      { key: 'animationControls', data: settings },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    ).lean()

    animationControlsStorage = 'database'
    return res.json({ success: true, settings: savedSettings.data, storage: 'database' })
  } catch (error) {
    console.error('Failed to save animation controls:', error)
    portfolioData.animationControls = settings
    animationControlsStorage = 'memory'
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
  const submittedSettings = req.body?.settings
  if (!submittedSettings || typeof submittedSettings !== 'object' || Array.isArray(submittedSettings)) {
    return res.status(400).json({ message: 'Homepage settings are required.' })
  }

  const allowedDesigns = ['placement-pro', 'academic-clean', 'recruiter-brief', 'resume-grid', 'cosmic-studio', 'interactive-experience']
  if (!allowedDesigns.includes(submittedSettings.activeDesign)) {
    return res.status(400).json({ message: 'The selected homepage design is not supported.' })
  }
  const activeDesign = submittedSettings.activeDesign
  const textSettings = [
    ['heroName', 80, ''],
    ['heroRole', 120, ''],
    ['availabilityText', 100, 'Available for Frontend / Product / Internship'],
  ]
  const settings = { activeDesign }

  for (const [key, maxLength, fallback] of textSettings) {
    const value = submittedSettings[key] === undefined ? fallback : submittedSettings[key]
    if (typeof value !== 'string' || value.length > maxLength) {
      return res.status(400).json({ message: `${key} must be text no longer than ${maxLength} characters.` })
    }
    settings[key] = value.trim() || fallback
  }

  for (const [key, fallback] of [['nameColor', '#123B5B'], ['nameHighlightColor', '#177A56']]) {
    const value = submittedSettings[key] === undefined ? fallback : submittedSettings[key]
    if (typeof value !== 'string' || !/^#[0-9a-f]{6}$/i.test(value)) {
      return res.status(400).json({ message: `${key} must be a six-digit hexadecimal color.` })
    }
    settings[key] = value.toUpperCase()
  }

  const allowedAnimations = ['none', 'gradient', 'glow', 'float']
  settings.heroAnimation = allowedAnimations.includes(submittedSettings.heroAnimation)
    ? submittedSettings.heroAnimation
    : 'gradient'

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
  const allowedKeys = ['toolkitGroups', 'journeyEvents', 'educationEntries', 'experienceEntries', 'achievements', 'galleryItems', 'contactLinks', 'planetLinks', 'resumeEntries']

  if (!allowedKeys.includes(key) || !Array.isArray(req.body?.entries)) {
    return res.status(400).json({ success: false, message: 'A valid portfolio collection is required.' })
  }

  if (key === 'toolkitGroups' && (
    req.body.entries.length > 50
    || !req.body.entries.every((group) => typeof group?.label === 'string'
      && group.label.length <= 120
      && Array.isArray(group.skills)
      && group.skills.length <= 100
      && group.skills.every((skill) => typeof skill === 'string' && skill.length <= 120))
  )) {
    return res.status(400).json({ success: false, message: 'Skill groups must contain valid labels and skills.' })
  }

  if (key === 'journeyEvents' && (
    req.body.entries.length > 200
    || !req.body.entries.every((entry) => typeof entry?.year === 'string'
      && entry.year.length <= 40
      && typeof entry?.title === 'string'
      && entry.title.length <= 200
      && typeof entry?.description === 'string'
      && entry.description.length <= 5000
      && typeof (entry?.detail || '') === 'string'
      && (entry.detail || '').length <= 8000
      && typeof (entry?.location || '') === 'string'
      && (entry.location || '').length <= 250
      && Array.isArray(entry?.images || [])
      && (entry.images || []).length <= 20
      && Array.isArray(entry?.links || [])
      && (entry.links || []).length <= 20)
  )) {
    return res.status(400).json({ success: false, message: 'Journey entries contain invalid or oversized fields.' })
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

app.post('/api/assistant/ask', async (req, res) => {
  const question = typeof req.body?.question === 'string' ? req.body.question.trim() : ''
  if (question.length < 2 || question.length > 1200) {
    return res.status(400).json({ message: 'Enter a question between 2 and 1,200 characters.' })
  }

  const now = Date.now()
  const clientKey = req.ip || req.socket.remoteAddress || 'unknown'
  const requestTimes = (assistantRateLimit.get(clientKey) || []).filter((time) => now - time < 60_000)
  if (requestTimes.length >= 12) {
    assistantRateLimit.set(clientKey, requestTimes)
    return res.status(429).json({ message: 'Too many questions. Please wait a minute and try again.' })
  }
  requestTimes.push(now)
  assistantRateLimit.set(clientKey, requestTimes)
  if (assistantRateLimit.size > 1000) {
    for (const [key, times] of assistantRateLimit) {
      if (!times.some((time) => now - time < 60_000)) assistantRateLimit.delete(key)
    }
  }

  const history = Array.isArray(req.body?.history)
    ? req.body.history.slice(-6).filter((message) => (
      message?.role === 'user'
      && typeof message.content === 'string'
      && message.content.trim().length > 0
      && message.content.length <= 1200
    )).map((message) => ({ role: 'user', content: message.content.trim() }))
    : []

  try {
    const portfolio = await loadAssistantPortfolioData()
    const documents = getAssistantDocuments(portfolio)
    return res.json(createAssistantAnswer(question, documents, history))
  } catch (error) {
    console.error('[ask-abhi] Request failed:', error.message)
    if (error.message === 'Portfolio database is unavailable.') {
      return res.status(503).json({ message: 'Portfolio data is temporarily unavailable. Please try again shortly.' })
    }
    return res.status(502).json({ message: 'Ask ABHI is temporarily unavailable. Please try again shortly.' })
  }
})

app.post('/api/admin/login', (req, res) => {
  const configuredUsername = process.env.ADMIN_EMAIL || process.env.ADMIN_USERNAME
  const configuredPassword = process.env.ADMIN_PASSWORD

  if (!configuredUsername || !configuredPassword) {
    console.error('[admin-login] ADMIN_EMAIL (or ADMIN_USERNAME) and ADMIN_PASSWORD must be configured on the API server.')
    return res.status(503).json({ success: false, message: 'Admin login is not configured on the backend. Set ADMIN_EMAIL and ADMIN_PASSWORD on the API service.' })
  }

  const { username, password } = req.body || {}
  if (typeof username !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ success: false, message: 'Enter your admin username and password.' })
  }

  const usernameMatches = username.trim().toLowerCase() === configuredUsername.trim().toLowerCase()
  const passwordMatches = password === configuredPassword
  if (!usernameMatches || !passwordMatches) {
    return res.status(401).json({ success: false, message: 'Invalid username or password.' })
  }

  return res.json({ success: true })
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
