import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
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
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      callback(null, true)
      return
    }

    callback(new Error('Only image and video files are supported.'))
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
  about: {
    heading: 'Building useful digital experiences with clarity and craft.',
    biography: 'I am a Computer Science & Engineering diploma student focused on frontend development, product thinking, and building polished web experiences. I enjoy translating ideas into interfaces that are thoughtful, responsive, and genuinely useful.',
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
    { title: 'Diploma in Computer Science & Engineering', institution: 'EDITABLE PLACEHOLDER INSTITUTION', dates: '2024 — 2027', location: 'India', description: 'Core curriculum and practical learning focused on software, systems, and web technologies.' },
    { title: 'Web Technology & UI Practice', institution: 'Independent Learning Path', dates: 'Ongoing', location: 'Remote / Self-directed', description: 'Structured practice in frontend architecture, interface systems, and interactive design.' },
  ],
  experienceEntries: [
    { company: 'EDITABLE PLACEHOLDER COMPANY', role: 'Frontend Learner / Product Intern', type: 'Learning Internship / Project Experience', dates: '2025 — Present', location: 'Remote', description: 'Supported learning projects, product experimentation, and interface refinement.', achievements: ['UI prototyping', 'Design iteration', 'Workflow learning'] },
    { company: 'EDITABLE PLACEHOLDER COMPANY', role: 'Web Development Intern', type: 'Project-Based', dates: '2024 — 2025', location: 'Remote', description: 'Worked on static and dynamic web interfaces while learning reusable systems.', achievements: ['Responsive layouts', 'Component thinking', 'Code organization'] },
  ],
  certificateEntries: [
    { title: 'Frontend Fundamentals', issuer: 'EDITABLE PLACEHOLDER', date: '2025', credential: 'Certificate ID — EDITABLE PLACEHOLDER' },
    { title: 'Web Development Essentials', issuer: 'EDITABLE PLACEHOLDER', date: '2025', credential: 'Certificate ID — EDITABLE PLACEHOLDER' },
    { title: 'UI / UX Design Practice', issuer: 'EDITABLE PLACEHOLDER', date: '2026', credential: 'Certificate ID — EDITABLE PLACEHOLDER' },
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

app.get('/api/portfolio', async (req, res) => {
  try {
    const savedProjects = mongoose.connection.readyState === 1
      ? await Project.find().sort({ createdAt: 1 }).lean()
      : []
    const savedAbout = mongoose.connection.readyState === 1
      ? await PortfolioContent.findOne({ key: 'about' }).lean()
      : null
    const savedCollections = mongoose.connection.readyState === 1
      ? await PortfolioContent.find({ key: { $in: ['experienceEntries', 'achievements', 'galleryItems', 'contactLinks'] } }).lean()
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
      experienceEntries: savedCollectionData.get('experienceEntries') || portfolioData.experienceEntries,
      achievements: savedCollectionData.get('achievements') || portfolioData.achievements,
      galleryItems: savedCollectionData.get('galleryItems') || portfolioData.galleryItems,
      contactLinks: savedCollectionData.get('contactLinks') || portfolioData.contactLinks,
      projects,
    })
  } catch (error) {
    console.error('Failed to load saved projects:', error)
    res.json(portfolioData)
  }
})

app.put('/api/portfolio/about', async (req, res) => {
  const about = req.body
  const collectionKeys = ['facts', 'colleges', 'webinars', 'certificates', 'images', 'links']

  if (typeof about?.biography !== 'string' || collectionKeys.some((key) => !Array.isArray(about[key]))) {
    return res.status(400).json({ success: false, message: 'About content is incomplete or invalid.' })
  }

  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ success: false, message: 'MongoDB is not connected. About changes can only be saved in this browser.' })
  }

  try {
    const savedAbout = await PortfolioContent.findOneAndUpdate(
      { key: 'about' },
      { key: 'about', data: about },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    ).lean()

    return res.json({ success: true, about: savedAbout.data })
  } catch (error) {
    console.error('Failed to save About content:', error)
    return res.status(503).json({ success: false, message: 'About content could not be saved.' })
  }
})

app.put('/api/portfolio/content/:key', async (req, res) => {
  const { key } = req.params
  const allowedKeys = ['experienceEntries', 'achievements', 'galleryItems', 'contactLinks']

  if (!allowedKeys.includes(key) || !Array.isArray(req.body?.entries)) {
    return res.status(400).json({ success: false, message: 'A valid portfolio collection is required.' })
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

    return res.json({ success: true, key, entries: savedCollection.data })
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
    return res.status(400).json({ success: false, message: 'An image or video file is required.' })
  }

  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    return res.status(503).json({ success: false, message: 'Media storage is not configured on the backend.' })
  }

  try {
    const resourceType = req.file.mimetype.startsWith('video/') ? 'video' : 'image'
    const result = await new Promise((resolve, reject) => {
      const uploadMethod = resourceType === 'video'
        ? cloudinary.uploader.upload_chunked_stream
        : cloudinary.uploader.upload_stream
      const stream = uploadMethod.call(cloudinary.uploader,
        {
          folder: 'abhinav-portfolio/projects',
          resource_type: resourceType,
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

  if (error?.message === 'Only image and video files are supported.') {
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
