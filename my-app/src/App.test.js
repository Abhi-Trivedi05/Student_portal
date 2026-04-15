import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders login landing page', () => {
  render(<App />);
  expect(screen.getByText(/welcome to student portal/i)).toBeInTheDocument();
});
