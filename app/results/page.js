'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function ResultsPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [exams, setExams] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkUser()
    fetchExams()
  }, [])

  async function checkUser() {
    const { data } = await supabase.auth.getUser()
    if (!data.user) {
      router.push('/login')
    } else {
      setUser(data.user)
    }
  }

  async function fetchExams() {
    const { data, error } = await supabase
      .from('exams')
      .select(`
        *,
        user_responses(count)
      `)
      .order('exam_date', { ascending: false })
    
    if (!error) {
      setExams(data || [])
    }
    setLoading(false)
  }

  // Calculate band score (mock calculation for now)
  const calculateScore = (exam) => {
    // Mock scores - in real app, calculate from answers
    return {
      listening: exam.listening_score || 6.5,
      reading: exam.reading_score || 7.0,
      writing: exam.writing_score || 6.0,
      speaking: exam.speaking_score || 6.5,
      overall: exam.overall_band || 6.5
    }
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px' }}>
        <p>Loading results...</p>
      </div>
    )
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f8f9fa',
      padding: '20px'
    }}>
      {/* Header */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto 40px',
        padding: '30px',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#1a202c', marginBottom: '5px' }}>
              📊 IELTS Test Results
            </h1>
            <p style={{ color: '#6b7280' }}>
              View your exam scores and progress
            </p>
          </div>
          <div style={{ display: 'flex', gap: '15px' }}>
            <Link href="/dashboard" style={{
              padding: '12px 24px',
              backgroundColor: '#f3f4f6',
              color: '#4b5563',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: '500'
            }}>
              ← Dashboard
            </Link>
            <Link href="/exam" style={{
              padding: '12px 24px',
              backgroundColor: '#3b82f6',
              color: 'white',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: '500'
            }}>
              Take New Test
            </Link>
          </div>
        </div>
      </div>

      <main style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {exams.length === 0 ? (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '60px 40px',
            textAlign: 'center',
            boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
          }}>
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>📝</div>
            <h2 style={{ fontSize: '28px', color: '#4b5568', marginBottom: '15px' }}>
              No Exam Results Yet
            </h2>
            <p style={{ color: '#6b7280', marginBottom: '30px', maxWidth: '600px', margin: '0 auto' }}>
              You haven't completed any IELTS exams yet. Take your first test to see your scores here.
            </p>
            <Link href="/exam" style={{
              padding: '15px 40px',
              backgroundColor: '#10b981',
              color: 'white',
              borderRadius: '8px',
              textDecoration: 'none',
              fontSize: '18px',
              fontWeight: '600',
              display: 'inline-block'
            }}>
              Start Your First Test
            </Link>
          </div>
        ) : (
          <div>
            {/* Latest Exam Result */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '40px',
              marginBottom: '40px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
              border: '2px solid #e5e7eb'
            }}>
              <h2 style={{ 
                fontSize: '24px', 
                fontWeight: '600', 
                color: '#1f2937',
                marginBottom: '30px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <span style={{ 
                  backgroundColor: '#10b981',
                  color: 'white',
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  1
                </span>
                Latest Exam Result
              </h2>
              
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                gap: '25px',
                marginBottom: '40px'
              }}>
                {['listening', 'reading', 'writing', 'speaking'].map(module => {
                  const score = calculateScore(exams[0])
                  return (
                    <div key={module} style={{
                      backgroundColor: '#f8fafc',
                      borderRadius: '10px',
                      padding: '25px',
                      textAlign: 'center',
                      border: '1px solid #e2e8f0'
                    }}>
                      <div style={{ 
                        fontSize: '14px', 
                        color: '#6b7280',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        marginBottom: '10px'
                      }}>
                        {module}
                      </div>
                      <div style={{
                        fontSize: '48px',
                        fontWeight: 'bold',
                        color: '#1f2937',
                        marginBottom: '5px'
                      }}>
                        {score[module]}
                      </div>
                      <div style={{ color: '#6b7280', fontSize: '14px' }}>
                        Band Score
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Overall Band */}
              <div style={{
                backgroundColor: '#f0f9ff',
                borderRadius: '10px',
                padding: '30px',
                textAlign: 'center',
                border: '2px solid #0ea5e9'
              }}>
                <div style={{ fontSize: '16px', color: '#0369a1', marginBottom: '10px' }}>
                  OVERALL BAND SCORE
                </div>
                <div style={{ 
                  fontSize: '64px', 
                  fontWeight: 'bold', 
                  color: '#1e40af',
                  marginBottom: '10px'
                }}>
                  {calculateScore(exams[0]).overall}
                </div>
                <div style={{ color: '#6b7280' }}>
                  Based on your performance in all four modules
                </div>
              </div>
            </div>

            {/* Previous Exams */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '40px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
            }}>
              <h2 style={{ 
                fontSize: '24px', 
                fontWeight: '600', 
                color: '#1f2937',
                marginBottom: '30px'
              }}>
                📋 Exam History
              </h2>
              
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f9fafb' }}>
                      <th style={{ padding: '15px', textAlign: 'left', color: '#6b7280', fontWeight: '600', borderBottom: '2px solid #e5e7eb' }}>Date</th>
                      <th style={{ padding: '15px', textAlign: 'left', color: '#6b7280', fontWeight: '600', borderBottom: '2px solid #e5e7eb' }}>Listening</th>
                      <th style={{ padding: '15px', textAlign: 'left', color: '#6b7280', fontWeight: '600', borderBottom: '2px solid #e5e7eb' }}>Reading</th>
                      <th style={{ padding: '15px', textAlign: 'left', color: '#6b7280', fontWeight: '600', borderBottom: '2px solid #e5e7eb' }}>Writing</th>
                      <th style={{ padding: '15px', textAlign: 'left', color: '#6b7280', fontWeight: '600', borderBottom: '2px solid #e5e7eb' }}>Speaking</th>
                      <th style={{ padding: '15px', textAlign: 'left', color: '#6b7280', fontWeight: '600', borderBottom: '2px solid '#e5e7eb' }}>Overall</th>
                      <th style={{ padding: '15px', textAlign: 'left', color: '#6b7280', fontWeight: '600', borderBottom: '2px solid '#e5e7eb' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {exams.map((exam, index) => {
                      const score = calculateScore(exam)
                      const examDate = new Date(exam.exam_date).toLocaleDateString()
                      return (
                        <tr key={exam.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                          <td style={{ padding: '15px', color: '#6b7280' }}>{examDate}</td>
                          <td style={{ padding: '15px' }}>
                            <div style={{
                              backgroundColor: '#dbeafe',
                              color: '#1e40af',
                              padding: '8px 16px',
                              borderRadius: '20px',
                              display: 'inline-block',
                              fontWeight: '600'
                            }}>
                              {score.listening}
                            </div>
                          </td>
                          <td style={{ padding: '15px' }}>
                            <div style={{
                              backgroundColor: '#dcfce7',
                              color: '#166534',
                              padding: '8px 16px',
                              borderRadius: '20px',
                              display: 'inline-block',
                              fontWeight: '600'
                            }}>
                              {score.reading}
                            </div>
                          </td>
                          <td style={{ padding: '15px' }}>
                            <div style={{
                              backgroundColor: '#fef3c7',
                              color: '#92400e',
                              padding: '8px 16px',
                              borderRadius: '20px',
                              display: 'inline-block',
                              fontWeight: '600'
                            }}>
                              {score.writing}
                            </div>
                          </td>
                          <td style={{ padding: '15px' }}>
                            <div style={{
                              backgroundColor: '#fce7f3',
                              color: '#9d174d',
                              padding: '8px 16px',
                              borderRadius: '20px',
                              display: 'inline-block',
                              fontWeight: '600'
                            }}>
                              {score.speaking}
                            </div>
                          </td>
                          <td style={{ padding: '15px' }}>
                            <div style={{
                              backgroundColor: '#1f2937',
                              color: 'white',
                              padding: '8px 16px',
                              borderRadius: '20px',
                              display: 'inline-block',
                              fontWeight: 'bold',
                              fontSize: '16px'
                            }}>
                              {score.overall}
                            </div>
                          </td>
                          <td style={{ padding: '15px' }}>
                            <button
                              onClick={() => alert(`View details for exam ${exam.id}`)}
                              style={{
                                padding: '8px 16px',
                                backgroundColor: '#f3f4f6',
                                color: '#4b5563',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '14px'
                              }}
                            >
                              View Details
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Progress Chart Info */}
            <div style={{
              backgroundColor: '#f0fdf4',
              borderRadius: '12px',
              padding: '30px',
              marginTop: '40px',
              borderLeft: '4px solid #10b981'
            }}>
              <h3 style={{ color: '#065f46', marginTop: '0' }}>📈 Next Step: Progress Tracking</h3>
              <p style={{ color: '#047857' }}>
                In the next update, we'll add:
              </p>
              <ul style={{ color: '#047857', paddingLeft: '20px', lineHeight: '1.8' }}>
                <li>AI-based scoring using your answers</li>
                <li>Progress charts showing improvement over time</li>
                <li>Detailed feedback for each module</li>
                <li>Comparison with IELTS band descriptors</li>
              </ul>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
