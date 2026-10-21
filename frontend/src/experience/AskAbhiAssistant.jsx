import { useEffect, useRef, useState } from 'react'
import { MessageCircle, Send, X } from 'lucide-react'
import './ask-abhi-assistant.css'

const API_BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')
const SUGGESTED_QUESTIONS = [
  'What are Abhinav’s strongest projects?',
  'Which technologies does he work with?',
  'What is listed about his education?',
]

const renderMessageContent = (content) => content
  .split(/\n{2,}/)
  .filter(Boolean)
  .map((block, index) => {
    const lines = block.split('\n').filter(Boolean)
    const isList = lines.length > 1 && lines.every((line) => line.startsWith('• '))
    return isList ? (
      <ul key={index}>
        {lines.map((line) => <li key={line}>{line.slice(2)}</li>)}
      </ul>
    ) : (
      <p key={index}>{block}</p>
    )
  })

function AskAbhiAssistant({ open, onOpen, onClose }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hi, I’m ABHI. I can help you explore Abhinav’s public portfolio—projects, skills, education, and more.',
      sources: [],
    },
  ])
  const [question, setQuestion] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messageListRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    if (!open) return undefined
    inputRef.current?.focus()

    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && !isLoading) onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isLoading, onClose, open])

  useEffect(() => {
    messageListRef.current?.scrollTo({
      top: messageListRef.current.scrollHeight,
      behavior: 'smooth',
    })
  }, [messages, isLoading, error])

  const askQuestion = async (submittedQuestion) => {
    const text = submittedQuestion.trim()
    if (text.length < 2 || isLoading) return

    const history = messages
      .filter((message) => message.role === 'user')
      .slice(-6)
      .map(({ role, content }) => ({ role, content }))
    setMessages((current) => [...current, { role: 'user', content: text, sources: [] }])
    setQuestion('')
    setError('')
    setIsLoading(true)

    try {
      const response = await fetch(`${API_BASE_URL}/api/assistant/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: text, history }),
      })
      const result = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(result.message || 'I couldn’t reach the portfolio assistant. Please try again.')
      }
      if (typeof result.answer !== 'string' || !result.answer.trim()) {
        throw new Error('I couldn’t find an answer just now. Please try rephrasing your question.')
      }

      setMessages((current) => [...current, {
        role: 'assistant',
        content: result.answer.trim(),
        sources: Array.isArray(result.sources) ? result.sources : [],
      }])
    } catch (requestError) {
      setError(requestError.message || 'Ask ABHI is temporarily unavailable. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    void askQuestion(question)
  }

  return (
    <>
      <button
        type="button"
        className="ask-abhi-launcher"
        aria-label="Ask ABHI AI"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={onOpen}
      >
        <MessageCircle size={19} aria-hidden="true" />
        <span>Ask ABHI</span>
      </button>

      {open ? (
        <section className="ask-abhi-panel" role="dialog" aria-modal="true" aria-labelledby="ask-abhi-title">
          <header className="ask-abhi-header">
            <span className="ask-abhi-avatar" aria-hidden="true">AY</span>
            <div>
              <h2 id="ask-abhi-title">Ask ABHI</h2>
              <p>Answers from portfolio content</p>
            </div>
            <button type="button" onClick={onClose} aria-label="Close Ask ABHI" disabled={isLoading}>
              <X size={18} aria-hidden="true" />
            </button>
          </header>

          <div className="ask-abhi-messages" ref={messageListRef} aria-live="polite" aria-relevant="additions text">
            {messages.map((message, index) => (
              <article className={`ask-abhi-message ${message.role}`} key={`${message.role}-${index}`}>
                <div className="ask-abhi-message-content">{renderMessageContent(message.content)}</div>
                {message.sources?.length ? (
                  <div className="ask-abhi-sources" aria-label="Portfolio sources used">
                    {message.sources.slice(0, 5).map((source) => (
                      <span key={source.id} title={source.section}>{source.title}</span>
                    ))}
                  </div>
                ) : null}
              </article>
            ))}

            {messages.length === 1 ? (
              <div className="ask-abhi-suggestions" aria-label="Suggested questions">
                {SUGGESTED_QUESTIONS.map((suggestion) => (
                  <button type="button" key={suggestion} onClick={() => void askQuestion(suggestion)}>
                    {suggestion}
                  </button>
                ))}
              </div>
            ) : null}

            {isLoading ? (
              <p className="ask-abhi-thinking" role="status"><span /> Searching the portfolio…</p>
            ) : null}
            {error ? <p className="ask-abhi-error" role="alert">{error}</p> : null}
          </div>

          <form className="ask-abhi-form" onSubmit={handleSubmit}>
            <label className="ask-abhi-sr-only" htmlFor="ask-abhi-question">Ask about the portfolio</label>
            <textarea
              id="ask-abhi-question"
              ref={inputRef}
              rows="2"
              maxLength={1200}
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder="Ask about projects, skills, certificates…"
              disabled={isLoading}
            />
            <button type="submit" aria-label="Send question" disabled={isLoading || question.trim().length < 2}>
              <Send size={17} aria-hidden="true" />
            </button>
          </form>
          <p className="ask-abhi-disclaimer">Answers are based on public portfolio content.</p>
        </section>
      ) : null}
    </>
  )
}

export default AskAbhiAssistant
