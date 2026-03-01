import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Checkbox, Button, Space, Divider, message } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { storage } from '../utils/storage';
import type { Role, Permission } from '../types';

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
    const foundRole = roles.find(r => String(r.id) === id);
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

  const handleSubmit = () => {
    if (!role) return;

    const updatedRole = {
      ...role,
      permissions: selectedPermissions
    };

    const roles = storage.get<Role[]>('ROLES') || [];
    const newRoles = roles.map(r => String(r.id) === String(role.id) ? updatedRole : r);
    storage.set('ROLES', newRoles);

    const users = storage.get<any[]>('USERS') || [];
    const updatedUsers = users.map(user => {
      if (String(user.role) === String(role.id)) {
        return {
          ...user,
          permissions: selectedPermissions
        };
      }
      return user;
    });
    storage.set('USERS', updatedUsers);

    message.success('权限配置已保存');
    navigate('/roles');
  };

  if (!role) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
          角色不存在
        </div>
      </Card>
    );
  }

  const pagePermissions = permissions.filter(p => p.type === 'page');
  const actionPermissions = permissions.filter(p => p.type === 'action');

  return (
    <Card
      title={`${role.name} - 权限配置`}
      extra={
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/roles')}
        >
          返回
        </Button>
      }
    >
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div>
          <h3 style={{ marginBottom: 16 }}>页面访问权限</h3>
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            {pagePermissions.map(permission => (
              <Checkbox
                key={permission.id}
                checked={selectedPermissions.includes(permission.id)}
                onChange={() => handlePermissionChange(permission.id)}
              >
                <div>
                  <div style={{ fontWeight: 500 }}>{permission.name}</div>
                  <div style={{ fontSize: 12, color: '#999' }}>{permission.description}</div>
                </div>
              </Checkbox>
            ))}
          </Space>
        </div>

        <Divider />

        <div>
          <h3 style={{ marginBottom: 16 }}>操作权限</h3>
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            {actionPermissions.map(permission => (
              <Checkbox
                key={permission.id}
                checked={selectedPermissions.includes(permission.id)}
                onChange={() => handlePermissionChange(permission.id)}
              >
                <div>
                  <div style={{ fontWeight: 500 }}>{permission.name}</div>
                  <div style={{ fontSize: 12, color: '#999' }}>{permission.description}</div>
                </div>
              </Checkbox>
            ))}
          </Space>
        </div>

        <Divider />

        <div style={{ textAlign: 'right' }}>
          <Space>
            <Button onClick={() => navigate('/roles')}>取消</Button>
            <Button type="primary" onClick={handleSubmit}>保存配置</Button>
          </Space>
        </div>
      </Space>
    </Card>
  );
}
