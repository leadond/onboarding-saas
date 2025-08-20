import { createClient } from '@supabase/supabase-js'
import { generateIndustryKit, AVAILABLE_INDUSTRIES } from '../lib/ai/kit-generator'

const supabase = await getSupabaseClient()(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function seedIndustryKits() {
  console.log('Starting to generate industry kit templates...')

  // Get or create global admin user for seeding
  const { data: globalAdmin } = await supabase
    .from('user_profiles')
    .select('id')
    .eq('role', 'global_admin')
    .limit(1)
    .single()

  if (!globalAdmin) {
    console.error('No global admin found. Please create a global admin user first.')
    return
  }

  for (const industry of AVAILABLE_INDUSTRIES) {
    try {
      console.log(`Generating kit for ${industry}...`)
      
      // Generate the kit using AI
      const generatedKit = await generateIndustryKit(industry)
      
      // Save to database
      const { data: template, error: templateError } = await supabase
        .from('kit_templates')
        .insert({
          name: generatedKit.name,
          description: generatedKit.description,
          industry: generatedKit.industry,
          category: generatedKit.category,
          is_premium: false,
          price: 0,
          created_by: globalAdmin.id,
          metadata: { 
            generated_by_ai: true,
            generated_at: new Date().toISOString()
          }
        })
        .select()
        .single()

      if (templateError) {
        console.error(`Error creating template for ${industry}:`, templateError)
        continue
      }

      // Save the steps
      if (generatedKit.steps && generatedKit.steps.length > 0) {
        const stepsToInsert = generatedKit.steps.map(step => ({
          ...step,
          template_id: template.id
        }))

        const { error: stepsError } = await supabase
          .from('kit_template_steps')
          .insert(stepsToInsert)

        if (stepsError) {
          console.error(`Error creating steps for ${industry}:`, stepsError)
          // Rollback template creation
          await supabase.from('kit_templates').delete().eq('id', template.id)
          continue
        }
      }

      console.log(`✅ Successfully created kit template for ${industry}`)
      
      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000))
      
    } catch (error) {
      console.error(`Error generating kit for ${industry}:`, error)
    }
  }

  console.log('Finished generating industry kit templates!')
}

// Document templates for common industries
const DOCUMENT_TEMPLATES = [
  {
    name: 'Service Agreement Template',
    description: 'Standard service agreement for professional services',
    document_type: 'contract',
    industry: 'general',
    content: `
      <h1>SERVICE AGREEMENT</h1>
      
      <p>This Service Agreement ("Agreement") is entered into on \{\{CURRENT_DATE\}\} between \{\{COMPANY_NAME\}\} ("Company") and \{\{CLIENT_NAME\}\} ("Client").</p>
      
      <h2>1. SERVICES</h2>
      <p>Company agrees to provide the following services: \{\{SERVICE_DESCRIPTION\}\}</p>
      
      <h2>2. PAYMENT TERMS</h2>
      <p>Total Amount: $\{\{TOTAL_AMOUNT\}\}</p>
      <p>Payment Terms: \{\{PAYMENT_TERMS\}\}</p>
      
      <h2>3. TERM</h2>
      <p>This agreement begins on \{\{START_DATE\}\} and ends on \{\{END_DATE\}\}.</p>
      
      <h2>4. SIGNATURES</h2>
      <p>Company: \{\{COMPANY_NAME\}\}</p>
      <p>Client: \{\{CLIENT_NAME\}\}</p>
      <p>Date: \{\{CURRENT_DATE\}\}</p>
    `
  },
  {
    name: 'Legal Retainer Agreement',
    description: 'Attorney-client retainer agreement',
    document_type: 'contract',
    industry: 'legal',
    content: `
      <h1>ATTORNEY-CLIENT RETAINER AGREEMENT</h1>
      
      <p>This Retainer Agreement is entered into between \{\{COMPANY_NAME\}\} ("Attorney") and \{\{CLIENT_NAME\}\} ("Client").</p>
      
      <h2>1. LEGAL SERVICES</h2>
      <p>Attorney agrees to represent Client in the following matter: \{\{CASE_DESCRIPTION\}\}</p>
      
      <h2>2. RETAINER FEE</h2>
      <p>Client agrees to pay a retainer fee of $\{\{RETAINER_AMOUNT\}\} upon execution of this agreement.</p>
      
      <h2>3. HOURLY RATE</h2>
      <p>Attorney's hourly rate is $\{\{HOURLY_RATE\}\} per hour.</p>
      
      <h2>4. CONFIDENTIALITY</h2>
      <p>All communications between Attorney and Client are protected by attorney-client privilege.</p>
      
      <h2>5. SIGNATURES</h2>
      <p>Attorney: \{\{COMPANY_NAME\}\}</p>
      <p>Client Signature: ________________________</p>
      <p>Date: \{\{CURRENT_DATE\}\}</p>
    `
  },
  {
    name: 'Accounting Engagement Letter',
    description: 'Professional engagement letter for accounting services',
    document_type: 'agreement',
    industry: 'accounting',
    content: `
      <h1>ENGAGEMENT LETTER</h1>
      
      <p>Dear \{\{CLIENT_NAME\}\},</p>
      
      <p>This letter confirms our understanding of the terms and objectives of our engagement and the nature and limitations of the services we will provide.</p>
      
      <h2>SERVICES TO BE PROVIDED</h2>
      <p>We will provide the following services: \{\{SERVICE_DESCRIPTION\}\}</p>
      
      <h2>FEES</h2>
      <p>Our fees for these services will be $\{\{TOTAL_AMOUNT\}\} \{\{PAYMENT_TERMS\}\}</p>
      
      <h2>CLIENT RESPONSIBILITIES</h2>
      <p>You are responsible for providing all necessary documentation and information.</p>
      
      <p>Please sign and return one copy of this letter to indicate your acknowledgment and agreement.</p>
      
      <p>Sincerely,</p>
      <p>\{\{COMPANY_NAME\}\}</p>
      
      <p>Acknowledged and agreed:</p>
      <p>Client Signature: ________________________</p>
      <p>Date: \{\{CURRENT_DATE\}\}</p>
    `
  }
]

async function seedDocumentTemplates() {
  console.log('Seeding document templates...')

  const { data: globalAdmin } = await supabase
    .from('user_profiles')
    .select('id')
    .eq('role', 'global_admin')
    .limit(1)
    .single()

  if (!globalAdmin) {
    console.error('No global admin found.')
    return
  }

  for (const template of DOCUMENT_TEMPLATES) {
    const { error } = await supabase
      .from('document_templates')
      .insert({
        ...template,
        is_global: true,
        created_by: globalAdmin.id,
        version: '1.0.0'
      })

    if (error) {
      console.error(`Error creating document template ${template.name}:`, error)
    } else {
      console.log(`✅ Created document template: ${template.name}`)
    }
  }
}

// Form templates
const FORM_TEMPLATES = [
  {
    name: 'Client Intake Form',
    description: 'General client information intake form',
    form_type: 'intake',
    industry: 'general',
    fields: [
      { id: '1', name: 'full_name', label: 'Full Name', type: 'text', required: true, order: 1 },
      { id: '2', name: 'email', label: 'Email Address', type: 'email', required: true, order: 2 },
      { id: '3', name: 'phone', label: 'Phone Number', type: 'phone', required: true, order: 3 },
      { id: '4', name: 'company', label: 'Company Name', type: 'text', required: false, order: 4 },
      { id: '5', name: 'address', label: 'Address', type: 'textarea', required: false, order: 5 },
      { id: '6', name: 'services_needed', label: 'Services Needed', type: 'textarea', required: true, order: 6 }
    ]
  },
  {
    name: 'Legal Case Intake Form',
    description: 'Legal case information intake form',
    form_type: 'intake',
    industry: 'legal',
    fields: [
      { id: '1', name: 'client_name', label: 'Client Name', type: 'text', required: true, order: 1 },
      { id: '2', name: 'case_type', label: 'Type of Legal Matter', type: 'select', required: true, order: 2, options: ['Personal Injury', 'Family Law', 'Criminal Defense', 'Business Law', 'Other'] },
      { id: '3', name: 'case_description', label: 'Case Description', type: 'textarea', required: true, order: 3 },
      { id: '4', name: 'opposing_party', label: 'Opposing Party', type: 'text', required: false, order: 4 },
      { id: '5', name: 'court_date', label: 'Court Date (if any)', type: 'date', required: false, order: 5 },
      { id: '6', name: 'budget', label: 'Budget Range', type: 'select', required: false, order: 6, options: ['Under $5,000', '$5,000-$15,000', '$15,000-$50,000', 'Over $50,000'] }
    ]
  }
]

async function seedFormTemplates() {
  console.log('Seeding form templates...')

  const { data: globalAdmin } = await supabase
    .from('user_profiles')
    .select('id')
    .eq('role', 'global_admin')
    .limit(1)
    .single()

  if (!globalAdmin) {
    console.error('No global admin found.')
    return
  }

  for (const template of FORM_TEMPLATES) {
    const { error } = await supabase
      .from('form_templates')
      .insert({
        ...template,
        is_global: true,
        created_by: globalAdmin.id
      })

    if (error) {
      console.error(`Error creating form template ${template.name}:`, error)
    } else {
      console.log(`✅ Created form template: ${template.name}`)
    }
  }
}

async function main() {
  try {
    await seedDocumentTemplates()
    await seedFormTemplates()
    await seedIndustryKits()
  } catch (error) {
    console.error('Seeding failed:', error)
  }
}

if (require.main === module) {
  main()
}

export { seedIndustryKits, seedDocumentTemplates, seedFormTemplates }