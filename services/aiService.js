const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const SYSTEM_PROMPT = `You are a compassionate mental wellness assistant for Mentra, a group therapy matching platform.

CRITICAL SAFETY BOUNDARIES:
- NEVER diagnose mental health conditions
- NEVER provide medical advice
- NEVER replace therapists
- ALWAYS recommend professional help for serious concerns
- AI recommendations are advisory only

CONVERSATION STYLE:
- Start with 1-2 empathetic lines
- Ask 2-5 short questions total
- Ask only ONE question per message
- Be warm, supportive, and non-judgmental
- Keep responses concise (2-4 sentences)

INFORMATION TO COLLECT (in order):
1. Main concern
2. Context / duration
3. Goals
4. Challenges
5. Preferences (group vs 1:1, timing)

OUTPUT FORMAT:
When you have collected all information, output a JSON object with:
{
  "themes": ["theme1", "theme2"],
  "mainConcern": "summary",
  "goals": ["goal1", "goal2"],
  "challenges": ["challenge1", "challenge2"],
  "preferences": {
    "format": "group/1:1",
    "timing": "preference"
  },
  "recommendedGroup": {
    "id": "group-id",
    "name": "Group Name",
    "reasoning": "explanation"
  },
  "intakeComplete": true
}

Available groups:
- anxiety-overthinking: Anxiety & Overthinking
- workplace-stress: Workplace Stress & Burnout
- grief-transitions: Grief & Life Transitions`;

async function generateResponse(userMessage, conversationHistory) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    const history = conversationHistory.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : msg.role,
      parts: [{ text: msg.content }]
    }));

    const chat = model.startChat({
      history: history,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 500,
      },
    });

    const result = await chat.sendMessage(userMessage);
    const response = await result.response;
    const text = response.text();

    return text;
  } catch (error) {
    console.error('AI Service Error:', error);
    throw new Error('Failed to generate AI response');
  }
}

async function extractInsights(conversationHistory) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    const conversationText = conversationHistory.map(msg => 
      `${msg.role}: ${msg.content}`
    ).join('\n');

    const prompt = `${SYSTEM_PROMPT}

Based on this conversation, extract structured insights in JSON format:

${conversationText}

Return ONLY the JSON object, no other text.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    throw new Error('Could not extract JSON from response');
  } catch (error) {
    console.error('Insights Extraction Error:', error);
    throw new Error('Failed to extract insights');
  }
}

async function recommendGroup(insights, allGroups) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    const groupsSummary = allGroups.map(g => 
      `${g.id}: ${g.name} - ${g.description}`
    ).join('\n');

    const prompt = `Based on these user insights, provide personalized recommendations for ALL available groups. Rate each group's relevance and explain why it might or might not fit:

User Insights:
${JSON.stringify(insights, null, 2)}

Available Groups:
${groupsSummary}

Return JSON array with all groups:
[
  {
    "groupId": "group-id",
    "groupName": "Group Name",
    "relevanceScore": 1-10 (10 = best fit),
    "reasoning": "2-3 sentence explanation of why this group fits or doesn't fit"
  }
]`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    throw new Error('Could not extract recommendations');
  } catch (error) {
    console.error('Recommendation Error:', error);
    return allGroups.map(g => ({
      groupId: g.id,
      groupName: g.name,
      relevanceScore: 5,
      reasoning: 'Default recommendation - this group may be suitable'
    }));
  }
}

async function generateHandoffSummary(groupId, participants, conversationSummary) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    const prompt = `Generate a therapist handoff summary for a group therapy session.

Group ID: ${groupId}

Participants:
${participants.map(p => `- ${p.name}: ${p.concern}`).join('\n')}

Conversation Summary:
${conversationSummary}

Return JSON:
{
  "groupTheme": "main theme",
  "sharedGoals": ["goal1", "goal2"],
  "participantSummaries": [
    {
      "name": "participant name",
      "keyPoints": ["point1", "point2"]
    }
  ],
  "suggestedFocusAreas": ["area1", "area2"],
  "therapistNotes": "engagement suggestions"
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    throw new Error('Could not generate handoff');
  } catch (error) {
    console.error('Handoff Generation Error:', error);
    throw new Error('Failed to generate handoff summary');
  }
}

module.exports = {
  generateResponse,
  extractInsights,
  recommendGroup,
  generateHandoffSummary
};
