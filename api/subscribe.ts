import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'DELETE') {
    const { endpoint } = req.body
    if (!endpoint) return res.status(400).json({ error: 'Missing endpoint' })

    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    await supabase.from('push_subscriptions').delete().eq('endpoint', endpoint)
    return res.status(200).json({ ok: true })
  }

  if (req.method !== 'POST') return res.status(405).end()

  const { subscription, userId } = req.body
  if (!subscription?.endpoint || !subscription?.keys) {
    return res.status(400).json({ error: 'Invalid subscription' })
  }

  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { error } = await supabase.from('push_subscriptions').upsert(
    {
      endpoint: subscription.endpoint,
      keys_p256dh: subscription.keys.p256dh,
      keys_auth: subscription.keys.auth,
      user_id: userId || null,
    },
    { onConflict: 'endpoint' }
  )

  if (error) return res.status(500).json({ error: error.message })
  return res.status(200).json({ ok: true })
}
