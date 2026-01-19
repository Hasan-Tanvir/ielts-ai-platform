'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function ExamPage() {
  const router = useRouter()
  const [timeLeft, setTimeLeft] = useState(7200)
  const [currentModule, setCurrentModule] = useState('listening')
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)

  // Fetch questions for current module
  useEffect(() => {
    fetchQuestions()
  }, [currentModule])

  async function fetchQuestions() {
    setLoading(true)
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('module', currentModule)
      .limit(5) // Show 5 questions per module
    
    if (!error && data) {
      setQuestions(data)
    }
    setLoading(false)
  }

  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => prev > 0 ? prev - 1 : 0)
    }, 1000)
    return () => clearInterval(timer)
  }, [])

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
      padding: '20px',
      maxWidth: '1200px',
      margin: '0 auto'
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
          <p style={{ color: '#4a5568' }}>Real exam simulation - Questions from database</p>
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
            {module} ({module === 'listening' ? 4 : module === 'reading' ? 3 : module === 'writing' ? 2 : 3})
          </button>
        ))}
      </div>

      {/* Exam Content */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '10px',
        padding: '40px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
        minHeight: '500px'
      }}>
        <h2 style={{ 
          fontSize: '28px', 
          marginBottom: '30px',
          color: '#2d3748',
          textTransform: 'capitalize',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <span>
            {currentModule === 'listening' && '🎧'}
            {currentModule === 'reading' && '📖'}
            {currentModule === 'writing' && '✏️'}
            {currentModule === 'speaking' && '🎤'}
          </span>
          {currentModule} Section
          <span style={{ fontSize: '16px', color: '#718096', marginLeft: 'auto' }}>
            Band Level: {questions[0]?.band_level || '6'}
          </span>
        </h2>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px' }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>⏳</div>
            <p style={{ color: '#4a5568' }}>Loading {currentModule} questions...</p>
          </div>
        ) : questions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px' }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>📝</div>
            <h3 style={{ color: '#4a5568' }}>No {currentModule} questions found</h3>
            <p style={{ color: '#718096' }}>Add questions to database for this module</p>
          </div>
        ) : (
          <div>
            {/* Questions List */}
            <div style={{ marginBottom: '30px' }}>
              <h3 style={{ color: '#4a5568', marginBottom: '20px' }}>
                Questions ({questions.length}):
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                {questions.map((q, index) => (
                  <div key={q.id} style={{
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '25px',
                    backgroundColor: '#f8fafc'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                      <div style={{ 
                        backgroundColor: '#4299e1',
                        color: 'white',
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontSize: '14px',
                        fontWeight: 'bold'
                      }}>
                        Question {index + 1}
                      </div>
                      <div style={{ 
                        backgroundColor: '#edf2f7',
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontSize: '14px',
                        color: '#4a5568'
                      }}>
                        {q.question_type}
                      </div>
                    </div>
                    
                    <p style={{ 
                      fontSize: '18px', 
                      color: '#2d3748',
                      lineHeight: '1.6',
                      marginBottom: '20px'
                    }}>
                      {q.question_text}
                    </p>

                    {/* Answer Input */}
                    <div>
                      <label style={{ 
                        display: 'block', 
                        marginBottom: '8px',
                        color: '#4a5568',
                        fontWeight: '500'
                      }}>
                        Your Answer:
                      </label>
                      {q.question_type.includes('multiple') ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          {['A', 'B', 'C', 'D'].map(option => (
                            <label key={option} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <input type="radio" name={`q${index}`} value={option} />
                              <span>Option {option}</span>
                            </label>
                          ))}
                        </div>
                      ) : q.question_type.includes('writing') || q.question_type.includes('speaking') ? (
                        <textarea 
                          style={{
                            width: '100%',
                            padding: '15px',
                            border: '1px solid #cbd5e0',
                            borderRadius: '8px',
                            minHeight: '150px',
                            fontSize: '16px'
                          }}
                          placeholder="Type your answer here..."
                        />
                      ) : (
                        <input 
                          type="text"
                          style={{
                            width: '100%',
                            padding: '12px',
                            border: '1px solid #cbd5e0',
                            borderRadius: '8px',
                            fontSize: '16px'
                          }}
                          placeholder="Enter your answer..."
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <div style={{ textAlign: 'center', marginTop: '40px' }}>
              <button
                onClick={() => alert('Answers submitted! (Feature in progress)')}
                style={{
                  padding: '15px 40px',
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '18px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Submit {currentModule} Answers
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Progress */}
      <div style={{
        backgroundColor: '#f0fff4',
        borderRadius: '10px',
        padding: '20px',
        marginTop: '30px',
        border: '1px solid #c6f6d5'
      }}>
        <h3 style={{ color: '#22543d', marginTop: '0' }}>📊 Progress Summary:</h3>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '15px' }}>
          {['listening', 'reading', 'writing', 'speaking'].map(module => (
            <div key={module} style={{ textAlign: 'center' }}>
              <div style={{
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                backgroundColor: currentModule === module ? '#38a169' : '#c6f6d5',
                color: currentModule === module ? 'white' : '#22543d',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 10px',
                fontWeight: 'bold'
              }}>
                {module.charAt(0).toUpperCase()}
              </div>
              <div style={{ 
                color: currentModule === module ? '#38a169' : '#4a5568',
                fontWeight: currentModule === module ? '600' : '400'
              }}>
                {module}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
