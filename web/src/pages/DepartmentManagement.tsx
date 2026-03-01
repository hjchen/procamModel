import { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, Space, Card, message, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, TeamOutlined, UserAddOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { api } from '../services/api';

interface Department {
  id: number;
  name: string;
  description?: string;
  managerId?: number;
  members?: any[];
}

export default function DepartmentManagement() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [form] = Form.useForm();
  const [memberForm] = Form.useForm();

  useEffect(() => {
    loadDepartments();
    loadUsers();
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
    setSelectedDepartment(department);
    const memberIds = department.members?.map(m => m.id) || [];
    memberForm.setFieldsValue({ memberIds });
    setIsMemberModalOpen(true);
  };

  const handleMemberSubmit = async () => {
    try {
      const values = await memberForm.validateFields();
      if (!selectedDepartment) return;

      await api.updateDepartmentMembers(selectedDepartment.id, values.memberIds || []);
      message.success('更新部门成员成功');
      setIsMemberModalOpen(false);
      await loadDepartments();
      await loadUsers();
    } catch (error) {
      message.error(error instanceof Error ? error.message : '更新失败');
    }
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
        width={600}
      >
        <Form
          form={memberForm}
          layout="vertical"
        >
          <Form.Item
            label="部门成员"
            name="memberIds"
          >
            <Select
              mode="multiple"
              placeholder="请选择部门成员"
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
    </Card>
  );
}
