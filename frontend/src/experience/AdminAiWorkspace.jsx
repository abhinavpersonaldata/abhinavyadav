import { useEffect, useState } from 'react'
import { FileSearch, History, MessageSquare, RefreshCw, Send, Trash2 } from 'lucide-react'
import './admin-ai-workspace.css'

const API_BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')
const ADMIN_AUTH_STORAGE_KEY = 'portfolio-admin-token-v1'
const RECORD_TYPES = [
  { value: 'certificate', label: 'Certificate' },
  { value: 'education', label: 'Education' },
  { value: 'experience', label: 'Experience' },
  { value: 'achievement', label: 'Achievement' },
  { value: 'project', label: 'Project' },
  { value: 'journey', label: 'Journey entry' },
]

const getAdminToken = () => {
  try {
    return sessionStorage.getItem(ADMIN_AUTH_STORAGE_KEY) || ''
  } catch {
    return ''
  }
}

const adminFetch = (path, options = {}) => {
  const headers = new Headers(options.headers || {})
  const token = getAdminToken()
  if (token) headers.set('Authorization', `Bearer ${token}`)
  return fetch(`${API_BASE_URL}${path}`, { ...options, headers })
}

function AdminAiWorkspace({ onPublish }) {
  const [activeTab, setActiveTab] = useState('scanner')
  const [recordType, setRecordType] = useState('certificate')
  const [file, setFile] = useState(null)
  const [extractedFields, setExtractedFields] = useState(null)
  const [editedFields, setEditedFields] = useState({})
  const [scannerStatus, setScannerStatus] = useState('')
  const [isExtracting, setIsExtracting] = useState(false)
  const [aiConfigured, setAiConfigured] = useState(null)
  const [conversations, setConversations] = useState([])
  const [activeConversationId, setActiveConversationId] = useState('')
  const [reply, setReply] = useState('')
  const [historyStatus, setHistoryStatus] = useState('')
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)
  const [isReplying, setIsReplying] = useState(false)

  const activeConversation = conversations.find((item) => item.conversationId === activeConversationId)

  const loadConversations = async (keepSelection = true) => {
    setIsLoadingHistory(true)
    setHistoryStatus('')
    try {
      const response = await adminFetch('/api/admin/assistant/conversations')
      const result = await response.json()
      if (!response.ok) throw new Error(result.message || 'Conversations could not be loaded.')
      const items = Array.isArray(result.conversations) ? result.conversations : []
      setConversations(items)
      setActiveConversationId((current) => (
        keepSelection && items.some((item) => item.conversationId === current)
          ? current
          : items[0]?.conversationId || ''
      ))
    } catch (error) {
      setHistoryStatus(error.message || 'Conversation history could not be loaded.')
    } finally {
      setIsLoadingHistory(false)
    }
  }

  useEffect(() => {
    let active = true
    fetch(`${API_BASE_URL}/api/assistant/status`)
      .then(async (response) => {
        const result = await response.json()
        if (!response.ok) throw new Error(result.message || 'AI status could not be checked.')
        if (active) setAiConfigured(Boolean(result.ai?.configured))
      })
      .catch(() => {
        if (active) setAiConfigured(false)
      })
    return () => {
      active = false
    }
  }, [])

  const handleExtract = async (event) => {
    event.preventDefault()
    if (!file) {
      setScannerStatus('Choose a document image first.')
      return
    }

    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', recordType)
    setIsExtracting(true)
    setScannerStatus('Reading document details…')
    try {
      const response = await adminFetch('/api/admin/assistant/extract', { method: 'POST', body: formData })
      const result = await response.json()
      if (!response.ok) throw new Error(result.message || 'Document details could not be extracted.')
      setExtractedFields(result.fields)
      setEditedFields(result.fields)
      setScannerStatus('Review and correct the extracted fields before publishing.')
    } catch (error) {
      setScannerStatus(error.message || 'Document details could not be extracted.')
    } finally {
      setIsExtracting(false)
    }
  }

  const publishFields = async () => {
    if (!Object.values(editedFields).some((value) => (
      typeof value === 'string' ? value.trim() : Array.isArray(value) && value.length
    ))) {
      setScannerStatus('Add at least one detail before saving.')
      return
    }
    const requiredValue = recordType === 'experience'
      ? editedFields.role || editedFields.company
      : recordType === 'education'
        ? editedFields.title || editedFields.institution
        : editedFields.title
    if (!String(requiredValue || '').trim()) {
      setScannerStatus('Add the record title or name before saving.')
      return
    }
    setScannerStatus('Saving portfolio details…')
    try {
      await onPublish(recordType, editedFields)
      setScannerStatus('Details were saved to the portfolio.')
    } catch (error) {
      setScannerStatus(error.message || 'Details could not be saved.')
    }
  }

  const updateExtractedField = (field, value) => {
    setEditedFields((current) => ({ ...current, [field]: value }))
  }

  const sendAdminReply = async (event) => {
    event.preventDefault()
    if (!activeConversationId || reply.trim().length < 2 || isReplying) return
    setIsReplying(true)
    setHistoryStatus('')
    try {
      const response = await adminFetch(
        `/api/admin/assistant/conversations/${encodeURIComponent(activeConversationId)}/reply`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question: reply.trim() }),
        },
      )
      const result = await response.json()
      if (!response.ok) throw new Error(result.message || 'The conversation could not be continued.')
      setConversations((current) => current.map((item) => (
        item.conversationId === activeConversationId ? result.conversation : item
      )))
      setReply('')
      setHistoryStatus('Conversation continued.')
    } catch (error) {
      setHistoryStatus(error.message || 'The conversation could not be continued.')
    } finally {
      setIsReplying(false)
    }
  }

  const deleteConversation = async () => {
    if (!activeConversationId) return
    setHistoryStatus('')
    try {
      const response = await adminFetch(
        `/api/admin/assistant/conversations/${encodeURIComponent(activeConversationId)}`,
        { method: 'DELETE' },
      )
      const result = await response.json()
      if (!response.ok) throw new Error(result.message || 'Conversation could not be deleted.')
      const remaining = conversations.filter((item) => item.conversationId !== activeConversationId)
      setConversations(remaining)
      setActiveConversationId(remaining[0]?.conversationId || '')
      setHistoryStatus('Conversation deleted.')
    } catch (error) {
      setHistoryStatus(error.message || 'Conversation could not be deleted.')
    }
  }

  return (
    <section className="panel-card admin-list-panel admin-ai-workspace">
      <div className="panel-header">
        <div>
          <span className="section-tag">AI WORKSPACE</span>
          <h2>Ask ABHI controls</h2>
        </div>
        <span className={`status-badge ${aiConfigured ? 'highlight' : 'neutral'}`}>
          {aiConfigured === null ? 'Checking AI' : aiConfigured ? 'AI configured' : 'AI needs backend config'}
        </span>
      </div>

      <div className="admin-ai-tabs" role="tablist" aria-label="AI workspace tools">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'scanner'}
          className={activeTab === 'scanner' ? 'active' : ''}
          onClick={() => setActiveTab('scanner')}
        >
          <FileSearch size={16} aria-hidden="true" /> Document scanner
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'history'}
          className={activeTab === 'history' ? 'active' : ''}
          onClick={() => {
            setActiveTab('history')
            void loadConversations()
          }}
        >
          <History size={16} aria-hidden="true" /> Conversation history
        </button>
      </div>

      {activeTab === 'scanner' ? (
        <div className="admin-ai-scanner">
          <p>Upload a clear certificate or document image. The image is sent to your configured AI provider. Check every field—the AI may misread text. Nothing is published until you review it.</p>
          {aiConfigured === false ? (
            <p className="admin-ai-notice" role="status">Configure AI_API_KEY and AI_BASE_URL on the backend to enable extraction and AI answers.</p>
          ) : null}
          <form onSubmit={handleExtract}>
            <label>
              Portfolio section
              <select
                value={recordType}
                onChange={(event) => {
                  setRecordType(event.target.value)
                  setExtractedFields(null)
                  setEditedFields({})
                  setScannerStatus('')
                }}
              >
                {RECORD_TYPES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
              </select>
            </label>
            <label>
              Document image
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(event) => {
                  setFile(event.target.files?.[0] || null)
                  setExtractedFields(null)
                  setEditedFields({})
                }}
              />
            </label>
            <button type="submit" className="primary-btn" disabled={!file || isExtracting}>
              <FileSearch size={16} aria-hidden="true" />
              {isExtracting ? 'Extracting…' : 'Extract details'}
            </button>
          </form>
          {extractedFields ? (
            <div className="admin-ai-review">
              <h3>Review and edit extracted details</h3>
              <div className="admin-ai-fields">
                {Object.entries(editedFields).map(([field, value]) => {
                  const label = field.replace(/([A-Z])/g, ' $1').replace(/^./, (character) => character.toUpperCase())
                  return (
                    <label key={field}>
                      {label}
                      {Array.isArray(value) || ['description', 'detail', 'problem', 'approach', 'solution'].includes(field) ? (
                        <textarea
                          rows={Array.isArray(value) ? 3 : 4}
                          value={Array.isArray(value) ? value.join('\n') : value}
                          onChange={(event) => updateExtractedField(
                            field,
                            Array.isArray(value) ? event.target.value.split('\n') : event.target.value,
                          )}
                        />
                      ) : (
                        <input
                          type={['url', 'website', 'repository'].includes(field) ? 'url' : 'text'}
                          value={value}
                          onChange={(event) => updateExtractedField(field, event.target.value)}
                        />
                      )}
                    </label>
                  )
                })}
              </div>
              <button type="button" className="primary-btn" onClick={() => void publishFields()}>Save to portfolio</button>
            </div>
          ) : null}
          {scannerStatus ? <p className="admin-ai-status" role="status">{scannerStatus}</p> : null}
        </div>
      ) : (
        <div className="admin-ai-history">
          <div className="admin-ai-conversation-list">
            <div className="admin-ai-history-heading">
              <span>{conversations.length} saved conversations</span>
              <button type="button" className="ghost-btn" onClick={() => void loadConversations()} disabled={isLoadingHistory} aria-label="Refresh conversation history">
                <RefreshCw size={15} aria-hidden="true" />
              </button>
            </div>
            {conversations.map((conversation) => (
              <button
                type="button"
                key={conversation.conversationId}
                className={`admin-ai-conversation-option${conversation.conversationId === activeConversationId ? ' active' : ''}`}
                onClick={() => setActiveConversationId(conversation.conversationId)}
              >
                <MessageSquare size={15} aria-hidden="true" />
                <span>{conversation.title || 'Conversation'}</span>
              </button>
            ))}
            {!conversations.length && !isLoadingHistory ? <p className="admin-ai-empty">No saved conversations yet.</p> : null}
          </div>
          <div className="admin-ai-thread">
            {activeConversation ? (
              <>
                <div className="admin-ai-thread-heading">
                  <h3>{activeConversation.title}</h3>
                  <button type="button" className="danger-btn" onClick={() => void deleteConversation()} aria-label="Delete conversation">
                    <Trash2 size={15} aria-hidden="true" /> Delete
                  </button>
                </div>
                <div className="admin-ai-thread-messages">
                  {(activeConversation.messages || []).map((message, index) => (
                    <article key={`${message.role}-${index}`} className={`admin-ai-thread-message ${message.role}`}>
                      <strong>{message.role === 'user' ? 'Visitor' : 'ABHI'}</strong>
                      <p>{message.content}</p>
                    </article>
                  ))}
                </div>
                <form className="admin-ai-reply" onSubmit={sendAdminReply}>
                  <textarea rows="2" maxLength="1200" value={reply} onChange={(event) => setReply(event.target.value)} placeholder="Continue this conversation…" />
                  <button type="submit" className="primary-btn" disabled={isReplying || reply.trim().length < 2} aria-label="Continue conversation">
                    <Send size={16} aria-hidden="true" /> {isReplying ? 'Sending…' : 'Continue'}
                  </button>
                </form>
              </>
            ) : <p className="admin-ai-empty">Select a conversation to review or continue it.</p>}
            {historyStatus ? <p className="admin-ai-status" role="status">{historyStatus}</p> : null}
          </div>
        </div>
      )}
    </section>
  )
}

export default AdminAiWorkspace
