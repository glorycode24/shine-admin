import './App.css';
import CategoryManager from './components/CategoryManager';
import ProductManager from './components/ProductManager';

function App() {
  return (
    <div className="App">
      <header className="app-header">
        <h1>SHINE Admin Panel</h1>
      </header>
      <main className="container">
        <CategoryManager />
        <ProductManager />
      </main>
    </div>
  );
}

export default App;