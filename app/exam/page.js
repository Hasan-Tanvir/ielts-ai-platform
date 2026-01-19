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
  const [answers, setAnswers] = useState({})
  const [userId, setUserId] = useState(null)
  const [examId, setExamId] = useState(null)
  const [saving, setSaving] = useState(false)

  // Get current user
  useEffect(() => {
    checkUser()
  }, [])

  async function checkUser() {
    const { data } = await supabase.auth.getUser()
    if (data.user) {
      setUserId(data.user.id)
      createExam(data.user.id)
    } else {
      router.push('/login')
    }
  }

  // Create new exam record
  async function createExam(userId) {
    const { data, error } = await supabase
      .from('exams')
      .insert({
        user_id: userId,
        exam_date: new Date().toISOString(),
        completed: false,
        duration_minutes: 120
      })
      .select()
      .single()

    if (!error && data) {
      setExamId(data.id)
    }
  }

  // Fetch questions for current module
  useEffect(() => {
    if (userId) fetchQuestions()
  }, [currentModule, userId])

  async function fetchQuestions() {
    setLoading(true)
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('module', currentModule)
      .limit(5)
    
    if (!error && data) {
      setQuestions(data)
      // Initialize empty answers
      const initialAnswers = {}
      data.forEach(q => {
        initialAnswers[q.id] = ''
      })
      setAnswers(initialAnswers)
    }
    setLoading(false)
  }

  // Handle answer change
  const handleAnswerChange = (questionId, value) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }))
  }

  // Save answers to database
  const saveAnswers = async () => {
    if (!userId || !examId) {
      alert('Please login first')
      return
    }

    setSaving(true)
    let savedCount = 0

    for (const question of questions) {
      const answer = answers[question.id]
      if (answer && answer.trim() !== '') {
        const { error } = await supabase
          .from('user_responses')
          .insert({
            user_id: userId,
            exam_id: examId,
            question_id: question.id,
            user_answer: answer,
            module: currentModule,
            answered_at: new Date().toISOString()
          })

        if (!error) savedCount++
      }
    }

    setSaving(false)
    alert(`✅ Saved ${savedCount} answers to database!\n\nCheck Supabase → Table Editor → user_responses`)
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
          <p style={{ color: '#4a5568' }}>Exam ID: {examId ? examId.slice(0, 8) + '...' : 'Loading...'}</p>
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
        boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
        minHeight: '500px'
      }}>
        <h2 style={{ 
          fontSize: '28px', 
          marginBottom: '30px',
          color: '#2d3748',
          textTransform: 'capitalize'
        }}>
          {currentModule} Section
        </h2>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px' }}>
            <p>Loading questions...</p>
          </div>
        ) : (
          <div>
            {/* Questions List */}
            <div style={{ marginBottom: '30px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                {questions.map((q, index) => (
                  <div key={q.id} style={{
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '25px',
                    backgroundColor: answers[q.id] ? '#f0fff4' : '#f8fafc',
                    borderLeft: answers[q.id] ? '4px solid #10b981' : '4px solid #e2e8f0'
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
                      <div style={{ color: '#718096' }}>
                        {answers[q.id] ? '✓ Answered' : 'Not answered'}
                      </div>
                    </div>
                    
                    <p style={{ fontSize: '18px', color: '#2d3748', marginBottom: '20px' }}>
                      {q.question_text}
                    </p>

                    {/* Answer Input */}
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', color: '#4a5568' }}>
                        Your Answer:
                      </label>
                      {q.question_type.includes('multiple') ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          {['A', 'B', 'C', 'D'].map(option => (
                            <label key={option} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <input 
                                type="radio" 
                                name={`q${q.id}`} 
                                value={option}
                                checked={answers[q.id] === option}
                                onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                              />
                              <span>Option {option}</span>
                            </label>
                          ))}
                        </div>
                      ) : (
                        <textarea 
                          value={answers[q.id] || ''}
                          onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                          style={{
                            width: '100%',
                            padding: '15px',
                            border: '1px solid #cbd5e0',
                            borderRadius: '8px',
                            minHeight: '100px',
                            fontSize: '16px'
                          }}
                          placeholder="Type your answer here..."
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
                onClick={saveAnswers}
                disabled={saving}
                style={{
                  padding: '15px 40px',
                  backgroundColor: saving ? '#9ca3af' : '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '18px',
                  fontWeight: '600',
                  cursor: saving ? 'not-allowed' : 'pointer'
                }}
              >
                {saving ? 'Saving to Database...' : `Save ${currentModule} Answers`}
              </button>
              <p style={{ color: '#6b7280', marginTop: '10px', fontSize: '14px' }}>
                Answers saved to: user_responses table in Supabase
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Database Status */}
      <div style={{
        backgroundColor: '#e0f2fe',
        borderRadius: '10px',
        padding: '20px',
        marginTop: '30px',
        borderLeft: '4px solid #0ea5e9'
      }}>
        <h3 style={{ color: '#0369a1', marginTop: '0' }}>💾 Database Status:</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '15px' }}>
          <div>
            <div style={{ color: '#4b5563' }}>User ID:</div>
            <div style={{ fontWeight: '500', color: '#1f2937' }}>
              {userId ? userId.slice(0, 10) + '...' : 'Not logged in'}
            </div>
          </div>
          <div>
            <div style={{ color: '#4b5563' }}>Exam ID:</div>
            <div style={{ fontWeight: '500', color: '#1f2937' }}>
              {examId ? examId.slice(0, 10) + '...' : 'Creating...'}
            </div>
          </div>
          <div>
            <div style={{ color: '#4b5563' }}>Questions:</div>
            <div style={{ fontWeight: '500', color: '#1f2937' }}>
              {questions.length} loaded
            </div>
          </div>
          <div>
            <div style={{ color: '#4b5563' }}>Answered:</div>
            <div style={{ fontWeight: '500', color: '#1f2937' }}>
              {Object.values(answers).filter(a => a && a.trim() !== '').length} / {questions.length}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
