import { useState } from 'react'

export default function ChatInterface({ documents }) {
  const [selectedDoc, setSelectedDoc] = useState('')
  const [question, setQuestion] = useState('')
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)

  async function handleAsk(e) {
    e.preventDefault()
    if (!selectedDoc || !question.trim()) return

    const userQuestion = question.trim()
    setMessages(prev => [...prev, { role: 'user', text: userQuestion }])
    setQuestion('')
    setLoading(true)

    try {
      const res = await fetch(`/api/chat/${selectedDoc}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: userQuestion }),
      })

      if (!res.ok) {
        const err = await res.json()
        setMessages(prev => [...prev, { role: 'error', text: err.detail }])
        return
      }

      const data = await res.json()
      setMessages(prev => [...prev, {
        role: 'assistant',
        text: data.answer,
        chunks: data.chunks_used,
      }])
    } catch {
      setMessages(prev => [...prev, { role: 'error', text: 'Failed to get response.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col h-full">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Ask a Question</h2>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Select Document</label>
        <select
          value={selectedDoc}
          onChange={e => { setSelectedDoc(e.target.value); setMessages([]) }}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
        >
          <option value="">-- choose a document --</option>
          {documents.map(doc => (
            <option key={doc.id} value={doc.id}>{doc.filename}</option>
          ))}
        </select>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 mb-4 min-h-48">
        {messages.length === 0 && (
          <p className="text-sm text-gray-400 text-center mt-8">
            Select a document and ask a question
          </p>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-xl px-4 py-2 text-sm ${
              msg.role === 'user'
                ? 'bg-violet-600 text-white'
                : msg.role === 'error'
                ? 'bg-red-50 text-red-700 border border-red-200'
                : 'bg-gray-100 text-gray-800'
            }`}>
              <p className="whitespace-pre-wrap">{msg.text}</p>
              {msg.chunks && (
                <p className="text-xs mt-1 opacity-60">{msg.chunks} chunk{msg.chunks > 1 ? 's' : ''} used</p>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-xl px-4 py-2 text-sm text-gray-500">
              Thinking...
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleAsk} className="flex gap-2">
        <input
          type="text"
          value={question}
          onChange={e => setQuestion(e.target.value)}
          placeholder="What are the target regions?"
          disabled={!selectedDoc || loading}
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!selectedDoc || !question.trim() || loading}
          className="bg-violet-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Ask
        </button>
      </form>
    </div>
  )
}
