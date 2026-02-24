import { useState, useEffect } from 'react';
import { storage } from '../utils/storage';
import type { Role, User } from '../types';
import './RoleManagement.css';

export default function RoleManagement() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [formData, setFormData] = useState<Role>({
    id: '',
    name: '',
    description: '',
    permissions: []
  });
  const [userFormData, setUserFormData] = useState({
    users: [] as Array<{ username: string; name: string; email: string }>
  });

  useEffect(() => {
    loadRoles();
    loadUsers();
  }, []);

  const loadRoles = () => {
    const data = storage.get<Role[]>('ROLES') || [];
    setRoles(data);
  };

  const loadUsers = () => {
    const data = storage.get<User[]>('USERS') || [];
    setUsers(data);
  };

  const handleAdd = () => {
    setEditingRole(null);
    setFormData({ id: '', name: '', description: '', permissions: [] });
    setIsModalOpen(true);
  };

  const handleEdit = (role: Role) => {
    setEditingRole(role);
    setFormData(role);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('确定要删除该角色吗?')) {
      const newRoles = roles.filter(r => r.id !== id);
      storage.set('ROLES', newRoles);
      loadRoles();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let newRoles: Role[];

    if (editingRole) {
      newRoles = roles.map(r => r.id === editingRole.id ? formData : r);
    } else {
      newRoles = [...roles, formData];
    }

    storage.set('ROLES', newRoles);
    loadRoles();
    setIsModalOpen(false);
  };

  const handleAddUsers = (role: Role) => {
    setSelectedRole(role);
    setUserFormData({ users: [] });
    setIsUserModalOpen(true);
  };

  const handleUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) return;

    // 生成新用户ID
    const existingUsers = storage.get<User[]>('USERS') || [];
    const maxId = existingUsers.reduce((max, user) => Math.max(max, user.id), 0);
    let nextId = maxId + 1;

    // 创建新用户
    const newUsers = userFormData.users.map(user => ({
      id: nextId++,
      username: user.username,
      password: user.username, // 默认密码为用户名
      name: user.name,
      role: selectedRole.id as any,
      email: user.email,
      permissions: selectedRole.permissions
    }));

    // 添加到用户列表
    const updatedUsers = [...existingUsers, ...newUsers];
    storage.set('USERS', updatedUsers);
    loadUsers();
    setIsUserModalOpen(false);
  };

  return (
    <div className="role-management">
      <div className="page-header">
        <h2>角色管理</h2>
        <button className="btn-primary" onClick={handleAdd}>+ 新增角色</button>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>角色名称</th>
              <th>角色描述</th>
              <th>权限数量</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {roles.map(role => (
              <tr key={role.id}>
                <td>{role.name}</td>
                <td>{role.description}</td>
                <td>{role.permissions.length}</td>
                <td>
                  <button className="btn-edit" onClick={() => handleEdit(role)}>✏️</button>
                  <button className="btn-delete" onClick={() => handleDelete(role.id)}>🗑️</button>
                  <button className="btn-add-users" onClick={() => handleAddUsers(role)}>👥</button>
                  <button className="btn-view-permissions" onClick={() => window.location.href = `/roles/${role.id}`}>🔒</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>{editingRole ? '编辑角色' : '新增角色'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>角色ID</label>
                <input
                  type="text"
                  value={formData.id}
                  onChange={e => setFormData({...formData, id: e.target.value})}
                  required
                  disabled={!!editingRole}
                />
              </div>
              <div className="form-group">
                <label>角色名称</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>角色描述</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  required
                />
              </div>
              <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={() => setIsModalOpen(false)}>取消</button>
                <button type="submit" className="btn-primary">保存</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isUserModalOpen && selectedRole && (
        <div className="modal-overlay" onClick={() => setIsUserModalOpen(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>批量添加用户到 {selectedRole.name}</h3>
            <form onSubmit={handleUserSubmit}>
              <div className="form-group">
                <label>用户列表</label>
                <div className="users-list">
                  {userFormData.users.map((user, index) => (
                    <div key={index} className="user-item">
                      <input
                        type="text"
                        placeholder="英文名称"
                        value={user.username}
                        onChange={e => {
                          const newUsers = [...userFormData.users];
                          newUsers[index].username = e.target.value;
                          setUserFormData({ users: newUsers });
                        }}
                        required
                      />
                      <input
                        type="text"
                        placeholder="中文名称"
                        value={user.name}
                        onChange={e => {
                          const newUsers = [...userFormData.users];
                          newUsers[index].name = e.target.value;
                          setUserFormData({ users: newUsers });
                        }}
                        required
                      />
                      <input
                        type="email"
                        placeholder="邮箱"
                        value={user.email}
                        onChange={e => {
                          const newUsers = [...userFormData.users];
                          newUsers[index].email = e.target.value;
                          setUserFormData({ users: newUsers });
                        }}
                        required
                      />
                      <button type="button" className="btn-remove" onClick={() => {
                        const newUsers = userFormData.users.filter((_, i) => i !== index);
                        setUserFormData({ users: newUsers });
                      }}>🗑️</button>
                    </div>
                  ))}
                  <button type="button" className="btn-add-user" onClick={() => {
                    setUserFormData({ users: [...userFormData.users, { username: '', name: '', email: '' }] });
                  }}>+ 添加用户</button>
                </div>
              </div>
              <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={() => setIsUserModalOpen(false)}>取消</button>
                <button type="submit" className="btn-primary">保存</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
