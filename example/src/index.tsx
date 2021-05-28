import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { QueryClientProvider, queryClient } from './configureQueryClient';

const app = (
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
);

ReactDOM.render(app, document.getElementById('root'));
