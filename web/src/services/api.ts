const API_BASE_URL = 'http://localhost:3000';

export const api = {
  async login(username: string, password: string) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '登录失败');
    }

    return response.json();
  },

  async logout() {
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '退出登录失败');
    }

    return response.json();
  },

  async getPositions() {
    const response = await fetch(`${API_BASE_URL}/positions`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '获取岗位列表失败');
    }

    return response.json();
  },

  async getRoles() {
    const response = await fetch(`${API_BASE_URL}/roles`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '获取角色列表失败');
    }

    return response.json();
  },

  async getUsers() {
    const response = await fetch(`${API_BASE_URL}/users`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '获取用户列表失败');
    }

    return response.json();
  },

  async getRanks() {
    const response = await fetch(`${API_BASE_URL}/ranks`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '获取职级列表失败');
    }

    return response.json();
  },
};
