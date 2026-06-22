const API_BASE_URL = 'http://cev-backend.test/';

class ApiClient {
  constructor(baseUrl = API_BASE_URL) {
    this.baseUrl = baseUrl;
    this._refrescando = false;
  }

  async request(endpoint, options = {}) {
    const token = localStorage.getItem('token');

    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config = { ...options, headers };
    let response = await fetch(`${this.baseUrl}${endpoint}`, config);

    if (response.status === 401 && !this._refrescando && endpoint !== 'refresh') {
      const renovado = await this._refrescarToken();
      if (renovado) {
        headers['Authorization'] = `Bearer ${localStorage.getItem('token')}`;
        config.headers = headers;
        response = await fetch(`${this.baseUrl}${endpoint}`, config);
      } else {
        localStorage.clear();
        sessionStorage.setItem('redirect_reason', 'expired');
        window.location.href = '/login';
        throw new Error('Sesión expirada');
      }
    }

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      const mensaje = body.error || body.data?.error || body.message || `Error ${response.status}`;
      throw new Error(mensaje);
    }

    return response.json();
  }

  async _refrescarToken() {
    this._refrescando = true;
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      this._refrescando = false;
      return false;
    }

    try {
      const res = await fetch(`${this.baseUrl}refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (!res.ok) {
        this._refrescando = false;
        return false;
      }

      const body = await res.json();
      const data = body.data || body;

      if (data.access_token) {
        localStorage.setItem('token', data.access_token);
        if (data.refresh_token) {
          localStorage.setItem('refresh_token', data.refresh_token);
        }
        this._refrescando = false;
        return true;
      }

      this._refrescando = false;
      return false;
    } catch {
      this._refrescando = false;
      return false;
    }
  }

  get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  post(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  put(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();
export default ApiClient;
