'use client'

import { useState } from 'react'
import { scoreIELTSWriting, scoreIELTSSpeaking } from '@/lib/gemini-scorer'

export default function AIScoringDemo() {
  const [writingEssay, setWritingEssay] = useState('Technology has made education more accessible. Students can now learn from anywhere using online platforms. However, some argue that traditional classrooms provide better interaction.')
  const [speakingResponse, setSpeakingResponse] = useState('I believe technology is very important for education because it allows people to access information easily and learn at their own pace. For example, online courses help working professionals study after work.')
  const [writingResult, setWritingResult] = useState(null)
  const [speakingResult, setSpeakingResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const evaluateWriting = async () => {
    setLoading(true)
    const result = await scoreIELTSWriting(writingEssay, 'task2')
    setWritingResult(result)
    setLoading(false)
  }

  const evaluateSpeaking = async () => {
    setLoading(true)
    const result = await scoreIELTSSpeaking(speakingResponse, 'How has technology changed education?')
    setSpeakingResult(result)
    setLoading(false)
  }

  return (
    <div style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '36px', marginBottom: '10px' }}>🎯 IELTS AI Scoring Demo</h1>
      <p style={{ color: '#666', marginBottom: '40px' }}>Real AI evaluation using Gemini 3 Flash</p>

      {/* Writing Section */}
      <div style={{ marginBottom: '50px' }}>
        <h2 style={{ fontSize: '24px', marginBottom: '20px' }}>✍️ Writing Task 2 Evaluation</h2>
        <textarea
          value={writingEssay}
          onChange={(e) => setWritingEssay(e.target.value)}
          style={{
            width: '100%',
            height: '150px',
            padding: '15px',
            border: '2px solid #4CAF50',
            borderRadius: '8px',
            fontSize: '16px',
            marginBottom: '20px'
          }}
          placeholder="Enter IELTS Writing Task 2 essay..."
        />
        <button
          onClick={evaluateWriting}
          disabled={loading}
          style={{
            padding: '15px 30px',
            backgroundColor: loading ? '#999' : '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'AI Evaluating...' : 'Evaluate Writing with AI'}
        </button>

        {writingResult && (
          <div style={{
            backgroundColor: writingResult.success ? '#d4edda' : '#fff3cd',
            padding: '25px',
            borderRadius: '10px',
            marginTop: '25px',
            border: `2px solid ${writingResult.success ? '#28a745' : '#ffc107'}`
          }}>
            <h3 style={{ marginTop: '0', color: writingResult.success ? '#155724' : '#856404' }}>
              {writingResult.success ? '✅ AI Writing Evaluation' : '⚠️ Estimated Score'}
            </h3>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(2, 1fr)', 
              gap: '20px',
              marginBottom: '25px'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '14px', color: '#666' }}>Task Achievement</div>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#2196F3' }}>{writingResult.task_achievement}</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '14px', color: '#666' }}>Coherence</div>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#4CAF50' }}>{writingResult.coherence}</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '14px', color: '#666' }}>Vocabulary</div>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#FF9800' }}>{writingResult.vocabulary}</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '14px', color: '#666' }}>Grammar</div>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#9C27B0' }}>{writingResult.grammar}</div>
              </div>
            </div>

            <div style={{
              backgroundColor: '#e3f2fd',
              padding: '20px',
              borderRadius: '8px',
              textAlign: 'center',
              marginBottom: '20px'
            }}>
              <div style={{ fontSize: '16px', color: '#1976d2' }}>OVERALL WRITING BAND</div>
              <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#0d47a1' }}>{writingResult.overall}</div>
            </div>

            <div>
              <div style={{ fontSize: '16px', color: '#333', marginBottom: '10px' }}>📝 AI Feedback:</div>
              <p style={{ color: '#555', lineHeight: '1.6', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                {writingResult.feedback}
              </p>
            </div>

            {writingResult.isFallback && (
              <div style={{ 
                backgroundColor: '#fff3cd', 
                padding: '10px', 
                borderRadius: '5px',
                marginTop: '15px',
                fontSize: '14px',
                color: '#856404'
              }}>
                ⚠️ Using estimated scores. Real AI scoring may vary.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Speaking Section */}
      <div>
        <h2 style={{ fontSize: '24px', marginBottom: '20px' }}>🎤 Speaking Evaluation</h2>
        <textarea
          value={speakingResponse}
          onChange={(e) => setSpeakingResponse(e.target.value)}
          style={{
            width: '100%',
            height: '120px',
            padding: '15px',
            border: '2px solid #9C27B0',
            borderRadius: '8px',
            fontSize: '16px',
            marginBottom: '20px'
          }}
          placeholder="Enter speaking response..."
        />
        <button
          onClick={evaluateSpeaking}
          disabled={loading}
          style={{
            padding: '15px 30px',
            backgroundColor: loading ? '#999' : '#9C27B0',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'AI Evaluating...' : 'Evaluate Speaking with AI'}
        </button>

        {speakingResult && (
          <div style={{
            backgroundColor: speakingResult.success ? '#d4edda' : '#fff3cd',
            padding: '25px',
            borderRadius: '10px',
            marginTop: '25px',
            border: `2px solid ${speakingResult.success ? '#28a745' : '#ffc107'}`
          }}>
            <h3 style={{ marginTop: '0', color: speakingResult.success ? '#155724' : '#856404' }}>
              {speakingResult.success ? '✅ AI Speaking Evaluation' : '⚠️ Estimated Score'}
            </h3>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(2, 1fr)', 
              gap: '20px',
              marginBottom: '25px'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '14px', color: '#666' }}>Fluency</div>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#2196F3' }}>{speakingResult.fluency}</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '14px', color: '#666' }}>Vocabulary</div>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#4CAF50' }}>{speakingResult.vocabulary}</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '14px', color: '#666' }}>Grammar</div>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#FF9800' }}>{speakingResult.grammar}</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '14px', color: '#666' }}>Pronunciation</div>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#9C27B0' }}>{speakingResult.pronunciation}</div>
              </div>
            </div>

            <div style={{
              backgroundColor: '#f3e5f5',
              padding: '20px',
              borderRadius: '8px',
              textAlign: 'center',
              marginBottom: '20px'
            }}>
              <div style={{ fontSize: '16px', color: '#7b1fa2' }}>OVERALL SPEAKING BAND</div>
              <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#4a148c' }}>{speakingResult.overall}</div>
            </div>

            <div>
              <div style={{ fontSize: '16px', color: '#333', marginBottom: '10px' }}>💬 AI Feedback:</div>
              <p style={{ color: '#555', lineHeight: '1.6', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                {speakingResult.feedback}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Next Steps */}
      <div style={{
        backgroundColor: '#e3f2fd',
        padding: '25px',
        borderRadius: '10px',
        marginTop: '50px',
        borderLeft: '4px solid #2196F3'
      }}>
        <h3 style={{ color: '#0d47a1', marginTop: '0' }}>🚀 Next: Integrate into Exam</h3>
        <p style={{ color: '#1976d2' }}>This AI scoring will be integrated into:</p>
        <ul style={{ color: '#1976d2', paddingLeft: '20px', lineHeight: '1.8' }}>
          <li>Real exam completion with AI evaluation</li>
          <li>Automatic band score calculation</li>
          <li>Detailed feedback for improvement</li>
          <li>Progress tracking over time</li>
        </ul>
        <div style={{ marginTop: '20px' }}>
          <a href="/exam" style={{
            padding: '12px 24px',
            backgroundColor: '#2196F3',
            color: 'white',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: 'bold',
            display: 'inline-block'
          }}>
            Go to Exam Page →
          </a>
        </div>
      </div>
    </div>
  )
}
