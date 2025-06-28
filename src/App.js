import './App.css';
import { Routes, Route, Link, NavLink, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext'; // Import useAuth
import CategoryManager from './components/CategoryManager';
import ProductManager from './components/ProductManager';
import UserManager from './components/UserManager';
import LoginPage from './pages/LoginPage'; // Import the new LoginPage

// A component to protect our admin routes
function ProtectedRoute({ children }) {
  const { currentUser, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>; // Show loading screen while checking auth
  }

  // If there's no user, redirect to the login page
  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  // If there is a user, show the protected content
  return children;
}

function App() {
  return (
    <div className="App">
      <Routes>
        {/* The Login Page is a public route */}
        <Route path="/login" element={<LoginPage />} />

        {/* The Dashboard is a protected route */}
        <Route 
          path="/*" // This will match all other routes (/, /users, etc.)
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </div>
  );
}

// We'll create a new component for the main dashboard layout
function AdminDashboard() {
  const { currentUser, logout } = useAuth();
  return (
    <>
      <header className="app-header">
        <h1>SHINE Admin Panel</h1>
        {currentUser && (
            <div className="header-user-info">
              <span>Welcome, {currentUser.firstName}!</span>
              <button onClick={logout} className="logout-btn">Logout</button>
            </div>
          )}
        
        <nav className="admin-nav">
          <NavLink to="/products" className="nav-link">Manage Products</NavLink>
          <NavLink to="/categories" className="nav-link">Manage Categories</NavLink>
          <NavLink to="/users" className="nav-link">Manage Customers</NavLink>
        </nav>
      </header>
      <main className="container">
        <Routes>
          <Route path="/products" element={<ProductManager />} />
          <Route path="/categories" element={<CategoryManager />} />
          <Route path="/users" element={<UserManager />} />
           <Route path="/" element={<Navigate replace to="/products" />} />
        </Routes>
      </main>
    </>
  );
}

export default App;