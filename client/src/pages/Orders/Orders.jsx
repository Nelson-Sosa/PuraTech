import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../config';
import { useNavigate } from 'react-router-dom';
import './Orders.css';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/api/orders`, {
        headers: { token_usuario: token }
      });
      setOrders(res.data);
    } catch (error) {
      console.error("Error cargando pedidos:", error);
      if (error.response && error.response.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/api/orders/${orderId}/status`, 
        { status: newStatus },
        { headers: { token_usuario: token } }
      );
      fetchOrders();
    } catch (error) {
      console.error("Error actualizando estado:", error);
      alert("Error al actualizar el estado");
    }
  };

  const deleteOrder = async (orderId) => {
    if (!window.confirm("¿Estás seguro de eliminar este pedido?")) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/api/orders/${orderId}`, {
        headers: { token_usuario: token }
      });
      fetchOrders();
    } catch (error) {
      console.error("Error eliminando pedido:", error);
      alert("Error al eliminar el pedido");
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#ff9800',
      confirmed: '#2196f3',
      preparing: '#9c27b0',
      shipped: '#00bcd4',
      delivered: '#4caf50',
      cancelled: '#f44336'
    };
    return colors[status] || '#666';
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: 'Pendiente',
      confirmed: 'Confirmado',
      preparing: 'Preparando',
      shipped: 'Enviado',
      delivered: 'Entregado',
      cancelled: 'Cancelado'
    };
    return labels[status] || status;
  };

  const filteredOrders = filterStatus === 'all' 
    ? orders 
    : orders.filter(order => order.status === filterStatus);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('es-PY', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <div className="orders-loading">Cargando pedidos...</div>;
  }

  return (
    <div className="orders-page">
      <div className="orders-header">
        <h1>📋 Pedidos</h1>
        <div className="orders-stats">
          <span className="stat">Total: {orders.length}</span>
          <span className="stat pending">Pendientes: {orders.filter(o => o.status === 'pending').length}</span>
        </div>
      </div>

      <div className="orders-filters">
        <button 
          className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
          onClick={() => setFilterStatus('all')}
        >
          Todos ({orders.length})
        </button>
        <button 
          className={`filter-btn ${filterStatus === 'pending' ? 'active' : ''}`}
          onClick={() => setFilterStatus('pending')}
        >
          Pendientes
        </button>
        <button 
          className={`filter-btn ${filterStatus === 'confirmed' ? 'active' : ''}`}
          onClick={() => setFilterStatus('confirmed')}
        >
          Confirmados
        </button>
        <button 
          className={`filter-btn ${filterStatus === 'preparing' ? 'active' : ''}`}
          onClick={() => setFilterStatus('preparing')}
        >
          Preparando
        </button>
        <button 
          className={`filter-btn ${filterStatus === 'shipped' ? 'active' : ''}`}
          onClick={() => setFilterStatus('shipped')}
        >
          Enviados
        </button>
        <button 
          className={`filter-btn ${filterStatus === 'delivered' ? 'active' : ''}`}
          onClick={() => setFilterStatus('delivered')}
        >
          Entregados
        </button>
      </div>

      <div className="orders-list">
        {filteredOrders.length === 0 ? (
          <div className="no-orders">
            <span className="no-orders-icon">📦</span>
            <p>No hay pedidos</p>
          </div>
        ) : (
          filteredOrders.map(order => (
            <div key={order._id} className="order-card">
              <div className="order-header">
                <div className="order-id">
                  <strong>ID: #{order._id.substring(0, 8).toUpperCase()}</strong>
                  <span className="order-date">{formatDate(order.createdAt)}</span>
                </div>
                <span 
                  className="order-status"
                  style={{ backgroundColor: getStatusColor(order.status) }}
                >
                  {getStatusLabel(order.status)}
                </span>
              </div>

              <div className="order-customer">
                <div className="customer-info">
                  <span className="label">Cliente</span>
                  <span>{order.customerName}</span>
                </div>
                <div className="customer-info">
                  <span className="label">Contacto</span>
                  <span>{order.customerPhone}</span>
                </div>
                {order.deliveryAddress && (
                  <div className="customer-info">
                    <span className="label">Dirección de Entrega</span>
                    <span>{order.deliveryAddress}</span>
                  </div>
                )}
              </div>

              <div className="order-products">
                <span className="label">Detalle de Productos</span>
                <ul className="products-list">
                  {order.products?.map((product, idx) => (
                    <li key={idx}>
                      <span className="product-name">{product.nombre} <small>({product.marca})</small></span>
                      <span className="product-qty-price">x{product.quantity} — {Number(product.precio).toLocaleString("es-PY")} Gs.</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="order-total">
                <span>Total Pedido: <strong>{Number(order.total).toLocaleString("es-PY")} Gs.</strong></span>
              </div>

              <div className="order-actions">
                <div className="status-control">
                  <select 
                    value={order.status}
                    onChange={(e) => updateStatus(order._id, e.target.value)}
                    className="status-select"
                  >
                    <option value="pending">Pendiente</option>
                    <option value="confirmed">Confirmado</option>
                    <option value="preparing">Preparando</option>
                    <option value="shipped">Enviado</option>
                    <option value="delivered">Entregado</option>
                    <option value="cancelled">Cancelado</option>
                  </select>
                </div>
                <button 
                  className="delete-btn"
                  onClick={() => deleteOrder(order._id)}
                >
                  Eliminar Registro
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Orders;