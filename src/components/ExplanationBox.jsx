import ReactMarkdown from 'react-markdown'
import emailjs from '@emailjs/browser'
import { useState } from 'react'
import { supabase } from '../supabaseClient'

export default function ExplanationBox({ text, topic, userEmail, onTopicClick, onSave, isSaving, session }) {
  const [emailing, setEmailing] = useState(false)
  const [complexity, setComplexity] = useState('standard')
  const [feedback, setFeedback] = useState(null)

  const [mainContent, exploreSection] = text.split(/[*]{2}Explore next:[*]{2}/i)
  const terms = exploreSection 
    ? exploreSection.split(/·|,/).map(t => t.trim()).filter(t => t.length > 0)
    : []

  const handleEmail = async () => {
    if (!userEmail) { alert("Please log in."); return; }
    setEmailing(true)
    try {
      const cleanContent = mainContent.replace(/[*#_-]/g, '')
      await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        { to_email: userEmail, topic, content: cleanContent },
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      )
      alert(`Sent to ${userEmail}! 📧`)
    } catch {
      alert('Email failed.')
    } finally {
      setEmailing(false)
    }
  }

  const handleDepthToggle = () => {
    const newLevel = complexity === 'standard' ? 'simpler' : 'deeper'
    setComplexity(newLevel)
    onTopicClick(topic, newLevel) // You'll update App.jsx to accept this
  }

  const handleFeedback = async (type) => {
    if (!session?.user) return
    setFeedback(type)
    await supabase.from('feedback').insert({
      user_id: session.user.id,
      topic,
      rating: type,
      accuracy_flag: type === 'down'
    })
  }

  return (
    <div className="w-full max-w-2xl bg-white border-[3px] border-knot-black shadow-[6px_6px_0px_0px_black] overflow-hidden">
      {/* Header */}
      <div className="bg-knot-mint border-b-[3px] border-knot-black p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🔌</span>
          <h3 className="font-display font-extrabold text-2xl sm:text-3xl uppercase tracking-tight text-knot-black">
            {topic}
          </h3>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <button onClick={onSave} disabled={isSaving}
            className="flex-1 sm:flex-none px-4 py-2 bg-white border-[3px] border-knot-black shadow-[4px_4px_0px_0px_black] 
                       hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:translate-x-[4px] active:translate-y-[4px] 
                       transition-all font-mono text-xs uppercase font-bold">
            {isSaving ? '...' : ' Save'}
          </button>
          <button onClick={handleEmail} disabled={emailing}
            className="flex-1 sm:flex-none px-4 py-2 bg-knot-yellow border-[3px] border-knot-black shadow-[4px_4px_0px_0px_black] 
                       hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:translate-x-[4px] active:translate-y-[4px] 
                       transition-all font-mono text-xs uppercase font-bold">
            {emailing ? '...' : ' Email'}
          </button>
        </div>
      </div>

      {/* Complexity Toggle */}
      <div className="bg-knot-cream border-b-[3px] border-knot-black px-6 py-3 flex justify-between items-center">
        <span className="font-mono text-[11px] uppercase tracking-widest text-slate-500">Complexity</span>
        <button onClick={handleDepthToggle}
          className="px-3 py-1.5 bg-white border-[3px] border-knot-black shadow-[3px_3px_0px_0px_black] 
                     hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none active:translate-x-[2px] active:translate-y-[2px] active:shadow-none 
                     transition-all font-mono text-xs uppercase font-bold cursor-pointer">
          {complexity === 'standard' ? ' Simpler' : '🔍 Deeper'}
        </button>
      </div>

      {/* Content */}
      <div className="p-6 sm:p-8 font-body text-lg leading-relaxed text-knot-black">
        <ReactMarkdown
          components={{
            p: ({node, ...props}) => <p className="mb-4 last:mb-0" {...props} />,
            strong: ({node, ...props}) => <strong className="font-display font-bold bg-knot-peach px-1 py-0.5 border border-knot-black inline-block" {...props} />,
            li: ({node, ...props}) => <li className="ml-4 list-disc mb-1 marker:text-knot-black" {...props} />
          }}
        >
          {mainContent}
        </ReactMarkdown>
      </div>

      {/* Feedback & Rabbit Hole */}
      <div className="bg-white border-t-[3px] border-knot-black p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <span className="font-mono text-[11px] uppercase tracking-widest text-slate-500">Did this help?</span>
          <div className="flex gap-2">
            <button onClick={() => handleFeedback('up')} 
              className={`px-4 py-2 border-[3px] border-knot-black shadow-[3px_3px_0px_0px_black] 
                         hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none active:translate-x-[2px] active:translate-y-[2px] active:shadow-none 
                         transition-all font-mono text-xs uppercase font-bold ${feedback === 'up' ? 'bg-knot-green' : 'bg-white'}`}>
               Accurate
            </button>
            <button onClick={() => handleFeedback('down')} 
              className={`px-4 py-2 border-[3px] border-knot-black shadow-[3px_3px_0px_0px_black] 
                         hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none active:translate-x-[2px] active:translate-y-[2px] active:shadow-none 
                         transition-all font-mono text-xs uppercase font-bold ${feedback === 'down' ? 'bg-knot-pink' : 'bg-white'}`}>
              👎 Needs Fix
            </button>
          </div>
        </div>

        {terms.length > 0 && (
          <>
            <p className="font-mono text-[11px] uppercase tracking-widest text-slate-500 mb-3">Explore Next:</p>
            <div className="flex flex-wrap gap-3">
              {terms.map((term, idx) => (
                <button key={idx} onClick={() => onTopicClick(term, 'standard')}
                  className="px-4 py-2 bg-white border-[3px] border-knot-black shadow-[4px_4px_0px_0px_black] 
                             hover:-translate-y-[2px] hover:shadow-[6px_6px_0px_0px_black] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none 
                             transition-all font-mono text-xs uppercase font-bold cursor-pointer">
                  {term}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}