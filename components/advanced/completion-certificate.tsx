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

'use client'

import React, { useState, useRef } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils/cn'

interface CompletionCertificateProps {
  kitId: string
  kitName: string
  clientName: string
  clientEmail: string
  companyName: string
  completionDate: string
  brandColor?: string
  logoUrl?: string
  certificateId?: string
  className?: string
  onDownload?: () => void
  onShare?: (method: 'email' | 'linkedin' | 'twitter') => void
}

export function CompletionCertificate({
  kitId,
  kitName,
  clientName,
  clientEmail,
  companyName,
  completionDate,
  brandColor = '#3B82F6',
  logoUrl,
  certificateId = `CERT-${Date.now()}`,
  className,
  onDownload,
  onShare,
}: CompletionCertificateProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const certificateRef = useRef<HTMLDivElement>(null)

  const handleDownload = async () => {
    setIsGenerating(true)

    try {
      // In real implementation, this would generate a PDF
      // For demo, we'll simulate the process
      await new Promise(resolve => setTimeout(resolve, 2000))

      onDownload?.()

      // Simulate download
      const link = window.document.createElement('a')
      link.href = '/certificates/sample-certificate.pdf'
      link.download = `${kitName}-Completion-Certificate-${clientName.replace(/\s+/g, '-')}.pdf`
      window.document.body.appendChild(link)
      link.click()
      window.document.body.removeChild(link)
    } catch (error) {
      console.error('Failed to generate certificate:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleShare = (method: 'email' | 'linkedin' | 'twitter') => {
    const certificateUrl = `${window.location.origin}/certificate/${certificateId}`
    const message = `I've successfully completed the ${kitName} onboarding with ${companyName}! 🎉`

    switch (method) {
      case 'email':
        const emailSubject = encodeURIComponent(
          `Certificate of Completion - ${kitName}`
        )
        const emailBody = encodeURIComponent(
          `${message}\n\nView my certificate: ${certificateUrl}`
        )
        window.open(`mailto:?subject=${emailSubject}&body=${emailBody}`)
        break

      case 'linkedin':
        const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(certificateUrl)}`
        window.open(linkedInUrl, '_blank', 'width=600,height=400')
        break

      case 'twitter':
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}&url=${encodeURIComponent(certificateUrl)}`
        window.open(twitterUrl, '_blank', 'width=600,height=400')
        break
    }

    onShare?.(method)
  }

  return (
    <Card className={cn('p-6', className)}>
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <h2 className="mb-2 text-2xl font-bold text-gray-900">
            🏆 Congratulations!
          </h2>
          <p className="text-gray-600">
            You&apos;ve successfully completed your onboarding journey
          </p>
        </div>

        {/* Certificate */}
        <div
          ref={certificateRef}
          className="relative overflow-hidden rounded-lg border-2 border-gray-200 bg-gradient-to-br from-white to-gray-50 p-8"
        >
          {/* Decorative Elements */}
          <div className="border-gold-200 absolute left-4 top-4 h-16 w-16 rounded-full border-4 opacity-20"></div>
          <div className="border-gold-200 absolute bottom-4 right-4 h-20 w-20 rounded-full border-4 opacity-20"></div>
          <div className="from-gold-200 absolute left-0 top-1/2 h-32 w-8 -translate-y-1/2 transform bg-gradient-to-r to-transparent opacity-30"></div>
          <div className="from-gold-200 absolute right-0 top-1/2 h-32 w-8 -translate-y-1/2 transform bg-gradient-to-l to-transparent opacity-30"></div>

          <div className="relative z-10 space-y-6 text-center">
            {/* Logo */}
            {logoUrl ? (
              <img src={logoUrl} alt={companyName} className="mx-auto h-16" />
            ) : (
              <div
                className="mx-auto flex h-16 w-16 items-center justify-center rounded-full text-2xl font-bold text-white"
                style={{ backgroundColor: brandColor }}
              >
                {companyName.charAt(0)}
              </div>
            )}

            {/* Certificate Title */}
            <div>
              <h1 className="mb-2 text-3xl font-bold text-gray-900">
                Certificate of Completion
              </h1>
              <div
                className="mx-auto h-1 w-24 rounded"
                style={{ backgroundColor: brandColor }}
              ></div>
            </div>

            {/* Recognition Text */}
            <div className="space-y-4">
              <p className="text-lg text-gray-700">This is to certify that</p>

              <div className="rounded-lg border bg-white px-8 py-4 shadow-sm">
                <h2
                  className="text-2xl font-bold"
                  style={{ color: brandColor }}
                >
                  {clientName}
                </h2>
              </div>

              <p className="text-lg text-gray-700">
                has successfully completed the
              </p>

              <div className="rounded-lg border bg-white px-6 py-3 shadow-sm">
                <h3 className="text-xl font-semibold text-gray-900">
                  {kitName}
                </h3>
              </div>

              <p className="text-lg text-gray-700">
                onboarding program with <strong>{companyName}</strong>
              </p>
            </div>

            {/* Completion Details */}
            <div className="grid grid-cols-1 gap-4 pt-6 md:grid-cols-3">
              <div className="text-center">
                <p className="text-sm text-gray-500">Completion Date</p>
                <p className="font-semibold text-gray-900">
                  {new Date(completionDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-500">Certificate ID</p>
                <p className="font-mono text-sm font-semibold text-gray-900">
                  {certificateId}
                </p>
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-500">Issued By</p>
                <p className="font-semibold text-gray-900">{companyName}</p>
              </div>
            </div>

            {/* Signature Area */}
            <div className="border-t border-gray-200 pt-8">
              <div className="flex items-center justify-center space-x-8">
                <div className="text-center">
                  <div className="mb-2 h-px w-32 bg-gray-400"></div>
                  <p className="text-sm text-gray-600">Digital Signature</p>
                  <p className="text-xs text-gray-500">Verified Certificate</p>
                </div>

                <div className="border-gold-400 flex h-16 w-16 items-center justify-center rounded-full border-4">
                  <span className="text-2xl">✓</span>
                </div>

                <div className="text-center">
                  <div className="mb-2 h-px w-32 bg-gray-400"></div>
                  <p className="text-sm text-gray-600">Date Issued</p>
                  <p className="text-xs text-gray-500">
                    {new Date().toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              onClick={handleDownload}
              disabled={isGenerating}
              className="flex flex-1 items-center justify-center space-x-2"
              style={{ backgroundColor: brandColor }}
            >
              {isGenerating ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  <span>Generating PDF...</span>
                </>
              ) : (
                <>
                  <span>⬇️</span>
                  <span>Download Certificate</span>
                </>
              )}
            </Button>

            <Button
              variant="outline"
              onClick={() => window.print()}
              className="flex flex-1 items-center justify-center space-x-2"
            >
              <span>🖨️</span>
              <span>Print Certificate</span>
            </Button>
          </div>

          {/* Share Options */}
          <div className="text-center">
            <p className="mb-3 text-sm text-gray-600">
              Share your achievement:
            </p>
            <div className="flex justify-center space-x-3">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleShare('linkedin')}
                className="flex items-center space-x-2"
              >
                <span>💼</span>
                <span>LinkedIn</span>
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={() => handleShare('twitter')}
                className="flex items-center space-x-2"
              >
                <span>🐦</span>
                <span>Twitter</span>
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={() => handleShare('email')}
                className="flex items-center space-x-2"
              >
                <span>📧</span>
                <span>Email</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Verification Info */}
        <div className="rounded-lg bg-gray-50 p-4 text-center">
          <h4 className="mb-2 font-medium text-gray-900">
            🔐 Certificate Verification
          </h4>
          <p className="mb-2 text-sm text-gray-600">
            This certificate can be verified using the Certificate ID above.
          </p>
          <div className="text-xs text-gray-500">
            <p>
              Verification URL: {window.location.origin}/verify/{certificateId}
            </p>
            <p>Issued: {new Date().toLocaleString()}</p>
          </div>
        </div>

        {/* Next Steps CTA */}
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-center">
          <h4 className="mb-2 font-medium text-blue-900">🚀 What&apos;s Next?</h4>
          <p className="mb-3 text-sm text-blue-700">
            You&apos;re all set! Check out your personalized next steps to continue
            your journey with {companyName}.
          </p>
          <Button size="sm" style={{ backgroundColor: brandColor }}>
            View Next Steps
          </Button>
        </div>
      </div>

      <style jsx>{`
        .border-gold-200 {
          border-color: #fbbf24;
        }
        .border-gold-400 {
          border-color: #f59e0b;
        }
        .bg-gold-200 {
          background-color: #fbbf24;
        }
        .from-gold-200 {
          --tw-gradient-from: #fbbf24;
        }
        .to-gold-200 {
          --tw-gradient-to: #fbbf24;
        }

        @media print {
          .no-print {
            display: none !important;
          }
          .certificate {
            page-break-inside: avoid;
          }
        }
      `}</style>
    </Card>
  )
}

export default CompletionCertificate
