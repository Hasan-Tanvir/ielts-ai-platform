'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function ExamPage() {
  const router = useRouter()
  const [timeLeft, setTimeLeft] = useState(7200) // 2 hours in seconds
  const [currentModule, setCurrentModule] = useState('listening')

  // Timer countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => prev > 0 ? prev - 1 : 0)
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Format time
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f8f9fa',
      padding: '20px'
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '10px',
        marginBottom: '20px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1a202c' }}>
            🎯 IELTS Mock Test
          </h1>
          <p style={{ color: '#4a5568' }}>Real exam simulation</p>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: timeLeft < 600 ? '#e53e3e' : '#2d3748' }}>
            {formatTime(timeLeft)}
          </div>
          <div style={{ color: '#718096', fontSize: '14px' }}>Time Remaining</div>
        </div>
      </div>

      {/* Module Tabs */}
      <div style={{
        display: 'flex',
        gap: '10px',
        marginBottom: '30px',
        overflowX: 'auto'
      }}>
        {['listening', 'reading', 'writing', 'speaking'].map(module => (
          <button
            key={module}
            onClick={() => setCurrentModule(module)}
            style={{
              padding: '15px 25px',
              backgroundColor: currentModule === module ? '#3182ce' : 'white',
              color: currentModule === module ? 'white' : '#4a5568',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              textTransform: 'capitalize',
              minWidth: '120px',
              textAlign: 'center'
            }}
          >
            {module}
          </button>
        ))}
      </div>

      {/* Exam Content */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '10px',
        padding: '40px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
      }}>
        <h2 style={{ 
          fontSize: '28px', 
          marginBottom: '30px',
          color: '#2d3748',
          textTransform: 'capitalize'
        }}>
          {currentModule} Section
        </h2>

        {/* Placeholder content */}
        <div style={{ 
          border: '2px dashed #cbd5e0', 
          borderRadius: '8px',
          padding: '60px 40px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>
            {currentModule === 'listening' && '🎧'}
            {currentModule === 'reading' && '📖'}
            {currentModule === 'writing' && '✏️'}
            {currentModule === 'speaking' && '🎤'}
          </div>
          <h3 style={{ fontSize: '24px', color: '#4a5568', marginBottom: '10px' }}>
            {currentModule.toUpperCase()} Questions Will Appear Here
          </h3>
          <p style={{ color: '#718096', maxWidth: '600px', margin: '0 auto' }}>
            This is where {currentModule} questions, instructions, and answer fields will be displayed.
            Full exam interface coming in next update.
          </p>
        </div>

        {/* Navigation */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: '40px',
          paddingTop: '20px',
          borderTop: '1px solid #e2e8f0'
        }}>
          <button
            onClick={() => alert('Previous section')}
            style={{
              padding: '12px 24px',
              backgroundColor: '#edf2f7',
              color: '#4a5568',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            ← Previous Section
          </button>
          <button
            onClick={() => alert('Next section')}
            style={{
              padding: '12px 24px',
              backgroundColor: '#3182ce',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            Next Section →
          </button>
        </div>
      </div>

      {/* Instructions */}
      <div style={{
        backgroundColor: '#ebf8ff',
        borderRadius: '10px',
        padding: '20px',
        marginTop: '30px',
        borderLeft: '4px solid #4299e1'
      }}>
        <h3 style={{ color: '#2b6cb0', marginTop: '0' }}>Exam Instructions:</h3>
        <ul style={{ color: '#2c5282', paddingLeft: '20px' }}>
          <li>Complete all four sections: Listening, Reading, Writing, Speaking</li>
          <li>Timer will auto-submit when time ends</li>
          <li>You cannot go back to previous sections</li>
          <li>Save your answers regularly</li>
        </ul>
      </div>
    </div>
  )
}
