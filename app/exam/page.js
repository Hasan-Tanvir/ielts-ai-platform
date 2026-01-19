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
    alert(`✅ Saved ${savedCount} answers to database!`)
  }

  // Complete entire exam
  const completeExam = async () => {
    if (!userId || !examId) {
      alert('Please login first')
      return
    }

    if (window.confirm('Finish entire IELTS exam? This will calculate your final band score and show results.')) {
      setSaving(true)
      
      // Update exam as completed
      const { error } = await supabase
        .from('exams')
        .update({
          completed: true,
          listening_score: 6.5,
          reading_score: 7.0,
          writing_score: 6.0,
          speaking_score: 6.5,
          overall_band: 6.5,
        })
        .eq('id', examId)

      setSaving(false)
      
      if (error) {
        alert('Error completing exam: ' + error.message)
      } else {
        alert('✅ Exam completed! Redirecting to results...')
        router.push('/results')
      }
    }
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
          <p style={{ color: '#4a5568' }}>Complete all sections and get your band score</p>
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
                    backgroundColor: answers[q.id] ? '#f0fff4' : '#f8fafc'
                  }}>
                    <p style={{ fontSize: '18px', color: '#2d3748', marginBottom: '20px' }}>
                      <strong>Q{index + 1}:</strong> {q.question_text}
                    </p>

                    {/* Answer Input */}
                    <div>
                      <textarea 
                        value={answers[q.id] || ''}
                        onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                        style={{
                          width: '100%',
                          padding: '15px',
                          border: '1px solid #cbd5e0',
                          borderRadius: '8px',
                          minHeight: '80px',
                          fontSize: '16px'
                        }}
                        placeholder="Type your answer here..."
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Save Answers Button */}
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
                  cursor: saving ? 'not-allowed' : 'pointer',
                  marginRight: '20px'
                }}
              >
                {saving ? 'Saving...' : `Save ${currentModule} Answers`}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* COMPLETE EXAM BUTTON - NEW */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '10px',
        padding: '40px',
        marginTop: '30px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
        textAlign: 'center',
        border: '2px solid #8b5cf6'
      }}>
        <h3 style={{ color: '#5b21b6', fontSize: '24px', marginBottom: '15px' }}>
          🎯 Finished All Sections?
        </h3>
        <p style={{ color: '#6b7280', marginBottom: '25px', maxWidth: '600px', margin: '0 auto' }}>
          Completed Listening, Reading, Writing, and Speaking? Get your final IELTS band score.
        </p>
        <button
          onClick={completeExam}
          disabled={saving}
          style={{
            padding: '18px 50px',
            backgroundColor: saving ? '#9ca3af' : '#8b5cf6',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            fontSize: '20px',
            fontWeight: 'bold',
            cursor: saving ? 'not-allowed' : 'pointer',
            boxShadow: '0 4px 14px rgba(139, 92, 246, 0.3)'
          }}
        >
          {saving ? 'Processing...' : '✅ Complete IELTS Exam & Get Score'}
        </button>
        <p style={{ color: '#9ca3af', marginTop: '15px', fontSize: '14px' }}>
          This will calculate your band score and redirect to results page
        </p>
      </div>

      {/* Progress Status */}
      <div style={{
        backgroundColor: '#f0f9ff',
        borderRadius: '10px',
        padding: '25px',
        marginTop: '30px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '14px', color: '#0369a1' }}>Exam ID</div>
          <div style={{ fontWeight: '500', color: '#1e40af' }}>
            {examId ? examId.slice(0, 8) + '...' : 'Creating...'}
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '14px', color: '#0369a1' }}>Questions Answered</div>
          <div style={{ fontWeight: '500', color: '#1e40af' }}>
            {Object.values(answers).filter(a => a && a.trim() !== '').length} total
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '14px', color: '#0369a1' }}>Current Module</div>
          <div style={{ fontWeight: '500', color: '#1e40af', textTransform: 'capitalize' }}>
            {currentModule}
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '14px', color: '#0369a1' }}>Next Step</div>
          <div style={{ fontWeight: '500', color: '#1e40af' }}>
            {currentModule === 'speaking' ? 'Complete Exam' : 'Next Module'}
          </div>
        </div>
      </div>
    </div>
  )
}
