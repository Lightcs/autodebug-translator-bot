import { createParser, ParsedEvent, ReconnectInterval } from 'eventsource-parser'
import { Message } from '@/models'

export const config = {
  runtime: 'edge'
}

// HTTP handler to serve frontend chat requests.
const handler = async (req: Request): Promise<Response> => {
  // JSON params from frontend.
  const requestParams = await req.json();
  // Extract required params.
  const { messages, language, model } = requestParams as {
    messages: Message[]
    language: string
    model: string
  }

  let messagesToSend = messages.slice(-1);

  const useAzureOpenAI =
    process.env.AZURE_OPENAI_API_BASE_URL && process.env.AZURE_OPENAI_API_BASE_URL.length > 0

  let apiUrl: string
  let apiKey: string
  // Use azure deployed OpenAI API or official API.
  if (useAzureOpenAI) {
    let apiBaseUrl = process.env.AZURE_OPENAI_API_BASE_URL
    const version = '2024-02-01'
    const deployment = process.env.AZURE_OPENAI_DEPLOYMENT || ''
    if (apiBaseUrl && apiBaseUrl.endsWith('/')) {
      apiBaseUrl = apiBaseUrl.slice(0, -1)
    }
    apiUrl = `${apiBaseUrl}/openai/deployments/${deployment}/chat/completions?api-version=${version}`
    apiKey = process.env.AZURE_OPENAI_API_KEY || ''
  } else {
    let apiBaseUrl = process.env.OPENAI_API_BASE_URL || 'https://api.openai.com'
    if (apiBaseUrl && apiBaseUrl.endsWith('/')) {
      apiBaseUrl = apiBaseUrl.slice(0, -1)
    }
    apiUrl = `${apiBaseUrl}/v1/chat/completions`
    apiKey = process.env.OPENAI_API_KEY || ''
  }
  // Initiate the request.
  const stream = await OpenAIStream(apiUrl, apiKey, model, messagesToSend, language)
  return new Response(stream)
}

async function OpenAIStream(apiUrl: string, apiKey: string, model: string, messages: Message[], language: string) {
  const encoder = new TextEncoder()
  const decoder = new TextDecoder()
  console.log(`targetLanguage: ${language}, model: ${model}`);
  if (model === undefined || model.length === 0) {
    // Only model in the available models list are allowed.
    throw new Error(`model name is required`)
  }
  if (!availableModels.includes(model)) {
    throw new Error(`model ${model} is not available`)
  }
  const res = await fetch(apiUrl, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      'api-key': `${apiKey}`
    },
    method: 'POST',
    body: JSON.stringify({
      model: model,
      frequency_penalty: 0,
      max_tokens: 4000,
      messages: [
        {
          role: 'system',
          content: `## 角色
          你是一名精通多种语言的翻译机器人，你的任务是把用户说的所有话翻译成用户指定的${language}语言。
          
          ## 技能
          你能够理解并准确翻译用户提供的语段。
          你的翻译应准确无误，符合用户指定的${language}语言的语法和语境规则。
          ## 约束
          在回答用户问题时，你只需要进行语言翻译，不进行任何其他类型的解答和反馈。
          你的翻译必须完全基于用户提供的原始表述，不能添加、省略或更改任何信息。
          如果用户输入的语言和目标语言相通，直接返回用户输入即可，不要输出其他信息
          `
        },
        ...messages
      ],
      presence_penalty: 0,
      stream: true,
      temperature: 0.7,
      top_p: 0.95
    })
  })

  if (res.status !== 200) {
    const statusText = res.statusText
    throw new Error(
      `The OpenAI API has encountered an error with a status code of ${res.status} and message ${statusText}`
    )
  }

  return new ReadableStream({
    async start(controller) {
      const onParse = (event: ParsedEvent | ReconnectInterval) => {
        if (event.type === 'event') {
          const data = event.data

          if (data === '[DONE]') {
            controller.close()
            return
          }

          try {
            const json = JSON.parse(data)
            const text = json.choices[0]?.delta.content
            const queue = encoder.encode(text)
            controller.enqueue(queue)
          } catch (e) {
            controller.error(e)
          }
        }
      }

      const parser = createParser(onParse)

      for await (const chunk of res.body as any) {
        const str = decoder.decode(chunk).replace('[DONE]\n', '[DONE]\n\n')
        parser.feed(str)
      }
    }
  })
}

const availableModels = ['gpt-3.5-turbo', 'gpt-4-0613']; // The API only supports these models, DO NOT change it, or it causes errors from model API.

export default handler
