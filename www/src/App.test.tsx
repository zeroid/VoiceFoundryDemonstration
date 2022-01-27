import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders learn react link', () => {
  render(<App />);
  const titleElement = screen.getByText(/Voice Foundry Demonstration/i);
  expect(titleElement).toBeInTheDocument();
  const footerElement = screen.getByText(/Copyright 2022/i);
  expect(footerElement).toBeInTheDocument();
});
