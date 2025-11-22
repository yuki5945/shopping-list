import React, { useState, useEffect } from 'react';

function InventoryList() {
  const [inventory, setInventory] = useState([]);
  const [expandedGenre, setExpandedGenre] = useState(null);
  const [addingItemToGenre, setAddingItemToGenre] = useState(null);
  const [editingItem, setEditingItem] = useState(null); // ID of item being edited
  const [editForm, setEditForm] = useState({}); // Form data for editing
  const [newItem, setNewItem] = useState({ name: '', min_quantity: 1, current_quantity: 0 });

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

  const toggleGenre = (id) => {
    setExpandedGenre(expandedGenre === id ? null : id);
  };

  const deleteItem = async (id) => {
    if (!window.confirm('本当に削除しますか？')) return;
    try {
      await fetch(`/api/items/${id}`, {
        method: 'DELETE'
      });
      fetchInventory();
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const startAdding = (genreId) => {
    setAddingItemToGenre(genreId);
    setNewItem({ name: '', min_quantity: 1, current_quantity: 0 });
  };

  const cancelAdding = () => {
    setAddingItemToGenre(null);
  };

  const handleAddItem = async (genreName) => {
    if (!newItem.name) return alert('商品名を入力してください');
    
    try {
      await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          genre_name: genreName,
          ...newItem
        })
      });
      setAddingItemToGenre(null);
      fetchInventory();
    } catch (error) {
      console.error('Error adding item:', error);
      alert('追加に失敗しました');
    }
  };

  const startEditing = (item) => {
    setEditingItem(item.id);
    setEditForm({ ...item });
  };

  const cancelEditing = () => {
    setEditingItem(null);
    setEditForm({});
  };

  const handleUpdateItem = async () => {
    if (!editForm.name) return alert('商品名を入力してください');

    try {
      await fetch(`/api/items/${editForm.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...editForm,
          genre_id: inventory.find(g => g.items.some(i => i.id === editForm.id)).id // Keep same genre
        })
      });
      setEditingItem(null);
      fetchInventory();
    } catch (error) {
      console.error('Error updating item:', error);
      alert('更新に失敗しました');
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
                  <div key={item.id} className="item-row" style={{ flexDirection: editingItem === item.id ? 'column' : 'row', alignItems: editingItem === item.id ? 'stretch' : 'center' }}>
                    {editingItem === item.id ? (
                      // Editing Mode
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
                        <input 
                          type="text" 
                          value={editForm.name}
                          onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                          style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                        />
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <div style={{ flex: 1 }}>
                            <label style={{ fontSize: '0.8rem' }}>下限</label>
                            <input 
                              type="number" 
                              value={editForm.min_quantity}
                              onChange={(e) => setEditForm({...editForm, min_quantity: parseInt(e.target.value)})}
                              style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                            />
                          </div>
                          <div style={{ flex: 1 }}>
                            <label style={{ fontSize: '0.8rem' }}>現在</label>
                            <input 
                              type="number" 
                              value={editForm.current_quantity}
                              onChange={(e) => setEditForm({...editForm, current_quantity: parseInt(e.target.value)})}
                              style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                            />
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '4px' }}>
                          <button onClick={cancelEditing} style={{ padding: '6px 12px', background: '#ccc', border: 'none', borderRadius: '4px' }}>キャンセル</button>
                          <button onClick={handleUpdateItem} style={{ padding: '6px 12px', background: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px' }}>保存</button>
                        </div>
                      </div>
                    ) : (
                      // View Mode
                      <>
                        <div className="item-info">
                          <div className="item-name">{item.name}</div>
                          <div className="item-meta">
                            下限: {item.min_quantity} | 現在: {item.current_quantity}
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button 
                            onClick={(e) => { e.stopPropagation(); startEditing(item); }}
                            style={{ padding: '4px 8px', background: '#eee', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}
                          >
                            編集
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); deleteItem(item.id); }}
                            style={{ padding: '4px 8px', background: '#FF6B6B', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}
                          >
                            削除
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))
              )}

              {addingItemToGenre === genre.id ? (
                <div className="item-row" style={{ flexDirection: 'column', gap: '8px', background: '#f9f9f9', padding: '10px', borderRadius: '8px' }}>
                  <input 
                    type="text" 
                    placeholder="商品名" 
                    value={newItem.name}
                    onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                    style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                  />
                  <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: '0.8rem' }}>下限</label>
                      <input 
                        type="number" 
                        value={newItem.min_quantity}
                        onChange={(e) => setNewItem({...newItem, min_quantity: parseInt(e.target.value)})}
                        style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: '0.8rem' }}>現在</label>
                      <input 
                        type="number" 
                        value={newItem.current_quantity}
                        onChange={(e) => setNewItem({...newItem, current_quantity: parseInt(e.target.value)})}
                        style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                      />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', width: '100%' }}>
                    <button onClick={cancelAdding} style={{ padding: '4px 8px', background: '#ccc', border: 'none', borderRadius: '4px' }}>キャンセル</button>
                    <button onClick={() => handleAddItem(genre.name)} style={{ padding: '4px 8px', background: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px' }}>保存</button>
                  </div>
                </div>
              ) : (
                <button 
                  onClick={(e) => { e.stopPropagation(); startAdding(genre.id); }}
                  style={{ width: '100%', padding: '8px', marginTop: '8px', background: '#e0e0e0', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                  + アイテムを追加
                </button>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default InventoryList;
