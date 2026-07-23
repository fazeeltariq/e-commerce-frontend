import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { QueryProvider } from './context/QueryProvider';
import router from './Router';
import './index.css';

function App() {
  return (
    <QueryProvider>
      <AuthProvider>
        {/* ✅ Remove Toaster completely */}
        <RouterProvider router={router} />
      </AuthProvider>
    </QueryProvider>
  );
}

export default App;