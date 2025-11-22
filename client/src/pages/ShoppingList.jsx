import React, { useState, useEffect } from 'react';

function ShoppingList() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const response = await fetch('/api/inventory');
      const data = await response.json();
      
      // Flatten items and filter what needs to be bought
      const shoppingItems = [];
      data.data.forEach(genre => {
        genre.items.forEach(item => {
          if (item.current_quantity < item.min_quantity) {
            shoppingItems.push({
              ...item,
              genre_name: genre.name,
              to_buy: item.min_quantity - item.current_quantity,
              checked: false
            });
          }
        });
      });
      setItems(shoppingItems);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching inventory:', error);
      setLoading(false);
    }
  };

  const toggleCheck = (id) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, checked: !item.checked } : item
    ));
  };

  const completeShopping = async () => {
    const purchasedItems = items
      .filter(item => item.checked)
      .map(item => ({
        id: item.id,
        purchased_quantity: item.to_buy // Assuming we buy exactly what's needed
      }));

    if (purchasedItems.length === 0) return;

    try {
      await fetch('/api/shopping/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: purchasedItems })
      });
      // Refresh list
      fetchInventory();
      alert('買い物が完了しました！在庫が更新されました。');
    } catch (error) {
      console.error('Error completing shopping:', error);
    }
  };

  if (loading) return <div className="card">Loading...</div>;

  return (
    <div>
      <div className="card">
        <h2>買い物メモ</h2>
        {items.length === 0 ? (
          <p>買うものはありません！</p>
        ) : (
          <div>
            {items.map(item => (
              <div key={item.id} className="item-row" onClick={() => toggleCheck(item.id)}>
                <div className="item-info">
                  <div className="item-name">{item.name}</div>
                  <div className="item-meta">{item.genre_name} • 買う個数: {item.to_buy}</div>
                </div>
                <div className={`checkbox-custom ${item.checked ? 'checked' : ''}`}></div>
              </div>
            ))}
            <button className="btn" onClick={completeShopping}>
              買い物完了
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ShoppingList;
