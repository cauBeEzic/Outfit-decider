// Main App component with routing
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import AuthScreen from './pages/AuthScreen';
import WardrobeScreen from './pages/WardrobeScreen';
import UploadScreen from './pages/UploadScreen';
import StorageScreen from './pages/StorageScreen';
import SavedOutfitsScreen from './pages/SavedOutfitsScreen';
import UserPhotoScreen from './pages/UserPhotoScreen';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh' 
      }}>
        <div className="loading-spinner" />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route 
          path="/auth" 
          element={user ? <Navigate to="/" /> : <AuthScreen />} 
        />

        {/* Protected routes */}
        <Route 
          path="/" 
          element={user ? <WardrobeScreen /> : <Navigate to="/auth" />} 
        />
        <Route 
          path="/upload/:type" 
          element={user ? <UploadScreen /> : <Navigate to="/auth" />} 
        />
        <Route 
          path="/storage" 
          element={user ? <StorageScreen /> : <Navigate to="/auth" />} 
        />
        <Route 
          path="/saved-outfits" 
          element={user ? <SavedOutfitsScreen /> : <Navigate to="/auth" />} 
        />
        <Route 
          path="/user-photo" 
          element={user ? <UserPhotoScreen /> : <Navigate to="/auth" />} 
        />

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;