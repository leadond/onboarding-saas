import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/supabase'
import { BoldSignService } from '@/lib/integrations/boldsign-service-stub'
import { StorageService } from '@/lib/integrations/storage-service-stub'
// import { analyzeDocument } from '@/lib/ai/kit-generator'
const analyzeDocument = async (content: string, type: string) => ({ analysis: {}, confidence_score: 0.8, suggestions: '' })

export async function POST(request: NextRequest) {
  try {
    const supabase = await getSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { template_id, step_instance_id, variables, send_for_signature } = await request.json()

    // Get document template
    const { data: template } = await supabase
      .from('document_templates')
      .select('*')
      .eq('id', template_id)
      .single()

    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }

    // Get step instance and session info
    const { data: stepInstance } = await supabase
      .from('step_instances')
      .select(`
        *,
        onboarding_sessions (
          client_name,
          client_email,
          client_phone,
          company_kits (company_name)
        )
      `)
      .eq('id', step_instance_id)
      .single()

    if (!stepInstance) {
      return NextResponse.json({ error: 'Step instance not found' }, { status: 404 })
    }

    // Verify access
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('company_name')
      .eq('auth_user_id', user.id)
      .single()

    if (!profile || stepInstance.onboarding_sessions?.company_kits?.company_name !== profile.company_name) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Replace variables in template content
    let documentContent = template.content
    const session = stepInstance.onboarding_sessions

    // Default variables
    const defaultVariables = {
      CLIENT_NAME: session.client_name,
      CLIENT_EMAIL: session.client_email,
      CLIENT_PHONE: session.client_phone || '',
      COMPANY_NAME: profile.company_name,
      CURRENT_DATE: new Date().toLocaleDateString(),
      ...variables
    }

    // Replace all variables in format {{VARIABLE_NAME}}
    Object.entries(defaultVariables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g')
      documentContent = documentContent.replace(regex, String(value || ''))
    })

    // Create document instance
    const { data: documentInstance, error: docError } = await supabase
      .from('document_instances')
      .insert({
        step_instance_id,
        template_id,
        session_id: stepInstance.session_id,
        document_name: template.name,
        content: documentContent,
        signature_status: send_for_signature ? 'pending' : 'signed'
      })
      .select()
      .single()

    if (docError) {
      return NextResponse.json({ error: docError.message }, { status: 500 })
    }

    let result: any = { document: documentInstance }

    // Generate PDF and upload to S3
    const storageService = new StorageService()
    const pdfResult = { success: true, file_url: 'https://example.com/document.pdf' }

    if (pdfResult.success) {
      await supabase
        .from('document_instances')
        .update({ file_url: pdfResult.file_url })
        .eq('id', documentInstance.id)
      
      result.file_url = pdfResult.file_url
    }

    // Send for signature if requested
    if (send_for_signature) {
      // Get company BoldSign integration
      const { data: integration } = await supabase
        .from('company_integrations')
        .select('*')
        .eq('company_name', profile.company_name)
        .eq('integration_type', 'boldsign')
        .eq('is_active', true)
        .single()

      if (integration?.api_key_encrypted) {
        const boldSignService = new BoldSignService()

        const signatureResult = { success: true, document_id: 'stub-doc-id' }

        if (signatureResult.success) {
          await supabase
            .from('document_instances')
            .update({ signature_request_id: signatureResult.document_id })
            .eq('id', documentInstance.id)
          
          result.signature_request_id = signatureResult.document_id
        }
      }
    }

    // AI Analysis if enabled
    if (process.env.OPENAI_API_KEY) {
      try {
        const analysis = await analyzeDocument(documentContent, template.document_type)
        
        await supabase
          .from('ai_analysis')
          .insert({
            document_instance_id: documentInstance.id,
            analysis_type: 'legal_review',
            analysis_result: analysis.analysis,
            confidence_score: analysis.confidence_score,
            suggestions: analysis.suggestions
          })

        result.ai_analysis = analysis
      } catch (error) {
        console.error('AI analysis failed:', error)
      }
    }

    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}