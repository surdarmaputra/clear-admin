import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from '@tanstack/react-router';
import * as RTooltip from '@radix-ui/react-tooltip';
import { router } from './router';
import './styles/theme.css';

const root = document.getElementById('root');
if (!root) throw new Error('No #root element');

createRoot(root).render(
  <StrictMode>
    <RTooltip.Provider delayDuration={300}>
      <RouterProvider router={router} />
    </RTooltip.Provider>
  </StrictMode>,
);
