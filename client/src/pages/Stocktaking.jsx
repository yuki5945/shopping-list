import React, { useState, useEffect } from 'react';

function Stocktaking() {
  const [inventory, setInventory] = useState([]);
  const [updates, setUpdates] = useState({}); // Map of id -> new_quantity

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const response = await fetch('/api/inventory');
      const data = await response.json();
      setInventory(data.data);
    } catch (error) {
      console.error('Error fetching inventory:', error);
    }
  };

  const handleQuantityChange = (id, value) => {
    setUpdates(prev => ({
      ...prev,
      [id]: parseInt(value) || 0
    }));
  };

  const submitUpdates = async () => {
    const updateList = Object.keys(updates).map(id => ({
      id: parseInt(id),
      current_quantity: updates[id]
    }));

    if (updateList.length === 0) return;

    try {
      await fetch('/api/inventory/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates: updateList })
      });
      alert('在庫を更新しました！');
      setUpdates({});
      fetchInventory();
    } catch (error) {
      console.error('Error updating inventory:', error);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2>在庫取り</h2>
        <button className="btn" style={{ width: 'auto', marginTop: 0 }} onClick={submitUpdates}>
          更新
        </button>
      </div>
      
      {inventory.map(genre => (
        <div key={genre.id} className="genre-section">
          <div className="genre-header">
            {genre.name}
          </div>
          <div className="card" style={{ marginTop: '8px' }}>
            {genre.items.length === 0 ? (
              <p>商品はありません。</p>
            ) : (
              genre.items.map(item => (
                <div key={item.id} className="item-row">
                  <div className="item-info">
                    <div className="item-name">{item.name}</div>
                    <div className="item-meta">下限: {item.min_quantity}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.8rem', color: '#888' }}>現在:</span>
                    <input 
                      type="number" 
                      placeholder={item.current_quantity}
                      value={updates[item.id] !== undefined ? updates[item.id] : ''}
                      onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                      style={{ width: '60px', margin: 0, padding: '8px', textAlign: 'center' }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ))}
      <div style={{ height: '60px' }}></div>
    </div>
  );
}

export default Stocktaking;
