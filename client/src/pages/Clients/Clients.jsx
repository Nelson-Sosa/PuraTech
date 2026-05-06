import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../config';
import { useNavigate } from 'react-router-dom';
import './Clients.css';

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/api/usuarios`, {
        headers: { token_usuario: token }
      });
      setClients(res.data);
    } catch (err) {
      console.error("Error fetching clients:", err);
      setError('Error al cargar los clientes');
      if (err.response && err.response.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const deleteClient = async (clientId) => {
    if (!window.confirm('¿Estás seguro de eliminar este usuario?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/api/remover/usuario`, {
        headers: { token_usuario: token },
        data: { id: clientId }
      });
      fetchClients();
    } catch (err) {
      console.error("Error deleting client:", err);
      alert('Error al eliminar el usuario');
    }
  };

  const getRoleBadge = (rol) => {
    return rol === 'admin' ? 'Admin' : 'Cliente';
  };

  const getRoleClass = (rol) => {
    return rol === 'admin' ? 'role-admin' : 'role-client';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-PY', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const filteredClients = clients.filter(client => {
    const search = searchTerm.toLowerCase();
    return (
      (client.nombre && client.nombre.toLowerCase().includes(search)) ||
      (client.apellido && client.apellido.toLowerCase().includes(search)) ||
      (client.correo && client.correo.toLowerCase().includes(search))
    );
  });

  if (loading) {
    return (
      <div className="clients-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Cargando clientes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="clients-page">
      <div className="clients-header">
        <h1>👥 Gestión de Clientes</h1>
        <div className="clients-stats">
          <span className="stat">Total: {clients.length}</span>
          <span className="stat">
            Clientes: {clients.filter(c => c.rol === 'usuario').length}
          </span>
          <span className="stat">
            Admin: {clients.filter(c => c.rol === 'admin').length}
          </span>
        </div>
      </div>

      <div className="clients-search">
        <input
          type="text"
          placeholder="Buscar por nombre, apellido o correo..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="clients-table">
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Apellido</th>
              <th>Correo</th>
              <th>Rol</th>
              <th>Registrado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredClients.length === 0 ? (
              <tr>
                <td colSpan="6" className="no-data">
                  {searchTerm ? 'No se encontraron resultados' : 'No hay clientes registrados'}
                </td>
              </tr>
            ) : (
              filteredClients.map(client => (
                <tr key={client._id}>
                  <td>{client.nombre || 'N/A'}</td>
                  <td>{client.apellido || 'N/A'}</td>
                  <td>{client.correo || 'N/A'}</td>
                  <td>
                    <span className={`role-badge ${getRoleClass(client.rol)}`}>
                      {getRoleBadge(client.rol)}
                    </span>
                  </td>
                  <td>{formatDate(client.createdAt)}</td>
                  <td>
                    <button
                      className="btn-delete-client"
                      onClick={() => deleteClient(client._id)}
                      title="Eliminar usuario"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Clients;