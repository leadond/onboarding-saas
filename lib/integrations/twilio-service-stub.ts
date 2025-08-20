// Stub for Twilio service to prevent build errors
export class TwilioService {
  constructor(accountSid: string, authToken: string) {}
  
  async sendStepCompletionNotification(
    phone: string,
    stepName: string,
    clientName: string,
    completedBy: string
  ) {
    console.log('Twilio notification stub called')
  }
}