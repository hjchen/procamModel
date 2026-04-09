import { useEffect, useMemo, useState } from 'react';
import {
  Avatar,
  Breadcrumb,
  Button,
  Card,
  Form,
  Input,
  List,
  Modal,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  message,
} from 'antd';
import {
  ArrowLeftOutlined,
  CloseOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  UserAddOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../services/api';

const { Title } = Typography;

interface Department {
  id: number;
  name: string;
  description?: string;
}

interface UserInfo {
  id: number;
  name: string;
  username: string;
  departmentId: number | null;
}

interface Section {
  id: number;
  name: string;
  description?: string;
  departmentId: number;
  members?: UserInfo[];
}

interface SectionFormValues {
  name: string;
  description?: string;
}

export default function SectionManagement() {
  const { departmentId } = useParams<{ departmentId: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm<SectionFormValues>();

  const parsedDepartmentId = Number(departmentId);
  const isDepartmentIdValid =
    Number.isInteger(parsedDepartmentId) && parsedDepartmentId > 0;

  const [department, setDepartment] = useState<Department | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [loading, setLoading] = useState(false);

  const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<Section | null>(null);

  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [currentMembers, setCurrentMembers] = useState<UserInfo[]>([]);
  const [selectedUser, setSelectedUser] = useState<number | null>(null);

  const loadSections = async (targetDepartmentId: number) => {
    const sectionData = await api.getSections(targetDepartmentId);
    setSections(sectionData);
  };

  const loadData = async () => {
    if (!isDepartmentIdValid) {
      return;
    }

    setLoading(true);
    try {
      const [departmentData, userData] = await Promise.all([
        api.getDepartment(parsedDepartmentId),
        api.getUsers(),
      ]);
      setDepartment(departmentData);
      setUsers(userData);
      await loadSections(parsedDepartmentId);
    } catch (error) {
      message.error(error instanceof Error ? error.message : '加载科室数据失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [departmentId]);

  const handleBack = () => {
    navigate('/departments');
  };

  const handleOpenCreateModal = () => {
    setEditingSection(null);
    form.resetFields();
    setIsSectionModalOpen(true);
  };

  const handleOpenEditModal = (section: Section) => {
    setEditingSection(section);
    form.setFieldsValue({
      name: section.name,
      description: section.description,
    });
    setIsSectionModalOpen(true);
  };

  const handleSaveSection = async () => {
    if (!isDepartmentIdValid) {
      return;
    }

    try {
      const values = await form.validateFields();

      if (editingSection) {
        await api.updateSection(editingSection.id, values);
        message.success('科室更新成功');
      } else {
        await api.createSection({
          ...values,
          departmentId: parsedDepartmentId,
        });
        message.success('科室创建成功');
      }

      setIsSectionModalOpen(false);
      await loadSections(parsedDepartmentId);
    } catch (error) {
      message.error(error instanceof Error ? error.message : '保存科室失败');
    }
  };

  const handleDeleteSection = (section: Section) => {
    Modal.confirm({
      title: '确定删除该科室吗？',
      content: `科室：${section.name}`,
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        if (!isDepartmentIdValid) {
          return;
        }

        try {
          await api.deleteSection(section.id);
          message.success('科室删除成功');
          await loadSections(parsedDepartmentId);
        } catch (error) {
          message.error(error instanceof Error ? error.message : '删除科室失败');
        }
      },
    });
  };

  const handleManageMembers = async (section: Section) => {
    try {
      const sectionDetail = await api.getSection(section.id);
      setSelectedSection(section);
      setCurrentMembers(sectionDetail.members || []);
      setSelectedUser(null);
      setIsMembersModalOpen(true);
    } catch (error) {
      message.error(error instanceof Error ? error.message : '加载科室成员失败');
    }
  };

  const availableUsers = useMemo(() => {
    if (!isDepartmentIdValid) {
      return [];
    }

    const currentMemberIds = new Set(currentMembers.map((member) => member.id));
    return users.filter(
      (user) =>
        user.departmentId === parsedDepartmentId &&
        !currentMemberIds.has(user.id),
    );
  }, [users, currentMembers, isDepartmentIdValid, parsedDepartmentId]);

  const handleAddMember = () => {
    if (!selectedUser) {
      message.warning('请选择要添加的人员');
      return;
    }

    const user = users.find((item) => item.id === selectedUser);
    if (!user) {
      return;
    }

    setCurrentMembers((prev) => [...prev, user]);
    setSelectedUser(null);
  };

  const handleRemoveMember = (memberId: number) => {
    setCurrentMembers((prev) => prev.filter((member) => member.id !== memberId));
  };

  const handleSaveMembers = async () => {
    if (!selectedSection || !isDepartmentIdValid) {
      return;
    }

    try {
      const memberIds = currentMembers.map((member) => member.id);
      await api.updateSectionMembers(selectedSection.id, memberIds);
      message.success('科室成员更新成功');
      setIsMembersModalOpen(false);
      await loadSections(parsedDepartmentId);
    } catch (error) {
      message.error(error instanceof Error ? error.message : '保存科室成员失败');
    }
  };

  const columns: ColumnsType<Section> = [
    {
      title: '科室名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '科室描述',
      dataIndex: 'description',
      key: 'description',
      render: (value: string | undefined) => value || '-',
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
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleOpenEditModal(record)}
          >
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
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteSection(record)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  if (!isDepartmentIdValid) {
    return (
      <Card>
        <Button icon={<ArrowLeftOutlined />} onClick={handleBack}>
          返回部门管理
        </Button>
        <div style={{ marginTop: 16 }}>部门参数无效，请从部门管理页面重新进入。</div>
      </Card>
    );
  }

  return (
    <Card
      title={
        <div>
          <Title level={4} style={{ marginBottom: 0 }}>
            科室管理
          </Title>
          <div style={{ color: '#666', marginTop: 4 }}>
            当前部门：{department?.name || '-'}
          </div>
        </div>
      }
      extra={
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={handleBack}>
            返回部门管理
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleOpenCreateModal}
          >
            新增科室
          </Button>
        </Space>
      }
    >
      <Breadcrumb style={{ marginBottom: 16 }}>
        <Breadcrumb.Item>部门管理</Breadcrumb.Item>
        <Breadcrumb.Item>{department?.name || '科室管理'}</Breadcrumb.Item>
        <Breadcrumb.Item>科室管理</Breadcrumb.Item>
      </Breadcrumb>

      <Table<Section>
        rowKey="id"
        columns={columns}
        dataSource={sections}
        pagination={{ pageSize: 10 }}
        loading={loading}
      />

      <Modal
        title={editingSection ? '编辑科室' : '新增科室'}
        open={isSectionModalOpen}
        onOk={handleSaveSection}
        onCancel={() => setIsSectionModalOpen(false)}
        okText="保存"
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="科室名称"
            name="name"
            rules={[{ required: true, message: '请输入科室名称' }]}
          >
            <Input placeholder="请输入科室名称" />
          </Form.Item>
          <Form.Item label="科室描述" name="description">
            <Input.TextArea rows={3} placeholder="请输入科室描述" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={`${selectedSection?.name || ''} - 成员管理`}
        open={isMembersModalOpen}
        onOk={handleSaveMembers}
        onCancel={() => setIsMembersModalOpen(false)}
        okText="保存"
        cancelText="取消"
        width={700}
      >
        <div style={{ marginBottom: 16 }}>
          <Space.Compact style={{ width: '100%' }}>
            <Select
              style={{ flex: 1 }}
              placeholder="选择要添加的成员"
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

        <List
          style={{ maxHeight: 320, overflow: 'auto' }}
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
                description={`用户名：${member.username}`}
              />
            </List.Item>
          )}
        />
      </Modal>
    </Card>
  );
}
