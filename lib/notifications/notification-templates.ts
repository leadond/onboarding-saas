/*
 * Copyright (c) 2024 [Your Company Name]. All rights reserved.
 * 
 * PROPRIETARY AND CONFIDENTIAL
 * 
 * This software contains proprietary and confidential information.
 * Unauthorized copying, distribution, or use is strictly prohibited.
 * 
 * For licensing information, contact: [your-email@domain.com]
 */

import type { EmailTemplate, NotificationContext } from './email-service'

export function getNotificationTemplate(
  templateType: string,
  context: any
): EmailTemplate {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://onboard.devapphero.com'
  const kitUrl = `${baseUrl}/kit/${context.kit.id}`
  
  const clientName = context.client.name || 'there'
  const kitName = context.kit.title || context.kit.name || 'Onboarding Kit'
  const companyName = context.kit.user?.company_name || context.kit.user?.full_name || 'Onboard Hero'

  switch (templateType) {
    case 'welcome':
      return {
        subject: `Welcome to ${kitName} - Let's get started!`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #3b82f6; margin-bottom: 10px;">Welcome to ${kitName}!</h1>
              <p style="color: #6b7280; font-size: 16px;">We're excited to help you get started</p>
            </div>
            
            <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
              <p style="margin: 0 0 15px 0;">Hi ${clientName},</p>
              <p style="margin: 0 0 15px 0;">Welcome to your personalized onboarding experience with ${companyName}!</p>
              <p style="margin: 0 0 15px 0;">We've prepared a step-by-step guide to help you get the most out of our services. Click the button below to begin your journey.</p>
              ${context.customMessage ? `<div style="background: #e0f2fe; padding: 15px; border-radius: 6px; margin: 15px 0;"><p style="margin: 0; font-style: italic;">"${context.customMessage}"</p></div>` : ''}
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${kitUrl}" style="background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Start Your Onboarding</a>
            </div>
            
            <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px; color: #6b7280; font-size: 14px;">
              <p>If you have any questions, feel free to reply to this email.</p>
              <p>Best regards,<br>The ${companyName} Team</p>
            </div>
          </div>
        `,
        text: `
Welcome to ${kitName}!

Hi ${clientName},

Welcome to your personalized onboarding experience with ${companyName}!

We've prepared a step-by-step guide to help you get the most out of our services.

${context.customMessage ? `Personal message: "${context.customMessage}"` : ''}

Get started here: ${kitUrl}

If you have any questions, feel free to reply to this email.

Best regards,
The ${companyName} Team
        `,
        variables: {
          clientName,
          kitName,
          companyName,
          kitUrl,
          customMessage: context.customMessage || '',
        }
      }

    case 'step_completion':
      const stepName = context.step?.title || 'Step'
      return {
        subject: `Great job! You completed "${stepName}"`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #10b981; margin-bottom: 10px;">🎉 Step Completed!</h1>
              <p style="color: #6b7280; font-size: 16px;">You're making great progress</p>
            </div>
            
            <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
              <p style="margin: 0 0 15px 0;">Hi ${clientName},</p>
              <p style="margin: 0 0 15px 0;">Congratulations! You've successfully completed "${stepName}" in your ${kitName} onboarding.</p>
              <p style="margin: 0 0 15px 0;">Progress: ${context.completionPercentage || 0}% complete (${context.completedSteps || 0} of ${context.totalSteps || 0} steps)</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${kitUrl}" style="background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Continue Your Journey</a>
            </div>
            
            <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px; color: #6b7280; font-size: 14px;">
              <p>Keep up the great work!</p>
              <p>Best regards,<br>The ${companyName} Team</p>
            </div>
          </div>
        `,
        text: `
🎉 Step Completed!

Hi ${clientName},

Congratulations! You've successfully completed "${stepName}" in your ${kitName} onboarding.

Progress: ${context.completionPercentage || 0}% complete (${context.completedSteps || 0} of ${context.totalSteps || 0} steps)

Continue here: ${kitUrl}

Keep up the great work!

Best regards,
The ${companyName} Team
        `,
        variables: {
          clientName,
          kitName,
          companyName,
          kitUrl,
          stepName,
        }
      }

    case 'reminder':
      const days = context.daysSinceLastActivity || 1
      return {
        subject: `Don't forget to continue your ${kitName} onboarding`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #f59e0b; margin-bottom: 10px;">⏰ Friendly Reminder</h1>
              <p style="color: #6b7280; font-size: 16px;">Let's continue where you left off</p>
            </div>
            
            <div style="background: #fffbeb; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
              <p style="margin: 0 0 15px 0;">Hi ${clientName},</p>
              <p style="margin: 0 0 15px 0;">It's been ${days} day${days > 1 ? 's' : ''} since your last activity in ${kitName}.</p>
              <p style="margin: 0 0 15px 0;">We're here to help you complete your onboarding journey. You're ${context.completionPercentage || 0}% of the way there!</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${kitUrl}" style="background: #f59e0b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Continue Onboarding</a>
            </div>
            
            <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px; color: #6b7280; font-size: 14px;">
              <p>Need help? Just reply to this email and we'll assist you.</p>
              <p>Best regards,<br>The ${companyName} Team</p>
            </div>
          </div>
        `,
        text: `
⏰ Friendly Reminder

Hi ${clientName},

It's been ${days} day${days > 1 ? 's' : ''} since your last activity in ${kitName}.

We're here to help you complete your onboarding journey. You're ${context.completionPercentage || 0}% of the way there!

Continue here: ${kitUrl}

Need help? Just reply to this email and we'll assist you.

Best regards,
The ${companyName} Team
        `,
        variables: {
          clientName,
          kitName,
          companyName,
          kitUrl,
          days: days.toString(),
        }
      }

    case 'completion':
      return {
        subject: `🎉 Congratulations! You've completed ${kitName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #10b981; margin-bottom: 10px;">🎉 Congratulations!</h1>
              <p style="color: #6b7280; font-size: 16px;">You've completed your onboarding</p>
            </div>
            
            <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
              <p style="margin: 0 0 15px 0;">Hi ${clientName},</p>
              <p style="margin: 0 0 15px 0;">Fantastic work! You've successfully completed all steps in your ${kitName} onboarding.</p>
              <p style="margin: 0 0 15px 0;">You're now fully set up and ready to make the most of our services. Welcome aboard!</p>
            </div>
            
            <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px; color: #6b7280; font-size: 14px;">
              <p>Thank you for choosing ${companyName}. We're excited to work with you!</p>
              <p>Best regards,<br>The ${companyName} Team</p>
            </div>
          </div>
        `,
        text: `
🎉 Congratulations!

Hi ${clientName},

Fantastic work! You've successfully completed all steps in your ${kitName} onboarding.

You're now fully set up and ready to make the most of our services. Welcome aboard!

Thank you for choosing ${companyName}. We're excited to work with you!

Best regards,
The ${companyName} Team
        `,
        variables: {
          clientName,
          kitName,
          companyName,
        }
      }

    case 'custom_message':
      return {
        subject: context.customSubject || `Message from ${companyName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #3b82f6; margin-bottom: 10px;">Message from ${companyName}</h1>
            </div>
            
            <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
              <p style="margin: 0 0 15px 0;">Hi ${clientName},</p>
              <div style="white-space: pre-line;">${context.customMessage || ''}</div>
            </div>
            
            <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px; color: #6b7280; font-size: 14px;">
              <p>Best regards,<br>The ${companyName} Team</p>
            </div>
          </div>
        `,
        text: `
Message from ${companyName}

Hi ${clientName},

${context.customMessage || ''}

Best regards,
The ${companyName} Team
        `,
        variables: {
          clientName,
          companyName,
          customMessage: context.customMessage || '',
        }
      }

    default:
      return {
        subject: `Update from ${companyName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <p>Hi ${clientName},</p>
            <p>You have an update regarding your ${kitName} onboarding.</p>
            <p>Best regards,<br>The ${companyName} Team</p>
          </div>
        `,
        text: `Hi ${clientName},\n\nYou have an update regarding your ${kitName} onboarding.\n\nBest regards,\nThe ${companyName} Team`,
        variables: {
          clientName,
          kitName,
          companyName,
        }
      }
  }
}