import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Button, Modal, Form, Input, Space, Card, message, Tag, Checkbox, Divider } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UserAddOutlined, TeamOutlined, LockOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { Role, User, Permission } from '../types';
import { api } from '../services/api';

export default function RoleManagement() {
  const navigate = useNavigate();
  const [roles, setRoles] = useState<Role[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isViewUsersModalOpen, setIsViewUsersModalOpen] = useState(false);
  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);
  const [form] = Form.useForm();
  const [userForm] = Form.useForm();

  useEffect(() => {
    const fetchData = async () => {
      await loadRoles();
      await loadUsers();
      await loadPermissions();
    };
    fetchData();
  }, []);

  const loadRoles = async () => {
    try {
      const data = await api.getRoles();
      setRoles(data);
    } catch (error) {
      message.error('获取角色列表失败');
    }
  };

  const loadUsers = async () => {
    try {
      const data = await api.getUsers();
      setUsers(data);
    } catch (error) {
      message.error('获取用户列表失败');
    }
  };

  const loadPermissions = async () => {
    try {
      const data = await api.getPermissions();
      setPermissions(data);
    } catch (error) {
      message.error('获取权限列表失败');
    }
  };

  const handleAdd = () => {
    setEditingRole(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEdit = (role: Role) => {
    setEditingRole(role);
    form.setFieldsValue(role);
    setIsModalOpen(true);
  };

  const handleDelete = (role: Role) => {
    Modal.confirm({
      title: '确定要删除该角色吗?',
      content: `角色: ${role.name}`,
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        try {
          message.success('删除成功');
          await loadRoles();
        } catch (error) {
          message.error('删除失败');
        }
      }
    });
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      message.success(editingRole ? '更新成功' : '创建成功');
      setIsModalOpen(false);
      await loadRoles();
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  const handleAddUsers = (role: Role) => {
    setSelectedRole(role);
    userForm.resetFields();
    setIsUserModalOpen(true);
  };

  const handleViewUsers = (role: Role) => {
    setSelectedRole(role);
    setIsViewUsersModalOpen(true);
  };

  const getRoleUsers = (roleId: string | number) => {
    return users.filter(user => user.roleId === roleId || user.role === roleId);
  };

  const handleUserSubmit = async () => {
    try {
      const values = await userForm.validateFields();
      if (!selectedRole) return;

      await api.batchCreateUsers(values.users, selectedRole.id as number);
      message.success('批量创建用户成功');
      setIsUserModalOpen(false);
      await loadUsers();
    } catch (error) {
      message.error(error instanceof Error ? error.message : '批量创建用户失败');
    }
  };

  const handlePermissionConfig = async (role: Role) => {
    try {
      const roleDetail = await api.getRoleById(role.id as number);
      setSelectedRole(roleDetail);
      setSelectedPermissions(roleDetail.permissions?.map((p: Permission) => p.id) || []);
      setIsPermissionModalOpen(true);
    } catch (error) {
      message.error('获取角色权限失败');
    }
  };

  const handlePermissionChange = (permissionId: number) => {
    setSelectedPermissions(prev => {
      if (prev.includes(permissionId)) {
        return prev.filter(id => id !== permissionId);
      } else {
        return [...prev, permissionId];
      }
    });
  };

  const handlePermissionSubmit = async () => {
    if (!selectedRole) return;

    try {
      await api.updateRolePermissions(selectedRole.id as number, selectedPermissions);
      message.success('权限配置已保存');
      setIsPermissionModalOpen(false);
      await loadRoles();
    } catch (error) {
      message.error(error instanceof Error ? error.message : '更新权限失败');
    }
  };

  const columns: ColumnsType<Role> = [
    {
      title: '角色名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '角色描述',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: '权限数量',
      key: 'permissions',
      render: (_, record) => (
        <Tag color="blue">{record.permissions?.length || 0}</Tag>
      ),
    },
    {
      title: '用户数量',
      key: 'userCount',
      render: (_, record) => (
        <Tag color="green">{getRoleUsers(record.id).length}</Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
          >
            删除
          </Button>
          <Button
            type="link"
            icon={<UserAddOutlined />}
            onClick={() => handleAddUsers(record)}
          >
            添加用户
          </Button>
          <Button
            type="link"
            icon={<TeamOutlined />}
            onClick={() => handleViewUsers(record)}
          >
            查看用户
          </Button>
          <Button
            type="link"
            icon={<LockOutlined />}
            onClick={() => handlePermissionConfig(record)}
          >
            权限
          </Button>
        </Space>
      ),
    },
  ];

  const userColumns: ColumnsType<User> = [
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: '状态',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? '激活' : '禁用'}
        </Tag>
      ),
    },
  ];

  return (
    <Card
      title="角色管理"
      extra={
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAdd}
        >
          新增角色
        </Button>
      }
    >
      <Table
        columns={columns}
        dataSource={roles}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingRole ? '编辑角色' : '新增角色'}
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={() => setIsModalOpen(false)}
        okText="保存"
        cancelText="取消"
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            label="角色ID"
            name="id"
            rules={[{ required: true, message: '请输入角色ID' }]}
          >
            <Input disabled={!!editingRole} />
          </Form.Item>
          <Form.Item
            label="角色名称"
            name="name"
            rules={[{ required: true, message: '请输入角色名称' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="角色描述"
            name="description"
            rules={[{ required: true, message: '请输入角色描述' }]}
          >
            <Input.TextArea rows={4} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={`批量添加用户到 ${selectedRole?.name}`}
        open={isUserModalOpen}
        onOk={handleUserSubmit}
        onCancel={() => setIsUserModalOpen(false)}
        okText="保存"
        cancelText="取消"
        width={700}
      >
        <Form
          form={userForm}
          layout="vertical"
        >
          <Form.List name="users">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                    <Form.Item
                      {...restField}
                      name={[name, 'username']}
                      rules={[{ required: true, message: '请输入用户名' }]}
                    >
                      <Input placeholder="英文名称" />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, 'name']}
                      rules={[{ required: true, message: '请输入姓名' }]}
                    >
                      <Input placeholder="中文名称" />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, 'email']}
                      rules={[
                        { required: true, message: '请输入邮箱' },
                        { type: 'email', message: '请输入有效的邮箱' }
                      ]}
                    >
                      <Input placeholder="邮箱" />
                    </Form.Item>
                    <Button
                      type="link"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => remove(name)}
                    />
                  </Space>
                ))}
                <Form.Item>
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    block
                    icon={<PlusOutlined />}
                  >
                    添加用户
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
        </Form>
      </Modal>

      <Modal
        title={`${selectedRole?.name} - 用户列表`}
        open={isViewUsersModalOpen}
        onCancel={() => setIsViewUsersModalOpen(false)}
        footer={[
          <Button key="close" type="primary" onClick={() => setIsViewUsersModalOpen(false)}>
            关闭
          </Button>
        ]}
        width={800}
      >
        {selectedRole && getRoleUsers(selectedRole.id).length > 0 ? (
          <Table
            columns={userColumns}
            dataSource={getRoleUsers(selectedRole.id)}
            rowKey="id"
            pagination={false}
          />
        ) : (
          <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
            该角色暂无用户
          </div>
        )}
      </Modal>

      <Modal
        title={`${selectedRole?.name} - 权限配置`}
        open={isPermissionModalOpen}
        onOk={handlePermissionSubmit}
        onCancel={() => setIsPermissionModalOpen(false)}
        okText="保存"
        cancelText="取消"
        width={700}
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div>
            <h4 style={{ marginBottom: 16 }}>页面访问权限</h4>
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              {permissions
                .filter(p => p.type === 'page')
                .map(permission => (
                  <Checkbox
                    key={permission.id}
                    checked={selectedPermissions.includes(permission.id as number)}
                    onChange={() => handlePermissionChange(permission.id as number)}
                  >
                    <div>
                      <div style={{ fontWeight: 500 }}>{permission.name}</div>
                      <div style={{ fontSize: 12, color: '#999' }}>{permission.description}</div>
                    </div>
                  </Checkbox>
                ))}
            </Space>
          </div>

          <Divider style={{ margin: '12px 0' }} />

          <div>
            <h4 style={{ marginBottom: 16 }}>操作权限</h4>
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              {permissions
                .filter(p => p.type === 'action')
                .map(permission => (
                  <Checkbox
                    key={permission.id}
                    checked={selectedPermissions.includes(permission.id as number)}
                    onChange={() => handlePermissionChange(permission.id as number)}
                  >
                    <div>
                      <div style={{ fontWeight: 500 }}>{permission.name}</div>
                      <div style={{ fontSize: 12, color: '#999' }}>{permission.description}</div>
                    </div>
                  </Checkbox>
                ))}
            </Space>
          </div>
        </Space>
      </Modal>
    </Card>
  );
}
