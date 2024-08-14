import React from 'react';
import Todo from './components/Todo';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  return (
    <div className='bg-neutral-500 grid py-4 min-h-screen'>
      <ErrorBoundary>
        <Todo />
      </ErrorBoundary>
    </div>

  );
}

export default App;
