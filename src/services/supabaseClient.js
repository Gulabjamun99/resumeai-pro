import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://whbwcgonvqodwqlnmiiv.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndoYndjZ29udnFvZHdxbG5taWl2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM2ODYzNDAsImV4cCI6MjA5OTI2MjM0MH0.CoWiCkKR6_upVFFkh9efRAgvffmLhThsCgPhRJuoj6E';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
