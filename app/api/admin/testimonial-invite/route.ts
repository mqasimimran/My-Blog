import { NextRequest, NextResponse } from 'next/server'
import { requireAdminSession } from '@/lib/requireAdminSession'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { inviteToken } from '@/lib/testimonialInvite'
import { loadWorks } from '@/lib/testimonialWork'

export async function GET(request: NextRequest) {
  const unauthorized = await requireAdminSession()
  if (unauthorized) return unauthorized
  const work = request.nextUrl.searchParams.get('work') || ''
  if (!(await loadWorks(supabaseAdmin, work)).length) return NextResponse.json({error:'Work is unavailable.'}, {status:400})
  const {data} = await supabaseAdmin.from('private_settings').select('testimonial_invite_code').eq('id',1).single()
  if (!data?.testimonial_invite_code) return NextResponse.json({error:'Create an invite link first.'},{status:400})
  return NextResponse.json({token:inviteToken(data.testimonial_invite_code,work)})
}
