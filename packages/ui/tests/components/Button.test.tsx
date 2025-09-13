import React from 'react';
import { render } from '@testing-library/react';
import { Button } from '../../src/components/Button/Button';

describe('Button Component', () => {
  it('renders without crashing', () => {
    render(<Button>Test Button</Button>);
  });

  it('renders with children', () => {
    const { getByText } = render(<Button>Click me</Button>);
    expect(getByText('Click me')).toBeInTheDocument();
  });

  it('applies variant classes', () => {
    const { container } = render(<Button variant="primary">Primary</Button>);
    const button = container.firstChild;
    expect(button).toHaveClass('bg-blue-600');
    expect(button).toHaveClass('text-white');
  });
});
