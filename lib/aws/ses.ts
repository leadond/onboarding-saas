import { SESClient, SendEmailCommand, SendRawEmailCommand } from '@aws-sdk/client-ses'

const sesClient = new SESClient({
  region: process.env.AWS_SES_REGION || process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

interface SendEmailOptions {
  to: string | string[]
  subject: string
  html?: string
  text?: string
  from?: string
  replyTo?: string
}

export async function sendEmail({
  to,
  subject,
  html,
  text,
  from,
  replyTo,
}: SendEmailOptions) {
  try {
    const toAddresses = Array.isArray(to) ? to : [to]
    const fromAddress = from || process.env.AWS_SES_FROM_EMAIL!

    const command = new SendEmailCommand({
      Source: fromAddress,
      Destination: {
        ToAddresses: toAddresses,
      },
      Message: {
        Subject: {
          Data: subject,
          Charset: 'UTF-8',
        },
        Body: {
          ...(html && {
            Html: {
              Data: html,
              Charset: 'UTF-8',
            },
          }),
          ...(text && {
            Text: {
              Data: text,
              Charset: 'UTF-8',
            },
          }),
        },
      },
      ...(replyTo && {
        ReplyToAddresses: [replyTo],
      }),
    })

    const result = await sesClient.send(command)
    
    return {
      success: true,
      messageId: result.MessageId,
    }
  } catch (error) {
    console.error('SES send error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send email',
    }
  }
}

export async function sendWelcomeEmail(clientEmail: string, clientName: string, kitUrl: string) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Welcome to Your Onboarding</title>
    </head>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #333;">Welcome, ${clientName}!</h1>
      
      <p>You've been invited to complete your onboarding process. We're excited to work with you!</p>
      
      <p>Click the button below to get started:</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${kitUrl}" 
           style="background-color: #0066cc; color: white; padding: 15px 30px; 
                  text-decoration: none; border-radius: 5px; display: inline-block;">
          Start Onboarding
        </a>
      </div>
      
      <p>If the button doesn't work, copy and paste this link into your browser:</p>
      <p><a href="${kitUrl}">${kitUrl}</a></p>
      
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
      
      <p style="color: #666; font-size: 14px;">
        If you have any questions, feel free to reply to this email.
      </p>
    </body>
    </html>
  `

  return sendEmail({
    to: clientEmail,
    subject: 'Welcome! Your onboarding is ready',
    html,
    text: `Welcome, ${clientName}! You've been invited to complete your onboarding process. Visit: ${kitUrl}`,
  })
}