'use client'

import { useState } from 'react'

export default function AITestPage() {
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [essay, setEssay] = useState('Technology has transformed education. Online learning platforms make education accessible worldwide. However, face-to-face interaction remains valuable for developing social skills.')

  const testGemini3Flash = async () => {
    try {
      // Using gemini-3-flash-preview model
      const response = await fetch(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=' +
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
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=' +
        process.env.NEXT_PUBLIC_GEMINI_API_KEY,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.3,
              maxOutputTokens: 10,
              thinkingLevel: 'medium'
            }
          })
        }
      )

      const data = await response.json()
      if (data.error) return { success: false, error: data.error.message }

      const score = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No score'
      return { success: true, data: `Score: ${score}` }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const runAllTests = async () => {
    setLoading(true)
    setResults([])
    
    const result1 = await testGemini3Flash()
    setResults(prev => [...prev, { 
      test: 'Gemini 3 Flash API Test', 
      success: result1.success, 
      data: result1.success ? result1.data : result1.error 
    }])
    
    const result2 = await evaluateEssayWithGemini3()
    setResults(prev => [...prev, { 
      test: 'Essay Evaluation', 
      success: result2.success, 
      data: result2.success ? result2.data : result2.error 
    }])
    
    setLoading(false)
  }

  const clearResults = () => {
    setResults([])
  }

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>IELTS AI Platform - Gemini 3 Test</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>Test Essay:</h3>
        <textarea 
          value={essay}
          onChange={(e) => setEssay(e.target.value)}
          rows="5"
          style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
        />
      </div>

      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={runAllTests}
          disabled={loading}
          style={{ 
            padding: '10px 20px', 
            backgroundColor: loading ? '#ccc' : '#0070f3', 
            color: 'white', 
            border: 'none', 
            borderRadius: '5px',
            marginRight: '10px'
          }}
        >
          {loading ? 'Testing...' : 'Run Gemini 3 Tests'}
        </button>
        
        <button 
          onClick={clearResults}
          style={{ 
            padding: '10px 20px', 
            backgroundColor: '#dc3545', 
            color: 'white', 
            border: 'none', 
            borderRadius: '5px' 
          }}
        >
          Clear Results
        </button>
      </div>

      <div style={{ marginTop: '20px' }}>
        <h3>Test Results:</h3>
        {results.length === 0 ? (
          <p>No tests run yet. Click the button above to test Gemini 3.</p>
        ) : (
          <div>
            {results.map((result, index) => (
              <div 
                key={index} 
                style={{
                  padding: '15px',
                  marginBottom: '10px',
                  border: `1px solid ${result.success ? '#28a745' : '#dc3545'}`,
                  borderRadius: '5px',
                  backgroundColor: result.success ? '#f8fff9' : '#fff8f8'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <strong>{result.test}</strong>
                  <span style={{ 
                    color: result.success ? '#28a745' : '#dc3545',
                    fontWeight: 'bold'
                  }}>
                    {result.success ? '✓ SUCCESS' : '✗ ERROR'}
                  </span>
                </div>
                <div style={{ marginTop: '10px', fontFamily: 'monospace' }}>
                  {result.data}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ 
        marginTop: '30px', 
        padding: '15px', 
        backgroundColor: '#f5f5f5', 
        borderRadius: '5px',
        fontSize: '0.9em'
      }}>
        <h4>API Configuration:</h4>
        <ul>
          <li><strong>Model:</strong> gemini-3-flash-preview</li>
          <li><strong>Endpoint:</strong> generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent</li>
          <li><strong>Required Thinking Levels:</strong> minimal, medium (for gemini-3)</li>
          <li><strong>Environment Variable:</strong> NEXT_PUBLIC_GEMINI_API_KEY</li>
        </ul>
      </div>
    </div>
  )
}
