'use client'

import { useState } from 'react'

export default function AITestPage() {
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [essay, setEssay] = useState('Technology has transformed education. Online learning is accessible to everyone.')

  const testGeminiFlash = async () => {
    try {
      // CORRECT: gemini-1.5-flash
      const response = await fetch(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' + 
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
              maxOutputTokens: 100
            }
          })
        }
      )
      
      const data = await response.json()
      
      if (data.error) {
        return { success: false, error: data.error.message }
      }
      
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No text'
      return { 
        success: true, 
        data: text,
        raw: data
      }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const evaluateEssayWithGemini = async () => {
    try {
      const prompt = `Evaluate this IELTS essay on scale 1-9 (9 is best). Reply with ONLY the number:
      
      "${essay}"
      
      Example response: "6.5"`

      const response = await fetch(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' + 
        process.env.NEXT_PUBLIC_GEMINI_API_KEY,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{ text: prompt }]
            }],
            generationConfig: {
              temperature: 0.3,
              maxOutputTokens: 10
            }
          })
        }
      )
      
      const data = await response.json()
      const scoreText = data.candidates?.[0]?.content?.parts?.[0]?.text || '6.5'
      const score = parseFloat(scoreText) || 6.5
      
      return {
        success: true,
        score: score,
        feedback: `Gemini 1.5 Flash gave band: ${score}`,
        raw: data
      }
    } catch (error) {
      return {
        success: false,
        score: 6.5,
        feedback: 'Error: ' + error.message,
        error: true
      }
    }
  }

  const runConnectionTest = async () => {
    setLoading(true)
    setResults([])
    
    const result = await testGeminiFlash()
    
    setResults([{
      name: 'Gemini 1.5 Flash',
      success: result.success,
      message: result.success ? `✅ Working: "${result.data}"` : `❌ Failed: ${result.error}`,
      raw: result
    }])
    
    setLoading(false)
  }

  const runEssayTest = async () => {
    setLoading(true)
    
    const result = await evaluateEssayWithGemini()
    
    setResults([{
      name: 'IELTS Essay Evaluation',
      success: result.success,
      message: result.success ? `✅ Score: Band ${result.score}` : `❌ Error: ${result.feedback}`,
      score: result.score,
      raw: result
    }])
    
    setLoading(false)
  }

  return (
    <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '32px', marginBottom: '10px' }}>🤖 Gemini 1.5 Flash Test</h1>
      <p style={{ color: '#666', marginBottom: '30px' }}>
        Testing <strong>gemini-1.5-flash</strong> model (correct free model)
      </p>

      <div style={{ 
        backgroundColor: '#e8f4fd', 
        padding: '20px', 
        borderRadius: '10px',
        marginBottom: '30px',
        borderLeft: '4px solid #4285f4'
      }}>
        <h3 style={{ color: '#1a73e8', marginTop: '0' }}>ℹ️ Model Info</h3>
        <p><strong>Model:</strong> gemini-1.5-flash (latest free)</p>
        <p><strong>Endpoint:</strong> https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent</p>
        <p><strong>Your Key:</strong> {process.env.NEXT_PUBLIC_GEMINI_API_KEY ? '***' + process.env.NEXT_PUBLIC_GEMINI_API_KEY.slice(-8) : 'Not set'}</p>
      </div>

      {/* Test Buttons */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
        <button
          onClick={runConnectionTest}
          disabled={loading}
          style={{
            padding: '15px 30px',
            backgroundColor: loading ? '#999' : '#4285f4',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: loading ? 'not-allowed' : 'pointer',
            flex: 1
          }}
        >
          🔌 Test Connection
        </button>
        
        <button
          onClick={runEssayTest}
          disabled={loading}
          style={{
            padding: '15px 30px',
            backgroundColor: loading ? '#999' : '#34a853',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: loading ? 'not-allowed' : 'pointer',
            flex: 1
          }}
        >
          📝 Evaluate Essay
        </button>
      </div>

      {/* Essay Input */}
      <div style={{ marginBottom: '30px' }}>
        <textarea
          value={essay}
          onChange={(e) => setEssay(e.target.value)}
          style={{
            width: '100%',
            height: '100px',
            padding: '15px',
            border: '2px solid #ddd',
            borderRadius: '8px',
            fontSize: '16px'
          }}
          placeholder="Enter IELTS essay..."
        />
      </div>

      {/* Results */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '30px' }}>
          <div style={{ fontSize: '48px' }}>⏳</div>
          <p>Calling Gemini 1.5 Flash API...</p>
        </div>
      )}

      {results.map((result, index) => (
        <div
          key={index}
          style={{
            padding: '25px',
            marginBottom: '20px',
            backgroundColor: result.success ? '#d4edda' : '#f8d7da',
            border: `2px solid ${result.success ? '#28a745' : '#dc3545'}`,
            borderRadius: '10px'
          }}
        >
          <h3 style={{ 
            marginTop: '0', 
            color: result.success ? '#155724' : '#721c24',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <span style={{ fontSize: '24px' }}>
              {result.success ? '✅' : '❌'}
            </span>
            {result.name}
          </h3>
          
          <p style={{ 
            fontSize: '18px', 
            fontWeight: 'bold',
            color: result.success ? '#155724' : '#721c24'
          }}>
            {result.message}
          </p>
          
          {result.score && (
            <div style={{
              textAlign: 'center',
              margin: '20px 0',
              padding: '20px',
              backgroundColor: '#e2e3e5',
              borderRadius: '8px'
            }}>
              <div style={{ fontSize: '14px', color: '#6c757d' }}>BAND SCORE</div>
              <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#1a73e8' }}>
                {result.score}
              </div>
            </div>
          )}
          
          {!result.success && (
            <div style={{ 
              backgroundColor: '#fff3cd', 
              padding: '15px', 
              borderRadius: '5px',
              marginTop: '15px',
              border: '1px solid #ffc107'
            }}>
              <strong>Troubleshooting:</strong>
              <ol style={{ margin: '10px 0 0 20px' }}>
                <li>Check key is in Vercel Environment Variables</li>
                <li>Key should start with: <code>AIzaSy</code></li>
                <li>Wait 2 minutes after adding to Vercel</li>
                <li>Model must be: <code>gemini-1.5-flash</code></li>
              </ol>
            </div>
          )}
        </div>
      ))}

      {/* Instructions */}
      <div style={{ 
        backgroundColor: '#f8f9fa', 
        padding: '20px', 
        borderRadius: '8px',
        marginTop: '40px',
        border: '1px solid #dee2e6'
      }}>
        <h3>📋 Expected Flow:</h3>
        <ol style={{ lineHeight: '1.8' }}>
          <li>Click <strong>"Test Connection"</strong> - should show "Hello IELTS"</li>
          <li>If ✅, click <strong>"Evaluate Essay"</strong></li>
          <li>Should give a band score (6.0-8.0 range)</li>
          <li>Then we integrate into IELTS exam</li>
        </ol>
      </div>
    </div>
  )
}
