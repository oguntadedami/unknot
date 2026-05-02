import { useState } from 'react'
import { supabase } from '../supabaseClient'

export default function Auth() {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)

  const handleAuth = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        alert('Check your email for the confirmation link!')
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      }
    } catch (error) {
      alert(error.error_description || error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-knot-cream flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border-3 border-knot-black shadow-neo p-8">
        <h2 className="font-display font-extrabold text-3xl uppercase mb-6 text-center">
          {isSignUp ? 'Join Unknot' : 'Welcome Back'}
        </h2>
        <form onSubmit={handleAuth} className="space-y-4">
          <input
            type="email"
            placeholder="EMAIL ADDRESS"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-4 bg-knot-cream border-3 border-knot-black font-mono placeholder:opacity-50 focus:outline-none focus:bg-knot-yellow transition-colors"
            required
          />
          <input
            type="password"
            placeholder="PASSWORD"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-4 bg-knot-cream border-3 border-knot-black font-mono placeholder:opacity-50 focus:outline-none focus:bg-knot-yellow transition-colors"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-knot-yellow border-3 border-knot-black shadow-neo py-4 font-display font-bold uppercase text-lg hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all disabled:opacity-50"
          >
            {loading ? '...' : isSignUp ? 'Sign Up' : 'Log In'}
          </button>
        </form>
        <p className="mt-6 text-center font-mono text-xs uppercase">
          {isSignUp ? 'Already a member?' : "New to Unknot?"}{' '}
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-knot-black underline font-bold hover:text-knot-pink"
          >
            {isSignUp ? 'Log In' : 'Sign Up'}
          </button>
        </p>
      </div>
    </div>
  )
}