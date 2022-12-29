import { render } from '@testing-library/react';

import NoteCard from './NoteCard';

describe('NoteCard', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<NoteCard />);
    expect(baseElement).toBeTruthy();
  });
});
