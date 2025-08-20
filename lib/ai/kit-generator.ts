import OpenAI from 'openai'
import { KitTemplateStep, INDUSTRY_CONFIGS, IndustryKitConfig } from '@/types/onboarding-kits'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export interface GeneratedKit {
  name: string
  description: string
  industry: string
  category: string
  steps: Omit<KitTemplateStep, 'id' | 'template_id' | 'created_at' | 'updated_at'>[]
}

export async function generateIndustryKit(industry: string, companyType?: string): Promise<GeneratedKit> {
  const config = INDUSTRY_CONFIGS[industry.toLowerCase().replace(/\s+/g, '_')]
  
  const prompt = `Create a comprehensive client onboarding kit for ${industry} ${companyType ? `(${companyType})` : ''} businesses.

Industry Context:
${config ? `
- Typical Steps: ${config.typical_steps.join(', ')}
- Required Documents: ${config.required_documents.join(', ')}
- Common Forms: ${config.common_forms.join(', ')}
- Average Duration: ${config.average_duration_days} days
- Compliance: ${config.compliance_requirements?.join(', ') || 'Standard business requirements'}
` : 'No specific industry configuration available.'}

Generate a detailed onboarding kit with 8-12 steps that includes:
1. Client intake and information gathering
2. Legal agreements and contracts
3. Payment setup and processing
4. Document collection and verification
5. Service delivery preparation
6. Communication and notification touchpoints

For each step, specify:
- Clear step name and description
- Step type (form, document, payment, approval, task, calendar, file_upload)
- Who is responsible (client, company, both)
- Whether it's required
- Estimated duration in hours
- Specific configuration for the step type

Return ONLY a valid JSON object with this structure:
{
  "name": "Kit Name",
  "description": "Detailed description",
  "industry": "${industry}",
  "category": "onboarding",
  "steps": [
    {
      "name": "Step Name",
      "description": "Step description",
      "step_order": 1,
      "step_type": "form|document|payment|approval|task|calendar|file_upload",
      "responsibility": "client|company|both",
      "is_required": true|false,
      "estimated_duration_hours": number,
      "config": {
        // Step-specific configuration object
      }
    }
  ]
}`

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert business process consultant specializing in client onboarding workflows. Generate comprehensive, industry-specific onboarding kits that follow best practices and compliance requirements."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    })

    const response = completion.choices[0]?.message?.content
    if (!response) {
      throw new Error('No response from OpenAI')
    }

    // Parse the JSON response
    const kit = JSON.parse(response) as GeneratedKit
    
    // Validate the structure
    if (!kit.name || !kit.steps || !Array.isArray(kit.steps)) {
      throw new Error('Invalid kit structure generated')
    }

    return kit
  } catch (error) {
    console.error('Error generating kit:', error)
    throw new Error('Failed to generate industry kit')
  }
}

export async function generateDocumentTemplate(
  documentType: string,
  industry: string,
  companyName?: string
): Promise<string> {
  const prompt = `Create a professional ${documentType} template for ${industry} businesses.

Requirements:
- Include standard legal language appropriate for ${industry}
- Use placeholder variables in {{VARIABLE_NAME}} format for customization
- Include all necessary sections and clauses
- Ensure compliance with industry standards
- Make it professional and legally sound

Common variables to include:
- {{COMPANY_NAME}}
- {{CLIENT_NAME}}
- {{CLIENT_EMAIL}}
- {{CLIENT_ADDRESS}}
- {{SERVICE_DESCRIPTION}}
- {{START_DATE}}
- {{END_DATE}}
- {{TOTAL_AMOUNT}}
- {{PAYMENT_TERMS}}

Generate a complete, professional ${documentType} template in HTML format.`

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a legal document expert. Create professional, industry-appropriate document templates with proper legal language and structure."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 1500
    })

    return completion.choices[0]?.message?.content || ''
  } catch (error) {
    console.error('Error generating document template:', error)
    throw new Error('Failed to generate document template')
  }
}

export async function analyzeDocument(content: string, documentType: string): Promise<{
  analysis: any
  suggestions: string
  confidence_score: number
}> {
  const prompt = `Analyze this ${documentType} for legal accuracy, completeness, and potential issues:

${content}

Provide analysis in this JSON format:
{
  "analysis": {
    "legal_issues": ["list of potential legal issues"],
    "missing_clauses": ["list of missing important clauses"],
    "clarity_issues": ["list of unclear or ambiguous language"],
    "compliance_notes": ["compliance considerations"]
  },
  "suggestions": "Detailed suggestions for improvement",
  "confidence_score": 0.85
}`

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a legal document review expert. Analyze documents for legal accuracy, completeness, and potential issues. Provide constructive feedback."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.2,
      max_tokens: 1000
    })

    const response = completion.choices[0]?.message?.content
    if (!response) {
      throw new Error('No response from OpenAI')
    }

    return JSON.parse(response)
  } catch (error) {
    console.error('Error analyzing document:', error)
    throw new Error('Failed to analyze document')
  }
}

// Pre-built industry kits that can be generated
export const AVAILABLE_INDUSTRIES = [
  'Legal Services',
  'Accounting & Finance',
  'Business Consulting',
  'Healthcare Services',
  'Real Estate',
  'Marketing Agency',
  'Software Development',
  'Architecture & Design',
  'Insurance Services',
  'Financial Planning',
  'Construction',
  'Education & Training'
]