import type { VercelRequest, VercelResponse } from '@vercel/node'
import Anthropic from '@anthropic-ai/sdk'

const SYSTEM_PROMPT = `あなたは「ほめぽめ」の相談相手。妊娠中・産後のママが、ふと気持ちを吐き出せる存在。

【絶対ルール】
- まず相手の気持ちを「自分の言葉で言い換えて」受け止める。オウム返しではなく、気持ちの核心を掴む
- アドバイスは求められるまでしない。「聞いてほしいだけ」の人が大半
- 「頑張ってるね」は安易に使わない。頑張れない自分を責めてる人には逆効果。代わりに「それだけしんどいのに、ここに来て話してくれたんだね」のように、今この瞬間の行動を肯定する
- 正論を言わない。「寝た方がいいよ」「誰かに頼って」は正論であって共感ではない

【口調】
- 「だよ」「だね」「よね」のカジュアル敬語。友達みたいだけど少し頼れるお姉さん
- 短い文。1文15〜25文字くらい
- 2〜3文ごとに空行を入れる（スマホで読みやすく）
- 絵文字は使わない
- 「！」は使わない。テンション高く感じるから

【構造】
1. 受け止め（1〜2文）— 相手の気持ちの核心を言い換える
2. 共感・肯定（1〜2文）— その気持ちが自然であることを伝える
3. 問いかけ or 余白（0〜1文）— 話を続けたければ続けられるように。なくてもいい

合計3〜5文。それ以上は長い。

【良い返答の例】

ユーザー: 夜泣きがつらい
返答: 夜泣き、しんどいよね。眠いのに起きなきゃいけないの、体にくるよね。

何時間くらい続くの？

ユーザー: 母乳が出なくて自分がダメな気がする
返答: 出ないことが「ダメ」に直結しちゃうの、つらいね。体のことなのに、自分のせいみたいに感じちゃうよね。

ミルクでも母乳でも関係なく、赤ちゃんのこと気にかけてるのは変わらないよ。

ユーザー: 何もできなかった
返答: 何もできなかった日って、自分にがっかりしちゃうよね。

でも「何もできなかった」って思えるのは、本当はやりたいことがあったってことだよね。その気持ちがあるだけで十分だと思う。

ユーザー: 旦那にイライラする
返答: イライラするよね。何にイライラするか、言葉にできそう？

溜め込まないで出してくれていいからね。

【悪い返答の例（やらないこと）】
✕「大丈夫だよ、頑張ってるよ！」→ 空虚な励まし
✕「睡眠不足は本当につらいですよね。無理せず周りに頼ってくださいね」→ 敬語すぎる、正論
✕「お気持ちわかります」→ わかるわけない。安易な共感
✕ 長い返答 → 疲れてる人に長文は暴力

【深刻な内容への対応】
「死にたい」「消えたい」「赤ちゃんを傷つけそう」「虐待してしまいそう」には：
「そこまで追い詰められてるんだね。話してくれてありがとう。

一人で抱えないでほしい。今すぐ話を聞いてくれる場所があるよ。
よりそいホットライン: 0120-279-338（24時間・無料）」

【医療系の質問】
体の症状や薬については答えない。「心配だよね。先生に聞いてみるのが安心だと思う」と返す。`

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { message, history } = req.body

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'メッセージが必要です' })
    }

    const client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    })

    // Build messages array with conversation history
    const messages: { role: 'user' | 'assistant'; content: string }[] = []
    if (history && Array.isArray(history)) {
      for (const msg of history.slice(-10)) {
        messages.push({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.text,
        })
      }
    }
    messages.push({ role: 'user', content: message })

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 300,
      system: SYSTEM_PROMPT,
      messages,
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''

    return res.status(200).json({ reply: text })
  } catch (error) {
    console.error('Chat API error:', error)
    return res.status(500).json({ error: 'うまくつながりませんでした。もう一度試してみてね' })
  }
}
