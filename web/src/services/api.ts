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

  async batchCreateUsers(users: Array<{ username: string; name: string; email: string; positionId: number; rank: string }>, roleId: number) {
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

  async updateUserAbilityScores(
    userId: number,
    abilityScores: Record<string, number>,
  ) {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/scores`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ abilityScores }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '保存评分失败');
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

  async getDepartment(id: number) {
    const response = await fetch(`${API_BASE_URL}/departments/${id}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '获取部门详情失败');
    }

    return response.json();
  },

  async deleteUser(id: number) {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '删除用户失败');
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

  async getSections(departmentId: number) {
    const response = await fetch(
      `${API_BASE_URL}/sections?departmentId=${departmentId}`,
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      },
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '获取科室列表失败');
    }

    return response.json();
  },

  async getSection(id: number) {
    const response = await fetch(`${API_BASE_URL}/sections/${id}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '获取科室详情失败');
    }

    return response.json();
  },

  async createSection(sectionData: any) {
    const response = await fetch(`${API_BASE_URL}/sections`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(sectionData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '创建科室失败');
    }

    return response.json();
  },

  async updateSection(id: number, sectionData: any) {
    const response = await fetch(`${API_BASE_URL}/sections/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(sectionData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '更新科室失败');
    }

    return response.json();
  },

  async updateSectionMembers(id: number, memberIds: number[]) {
    const response = await fetch(`${API_BASE_URL}/sections/${id}/members`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ memberIds }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '更新科室成员失败');
    }

    return response.json();
  },

  async addSectionMembers(id: number, memberIds: number[]) {
    const response = await fetch(`${API_BASE_URL}/sections/${id}/members`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ memberIds }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '添加科室成员失败');
    }

    return response.json();
  },

  async removeSectionMembers(id: number, memberIds: number[]) {
    const response = await fetch(`${API_BASE_URL}/sections/${id}/members`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ memberIds }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '移除科室成员失败');
    }

    return response.json();
  },

  async deleteSection(id: number) {
    const response = await fetch(`${API_BASE_URL}/sections/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '删除科室失败');
    }

    return response.json();
  },

  async getGroups(departmentId: number) {
    const response = await fetch(`${API_BASE_URL}/groups?departmentId=${departmentId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '获取分组列表失败');
    }

    return response.json();
  },

  async getGroup(id: number) {
    const response = await fetch(`${API_BASE_URL}/groups/${id}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '获取分组详情失败');
    }

    return response.json();
  },

  async createGroup(groupData: any) {
    const response = await fetch(`${API_BASE_URL}/groups`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(groupData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '创建分组失败');
    }

    return response.json();
  },

  async updateGroup(id: number, groupData: any) {
    const response = await fetch(`${API_BASE_URL}/groups/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(groupData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '更新分组失败');
    }

    return response.json();
  },

  async updateGroupMembers(id: number, memberIds: number[]) {
    const response = await fetch(`${API_BASE_URL}/groups/${id}/members`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ memberIds }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '更新分组成员失败');
    }

    return response.json();
  },

  async addGroupMembers(id: number, memberIds: number[]) {
    const response = await fetch(`${API_BASE_URL}/groups/${id}/members`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ memberIds }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '添加分组成员失败');
    }

    return response.json();
  },

  async removeGroupMembers(id: number, memberIds: number[]) {
    const response = await fetch(`${API_BASE_URL}/groups/${id}/members`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ memberIds }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '移除分组成员失败');
    }

    return response.json();
  },

  async getMyPeerReviewTargets() {
    const response = await fetch(`${API_BASE_URL}/groups/peer-review/targets`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '获取分组互评数据失败');
    }

    return response.json();
  },

  async savePeerReviewScore(data: {
    groupId: number;
    targetUserId: number;
    scores: Record<string, number>;
  }) {
    const response = await fetch(`${API_BASE_URL}/groups/peer-review/scores`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '保存互评分数失败');
    }

    return response.json();
  },

  async deleteGroup(id: number) {
    const response = await fetch(`${API_BASE_URL}/groups/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '删除分组失败');
    }

    return response.json();
  },
};
