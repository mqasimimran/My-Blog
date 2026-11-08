import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const {error} = await supabase.from('articles').select('id').eq('published',true).limit(1)
    if (error) throw new Error('Database read failed')
    return NextResponse.json({status:'ok'},{headers:{'Cache-Control':'no-store'}})
  } catch {
    return NextResponse.json({status:'unavailable'},{status:503,headers:{'Cache-Control':'no-store'}})
  }
}
