import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import Auth from './components/Auth'
import ExplanationBox from './components/ExplanationBox'
import Dashboard from './components/Dashboard'

function App() {
  const [session, setSession] = useState(null)
  const [view, setView] = useState('home')
  const [topic, setTopic] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })
    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
  }, [])

  if (!session) return <Auth />
  if (view === 'dashboard') return <Dashboard session={session} onBack={() => setView('home')} />

  const fetchExplanation = async (searchTerm) => {
    setLoading(true)
    setError('')
    setResult('')

    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            {
              role: "system",
              content: `You are Unknot — a sharp, friendly guide who makes tech concepts click for everyday people. 
You're like that clever friend who actually works in tech and explains things without making you feel dumb.

When someone asks about a tech term, structure your response like this:

[EMOJI] **One-liner** — A single punchy sentence that defines it. No jargon. Max 20 words.

**The analogy** 
A vivid, relatable comparison from everyday life. This is the heart of your explanation — make it stick. 2–3 sentences.

**How it works**
The mechanics, clearly. You can introduce one key term if you immediately explain it. 2–3 sentences.

**Why it matters**
Why should a non-techie care? Real-world impact only. 1–2 sentences.

💡 **Did you know?** One surprising or counterintuitive fact about this concept.

**Explore next:** [RelatedTerm1] · [RelatedTerm2] · [RelatedTerm3]

---

Tone rules:
- Warm, witty, never condescending
- Use contractions (it's, you're, they're) — write like a human
- Short sentences beat long ones
- If something is genuinely complicated, say so — but still explain it
- NEVER use "simply", "just", or "basically" — they're condescending
- Keep total length 180–230 words
- If the user asks something vague, pick the most common interpretation and explain it, then ask if they meant something else`
            },
            { 
              role: "user", 
              content: `Explain: ${searchTerm}` 
            }
          ],
          temperature: 0.7,
          max_tokens: 400
        })
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error?.message || "Failed to load")
      setResult(data.choices[0].message.content)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleUnknot = (e) => {
    e.preventDefault()
    if (!topic.trim()) return
    fetchExplanation(topic)
  }

  const handleSave = async () => {
    if (!result) return
    setSaving(true)
    try {
      const { error } = await supabase
        .from('explanations')
        .insert([{ user_id: session.user.id, topic: topic, content: result }])
      if (error) throw error
      alert('Saved to your library! 📚')
    } catch (err) {
      alert('Error saving: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setResult('')
    setTopic('')
  }

  return (
    <div className="min-h-screen bg-knot-cream p-4 sm:p-8">
      <header className="w-full max-w-2xl mx-auto flex justify-between items-center mb-12">
        <h1 className="font-display font-extrabold text-4xl sm:text-5xl tracking-tighter uppercase">
          U<span className="text-knot-yellow">N</span>KNOT
        </h1>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setView('dashboard')}
            className="hidden sm:block px-4 py-2 bg-white border-3 border-knot-black shadow-neo-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all font-mono text-xs uppercase font-bold"
          >
            My Library
          </button>
          <button
            onClick={handleLogout}
            className="text-knot-black hover:text-knot-pink font-mono text-xs uppercase font-bold"
          >
            Log Out ↗
          </button>
        </div>
      </header>

      <div className="w-full max-w-2xl mx-auto">
        <form onSubmit={handleUnknot} className="relative mb-12">
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="TYPE A TECH TERM..."
            className="w-full p-5 bg-white border-3 border-knot-black shadow-neo focus:outline-none focus:shadow-neo-hover focus:translate-x-[-2px] focus:translate-y-[-2px] transition-all font-display text-xl placeholder:font-body placeholder:text-slate-400 placeholder:text-lg"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !topic.trim()}
            className="absolute right-3 top-3 bottom-3 px-6 bg-knot-yellow border-3 border-knot-black shadow-neo-sm font-display font-bold uppercase text-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '...' : 'UN-KNOT ↗'}
          </button>
        </form>

        {error && (
          <div className="bg-knot-pink border-3 border-knot-black p-4 shadow-neo font-mono text-sm mb-8">
            ERROR: {error}
          </div>
        )}

        {result && (
          <ExplanationBox
            text={result}
            topic={topic}
            userEmail={session.user.email}
            onTopicClick={(term) => { setTopic(term); fetchExplanation(term) }}
            onSave={handleSave}
            isSaving={saving}
          />
        )}
      </div>
    </div>
  )
}

export default App