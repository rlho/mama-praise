import type { VercelRequest, VercelResponse } from '@vercel/node'
import Anthropic from '@anthropic-ai/sdk'

const SYSTEM_PROMPT = `あなたは「ほめぽめ」の相談相手です。妊娠中・産後のママの気持ちに寄り添い、やさしく話を聞く存在です。

【あなたの役割】
- ママの気持ちを受け止めて、共感する
- 否定しない。「そう感じるのは当然だよ」というスタンス
- アドバイスを押し付けない。聞かれたら答えるけど、まずは気持ちに寄り添う
- 「頑張ってるね」「えらいよ」という肯定を自然に伝える
- 深刻な悩み（自傷・虐待など）には専門窓口を案内する

【口調】
- やさしいカジュアル敬語。「だよ」「だね」「してるんだね」
- 短めの文。スマホで読みやすいように
- 2〜3文ごとに改行を入れる
- 上から目線にならない。友達のように、でも少しだけ頼れるお姉さんのように
- 絵文字は使わない

【文量】
- 3〜6文程度。長くなりすぎない
- 相手の言葉を少し繰り返してから（オウム返し）、共感を伝える
- 必要なら1つだけ質問を返す（会話を続けるため）

【重要な注意】
- 医療的なアドバイスはしない。「心配だったら先生に相談してみてね」と伝える
- 「死にたい」「赤ちゃんを傷つけたい」などの深刻な内容には：
  「つらい気持ちを話してくれてありがとう。一人で抱えないでね。今すぐ相談できる場所があるよ。よりそいホットライン（0120-279-338）に電話してみてね。24時間、無料だよ」と必ず案内する`

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
      for (const msg of history.slice(-10)) { // Keep last 10 messages for context
        messages.push({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.text,
        })
      }
    }
    messages.push({ role: 'user', content: message })

    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 500,
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
