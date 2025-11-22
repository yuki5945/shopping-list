import React, { useState, useEffect } from 'react';

function InventoryList() {
  const [inventory, setInventory] = useState([]);
  const [expandedGenre, setExpandedGenre] = useState(null);

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/inventory');
      const data = await response.json();
      setInventory(data.data);
    } catch (error) {
      console.error('Error fetching inventory:', error);
    }
  };

  const toggleGenre = (id) => {
    setExpandedGenre(expandedGenre === id ? null : id);
  };

  const deleteItem = async (id) => {
    if (!window.confirm('本当に削除しますか？')) return;
    try {
      await fetch(`http://localhost:3001/api/items/${id}`, {
        method: 'DELETE'
      });
      fetchInventory();
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  return (
    <div>
      <h2>在庫一覧</h2>
      {inventory.map(genre => (
        <div key={genre.id} className="genre-section">
          <div className="genre-header" onClick={() => toggleGenre(genre.id)}>
            <span>{genre.name}</span>
            <span>{expandedGenre === genre.id ? '▼' : '▶'}</span>
          </div>
          {expandedGenre === genre.id && (
            <div className="card" style={{ marginTop: '8px' }}>
              {genre.items.length === 0 ? (
                <p>このジャンルに商品はありません。</p>
              ) : (
                genre.items.map(item => (
                  <div key={item.id} className="item-row">
                    <div className="item-info">
                      <div className="item-name">{item.name}</div>
                      <div className="item-meta">
                        下限: {item.min_quantity} | 現在: {item.current_quantity}
                      </div>
                    </div>
                    <button 
                      style={{ background: 'none', border: 'none', color: '#FF6B6B', fontSize: '1.2rem', cursor: 'pointer' }}
                      onClick={(e) => { e.stopPropagation(); deleteItem(item.id); }}
                    >
                      🗑️
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default InventoryList;
