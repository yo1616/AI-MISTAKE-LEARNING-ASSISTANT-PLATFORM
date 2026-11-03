import { render } from '@testing-library/react';
import App from './App';

test('renders app routes without crashing', () => {
  render(<App />);
});
