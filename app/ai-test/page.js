'use client'

import { useState } from 'react'

export default function AITestPage() {
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)

  const testGeminiSimple = async () => {
    try {
      // CORRECT Gemini endpoint
      const response = await fetch(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=' + process.env.NEXT_PUBLIC_GEMINI_API_KEY,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{ text: 'Say hello in one word.' }]
            }]
          })
        }
      )
      
      if (response.status === 404) {
        return { success: false, error: '404 - Wrong endpoint or model' }
      }
      
      const data = await response.json()
      return { 
        success: true, 
        data: data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response' 
      }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const testDeepSeekSimple = async () => {
    try {
      // Try DeepSeek with proper headers
      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [{ role: 'user', content: 'Say hello.' }],
          max_tokens: 10,
          stream: false
        })
      })
      
      if (response.status === 402) {
        return { 
          success: false, 
          error: '402 - Payment required. Check https://platform.deepseek.com/balance' 
        }
      }
      
      const data = await response.json()
      return { 
        success: true, 
        data: data.choices?.[0]?.message?.content || 'No response' 
      }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const runTests = async () => {
    setLoading(true)
    setResults([])
    
    const tests = [
      { name: 'Gemini API', test: testGeminiSimple },
      { name: 'DeepSeek API', test: testDeepSeekSimple }
    ]
    
    for (const test of tests) {
      const result = await test.test()
      setResults(prev => [...prev, {
        name: test.name,
        success: result.success,
        message: result.success ? '✅ Connected: ' + result.data : '❌ Failed: ' + result.error,
        raw: result
      }])
    }
    
    setLoading(false)
  }

  return (
    <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>🔧 API Connection Test</h1>
      
      <button 
        onClick={runTests}
        disabled={loading}
        style={{
          padding: '15px 30px',
          backgroundColor: loading ? '#999' : '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '18px',
          marginBottom: '30px'
        }}
      >
        {loading ? 'Testing...' : 'Test APIs'}
      </button>

      {results.length > 0 && (
        <div style={{ marginTop: '30px' }}>
          <h2>Results:</h2>
          {results.map((result, index) => (
            <div 
              key={index}
              style={{
                padding: '20px',
                marginBottom: '15px',
                backgroundColor: result.success ? '#d4edda' : '#f8d7da',
                border: `1px solid ${result.success ? '#c3e6cb' : '#f5c6cb'}`,
                borderRadius: '8px'
              }}
            >
              <h3 style={{ marginTop: '0', color: result.success ? '#155724' : '#721c24' }}>
                {result.name}: {result.success ? '✅' : '❌'}
              </h3>
              <p>{result.message}</p>
              {!result.success && result.name === 'DeepSeek API' && (
                <div style={{ 
                  backgroundColor: '#fff3cd', 
                  padding: '10px', 
                  borderRadius: '5px',
                  marginTop: '10px'
                }}>
                  <strong>Fix DeepSeek 402:</strong>
                  <ol style={{ margin: '10px 0 0 20px' }}>
                    <li>Go to: <a href="https://platform.deepseek.com/balance" target="_blank">DeepSeek Balance</a></li>
                    <li>Check if you have free credits</li>
                    <li>May need to add payment method (free tier still needs card)</li>
                  </ol>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div style={{ 
        backgroundColor: '#e7f3ff', 
        padding: '20px', 
        borderRadius: '8px',
        marginTop: '40px'
      }}>
        <h3>📋 API Status Summary:</h3>
        <ul>
          <li><strong>Gemini 404:</strong> Fixed endpoint. Should work with correct key.</li>
          <li><strong>DeepSeek 402:</strong> Needs account setup with credits.</li>
          <li><strong>Next:</strong> We can proceed with Gemini for now.</li>
        </ul>
      </div>
    </div>
  )
}
