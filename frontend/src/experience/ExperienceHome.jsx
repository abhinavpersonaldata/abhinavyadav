import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  GitBranch,
  Globe,
  Mail,
} from 'lucide-react'
import './experience-home.css'

const LIVE_AI_URL = 'https://www.abhinavyadav.in/ai'

const getProjectImage = (project) => {
  if (project.image) return project.image
  const galleryImage = project.gallery?.find((item) => (typeof item === 'string' ? item : item?.url))
  return typeof galleryImage === 'string' ? galleryImage : galleryImage?.url || ''
}

const getInitials = (name) => name
  .split(/\s+/)
  .filter(Boolean)
  .slice(0, 2)
  .map((part) => part[0])
  .join('')
  .toUpperCase()

function ExperienceHome({
  portfolio,
  formState,
  formStatus,
  onFormChange,
  onFormSubmit,
  onOpenProject,
  onReturnToPortfolio,
}) {
  const profile = portfolio.profile || {}
  const settings = portfolio.homepageSettings || {}
  const about = portfolio.about || {}
  const name = String(settings.heroName || profile.name || 'Abhinav Yadav').trim()
  const role = String(settings.heroRole || profile.title || '').trim()
  const intro = about.homepageIntro || about.biography || ''
  const projects = (portfolio.projects || []).slice(0, 3)
  const toolkitGroups = (portfolio.toolkitGroups || []).filter((group) => group.skills?.length)
  const experienceEntries = portfolio.experienceEntries || []
  const contactLinks = (portfolio.contactLinks || []).filter((item) => item.value)
  const email = contactLinks.find((item) => item.type === 'email')?.value || profile.email || ''
  const accentColor = /^#[0-9a-f]{6}$/i.test(settings.nameHighlightColor || '')
    ? settings.nameHighlightColor
    : '#e89b73'

  return (
    <div className="experience-page" style={{ '--experience-accent': accentColor }}>
      <header className="experience-header" id="top">
        <a
          className="experience-wordmark"
          href="/"
          onClick={(event) => {
            event.preventDefault()
            onReturnToPortfolio()
          }}
          aria-label="Return to the original portfolio homepage"
        >
          <span>AY</span>
          <span className="experience-wordmark-copy">
            <strong>{name}</strong>
            <small>INDEPENDENT PORTFOLIO</small>
          </span>
        </a>

        <nav className="experience-nav" aria-label="Experience page navigation">
          <a href="#experience-work">Work</a>
          <a href="#experience-skills">Skills</a>
          <a href="#experience-journey">Experience</a>
          <a href="#experience-contact">Contact</a>
        </nav>

        <a
          className="experience-back-link"
          href="/"
          onClick={(event) => {
            event.preventDefault()
            onReturnToPortfolio()
          }}
        >
          Original site <ArrowUpRight size={15} aria-hidden="true" />
        </a>
      </header>

      <main className="experience-main">
        <section className="experience-hero" aria-labelledby="experience-hero-title">
          <div className="experience-hero-copy">
            <p className="experience-eyebrow"><span /> PORTFOLIO / INTERACTIVE EDITION</p>
            <h1 id="experience-hero-title">
              Hey, I&apos;m <span>{name}.</span>
            </h1>
            {role ? <p className="experience-role">{role}</p> : null}
            {intro ? <p className="experience-intro">{intro}</p> : null}

            <div className="experience-hero-actions">
              <a className="experience-primary-action" href="#experience-work">
                Explore selected work <ArrowDown size={16} aria-hidden="true" />
              </a>
              {email ? <a className="experience-secondary-action" href={`mailto:${email}`}>Get in touch</a> : null}
            </div>

            <div className="experience-social-links" aria-label="Contact and social links">
              {contactLinks.map((item, index) => {
                const Icon = item.type === 'email'
                  ? Mail
                  : item.type === 'github'
                    ? GitBranch
                    : item.type === 'linkedin'
                      ? Globe
                      : Globe
                const isEmail = item.type === 'email'

                return (
                  <a
                    key={`${item.type}-${item.value}-${index}`}
                    href={isEmail ? `mailto:${item.value}` : item.value}
                    target={isEmail ? undefined : '_blank'}
                    rel={isEmail ? undefined : 'noreferrer'}
                    aria-label={item.label || item.type}
                  >
                    <Icon size={16} aria-hidden="true" />
                    <span>{item.label || item.type}</span>
                  </a>
                )
              })}
            </div>
          </div>

          <div className="experience-hero-card">
            <div className="experience-card-orbit" aria-hidden="true"><span /><i /></div>
            <div className="experience-avatar">
              {about.photo
                ? <img src={about.photo} alt={`${name}`} />
                : <span>{getInitials(name)}</span>}
            </div>
            <p className="experience-card-label">A little about my focus</p>
            <h2>{role || 'Design-minded web development'}</h2>
            <p>{about.facts?.find((fact) => /focus/i.test(fact.label))?.value || 'Thoughtful, responsive web experiences.'}</p>
            <div className="experience-card-footer">
              <span>{profile.location || 'India'}</span>
              <span>{settings.availabilityText || 'Open to meaningful work'}</span>
            </div>
          </div>
        </section>

        <section className="experience-section" id="experience-work" aria-labelledby="experience-work-title">
          <div className="experience-section-heading">
            <div>
              <p className="experience-eyebrow">01 / SELECTED WORK</p>
              <h2 id="experience-work-title">Projects with a point of view.</h2>
            </div>
            <span>REAL WORK / REAL DETAILS</span>
          </div>

          {projects.length ? (
            <div className="experience-project-grid">
              {projects.map((project, index) => {
                const image = getProjectImage(project)

                return (
                  <button
                    className="experience-project-card"
                    key={project.id || project.title}
                    type="button"
                    onClick={() => onOpenProject(project.id)}
                    aria-label={`View project: ${project.title}`}
                  >
                    <span className="experience-project-visual">
                      {image
                        ? <img src={image} alt="" loading="lazy" decoding="async" />
                        : <span className="experience-project-placeholder">{String(index + 1).padStart(2, '0')}</span>}
                      <span className="experience-project-index">{String(index + 1).padStart(2, '0')}</span>
                      <span className="experience-project-arrow"><ArrowUpRight size={18} aria-hidden="true" /></span>
                    </span>
                    <span className="experience-project-copy">
                      <span className="experience-project-category">{project.category || 'PROJECT'}{project.date ? ` / ${project.date}` : ''}</span>
                      <strong>{project.title}</strong>
                      <span className="experience-project-description">{project.description}</span>
                      {project.tech?.length ? (
                        <span className="experience-project-tags">
                          {project.tech.slice(0, 3).map((item) => <i key={item}>{item}</i>)}
                        </span>
                      ) : null}
                    </span>
                  </button>
                )
              })}
            </div>
          ) : (
            <p className="experience-empty-state">Projects will appear here when they are published in the portfolio.</p>
          )}
        </section>

        <section className="experience-section experience-skills-section" id="experience-skills" aria-labelledby="experience-skills-title">
          <div className="experience-section-heading">
            <div>
              <p className="experience-eyebrow">02 / TOOLKIT</p>
              <h2 id="experience-skills-title">Tools I use to bring ideas to life.</h2>
            </div>
            <span>ALWAYS LEARNING</span>
          </div>
          {toolkitGroups.length ? (
            <div className="experience-toolkit">
              {toolkitGroups.map((group, index) => (
                <article className="experience-toolkit-row" key={`${group.label}-${index}`}>
                  <h3>{group.label}</h3>
                  <div>
                    {group.skills.map((skill, skillIndex) => <span key={`${skill}-${skillIndex}`}>{skill}</span>)}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="experience-empty-state">Skills will appear here when they are added to the portfolio.</p>
          )}
        </section>

        <section className="experience-section" id="experience-journey" aria-labelledby="experience-journey-title">
          <div className="experience-section-heading">
            <div>
              <p className="experience-eyebrow">03 / EXPERIENCE</p>
              <h2 id="experience-journey-title">The work behind the work.</h2>
            </div>
            <span>OPEN A STORY TO READ MORE</span>
          </div>
          {experienceEntries.length ? (
            <div className="experience-accordion">
              {experienceEntries.map((item, index) => (
                <details key={`${item.company}-${item.role}-${index}`} open={index === 0}>
                  <summary>
                    <span className="experience-accordion-index">{String(index + 1).padStart(2, '0')}</span>
                    <span className="experience-accordion-title">
                      <strong>{item.company || item.title}</strong>
                      <small>{[item.role, item.dates].filter(Boolean).join(' / ')}</small>
                    </span>
                    <ArrowRight size={18} aria-hidden="true" />
                  </summary>
                  <div className="experience-accordion-content">
                    {item.description ? <p>{item.description}</p> : null}
                    {item.achievements?.length ? (
                      <ul>{item.achievements.map((achievement, achievementIndex) => <li key={`${achievement}-${achievementIndex}`}>{achievement}</li>)}</ul>
                    ) : null}
                    {item.links?.filter((link) => link.url).map((link, linkIndex) => (
                      <a key={`${link.url}-${linkIndex}`} href={link.url} target="_blank" rel="noreferrer">
                        {link.label || 'View details'} <ArrowUpRight size={14} aria-hidden="true" />
                      </a>
                    ))}
                  </div>
                </details>
              ))}
            </div>
          ) : (
            <p className="experience-empty-state">Experience entries will appear here when they are added to the portfolio.</p>
          )}
        </section>

        <section className="experience-ai-callout" aria-labelledby="experience-ai-title">
          <div>
            <p className="experience-eyebrow">A QUESTION ON YOUR MIND?</p>
            <h2 id="experience-ai-title">Ask ABHI about my work.</h2>
            <p>Open the existing Ask ABHI chat on the live portfolio to explore projects, skills, and experience.</p>
          </div>
          <a href={LIVE_AI_URL} target="_blank" rel="noreferrer">
            Open Ask ABHI AI <ArrowUpRight size={16} aria-hidden="true" />
          </a>
        </section>

        <section className="experience-section experience-contact-section" id="experience-contact" aria-labelledby="experience-contact-title">
          <div className="experience-contact-copy">
            <p className="experience-eyebrow">04 / GET IN TOUCH</p>
            <h2 id="experience-contact-title">Have something good in mind?</h2>
            <p>Share a little about it. I&apos;ll get back to you as soon as I can.</p>
            {email ? <a className="experience-email-link" href={`mailto:${email}`}>{email} <ArrowUpRight size={15} aria-hidden="true" /></a> : null}
          </div>

          <form className="experience-contact-form" onSubmit={onFormSubmit}>
            <div className="experience-field-row">
              <label>
                <span>Name</span>
                <input name="name" value={formState.name} onChange={onFormChange} autoComplete="name" required />
              </label>
              <label>
                <span>Email</span>
                <input name="email" type="email" value={formState.email} onChange={onFormChange} autoComplete="email" required />
              </label>
            </div>
            <label>
              <span>Subject</span>
              <input name="subject" value={formState.subject} onChange={onFormChange} />
            </label>
            <label>
              <span>Message</span>
              <textarea name="message" rows="4" value={formState.message} onChange={onFormChange} required />
            </label>
            {formStatus ? <p className="experience-form-status" role="status">{formStatus}</p> : null}
            <button type="submit">Send a message <ArrowRight size={16} aria-hidden="true" /></button>
          </form>
        </section>
      </main>

      <footer className="experience-footer">
        <span>© {new Date().getFullYear()} {name}</span>
        <a href="#top" onClick={(event) => { event.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }) }}>
          Back to top <ArrowUpRight size={14} aria-hidden="true" />
        </a>
      </footer>
    </div>
  )
}

export default ExperienceHome
