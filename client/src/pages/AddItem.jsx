import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function AddItem() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    genre_name: '',
    name: '',
    min_quantity: 1,
    current_quantity: 0
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      alert('商品を追加しました！');
      setFormData({
        genre_name: '',
        name: '',
        min_quantity: 1,
        current_quantity: 0
      });
    } catch (error) {
      console.error('Error adding item:', error);
    }
  };

  return (
    <div className="card">
      <h2>在庫登録</h2>
      <form onSubmit={handleSubmit}>
        <label>ジャンル</label>
        <input 
          type="text" 
          name="genre_name" 
          value={formData.genre_name} 
          onChange={handleChange} 
          placeholder="例: 野菜" 
          required 
        />

        <label>項目名</label>
        <input 
          type="text" 
          name="name" 
          value={formData.name} 
          onChange={handleChange} 
          placeholder="例: 牛乳" 
          required 
        />

        <label>下限個数</label>
        <input 
          type="number" 
          name="min_quantity" 
          value={formData.min_quantity} 
          onChange={handleChange} 
          min="0"
        />

        <label>現在個数</label>
        <input 
          type="number" 
          name="current_quantity" 
          value={formData.current_quantity} 
          onChange={handleChange} 
          min="0"
        />

        <button type="submit" className="btn">登録</button>
      </form>
    </div>
  );
}

export default AddItem;
