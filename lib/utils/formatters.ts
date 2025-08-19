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

import { format, formatDistanceToNow, parseISO } from 'date-fns'

export function formatDate(date: string | Date, pattern = 'MMM dd, yyyy') {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return format(dateObj, pattern)
}

export function formatDateTime(date: string | Date) {
  return formatDate(date, 'MMM dd, yyyy hh:mm a')
}

export function formatRelativeTime(date: string | Date) {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return formatDistanceToNow(dateObj, { addSuffix: true })
}

export function formatCurrency(
  amount: number,
  currency = 'USD',
  locale = 'en-US'
) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount)
}

export function formatFileSize(bytes: number) {
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  if (bytes === 0) return '0 Bytes'

  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  const size = bytes / Math.pow(1024, i)

  return `${Math.round(size * 100) / 100} ${sizes[i]}`
}

export function formatPercentage(value: number, decimals = 1) {
  return `${(value * 100).toFixed(decimals)}%`
}

export function formatNumber(number: number, locale = 'en-US') {
  return new Intl.NumberFormat(locale).format(number)
}

export function formatPhoneNumber(phoneNumber: string) {
  const cleaned = phoneNumber.replace(/\D/g, '')

  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3')
  }

  if (cleaned.length === 11 && cleaned[0] === '1') {
    return cleaned.replace(/(\d{1})(\d{3})(\d{3})(\d{4})/, '+$1 ($2) $3-$4')
  }

  return phoneNumber
}

export function truncateText(text: string, maxLength: number) {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

export function capitalizeFirst(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export function kebabCase(str: string) {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase()
}

export function camelCase(str: string) {
  return str
    .replace(/[-_\s]+(.)?/g, (_, char) => (char ? char.toUpperCase() : ''))
    .replace(/^[A-Z]/, char => char.toLowerCase())
}

export function generateSlug(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function formatDuration(milliseconds: number) {
  const seconds = Math.floor(milliseconds / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) {
    return `${days}d ${hours % 24}h ${minutes % 60}m`
  }
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`
  }
  return `${seconds}s`
}

export function initials(name: string) {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}
