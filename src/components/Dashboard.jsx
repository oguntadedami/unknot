import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import ReactMarkdown from 'react-markdown'

export default function Dashboard({ session, onBack }) {
  const [explanations, setExplanations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchExplanations()
  }, [])

  const fetchExplanations = async () => {
    try {
      const { data, error } = await supabase
        .from('explanations')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
      if (error) throw error
      setExplanations(data || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this?')) return
    try {
      const { error } = await supabase.from('explanations').delete().eq('id', id)
      if (error) throw error
      setExplanations(explanations.filter(exp => exp.id !== id))
    } catch (error) {
      alert('Error: ' + error.message)
    }
  }

  return (
    <div className="min-h-screen bg-knot-cream p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="font-display font-extrabold text-4xl uppercase">📚 My Library</h1>
          <button
            onClick={onBack}
            className="px-6 py-3 bg-white border-3 border-knot-black shadow-neo-sm font-display font-bold uppercase text-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
          >
            ← Back to Home
          </button>
        </div>

        {loading ? (
          <p className="font-mono uppercase">Loading...</p>
        ) : explanations.length === 0 ? (
          <div className="bg-white border-3 border-knot-black p-12 text-center">
            <p className="font-display text-xl uppercase mb-2">No saved explanations yet</p>
            <p className="font-mono text-sm">Start unknotting some terms!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {explanations.map((exp) => (
              <div key={exp.id} className="bg-white border-3 border-knot-black shadow-neo p-6">
                <div className="flex justify-between items-start mb-4 border-b-2 border-knot-black pb-2">
                  <h3 className="font-display font-bold text-2xl uppercase">{exp.topic}</h3>
                  <button onClick={() => handleDelete(exp.id)} className="text-xs font-mono uppercase font-bold hover:text-knot-pink">
                    Delete ✕
                  </button>
                </div>
                <p className="font-mono text-xs text-slate-500 mb-4">SAVED: {new Date(exp.created_at).toLocaleDateString()}</p>
                <div className="font-body text-slate-800">
                  <ReactMarkdown>{exp.content}</ReactMarkdown>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}