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
  abilityScores?: Record<string, number>;
}

interface AbilityDimension {
  code: string;
  title: string;
  description: string;
  standardScore: number;
}

export default function TeamRadar() {
  const [departments, setDepartments] = useState<any[]>([]);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<number | null>(null);
  const [members, setMembers] = useState<DepartmentMember[]>([]);
  const [positions, setPositions] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isScoreModalOpen, setIsScoreModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<DepartmentMember | null>(null);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [abilityDimensions, setAbilityDimensions] = useState<AbilityDimension[]>([]);

  useEffect(() => {
    const user = storage.get('CURRENT_USER');
    setCurrentUser(user);
    loadDepartments();
    loadPositions();
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

  const loadMyAbilityDimensions = async () => {
    try {
      const data = await api.getMyAbilityScores();
      setAbilityDimensions(data.abilityDimensions || []);
    } catch (error) {
      console.error('获取能力维度失败:', error);
    }
  };

  const loadPositions = async () => {
    try {
      const data = await api.getPositions();
      setPositions(data);
    } catch (error) {
      console.error('获取岗位列表失败:', error);
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

  const handleScore = async (member: DepartmentMember) => {
    setEditingMember(member);

    // 获取该成员岗位的能力维度
    if (member.positionId) {
      try {
        const position = positions.find(p => p.id === member.positionId);
        if (position && position.abilityDimensions) {
          const dimensions = position.abilityDimensions.map((dim: any) => ({
            code: dim.code,
            title: dim.title,
            description: dim.description,
            standardScore: dim.scores[member.rank || ''] || 0,
          }));
          setAbilityDimensions(dimensions);

          const initialScores: Record<string, number> = {};
          dimensions.forEach((dim: AbilityDimension) => {
            initialScores[dim.code] = member.abilityScores?.[dim.code] || 0;
          });
          setScores(initialScores);
        }
      } catch (error) {
        message.error('获取岗位能力维度失败');
        return;
      }
    } else {
      message.warning('该成员未分配岗位');
      return;
    }

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

  // 获取成员岗位的能力维度
  const getMemberAbilityDimensions = (member: DepartmentMember) => {
    if (!member.positionId) return [];
    const position = positions.find(p => p.id === member.positionId);
    return position?.abilityDimensions || [];
  };

  const columns: ColumnsType<DepartmentMember> = [
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
      fixed: 'left',
      width: 100,
    },
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
      width: 120,
    },
    {
      title: '岗位',
      dataIndex: 'positionId',
      key: 'positionId',
      width: 120,
      render: (positionId) => {
        const position = positions.find(p => p.id === positionId);
        return position?.name || '-';
      },
    },
    {
      title: '职级',
      dataIndex: 'rank',
      key: 'rank',
      width: 80,
      render: (rank) => rank || '-',
    },
    {
      title: '能力评分',
      key: 'abilities',
      width: 400,
      render: (_: any, record: DepartmentMember) => {
        const dimensions = getMemberAbilityDimensions(record);
        if (dimensions.length === 0) {
          return <span style={{ color: '#999' }}>未分配岗位</span>;
        }
        return (
          <Space size="small" wrap>
            {dimensions.map((dim: any) => (
              <Tag key={dim.code} color={getScoreColor(record.abilityScores?.[dim.code] || 0)}>
                {dim.title}: {record.abilityScores?.[dim.code] || 0}
              </Tag>
            ))}
          </Space>
        );
      },
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      width: 100,
      render: (_: any, record: DepartmentMember) => (
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
        scroll={{ x: 1000 }}
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
          {abilityDimensions.map(dim => (
            <div key={dim.code}>
              <div style={{ marginBottom: 8 }}>
                {dim.title}: {scores[dim.code] || 0}
                <span style={{ fontSize: '12px', color: '#999', marginLeft: 8 }}>
                  (标准: {dim.standardScore})
                </span>
              </div>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: 8 }}>
                {dim.description}
              </div>
              <Slider
                min={0}
                max={100}
                value={scores[dim.code] || 0}
                onChange={(value) => setScores({ ...scores, [dim.code]: value })}
              />
            </div>
          ))}
        </Space>
      </Modal>
    </Card>
  );
}
