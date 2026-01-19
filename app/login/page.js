'use client'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) router.push('/dashboard')
      setLoading(false)
    })

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event) => { if (event === 'SIGNED_IN') router.push('/dashboard') }
    )

    return () => { authListener?.subscription.unsubscribe() }
  }, [router])

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <p>Loading...</p>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: '400px', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', padding: '40px' }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1f2937', marginBottom: '10px' }}>🎯 IELTS AI Platform</h1>
          <p style={{ color: '#6b7280' }}>Sign in to start your IELTS preparation</p>
        </div>
        <Auth supabaseClient={supabase} appearance={{ theme: ThemeSupa }} theme="light" providers={['google', 'github']} />
        <div style={{ marginTop: '30px', textAlign: 'center' }}>
          <Link href="/test" style={{ color: '#3b82f6', textDecoration: 'none' }}>← Back to Test Page</Link>
        </div>
      </div>
    </div>
  )
}
