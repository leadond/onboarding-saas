import twilio from 'twilio'

export class TwilioService {
  private client: twilio.Twilio

  constructor(accountSid?: string, authToken?: string) {
    this.client = twilio(
      accountSid || process.env.TWILIO_ACCOUNT_SID!,
      authToken || process.env.TWILIO_AUTH_TOKEN!
    )
  }

  async sendSMS(to: string, message: string, from?: string) {
    try {
      const result = await this.client.messages.create({
        body: message,
        from: from || process.env.TWILIO_PHONE_NUMBER!,
        to: to
      })

      return {
        success: true,
        message_sid: result.sid,
        status: result.status
      }
    } catch (error) {
      console.error('Twilio SMS send failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'SMS send failed'
      }
    }
  }

  async sendStepCompletionNotification(
    to: string,
    stepName: string,
    clientName: string,
    completedBy: 'client' | 'company'
  ) {
    const message = completedBy === 'client' 
      ? `${clientName} has completed the "${stepName}" step in their onboarding process.`
      : `The "${stepName}" step has been completed for ${clientName}'s onboarding.`

    return this.sendSMS(to, message)
  }

  async sendStepReminderNotification(
    to: string,
    stepName: string,
    clientName: string,
    dueDate?: string
  ) {
    const dueDateText = dueDate ? ` (due ${new Date(dueDate).toLocaleDateString()})` : ''
    const message = `Reminder: Please complete the "${stepName}" step for ${clientName}'s onboarding${dueDateText}.`

    return this.sendSMS(to, message)
  }

  async sendDocumentSignedNotification(
    to: string,
    documentName: string,
    clientName: string
  ) {
    const message = `${clientName} has signed the "${documentName}" document. The onboarding process can continue.`

    return this.sendSMS(to, message)
  }
}