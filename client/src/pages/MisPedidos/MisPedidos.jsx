import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../../config";
import "./MisPedidos.css";

const STATUS_CONFIG = {
  pending: {
    label: "Pendiente",
    className: "badge-pending",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    )
  },
  confirmed: {
    label: "Confirmado",
    className: "badge-processing",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    )
  },
  preparing: {
    label: "Preparando",
    className: "badge-processing",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    )
  },
  shipped: {
    label: "Enviado",
    className: "badge-shipped",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="3" width="15" height="13" />
        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
        <circle cx="5.5" cy="18.5" r="2.5" />
        <circle cx="18.5" cy="18.5" r="2.5" />
      </svg>
    )
  },
  delivered: {
    label: "Entregado",
    className: "badge-delivered",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    )
  },
  cancelled: {
    label: "Cancelado",
    className: "badge-cancelled",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    )
  }
};

const OrderStatusBadge = ({ status }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return (
    <span className={`order-status-badge ${config.className}`}>
      <span className="badge-icon">{config.icon}</span>
      <span className="badge-label">{config.label}</span>
    </span>
  );
};

const ProductThumbnail = ({ src, alt }) => {
  const [error, setError] = useState(false);
  return (
    <div className="order-thumb">
      {!error ? (
        <img
          src={src || "/img/placeholder.png"}
          alt={alt}
          onError={() => setError(true)}
          loading="lazy"
        />
      ) : (
        <div className="thumb-placeholder">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
        </div>
      )}
    </div>
  );
};

const OrderSkeleton = () => (
  <div className="order-card skeleton-card">
    <div className="skeleton-order-header">
      <div className="skeleton skeleton-text skeleton-number" />
      <div className="skeleton skeleton-text skeleton-date" />
    </div>
    <div className="skeleton-order-body">
      <div className="skeleton-thumbs">
        <div className="skeleton skeleton-thumb" />
        <div className="skeleton skeleton-thumb" />
        <div className="skeleton skeleton-thumb" />
      </div>
      <div className="skeleton-info">
        <div className="skeleton skeleton-text skeleton-line" />
        <div className="skeleton skeleton-text skeleton-line-short" />
        <div className="skeleton skeleton-text skeleton-line-short" />
      </div>
    </div>
    <div className="skeleton-order-footer">
      <div className="skeleton skeleton-text skeleton-price" />
      <div className="skeleton skeleton-btn" />
    </div>
  </div>
);

const LoadingState = () => (
  <div className="loading-orders">
    {[1, 2, 3].map(i => <OrderSkeleton key={i} />)}
  </div>
);

const EmptyState = () => (
  <div className="empty-orders">
    <div className="empty-icon">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 0 1-8 0" />
      </svg>
    </div>
    <h2 className="empty-title">No has realizado compras todavía</h2>
    <p className="empty-subtitle">Explora nuestros productos y realiza tu primer pedido.</p>
    <Link to="/" className="empty-cta">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
        <line x1="12" y1="22.08" x2="12" y2="12" />
      </svg>
      Ir a la tienda
    </Link>
  </div>
);

const OrderDetailModal = ({ order, onClose }) => {
  if (!order) return null;

  const formatPrice = (val) => `${Number(val || 0).toLocaleString("es-PY")} Gs.`;
  const formatDate = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("es-PY", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const subtotal = order.subtotal || order.products?.reduce((sum, p) => sum + (p.precio * p.quantity), 0) || 0;
  const shipping = order.shippingCost || 0;
  const discount = order.discount || 0;
  const total = order.total || subtotal;

  const handleDownloadPDF = () => {
    const win = window.open("", "_blank");
    if (!win) return;
    const itemsHtml = order.products?.map(p => `
      <tr>
        <td style="padding:8px;border-bottom:1px solid #eee;">
          <img src="${p.imageUrl || '/img/placeholder.png'}" style="width:50px;height:50px;object-fit:cover;border-radius:4px;" />
        </td>
        <td style="padding:8px;border-bottom:1px solid #eee;">${p.nombre}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;">${Number(p.precio).toLocaleString("es-PY")} Gs.</td>
        <td style="padding:8px;border-bottom:1px solid #eee;text-align:center;">${p.quantity}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;text-align:right;">${Number(p.precio * p.quantity).toLocaleString("es-PY")} Gs.</td>
      </tr>
    `).join("") || "";

    win.document.write(`
      <html>
      <head><title>Comprobante ${order.orderNumber || order._id}</title>
      <style>
        body{font-family:Arial,sans-serif;padding:40px;color:#333;}
        h1{color:#2563eb;border-bottom:2px solid #2563eb;padding-bottom:10px;}
        .info{display:flex;justify-content:space-between;margin:20px 0;}
        .info div{flex:1;}
        table{width:100%;border-collapse:collapse;margin:20px 0;}
        th{background:#f3f4f6;text-align:left;padding:8px;border-bottom:2px solid #ddd;}
        .total-row td{font-weight:bold;font-size:18px;padding-top:12px;}
        .footer{margin-top:40px;text-align:center;color:#999;font-size:12px;}
        .status{display:inline-block;padding:4px 12px;border-radius:999px;font-size:14px;font-weight:600;background:#d1fae5;color:#065f46;}
      </style>
      </head>
      <body>
        <h1>PuraTech - Comprobante de Pedido</h1>
        <div class="info">
          <div>
            <p><strong>Pedido:</strong> ${order.orderNumber || order._id}</p>
            <p><strong>Fecha:</strong> ${formatDate(order.createdAt)}</p>
            <p><strong>Estado:</strong> <span class="status">${STATUS_CONFIG[order.status]?.label || order.status}</span></p>
          </div>
          <div>
            <p><strong>Método de pago:</strong> ${order.paymentMethod || "WhatsApp"}</p>
            <p><strong>Cliente:</strong> ${order.customerName}</p>
            <p><strong>Dirección:</strong> ${order.deliveryAddress || "Retiro en tienda"}</p>
          </div>
        </div>
        <table>
          <thead><tr><th></th><th>Producto</th><th>Precio</th><th>Cant.</th><th>Subtotal</th></tr></thead>
          <tbody>${itemsHtml}</tbody>
        </table>
        <table style="width:300px;margin-left:auto;">
          <tr><td>Subtotal</td><td style="text-align:right;">${formatPrice(subtotal)}</td></tr>
          <tr><td>Envío</td><td style="text-align:right;">${formatPrice(shipping)}</td></tr>
          ${discount > 0 ? `<tr><td>Descuento</td><td style="text-align:right;">-${formatPrice(discount)}</td></tr>` : ""}
          <tr class="total-row"><td>TOTAL</td><td style="text-align:right;">${formatPrice(total)}</td></tr>
        </table>
        <div class="footer">
          <p>PuraTech - Tu tienda de tecnología</p>
          <p>Gracias por tu compra</p>
        </div>
        <script>window.print();</script>
      </body>
      </html>
    `);
    win.document.close();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Cerrar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <div className="modal-body">
          <div className="detail-header">
            <div className="detail-header-left">
              <h2 className="detail-order-number">{order.orderNumber || `#${order._id?.substring(0, 8).toUpperCase()}`}</h2>
              <p className="detail-date">{formatDate(order.createdAt)}</p>
            </div>
            <div className="detail-header-right">
              <OrderStatusBadge status={order.status} />
              <span className="detail-payment-method">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                  <line x1="1" y1="10" x2="23" y2="10" />
                </svg>
                {order.paymentMethod || "WhatsApp"}
              </span>
            </div>
          </div>

          <div className="detail-shipping">
            <h3 className="detail-section-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                <line x1="12" y1="22.08" x2="12" y2="12" />
              </svg>
              Información de envío
            </h3>
            <div className="shipping-grid">
              <div className="shipping-item">
                <span className="shipping-label">Destinatario</span>
                <span className="shipping-value">{order.shippingAddress?.name || order.customerName || "—"}</span>
              </div>
              <div className="shipping-item">
                <span className="shipping-label">Teléfono</span>
                <span className="shipping-value">{order.shippingAddress?.phone || order.customerPhone || "—"}</span>
              </div>
              <div className="shipping-item full-width">
                <span className="shipping-label">Dirección</span>
                <span className="shipping-value">{order.shippingAddress?.address || order.deliveryAddress || "Retiro en tienda"}</span>
              </div>
              <div className="shipping-item">
                <span className="shipping-label">Ciudad</span>
                <span className="shipping-value">{order.shippingAddress?.city || "—"}</span>
              </div>
              <div className="shipping-item full-width">
                <span className="shipping-label">Referencias</span>
                <span className="shipping-value">{order.shippingAddress?.references || "—"}</span>
              </div>
            </div>
          </div>

          <div className="detail-products">
            <h3 className="detail-section-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              </svg>
              Productos ({order.products?.length || 0})
            </h3>
            <div className="products-table">
              <div className="products-table-header">
                <span className="col-product">Producto</span>
                <span className="col-price">Precio</span>
                <span className="col-qty">Cant.</span>
                <span className="col-subtotal">Subtotal</span>
              </div>
              {order.products?.map((product, idx) => (
                <div key={idx} className="products-table-row">
                  <div className="col-product">
                    <ProductThumbnail src={product.imageUrl} alt={product.nombre} />
                    <div className="product-info-cell">
                      <span className="product-name-cell">{product.nombre}</span>
                      <span className="product-brand-cell">{product.marca}</span>
                    </div>
                  </div>
                  <div className="col-price">{Number(product.precio).toLocaleString("es-PY")} Gs.</div>
                  <div className="col-qty">{product.quantity}</div>
                  <div className="col-subtotal">
                    <span>{Number(product.precio * product.quantity).toLocaleString("es-PY")} Gs.</span>
                    <Link
                      to={`/product/${product.productId || ''}`}
                      className="product-rebuy-btn"
                      onClick={e => { e.stopPropagation(); onClose(); }}
                      title="Volver a comprar"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="9" cy="21" r="1" />
                        <circle cx="20" cy="21" r="1" />
                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                      </svg>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="detail-summary">
            <div className="summary-card">
              <h3 className="detail-section-title">Resumen de compra</h3>
              <div className="summary-rows">
                <div className="summary-row">
                  <span>Subtotal ({order.products?.length || 0} productos)</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="summary-row">
                  <span>Envío</span>
                  <span>{shipping === 0 ? "Gratis" : formatPrice(shipping)}</span>
                </div>
                {discount > 0 && (
                  <div className="summary-row summary-discount">
                    <span>Descuento</span>
                    <span>-{formatPrice(discount)}</span>
                  </div>
                )}
                <div className="summary-divider" />
                <div className="summary-row summary-total">
                  <span>TOTAL</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="detail-actions">
            <button className="detail-action-btn" onClick={handleDownloadPDF}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Descargar comprobante
            </button>
            <Link
              to={`https://wa.me/595983986775?text=${encodeURIComponent(`Hola PuraTech, tengo una consulta sobre mi pedido ${order.orderNumber || order._id}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="detail-action-btn support-btn"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              Contactar soporte
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

const MisPedidos = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        window.location.href = "/login";
        return;
      }
      const res = await axios.get(`${API_URL}/api/my-orders`, {
        headers: { token_usuario: token }
      });
      setOrders(res.data || []);
    } catch (err) {
      console.error("[MisPedidos] Error:", err);
      if (err.response?.status === 401) {
        window.location.href = "/login";
        return;
      }
      setError("Error al cargar tus pedidos. Intenta de nuevo más tarde.");
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (val) => `${Number(val || 0).toLocaleString("es-PY")} Gs.`;
  const formatDate = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("es-PY", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const filteredOrders = orders.filter(order => {
    const matchStatus = filterStatus === "all" || order.status === filterStatus;
    const search = searchTerm.toLowerCase();
    const matchSearch = !searchTerm ||
      (order.orderNumber?.toLowerCase().includes(search)) ||
      (order._id?.toLowerCase().includes(search)) ||
      (order.customerName?.toLowerCase().includes(search));
    return matchStatus && matchSearch;
  });

  const productCount = (order) => order.products?.reduce((sum, p) => sum + (p.quantity || 1), 0) || 0;

  if (error) {
    return (
      <div className="mis-pedidos-page">
        <div className="page-header">
          <h1>Mis Pedidos</h1>
        </div>
        <div className="error-state">
          <div className="error-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <p>{error}</p>
          <button className="retry-btn" onClick={fetchOrders}>Intentar de nuevo</button>
        </div>
      </div>
    );
  }

  return (
    <div className="mis-pedidos-page">
      <div className="page-header">
        <div className="page-title-section">
          <div className="page-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
              <line x1="12" y1="22.08" x2="12" y2="12" />
            </svg>
          </div>
          <div>
            <h1>Mis Pedidos</h1>
            <p className="page-subtitle">
              {orders.length > 0
                ? `Tienes ${orders.length} pedido${orders.length !== 1 ? 's' : ''}`
                : "Historial de tus compras"}
            </p>
          </div>
        </div>
      </div>

      {orders.length > 0 && (
        <div className="filters-bar">
          <div className="status-filters">
            {[
              { value: "all", label: "Todos" },
              { value: "pending", label: "Pendientes" },
              { value: "confirmed", label: "Procesando" },
              { value: "shipped", label: "Enviados" },
              { value: "delivered", label: "Entregados" },
              { value: "cancelled", label: "Cancelados" }
            ].map(f => (
              <button
                key={f.value}
                className={`filter-chip ${filterStatus === f.value ? "active" : ""}`}
                onClick={() => setFilterStatus(f.value)}
              >
                {f.label}
                {f.value !== "all" && (
                  <span className="filter-count">
                    {orders.filter(o => o.status === f.value).length}
                  </span>
                )}
              </button>
            ))}
          </div>
          <div className="search-box">
            <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Buscar por número de pedido..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      )}

      {loading ? (
        <LoadingState />
      ) : filteredOrders.length === 0 ? (
        orders.length === 0 ? <EmptyState /> : (
          <div className="no-results">
            <p>No se encontraron pedidos con los filtros seleccionados.</p>
            <button className="clear-filter-btn" onClick={() => { setFilterStatus("all"); setSearchTerm(""); }}>
              Limpiar filtros
            </button>
          </div>
        )
      ) : (
        <div className="orders-list">
          {filteredOrders.map(order => (
            <div key={order._id} className="order-card">
              <div className="order-card-header">
                <div className="order-number-section">
                  <span className="order-number-label">Pedido</span>
                  <span className="order-number-value">{order.orderNumber || `#${order._id?.substring(0, 8).toUpperCase()}`}</span>
                </div>
                <div className="order-date-section">
                  <span className="order-date-label">Realizado el</span>
                  <span className="order-date-value">{formatDate(order.createdAt)}</span>
                </div>
                <OrderStatusBadge status={order.status} />
              </div>

              <div className="order-card-body">
                <div className="order-thumbnails">
                  {order.products?.slice(0, 5).map((product, idx) => (
                    <ProductThumbnail key={idx} src={product.imageUrl} alt={product.nombre} />
                  ))}
                  {(order.products?.length || 0) > 5 && (
                    <div className="order-thumb more-thumb">
                      <span>+{order.products.length - 5}</span>
                    </div>
                  )}
                </div>

                <div className="order-info-columns">
                  <div className="order-info-item">
                    <span className="info-label">Total pagado</span>
                    <span className="info-value info-price">{formatPrice(order.total)}</span>
                  </div>
                  <div className="order-info-item">
                    <span className="info-label">Productos</span>
                    <span className="info-value">{productCount(order)} producto{productCount(order) !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="order-info-item">
                    <span className="info-label">Pago</span>
                    <span className="info-value">{order.paymentMethod || "WhatsApp"}</span>
                  </div>
                  <div className="order-info-item">
                    <span className="info-label">Envío</span>
                    <span className="info-value info-address">
                      {order.shippingAddress?.city
                        ? `${order.shippingAddress.city}`
                        : order.deliveryAddress
                          ? order.deliveryAddress.length > 30
                            ? order.deliveryAddress.substring(0, 30) + "..."
                            : order.deliveryAddress
                          : "Retiro en tienda"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="order-card-footer">
                <button
                  className="btn-detail"
                  onClick={() => setSelectedOrder(order)}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                  Ver detalles
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <OrderDetailModal
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />
    </div>
  );
};

export default MisPedidos;
