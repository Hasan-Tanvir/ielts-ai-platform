// IELTS AI Orchestrator - Gemini + DeepSeek

// Configuration
const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY
const DEEPSEEK_API_KEY = process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash:generateContent'
const DEEPSEEK_URL = 'https://api.deepseek.com/v1/chat/completions'

// ======================
// 1. QUESTION GENERATION
// ======================

export async function generateIELTSQuestion(module, bandLevel = 6) {
  const prompts = {
    listening: `Generate an IELTS Listening section question for Band ${bandLevel}. 
                Include: 1) A short dialogue/lecture transcript, 2) 4 multiple choice questions, 
                3) Correct answers. Format as JSON: {transcript: string, questions: array, answers: array}`,
    
    reading: `Generate an IELTS Reading passage for Band ${bandLevel} on academic topic.
              Include: 1) 250-word passage, 2) 5 True/False/Not Given questions,
              3) Answers. Format as JSON: {passage: string, questions: array, answers: array}`,
    
    writing: `Generate IELTS Writing Task 1 for Band ${bandLevel}. 
              Describe a chart/graph/diagram with: 1) Description of visual, 
              2) Key features to mention, 3) Sample answer structure.
              Format as JSON: {task_description: string, visual_description: string, key_features: array, sample_structure: string}`,
    
    speaking: `Generate IELTS Speaking Part 2 topic for Band ${bandLevel}.
               Include: 1) Topic card, 2) Key points to cover, 3) Sample response outline.
               Format as JSON: {topic: string, instructions: string, key_points: array, sample_outline: string}`
  }

  try {
    const response = await fetch(
      `${GEMINI_URL}?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompts[module] }]
          }]
        })
      }
    )
    
    const data = await response.json()
    const text = data.candidates[0].content.parts[0].text
    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    return jsonMatch ? JSON.parse(jsonMatch[0]) : { error: 'No JSON found' }
  } catch (error) {
    console.error('Question generation error:', error)
    return generateFallbackQuestion(module, bandLevel)
  }
}

// ======================
// 2. SPEAKING TEST
// ======================

export async function conductSpeakingTest(question, userResponse) {
  // Gemini can evaluate speaking responses
  const prompt = `Evaluate this IELTS Speaking response:
  
  Question: ${question}
  Candidate Response: ${userResponse}
  
  Evaluate based on:
  1. Fluency and Coherence (0-9)
  2. Lexical Resource (0-9) 
  3. Grammatical Range (0-9)
  4. Pronunciation (0-9)
  
  Provide overall band score (0-9) and specific feedback.
  Format as JSON: {fluency: number, vocabulary: number, grammar: number, pronunciation: number, overall: number, feedback: string}`

  try {
    const response = await fetch(
      `${GEMINI_URL}?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }]
        })
      }
    )
    
    const data = await response.json()
    const text = data.candidates[0].content.parts[0].text
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    return jsonMatch ? JSON.parse(jsonMatch[0]) : getFallbackSpeakingScore(userResponse)
  } catch (error) {
    console.error('Speaking evaluation error:', error)
    return getFallbackSpeakingScore(userResponse)
  }
}

// ======================
// 3. WRITING EVALUATION (DeepSeek)
// ======================

export async function evaluateWritingTask(answer, taskType) {
  const prompt = `Evaluate this IELTS Writing response (Task ${taskType === 'task1' ? 1 : 2}):
  
  Response: ${answer}
  
  Use official IELTS criteria:
  1. Task Achievement/Response (0-9)
  2. Coherence and Cohesion (0-9)
  3. Lexical Resource (0-9)
  4. Grammatical Range and Accuracy (0-9)
  
  Calculate overall band score (average, rounded to nearest 0.5).
  Provide specific feedback for improvement.
  
  Format as JSON: {task_achievement: number, coherence: number, vocabulary: number, grammar: number, overall: number, feedback: string}`

  try {
    const response = await fetch(DEEPSEEK_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3
      })
    })
    
    const data = await response.json()
    const text = data.choices[0].message.content
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    return jsonMatch ? JSON.parse(jsonMatch[0]) : getFallbackWritingScore(answer)
  } catch (error) {
    console.error('Writing evaluation error:', error)
    return getFallbackWritingScore(answer)
  }
}

// ======================
// 4. READING/LISTENING SCORING
// ======================

export function scoreMultipleChoice(userAnswers, correctAnswers) {
  let correct = 0
  const results = []
  
  userAnswers.forEach((answer, index) => {
    const isCorrect = answer?.trim().toLowerCase() === correctAnswers[index]?.trim().toLowerCase()
    if (isCorrect) correct++
    results.push({
      question: index + 1,
      userAnswer: answer,
      correctAnswer: correctAnswers[index],
      isCorrect
    })
  })
  
  // Convert to IELTS band (simplified)
  const percentage = (correct / correctAnswers.length) * 100
  const band = calculateBandFromPercentage(percentage)
  
  return {
    correct,
    total: correctAnswers.length,
    percentage,
    band,
    details: results
  }
}

// ======================
// 5. HELPER FUNCTIONS
// ======================

function calculateBandFromPercentage(percentage) {
  const bands = [
    { min: 0, max: 14, band: 4.0 },
    { min: 15, max: 24, band: 4.5 },
    { min: 25, max: 34, band: 5.0 },
    { min: 35, max: 44, band: 5.5 },
    { min: 45, max: 54, band: 6.0 },
    { min: 55, max: 64, band: 6.5 },
    { min: 65, max: 74, band: 7.0 },
    { min: 75, max: 84, band: 7.5 },
    { min: 85, max: 94, band: 8.0 },
    { min: 95, max: 100, band: 8.5 }
  ]
  
  const match = bands.find(b => percentage >= b.min && percentage <= b.max)
  return match ? match.band : 5.0
}

function getFallbackSpeakingScore(response) {
  const length = response.length
  let score = 5.0
  if (length > 100) score += 1.0
  if (length > 200) score += 0.5
  if (response.includes('.')) score += 0.5
  return {
    fluency: score,
    vocabulary: score - 0.5,
    grammar: score,
    pronunciation: score - 0.5,
    overall: score,
    feedback: 'Basic response. Try to use more complex sentences and vocabulary.'
  }
}

function getFallbackWritingScore(response) {
  const length = response.length
  let score = 5.0
  if (length > 150) score += 0.5
  if (length > 250) score += 0.5
  if (response.includes('however') || response.includes('therefore')) score += 0.5
  return {
    task_achievement: score,
    coherence: score,
    vocabulary: score - 0.5,
    grammar: score,
    overall: score,
    feedback: 'Adequate response. Work on task achievement and vocabulary range.'
  }
}

function generateFallbackQuestion(module, bandLevel) {
  // Fallback questions if AI fails
  const fallbacks = {
    listening: {
      transcript: "Man: I'm thinking of joining the gym. Woman: The one on Main Street has good equipment. Man: Do they have a swimming pool? Woman: No, but the one on Oak Street does.",
      questions: ["Where is the gym with good equipment?", "Which gym has a swimming pool?"],
      answers: ["Main Street", "Oak Street"]
    },
    reading: {
      passage: "Climate change affects global weather patterns. Rising temperatures lead to melting ice caps and sea level rise.",
      questions: ["Climate change affects weather patterns.", "Sea levels are falling."],
      answers: ["True", "False"]
    }
  }
  return fallbacks[module] || { error: 'No question generated' }
}

// ======================
// 6. FULL EXAM SCORING
// ======================

export async function calculateFullExamScores(examData) {
  const scores = {
    listening: { band: 0, details: {} },
    reading: { band: 0, details: {} },
    writing: { band: 0, details: {} },
    speaking: { band: 0, details: {} }
  }
  
  // Calculate each module
  if (examData.listeningAnswers) {
    scores.listening = scoreMultipleChoice(examData.listeningAnswers, examData.listeningCorrect)
  }
  
  if (examData.readingAnswers) {
    scores.reading = scoreMultipleChoice(examData.readingAnswers, examData.readingCorrect)
  }
  
  if (examData.writingAnswer) {
    scores.writing = await evaluateWritingTask(examData.writingAnswer, examData.writingTask)
  }
  
  if (examData.speakingAnswer) {
    scores.speaking = await conductSpeakingTest(examData.speakingQuestion, examData.speakingAnswer)
  }
  
  // Calculate overall band
  const moduleBands = [
    scores.listening.band,
    scores.reading.band,
    scores.writing.overall || 0,
    scores.speaking.overall || 0
  ].filter(b => b > 0)
  
  const average = moduleBands.reduce((a, b) => a + b, 0) / moduleBands.length
  const overallBand = Math.round(average * 2) / 2
  
  return {
    ...scores,
    overallBand,
    summary: `IELTS Band Score: ${overallBand}`
  }
}
