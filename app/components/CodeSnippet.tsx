'use client'

import { useState } from 'react'

interface CodeSnippetProps {
  code: string
  language?: string
}

export default function CodeSnippet({ code, language = 'text' }: CodeSnippetProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy text', err)
    }
  }

  return (
    <div className="my-8 rounded-md overflow-hidden bg-[#0d1117] border border-gray-800 shadow-sm">
      {/* Header bar with language and copy button */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#161b22] border-b border-gray-800">
        <span className="text-[10px] font-mono tracking-widest uppercase text-gray-400">
          {language}
        </span>
        <button
          onClick={handleCopy}
          className={`text-[10px] font-mono tracking-widest uppercase transition-colors ${
            copied ? 'text-[#d9534f]' : 'text-gray-400 hover:text-white'
          }`}
        >
          {copied ? 'Copied ✓' : 'Copy'}
        </button>
      </div>
      
      {/* Scrollable code block */}
      <div className="p-4 overflow-x-auto">
        <pre className="text-sm font-mono text-gray-300 leading-relaxed">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  )
}