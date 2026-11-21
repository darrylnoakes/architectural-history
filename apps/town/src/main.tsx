import { createRoot } from 'react-dom/client';
import '@fontsource-variable/fraunces';
import '@fontsource-variable/inter';
import './styles.css';
import { App } from './App';

// No StrictMode: its double-mounted effects would build the whole 3D world twice in development.
createRoot(document.getElementById('root')!).render(<App />);
