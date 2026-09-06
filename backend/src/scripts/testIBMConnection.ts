import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
import axios from 'axios';

async function diagnose() {
  const apiKey = process.env.IBM_ORCHESTRATE_API_KEY;
  const baseUrl = process.env.IBM_ORCHESTRATE_BASE_URL || '';
  const agentId = process.env.IBM_ORCHESTRATE_AGENT_ID || 'e3823416-2b52-48ed-8c8a-853e3b0e39d1';
  const agentEnvId = process.env.IBM_ORCHESTRATE_AGENT_ENV_ID || '806c2d20-a62e-4668-b0b2-1f860c72750a';

  console.log('--- IBM Config Check ---');
  console.log('API Key configured:', Boolean(apiKey));
  console.log('Base URL:', baseUrl);
  console.log('Agent ID:', agentId);
  console.log('Agent Env ID:', agentEnvId);

  if (!apiKey) {
    console.error('ERROR: No API key found in .env');
    return;
  }

  // 1. Test IAM Token Exchange
  console.log('\n1. Testing IAM Token Exchange...');
  let token = '';
  try {
    const tokenRes = await axios.post(
      'https://iam.cloud.ibm.com/identity/token',
      new URLSearchParams({
        grant_type: 'urn:ibm:params:oauth:grant-type:apikey',
        apikey: apiKey,
      }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, timeout: 15000 }
    );
    token = tokenRes.data.access_token;
    console.log('IAM Token acquired successfully (length: ' + token.length + ')');
  } catch (err: any) {
    console.error('IAM Token failed:', err.response?.status, err.response?.data || err.message);
    return;
  }

  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  // 2. Test Various Endpoint Patterns
  console.log('\n2. Testing IBM Orchestrate / Watson Assistant endpoints...');

  const cleanBase = baseUrl.replace(/\/$/, '');
  const hostMatch = cleanBase.match(/^(https?:\/\/[^\/]+)/);
  const host = hostMatch ? hostMatch[1] : cleanBase;

  const testEndpoints = [
    // Pattern A: baseUrl as given (instance URL)
    { name: 'A1: BaseUrl root', url: `${cleanBase}`, method: 'GET' },
    { name: 'A2: Agents list on instance', url: `${cleanBase}/v1/agents`, method: 'GET' },
    { name: 'A3: Agent detail on instance', url: `${cleanBase}/v1/agents/${agentId}`, method: 'GET' },
    { name: 'A4: Agent session on instance', url: `${cleanBase}/v1/agents/${agentId}/sessions`, method: 'POST', body: {} },
    { name: 'A5: Agent session with env_id', url: `${cleanBase}/v1/agents/${agentId}/sessions?env_id=${agentEnvId}`, method: 'POST', body: {} },

    // Pattern B: Watson Assistant v2 style on instance
    { name: 'B1: Assistant v2 sessions with version', url: `${cleanBase}/v2/assistants/${agentId}/sessions?version=2023-06-15`, method: 'POST', body: {} },
    { name: 'B2: Assistant v2 stateless message with agentId', url: `${cleanBase}/v2/assistants/${agentId}/message?version=2023-06-15`, method: 'POST', body: { input: { text: 'Hello' } } },
    { name: 'B3: Assistant v2 stateless message with agentEnvId', url: `${cleanBase}/v2/assistants/${agentEnvId}/message?version=2023-06-15`, method: 'POST', body: { input: { text: 'Hello' } } },
    { name: 'B4: Assistant v2 sessions with agentEnvId', url: `${cleanBase}/v2/assistants/${agentEnvId}/sessions?version=2023-06-15`, method: 'POST', body: {} },

    // Pattern C: Host root without instance path
    { name: 'C1: Host agents list', url: `${host}/v1/agents`, method: 'GET' },
    { name: 'C2: Host orchestrations', url: `${host}/v1/orchestrations`, method: 'GET' },
    { name: 'C3: Host v2/assistants', url: `${host}/v2/assistants/${agentId}/message?version=2023-06-15`, method: 'POST', body: { input: { text: 'Hello' } } },
    { name: 'C4: Host v2/assistants envId', url: `${host}/v2/assistants/${agentEnvId}/message?version=2023-06-15`, method: 'POST', body: { input: { text: 'Hello' } } },

    // Pattern E: OpenAI compatible chat completions
    { name: 'E1: Orchestrate agent chat completions', url: `${cleanBase}/v1/orchestrate/${agentId}/chat/completions`, method: 'POST', body: { messages: [{ role: 'user', content: 'Hello' }] } },
    { name: 'E2: Orchestrate agent env chat completions', url: `${cleanBase}/v1/orchestrate/${agentEnvId}/chat/completions`, method: 'POST', body: { messages: [{ role: 'user', content: 'Hello' }] } },
    { name: 'E3: Orchestrate runs with agentId', url: `${cleanBase}/v1/orchestrate/runs`, method: 'POST', body: { agent_id: agentId, input: 'Hello' } },
    { name: 'E4: Orchestrate chat completions without instance in path', url: `${host}/v1/orchestrate/${agentId}/chat/completions`, method: 'POST', body: { messages: [{ role: 'user', content: 'Hello' }] } },
    { name: 'E5: Orchestrate api/v1 chat completions', url: `${cleanBase}/api/v1/orchestrate/${agentId}/chat/completions`, method: 'POST', body: { messages: [{ role: 'user', content: 'Hello' }] } },
    { name: 'E6: Orchestrate v1/agents endpoint', url: `${cleanBase}/v1/agents`, method: 'GET' },
    { name: 'E7: Orchestrate openai chat/completions', url: `${cleanBase}/chat/completions`, method: 'POST', body: { model: agentId, messages: [{ role: 'user', content: 'Hello' }] } },
    { name: 'E8: Orchestrate /api/v1/chat/completions', url: `${cleanBase}/api/v1/chat/completions`, method: 'POST', body: { model: agentId, messages: [{ role: 'user', content: 'Hello' }] } },
    { name: 'E9: Orchestrate /v1/orchestrate/agents', url: `${cleanBase}/v1/orchestrate/agents`, method: 'GET' },
    { name: 'E10: Orchestrate /v1/orchestrate/agents detail', url: `${cleanBase}/v1/orchestrate/agents/${agentId}`, method: 'GET' },
    { name: 'E11: Orchestrate agent run', url: `${cleanBase}/v1/orchestrate/${agentId}/runs`, method: 'POST', body: { input: { message: 'Hello' } } },
    { name: 'E12: Orchestrate agent message', url: `${cleanBase}/v1/orchestrate/${agentId}/message`, method: 'POST', body: { message: 'Hello' } },
  ];

  console.log('\n3. Testing Direct Conversation with Agent...');
  const chatUrl = `${cleanBase}/v1/orchestrate/${agentId}/chat/completions`;

  async function callAgent(promptText: string): Promise<string> {
    const res = await axios.post(
      chatUrl,
      {
        messages: [{ role: 'user', content: promptText }],
        stream: false,
      },
      {
        headers,
        timeout: 45000,
        responseType: 'text',
      }
    );

    const rawData = res.data;
    let text = '';
    if (typeof rawData === 'string') {
      try {
        const parsed = JSON.parse(rawData);
        if (parsed.choices?.[0]?.message?.content) {
          text = parsed.choices[0].message.content;
        }
      } catch {
        // Check SSE
        if (rawData.includes('data:')) {
          const lines = rawData.split('\n');
          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith('data:') && !trimmed.includes('[DONE]')) {
              try {
                const json = JSON.parse(trimmed.slice(5).trim());
                if (json.choices?.[0]?.delta?.content) {
                  text += json.choices[0].delta.content;
                } else if (json.delta?.content?.[0]?.text?.value) {
                  text += json.delta.content[0].text.value;
                }
              } catch {}
            }
          }
        }
      }
    } else if (typeof rawData === 'object' && rawData !== null) {
      const anyData = rawData as any;
      text = anyData.choices?.[0]?.message?.content || anyData.response?.text || JSON.stringify(rawData);
    }
    return text || String(rawData);
  }

  // TEST 1: Question Generation Prompt
  console.log('\n--- TEST 1: Question Generation ---');
  const qPrompt = `You are an expert interview coach. Generate exactly 1 interview question for the candidate.
Candidate Profile:
- Name: Dev Sharma
- Target Role: Python Developer
- Experience Level: Fresher
- Skills: Python, SQL, Django, Git
- Interview Type: technical

Instructions:
- Focus on technical skills: Python. Include coding concepts, problem-solving, and technical knowledge questions.
- Use medium difficulty throughout.
- Questions must be appropriate for a Fresher candidate targeting a Python Developer role.
- Do NOT reveal answers or model answers.

Return the questions in this exact JSON format:
{
  "questions": [
    {
      "questionNumber": 1,
      "question": "...",
      "topic": "...",
      "difficulty": "easy|medium|hard",
      "type": "technical|hr|behavioral"
    }
  ]
}`;
  const qResult = await callAgent(qPrompt);
  console.log('Real IBM Question Output:\n', qResult);

  // TEST 2: Evaluation Prompt
  console.log('\n--- TEST 2: Answer Evaluation ---');
  const evalPrompt = `You are an expert interview evaluator. Evaluate the following interview answer.
Question Details:
- Question: Explain the difference between lists and tuples in Python.
- Topic: Python
- Difficulty: medium
- Type: technical

Candidate Profile:
- Name: Dev Sharma
- Target Role: Python Developer
- Experience Level: Fresher

Candidate's Answer:
"Lists are mutable, meaning their elements can be modified after creation, and they use square brackets. Tuples are immutable, cannot be modified after creation, and use parentheses. Tuples are typically faster and consume less memory."

Evaluate the answer across these dimensions (score each 1-10):
1. Technical Accuracy, 2. Relevance, 3. Clarity, 4. Completeness, 5. Communication

Return your evaluation in this exact JSON format:
{
  "technicalAccuracy": 9,
  "relevance": 9,
  "clarity": 9,
  "completeness": 8,
  "communication": 9,
  "overallScore": 8.8,
  "strengths": ["Clear explanation of mutability", "Mentioned performance and syntax differences"],
  "improvements": ["Could mention use-case examples like dictionary keys"],
  "suggestions": ["Mention that tuples can be used as dictionary keys because they are hashable"],
  "modelAnswer": "..."
}`;
  const evalResult = await callAgent(evalPrompt);
  console.log('Real IBM Evaluation Output:\n', evalResult);
}

diagnose();


