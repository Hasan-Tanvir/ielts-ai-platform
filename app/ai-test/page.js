'use client'

import { useState } from 'react'

export default function AITestPage() {
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [essay, setEssay] = useState('Technology has transformed education. Online learning is accessible to everyone.')

  const testGemini3Flash = async () => {
    try {
      // FIX: Changed 'gemini-3-flash-preview' to 'gemini-3-flash-preview-preview'
      const response = await fetch(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview-preview:generateContent?key=' + 
        process.env.NEXT_PUBLIC_GEMINI_API_KEY,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{ text: 'Say "Hello IELTS" if you are working.' }]
            }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 100,
              // NEW in Gemini 3: Set thinking level for specific tasks
              thinkingLevel: 'minimal' 
            }
          })
        }
      )
      
      const data = await response.json()
      if (data.error) return { success: false, error: data.error.message }
      
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No text'
      return { success: true, data: text }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const evaluateEssayWithGemini3 = async () => {
    try {
      const prompt = `Evaluate this IELTS essay on scale 1-9 (9 is best). Reply with ONLY the number: "${essay}"`

      const response = await fetch(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview-preview:generateContent?key=' + 
        process.env.NEXT_PUBLIC_GEMINI_API_KEY,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.3,
              maxOutputTokens: 10,
              // For evaluation, 'medium' or 'high' thinking provides better accuracy
              thinkingLevel: 'medium' 
            }
          })
        }
      )
      
      const data = await response.json()
      const scoreText = data.candidates?.[0]?.content?.parts?.[0]?.text || '6.5'
      const score = parseFloat(scoreText) || 6.5
      
      return { success: true, score: score }
    } catch (error) {
      return { success: false, score: 6.5, feedback: error.message }
    }
  }

  const runConnectionTest = async () => {
    setLoading(true)
    const result = await testGemini3Flash()
    setResults([{ name: 'Connection Test', ...result, message: result.success ? `✅ ${result.data}` : `❌ ${result.error}` }])
    setLoading(false)
  }

  const runEssayTest = async () => {
    setLoading(true)
    const result = await evaluateEssayWithGemini3()
    setResults([{ name: 'Essay Test', ...result, message: result.success ? `✅ Score: Band ${result.score}` : `❌ ${result.feedback}` }])
    setLoading(false)
  }

  return (
    <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h1>🤖 Gemini 3 Flash Preview Test</h1>
      <button onClick={runConnectionTest} disabled={loading} style={{ marginRight: '10px' }}>Test Connection</button>
      <button onClick={runEssayTest} disabled={loading}>Evaluate Essay</button>
      <div style={{ marginTop: '20px' }}>
        {results.map((r, i) => <div key={i} style={{ padding: '10px', border: '1px solid #ccc', marginTop: '10px' }}>{r.message}</div>)}
      </div>
    </div>
  )
}
