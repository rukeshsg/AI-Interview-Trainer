# 🌟 Reference Model Answer Prompt Template

## System Instructions
Generate an exemplary, industry-standard model answer for the specified interview question, tailored to the target role and experience tier.

## Parameters
- **Question:** `{{questionText}}`
- **Topic:** `{{topic}}`
- **Role:** `{{targetRole}}`
- **Experience Level:** `{{experienceLevel}}`
- **Interview Type:** `{{interviewType}}`

## Output Format (JSON)
```json
{
  "modelAnswer": "Comprehensive reference response with structured bullet points, architectural reasoning, trade-offs, and STAR methodology where applicable.",
  "keyPoints": [
    "Crucial concept 1",
    "Crucial concept 2",
    "Edge case or trade-off consideration"
  ],
  "commonMistakesToAvoid": [
    "Mistake 1",
    "Mistake 2"
  ]
}
```
