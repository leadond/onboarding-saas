import type { EmailTemplate, NotificationContext } from './email-service'

/**
 * Replace template variables in text with context values
 */
function replaceVariables(
  template: string,
  variables: Record<string, any>
): string {
  let result = template

  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, 'g')
    result = result.replace(regex, String(value || ''))
  })

  return result
}

/**
 * Get common variables available in all templates
 */
function getCommonVariables(context: NotificationContext): Record<string, any> {
  const companyName =
    context.kit.user?.company_name || context.kit.user?.full_name || 'Our Team'
  const clientName = context.client.name || 'there'
  const kitName = context.kit.name
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || 'https://app.onboardhero.com'
  const kitUrl = `${baseUrl}/kit/${context.kit.id}?client=${context.client.identifier}`

  return {
    companyName,
    clientName,
    kitName,
    kitUrl,
    baseUrl,
    brandColor: context.kit.brand_color || '#3B82F6',
    logoUrl: context.kit.logo_url || '',
    supportEmail: context.kit.user?.email || 'support@onboardhero.com',
    completionPercentage: context.completionPercentage || 0,
    totalSteps: context.totalSteps || 0,
    completedSteps: context.completedSteps || 0,
    stepName: context.step?.title || '',
    stepType: context.step?.step_type || '',
    currentYear: new Date().getFullYear(),
  }
}

/**
 * Generate base HTML template
 */
function getBaseHtmlTemplate(
  content: string,
  variables: Record<string, any>
): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{kitName}} - {{companyName}}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      line-height: 1.6;
      color: #333333;
      max-width: 600px;
      margin: 0 auto;
      background-color: #f8fafc;
    }
    .container {
      background-color: #ffffff;
      margin: 20px;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }
    .header {
      background: linear-gradient(135deg, {{brandColor}}, {{brandColor}}dd);
      color: white;
      padding: 40px 30px;
      text-align: center;
    }
    .logo {
      max-height: 50px;
      margin-bottom: 20px;
    }
    .content {
      padding: 40px 30px;
    }
    .button {
      display: inline-block;
      background-color: {{brandColor}};
      color: white;
      padding: 12px 24px;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      margin: 20px 0;
      text-align: center;
    }
    .button:hover {
      opacity: 0.9;
    }
    .progress-bar {
      width: 100%;
      height: 8px;
      background-color: #e5e7eb;
      border-radius: 4px;
      overflow: hidden;
      margin: 20px 0;
    }
    .progress-fill {
      height: 100%;
      background-color: {{brandColor}};
      transition: width 0.3s ease;
    }
    .stats {
      display: flex;
      justify-content: space-around;
      margin: 30px 0;
      text-align: center;
    }
    .stat {
      flex: 1;
    }
    .stat-value {
      font-size: 24px;
      font-weight: bold;
      color: {{brandColor}};
    }
    .stat-label {
      font-size: 12px;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .footer {
      background-color: #f8fafc;
      padding: 30px;
      text-align: center;
      color: #6b7280;
      font-size: 14px;
      border-top: 1px solid #e5e7eb;
    }
    .footer a {
      color: {{brandColor}};
      text-decoration: none;
    }
    @media only screen and (max-width: 600px) {
      .container {
        margin: 0;
        border-radius: 0;
      }
      .content, .header, .footer {
        padding: 30px 20px;
      }
      .stats {
        flex-direction: column;
        gap: 20px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      ${variables.logoUrl ? `<img src="{{logoUrl}}" alt="{{companyName}}" class="logo">` : ''}
      <h1 style="margin: 0; font-size: 28px;">{{companyName}}</h1>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p>This email was sent by {{companyName}}. If you have any questions, please contact <a href="mailto:{{supportEmail}}">{{supportEmail}}</a></p>
      <p>&copy; {{currentYear}} {{companyName}}. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `.trim()
}

/**
 * Welcome email template
 */
function getWelcomeTemplate(context: NotificationContext): EmailTemplate {
  const variables = getCommonVariables(context)

  const subject = `Welcome to {{companyName}} - Let's get started with {{kitName}}!`

  const htmlContent = `
    <h2 style="color: {{brandColor}}; margin-top: 0;">Welcome, {{clientName}}! 🎉</h2>
    <p>We're excited to have you on board! You've been invited to complete our onboarding process, and we're here to make it as smooth as possible.</p>
    
    <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; border-left: 4px solid {{brandColor}}; margin: 30px 0;">
      <h3 style="margin-top: 0; color: {{brandColor}};">What's Next?</h3>
      <p style="margin-bottom: 0;">Click the button below to access your personalized onboarding portal and get started with the first step.</p>
    </div>
    
    <div style="text-align: center;">
      <a href="{{kitUrl}}" class="button">Start Your Onboarding Journey →</a>
    </div>
    
    <div class="stats">
      <div class="stat">
        <div class="stat-value">{{totalSteps}}</div>
        <div class="stat-label">Steps to Complete</div>
      </div>
      <div class="stat">
        <div class="stat-value">~15</div>
        <div class="stat-label">Minutes Total</div>
      </div>
      <div class="stat">
        <div class="stat-value">24/7</div>
        <div class="stat-label">Support Available</div>
      </div>
    </div>
    
    <p><strong>Need help?</strong> Don't hesitate to reach out to us at <a href="mailto:{{supportEmail}}">{{supportEmail}}</a> if you have any questions along the way.</p>
    
    <p>Looking forward to working with you!</p>
    <p><strong>The {{companyName}} Team</strong></p>
  `

  const textContent = `
Welcome to {{companyName}}, {{clientName}}!

We're excited to have you on board! You've been invited to complete our onboarding process for {{kitName}}.

To get started, please visit: {{kitUrl}}

You'll need to complete {{totalSteps}} steps, which should take about 15 minutes total.

If you have any questions, please contact us at {{supportEmail}}.

Looking forward to working with you!
The {{companyName}} Team
  `.trim()

  return {
    subject: replaceVariables(subject, variables),
    html: replaceVariables(
      getBaseHtmlTemplate(htmlContent, variables),
      variables
    ),
    text: replaceVariables(textContent, variables),
    variables,
  }
}

/**
 * Step completion email template
 */
function getStepCompletionTemplate(
  context: NotificationContext
): EmailTemplate {
  const variables = getCommonVariables(context)

  const subject = `Great progress on {{kitName}} - {{stepName}} completed! 🎯`

  const htmlContent = `
    <h2 style="color: {{brandColor}}; margin-top: 0;">Awesome work, {{clientName}}! ✨</h2>
    <p>You just completed "<strong>{{stepName}}</strong>" in your {{kitName}} onboarding process. You're making excellent progress!</p>
    
    <div class="progress-bar">
      <div class="progress-fill" style="width: {{completionPercentage}}%"></div>
    </div>
    <p style="text-align: center; color: #6b7280; margin-top: 10px;">{{completionPercentage}}% Complete</p>
    
    <div class="stats">
      <div class="stat">
        <div class="stat-value">{{completedSteps}}</div>
        <div class="stat-label">Completed</div>
      </div>
      <div class="stat">
        <div class="stat-value">{{totalSteps}}</div>
        <div class="stat-label">Total Steps</div>
      </div>
      <div class="stat">
        <div class="stat-value">${context.totalSteps && context.completedSteps ? context.totalSteps - context.completedSteps : 0}</div>
        <div class="stat-label">Remaining</div>
      </div>
    </div>
    
    ${
      (context.completionPercentage || 0) < 100
        ? `
      <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; border-left: 4px solid {{brandColor}}; margin: 30px 0;">
        <h3 style="margin-top: 0; color: {{brandColor}};">Keep the momentum going!</h3>
        <p style="margin-bottom: 0;">You're doing great! Click below to continue with your next step.</p>
      </div>
      
      <div style="text-align: center;">
        <a href="{{kitUrl}}" class="button">Continue Your Progress →</a>
      </div>
    `
        : `
      <div style="background-color: #ecfdf5; padding: 20px; border-radius: 8px; border-left: 4px solid #10b981; margin: 30px 0;">
        <h3 style="margin-top: 0; color: #059669;">🎉 Congratulations! You're all done!</h3>
        <p style="margin-bottom: 0;">You've completed all steps in your onboarding process. Welcome aboard!</p>
      </div>
    `
    }
    
    <p>If you have any questions about what you just completed or what's coming next, don't hesitate to reach out.</p>
    
    <p>Keep up the excellent work!</p>
    <p><strong>The {{companyName}} Team</strong></p>
  `

  const textContent = `
Great work, {{clientName}}!

You just completed "{{stepName}}" in your {{kitName}} onboarding process.

Progress: {{completedSteps}} of {{totalSteps}} steps complete ({{completionPercentage}}%)

${
  (context.completionPercentage || 0) < 100
    ? 'Continue your progress: {{kitUrl}}'
    : "Congratulations! You've completed all steps in your onboarding process."
}

If you have any questions, please contact us at {{supportEmail}}.

Keep up the excellent work!
The {{companyName}} Team
  `.trim()

  return {
    subject: replaceVariables(subject, variables),
    html: replaceVariables(
      getBaseHtmlTemplate(htmlContent, variables),
      variables
    ),
    text: replaceVariables(textContent, variables),
    variables,
  }
}

/**
 * Reminder email template
 */
function getReminderTemplate(
  context: NotificationContext & { daysSinceLastActivity?: number }
): EmailTemplate {
  const variables = {
    ...getCommonVariables(context),
    daysSinceLastActivity: String(context.daysSinceLastActivity || 1),
  }

  const subject = `Don't forget to continue your {{kitName}} onboarding`

  const daysSince = context.daysSinceLastActivity || 1
  const encouragementMessage =
    daysSince === 1
      ? "We noticed you started your onboarding yesterday but haven't finished yet."
      : `It's been ${daysSince} days since you last worked on your onboarding.`

  const htmlContent = `
    <h2 style="color: {{brandColor}}; margin-top: 0;">Hi {{clientName}}! 👋</h2>
    <p>${encouragementMessage} No worries - we're here to help you get back on track!</p>
    
    <div class="progress-bar">
      <div class="progress-fill" style="width: {{completionPercentage}}%"></div>
    </div>
    <p style="text-align: center; color: #6b7280; margin-top: 10px;">{{completionPercentage}}% Complete</p>
    
    <div style="background-color: #fffbeb; padding: 20px; border-radius: 8px; border-left: 4px solid #f59e0b; margin: 30px 0;">
      <h3 style="margin-top: 0; color: #d97706;">You're almost there!</h3>
      <p>You've already completed {{completedSteps}} out of {{totalSteps}} steps. Just ${(context.totalSteps || 0) - (context.completedSteps || 0)} more to go!</p>
      <p style="margin-bottom: 0;">It should only take a few more minutes to finish.</p>
    </div>
    
    <div style="text-align: center;">
      <a href="{{kitUrl}}" class="button">Resume Your Onboarding →</a>
    </div>
    
    <div class="stats">
      <div class="stat">
        <div class="stat-value">{{completedSteps}}</div>
        <div class="stat-label">Completed</div>
      </div>
      <div class="stat">
        <div class="stat-value">${(context.totalSteps || 0) - (context.completedSteps || 0)}</div>
        <div class="stat-label">Remaining</div>
      </div>
      <div class="stat">
        <div class="stat-value">~5</div>
        <div class="stat-label">Minutes Left</div>
      </div>
    </div>
    
    <p><strong>Need assistance?</strong> If you're stuck on anything or have questions, we're here to help! Just reply to this email or contact us at <a href="mailto:{{supportEmail}}">{{supportEmail}}</a>.</p>
    
    <p>We're excited to complete this journey with you!</p>
    <p><strong>The {{companyName}} Team</strong></p>
  `

  const textContent = `
Hi {{clientName}}!

${encouragementMessage} No worries - we're here to help you get back on track!

Your Progress: {{completedSteps}} of {{totalSteps}} steps complete ({{completionPercentage}}%)

You're almost there! Just ${(context.totalSteps || 0) - (context.completedSteps || 0)} more steps to go.

Continue your onboarding: {{kitUrl}}

If you need any assistance, please contact us at {{supportEmail}}.

We're excited to complete this journey with you!
The {{companyName}} Team
  `.trim()

  return {
    subject: replaceVariables(subject, variables),
    html: replaceVariables(
      getBaseHtmlTemplate(htmlContent, variables),
      variables
    ),
    text: replaceVariables(textContent, variables),
    variables,
  }
}

/**
 * Completion celebration email template
 */
function getCompletionTemplate(context: NotificationContext): EmailTemplate {
  const variables = getCommonVariables(context)

  const subject = `🎉 Congratulations! You've completed {{kitName}}!`

  const htmlContent = `
    <div style="text-align: center; margin-bottom: 30px;">
      <div style="font-size: 72px; margin-bottom: 20px;">🎉</div>
      <h2 style="color: {{brandColor}}; margin: 0; font-size: 32px;">Congratulations, {{clientName}}!</h2>
    </div>
    
    <p style="font-size: 18px; text-align: center; color: #374151; margin-bottom: 30px;">
      You've successfully completed your <strong>{{kitName}}</strong> onboarding process!
    </p>
    
    <div style="background: linear-gradient(135deg, {{brandColor}}10, {{brandColor}}05); padding: 30px; border-radius: 12px; text-align: center; margin: 30px 0;">
      <h3 style="color: {{brandColor}}; margin-top: 0;">🏆 Mission Accomplished!</h3>
      <p>You've completed all {{totalSteps}} steps in your onboarding journey. Welcome to the {{companyName}} family!</p>
    </div>
    
    <div class="stats">
      <div class="stat">
        <div class="stat-value">{{totalSteps}}</div>
        <div class="stat-label">Steps Completed</div>
      </div>
      <div class="stat">
        <div class="stat-value">100%</div>
        <div class="stat-label">Progress</div>
      </div>
      <div class="stat">
        <div class="stat-value">✅</div>
        <div class="stat-label">Status</div>
      </div>
    </div>
    
    <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; border-left: 4px solid {{brandColor}}; margin: 30px 0;">
      <h3 style="margin-top: 0; color: {{brandColor}};">What happens next?</h3>
      <ul style="margin-bottom: 0; padding-left: 20px;">
        <li>Our team will review your information and reach out within 24 hours</li>
        <li>You'll receive access to your client portal and resources</li>
        <li>We'll schedule any necessary follow-up meetings or calls</li>
      </ul>
    </div>
    
    ${
      context.kit.completion_redirect_url
        ? `
      <div style="text-align: center;">
        <a href="{{kitUrl}}" class="button">Access Your Client Portal →</a>
      </div>
    `
        : ''
    }
    
    <div style="background-color: #fefce8; padding: 20px; border-radius: 8px; border-left: 4px solid #eab308; margin: 30px 0;">
      <h3 style="margin-top: 0; color: #a16207;">📞 Questions? We're here to help!</h3>
      <p style="margin-bottom: 0;">If you have any questions or need clarification on anything, don't hesitate to reach out to us at <a href="mailto:{{supportEmail}}" style="color: #a16207;">{{supportEmail}}</a>.</p>
    </div>
    
    <p style="font-size: 18px; text-align: center; margin-top: 40px;">
      <strong>Thank you for choosing {{companyName}}!</strong><br>
      We're excited to work with you and help you achieve your goals.
    </p>
    
    <p style="text-align: center;">
      <strong>The {{companyName}} Team</strong> 🚀
    </p>
  `

  const textContent = `
🎉 CONGRATULATIONS, {{clientName}}! 🎉

You've successfully completed your {{kitName}} onboarding process!

✅ {{totalSteps}} steps completed
✅ 100% progress achieved
✅ Welcome to the {{companyName}} family!

WHAT HAPPENS NEXT?
• Our team will review your information and reach out within 24 hours
• You'll receive access to your client portal and resources  
• We'll schedule any necessary follow-up meetings or calls

${context.kit.completion_redirect_url ? `Access your client portal: {{kitUrl}}` : ''}

Questions? Contact us at {{supportEmail}}

Thank you for choosing {{companyName}}!
We're excited to work with you and help you achieve your goals.

The {{companyName}} Team 🚀
  `.trim()

  return {
    subject: replaceVariables(subject, variables),
    html: replaceVariables(
      getBaseHtmlTemplate(htmlContent, variables),
      variables
    ),
    text: replaceVariables(textContent, variables),
    variables,
  }
}

/**
 * Admin notification templates
 */
function getAdminNewClientTemplate(
  context: NotificationContext
): EmailTemplate {
  const variables = getCommonVariables(context)

  const subject = `New client started onboarding: {{kitName}}`

  const htmlContent = `
    <h2 style="color: {{brandColor}}; margin-top: 0;">New Client Alert 🔔</h2>
    <p>A new client has started the onboarding process for <strong>{{kitName}}</strong>.</p>
    
    <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 30px 0;">
      <h3 style="margin-top: 0;">Client Details:</h3>
      <ul style="margin-bottom: 0;">
        <li><strong>Name:</strong> {{clientName}}</li>
        <li><strong>Email:</strong> {{client.email}}</li>
        <li><strong>Kit:</strong> {{kitName}}</li>
        <li><strong>Started:</strong> ${new Date().toLocaleDateString()}</li>
      </ul>
    </div>
    
    <div style="text-align: center;">
      <a href="{{baseUrl}}/dashboard/kits/{{kit.id}}/clients" class="button">View Client Progress →</a>
    </div>
    
    <p>You'll receive updates as they progress through the onboarding steps.</p>
  `

  const textContent = `
NEW CLIENT ALERT

A new client has started onboarding for {{kitName}}.

Client Details:
- Name: {{clientName}}
- Email: ${context.client.email}
- Kit: {{kitName}}
- Started: ${new Date().toLocaleDateString()}

View their progress: {{baseUrl}}/dashboard/kits/{{kit.id}}/clients
  `.trim()

  return {
    subject: replaceVariables(subject, variables),
    html: replaceVariables(
      getBaseHtmlTemplate(htmlContent, variables),
      variables
    ),
    text: replaceVariables(textContent, variables),
    variables,
  }
}

/**
 * Custom message template
 */
function getCustomMessageTemplate(
  context: NotificationContext & {
    customSubject?: string
    customMessage?: string
    fromAdmin?: boolean
  }
): EmailTemplate {
  const variables = {
    ...getCommonVariables(context),
    customSubject: context.customSubject || 'Message from {{companyName}}',
    customMessage: context.customMessage || '',
    fromAdmin: String(context.fromAdmin !== false),
  }

  const subject = context.customSubject || 'Message from {{companyName}}'

  const htmlContent = `
    <h2 style="color: {{brandColor}}; margin-top: 0;">${variables.fromAdmin ? 'Message from {{companyName}}' : 'Update on your onboarding'}</h2>
    
    <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid {{brandColor}};">
      ${
        context.customMessage
          ?.split('\n')
          .map(line => `<p style="margin: 10px 0;">${line}</p>`)
          .join('') || '<p>No message content provided.</p>'
      }
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="{{kitUrl}}" class="button">View Your Onboarding →</a>
    </div>
    
    <p>If you have any questions about this message, feel free to reply or contact us at <a href="mailto:{{supportEmail}}">{{supportEmail}}</a>.</p>
    
    <p><strong>The {{companyName}} Team</strong></p>
  `

  const textContent = `
${variables.fromAdmin ? 'MESSAGE FROM {{companyName}}' : 'ONBOARDING UPDATE'}

${context.customMessage || 'No message content provided.'}

View your onboarding: {{kitUrl}}

Questions? Contact us at {{supportEmail}}

The {{companyName}} Team
  `.trim()

  return {
    subject: replaceVariables(subject, variables),
    html: replaceVariables(
      getBaseHtmlTemplate(htmlContent, variables),
      variables
    ),
    text: replaceVariables(textContent, variables),
    variables,
  }
}

/**
 * Main function to get notification template
 */
export function getNotificationTemplate(
  templateType: string,
  context: any
): EmailTemplate {
  switch (templateType) {
    case 'welcome':
      return getWelcomeTemplate(context)

    case 'step_completion':
      return getStepCompletionTemplate(context)

    case 'reminder':
      return getReminderTemplate(context)

    case 'completion':
      return getCompletionTemplate(context)

    case 'admin_new_client':
      return getAdminNewClientTemplate(context)

    case 'admin_client_completed':
      return getCompletionTemplate({
        ...context,
        client: { ...context.client, name: `Admin: ${context.client.name}` },
      })

    case 'admin_client_stuck':
      return getReminderTemplate({
        ...context,
        client: {
          ...context.client,
          name: `Admin Alert: ${context.client.name} may need help`,
        },
      })

    case 'custom_message':
      return getCustomMessageTemplate(context)

    default:
      throw new Error(`Unknown template type: ${templateType}`)
  }
}

export default getNotificationTemplate
