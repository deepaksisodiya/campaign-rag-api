import { useState } from 'react'

export default function DocumentUpload({ onDocumentUploaded }) {
  const [filename, setFilename] = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleUpload(e) {
    e.preventDefault()
    if (!filename.trim() || !content.trim()) return

    setLoading(true)
    setError('')

    try {
      const params = new URLSearchParams({ filename, content })
      const res = await fetch(`/api/documents/?${params}`, { method: 'POST' })
      if (!res.ok) throw new Error('Upload failed')
      const doc = await res.json()
      onDocumentUploaded(doc)
      setFilename('')
      setContent('')
    } catch {
      setError('Failed to upload document. Make sure the API is running.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Upload Document</h2>
      <form onSubmit={handleUpload} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Filename</label>
          <input
            type="text"
            value={filename}
            onChange={e => setFilename(e.target.value)}
            placeholder="nike-brief.txt"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Paste your campaign brief here..."
            rows={6}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
          />
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={loading || !filename.trim() || !content.trim()}
          className="w-full bg-violet-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Uploading...' : 'Upload Document'}
        </button>
      </form>
    </div>
  )
}
