// Utility functions for exam
import { supabase } from './supabase.js'

export async function saveAnswer(userId, examId, questionId, userAnswer, module) {
  try {
    const { data, error } = await supabase
      .from('user_responses')
      .insert({
        user_id: userId,
        exam_id: examId,
        question_id: questionId,
        user_answer: userAnswer,
        module: module,
        answered_at: new Date().toISOString()
      })

    if (error) {
      console.error('Error saving answer:', error)
      return false
    }
    return true
  } catch (err) {
    console.error('Save error:', err)
    return false
  }
}

export async function createNewExam(userId) {
  try {
    const { data, error } = await supabase
      .from('exams')
      .insert({
        user_id: userId,
        exam_date: new Date().toISOString(),
        completed: false
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating exam:', error)
      return null
    }
    return data.id
  } catch (err) {
    console.error('Create exam error:', err)
    return null
  }
}
