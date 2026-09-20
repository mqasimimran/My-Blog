'use client'

import { useState, Suspense } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'

function LoginForm() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const loggedOutForIdle = searchParams.get('reason') === 'idle'

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    const result = await signIn('credentials', {
      username,
      password,
      redirect: false,
    })

    if (result?.error) {
      setError('Invalid username or password.')
      setIsLoading(false)
    } else {
      router.push('/admin')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-sm border border-gray-100">
        
        <div className="text-center mb-8">
          <h1 className="text-2xl font-light tracking-wide uppercase text-gray-900">Qasmic Admin</h1>
          <p className="text-xs text-gray-400 tracking-widest uppercase mt-1">Restricted Access</p>
        </div>

        {loggedOutForIdle && !error && (
          <div className="mb-6 bg-gray-50 border border-gray-200 text-gray-600 text-xs p-3 rounded text-center font-medium">
            You were logged out after 30 minutes of inactivity. Please sign in again.
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-600 text-xs p-3 rounded text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-[10px] font-bold tracking-widest uppercase text-gray-500 mb-2">Username</label>
            <input 
              type="text" 
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full border-b border-gray-300 py-2 outline-none focus:border-[#aa002a] transition-colors text-sm text-gray-900"
              placeholder="Enter username"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold tracking-widest uppercase text-gray-500 mb-2">Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border-b border-gray-300 py-2 outline-none focus:border-[#aa002a] transition-colors text-sm text-gray-900"
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-[#aa002a] text-white text-xs font-bold tracking-widest uppercase py-3 rounded hover:bg-gray-900 transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

      </div>
    </div>
  )
}

export default function AdminLogin() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-gray-400 text-xs font-mono uppercase tracking-widest">Loading...</p>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}