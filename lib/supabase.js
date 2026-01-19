// Supabase connection with YOUR keys
import { createClient } from '@supabase/supabase-js'

// HASAN'S SUPABASE KEYS
const supabaseUrl = 'https://skveouyoxwlwhhuyaclk.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNrdmVvdXlveHdsd2hodXlhY2xrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg4MDU1NjcsImV4cCI6MjA4NDM4MTU2N30.2wObQyCApfbF-yuQzxm2MwuusqKlMG-vh6PUP5E-xQc'

// Create connection
const supabase = createClient(supabaseUrl, supabaseKey)

// Export it
export { supabase }
