import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import ProfileView from '@/components/ProfileView'

function mockFetch(responses: Record<string, any>) {
  // @ts-ignore
  global.fetch = jest.fn((url: string) => {
    const body = responses[url]
    return Promise.resolve({ ok: true, json: () => Promise.resolve(body) })
  })
}

describe('ProfileView', () => {
  afterEach(() => {
    // @ts-ignore
    global.fetch = undefined
    jest.clearAllMocks()
  })

  test('renders empty profile and no badges', async () => {
    mockFetch({ '/api/profile': {}, '/api/badges': { badges: [] } })
    render(<ProfileView editUrl="/profile?edit=1" userName="Tester" />)
    await waitFor(() => expect(screen.queryByText('Loading profile…')).toBeNull())
    expect(screen.getByText('Tester')).toBeInTheDocument()
    expect(screen.getByText('No badges earned yet.')).toBeInTheDocument()
  })

  test('parses JSON-stringified arrays and shows experience/skills/certs', async () => {
    const profile = {
      about: 'About me',
      experience: JSON.stringify([{ title: 'Dev', company: 'QaiTalk', from: '2020', to: '2022', description: 'Automated entry' }]),
      skills: JSON.stringify(['React', 'Node']),
      licenses: JSON.stringify(['Cert-1']),
    }
    mockFetch({ '/api/profile': profile, '/api/badges': { badges: [] } })
    render(<ProfileView editUrl="/profile?edit=1" userName="Tester" />)
    await waitFor(() => expect(screen.queryByText('Loading profile…')).toBeNull())
    expect(screen.getByText('About me')).toBeInTheDocument()
    expect(screen.getByText('Dev — QaiTalk')).toBeInTheDocument()
    expect(screen.getByText('Automated entry')).toBeInTheDocument()
    expect(screen.getByText('React')).toBeInTheDocument()
    expect(screen.getByText('Node')).toBeInTheDocument()
    expect(screen.getByText('Cert-1')).toBeInTheDocument()
  })

  test('handles comma-separated skills and string experience', async () => {
    const profile = {
      about: 'Comma test',
      experience: 'Senior Engineer at ACME',
      skills: 'React,Node, Typescript',
      licenses: null,
    }
    mockFetch({ '/api/profile': profile, '/api/badges': { badges: [] } })
    render(<ProfileView editUrl="/profile?edit=1" userName="CSVUser" />)
    await waitFor(() => expect(screen.queryByText('Loading profile…')).toBeNull())
    expect(screen.getByText('Senior Engineer at ACME')).toBeInTheDocument()
    expect(screen.getByText('React')).toBeInTheDocument()
    expect(screen.getByText('Node')).toBeInTheDocument()
    expect(screen.getByText('Typescript')).toBeInTheDocument()
  })

  test('handles double-encoded JSON for skills', async () => {
    const double = JSON.stringify(JSON.stringify(['OnlyOne']))
    const profile = { skills: double }
    mockFetch({ '/api/profile': profile, '/api/badges': { badges: [] } })
    render(<ProfileView editUrl="/profile?edit=1" userName="Double" />)
    await waitFor(() => expect(screen.queryByText('Loading profile…')).toBeNull())
    expect(screen.getByText('OnlyOne')).toBeInTheDocument()
  })
})

export {}
