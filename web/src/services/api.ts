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

  async batchCreateUsers(users: Array<{ username: string; name: string; email: string }>, roleId: number) {
    const response = await fetch(`${API_BASE_URL}/users/batch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ users, roleId }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '批量创建用户失败');
    }

    return response.json();
  },

  async getMyAbilityScores() {
    const response = await fetch(`${API_BASE_URL}/ability/my-scores`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '获取能力评分失败');
    }

    return response.json();
  },

  async updateMyAbilityScores(scores: any) {
    const response = await fetch(`${API_BASE_URL}/ability/my-scores`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(scores),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '更新能力评分失败');
    }

    return response.json();
  },

  async getPermissions() {
    const response = await fetch(`${API_BASE_URL}/roles/permissions/all`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '获取权限列表失败');
    }

    return response.json();
  },

  async getRoleById(id: number) {
    const response = await fetch(`${API_BASE_URL}/roles/${id}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '获取角色详情失败');
    }

    return response.json();
  },

  async updateRolePermissions(id: number, permissionIds: number[]) {
    const response = await fetch(`${API_BASE_URL}/roles/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ permissionIds }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '更新角色权限失败');
    }

    return response.json();
  },

  async createPosition(positionData: any) {
    const response = await fetch(`${API_BASE_URL}/positions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(positionData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '创建岗位失败');
    }

    return response.json();
  },

  async updatePosition(id: number, positionData: any) {
    const response = await fetch(`${API_BASE_URL}/positions/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(positionData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '更新岗位失败');
    }

    return response.json();
  },

  async deletePosition(id: number) {
    const response = await fetch(`${API_BASE_URL}/positions/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '删除岗位失败');
    }

    return response.json();
  },

  async createAbilityDimension(dimensionData: any) {
    const response = await fetch(`${API_BASE_URL}/ability-dimensions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(dimensionData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '创建能力维度失败');
    }

    return response.json();
  },

  async updateAbilityDimension(id: number, dimensionData: any) {
    const response = await fetch(`${API_BASE_URL}/ability-dimensions/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(dimensionData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '更新能力维度失败');
    }

    return response.json();
  },

  async deleteAbilityDimension(id: number) {
    const response = await fetch(`${API_BASE_URL}/ability-dimensions/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '删除能力维度失败');
    }

    return response.json();
  },

  async getDepartments() {
    const response = await fetch(`${API_BASE_URL}/departments`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '获取部门列表失败');
    }

    return response.json();
  },

  async getDepartmentMembers(id: number) {
    const response = await fetch(`${API_BASE_URL}/departments/${id}/members`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '获取部门成员失败');
    }

    return response.json();
  },

  async createDepartment(departmentData: any) {
    const response = await fetch(`${API_BASE_URL}/departments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(departmentData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '创建部门失败');
    }

    return response.json();
  },

  async updateDepartment(id: number, departmentData: any) {
    const response = await fetch(`${API_BASE_URL}/departments/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(departmentData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '更新部门失败');
    }

    return response.json();
  },

  async updateDepartmentMembers(id: number, memberIds: number[]) {
    const response = await fetch(`${API_BASE_URL}/departments/${id}/members`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ memberIds }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '更新部门成员失败');
    }

    return response.json();
  },

  async deleteDepartment(id: number) {
    const response = await fetch(`${API_BASE_URL}/departments/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '删除部门失败');
    }

    return response.json();
  },
};
