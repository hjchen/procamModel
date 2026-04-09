import { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, Space, Card, message, Tag, List, Avatar } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, TeamOutlined, UserAddOutlined, BarChartOutlined, ApartmentOutlined, CloseOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

interface Department {
  id: number;
  name: string;
  description?: string;
  managerId?: number;
  members?: any[];
}

interface Group {
  id: number;
  name: string;
  description?: string;
  departmentId: number;
  members?: any[];
}

export default function DepartmentManagement() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [positions, setPositions] = useState<any[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [isAbilityModalOpen, setIsAbilityModalOpen] = useState(false);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [isGroupFormModalOpen, setIsGroupFormModalOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [departmentMembers, setDepartmentMembers] = useState<any[]>([]);
  const [currentMembers, setCurrentMembers] = useState<any[]>([]);
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<number | null>(null);
  const [form] = Form.useForm();
  const [groupForm] = Form.useForm();

  const navigate = useNavigate();

  useEffect(() => {
    loadDepartments();
    loadUsers();
    loadPositions();
  }, []);

  const loadDepartments = async () => {
    try {
      const data = await api.getDepartments();
      setDepartments(data);
    } catch (error) {
      message.error('获取部门列表失败');
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

  const loadPositions = async () => {
    try {
      const data = await api.getPositions();
      setPositions(data);
    } catch (error) {
      message.error('获取岗位列表失败');
    }
  };

  const handleAdd = () => {
    setEditingDepartment(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEdit = (department: Department) => {
    setEditingDepartment(department);
    form.setFieldsValue(department);
    setIsModalOpen(true);
  };

  const handleDelete = (department: Department) => {
    Modal.confirm({
      title: '确定要删除该部门吗?',
      content: `部门: ${department.name}`,
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        try {
          await api.deleteDepartment(department.id);
          message.success('删除成功');
          await loadDepartments();
        } catch (error) {
          message.error(error instanceof Error ? error.message : '删除失败');
        }
      }
    });
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (editingDepartment) {
        await api.updateDepartment(editingDepartment.id, values);
        message.success('更新成功');
      } else {
        await api.createDepartment(values);
        message.success('创建成功');
      }

      setIsModalOpen(false);
      await loadDepartments();
    } catch (error) {
      message.error(error instanceof Error ? error.message : '保存失败');
    }
  };

  const handleManageMembers = async (department: Department) => {
    try {
      setSelectedDepartment(department);
      const currentDepartmentMembers: Array<{ id: number; [key: string]: unknown }> = await api.getDepartmentMembers(department.id);
      setCurrentMembers(currentDepartmentMembers);

      const currentMemberIds = currentDepartmentMembers.map(m => m.id);
      const available = users.filter(user => !currentMemberIds.includes(user.id));
      setAvailableUsers(available);

      setSelectedUser(null);
      setIsMemberModalOpen(true);
    } catch (error) {
      message.error(error instanceof Error ? error.message : '获取部门成员失败');
    }
  };

  const handleMemberSubmit = async () => {
    try {
      if (!selectedDepartment) return;

      const memberIds = currentMembers.map(member => member.id);
      await api.updateDepartmentMembers(selectedDepartment.id, memberIds);
      message.success('更新部门成员成功');
      setIsMemberModalOpen(false);
      await loadDepartments();
      await loadUsers();
    } catch (error) {
      message.error(error instanceof Error ? error.message : '更新失败');
    }
  };

  const handleAddMember = () => {
    if (!selectedUser) {
      message.warning('请先选择要添加的用户');
      return;
    }

    const userToAdd = users.find(user => user.id === selectedUser);
    if (!userToAdd) return;

    // 添加到当前成员列表
    setCurrentMembers([...currentMembers, userToAdd]);

    // 从可选用户列表中移除
    setAvailableUsers(availableUsers.filter(user => user.id !== selectedUser));

    setSelectedUser(null);
  };

  const handleRemoveMember = (memberId: number) => {
    const memberToRemove = currentMembers.find(member => member.id === memberId);
    if (!memberToRemove) return;

    // 从当前成员列表中移除
    setCurrentMembers(currentMembers.filter(member => member.id !== memberId));

    // 添加到可选用户列表
    setAvailableUsers([...availableUsers, memberToRemove]);
  };

  const handleViewAbilities = async (department: Department) => {
    try {
      setSelectedDepartment(department);
      const members = await api.getDepartmentMembers(department.id);
      setDepartmentMembers(members);
      setIsAbilityModalOpen(true);
    } catch (error) {
      message.error(error instanceof Error ? error.message : '获取部门成员失败');
    }
  };

  const handleManageGroups = async (department: Department) => {
    try {
      setSelectedDepartment(department);
      const departmentGroups = await api.getGroups(department.id);
      setGroups(departmentGroups);
      setIsGroupModalOpen(true);
    } catch (error) {
      message.error(error instanceof Error ? error.message : '获取部门分组失败');
    }
  };

  const handleAddGroup = () => {
    setEditingGroup(null);
    groupForm.resetFields();
    setIsGroupFormModalOpen(true);
  };

  const handleEditGroup = (group: Group) => {
    setEditingGroup(group);
    groupForm.setFieldsValue(group);
    setIsGroupFormModalOpen(true);
  };

  const handleGroupSubmit = async () => {
    try {
      const values = await groupForm.validateFields();

      if (editingGroup) {
        await api.updateGroup(editingGroup.id, values);
        message.success('更新分组成功');
      } else {
        if (!selectedDepartment) return;
        await api.createGroup({ ...values, departmentId: selectedDepartment.id });
        message.success('创建分组成功');
      }

      setIsGroupFormModalOpen(false);
      if (selectedDepartment) {
        const departmentGroups = await api.getGroups(selectedDepartment.id);
        setGroups(departmentGroups);
      }
    } catch (error) {
      message.error(error instanceof Error ? error.message : '保存分组失败');
    }
  };

  const handleDeleteGroup = (group: Group) => {
    Modal.confirm({
      title: '确定要删除该分组吗?',
      content: `分组: ${group.name}`,
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        try {
          await api.deleteGroup(group.id);
          message.success('删除分组成功');
          if (selectedDepartment) {
            const departmentGroups = await api.getGroups(selectedDepartment.id);
            setGroups(departmentGroups);
          }
        } catch (error) {
          message.error(error instanceof Error ? error.message : '删除分组失败');
        }
      }
    });
  };

  const handleViewGroupDetail = (group: Group) => {
    navigate(`/group/${group.id}`);
  };

  const handleManageSections = (department: Department) => {
    navigate(`/departments/${department.id}/sections`);
  };

  const getManagerName = (managerId?: number) => {
    const manager = users.find(u => u.id === managerId);
    return manager ? manager.name : '-';
  };

  const columns: ColumnsType<Department> = [
    {
      title: '部门名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '部门描述',
      dataIndex: 'description',
      key: 'description',
      render: (text) => text || '-',
    },
    {
      title: '部门管理员',
      dataIndex: 'managerId',
      key: 'managerId',
      render: (managerId) => getManagerName(managerId),
    },
    {
      title: '成员数量',
      key: 'memberCount',
      render: (_, record) => (
        <Tag color="blue">{record.members?.length || 0}</Tag>
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
            icon={<UserAddOutlined />}
            onClick={() => handleManageMembers(record)}
          >
            管理成员
          </Button>
          <Button
            type="link"
            icon={<BarChartOutlined />}
            onClick={() => handleViewAbilities(record)}
          >
            能力列表
          </Button>
          <Button
            type="link"
            icon={<TeamOutlined />}
            onClick={() => handleManageSections(record)}
          >
            科室管理
          </Button>
          <Button
            type="link"
            icon={<ApartmentOutlined />}
            onClick={() => handleManageGroups(record)}
          >
            分组管理
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Card
      title="部门管理"
      extra={
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAdd}
        >
          新增部门
        </Button>
      }
    >
      <Table
        columns={columns}
        dataSource={departments}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingDepartment ? '编辑部门' : '新增部门'}
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
            label="部门名称"
            name="name"
            rules={[{ required: true, message: '请输入部门名称' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="部门描述"
            name="description"
          >
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item
            label="部门管理员"
            name="managerId"
          >
            <Select
              placeholder="请选择部门管理员"
              allowClear
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              options={users.map(user => ({
                label: `${user.name} (${user.username})`,
                value: user.id
              }))}
            />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={`${selectedDepartment?.name} - 管理成员`}
        open={isMemberModalOpen}
        onOk={handleMemberSubmit}
        onCancel={() => setIsMemberModalOpen(false)}
        okText="保存"
        cancelText="取消"
        width={700}
      >
        <div style={{ marginBottom: 16 }}>
          <Space.Compact style={{ width: '100%' }}>
            <Select
              style={{ flex: 1 }}
              placeholder="选择要添加的用户"
              value={selectedUser}
              onChange={setSelectedUser}
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              options={availableUsers.map(user => ({
                label: `${user.name} (${user.username})`,
                value: user.id
              }))}
            />
            <Button type="primary" onClick={handleAddMember} icon={<PlusOutlined />}>
              添加成员
            </Button>
          </Space.Compact>
        </div>

        <div>
          <h4 style={{ marginBottom: 12 }}>当前部门成员 ({currentMembers.length}人)</h4>
          <List
            style={{ maxHeight: 300, overflow: 'auto' }}
            bordered
            dataSource={currentMembers}
            locale={{ emptyText: '暂无成员' }}
            renderItem={member => (
              <List.Item
                actions={[
                  <Button
                    type="link"
                    danger
                    icon={<CloseOutlined />}
                    onClick={() => handleRemoveMember(member.id)}
                  >
                    移除
                  </Button>
                ]}
              >
                <List.Item.Meta
                  avatar={<Avatar>{member.name?.[0]}</Avatar>}
                  title={member.name}
                  description={`用户名: ${member.username}`}
                />
              </List.Item>
            )}
          />
        </div>
      </Modal>

      <Modal
        title={`${selectedDepartment?.name} - 部门能力列表`}
        open={isAbilityModalOpen}
        onCancel={() => setIsAbilityModalOpen(false)}
        footer={[
          <Button key="close" type="primary" onClick={() => setIsAbilityModalOpen(false)}>
            关闭
          </Button>
        ]}
        width={1200}
      >
        <Table
          dataSource={departmentMembers}
          rowKey="id"
          pagination={false}
          scroll={{ x: 1000 }}
        >
          <Table.Column title="姓名" dataIndex="name" key="name" fixed="left" width={100} />
          <Table.Column
            title="岗位"
            dataIndex="positionId"
            key="positionId"
            width={120}
            render={(positionId) => {
              const position = positions.find(p => p.id === positionId);
              return position?.name || '-';
            }}
          />
          <Table.Column title="职级" dataIndex="rank" key="rank" width={80} />
          <Table.Column
            title="技术能力"
            key="tech"
            width={90}
            render={(_, record: any) => record.abilityScores?.tech || '-'}
          />
          <Table.Column
            title="工程能力"
            key="engineering"
            width={90}
            render={(_, record: any) => record.abilityScores?.engineering || '-'}
          />
          <Table.Column
            title="UI/UX"
            key="uiux"
            width={90}
            render={(_, record: any) => record.abilityScores?.uiux || '-'}
          />
          <Table.Column
            title="沟通能力"
            key="communication"
            width={90}
            render={(_, record: any) => record.abilityScores?.communication || '-'}
          />
          <Table.Column
            title="问题解决"
            key="problem"
            width={90}
            render={(_, record: any) => record.abilityScores?.problem || '-'}
          />
          <Table.Column
            title="领导力"
            key="leadership"
            width={90}
            render={(_, record: any) => record.abilityScores?.leadership || '-'}
          />
          <Table.Column
            title="创新能力"
            key="innovation"
            width={90}
            render={(_, record: any) => record.abilityScores?.innovation || '-'}
          />
          <Table.Column
            title="学习能力"
            key="learning"
            width={90}
            render={(_, record: any) => record.abilityScores?.learning || '-'}
          />
        </Table>
      </Modal>

      <Modal
        title={`${selectedDepartment?.name} - 分组管理`}
        open={isGroupModalOpen}
        onCancel={() => setIsGroupModalOpen(false)}
        footer={[
          <Button key="add" type="primary" onClick={handleAddGroup}>
            新增分组
          </Button>,
          <Button key="close" onClick={() => setIsGroupModalOpen(false)}>
            关闭
          </Button>
        ]}
        width={800}
      >
        <Table
          dataSource={groups}
          rowKey="id"
          pagination={false}
        >
          <Table.Column title="分组名称" dataIndex="name" key="name" />
          <Table.Column title="分组描述" dataIndex="description" key="description" render={(text) => text || '-'} />
          <Table.Column
            title="成员数量"
            key="memberCount"
            render={(_, record: Group) => (
              <Tag color="blue">{record.members?.length || 0}</Tag>
            )}
          />
          <Table.Column
            title="操作"
            key="action"
            render={(_, record: Group) => (
              <Space size="small">
                <Button
                  type="link"
                  icon={<EditOutlined />}
                  onClick={() => handleEditGroup(record)}
                >
                  编辑
                </Button>
                <Button
                  type="link"
                  icon={<TeamOutlined />}
                  onClick={() => handleViewGroupDetail(record)}
                >
                  成员管理
                </Button>
                <Button
                  type="link"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => handleDeleteGroup(record)}
                >
                  删除
                </Button>
              </Space>
            )}
          />
        </Table>
      </Modal>

      <Modal
        title={editingGroup ? '编辑分组' : '新增分组'}
        open={isGroupFormModalOpen}
        onOk={handleGroupSubmit}
        onCancel={() => setIsGroupFormModalOpen(false)}
        okText="保存"
        cancelText="取消"
      >
        <Form
          form={groupForm}
          layout="vertical"
        >
          <Form.Item
            label="分组名称"
            name="name"
            rules={[{ required: true, message: '请输入分组名称' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="分组描述"
            name="description"
          >
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}
