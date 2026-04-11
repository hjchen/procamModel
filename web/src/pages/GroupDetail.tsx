import { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Select,
  Space,
  Card,
  message,
  Tag,
  Typography,
  Breadcrumb,
} from 'antd';
import {
  UserAddOutlined,
  UserDeleteOutlined,
  ArrowLeftOutlined,
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';

const { Title } = Typography;

interface Group {
  id: number;
  name: string;
  description?: string;
  departmentId: number;
  sectionId: number | null;
  department?: {
    id: number;
    name: string;
  };
  section?: {
    id: number;
    name: string;
  };
  members: any[];
}

export default function GroupDetail() {
  const [group, setGroup] = useState<Group | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [candidateUsers, setCandidateUsers] = useState<any[]>([]);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [selectedMemberIds, setSelectedMemberIds] = useState<number[]>([]);
  const [form] = Form.useForm();

  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) {
      return;
    }
    loadGroup();
    loadUsers();
  }, [id]);

  useEffect(() => {
    if (!group) {
      setCandidateUsers([]);
      return;
    }

    let cancelled = false;

    const loadCandidateUsers = async () => {
      try {
        if (group.sectionId) {
          const sectionDetail = await api.getSection(group.sectionId);
          if (!cancelled) {
            setCandidateUsers(sectionDetail.members || []);
          }
          return;
        }

        if (!cancelled) {
          const departmentUsers = users.filter(
            (user) => user.departmentId === group.departmentId,
          );
          setCandidateUsers(departmentUsers);
        }
      } catch (error) {
        if (!cancelled) {
          setCandidateUsers([]);
          message.error(
            error instanceof Error ? error.message : '获取可选成员失败',
          );
        }
      }
    };

    loadCandidateUsers();

    return () => {
      cancelled = true;
    };
  }, [group, users]);

  const loadGroup = async () => {
    try {
      if (!id) {
        return;
      }
      const groupData = await api.getGroup(parseInt(id, 10));
      setGroup(groupData);
    } catch (error) {
      message.error(error instanceof Error ? error.message : '获取分组信息失败');
    }
  };

  const loadUsers = async () => {
    try {
      const userData = await api.getUsers();
      setUsers(userData);
    } catch (error) {
      message.error(error instanceof Error ? error.message : '获取用户列表失败');
    }
  };

  const handleAddMembers = () => {
    if (!group) {
      return;
    }

    const currentMemberIds = group.members.map((member) => member.id);
    const availableUsers = candidateUsers.filter(
      (user) => !currentMemberIds.includes(user.id),
    );

    if (availableUsers.length === 0) {
      message.info('当前范围内暂无可添加成员');
      return;
    }

    form.resetFields();
    setIsAddMemberModalOpen(true);
  };

  const handleAddMemberSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (!group || !values.memberIds || values.memberIds.length === 0) {
        return;
      }

      await api.addGroupMembers(group.id, values.memberIds);
      message.success('添加成员成功');
      setIsAddMemberModalOpen(false);
      await loadGroup();
    } catch (error) {
      message.error(error instanceof Error ? error.message : '添加成员失败');
    }
  };

  const handleRemoveMembers = () => {
    if (selectedMemberIds.length === 0) {
      message.warning('请选择要移除的成员');
      return;
    }

    Modal.confirm({
      title: '确定移除选中的成员吗？',
      content: `将移除 ${selectedMemberIds.length} 个成员`,
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        try {
          if (!group) {
            return;
          }
          await api.removeGroupMembers(group.id, selectedMemberIds);
          message.success('移除成员成功');
          setSelectedMemberIds([]);
          await loadGroup();
        } catch (error) {
          message.error(error instanceof Error ? error.message : '移除成员失败');
        }
      },
    });
  };

  const handleBack = () => {
    navigate(-1);
  };

  const getAvailableUsers = () => {
    if (!group) {
      return [];
    }
    const currentMemberIds = group.members.map((member) => member.id);
    return candidateUsers.filter((user) => !currentMemberIds.includes(user.id));
  };

  const memberColumns = [
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: '职级',
      dataIndex: 'rank',
      key: 'rank',
      render: (text: string) => text || '-',
    },
  ];

  if (!group) {
    return <div>加载中...</div>;
  }

  return (
    <Card>
      <div style={{ marginBottom: 16 }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={handleBack}
          style={{ marginBottom: 16 }}
        >
          返回
        </Button>
        <Breadcrumb style={{ marginBottom: 16 }}>
          <Breadcrumb.Item>部门管理</Breadcrumb.Item>
          <Breadcrumb.Item>{group.department?.name || '-'}</Breadcrumb.Item>
          <Breadcrumb.Item>{group.section?.name || '分组管理'}</Breadcrumb.Item>
          <Breadcrumb.Item>{group.name}</Breadcrumb.Item>
        </Breadcrumb>
      </div>

      <div style={{ marginBottom: 24 }}>
        <Title level={3}>{group.name}</Title>
        {group.description && (
          <p style={{ color: '#666', margin: '8px 0' }}>{group.description}</p>
        )}
        <Tag color="blue">成员数量: {group.members?.length || 0}</Tag>
      </div>

      <Card
        title="分组成员"
        extra={
          <Space>
            <Button
              type="primary"
              icon={<UserAddOutlined />}
              onClick={handleAddMembers}
            >
              添加成员
            </Button>
            <Button
              danger
              icon={<UserDeleteOutlined />}
              disabled={selectedMemberIds.length === 0}
              onClick={handleRemoveMembers}
            >
              移除成员 ({selectedMemberIds.length})
            </Button>
          </Space>
        }
      >
        <Table
          columns={memberColumns}
          dataSource={group.members}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          rowSelection={{
            selectedRowKeys: selectedMemberIds,
            onChange: (selectedRowKeys) =>
              setSelectedMemberIds(selectedRowKeys as number[]),
          }}
        />
      </Card>

      <Modal
        title="添加分组成员"
        open={isAddMemberModalOpen}
        onOk={handleAddMemberSubmit}
        onCancel={() => setIsAddMemberModalOpen(false)}
        okText="确定"
        cancelText="取消"
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="选择成员"
            name="memberIds"
            rules={[{ required: true, message: '请选择要添加的成员' }]}
          >
            <Select
              mode="multiple"
              placeholder="请选择要添加的成员"
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              options={getAvailableUsers().map((user) => ({
                label: `${user.name} (${user.username})`,
                value: user.id,
              }))}
            />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}
