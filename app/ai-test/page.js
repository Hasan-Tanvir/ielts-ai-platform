'use client'

import { useState } from 'react'

export default function AITestPage() {
  const [essay, setEssay] = useState('Technology has transformed education significantly. Online learning platforms allow students to access courses from anywhere in the world.')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [apiStatus, setApiStatus] = useState({ gemini: 'Not tested', deepseek: 'Not tested' })

  const testGeminiAPI = async () => {
    console.log('Testing Gemini API...')
    
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.NEXT_PUBLIC_GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{ text: 'Hello, are you working?' }]
            }]
          })
        }
      )
      
      if (response.ok) {
        const data = await response.json()
        setApiStatus(prev => ({ ...prev, gemini: '✅ Working' }))
        return { success: true, data }
      } else {
        setApiStatus(prev => ({ ...prev, gemini: '❌ Failed' }))
        return { success: false, error: `HTTP ${response.status}` }
      }
    } catch (error) {
      setApiStatus(prev => ({ ...prev, gemini: '❌ Error' }))
      return { success: false, error: error.message }
    }
  }

  const testDeepSeekAPI = async () => {
    console.log('Testing DeepSeek API...')
    
    try {
      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [{ role: 'user', content: 'Say hello if you are working.' }],
          max_tokens: 10
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        setApiStatus(prev => ({ ...prev, deepseek: '✅ Working' }))
        return { success: true, data }
      } else {
        setApiStatus(prev => ({ ...prev, deepseek: '❌ Failed' }))
        return { success: false, error: `HTTP ${response.status}` }
      }
    } catch (error) {
      setApiStatus(prev => ({ ...prev, deepseek: '❌ Error' }))
      return { success: false, error: error.message }
    }
  }

  const testAllAPIs = async () => {
    setLoading(true)
    setResult(null)
    
    console.log('Testing both APIs...')
    
    const geminiResult = await testGeminiAPI()
    const deepseekResult = await testDeepSeekAPI()
    
    const allWorking = geminiResult.success && deepseekResult.success
    
    setResult({
      success: allWorking,
      gemini: geminiResult.success ? '✅ Connected' : `❌ Failed: ${geminiResult.error}`,
      deepseek: deepseekResult.success ? '✅ Connected' : `❌ Failed: ${deepseekResult.error}`,
      message: allWorking 
        ? '🎉 Both APIs connected successfully!' 
        : '⚠️ Some APIs failed. Check keys.',
      timestamp: new Date().toLocaleTimeString()
    })
    
    setLoading(false)
  }

  const evaluateEssay = async () => {
    if (!essay.trim()) {
      alert('Please enter an essay')
      return
    }
    
    setLoading(true)
    
    try {
      // Try real AI evaluation
      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [{
            role: 'user',
            content: `Evaluate this IELTS essay (1-9 band): "${essay}" 
                     Give only a number between 1-9 as response.`
          }],
          max_tokens: 10
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        const aiResponse = data.choices[0]?.message?.content || '6.5'
        const score = parseFloat(aiResponse) || 6.5
        
        setResult({
          success: true,
          score: score,
          feedback: `DeepSeek AI gave band: ${score}`,
          raw: data,
          isRealAI: true
        })
      } else {
        throw new Error(`API error: ${response.status}`)
      }
    } catch (error) {
      // Fallback to mock
      setResult({
        success: false,
        score: 6.5,
        feedback: 'Using mock score. API error: ' + error.message,
        error: error.message
      })
    }
    
    setLoading(false)
  }

  return (
    <div style={{ 
      padding: '40px', 
      maxWidth: '1000px', 
      margin: '0 auto',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <h1 style={{ fontSize: '36px', marginBottom: '10px', color: '#1a202c' }}>
        🤖 IELTS AI Platform - API Test
      </h1>
      <p style={{ color: '#4a5568', marginBottom: '40px' }}>
        Testing Gemini and DeepSeek AI connections
      </p>

      {/* API Status Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
        gap: '20px',
        marginBottom: '40px'
      }}>
        <div style={{ 
          backgroundColor: '#f0f9ff', 
          padding: '25px', 
          borderRadius: '12px',
          border: '2px solid #0ea5e9'
        }}>
          <h3 style={{ color: '#0369a1', marginTop: '0' }}>🔑 Gemini API</h3>
          <div style={{ 
            fontSize: '24px', 
            fontWeight: 'bold',
            color: apiStatus.gemini.includes('✅') ? '#059669' : '#dc2626'
          }}>
            {apiStatus.gemini}
          </div>
          <p style={{ color: '#4b5563', fontSize: '14px', marginTop: '10px' }}>
            Key: {process.env.NEXT_PUBLIC_GEMINI_API_KEY ? '***' + process.env.NEXT_PUBLIC_GEMINI_API_KEY.slice(-8) : 'Not set'}
          </p>
        </div>
        
        <div style={{ 
          backgroundColor: '#f0fdf4', 
          padding: '25px', 
          borderRadius: '12px',
          border: '2px solid #10b981'
        }}>
          <h3 style={{ color: '#065f46', marginTop: '0' }}>🧠 DeepSeek API</h3>
          <div style={{ 
            fontSize: '24px', 
            fontWeight: 'bold',
            color: apiStatus.deepseek.includes('✅') ? '#059669' : '#dc2626'
          }}>
            {apiStatus.deepseek}
          </div>
          <p style={{ color: '#4b5563', fontSize: '14px', marginTop: '10px' }}>
            Key: {process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY ? '***' + process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY.slice(-8) : 'Not set'}
          </p>
        </div>
      </div>

      {/* Test Buttons */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '20px',
        marginBottom: '40px'
      }}>
        <button
          onClick={testAllAPIs}
          disabled={loading}
          style={{
            padding: '20px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            fontSize: '18px',
            fontWeight: '600',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          🔍 Test API Connections
        </button>
        
        <button
          onClick={evaluateEssay}
          disabled={loading}
          style={{
            padding: '20px',
            backgroundColor: '#8b5cf6',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            fontSize: '18px',
            fontWeight: '600',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          📝 Test Essay Evaluation
        </button>
      </div>

      {/* Essay Input */}
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ fontSize: '20px', marginBottom: '10px', color: '#374151' }}>
          IELTS Writing Task 2:
        </h2>
        <textarea
          value={essay}
          onChange={(e) => setEssay(e.target.value)}
          style={{
            width: '100%',
            height: '150px',
            padding: '15px',
            border: '2px solid #d1d5db',
            borderRadius: '8px',
            fontSize: '16px',
            resize: 'vertical'
          }}
          placeholder="Enter IELTS essay for AI evaluation..."
        />
      </div>

      {/* Results Display */}
      {loading && (
        <div style={{ 
          textAlign: 'center', 
          padding: '40px',
          backgroundColor: '#f3f4f6',
          borderRadius: '10px',
          marginBottom: '30px'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>⏳</div>
          <p style={{ fontSize: '18px', color: '#4b5563' }}>
            Testing AI APIs. This may take 10-20 seconds...
          </p>
        </div>
      )}

      {result && !loading && (
        <div style={{
          backgroundColor: result.success ? '#f0fdf4' : '#fef3c7',
          padding: '30px',
          borderRadius: '12px',
          border: `2px solid ${result.success ? '#10b981' : '#f59e0b'}`,
          marginBottom: '30px'
        }}>
          <h2 style={{ 
            fontSize: '24px', 
            marginBottom: '20px',
            color: result.success ? '#065f46' : '#92400e'
          }}>
            {result.success ? '✅ Test Results' : '⚠️ Test Results'}
          </h2>
          
          {result.isRealAI ? (
            <div>
              <div style={{ 
                fontSize: '48px', 
                fontWeight: 'bold',
                color: '#1e40af',
                textAlign: 'center',
                marginBottom: '20px'
              }}>
                Band {result.score}
              </div>
              <p style={{ color: '#374151', textAlign: 'center' }}>
                {result.feedback}
              </p>
            </div>
          ) : (
            <div>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                gap: '15px',
                marginBottom: '20px'
              }}>
                <div style={{ 
                  backgroundColor: '#e0f2fe', 
                  padding: '15px', 
                  borderRadius: '8px'
                }}>
                  <div style={{ fontSize: '14px', color: '#0369a1' }}>Gemini</div>
                  <div style={{ fontSize: '18px', fontWeight: '500' }}>{result.gemini}</div>
                </div>
                <div style={{ 
                  backgroundColor: '#dcfce7', 
                  padding: '15px', 
                  borderRadius: '8px'
                }}>
                  <div style={{ fontSize: '14px', color: '#065f46' }}>DeepSeek</div>
                  <div style={{ fontSize: '18px', fontWeight: '500' }}>{result.deepseek}</div>
                </div>
              </div>
              
              <div style={{ 
                backgroundColor: '#f8fafc', 
                padding: '20px', 
                borderRadius: '8px',
                marginTop: '20px'
              }}>
                <p style={{ color: '#4b5563', margin: '0' }}>
                  <strong>Summary:</strong> {result.message}
                </p>
                {result.error && (
                  <p style={{ color: '#dc2626', marginTop: '10px' }}>
                    Error: {result.error}
                  </p>
                )}
              </div>
            </div>
          )}
          
          <p style={{ 
            color: '#6b7280', 
            fontSize: '14px', 
            marginTop: '20px',
            textAlign: 'center'
          }}>
            Tested at: {result.timestamp}
          </p>
        </div>
      )}

      {/* Instructions */}
      <div style={{ 
        backgroundColor: '#f3f4f6', 
        padding: '25px', 
        borderRadius: '10px',
        borderLeft: '4px solid #6b7280'
      }}>
        <h3 style={{ color: '#374151', marginTop: '0' }}>📋 Expected Outcome:</h3>
        <ol style={{ color: '#4b5563', paddingLeft: '20px', lineHeight: '1.8' }}>
          <li>Click <strong>"Test API Connections"</strong> first</li>
          <li>Should show <strong>✅ Working</strong> for both APIs</li>
          <li>If ❌, check Vercel environment variables</li>
          <li>Then test <strong>"Test Essay Evaluation"</strong></li>
          <li>Should show real AI band score</li>
        </ol>
        
        <div style={{ 
          backgroundColor: '#fee2e2', 
          padding: '15px', 
          borderRadius: '8px',
          marginTop: '20px',
          display: result?.error ? 'block' : 'none'
        }}>
          <strong style={{ color: '#7f1d1d' }}>Troubleshooting:</strong>
          <ul style={{ color: '#7f1d1d', paddingLeft: '20px', marginTop: '10px' }}>
            <li>Check API keys in Vercel environment variables</li>
            <li>Ensure no credit card required for free tier</li>
            <li>Wait 5 minutes after adding keys</li>
            <li>Check browser console (F12) for errors</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
