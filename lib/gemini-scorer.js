// Gemini AI Scorer for IELTS
const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent'

export async function scoreIELTSWriting(answer, taskType = 'task2') {
  try {
    const prompt = `You are an IELTS examiner. Evaluate this Writing Task ${taskType === 'task1' ? 1 : 2}:

    "${answer.substring(0, 500)}"

    Provide scores (1-9) for:
    1. Task Achievement/Response
    2. Coherence and Cohesion
    3. Lexical Resource
    4. Grammatical Range and Accuracy

    Calculate overall band (average, rounded to nearest 0.5).
    
    Return ONLY JSON format:
    {
      "task_achievement": number,
      "coherence": number,
      "vocabulary": number,
      "grammar": number,
      "overall": number,
      "feedback": "string with specific feedback"
    }`

    const response = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 300
        }
      })
    })

    const data = await response.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}'
    
    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const result = JSON.parse(jsonMatch[0])
      return {
        success: true,
        ...result,
        raw: data
      }
    } else {
      // Fallback if JSON parsing fails
      return getFallbackScore(answer)
    }
  } catch (error) {
    console.error('AI Scoring Error:', error)
    return getFallbackScore(answer)
  }
}

export async function scoreIELTSSpeaking(answer, question) {
  try {
    const prompt = `Evaluate this IELTS Speaking response:

    Question: ${question}
    Response: "${answer}"

    Score (1-9) for:
    1. Fluency and Coherence
    2. Lexical Resource
    3. Grammatical Range
    4. Pronunciation

    Overall band (average, rounded to 0.5).
    
    Return ONLY JSON:
    {
      "fluency": number,
      "vocabulary": number,
      "grammar": number,
      "pronunciation": number,
      "overall": number,
      "feedback": "string"
    }`

    const response = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 300
        }
      })
    })

    const data = await response.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}'
    
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return {
        success: true,
        ...JSON.parse(jsonMatch[0]),
        raw: data
      }
    } else {
      return getFallbackSpeakingScore(answer)
    }
  } catch (error) {
    console.error('Speaking Scoring Error:', error)
    return getFallbackSpeakingScore(answer)
  }
}

// Helper functions
function getFallbackScore(answer) {
  const length = answer.length
  let score = 5.5
  
  if (length > 200) score += 0.5
  if (length > 300) score += 0.5
  if (answer.includes('however') || answer.includes('therefore')) score += 0.5
  
  return {
    success: false,
    task_achievement: score,
    coherence: score - 0.5,
    vocabulary: score,
    grammar: score - 0.5,
    overall: score,
    feedback: 'AI scoring unavailable. Using estimate based on length and structure.',
    isFallback: true
  }
}

function getFallbackSpeakingScore(answer) {
  const length = answer.length
  let score = 5.5
  
  if (length > 100) score += 0.5
  if (answer.includes('I think') || answer.includes('In my opinion')) score += 0.5
  
  return {
    success: false,
    fluency: score,
    vocabulary: score - 0.5,
    grammar: score,
    pronunciation: score - 0.5,
    overall: score,
    feedback: 'AI scoring unavailable. Basic evaluation applied.',
    isFallback: true
  }
}

// Calculate overall exam score
export function calculateOverallBand(scores) {
  const validScores = Object.values(scores).filter(s => typeof s === 'number' && s > 0)
  if (validScores.length === 0) return 6.0
  
  const average = validScores.reduce((a, b) => a + b, 0) / validScores.length
  return Math.round(average * 2) / 2
}
