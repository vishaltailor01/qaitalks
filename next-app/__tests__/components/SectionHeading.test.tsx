import React from 'react'
import { render } from '@testing-library/react'
import { SectionHeading } from '@/components'

describe('components/SectionHeading', () => {
  it('should render title', () => {
    const { getByRole } = render(<SectionHeading title="Test Title" />)
    const heading = getByRole('heading', { level: 2 })
    expect(heading).toHaveTextContent('Test Title')
  })

  it('should render subtitle when provided', () => {
    const { getByText } = render(<SectionHeading title="Test Title" subtitle="Test Subtitle" />)
    expect(getByText('Test Subtitle')).toBeInTheDocument()
  })

  it('should not render subtitle when not provided', () => {
    const { queryByText } = render(<SectionHeading title="Test Title" />)
    // Subtitle should not be rendered if not provided
    const paragraphs = queryByText(/Test Subtitle/)
    expect(paragraphs).not.toBeInTheDocument()
  })

  it('should apply centered class by default', () => {
    const { container } = render(<SectionHeading title="Test Title" />)
    const wrapper = container.firstChild
    expect(wrapper).toHaveClass('text-center')
  })

  it('should not apply centered class when centered is false', () => {
    const { container } = render(<SectionHeading title="Test Title" centered={false} />)
    const wrapper = container.firstChild
    expect(wrapper).not.toHaveClass('text-center')
  })

  it('should apply custom className', () => {
    const { container } = render(<SectionHeading title="Test Title" className="custom-class" />)
    const wrapper = container.firstChild
    expect(wrapper).toHaveClass('custom-class')
  })
})
