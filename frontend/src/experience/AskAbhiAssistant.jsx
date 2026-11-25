import { useEffect, useRef, useState } from 'react'
import { History, MessageCircle, Plus, Send, X } from 'lucide-react'
import './ask-abhi-assistant.css'

const API_BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')
const HISTORY_STORAGE_KEY = 'ask-abhi-conversations-v1'
const ADMIN_AUTH_STORAGE_KEY = 'portfolio-admin-token-v1'
const SUGGESTED_QUESTIONS = [
  'What are Abhinav’s strongest projects?',
  'Which technologies does he work with?',
  'What is listed about his education?',
]

const readConversations = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(HISTORY_STORAGE_KEY) || '[]')
    return Array.isArray(saved)
      ? saved.filter((item) => typeof item?.conversationId === 'string' && typeof item?.ownerToken === 'string')
      : []
  } catch {
    return []
  }
}

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
  const [conversations, setConversations] = useState(readConversations)
  const [activeConversationId, setActiveConversationId] = useState(() => readConversations()[0]?.conversationId || '')
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
    if (!open || !activeConversationId) return undefined
    const activeConversation = conversations.find((item) => item.conversationId === activeConversationId)
    if (!activeConversation) return undefined
    const controller = new AbortController()

    const loadConversation = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/assistant/conversations/${encodeURIComponent(activeConversationId)}`, {
          headers: { 'X-Conversation-Token': activeConversation.ownerToken },
          signal: controller.signal,
        })
        const result = await response.json().catch(() => ({}))
        if (!response.ok) throw new Error(result.message || 'Conversation history could not be loaded.')
        if (!controller.signal.aborted && Array.isArray(result.conversation?.messages)) {
          setMessages(result.conversation.messages)
        }
      } catch (requestError) {
        if (requestError.name !== 'AbortError') setError(requestError.message || 'Conversation history could not be loaded.')
      }
    }

    void loadConversation()
    return () => controller.abort()
  }, [activeConversationId, conversations, open])

  useEffect(() => {
    messageListRef.current?.scrollTo({
      top: messageListRef.current.scrollHeight,
      behavior: 'smooth',
    })
  }, [messages, isLoading, error])

  const askQuestion = async (submittedQuestion) => {
    const text = submittedQuestion.trim()
    if (text.length < 2 || isLoading) return

    setMessages((current) => [...current, { role: 'user', content: text, sources: [] }])
    setQuestion('')
    setError('')
    setIsLoading(true)

    try {
      const response = await fetch(`${API_BASE_URL}/api/assistant/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: text,
          ...(activeConversationId ? { conversationId: activeConversationId } : {}),
          ...(conversations.find((item) => item.conversationId === activeConversationId)?.ownerToken
            ? { ownerToken: conversations.find((item) => item.conversationId === activeConversationId).ownerToken }
            : {}),
        }),
      })
      const result = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(result.message || 'I couldn’t reach the portfolio assistant. Please try again.')
      }
      if (typeof result.answer !== 'string' || !result.answer.trim()) {
        throw new Error('I couldn’t find an answer just now. Please try rephrasing your question.')
      }

      const conversationId = result.conversationId || activeConversationId
      if (conversationId && result.ownerToken) {
        setConversations((current) => {
          const next = [
            {
              conversationId,
              ownerToken: result.ownerToken,
              title: text.slice(0, 100),
              updatedAt: new Date().toISOString(),
            },
            ...current.filter((item) => item.conversationId !== conversationId),
          ].slice(0, 30)
          localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(next))
          return next
        })
      } else if (conversationId) {
        setConversations((current) => {
          const next = current.map((item) => item.conversationId === conversationId
            ? { ...item, updatedAt: new Date().toISOString() }
            : item)
          localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(next))
          return next
        })
      }
      if (conversationId) setActiveConversationId(conversationId)
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

  const startNewConversation = () => {
    if (isLoading) return
    setActiveConversationId('')
    setMessages([{
      role: 'assistant',
      content: 'Hi, I’m ABHI. I can help you explore Abhinav’s public portfolio—projects, skills, education, and more.',
      sources: [],
    }])
    setQuestion('')
    setError('')
  }

  const selectConversation = async (event) => {
    const nextId = event.target.value
    if (!nextId) return
    setMessages([])
    setError('')
    setActiveConversationId(nextId)
  }

  const isAdminSignedIn = (() => {
    try {
      return Boolean(sessionStorage.getItem(ADMIN_AUTH_STORAGE_KEY))
    } catch {
      return false
    }
  })()

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
            {conversations.length ? (
              <label className="ask-abhi-history">
                <History size={14} aria-hidden="true" />
                <span className="ask-abhi-sr-only">Previous conversations</span>
                <select value={activeConversationId} onChange={selectConversation} aria-label="Previous conversations" disabled={isLoading}>
                  <option value="">New conversation</option>
                  {conversations.map((conversation) => (
                    <option key={conversation.conversationId} value={conversation.conversationId}>
                      {conversation.title || 'Previous conversation'}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}
            <button type="button" className="ask-abhi-new" onClick={startNewConversation} aria-label="Start a new conversation" disabled={isLoading}>
              <Plus size={16} aria-hidden="true" />
            </button>
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

            {messages.length <= 1 && !activeConversationId ? (
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
          <p className="ask-abhi-disclaimer">
            {isAdminSignedIn
              ? 'Admin session active. Chats are saved and visible to the admin.'
              : 'Chats are saved so you can resume them and are visible to the portfolio admin.'}
          </p>
        </section>
      ) : null}
    </>
  )
}

export default AskAbhiAssistant
