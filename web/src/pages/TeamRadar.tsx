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
  selfAbilityScores?: Record<string, number>;
  managerAbilityScores?: Record<string, number>;
  groupPeerAverageScore?: number | null;
  groupPeerAverageScores?: Record<string, number>;
  groupPeerReviewCount?: number;
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
  const [isScoreModalOpen, setIsScoreModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<DepartmentMember | null>(null);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [abilityDimensions, setAbilityDimensions] = useState<AbilityDimension[]>([]);

  useEffect(() => {
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
      const user = storage.get<{ id: number }>('CURRENT_USER');
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
            initialScores[dim.code] = member.managerAbilityScores?.[dim.code] || 0;
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
      await api.updateUserAbilityScores(editingMember.id, scores);

      message.success('评分保存成功');
      setIsScoreModalOpen(false);
      if (selectedDepartmentId) {
        loadDepartmentMembers(selectedDepartmentId);
      }
    } catch (error) {
      message.error('保存评分失败');
    }
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

  const getSelfScore = (member: DepartmentMember, dimensionCode: string) =>
    member.selfAbilityScores?.[dimensionCode] ??
    member.abilityScores?.[dimensionCode] ??
    0;

  const getManagerScore = (member: DepartmentMember, dimensionCode: string) =>
    member.managerAbilityScores?.[dimensionCode];

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
      title: '自评维度分',
      key: 'selfAbilities',
      width: 400,
      render: (_: any, record: DepartmentMember) => {
        const dimensions = getMemberAbilityDimensions(record);
        if (dimensions.length === 0) {
          return <span style={{ color: '#999' }}>未分配岗位</span>;
        }
        return (
          <Space size="small" wrap>
            {dimensions.map((dim: any) => (
              <Tag key={dim.code} color={getScoreColor(getSelfScore(record, dim.code))}>
                {dim.title}: {getSelfScore(record, dim.code)}
              </Tag>
            ))}
          </Space>
        );
      },
    },
    {
      title: '管理者评分',
      key: 'managerAbilities',
      width: 420,
      render: (_: any, record: DepartmentMember) => {
        const dimensions = getMemberAbilityDimensions(record);
        if (dimensions.length === 0) {
          return <span style={{ color: '#999' }}>未分配岗位</span>;
        }
        return (
          <Space size="small" wrap>
            {dimensions.map((dim: any) => (
              <Tag
                key={dim.code}
                color={
                  getManagerScore(record, dim.code) !== undefined
                    ? getScoreColor(getManagerScore(record, dim.code) as number)
                    : 'default'
                }
              >
                {dim.title}: {getManagerScore(record, dim.code) ?? '-'}
                {record.groupPeerAverageScores?.[dim.code] !== undefined
                  ? ` / 同组${record.groupPeerAverageScores[dim.code]}`
                  : ''}
              </Tag>
            ))}
          </Space>
        );
      },
    },
    {
      title: '同组平均分',
      key: 'groupPeerAverageScore',
      width: 140,
      render: (_: any, record: DepartmentMember) => {
        if (record.groupPeerAverageScore === null || record.groupPeerAverageScore === undefined) {
          return <span style={{ color: '#999' }}>-</span>;
        }
        return (
          <Tag color={getScoreColor(record.groupPeerAverageScore)}>
            {record.groupPeerAverageScore}
            {record.groupPeerReviewCount ? ` (${record.groupPeerReviewCount}份)` : ''}
          </Tag>
        );
      },
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      width: 100,
      render: (_: any, record: DepartmentMember) => (
        <Button
          type="link"
          icon={<EditOutlined />}
          onClick={() => handleScore(record)}
        >
          评分
        </Button>
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
        scroll={{ x: 1600 }}
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
