/*
 * Copyright (c) 2024 Marvelously Made LLC DBA Dev App Hero. All rights reserved.
 * 
 * PROPRIETARY AND CONFIDENTIAL
 * 
 * This software contains proprietary and confidential information.
 * Unauthorized copying, distribution, or use is strictly prohibited.
 * 
 * For licensing information, contact: legal@devapphero.com
 */

import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

interface KitRequest {
  industry: string
  service_type: string
  product_description: string
  project_value?: string
  timeline?: string
  special_requirements?: string
  spell_check_enabled?: boolean
}

export async function POST(request: NextRequest) {
  try {
    const body: KitRequest = await request.json()
    
    if (!body.industry || !body.service_type || !body.product_description) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: industry, service_type, product_description' },
        { status: 400 }
      )
    }

    // Generate AI recommendations using OpenAI
    const recommendations = await generateOnboardingRecommendations(body)
    const documents = await generateLegalDocuments(body)

    return NextResponse.json({
      success: true,
      data: {
        recommendations,
        documents,
        spell_check_suggestions: body.spell_check_enabled ? await performSpellCheck(body.product_description) : null
      }
    })

  } catch (error) {
    console.error('AI Kit Recommendations Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to generate AI recommendations' },
      { status: 500 }
    )
  }
}

async function generateOnboardingRecommendations(data: KitRequest) {
  const prompt = `You are an expert business consultant specializing in client onboarding processes. 

Based on the following information, generate a comprehensive list of onboarding steps:

Industry: ${data.industry}
Service Type: ${data.service_type}
Service Description: ${data.product_description}
Project Value: ${data.project_value || 'Not specified'}
Timeline: ${data.timeline || 'Not specified'}
Special Requirements: ${data.special_requirements || 'None'}

Please provide:
1. Standard onboarding steps that apply to most businesses
2. Industry-specific steps for the ${data.industry} industry
3. Legal documents commonly required for this type of service
4. Compliance requirements specific to this industry

For each recommendation, specify:
- Title (concise, actionable)
- Description (detailed explanation)
- Type (step, document, or legal)
- Whether it's required or optional
- Whether it's industry-specific
- Estimated time to complete

Focus on practical, actionable steps that ensure smooth client onboarding and legal compliance.

Return the response as a JSON array of objects with this structure:
{
  "id": "unique_id",
  "title": "Step Title",
  "description": "Detailed description",
  "type": "step|document|legal",
  "required": true|false,
  "industry_specific": true|false,
  "estimated_time": "X minutes"
}`

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert business consultant. Always respond with valid JSON only, no additional text or formatting."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    })

    const content = completion.choices[0]?.message?.content
    if (!content) {
      throw new Error('No response from OpenAI')
    }

    // Parse the JSON response
    const recommendations = JSON.parse(content)
    
    // Add unique IDs if not provided
    return recommendations.map((rec: any, index: number) => ({
      ...rec,
      id: rec.id || `ai-rec-${index + 1}`
    }))

  } catch (error) {
    console.error('Error generating recommendations:', error)
    // Fallback to mock data if AI fails
    return generateFallbackRecommendations(data)
  }
}

async function generateLegalDocuments(data: KitRequest) {
  const documents = []

  // Generate Statement of Work
  const sowPrompt = `Generate a professional Statement of Work (SOW) document for:

Industry: ${data.industry}
Service: ${data.service_type}
Description: ${data.product_description}
Value: ${data.project_value || '[PROJECT VALUE]'}
Timeline: ${data.timeline || '[PROJECT TIMELINE]'}
Special Requirements: ${data.special_requirements || 'None specified'}

Include standard SOW sections: Project Overview, Scope of Work, Deliverables, Timeline & Milestones, Payment Terms, Acceptance Criteria.

Make it professional and legally sound, but include placeholders for specific details that need to be customized.`

  try {
    const sowCompletion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a legal document expert. Generate professional, comprehensive legal documents in markdown format."
        },
        {
          role: "user",
          content: sowPrompt
        }
      ],
      temperature: 0.3,
      max_tokens: 1500
    })

    documents.push({
      id: 'sow-ai-generated',
      title: 'Statement of Work',
      type: 'sow',
      content: sowCompletion.choices[0]?.message?.content || generateFallbackSOW(data),
      editable: true
    })

  } catch (error) {
    console.error('Error generating SOW:', error)
    documents.push({
      id: 'sow-fallback',
      title: 'Statement of Work',
      type: 'sow',
      content: generateFallbackSOW(data),
      editable: true
    })
  }

  // Generate POC Agreement if applicable
  if (data.service_type.toLowerCase().includes('development') || 
      data.service_type.toLowerCase().includes('software') ||
      data.service_type.toLowerCase().includes('poc') ||
      data.service_type.toLowerCase().includes('pilot')) {
    
    const pocPrompt = `Generate a Proof of Concept (POC) Agreement for:

Service: ${data.service_type}
Industry: ${data.industry}
Description: ${data.product_description}

Include POC objectives, scope limitations, success criteria, deliverables, and terms. Make it clear this is a limited demonstration phase.`

    try {
      const pocCompletion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "Generate a professional POC agreement in markdown format."
          },
          {
            role: "user",
            content: pocPrompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1000
      })

      documents.push({
        id: 'poc-ai-generated',
        title: 'Proof of Concept Agreement',
        type: 'poc',
        content: pocCompletion.choices[0]?.message?.content || generateFallbackPOC(data),
        editable: true
      })

    } catch (error) {
      console.error('Error generating POC:', error)
    }
  }

  // Generate Master Service Agreement
  const msaPrompt = `Generate a Master Service Agreement for:

Industry: ${data.industry}
Service Category: ${data.service_type}
Special Requirements: ${data.special_requirements || 'Standard terms'}

Include general terms, payment terms, intellectual property, limitation of liability, termination, and governing law sections.`

  try {
    const msaCompletion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "Generate a professional Master Service Agreement in markdown format with standard legal provisions."
        },
        {
          role: "user",
          content: msaPrompt
        }
      ],
      temperature: 0.2,
      max_tokens: 1500
    })

    documents.push({
      id: 'msa-ai-generated',
      title: 'Master Service Agreement',
      type: 'agreement',
      content: msaCompletion.choices[0]?.message?.content || generateFallbackMSA(data),
      editable: true
    })

  } catch (error) {
    console.error('Error generating MSA:', error)
    documents.push({
      id: 'msa-fallback',
      title: 'Master Service Agreement',
      type: 'agreement',
      content: generateFallbackMSA(data),
      editable: true
    })
  }

  return documents
}

async function performSpellCheck(text: string) {
  const prompt = `Please review the following text for spelling and grammar errors. Provide suggestions for improvement:

"${text}"

Return a JSON object with:
{
  "errors_found": number,
  "suggestions": [
    {
      "original": "original text",
      "suggestion": "corrected text",
      "type": "spelling|grammar|style"
    }
  ],
  "corrected_text": "full corrected version"
}`

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a professional editor. Respond with valid JSON only."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.1,
      max_tokens: 1000
    })

    return JSON.parse(completion.choices[0]?.message?.content || '{"errors_found": 0, "suggestions": [], "corrected_text": ""}')
  } catch (error) {
    console.error('Error performing spell check:', error)
    return null
  }
}

// Fallback functions for when AI fails
function generateFallbackRecommendations(data: KitRequest) {
  const baseRecommendations = [
    {
      id: 'fallback-1',
      title: 'Client Information Collection',
      description: 'Gather essential client contact information, business details, and project requirements.',
      type: 'step',
      required: true,
      industry_specific: false,
      estimated_time: '15 minutes'
    },
    {
      id: 'fallback-2',
      title: 'Project Scope Definition',
      description: 'Define clear project boundaries, deliverables, and success criteria.',
      type: 'step',
      required: true,
      industry_specific: false,
      estimated_time: '30 minutes'
    },
    {
      id: 'fallback-3',
      title: 'Service Agreement Review',
      description: 'Review and sign the master service agreement outlining terms and conditions.',
      type: 'legal',
      required: true,
      industry_specific: false,
      estimated_time: '20 minutes'
    }
  ]

  // Add industry-specific recommendations
  if (data.industry.toLowerCase().includes('technology') || data.industry.toLowerCase().includes('software')) {
    baseRecommendations.push({
      id: 'fallback-tech-1',
      title: 'Technical Requirements Assessment',
      description: 'Evaluate technical infrastructure, security requirements, and integration needs.',
      type: 'step',
      required: true,
      industry_specific: true,
      estimated_time: '45 minutes'
    })
  }

  return baseRecommendations
}

function generateFallbackSOW(data: KitRequest): string {
  const projectValue = data.project_value ? `$${data.project_value}` : '[PROJECT VALUE]'
  const timeline = data.timeline || '[PROJECT TIMELINE]'
  
  return `# Statement of Work

## Project Overview
**Service Type:** ${data.service_type}
**Industry:** ${data.industry}
**Project Value:** ${projectValue}
**Timeline:** ${timeline}

## Scope of Work
${data.product_description}

## Deliverables
1. [Primary Deliverable 1]
2. [Primary Deliverable 2]
3. [Primary Deliverable 3]

## Timeline & Milestones
- **Phase 1:** [Description] - [Timeline]
- **Phase 2:** [Description] - [Timeline]
- **Phase 3:** [Description] - [Timeline]

## Payment Terms
- **Total Project Value:** ${projectValue}
- **Payment Schedule:** [Payment terms and schedule]
- **Invoicing:** [Invoicing details]

## Special Requirements
${data.special_requirements || 'No special requirements specified.'}

## Acceptance Criteria
[Define clear acceptance criteria for project completion]

---
*This document is AI-generated and should be reviewed and customized before use.*`
}

function generateFallbackPOC(data: KitRequest): string {
  return `# Proof of Concept Agreement

## POC Overview
This Proof of Concept (POC) agreement outlines the terms for a limited-scope demonstration of the proposed solution.

**Service Type:** ${data.service_type}
**Industry:** ${data.industry}
**POC Duration:** 30 days (unless otherwise specified)

## POC Objectives
1. Demonstrate core functionality
2. Validate technical feasibility
3. Assess integration requirements
4. Evaluate performance metrics

## POC Scope
${data.product_description}

## Success Criteria
- [Measurable success criterion 1]
- [Measurable success criterion 2]
- [Measurable success criterion 3]

## POC Deliverables
1. Working prototype/demo
2. Technical documentation
3. Performance analysis report
4. Recommendations for full implementation

## Terms & Conditions
- POC is provided on a best-effort basis
- No warranty or guarantee of results
- Intellectual property remains with respective parties
- Data confidentiality maintained throughout POC

## Next Steps
Upon successful POC completion, parties may proceed with full project implementation under separate agreement.

---
*This document is AI-generated and should be reviewed and customized before use.*`
}

function generateFallbackMSA(data: KitRequest): string {
  return `# Master Service Agreement

## Parties
**Service Provider:** [COMPANY NAME]
**Client:** [CLIENT COMPANY NAME]

## Services Overview
**Industry:** ${data.industry}
**Service Category:** ${data.service_type}

## General Terms
1. **Scope of Services:** Services will be defined in individual Statements of Work
2. **Term:** This agreement shall remain in effect for [TERM] unless terminated
3. **Confidentiality:** Both parties agree to maintain confidentiality of proprietary information

## Payment Terms
- **Payment Schedule:** Net 30 days from invoice date
- **Late Fees:** 1.5% per month on overdue amounts
- **Expenses:** Pre-approved expenses will be reimbursed

## Intellectual Property
- **Work Product:** All work product created shall be owned by Client
- **Pre-existing IP:** Each party retains ownership of pre-existing intellectual property
- **License:** Service Provider grants Client license to use deliverables

## Limitation of Liability
Service Provider's liability shall not exceed the total amount paid under the applicable Statement of Work.

## Termination
Either party may terminate this agreement with 30 days written notice.

## Governing Law
This agreement shall be governed by the laws of [STATE/JURISDICTION].

## Special Provisions
${data.special_requirements || 'No special provisions.'}

---
*This document is AI-generated and should be reviewed by legal counsel before execution.*`
}