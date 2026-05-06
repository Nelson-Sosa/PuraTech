import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../config';
import { useNavigate } from 'react-router-dom';
import Modal from '../../components/Modal/Modal';
import './Inventory.css';

const Inventory = () => {
  const [inventory, setInventory] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editStock, setEditStock] = useState('');
  const [editThreshold, setEditThreshold] = useState('');
  const [filter, setFilter] = useState('all'); // all, low, out, in
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/api/inventory`, {
        headers: { token_usuario: token }
      });
      setInventory(res.data.inventory);
      setStats(res.data.stats);
    } catch (err) {
      console.error("Error fetching inventory:", err);
      if (err.response && err.response.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (product) => {
    setEditingId(product._id);
    setEditStock(product.stock.toString());
    setEditThreshold(product.lowStockThreshold?.toString() || '5');
  };

  const handleDeleteClick = (product) => {
    setProductToDelete(product);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `${API_URL}/api/remover/product/${productToDelete._id}`,
        { headers: { token_usuario: token } }
      );
      setShowDeleteModal(false);
      setProductToDelete(null);
      fetchInventory();
    } catch (err) {
      console.error("Error deleting product:", err);
      alert("Error al eliminar el producto");
    }
  };

  const handleDeleteProduct = (productId, productName) => {
    setProductToDelete({ _id: productId, name: productName });
    setShowDeleteModal(true);
  };

  const handleSaveEdit = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${API_URL}/api/inventory/${id}`,
        { 
          stock: parseInt(editStock),
          lowStockThreshold: parseInt(editThreshold)
        },
        { headers: { token_usuario: token } }
      );
      setEditingId(null);
      fetchInventory();
    } catch (err) {
      console.error("Error updating stock:", err);
      alert("Error al actualizar stock");
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditStock('');
    setEditThreshold('');
  };

  const getStockBadge = (product) => {
    if (product.isOutOfStock) {
      return <span className="stock-badge out-of-stock">Sin Stock</span>;
    } else if (product.isLowStock) {
      return <span className="stock-badge low-stock">Stock Bajo</span>;
    }
    return <span className="stock-badge in-stock">Disponible</span>;
  };

  const filteredInventory = inventory.filter(product => {
    if (filter === 'low') return product.isLowStock && !product.isOutOfStock;
    if (filter === 'out') return product.isOutOfStock;
    if (filter === 'in') return !product.isLowStock && !product.isOutOfStock;
    return true;
  });

  if (loading) {
    return (
      <div className="inventory-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Cargando inventario...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="inventory-page">
      <div className="inventory-header">
        <h1>📦 Gestión de Inventario</h1>
        {stats && (
          <div className="inventory-stats">
            <div className="stat-card">
              <span className="stat-value">{stats.totalProducts}</span>
              <span className="stat-label">Productos</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">{stats.totalStock}</span>
              <span className="stat-label">Total Unidades</span>
            </div>
            <div className="stat-card warning">
              <span className="stat-value">{stats.lowStock}</span>
              <span className="stat-label">Stock Bajo</span>
            </div>
            <div className="stat-card danger">
              <span className="stat-value">{stats.outOfStock}</span>
              <span className="stat-label">Sin Stock</span>
            </div>
          </div>
        )}
      </div>

      <div className="inventory-filters">
        <button 
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          Todos ({inventory.length})
        </button>
        <button 
          className={`filter-btn ${filter === 'in' ? 'active' : ''}`}
          onClick={() => setFilter('in')}
        >
          Disponibles ({stats?.inStock || 0})
        </button>
        <button 
          className={`filter-btn ${filter === 'low' ? 'active' : ''}`}
          onClick={() => setFilter('low')}
        >
          Stock Bajo ({stats?.lowStock || 0})
        </button>
        <button 
          className={`filter-btn ${filter === 'out' ? 'active' : ''}`}
          onClick={() => setFilter('out')}
        >
          Sin Stock ({stats?.outOfStock || 0})
        </button>
      </div>

      <div className="inventory-table">
        <table>
          <thead>
            <tr>
              <th>Producto</th>
              <th>Categoría</th>
              <th>Stock Actual</th>
              <th>Stock mínimo</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredInventory.length === 0 ? (
              <tr>
                <td colSpan="6" className="no-data">
                  No hay productos
                </td>
              </tr>
            ) : (
              filteredInventory.map(product => (
                <tr key={product._id} className={product.isLowStock ? 'low-stock-row' : ''}>
                  <td>
                    <div className="product-info">
                      <img 
                        src={product.imageUrl || '/img/placeholder.png'} 
                        alt={product.nombre}
                        className="product-thumb"
                      />
                      <div>
                        <strong>{product.nombre}</strong>
                        <span>{product.marca}</span>
                      </div>
                    </div>
                  </td>
                  <td>{product.category}</td>
                  <td>
                    {editingId === product._id ? (
                      <input
                        type="number"
                        value={editStock}
                        onChange={(e) => setEditStock(e.target.value)}
                        className="stock-input"
                        min="0"
                      />
                    ) : (
                      <span className="stock-value">{product.stock}</span>
                    )}
                  </td>
                  <td>
                    {editingId === product._id ? (
                      <input
                        type="number"
                        value={editThreshold}
                        onChange={(e) => setEditThreshold(e.target.value)}
                        className="stock-input"
                        min="0"
                      />
                    ) : (
                      <span>{product.lowStockThreshold}</span>
                    )}
                  </td>
                  <td>{getStockBadge(product)}</td>
                  <td>
                    {editingId === product._id ? (
                      <div className="edit-actions">
                        <button 
                          className="btn-save"
                          onClick={() => handleSaveEdit(product._id)}
                        >
                          ✅
                        </button>
                        <button 
                          className="btn-cancel"
                          onClick={handleCancelEdit}
                        >
                          ❌
                        </button>
                      </div>
                    ) : (
                      <>
                        <button
                          className="btn-edit"
                          onClick={() => handleEditClick(product)}
                        >
                          ✏️ Editar
                        </button>
                        <button
                          className="btn-delete-inventory"
                          onClick={() => handleDeleteProduct(product._id, product.name)}
                        >
                          🗑️ Eliminar
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal
        show={showDeleteModal}
        onClose={() => { setShowDeleteModal(false); setProductToDelete(null); }}
        onConfirm={confirmDelete}
      >
        <h3>Confirmar eliminación</h3>
        <p>¿Estás seguro de eliminar el producto?</p>
        <p style={{ color: '#dc3545', fontSize: '14px' }}>Esta acción no se puede deshacer.</p>
      </Modal>
    </div>
  );
};

export default Inventory;