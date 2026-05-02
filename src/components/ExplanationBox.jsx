import ReactMarkdown from 'react-markdown'
import emailjs from '@emailjs/browser'
import { useState } from 'react'

export default function ExplanationBox({ text, topic, userEmail, onTopicClick, onSave, isSaving }) {
  const [emailing, setEmailing] = useState(false)
  
  // Split the response to isolate the "Explore next" section
  const [mainContent, exploreSection] = text.split(/[*]{2}Explore next:[*]{2}/i)
  const terms = exploreSection 
    ? exploreSection.split(/·|,/).map(t => t.trim()).filter(t => t.length > 0)
    : []

  const handleEmail = async () => {
    if (!userEmail) { alert("Please log in to email explanations."); return; }
    setEmailing(true)
    try {
      // Clean up markdown for the email text
      const cleanContent = mainContent.replace(/[*#_-]/g, '')
      
      await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        { to_email: userEmail, topic: topic, content: cleanContent },
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      )
      alert(`Explanation sent to ${userEmail}! `)
    } catch (error) {
      console.error('FAILED...', error)
      alert('Failed to send email. Please check your EmailJS setup.')
    } finally {
      setEmailing(false)
    }
  }

  return (
    // Main Card Container
    // Border: 3px black | Shadow: 6px offset hard shadow
    <div className="w-full max-w-2xl bg-white border-[3px] border-knot-black shadow-[6px_6px_0px_0px_black] overflow-hidden animate-fade-in">
      
      {/* Header Section - Sky Mint */}
      <div className="bg-knot-mint border-b-[3px] border-knot-black p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🔌</span>
          <h3 className="font-display font-extrabold text-2xl sm:text-3xl uppercase tracking-tight text-knot-black">
            {topic}
          </h3>
        </div>
        
        {/* Action Buttons */}
        <div className="flex gap-3 w-full sm:w-auto">
          <button
            onClick={onSave}
            disabled={isSaving}
            className="flex-1 sm:flex-none px-4 py-2 bg-white border-[3px] border-knot-black shadow-[4px_4px_0px_0px_black] 
                       hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:translate-x-[4px] active:translate-y-[4px] 
                       transition-all font-mono text-xs uppercase font-bold text-knot-black"
          >
            {isSaving ? 'Saving...' : ' Save'}
          </button>
          <button
            onClick={handleEmail}
            disabled={emailing}
            className="flex-1 sm:flex-none px-4 py-2 bg-knot-yellow border-[3px] border-knot-black shadow-[4px_4px_0px_0px_black] 
                       hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:translate-x-[4px] active:translate-y-[4px] 
                       transition-all font-mono text-xs uppercase font-bold text-knot-black"
          >
            {emailing ? 'Sending...' : ' Email'}
          </button>
        </div>
      </div>

      {/* Main Content Section - Cream Background */}
      <div className="p-6 sm:p-8 bg-knot-cream font-body text-lg leading-relaxed text-knot-black">
        <ReactMarkdown
          components={{
            p: ({node, ...props}) => <p className="mb-4 last:mb-0" {...props} />,
            strong: ({node, ...props}) => <strong className="font-display font-bold bg-knot-peach px-1 py-0.5 border border-knot-black inline-block" {...props} />,
            li: ({node, ...props}) => <li className="ml-4 list-disc mb-1 marker:text-knot-black" {...props} />,
            h3: ({node, ...props}) => <h3 className="font-display font-bold text-xl mt-6 mb-3 text-knot-black uppercase" {...props} />,
            blockquote: ({node, ...props}) => <blockquote className="border-l-[4px] border-knot-yellow pl-4 italic my-4 bg-white p-4" {...props} />
          }}
        >
          {mainContent}
        </ReactMarkdown>
      </div>

      {/* Rabbit Hole / Explore Next Section */}
      {terms.length > 0 && (
        <div className="bg-white border-t-[3px] border-knot-black p-6">
          <p className="font-mono text-xs uppercase font-bold mb-4 text-slate-500 tracking-widest">Explore Next:</p>
          <div className="flex flex-wrap gap-3">
            {terms.map((term, idx) => (
              <button
                key={idx}
                onClick={() => onTopicClick(term)}
                className="px-4 py-2 bg-white border-[3px] border-knot-black shadow-[4px_4px_0px_0px_black] 
                           hover:-translate-y-[2px] hover:shadow-[6px_6px_0px_0px_black] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none 
                           transition-all font-mono text-xs uppercase font-bold cursor-pointer text-knot-black"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}