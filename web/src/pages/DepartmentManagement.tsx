import { useEffect, useState } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Space,
  Card,
  message,
  Tag,
  List,
  Avatar,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  TeamOutlined,
  UserAddOutlined,
  BarChartOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

interface Department {
  id: number;
  name: string;
  description?: string;
  managerId?: number;
  members?: UserInfo[];
}

interface UserInfo {
  id: number;
  name: string;
  username: string;
  positionId?: number;
  rank?: string;
  abilityScores?: Record<string, number>;
}

interface PositionInfo {
  id: number;
  name: string;
}

interface DepartmentFormValues {
  name: string;
  description?: string;
  managerId?: number;
}

export default function DepartmentManagement() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [positions, setPositions] = useState<PositionInfo[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [isAbilityModalOpen, setIsAbilityModalOpen] = useState(false);

  const [editingDepartment, setEditingDepartment] =
    useState<Department | null>(null);
  const [selectedDepartment, setSelectedDepartment] =
    useState<Department | null>(null);

  const [departmentMembers, setDepartmentMembers] = useState<UserInfo[]>([]);
  const [currentMembers, setCurrentMembers] = useState<UserInfo[]>([]);
  const [availableUsers, setAvailableUsers] = useState<UserInfo[]>([]);
  const [selectedUser, setSelectedUser] = useState<number | null>(null);

  const [form] = Form.useForm<DepartmentFormValues>();

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
      message.error(error instanceof Error ? error.message : '获取部门列表失败');
    }
  };

  const loadUsers = async () => {
    try {
      const data = await api.getUsers();
      setUsers(data);
    } catch (error) {
      message.error(error instanceof Error ? error.message : '获取用户列表失败');
    }
  };

  const loadPositions = async () => {
    try {
      const data = await api.getPositions();
      setPositions(data);
    } catch (error) {
      message.error(error instanceof Error ? error.message : '获取岗位列表失败');
    }
  };

  const handleAdd = () => {
    setEditingDepartment(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEdit = (department: Department) => {
    setEditingDepartment(department);
    form.setFieldsValue({
      name: department.name,
      description: department.description,
      managerId: department.managerId,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (department: Department) => {
    Modal.confirm({
      title: '确定删除该部门吗？',
      content: `部门：${department.name}`,
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
      },
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
      const members = await api.getDepartmentMembers(department.id);
      setCurrentMembers(members);

      const currentMemberIds = members.map((member: UserInfo) => member.id);
      setAvailableUsers(
        users.filter((user) => !currentMemberIds.includes(user.id)),
      );

      setSelectedUser(null);
      setIsMemberModalOpen(true);
    } catch (error) {
      message.error(error instanceof Error ? error.message : '获取部门成员失败');
    }
  };

  const handleMemberSubmit = async () => {
    if (!selectedDepartment) {
      return;
    }

    try {
      const memberIds = currentMembers.map((member) => member.id);
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

    const userToAdd = users.find((user) => user.id === selectedUser);
    if (!userToAdd) {
      return;
    }

    setCurrentMembers((prev) => [...prev, userToAdd]);
    setAvailableUsers((prev) => prev.filter((user) => user.id !== selectedUser));
    setSelectedUser(null);
  };

  const handleRemoveMember = (memberId: number) => {
    const memberToRemove = currentMembers.find((member) => member.id === memberId);
    if (!memberToRemove) {
      return;
    }

    setCurrentMembers((prev) => prev.filter((member) => member.id !== memberId));
    setAvailableUsers((prev) => [...prev, memberToRemove]);
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

  const handleManageSections = (department: Department) => {
    navigate(`/departments/${department.id}/sections`);
  };

  const getManagerName = (managerId?: number) => {
    const manager = users.find((user) => user.id === managerId);
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
      render: (_, record) => <Tag color="blue">{record.members?.length || 0}</Tag>,
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Button
            type="link"
            icon={<UserAddOutlined />}
            onClick={() => handleManageMembers(record)}
          >
            成员管理
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
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
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
        <Form form={form} layout="vertical">
          <Form.Item
            label="部门名称"
            name="name"
            rules={[{ required: true, message: '请输入部门名称' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item label="部门描述" name="description">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item label="部门管理员" name="managerId">
            <Select
              placeholder="请选择部门管理员"
              allowClear
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              options={users.map((user) => ({
                label: `${user.name} (${user.username})`,
                value: user.id,
              }))}
            />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={`${selectedDepartment?.name || ''} - 管理成员`}
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
              options={availableUsers.map((user) => ({
                label: `${user.name} (${user.username})`,
                value: user.id,
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
            renderItem={(member) => (
              <List.Item
                actions={[
                  <Button
                    key={`remove-${member.id}`}
                    type="link"
                    danger
                    icon={<CloseOutlined />}
                    onClick={() => handleRemoveMember(member.id)}
                  >
                    移除
                  </Button>,
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
        title={`${selectedDepartment?.name || ''} - 部门能力列表`}
        open={isAbilityModalOpen}
        onCancel={() => setIsAbilityModalOpen(false)}
        footer={[
          <Button key="close" type="primary" onClick={() => setIsAbilityModalOpen(false)}>
            关闭
          </Button>,
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
            render={(positionId: number) => {
              const position = positions.find((item) => item.id === positionId);
              return position?.name || '-';
            }}
          />
          <Table.Column title="职级" dataIndex="rank" key="rank" width={80} />
          <Table.Column
            title="技术能力"
            key="tech"
            width={90}
            render={(_, record: UserInfo) => record.abilityScores?.tech || '-'}
          />
          <Table.Column
            title="工程能力"
            key="engineering"
            width={90}
            render={(_, record: UserInfo) => record.abilityScores?.engineering || '-'}
          />
          <Table.Column
            title="UI/UX"
            key="uiux"
            width={90}
            render={(_, record: UserInfo) => record.abilityScores?.uiux || '-'}
          />
          <Table.Column
            title="沟通能力"
            key="communication"
            width={90}
            render={(_, record: UserInfo) => record.abilityScores?.communication || '-'}
          />
          <Table.Column
            title="问题解决"
            key="problem"
            width={90}
            render={(_, record: UserInfo) => record.abilityScores?.problem || '-'}
          />
          <Table.Column
            title="领导力"
            key="leadership"
            width={90}
            render={(_, record: UserInfo) => record.abilityScores?.leadership || '-'}
          />
          <Table.Column
            title="创新能力"
            key="innovation"
            width={90}
            render={(_, record: UserInfo) => record.abilityScores?.innovation || '-'}
          />
          <Table.Column
            title="学习能力"
            key="learning"
            width={90}
            render={(_, record: UserInfo) => record.abilityScores?.learning || '-'}
          />
        </Table>
      </Modal>
    </Card>
  );
}
