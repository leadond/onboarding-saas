'use client'

import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils/cn'

interface HelpArticle {
  id: string
  title: string
  content: string
  category: string
  tags: string[]
  popularity: number
  lastUpdated: string
  helpful: number
  notHelpful: number
}

interface FAQ {
  id: string
  question: string
  answer: string
  category: string
  order: number
}

interface HelpCenterProps {
  kitId?: string
  clientIdentifier?: string
  companyName?: string
  brandColor?: string
  className?: string
  onContactSupport?: () => void
}

export function HelpCenter({
  kitId,
  clientIdentifier,
  companyName = 'Onboard Hero',
  brandColor = '#3B82F6',
  className,
  onContactSupport,
}: HelpCenterProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [activeTab, setActiveTab] = useState<'search' | 'faq' | 'articles'>(
    'search'
  )
  const [articles, setArticles] = useState<HelpArticle[]>([])
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [selectedArticle, setSelectedArticle] = useState<HelpArticle | null>(
    null
  )

  // Sample data
  const sampleArticles: HelpArticle[] = [
    {
      id: '1',
      title: 'Getting Started with Your Onboarding Process',
      content:
        'Welcome to your onboarding journey! Here is how to get started: 1. Review your onboarding checklist 2. Complete each step in order 3. Save your progress regularly 4. Contact support if you need help. Your progress is automatically saved, so you can always return where you left off.',
      category: 'getting-started',
      tags: ['onboarding', 'basics', 'tutorial'],
      popularity: 95,
      lastUpdated: '2024-01-15',
      helpful: 42,
      notHelpful: 3,
    },
    {
      id: '2',
      title: 'How to Save and Resume Your Progress',
      content:
        'Your progress is automatically saved as you complete each step. Progress saves every 30 seconds automatically. You can safely close your browser and return later. Use the same link to resume from where you left off.',
      category: 'technical',
      tags: ['progress', 'saving', 'technical'],
      popularity: 87,
      lastUpdated: '2024-01-10',
      helpful: 38,
      notHelpful: 2,
    },
  ]

  const sampleFAQs: FAQ[] = [
    {
      id: '1',
      question: 'How long does the onboarding process take?',
      answer:
        'Most clients complete the onboarding process in 15-30 minutes, depending on the complexity of their requirements.',
      category: 'general',
      order: 1,
    },
    {
      id: '2',
      question: 'Can I save my progress and continue later?',
      answer:
        'Yes! Your progress is automatically saved. You can close your browser and return anytime using the same link.',
      category: 'technical',
      order: 2,
    },
  ]

  useEffect(() => {
    setArticles(sampleArticles)
    setFaqs(sampleFAQs)
  }, [])

  const categories = [
    { id: 'all', name: 'All Topics', icon: '📚' },
    { id: 'getting-started', name: 'Getting Started', icon: '🚀' },
    { id: 'technical', name: 'Technical Help', icon: '⚙️' },
    { id: 'general', name: 'General', icon: '❓' },
  ]

  const filteredArticles = articles.filter(article => {
    const matchesSearch =
      !searchTerm ||
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.content.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory =
      selectedCategory === 'all' || article.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch =
      !searchTerm ||
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory =
      selectedCategory === 'all' || faq.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const tabs = [
    { id: 'search' as const, name: 'Search', icon: '🔍' },
    { id: 'faq' as const, name: 'FAQ', icon: '❓' },
    { id: 'articles' as const, name: 'Articles', icon: '📄' },
  ]

  if (selectedArticle) {
    return (
      <Card className={cn('p-6', className)}>
        <div className="space-y-4">
          <Button
            variant="ghost"
            onClick={() => setSelectedArticle(null)}
            className="mb-4"
          >
            ← Back to Help Center
          </Button>

          <div className="border-b border-gray-200 pb-4">
            <h1 className="mb-2 text-2xl font-bold text-gray-900">
              {selectedArticle.title}
            </h1>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span>
                Updated{' '}
                {new Date(selectedArticle.lastUpdated).toLocaleDateString()}
              </span>
              <span>Category: {selectedArticle.category}</span>
              <span>👍 {selectedArticle.helpful} helpful</span>
            </div>
          </div>

          <div className="prose max-w-none">
            <p>{selectedArticle.content}</p>
          </div>

          <div className="rounded-lg bg-gray-50 p-4 text-center">
            <p className="mb-3 text-sm text-gray-600">
              Still need help? Our support team is here for you.
            </p>
            <Button onClick={onContactSupport}>Contact Support</Button>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className={cn('p-6', className)}>
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="mb-2 text-2xl font-bold text-gray-900">
            {companyName} Help Center
          </h2>
          <p className="text-gray-600">
            Find answers to common questions and get help with your onboarding
          </p>
        </div>

        <div className="relative">
          <Input
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search for help articles, FAQs, or topics..."
            className="py-3 pl-10 pr-4 text-lg"
          />
          <div className="absolute left-3 top-1/2 -translate-y-1/2 transform text-gray-400">
            🔍
          </div>
        </div>

        <div className="border-b border-gray-200">
          <div className="flex space-x-8">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center space-x-2 border-b-2 px-1 py-2 text-sm font-medium transition-colors',
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                )}
              >
                <span>{tab.icon}</span>
                <span>{tab.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={cn(
                'flex items-center space-x-2 rounded-full px-3 py-1 text-sm font-medium transition-colors',
                selectedCategory === category.id
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              )}
            >
              <span>{category.icon}</span>
              <span>{category.name}</span>
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {activeTab === 'search' && (
            <div className="space-y-4">
              {searchTerm ? (
                <div>
                  <h3 className="mb-3 font-semibold text-gray-900">
                    Search Results (
                    {filteredArticles.length + filteredFAQs.length})
                  </h3>

                  {filteredArticles.length > 0 && (
                    <div className="mb-6 space-y-3">
                      <h4 className="font-medium text-gray-700">Articles</h4>
                      {filteredArticles.map(article => (
                        <div
                          key={article.id}
                          className="cursor-pointer rounded-lg bg-gray-50 p-4 transition-colors hover:bg-gray-100"
                          onClick={() => setSelectedArticle(article)}
                        >
                          <h5 className="mb-1 font-medium text-gray-900">
                            {article.title}
                          </h5>
                          <p className="text-sm text-gray-600">
                            {article.content.substring(0, 150)}...
                          </p>
                          <div className="mt-2 flex items-center space-x-3 text-xs text-gray-500">
                            <span>👍 {article.helpful}</span>
                            <span>Category: {article.category}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {filteredFAQs.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-700">FAQs</h4>
                      {filteredFAQs.map(faq => (
                        <div key={faq.id} className="rounded-lg bg-gray-50 p-4">
                          <h5 className="mb-2 font-medium text-gray-900">
                            {faq.question}
                          </h5>
                          <p className="text-sm text-gray-600">{faq.answer}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {filteredArticles.length === 0 &&
                    filteredFAQs.length === 0 && (
                      <div className="py-8 text-center">
                        <div className="mb-4 text-4xl">🔍</div>
                        <p className="mb-4 text-gray-500">
                          No results found for &quot;{searchTerm}&quot;
                        </p>
                        <Button onClick={onContactSupport}>
                          Contact Support Instead
                        </Button>
                      </div>
                    )}
                </div>
              ) : (
                <div>
                  <h3 className="mb-3 font-semibold text-gray-900">
                    Popular Articles
                  </h3>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {articles
                      .sort((a, b) => b.popularity - a.popularity)
                      .slice(0, 4)
                      .map(article => (
                        <div
                          key={article.id}
                          className="cursor-pointer rounded-lg border border-gray-200 p-4 transition-shadow hover:shadow-md"
                          onClick={() => setSelectedArticle(article)}
                        >
                          <h5 className="mb-2 font-medium text-gray-900">
                            {article.title}
                          </h5>
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>👍 {article.helpful} helpful</span>
                            <span>{article.popularity}% popularity</span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'faq' && (
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">
                Frequently Asked Questions
              </h3>
              {filteredFAQs.map(faq => (
                <div
                  key={faq.id}
                  className="rounded-lg border border-gray-200 p-4"
                >
                  <h4 className="mb-2 font-medium text-gray-900">
                    {faq.question}
                  </h4>
                  <p className="text-gray-600">{faq.answer}</p>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'articles' && (
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Help Articles</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {filteredArticles.map(article => (
                  <div
                    key={article.id}
                    className="cursor-pointer rounded-lg border border-gray-200 p-4 transition-shadow hover:shadow-md"
                    onClick={() => setSelectedArticle(article)}
                  >
                    <h5 className="mb-2 font-medium text-gray-900">
                      {article.title}
                    </h5>
                    <div className="mb-2 flex items-center space-x-3 text-xs text-gray-500">
                      <span>👍 {article.helpful}</span>
                      <span>
                        Updated{' '}
                        {new Date(article.lastUpdated).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {article.tags.slice(0, 3).map(tag => (
                        <span
                          key={tag}
                          className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-600"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 pt-6 text-center">
          <p className="mb-4 text-gray-600">
            Can&apos;t find what you&apos;re looking for?
          </p>
          <Button
            onClick={onContactSupport}
            style={{ backgroundColor: brandColor }}
          >
            Contact Support Team
          </Button>
        </div>
      </div>
    </Card>
  )
}

export default HelpCenter
