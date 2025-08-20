const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Document templates
const DOCUMENT_TEMPLATES = [
  {
    name: 'Service Agreement Template',
    description: 'Standard service agreement for professional services',
    document_type: 'contract',
    industry: 'general',
    content: '<h1>SERVICE AGREEMENT</h1>' +
      '<p>This Service Agreement ("Agreement") is entered into on {{CURRENT_DATE}} between {{COMPANY_NAME}} ("Company") and {{CLIENT_NAME}} ("Client").</p>' +
      '<h2>1. SERVICES</h2>' +
      '<p>Company agrees to provide the following services: {{SERVICE_DESCRIPTION}}</p>' +
      '<h2>2. PAYMENT TERMS</h2>' +
      '<p>Total Amount: ${{TOTAL_AMOUNT}}</p>' +
      '<p>Payment Terms: {{PAYMENT_TERMS}}</p>' +
      '<h2>3. TERM</h2>' +
      '<p>This agreement begins on {{START_DATE}} and ends on {{END_DATE}}.</p>' +
      '<h2>4. SIGNATURES</h2>' +
      '<p>Company: {{COMPANY_NAME}}</p>' +
      '<p>Client: {{CLIENT_NAME}}</p>' +
      '<p>Date: {{CURRENT_DATE}}</p>'
  },
  {
    name: 'Legal Retainer Agreement',
    description: 'Attorney-client retainer agreement',
    document_type: 'contract',
    industry: 'legal',
    content: '<h1>ATTORNEY-CLIENT RETAINER AGREEMENT</h1>' +
      '<p>This Retainer Agreement is entered into between {{COMPANY_NAME}} ("Attorney") and {{CLIENT_NAME}} ("Client").</p>' +
      '<h2>1. LEGAL SERVICES</h2>' +
      '<p>Attorney agrees to represent Client in the following matter: {{CASE_DESCRIPTION}}</p>' +
      '<h2>2. RETAINER FEE</h2>' +
      '<p>Client agrees to pay a retainer fee of ${{RETAINER_AMOUNT}} upon execution of this agreement.</p>' +
      '<h2>3. HOURLY RATE</h2>' +
      '<p>Attorney\'s hourly rate is ${{HOURLY_RATE}} per hour.</p>' +
      '<h2>4. CONFIDENTIALITY</h2>' +
      '<p>All communications between Attorney and Client are protected by attorney-client privilege.</p>' +
      '<h2>5. SIGNATURES</h2>' +
      '<p>Attorney: {{COMPANY_NAME}}</p>' +
      '<p>Client Signature: ________________________</p>' +
      '<p>Date: {{CURRENT_DATE}}</p>'
  }
]

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
      { id: '5', name: 'services_needed', label: 'Services Needed', type: 'textarea', required: true, order: 5 }
    ]
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

// Simple kit templates without AI generation
const KIT_TEMPLATES = [
  {
    name: 'Legal Services Onboarding Kit',
    description: 'Complete onboarding process for legal service clients',
    industry: 'Legal Services',
    category: 'onboarding',
    steps: [
      {
        name: 'Client Intake',
        description: 'Collect basic client information',
        step_order: 1,
        step_type: 'form',
        responsibility: 'client',
        is_required: true,
        estimated_duration_hours: 1,
        config: { form_type: 'intake' }
      },
      {
        name: 'Retainer Agreement',
        description: 'Sign retainer agreement',
        step_order: 2,
        step_type: 'document',
        responsibility: 'both',
        is_required: true,
        estimated_duration_hours: 2,
        config: { document_type: 'contract', requires_signature: true }
      },
      {
        name: 'Retainer Payment',
        description: 'Process retainer fee payment',
        step_order: 3,
        step_type: 'payment',
        responsibility: 'client',
        is_required: true,
        estimated_duration_hours: 1,
        config: { payment_type: 'retainer' }
      }
    ]
  },
  {
    name: 'Business Consulting Onboarding Kit',
    description: 'Onboarding process for business consulting clients',
    industry: 'Business Consulting',
    category: 'onboarding',
    steps: [
      {
        name: 'Business Assessment',
        description: 'Complete business assessment form',
        step_order: 1,
        step_type: 'form',
        responsibility: 'client',
        is_required: true,
        estimated_duration_hours: 2,
        config: { form_type: 'assessment' }
      },
      {
        name: 'Service Agreement',
        description: 'Review and sign service agreement',
        step_order: 2,
        step_type: 'document',
        responsibility: 'both',
        is_required: true,
        estimated_duration_hours: 1,
        config: { document_type: 'agreement', requires_signature: true }
      },
      {
        name: 'Project Kickoff',
        description: 'Schedule project kickoff meeting',
        step_order: 3,
        step_type: 'calendar',
        responsibility: 'company',
        is_required: true,
        estimated_duration_hours: 1,
        config: { meeting_type: 'kickoff' }
      }
    ]
  }
]

async function seedKitTemplates() {
  console.log('Seeding kit templates...')

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

  for (const kit of KIT_TEMPLATES) {
    // Create the template
    const { data: template, error: templateError } = await supabase
      .from('kit_templates')
      .insert({
        name: kit.name,
        description: kit.description,
        industry: kit.industry,
        category: kit.category,
        is_premium: false,
        price: 0,
        created_by: globalAdmin.id,
        metadata: { seeded: true }
      })
      .select()
      .single()

    if (templateError) {
      console.error(`Error creating template ${kit.name}:`, templateError)
      continue
    }

    // Create the steps
    if (kit.steps && kit.steps.length > 0) {
      const stepsToInsert = kit.steps.map(step => ({
        ...step,
        template_id: template.id
      }))

      const { error: stepsError } = await supabase
        .from('kit_template_steps')
        .insert(stepsToInsert)

      if (stepsError) {
        console.error(`Error creating steps for ${kit.name}:`, stepsError)
        // Rollback template creation
        await supabase.from('kit_templates').delete().eq('id', template.id)
        continue
      }
    }

    console.log(`✅ Created kit template: ${kit.name}`)
  }
}

async function main() {
  try {
    console.log('Starting seeding process...')
    await seedDocumentTemplates()
    await seedFormTemplates()
    await seedKitTemplates()
    console.log('✅ Seeding completed successfully!')
  } catch (error) {
    console.error('❌ Seeding failed:', error)
  }
}

main()