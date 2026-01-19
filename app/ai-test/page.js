'use client'

import { useState } from 'react'
import { evaluateWritingTask } from '@/lib/ai-orchestrator'

export default function AITestPage() {
  const [essay, setEssay] = useState('Technology has transformed education significantly. Online learning platforms allow students to access courses from anywhere in the world. However, some argue that traditional classroom teaching is more effective for student engagement.')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const evaluateEssay = async () => {
    if (!essay.trim()) {
      alert('Please enter an essay')
      return
    }
    
    setLoading(true)
    try {
      const evaluation = await evaluateWritingTask(essay, 'task2')
      setResult(evaluation)
    } catch (error) {
      setResult({ 
        overall: 6.0, 
        feedback: 'AI evaluation failed. Using fallback scoring.',
        error: error.message 
      })
    }
    setLoading(false)
  }

  return (
    <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '32px', marginBottom: '30px' }}>🤖 AI Writing Evaluator Test</h1>
      
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ fontSize: '20px', marginBottom: '10px' }}>IELTS Writing Task 2 Essay:</h2>
        <textarea
          value={essay}
          onChange={(e) => setEssay(e.target.value)}
          style={{
            width: '100%',
            height: '200px',
            padding: '15px',
            border: '1px solid #ccc',
            borderRadius: '8px',
            fontSize: '16px'
          }}
          placeholder="Paste your IELTS essay here..."
        />
      </div>

      <button
        onClick={evaluateEssay}
        disabled={loading}
        style={{
          padding: '15px 40px',
          backgroundColor: loading ? '#999' : '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '18px',
          cursor: loading ? 'not-allowed' : 'pointer',
          marginBottom: '30px'
        }}
      >
        {loading ? 'Evaluating with AI...' : 'Evaluate with DeepSeek AI'}
      </button>

      {result && (
        <div style={{
          backgroundColor: '#f8fafc',
          padding: '30px',
          borderRadius: '12px',
          border: '2px solid #e2e8f0'
        }}>
          <h2 style={{ fontSize: '24px', marginBottom: '20px', color: '#1f2937' }}>
            AI Evaluation Result
          </h2>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(2, 1fr)', 
            gap: '20px',
            marginBottom: '30px'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '14px', color: '#6b7280' }}>Task Achievement</div>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#3b82f6' }}>
                {result.task_achievement || 'N/A'}
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '14px', color: '#6b7280' }}>Coherence & Cohesion</div>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#10b981' }}>
                {result.coherence || 'N/A'}
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '14px', color: '#6b7280' }}>Lexical Resource</div>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#f59e0b' }}>
                {result.vocabulary || 'N/A'}
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '14px', color: '#6b7280' }}>Grammar</div>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#8b5cf6' }}>
                {result.grammar || 'N/A'}
              </div>
            </div>
          </div>

          <div style={{
            backgroundColor: '#f0f9ff',
            padding: '20px',
            borderRadius: '8px',
            textAlign: 'center',
            marginBottom: '20px'
          }}>
            <div style={{ fontSize: '14px', color: '#0369a1' }}>OVERALL BAND SCORE</div>
            <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#1e40af' }}>
              {result.overall || 'N/A'}
            </div>
          </div>

          <div>
            <h3 style={{ fontSize: '18px', color: '#374151', marginBottom: '10px' }}>AI Feedback:</h3>
            <p style={{ color: '#4b5563', lineHeight: '1.6' }}>
              {result.feedback || 'No feedback available.'}
            </p>
          </div>

          {result.error && (
            <div style={{ 
              backgroundColor: '#fee2e2',
              padding: '15px',
              borderRadius: '8px',
              marginTop: '20px',
              color: '#7f1d1d'
            }}>
              <strong>Note:</strong> {result.error}
              <p style={{ marginTop: '10px', fontSize: '14px' }}>
                Make sure you have added API keys to .env.local and Vercel environment variables.
              </p>
            </div>
          )}
        </div>
      )}

      <div style={{ 
        backgroundColor: '#f0fdf4',
        padding: '20px',
        borderRadius: '8px',
        marginTop: '40px',
        borderLeft: '4px solid #10b981'
      }}>
        <h3 style={{ color: '#065f46', marginTop: '0' }}>📋 Next Steps:</h3>
        <ol style={{ color: '#047857', paddingLeft: '20px', lineHeight: '1.8' }}>
          <li>Get Gemini and DeepSeek API keys (free)</li>
          <li>Add keys to .env.local and Vercel</li>
          <li>Test this page: /ai-test</li>
          <li>Then integrate into exam flow</li>
        </ol>
      </div>
    </div>
  )
}
