import { RouterProvider } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { QueryProvider } from './context/QueryProvider';
import router from './Router';
import './index.css';

function App() {
  return (
    <QueryProvider>
      <AuthProvider>
        {/* Toaster is required for toast.success/toast.error calls used in
            ProductDetailPage and CartPage to actually render on screen. */}
        <Toaster position="top-right" />
        <RouterProvider router={router} />
      </AuthProvider>
    </QueryProvider>
  );
}

export default App;
