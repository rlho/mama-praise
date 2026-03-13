import type { VercelRequest, VercelResponse } from '@vercel/node'
import webpush from 'web-push'
import { createClient } from '@supabase/supabase-js'

const nightMessages = [
  '今日もおつかれさま。あなたは十分がんばったよ',
  '今日一日をちゃんと過ごしたね。えらいよ',
  '夜だね。今日の自分をぎゅってしてあげてね',
  '今日もいろいろあったよね。おつかれさま',
  'こんな時間まで関わってるあなた、すごいよ',
  '今日も赤ちゃんのために頑張ったね',
  '温かいもの飲んでゆっくりしてね',
  '一日の終わりに。あなたはよくやってるよ',
  '疲れたよね。今日はもう休んでいいよ',
  '明日のことは明日考えよう。今日はおしまい',
]

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Vercel Cronからの呼び出しを検証
  const authHeader = req.headers['authorization']
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  webpush.setVapidDetails(
    'mailto:rihohearts@gmail.com',
    process.env.VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
  )

  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: subs, error } = await supabase
    .from('push_subscriptions')
    .select('*')

  if (error || !subs) {
    return res.status(500).json({ error: 'Failed to fetch subscriptions' })
  }

  const msg = nightMessages[Math.floor(Math.random() * nightMessages.length)]
  const payload = JSON.stringify({
    title: 'ほめぽめ',
    body: msg,
  })

  const results = await Promise.allSettled(
    subs.map((sub) =>
      webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.keys_p256dh, auth: sub.keys_auth },
        },
        payload
      ).catch(async (err: any) => {
        if (err.statusCode === 410) {
          await supabase
            .from('push_subscriptions')
            .delete()
            .eq('endpoint', sub.endpoint)
        }
        throw err
      })
    )
  )

  const sent = results.filter((r) => r.status === 'fulfilled').length
  const failed = results.filter((r) => r.status === 'rejected').length

  return res.status(200).json({ sent, failed, total: subs.length })
}
