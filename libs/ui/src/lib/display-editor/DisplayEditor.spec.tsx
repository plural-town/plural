import { render } from '@testing-library/react';

import DisplayEditor from './DisplayEditor';

describe('DisplayEditor', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<DisplayEditor />);
    expect(baseElement).toBeTruthy();
  });
});
