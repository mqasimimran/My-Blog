import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function getBoard(token: string) {
  if (!/^[a-f0-9]{16,64}$/.test(token)) return null
  const { data } = await supabaseAdmin.from('feedback_boards').select('id, title, client_name, image_url, status, approved_name, approved_at').eq('public_token', token).maybeSingle()
  return data
}
export async function getComments(boardId: string) {
  const { data } = await supabaseAdmin.from('feedback_comments').select('id, x, y, body, author_name, from_owner, resolved, created_at').eq('board_id', boardId).order('created_at')
  return data || []
}
