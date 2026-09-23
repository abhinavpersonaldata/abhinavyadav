import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  ArrowUpRight,
  Download,
  GitBranch,
  Globe,
  LayoutGrid,
  Mail,
  Menu,
  MoonStar,
  SunMedium,
} from 'lucide-react'

const motionSettings = {
  hidden: { opacity: 0, y: 26 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } },
}

const ADMIN_CREDENTIALS = {
  username: import.meta.env.VITE_ADMIN_USERNAME || 'yadavabhinav551@gmail.com',
  password: import.meta.env.VITE_ADMIN_PASSWORD || '12345678',
}
const ADMIN_AUTH_STORAGE_KEY = 'portfolio-admin-auth-v2'

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

function App() {
  const [theme, setTheme] = useState('dark')
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
    profile: { name: 'Abhinav Yadav', title: 'Computer Science & Engineering Diploma Student', location: 'India', email: 'abhinavyadav.contact@gmail.com', github: 'https://github.com', linkedin: 'https://linkedin.com' },
    navItems: ['WORK', 'ABOUT', 'JOURNEY', 'TOOLKIT', 'CONTACT'],
    projects: [],
    toolkitGroups: [],
    journeyEvents: [],
    educationEntries: [],
    experienceEntries: [],
    certificateEntries: [],
    achievements: [],
    galleryItems: [],
  })
  const [selectedProjectId, setSelectedProjectId] = useState('studio-grid')
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
  const [showJourneyForm, setShowJourneyForm] = useState(false)
  const [editingJourneyId, setEditingJourneyId] = useState(null)
  const [journeyDraft, setJourneyDraft] = useState({
    year: '',
    title: '',
    description: '',
  })
  const [resumeStatus, setResumeStatus] = useState('Resume last updated 2 days ago')
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

  useEffect(() => {
    try {
      localStorage.setItem(ADMIN_AUTH_STORAGE_KEY, String(isAdminAuthenticated))
    } catch {
      // noop
    }
  }, [isAdminAuthenticated])

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
    const loadPortfolio = async () => {
      try {
        const response = await apiFetch('/api/portfolio')
        const data = await response.json()
        setPortfolio(data)
        if (data.projects?.length) {
          setSelectedProjectId(data.projects[0].id)
        }
      } catch (error) {
        console.error('Failed to load portfolio data:', error)
      }
    }

    loadPortfolio()
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

  const selectedProject = useMemo(
    () => portfolio.projects.find((project) => project.id === selectedProjectId) ?? portfolio.projects[0],
    [portfolio.projects, selectedProjectId],
  )

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

  const handleAdminAccess = () => {
    if (isAdminAuthenticated) {
      setView('admin')
      return
    }

    setView('admin-login')
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

  const handleJourneyDraftChange = (event) => {
    const { name, value } = event.target
    setJourneyDraft((current) => ({ ...current, [name]: value }))
  }

  const resetJourneyDraft = () => {
    setJourneyDraft({ year: '', title: '', description: '' })
    setEditingJourneyId(null)
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
    }

    setPortfolio((current) => ({
      ...current,
      journeyEvents: editingJourneyId
        ? current.journeyEvents.map((entry, index) => (index === editingJourneyId ? journeyEntry : entry))
        : [journeyEntry, ...current.journeyEvents],
    }))

    resetJourneyDraft()
    setShowJourneyForm(false)
    setAdminSection('journey')
  }

  const handleDeleteJourney = (index) => {
    setPortfolio((current) => ({
      ...current,
      journeyEvents: current.journeyEvents.filter((_, itemIndex) => itemIndex !== index),
    }))
  }

  const beginEditJourney = (entry, index) => {
    setEditingJourneyId(index)
    setJourneyDraft({
      year: entry.year,
      title: entry.title,
      description: entry.description,
    })
    setShowJourneyForm(true)
    setAdminSection('journey')
  }

  const visibleProjects = useMemo(() => {
    return portfolio.projects.filter((project) => {
      const matchesFilter = projectFilter === 'all' || project.category.toLowerCase().includes(projectFilter)
      const term = projectSearch.trim().toLowerCase()
      const matchesSearch = !term || [project.title, project.category, project.description, project.tech.join(' ')].join(' ').toLowerCase().includes(term)
      return matchesFilter && matchesSearch
    })
  }, [portfolio.projects, projectFilter, projectSearch])

  const renderHome = () => (
    <>
      <header className="topbar">
        <button type="button" className="brand-mark" aria-label="Abhinav Yadav logo" onClick={() => setView('home')}>
          AY
        </button>

        <nav className="main-nav" aria-label="Main navigation">
          {portfolio.navItems.map((item) => (
            <a key={item} href={`#${item.toLowerCase()}`}>
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
          <button type="button" className="primary-btn" onClick={handleAdminAccess}>
            <span>{isAdminAuthenticated ? 'Dashboard' : 'Admin Login'}</span>
            <LayoutGrid size={15} />
          </button>
          <a href="#contact" className="primary-btn">
            <span>Let&apos;s Talk</span>
            <ArrowUpRight size={15} />
          </a>
          <button type="button" className="mobile-menu" aria-label="Open menu">
            <Menu size={18} />
          </button>
        </div>
      </header>

      <main className="page-content">
        <motion.section className="hero-panel" initial="hidden" animate="show" variants={motionSettings}>
          <div className="status-line">AVAILABLE FOR LEARNING / BUILDING / INTERNSHIP</div>

          <div className="hero-grid">
            <div className="hero-copy">
              <p className="eyebrow">Computer Science & Engineering diploma student</p>
              <h1>
                ABHINAV
                <span>YADAV</span>
              </h1>
              <p className="lede">
                I build digital products, web experiences, and learning-driven experiments
                for the browser.
              </p>

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

            <div className="hero-visual" aria-hidden="true">
              <div className="visual-core">
                <div className="signal-ring signal-ring-one" />
                <div className="signal-ring signal-ring-two" />
                <div className="signal-ring signal-ring-three" />
                <div className="monogram-block">AY</div>
              </div>
              <div className="visual-list">
                <span>STUDIO</span>
                <span>BUILD</span>
                <span>LEARN</span>
              </div>
            </div>
          </div>
        </motion.section>

        <motion.section id="work" className="content-section" initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} variants={motionSettings}>
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

          <div className="project-stack">
            {visibleProjects.length ? visibleProjects.map((project, index) => (
              <article key={project.title} className={`project-panel ${index % 2 === 1 ? 'reverse' : ''}`}>
                <div className={`project-media media-${project.accent}`}>
                  {project.video ? (
                    <video
                      className="project-video"
                      src={project.video}
                      autoPlay
                      muted
                      loop
                      playsInline
                    />
                  ) : project.image ? (
                    <img className="project-image" src={project.image} alt={project.title} />
                  ) : (
                    <div className="media-surface" />
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
              </article>
            )) : (
              <div className="empty-state">No projects match your current search or filter.</div>
            )}
          </div>
        </motion.section>

        <motion.section id="about" className="content-section spaced" initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} variants={motionSettings}>
          <div className="section-header narrow-header">
            <span className="section-tag">02 — ABOUT</span>
            <h2>Still learning. Already building.</h2>
          </div>

          <div className="about-layout">
            <div className="about-index">02</div>

            <div className="about-copy">
              <p>
                I am a diploma student in Computer Science & Engineering exploring the web
                as a creative and technical medium. My focus is learning by building—turning
                ideas into interfaces, prototypes, and product thinking that feels useful.
              </p>
            </div>

            <div className="about-meta">
              <div>
                <span>CURRENTLY STUDYING</span>
                <strong>Diploma in Computer Science & Engineering</strong>
              </div>
              <div>
                <span>YEAR</span>
                <strong>2nd Year</strong>
              </div>
              <div>
                <span>FOCUS</span>
                <strong>Web Development</strong>
              </div>
              <div>
                <span>LOCATION</span>
                <strong>India</strong>
              </div>
            </div>
          </div>
        </motion.section>

        <motion.section id="toolkit" className="content-section spaced" initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} variants={motionSettings}>
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
        </motion.section>

        <motion.section id="journey" className="content-section spaced" initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} variants={motionSettings}>
          <div className="section-header">
            <span className="section-tag">04 — JOURNEY</span>
            <h2>Career archive and learning path.</h2>
          </div>

          <div className="timeline">
            {portfolio.journeyEvents.map((event) => (
              <div key={event.year} className="timeline-item">
                <div className="timeline-year">{event.year}</div>
                <div className="timeline-line" aria-hidden="true" />
                <div className="timeline-copy">
                  <h3>{event.title}</h3>
                  <p>{event.description}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        <motion.section id="education" className="content-section spaced" initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} variants={motionSettings}>
          <div className="section-header">
            <span className="section-tag">05 — EDUCATION</span>
            <h2>Academic record and learning focus.</h2>
          </div>

          <div className="list-archive">
            {portfolio.educationEntries.map((item) => (
              <article key={item.title} className="archive-row">
                <div className="archive-meta">
                  <span>{item.dates}</span>
                  <span>{item.location}</span>
                </div>
                <div className="archive-content">
                  <h3>{item.title}</h3>
                  <p className="archive-institution">{item.institution}</p>
                  <p>{item.description}</p>
                </div>
              </article>
            ))}
          </div>
        </motion.section>

        <motion.section id="experience" className="content-section spaced" initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} variants={motionSettings}>
          <div className="section-header">
            <span className="section-tag">06 — EXPERIENCE</span>
            <h2>Professional context and working rhythm.</h2>
          </div>

          <div className="experience-grid">
            {portfolio.experienceEntries.map((item) => (
              <article key={`${item.company}-${item.role}`} className="experience-card">
                <div className="experience-header">
                  <span>{item.company}</span>
                  <strong>{item.role}</strong>
                </div>
                <div className="experience-meta">
                  <span>{item.type}</span>
                  <span>{item.location}</span>
                  <span>{item.dates}</span>
                </div>
                <p>{item.description}</p>
                <ul>
                  {item.achievements.map((achievement) => (
                    <li key={achievement}>{achievement}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </motion.section>

        <motion.section id="certificates" className="content-section spaced" initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} variants={motionSettings}>
          <div className="section-header">
            <span className="section-tag">07 — CERTIFICATES</span>
            <h2>Proof of learning and technical progress.</h2>
          </div>

          <div className="certificate-list">
            {portfolio.certificateEntries.map((item) => (
              <article key={item.title} className="certificate-row">
                <div>
                  <span className="certificate-label">Certificate</span>
                  <h3>{item.title}</h3>
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
                <a href="#" className="inline-link">
                  VIEW
                  <ArrowUpRight size={14} />
                </a>
              </article>
            ))}
          </div>
        </motion.section>

        <motion.section id="achievements" className="content-section spaced" initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} variants={motionSettings}>
          <div className="section-header">
            <span className="section-tag">08 — ACHIEVEMENTS</span>
            <h2>Milestones shaped by iteration and curiosity.</h2>
          </div>

          <div className="achievement-list">
            {portfolio.achievements.map((item, index) => (
              <article key={item.title} className="achievement-row">
                <div className="achievement-index">{String(index + 1).padStart(2, '0')}</div>
                <div className="achievement-copy">
                  <h3>{item.title}</h3>
                  <div className="achievement-meta">
                    <span>{item.organization}</span>
                    <span>{item.date}</span>
                  </div>
                  <p>{item.description}</p>
                </div>
              </article>
            ))}
          </div>
        </motion.section>

        <motion.section id="gallery" className="content-section spaced" initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} variants={motionSettings}>
          <div className="section-header">
            <span className="section-tag">09 — GALLERY</span>
            <h2>Visual notes from research, build, and process.</h2>
          </div>

          <div className="gallery-grid">
            {portfolio.galleryItems.map((item) => (
              <div key={item.label} className={`gallery-item ${item.tone}`}>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </motion.section>

        <motion.section id="resume" className="content-section spaced" initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} variants={motionSettings}>
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
        </motion.section>

        <motion.section id="contact" className="content-section contact-panel" initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} variants={motionSettings}>
          <div className="contact-graphic" aria-hidden="true">
            <span>LET&apos;S MAKE</span>
            <span>SOMETHING</span>
            <span>USEFUL.</span>
          </div>

          <div className="contact-details">
            <p className="section-tag">11 — CONTACT</p>
            <p className="contact-copy">
              I&apos;m open to learning opportunities, collaborative builds, and thoughtful web
              experiences.
            </p>

            <div className="contact-meta">
              <a href={`mailto:${portfolio.profile.email}`}>
                <Mail size={16} />
                {portfolio.profile.email}
              </a>
              <a href={portfolio.profile.github} target="_blank" rel="noreferrer">
                <GitBranch size={16} />
                GitHub
              </a>
              <a href={portfolio.profile.linkedin} target="_blank" rel="noreferrer">
                <Globe size={16} />
                LinkedIn
              </a>
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
        </motion.section>
      </main>

      <footer className="site-footer">
        <div className="footer-brand">
          <div className="brand-mark small">AY</div>
          <div>
            <strong>ABHINAV YADAV</strong>
            <p>Building thoughtful web experiences while learning.</p>
          </div>
        </div>

        <div className="footer-links">
          <a href="#work">WORK</a>
          <a href="#about">ABOUT</a>
          <a href="#journey">JOURNEY</a>
          <a href="#toolkit">TOOLKIT</a>
          <a href="#contact">CONTACT</a>
        </div>

        <div className="footer-meta">
          <a href="#resume">Resume</a>
          <a href="mailto:abhinavyadav.contact@gmail.com">Email</a>
          <span>© 2026</span>
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
        {selectedProject.video ? <video className="project-hero-video" src={selectedProject.video} autoPlay muted loop controls playsInline /> : null}
        {selectedProject.image ? <img className="project-hero-image" src={selectedProject.image} alt={`${selectedProject.title} cover`} /> : null}
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

              <div className="login-meta">
                <span>Local admin access</span>
                <strong>Use your configured credentials</strong>
              </div>

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
          <button type="button" className={`nav-button ${adminSection === 'projects' ? 'active' : ''}`} onClick={() => handleAdminAction('projects')}>Projects</button>
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
                  <video className="upload-preview" src={projectDraft.video} controls muted autoPlay loop playsInline />
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

        {adminSection === 'skills' ? (
          <section className="panel-card admin-list-panel">
            <div className="panel-header">
              <h2>Skill stack</h2>
            </div>
            <div className="list-stack">
              {portfolio.toolkitGroups.map((group) => (
                <div key={group.label} className="skill-block">
                  <strong>{group.label}</strong>
                  <div className="tag-list">
                    {group.skills.map((skill) => <span key={skill}>{skill}</span>)}
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
            <label>
              <span>Description</span>
              <textarea name="description" value={journeyDraft.description} onChange={handleJourneyDraftChange} rows="4" placeholder="Write the journey detail..." required />
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
                <div key={`${event.year}-${event.title}`} className="mini-list-row timeline-row">
                  <div className="timeline-year-block">{event.year}</div>
                  <div className="timeline-copy">
                    <strong>{event.title}</strong>
                    <p>{event.description}</p>
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

  return <div className="site-shell">{view === 'home' ? renderHome() : view === 'project' ? renderProjectDetail() : renderAdmin()}</div>
}

export default App
