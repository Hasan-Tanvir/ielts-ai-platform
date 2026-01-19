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
  }, [])

  async function checkUser() {
    const { data } = await supabase.auth.getUser()
    if (!data.user) {
      router.push('/login')
    } else {
      setUser(data.user)
      fetchUserExams(data.user.id)
    }
  }

  async function fetchUserExams(userId) {
    const { data, error } = await supabase
      .from('exams')
      .select('*')
      .eq('user_id', userId)
      .order('exam_date', { ascending: false })
    
    if (!error && data) {
      setExams(data)
    }
    setLoading(false)
  }

  // Get latest completed exam
  const latestExam = exams.find(exam => exam.completed) || exams[0]

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px' }}>
        <p>Loading results...</p>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa', padding: '20px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', marginBottom: '40px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#1a202c' }}>📊 IELTS Test Results</h1>
          <p style={{ color: '#6b7280' }}>Your exam scores and progress</p>
          
          <div style={{ display: 'flex', gap: '15px', marginTop: '20px' }}>
            <Link href="/dashboard" style={{ padding: '12px 24px', backgroundColor: '#f3f4f6', color: '#4b5563', borderRadius: '8px', textDecoration: 'none' }}>
              ← Dashboard
            </Link>
            <Link href="/exam" style={{ padding: '12px 24px', backgroundColor: '#3b82f6', color: 'white', borderRadius: '8px', textDecoration: 'none' }}>
              Take New Test
            </Link>
          </div>
        </div>

        {exams.length === 0 ? (
          <div style={{ backgroundColor: 'white', padding: '60px 40px', borderRadius: '12px', textAlign: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>📝</div>
            <h2 style={{ fontSize: '28px', color: '#4b5568', marginBottom: '15px' }}>No Exams Yet</h2>
            <p style={{ color: '#6b7280', marginBottom: '30px' }}>Complete your first IELTS exam to see results here.</p>
            <Link href="/exam" style={{ padding: '15px 40px', backgroundColor: '#10b981', color: 'white', borderRadius: '8px', textDecoration: 'none', fontSize: '18px', fontWeight: '600' }}>
              Start Your First Test
            </Link>
          </div>
        ) : (
          <div>
            {/* Latest Exam Card */}
            <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '12px', marginBottom: '40px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
              <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#1f2937', marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ backgroundColor: '#10b981', color: 'white', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  🎯
                </span>
                Latest Exam Results
                <span style={{ fontSize: '14px', color: '#6b7280', marginLeft: 'auto' }}>
                  {latestExam ? new Date(latestExam.exam_date).toLocaleDateString() : ''}
                </span>
              </h2>
              
              {/* Scores Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '25px', marginBottom: '40px' }}>
                {[
                  { module: 'Listening', score: latestExam?.listening_score || 'N/A', color: '#3b82f6' },
                  { module: 'Reading', score: latestExam?.reading_score || 'N/A', color: '#10b981' },
                  { module: 'Writing', score: latestExam?.writing_score || 'N/A', color: '#f59e0b' },
                  { module: 'Speaking', score: latestExam?.speaking_score || 'N/A', color: '#8b5cf6' }
                ].map((item) => (
                  <div key={item.module} style={{ backgroundColor: '#f8fafc', padding: '25px', borderRadius: '10px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '10px', textTransform: 'uppercase' }}>
                      {item.module}
                    </div>
                    <div style={{ fontSize: '48px', fontWeight: 'bold', color: item.score === 'N/A' ? '#9ca3af' : item.color }}>
                      {item.score}
                    </div>
                    <div style={{ color: '#9ca3af', fontSize: '14px' }}>
                      Band Score
                    </div>
                  </div>
                ))}
              </div>

              {/* Overall Score */}
              <div style={{ backgroundColor: '#f0f9ff', padding: '30px', borderRadius: '10px', textAlign: 'center', border: '2px solid #0ea5e9' }}>
                <div style={{ fontSize: '16px', color: '#0369a1', marginBottom: '10px', textTransform: 'uppercase' }}>
                  Overall Band Score
                </div>
                <div style={{ fontSize: '64px', fontWeight: 'bold', color: '#1e40af', marginBottom: '10px' }}>
                  {latestExam?.overall_band || 'N/A'}
                </div>
                <div style={{ color: '#6b7280' }}>
                  {latestExam?.completed ? 'Exam Completed' : 'Exam in Progress'}
                </div>
              </div>
            </div>

            {/* Exam History */}
            <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
              <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#1f2937', marginBottom: '30px' }}>
                📋 Your Exam History ({exams.length})
              </h2>
              
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f9fafb' }}>
                      <th style={{ padding: '15px', textAlign: 'left', color: '#6b7280', fontWeight: '600', borderBottom: '2px solid #e5e7eb' }}>Date</th>
                      <th style={{ padding: '15px', textAlign: 'left', color: '#6b7280', fontWeight: '600', borderBottom: '2px solid #e5e7eb' }}>Status</th>
                      <th style={{ padding: '15px', textAlign: 'left', color: '#6b7280', fontWeight: '600', borderBottom: '2px solid #e5e7eb' }}>Listening</th>
                      <th style={{ padding: '15px', textAlign: 'left', color: '#6b7280', fontWeight: '600', borderBottom: '2px solid #e5e7eb' }}>Reading</th>
                      <th style={{ padding: '15px', textAlign: 'left', color: '#6b7280', fontWeight: '600', borderBottom: '2px solid #e5e7eb' }}>Writing</th>
                      <th style={{ padding: '15px', textAlign: 'left', color: '#6b7280', fontWeight: '600', borderBottom: '2px solid #e5e7eb' }}>Speaking</th>
                      <th style={{ padding: '15px', textAlign: 'left', color: '#6b7280', fontWeight: '600', borderBottom: '2px solid #e5e7eb' }}>Overall</th>
                    </tr>
                  </thead>
                  <tbody>
                    {exams.map((exam) => (
                      <tr key={exam.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                        <td style={{ padding: '15px', color: '#6b7280' }}>
                          {new Date(exam.exam_date).toLocaleDateString()}
                        </td>
                        <td style={{ padding: '15px' }}>
                          <span style={{
                            backgroundColor: exam.completed ? '#d1fae5' : '#fef3c7',
                            color: exam.completed ? '#065f46' : '#92400e',
                            padding: '6px 12px',
                            borderRadius: '20px',
                            fontSize: '12px',
                            fontWeight: '600'
                          }}>
                            {exam.completed ? '✅ Completed' : '⏳ In Progress'}
                          </span>
                        </td>
                        {['listening_score', 'reading_score', 'writing_score', 'speaking_score', 'overall_band'].map((field) => (
                          <td key={field} style={{ padding: '15px' }}>
                            <div style={{
                              backgroundColor: exam[field] ? '#dbeafe' : '#f3f4f6',
                              color: exam[field] ? '#1e40af' : '#9ca3af',
                              padding: '8px 16px',
                              borderRadius: '20px',
                              display: 'inline-block',
                              fontWeight: '600',
                              minWidth: '60px',
                              textAlign: 'center'
                            }}>
                              {exam[field] || 'N/A'}
                            </div>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Next Steps */}
            <div style={{ backgroundColor: '#f0fdf4', padding: '30px', borderRadius: '12px', marginTop: '40px', borderLeft: '4px solid #10b981' }}>
              <h3 style={{ color: '#065f46', marginTop: '0' }}>🎯 Next: AI Scoring</h3>
              <p style={{ color: '#047857' }}>
                In the next update, we'll add AI to:
              </p>
              <ul style={{ color: '#047857', paddingLeft: '20px', lineHeight: '1.8' }}>
                <li>Analyze your writing and speaking answers</li>
                <li>Calculate real band scores based on IELTS criteria</li>
                <li>Provide detailed feedback for improvement</li>
                <li>Track progress over time with charts</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
