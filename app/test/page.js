'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function TestPage() {
  const [result, setResult] = useState('Testing database connection...')
  const [questions, setQuestions] = useState([])

  useEffect(() => {
    checkConnection()
  }, [])

  async function checkConnection() {
    try {
      console.log('Starting Supabase test...')
      
      // Try to connect to Supabase
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .limit(20)
      
      if (error) {
        setResult('❌ ERROR: ' + error.message)
        console.error('Supabase Error:', error)
      } else {
        if (data.length > 0) {
          setResult('✅ SUCCESS! Connected to database. Found ' + data.length + ' questions.')
          setQuestions(data)
        } else {
          setResult('⚠️ Connected but database is empty. No questions found.')
        }
        console.log('Data received:', data)
      }
    } catch (err) {
      setResult('🔥 CATCH ERROR: ' + err.message)
      console.error('JavaScript Error:', err)
    }
  }

  return (
    <div style={{ 
      padding: '40px', 
      maxWidth: '900px', 
      margin: '0 auto',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <h1 style={{ 
        fontSize: '36px', 
        marginBottom: '10px',
        color: '#1a202c'
      }}>
        🎯 IELTS AI Platform
      </h1>
      <p style={{ 
        fontSize: '18px', 
        color: '#4a5568',
        marginBottom: '40px'
      }}>
        Database Connection Test
      </p>
      
      {/* Status Card */}
      <div style={{
        padding: '25px',
        borderRadius: '12px',
        backgroundColor: result.includes('✅') ? '#f0fff4' : 
                        result.includes('❌') ? '#fff5f5' : '#fefcbf',
        border: result.includes('✅') ? '2px solid #38a169' : 
               result.includes('❌') ? '2px solid #e53e3e' : '2px solid #d69e2e',
        marginBottom: '40px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          marginBottom: '15px' 
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: result.includes('✅') ? '#38a169' : 
                            result.includes('❌') ? '#e53e3e' : '#d69e2e',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: '15px',
            color: 'white',
            fontSize: '20px',
            fontWeight: 'bold'
          }}>
            {result.includes('✅') ? '✓' : result.includes('❌') ? '✗' : '?'}
          </div>
          <h2 style={{ 
            margin: '0',
            fontSize: '22px',
            color: result.includes('✅') ? '#276749' : 
                   result.includes('❌') ? '#c53030' : '#975a16'
          }}>
            {result}
          </h2>
        </div>
        
        <button 
          onClick={checkConnection}
          style={{
            padding: '12px 24px',
            backgroundColor: '#4299e1',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: '600',
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = '#3182ce'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#4299e1'}
        >
          🔄 Test Again
        </button>
      </div>

      {/* Questions Display */}
      {questions.length > 0 && (
        <div>
          <h2 style={{ 
            fontSize: '26px', 
            marginBottom: '20px',
            color: '#2d3748'
          }}>
            📚 Questions from Database:
          </h2>
          <div style={{ 
            display: 'grid', 
            gap: '20px'
          }}>
            {questions.map((q, index) => (
              <div key={index} style={{
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '25px',
                backgroundColor: 'white',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                transition: 'transform 0.2s'
              }}
              onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
              onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
              >
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  marginBottom: '15px'
                }}>
                  <span style={{
                    backgroundColor: '#4299e1',
                    color: 'white',
                    padding: '6px 16px',
                    borderRadius: '20px',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    textTransform: 'uppercase'
                  }}>
                    {q.module || 'No Module'}
                  </span>
                  <div style={{
                    display: 'flex',
                    gap: '10px',
                    alignItems: 'center'
                  }}>
                    <span style={{
                      backgroundColor: '#edf2f7',
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '14px',
                      color: '#4a5568'
                    }}>
                      Band {q.band_level || 'N/A'}
                    </span>
                    <span style={{
                      backgroundColor: '#f7fafc',
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      color: '#718096',
                      border: '1px solid #e2e8f0'
                    }}>
                      {q.question_type || 'No Type'}
                    </span>
                  </div>
                </div>
                <p style={{ 
                  margin: '0',
                  fontSize: '18px',
                  lineHeight: '1.6',
                  color: '#2d3748'
                }}>
                  {q.question_text || 'No question text available'}
                </p>
                {q.correct_answer && (
                  <div style={{
                    marginTop: '15px',
                    padding: '12px',
                    backgroundColor: '#f0fff4',
                    borderRadius: '8px',
                    borderLeft: '4px solid #38a169'
                  }}>
                    <strong style={{ color: '#276749' }}>Correct Answer:</strong>
                    <p style={{ margin: '5px 0 0 0', color: '#2f855a' }}>
                      {q.correct_answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Troubleshooting Guide */}
      <div style={{ 
        marginTop: '50px', 
        padding: '25px', 
        backgroundColor: '#f7fafc', 
        borderRadius: '12px',
        border: '2px solid #e2e8f0'
      }}>
        <h3 style={{ 
          marginTop: '0', 
          color: '#2d3748', 
          fontSize: '22px',
          marginBottom: '15px'
        }}>
          🔧 Troubleshooting Guide
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          <div>
            <h4 style={{ color: '#4a5568', marginBottom: '10px' }}>If you see ERROR:</h4>
            <ul style={{ paddingLeft: '20px', color: '#718096', lineHeight: '1.6' }}>
              <li>Check <code>lib/supabase.js</code> file</li>
              <li>Verify Supabase URL and Key are correct</li>
              <li>Ensure Supabase project is active</li>
              <li>Check browser console (F12) for errors</li>
            </ul>
          </div>
          <div>
            <h4 style={{ color: '#4a5568', marginBottom: '10px' }}>If database is empty:</h4>
            <ul style={{ paddingLeft: '20px', color: '#718096', lineHeight: '1.6' }}>
              <li>Create <code>questions</code> table in Supabase</li>
              <li>Add sample IELTS questions</li>
              <li>Run SQL in Supabase SQL Editor</li>
            </ul>
          </div>
        </div>
        <div style={{ 
          marginTop: '20px', 
          padding: '15px', 
          backgroundColor: '#ebf8ff',
          borderRadius: '8px',
          borderLeft: '4px solid #4299e1'
        }}>
          <strong style={{ color: '#2c5282' }}>Next Step:</strong>
          <p style={{ margin: '5px 0 0 0', color: '#2b6cb0' }}>
            Once connection is ✅ successful, we'll build the login system!
          </p>
        </div>
      </div>
    </div>
  )
}
