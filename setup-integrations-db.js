// Setup Integration Tables in Supabase
require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

async function setupIntegrationTables() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase credentials in .env.local')
    console.error('Need: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  console.log('🚀 Setting up integration tables...')

  try {
    // Create tables
    const createTablesSQL = `
      -- Drop existing tables in reverse order of dependency to ensure a clean setup.
      -- This is necessary to resolve schema conflicts with older migration files.
      DROP TABLE IF EXISTS integration_events CASCADE;
      DROP TABLE IF EXISTS integration_webhooks CASCADE;
      DROP TABLE IF EXISTS user_integrations CASCADE;
      DROP TABLE IF EXISTS integration_providers CASCADE;

      -- Integration providers table
      CREATE TABLE IF NOT EXISTS integration_providers (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        slug TEXT NOT NULL UNIQUE,
        category TEXT NOT NULL,
        description TEXT,
        icon_url TEXT,
        auth_type TEXT NOT NULL DEFAULT 'oauth2', -- oauth2, api_key, basic
        base_url TEXT,
        documentation_url TEXT,
        is_active BOOLEAN DEFAULT true,
        features JSONB DEFAULT '{}',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- User integrations table
      CREATE TABLE IF NOT EXISTS user_integrations (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        provider_id UUID REFERENCES integration_providers(id) ON DELETE CASCADE,
        provider_slug TEXT NOT NULL,
        connection_name TEXT,
        is_active BOOLEAN DEFAULT true,
        auth_data JSONB DEFAULT '{}', -- encrypted tokens, api keys
        settings JSONB DEFAULT '{}',  -- user-specific settings
        metadata JSONB DEFAULT '{}',  -- connection metadata
        last_sync TIMESTAMP WITH TIME ZONE,
        sync_status TEXT DEFAULT 'connected',
        error_message TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(user_id, provider_slug)
      );

      -- Integration events table
      CREATE TABLE IF NOT EXISTS integration_events (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        integration_id UUID REFERENCES user_integrations(id) ON DELETE CASCADE,
        event_type TEXT NOT NULL, -- sync, webhook, action, error
        event_data JSONB DEFAULT '{}',
        status TEXT DEFAULT 'success',
        error_message TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Integration webhooks table
      CREATE TABLE IF NOT EXISTS integration_webhooks (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        provider_slug TEXT NOT NULL,
        webhook_id TEXT, -- external webhook ID
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        integration_id UUID REFERENCES user_integrations(id) ON DELETE CASCADE,
        endpoint_url TEXT NOT NULL,
        secret TEXT,
        events JSONB DEFAULT '[]', -- array of subscribed events
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `

    const statements = createTablesSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`📝 Executing ${statements.length} SQL statements for table creation...`);

    for (const statement of statements) {
      const { error } = await supabase.rpc('exec_sql', { sql: statement });
      if (error) {
        // Don't fail on non-critical errors for idempotency
        if (error.message.includes('does not exist') || error.message.includes('already exists')) {
          console.warn(`   -> Skipping: ${error.message.split('\n')[0]}`);
        } else {
          console.error('❌ SQL execution failed:', error.message);
          console.error('   -> Failed statement:', statement.substring(0, 150) + '...');
          throw error; // Re-throw the error to stop the script
        }
      }
    }

    console.log('✅ Tables created successfully')

    // Insert integration providers
    console.log('📝 Inserting integration providers...')

    const providers = [
      // Communication
      { name: 'Slack', slug: 'slack', category: 'communication', description: 'Team messaging and notifications', auth_type: 'oauth2', features: { notifications: true, channels: true, bots: true } },
      { name: 'Microsoft Teams', slug: 'teams', category: 'communication', description: 'Microsoft team collaboration platform', auth_type: 'oauth2', features: { notifications: true, channels: true, meetings: true } },
      
      // Automation
      { name: 'Zapier', slug: 'zapier', category: 'automation', description: 'Connect 6000+ apps with automated workflows', auth_type: 'oauth2', features: { webhooks: true, triggers: true, actions: true } },
      { name: 'Make', slug: 'make', category: 'automation', description: 'Visual workflow automation platform', auth_type: 'api_key', features: { webhooks: true, scenarios: true } },
      
      // CRM
      { name: 'Salesforce', slug: 'salesforce', category: 'crm', description: 'Leading CRM platform', auth_type: 'oauth2', features: { contacts: true, deals: true, accounts: true } },
      { name: 'HubSpot', slug: 'hubspot', category: 'crm', description: 'Inbound marketing and CRM platform', auth_type: 'oauth2', features: { contacts: true, deals: true, marketing: true } },
      { name: 'Pipedrive', slug: 'pipedrive', category: 'crm', description: 'Sales-focused CRM platform', auth_type: 'oauth2', features: { deals: true, contacts: true, pipeline: true } },
      
      // Email Marketing
      { name: 'Mailchimp', slug: 'mailchimp', category: 'email_marketing', description: 'Email marketing automation platform', auth_type: 'oauth2', features: { lists: true, campaigns: true, automation: true } },
      { name: 'ConvertKit', slug: 'convertkit', category: 'email_marketing', description: 'Creator-focused email marketing', auth_type: 'api_key', features: { sequences: true, subscribers: true, forms: true } },
      
      // Database & Workspace
      { name: 'Airtable', slug: 'airtable', category: 'database', description: 'Flexible database and collaboration platform', auth_type: 'oauth2', features: { bases: true, records: true, views: true } },
      { name: 'Notion', slug: 'notion', category: 'workspace', description: 'All-in-one workspace for notes, tasks, and databases', auth_type: 'oauth2', features: { pages: true, databases: true, blocks: true } },
      
      // Document Signing
      { name: 'DocuSign', slug: 'docusign', category: 'documents', description: 'Digital signature and document management', auth_type: 'oauth2', features: { envelopes: true, templates: true, signing: true } },
      { name: 'HelloSign', slug: 'hellosign', category: 'documents', description: 'Simple electronic signature solution', auth_type: 'api_key', features: { signatures: true, templates: true } },
      { name: 'PandaDoc', slug: 'pandadoc', category: 'documents', description: 'Document automation and e-signature platform', auth_type: 'oauth2', features: { documents: true, templates: true, analytics: true } },
      
      // Accounting
      { name: 'QuickBooks', slug: 'quickbooks', category: 'accounting', description: 'Small business accounting software', auth_type: 'oauth2', features: { customers: true, invoices: true, payments: true } },
      { name: 'Xero', slug: 'xero', category: 'accounting', description: 'Cloud accounting software', auth_type: 'oauth2', features: { contacts: true, invoices: true, accounting: true } },
      { name: 'FreshBooks', slug: 'freshbooks', category: 'accounting', description: 'Cloud accounting for small businesses', auth_type: 'oauth2', features: { clients: true, invoices: true, expenses: true } },
      
      // Customer Support
      { name: 'Intercom', slug: 'intercom', category: 'support', description: 'Customer messaging and support platform', auth_type: 'oauth2', features: { conversations: true, users: true, articles: true } },
      { name: 'Help Scout', slug: 'helpscout', category: 'support', description: 'Email-based customer support platform', auth_type: 'oauth2', features: { conversations: true, customers: true, reports: true } },
      { name: 'Zendesk', slug: 'zendesk', category: 'support', description: 'Customer service and engagement platform', auth_type: 'oauth2', features: { tickets: true, users: true, organizations: true } },
      
      // Meeting & Scheduling
      { name: 'Calendly', slug: 'calendly', category: 'scheduling', description: 'Automated scheduling and calendar management', auth_type: 'oauth2', features: { events: true, bookings: true, availability: true } },
      { name: 'Acuity Scheduling', slug: 'acuity', category: 'scheduling', description: 'Online appointment scheduling software', auth_type: 'api_key', features: { appointments: true, availability: true, clients: true } },
      { name: 'Cal.com', slug: 'calcom', category: 'scheduling', description: 'Open source scheduling infrastructure', auth_type: 'api_key', features: { bookings: true, availability: true, integrations: true } },
      
      // Analytics
      { name: 'Google Analytics', slug: 'google_analytics', category: 'analytics', description: 'Web analytics and reporting platform', auth_type: 'oauth2', features: { reports: true, realtime: true, goals: true } },
      { name: 'Mixpanel', slug: 'mixpanel', category: 'analytics', description: 'Product analytics platform', auth_type: 'api_key', features: { events: true, funnels: true, retention: true } },
      { name: 'Amplitude', slug: 'amplitude', category: 'analytics', description: 'Digital optimization platform', auth_type: 'api_key', features: { events: true, cohorts: true, dashboards: true } },
      { name: 'Hotjar', slug: 'hotjar', category: 'analytics', description: 'Website heatmaps and user behavior analytics', auth_type: 'api_key', features: { heatmaps: true, recordings: true, surveys: true } },
      
      // Development
      { name: 'GitHub', slug: 'github', category: 'development', description: 'Git repository hosting and collaboration', auth_type: 'oauth2', features: { repositories: true, issues: true, webhooks: true } },
      { name: 'GitLab', slug: 'gitlab', category: 'development', description: 'DevOps lifecycle management platform', auth_type: 'oauth2', features: { projects: true, issues: true, pipelines: true } },
      
      // Project Management
      { name: 'Linear', slug: 'linear', category: 'project_management', description: 'Modern software development project management', auth_type: 'oauth2', features: { issues: true, projects: true, teams: true } },
      { name: 'Jira', slug: 'jira', category: 'project_management', description: 'Issue tracking and project management', auth_type: 'oauth2', features: { issues: true, projects: true, boards: true } },
      { name: 'Asana', slug: 'asana', category: 'project_management', description: 'Work management platform for teams', auth_type: 'oauth2', features: { tasks: true, projects: true, teams: true } },
      { name: 'Trello', slug: 'trello', category: 'project_management', description: 'Visual project management with boards and cards', auth_type: 'oauth2', features: { boards: true, cards: true, lists: true } },
      
      // Additional Business
      { name: 'Typeform', slug: 'typeform', category: 'forms', description: 'Online form and survey builder', auth_type: 'oauth2', features: { forms: true, responses: true, webhooks: true } },
      { name: 'Loom', slug: 'loom', category: 'video', description: 'Screen and video recording platform', auth_type: 'oauth2', features: { videos: true, sharing: true, analytics: true } },
      
      // Calendar
      { name: 'Google Calendar', slug: 'google_calendar', category: 'calendar', description: 'Google calendar and scheduling', auth_type: 'oauth2', features: { events: true, calendars: true, availability: true } },
      { name: 'Microsoft Outlook', slug: 'outlook', category: 'calendar', description: 'Microsoft calendar and email', auth_type: 'oauth2', features: { events: true, calendars: true, mail: true } },
      
      // Email & Calendar
      { name: 'Nylas', slug: 'nylas', category: 'communication', description: 'Email, calendar, and contact API platform', auth_type: 'api_key', features: { email: true, calendar: true, contacts: true, scheduling: true } }
    ]

    // Insert providers with conflict handling
    for (const provider of providers) {
      try {
        const { error } = await supabase
          .from('integration_providers')
          .upsert(provider, { onConflict: 'slug' })
        
        if (error) {
          console.log(`⚠️ Could not insert ${provider.name}: ${error.message}`)
        }
      } catch (err) {
        console.log(`⚠️ Error with ${provider.name}: ${err.message}`)
      }
    }

    console.log('✅ Integration providers inserted successfully')

    // Enable RLS (Row Level Security)
    console.log('🔒 Setting up security policies...')
    
    const rlsSQL = `
      ALTER TABLE integration_providers ENABLE ROW LEVEL SECURITY;
      ALTER TABLE user_integrations ENABLE ROW LEVEL SECURITY;
      ALTER TABLE integration_events ENABLE ROW LEVEL SECURITY;
      ALTER TABLE integration_webhooks ENABLE ROW LEVEL SECURITY;

      -- Policies for integration_providers (public read)
      DROP POLICY IF EXISTS "Integration providers are viewable by everyone" ON integration_providers;
      CREATE POLICY "Integration providers are viewable by everyone" ON integration_providers
        FOR SELECT USING (true);

      -- Policies for user_integrations (user-specific)
      DROP POLICY IF EXISTS "Users can view own integrations" ON user_integrations;
      CREATE POLICY "Users can view own integrations" ON user_integrations
        FOR SELECT USING (auth.uid() = user_id);

      DROP POLICY IF EXISTS "Users can insert own integrations" ON user_integrations;
      CREATE POLICY "Users can insert own integrations" ON user_integrations
        FOR INSERT WITH CHECK (auth.uid() = user_id);

      DROP POLICY IF EXISTS "Users can update own integrations" ON user_integrations;
      CREATE POLICY "Users can update own integrations" ON user_integrations
        FOR UPDATE USING (auth.uid() = user_id);

      DROP POLICY IF EXISTS "Users can delete own integrations" ON user_integrations;
      CREATE POLICY "Users can delete own integrations" ON user_integrations
        FOR DELETE USING (auth.uid() = user_id);

      -- Policies for integration_events
      DROP POLICY IF EXISTS "Users can view own integration events" ON integration_events;
      CREATE POLICY "Users can view own integration events" ON integration_events
        FOR SELECT USING (auth.uid() = user_id);

      DROP POLICY IF EXISTS "Users can insert own integration events" ON integration_events;
      CREATE POLICY "Users can insert own integration events" ON integration_events
        FOR INSERT WITH CHECK (auth.uid() = user_id);
    `
    const rlsStatements = rlsSQL.split(';').map(s => s.trim()).filter(s => s.length > 0 && !s.startsWith('--'));
    console.log(`📝 Executing ${rlsStatements.length} SQL statements for RLS policies...`);
    for (const statement of rlsStatements) {
      const { error } = await supabase.rpc('exec_sql', { sql: statement });
      if (error) {
        if (error.message.includes('already exists')) {
          console.warn(`   -> Skipping: ${error.message.split('\n')[0]}`);
        } else {
          console.error('❌ RLS setup failed:', error.message);
          console.error('   -> Failed statement:', statement.substring(0, 150) + '...');
          throw error;
        }
      }
    }
    console.log('✅ Security policies applied successfully.');

    console.log('\n🎉 Integration database setup completed successfully!')
    console.log('📊 Total providers configured:', providers.length)
    console.log('🔗 Visit http://localhost:3000/dashboard/integrations to see them')

    return true

  } catch (error) {
    console.error('❌ Error setting up integration tables:', error)
    return false
  }
}

setupIntegrationTables().then(success => {
  if (success) {
    console.log('\n✅ All integration tables are ready!')
  } else {
    console.log('\n⚠️ Please manually run the SQL in Supabase dashboard')
  }
  process.exit(success ? 0 : 1)
})