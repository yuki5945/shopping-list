import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import InventoryList from './pages/InventoryList';
import AddItem from './pages/AddItem';
import Stocktaking from './pages/Stocktaking';
import ShoppingList from './pages/ShoppingList';
import './index.css';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function NavLink({ to, label, icon }) {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link to={to} className={isActive ? 'active' : ''}>
      <span>{icon}</span>
      <span>{label}</span>
    </Link>
  );
}

function App() {
  return (
    <Router>
      <ScrollToTop />
      <div id="root">
        <header>
          買い物メモ
        </header>
        <main>
          <Routes>
            <Route path="/" element={<ShoppingList />} />
            <Route path="/inventory" element={<InventoryList />} />
            <Route path="/add" element={<AddItem />} />
            <Route path="/stocktaking" element={<Stocktaking />} />
          </Routes>
        </main>
        <nav>
          <NavLink to="/" label="買い物メモ" icon="🛒" />
          <NavLink to="/stocktaking" label="在庫取り" icon="📋" />
          <NavLink to="/inventory" label="在庫一覧" icon="📦" />
          <NavLink to="/add" label="在庫登録" icon="➕" />
        </nav>
      </div>
    </Router>
  );
}

export default App;
