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
  '自分のためにここ開いただけで、えらい',
  '今日の自分にお疲れさまって言ってあげてね',
  '完璧じゃなくていいよ。生きてるだけで100点',
  'がんばったこと、全部覚えてるよ',
  '今日も一日乗り切ったね。すごいよ',
  'あなたのペースでいいからね。おやすみ',
  '今日できなかったことより、できたことを数えてね',
  '誰かに褒められなくても、自分で自分を褒めていいよ',
  '今日のあなたを、ぎゅっと抱きしめてあげたい',
  'ちゃんと頑張ってる。それ、忘れないでね',
  '今日も一日、いろいろあったね。おつかれさま',
  '赤ちゃんのいる一日って、長いよね。おつかれさま',
  '予定通りいかないのが赤ちゃんとの生活だよね',
  '赤ちゃんはあなたがいるだけで安心してるよ',
  '一緒に過ごしてるだけで、大切なことだよ',
  '赤ちゃんのいる生活、予想と違うことも多いよね',
  '今日も赤ちゃんは守られてるよ。あなたのおかげだよ',
  '今日も赤ちゃんは安心してるよ',
  '今日も赤ちゃんはちゃんと育ってるよ',
  '今日は全部できなくても大丈夫だよ',
  '今日はここまででも十分だよ',
  '明日に回しても大丈夫だよ',
  '休むのも大事な仕事だよ',
  '同じような夜を過ごしてる人がいるよ',
  '同じように迷ってる人がいるよ。一人じゃないからね',
  '「もっとやらないと」って思ってる？それ、疲れた脳の声だよ',
  '今日「できなかったこと」ばかり見てない？できたことも同じ数あるよ',
  '頭の中の「もっと頑張れ」って声、今日は少しだけ音量下げてみよう',
  '頭の中のダメ出し係、今日は少し休んでもらおう',
  '幸せとつらい気持ち、同時にあってもいいよ',
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
