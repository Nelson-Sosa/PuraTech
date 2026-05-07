import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../config';
import { useNavigate, Link } from 'react-router-dom';
import Modal from '../../components/Modal/Modal';
import './Inventory.css';

const truncateText = (text, maxLength = 35) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

const Inventory = () => {
  const [inventory, setInventory] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editStock, setEditStock] = useState('');
  const [editThreshold, setEditThreshold] = useState('');
  const [editSku, setEditSku] = useState('');
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
    setEditSku(product.sku || '');
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
    const stockValue = parseInt(editStock);
    const thresholdValue = parseInt(editThreshold);
    
    console.log("🔍 [Save Edit] editStock value:", editStock);
    console.log("🔍 [Save Edit] stockValue:", stockValue);
    console.log("🔍 [Save Edit] thresholdValue:", thresholdValue);
    
    if (isNaN(stockValue) || stockValue < 0) {
      alert("Stock inválido. Ingrese un número válido.");
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${API_URL}/api/inventory/${id}`,
        { 
          stock: stockValue,
          lowStockThreshold: isNaN(thresholdValue) ? 5 : thresholdValue,
          sku: editSku || null
        },
        { headers: { token_usuario: token } }
      );
      console.log("✅ [Save Edit] Response:", response.data);
      setEditingId(null);
      fetchInventory();
    } catch (err) {
      console.error("Error updating stock:", err);
      console.error("Error response:", err.response?.data);
      alert("Error al actualizar stock");
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditStock('');
    setEditThreshold('');
    setEditSku('');
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
              <th>SKU</th>
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
                  <td colSpan="7" className="no-data">
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
                        <strong title={product.nombre}>{truncateText(product.nombre, 35)}</strong>
                        <span title={product.marca}>{truncateText(product.marca, 20)}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    {editingId === product._id ? (
                      <input
                        type="text"
                        value={editSku}
                        onChange={(e) => setEditSku(e.target.value)}
                        className="stock-input"
                        placeholder="SKU"
                      />
                    ) : (
                      product.sku || '-'
                    )}
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
                      <div className="action-buttons">
                        <button
                          className="btn-quick-edit"
                          onClick={() => handleEditClick(product)}
                          title="Editar stock, SKU"
                        >
                          ✏️
                        </button>
                        <Link 
                          to={`/actualizar/product/${product._id}`}
                          className="btn-edit-full"
                          title="Editar todo el producto"
                        >
                          📝
                        </Link>
                        <Link 
                          to={`/product/${product._id}`}
                          className="btn-view"
                          target="_blank"
                          title="Ver producto en tienda"
                        >
                          👁️
                        </Link>
                        <button
                          className="btn-delete-inventory"
                          onClick={() => handleDeleteProduct(product._id, product.name)}
                          title="Eliminar producto"
                        >
                          🗑️
                        </button>
                      </div>
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