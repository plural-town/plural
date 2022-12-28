import { render } from '@testing-library/react';

import ProfileNoteComposer from './ProfileNoteComposer';

describe('ProfileNoteComposer', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<ProfileNoteComposer />);
    expect(baseElement).toBeTruthy();
  });
});
