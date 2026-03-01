import { useState, useEffect } from 'react';
import { Card, Select, Table, Button, Modal, Slider, Space, message, Tag } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { api } from '../services/api';
import { storage } from '../utils/storage';

interface DepartmentMember {
  id: number;
  username: string;
  name: string;
  email: string;
  positionId?: number;
  rank?: string;
  abilityScores?: {
    tech: number;
    engineering: number;
    uiux: number;
    communication: number;
    problem: number;
  };
}

export default function TeamRadar() {
  const [departments, setDepartments] = useState<any[]>([]);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<number | null>(null);
  const [members, setMembers] = useState<DepartmentMember[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isScoreModalOpen, setIsScoreModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<DepartmentMember | null>(null);
  const [scores, setScores] = useState({
    tech: 0,
    engineering: 0,
    uiux: 0,
    communication: 0,
    problem: 0
  });

  useEffect(() => {
    const user = storage.get('CURRENT_USER');
    setCurrentUser(user);
    loadDepartments();
  }, []);

  useEffect(() => {
    if (selectedDepartmentId) {
      loadDepartmentMembers(selectedDepartmentId);
    }
  }, [selectedDepartmentId]);

  const loadDepartments = async () => {
    try {
      const data = await api.getDepartments();
      setDepartments(data);

      // 如果是部门管理员，自动选择其管理的部门
      const user = storage.get('CURRENT_USER');
      if (user) {
        const managedDept = data.find((d: any) => d.managerId === user.id);
        if (managedDept) {
          setSelectedDepartmentId(managedDept.id);
        } else if (data.length > 0) {
          setSelectedDepartmentId(data[0].id);
        }
      }
    } catch (error) {
      message.error('获取部门列表失败');
    }
  };

  const loadDepartmentMembers = async (departmentId: number) => {
    try {
      const data = await api.getDepartmentMembers(departmentId);
      setMembers(data);
    } catch (error) {
      message.error('获取部门成员失败');
    }
  };

  const handleScore = (member: DepartmentMember) => {
    setEditingMember(member);
    setScores(member.abilityScores || {
      tech: 0,
      engineering: 0,
      uiux: 0,
      communication: 0,
      problem: 0
    });
    setIsScoreModalOpen(true);
  };

  const handleScoreSubmit = async () => {
    if (!editingMember) return;

    try {
      // 这里需要添加一个API来更新用户的能力评分
      await fetch(`http://localhost:3000/users/${editingMember.id}/scores`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ abilityScores: scores }),
      });

      message.success('评分保存成功');
      setIsScoreModalOpen(false);
      if (selectedDepartmentId) {
        loadDepartmentMembers(selectedDepartmentId);
      }
    } catch (error) {
      message.error('保存评分失败');
    }
  };

  const canManageDepartment = () => {
    if (!currentUser || !selectedDepartmentId) return false;

    // admin和hr可以管理所有部门
    if (currentUser.role === 'admin' || currentUser.role === 'hr') {
      return true;
    }

    // 部门管理员只能管理自己的部门
    const dept = departments.find(d => d.id === selectedDepartmentId);
    return dept && dept.managerId === currentUser.id;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'green';
    if (score >= 60) return 'blue';
    if (score >= 40) return 'orange';
    return 'red';
  };

  const columns: ColumnsType<DepartmentMember> = [
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
      title: '职级',
      dataIndex: 'rank',
      key: 'rank',
      render: (rank) => rank || '-',
    },
    {
      title: '技术能力',
      key: 'tech',
      render: (_, record) => (
        <Tag color={getScoreColor(record.abilityScores?.tech || 0)}>
          {record.abilityScores?.tech || 0}
        </Tag>
      ),
    },
    {
      title: '工程能力',
      key: 'engineering',
      render: (_, record) => (
        <Tag color={getScoreColor(record.abilityScores?.engineering || 0)}>
          {record.abilityScores?.engineering || 0}
        </Tag>
      ),
    },
    {
      title: 'UI/UX',
      key: 'uiux',
      render: (_, record) => (
        <Tag color={getScoreColor(record.abilityScores?.uiux || 0)}>
          {record.abilityScores?.uiux || 0}
        </Tag>
      ),
    },
    {
      title: '沟通能力',
      key: 'communication',
      render: (_, record) => (
        <Tag color={getScoreColor(record.abilityScores?.communication || 0)}>
          {record.abilityScores?.communication || 0}
        </Tag>
      ),
    },
    {
      title: '问题解决',
      key: 'problem',
      render: (_, record) => (
        <Tag color={getScoreColor(record.abilityScores?.problem || 0)}>
          {record.abilityScores?.problem || 0}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        canManageDepartment() ? (
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleScore(record)}
          >
            评分
          </Button>
        ) : null
      ),
    },
  ];

  return (
    <Card
      title="部门能力管理"
      extra={
        <Select
          style={{ width: 200 }}
          placeholder="选择部门"
          value={selectedDepartmentId}
          onChange={setSelectedDepartmentId}
          options={departments.map(dept => ({
            label: dept.name,
            value: dept.id
          }))}
        />
      }
    >
      <Table
        columns={columns}
        dataSource={members}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={`评分 - ${editingMember?.name}`}
        open={isScoreModalOpen}
        onOk={handleScoreSubmit}
        onCancel={() => setIsScoreModalOpen(false)}
        okText="保存"
        cancelText="取消"
        width={600}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <div>
            <div style={{ marginBottom: 8 }}>技术能力: {scores.tech}</div>
            <Slider
              min={0}
              max={100}
              value={scores.tech}
              onChange={(value) => setScores({ ...scores, tech: value })}
            />
          </div>
          <div>
            <div style={{ marginBottom: 8 }}>工程能力: {scores.engineering}</div>
            <Slider
              min={0}
              max={100}
              value={scores.engineering}
              onChange={(value) => setScores({ ...scores, engineering: value })}
            />
          </div>
          <div>
            <div style={{ marginBottom: 8 }}>UI/UX能力: {scores.uiux}</div>
            <Slider
              min={0}
              max={100}
              value={scores.uiux}
              onChange={(value) => setScores({ ...scores, uiux: value })}
            />
          </div>
          <div>
            <div style={{ marginBottom: 8 }}>沟通能力: {scores.communication}</div>
            <Slider
              min={0}
              max={100}
              value={scores.communication}
              onChange={(value) => setScores({ ...scores, communication: value })}
            />
          </div>
          <div>
            <div style={{ marginBottom: 8 }}>问题解决: {scores.problem}</div>
            <Slider
              min={0}
              max={100}
              value={scores.problem}
              onChange={(value) => setScores({ ...scores, problem: value })}
            />
          </div>
        </Space>
      </Modal>
    </Card>
  );
}
