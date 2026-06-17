import { useState } from 'react'
import DocumentUpload from './components/DocumentUpload'
import ChatInterface from './components/ChatInterface'

export default function App() {
  const [documents, setDocuments] = useState([])

  function handleDocumentUploaded(doc) {
    setDocuments(prev => [...prev, doc])
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <h1 className="text-xl font-bold text-violet-700">Campaign RAG</h1>
        <p className="text-sm text-gray-500">Upload campaign briefs and ask questions</p>
      </header>

      <main className="max-w-6xl mx-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col gap-6">
          <DocumentUpload onDocumentUploaded={handleDocumentUploaded} />

          {documents.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-3">Uploaded Documents</h2>
              <ul className="space-y-2">
                {documents.map(doc => (
                  <li key={doc.id} className="flex items-center gap-2 text-sm text-gray-700">
                    <span className="w-6 h-6 bg-violet-100 text-violet-700 rounded-full flex items-center justify-center text-xs font-bold">
                      {doc.id}
                    </span>
                    {doc.filename}
                    <span className="text-gray-400">· {doc.chunks.length} chunk{doc.chunks.length !== 1 ? 's' : ''}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <ChatInterface documents={documents} />
      </main>
    </div>
  )
}
