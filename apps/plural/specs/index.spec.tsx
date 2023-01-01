import React from 'react';
import { render } from '@testing-library/react';

import Index from '../pages/index';

describe('Index', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<Index
      name="Untitled Social"
      BASE_DOMAIN="example.com"
      REGISTRATION_ENABLED
    />);
    expect(baseElement).toBeTruthy();
  });
});
