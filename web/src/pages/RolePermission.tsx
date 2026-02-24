import { useState, useEffect } from 'react';
import { storage } from '../utils/storage';
import type { Role, Permission } from '../types';
import { useParams, useNavigate } from 'react-router-dom';
import './RolePermission.css';

export default function RolePermission() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [role, setRole] = useState<Role | null>(null);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  useEffect(() => {
    if (id) {
      loadRole();
      loadPermissions();
    }
  }, [id]);

  const loadRole = () => {
    const roles = storage.get<Role[]>('ROLES') || [];
    const foundRole = roles.find(r => r.id === id);
    setRole(foundRole || null);
    if (foundRole) {
      setSelectedPermissions(foundRole.permissions);
    }
  };

  const loadPermissions = () => {
    const data = storage.get<Permission[]>('PERMISSIONS') || [];
    setPermissions(data);
  };

  const handlePermissionChange = (permissionId: string) => {
    setSelectedPermissions(prev => {
      if (prev.includes(permissionId)) {
        return prev.filter(id => id !== permissionId);
      } else {
        return [...prev, permissionId];
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!role) return;

    const updatedRole = {
      ...role,
      permissions: selectedPermissions
    };

    const roles = storage.get<Role[]>('ROLES') || [];
    const newRoles = roles.map(r => r.id === role.id ? updatedRole : r);
    storage.set('ROLES', newRoles);

    // 更新该角色下所有用户的权限
    const users = storage.get<any[]>('USERS') || [];
    const updatedUsers = users.map(user => {
      if (user.role === role.id) {
        return {
          ...user,
          permissions: selectedPermissions
        };
      }
      return user;
    });
    storage.set('USERS', updatedUsers);

    navigate('/roles');
  };

  if (!role) {
    return <div className="role-permission">角色不存在</div>;
  }

  return (
    <div className="role-permission">
      <div className="page-header">
        <h2>{role.name} - 权限配置</h2>
        <button className="btn-primary" onClick={() => navigate('/roles')}>返回</button>
      </div>

      <div className="permission-container">
        <form onSubmit={handleSubmit}>
          <div className="permission-section">
            <h3>页面访问权限</h3>
            <div className="permission-list">
              {permissions
                .filter(p => p.type === 'page')
                .map(permission => (
                  <div key={permission.id} className="permission-item">
                    <input
                      type="checkbox"
                      id={`permission-${permission.id}`}
                      checked={selectedPermissions.includes(permission.id)}
                      onChange={() => handlePermissionChange(permission.id)}
                    />
                    <label htmlFor={`permission-${permission.id}`}>
                      <span className="permission-name">{permission.name}</span>
                      <span className="permission-desc">{permission.description}</span>
                    </label>
                  </div>
                ))
              }
            </div>
          </div>

          <div className="permission-section">
            <h3>操作权限</h3>
            <div className="permission-list">
              {permissions
                .filter(p => p.type === 'action')
                .map(permission => (
                  <div key={permission.id} className="permission-item">
                    <input
                      type="checkbox"
                      id={`permission-${permission.id}`}
                      checked={selectedPermissions.includes(permission.id)}
                      onChange={() => handlePermissionChange(permission.id)}
                    />
                    <label htmlFor={`permission-${permission.id}`}>
                      <span className="permission-name">{permission.name}</span>
                      <span className="permission-desc">{permission.description}</span>
                    </label>
                  </div>
                ))
              }
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-primary">保存配置</button>
          </div>
        </form>
      </div>
    </div>
  );
}
