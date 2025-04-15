import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toast } from 'primereact/toast';
import { useRef } from 'react';

import Login from './components/auth/Login';
import Register from './components/auth/Register';
import TodoList from './components/todos/TodoList';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';

function App() {
  const toast = useRef(null);

  return (
    <AuthProvider>
      <Toast ref={toast} />
      <div className="min-h-screen">
        <Routes>
          <Route path="/login" element={<Login toast={toast} />} />
          <Route path="/register" element={<Register toast={toast} />} />
          <Route path="/todos" element={
            <ProtectedRoute>
              <TodoList toast={toast} />
            </ProtectedRoute>
          } />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;