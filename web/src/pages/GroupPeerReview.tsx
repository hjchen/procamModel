import { useEffect, useMemo, useState } from 'react';
import { Card, Select, Table, Button, Modal, Slider, Space, Tag, message, Statistic } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { api } from '../services/api';

interface PeerReviewDimension {
  code: string;
  title: string;
  description: string;
  standardScore: number;
}

interface PeerReviewTarget {
  id: number;
  username: string;
  name: string;
  email: string;
  positionId: number | null;
  rank: string | null;
  abilityDimensions: PeerReviewDimension[];
  myReviewScores: Record<string, number>;
  myReviewUpdatedAt: string | null;
}

interface PeerReviewGroup {
  id: number;
  name: string;
  departmentId: number;
  targets: PeerReviewTarget[];
}

interface ReviewHistoryRow {
  key: string;
  groupName: string;
  targetName: string;
  targetUsername: string;
  scoreCount: number;
  averageScore: number;
  reviewedAt: string;
}

export default function GroupPeerReview() {
  const [groups, setGroups] = useState<PeerReviewGroup[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [isScoreModalOpen, setIsScoreModalOpen] = useState(false);
  const [editingTarget, setEditingTarget] = useState<PeerReviewTarget | null>(null);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPeerReviewGroups();
  }, []);

  const loadPeerReviewGroups = async () => {
    try {
      setLoading(true);
      const data = await api.getMyPeerReviewTargets();
      setGroups(data);
      if (data.length > 0) {
        setSelectedGroupId((prev) => prev ?? data[0].id);
      } else {
        setSelectedGroupId(null);
      }
    } catch (error) {
      message.error(error instanceof Error ? error.message : '获取分组互评数据失败');
    } finally {
      setLoading(false);
    }
  };

  const selectedGroup = useMemo(
    () => groups.find((group) => group.id === selectedGroupId) || null,
    [groups, selectedGroupId],
  );

  const reviewHistoryRows = useMemo<ReviewHistoryRow[]>(
    () =>
      groups.flatMap((group) =>
        group.targets
          .filter((target) => Object.keys(target.myReviewScores || {}).length > 0)
          .map((target) => {
            const scoreValues = Object.values(target.myReviewScores || {});
            const averageScore =
              scoreValues.length > 0
                ? scoreValues.reduce((sum, score) => sum + score, 0) / scoreValues.length
                : 0;
            return {
              key: `${group.id}-${target.id}`,
              groupName: group.name,
              targetName: target.name,
              targetUsername: target.username,
              scoreCount: scoreValues.length,
              averageScore,
              reviewedAt: target.myReviewUpdatedAt || '-',
            };
          }),
      ),
    [groups],
  );

  const historySummary = useMemo(() => {
    const allScores = reviewHistoryRows.flatMap((row) => row.averageScore);
    const averageScore =
      allScores.length > 0
        ? allScores.reduce((sum, score) => sum + score, 0) / allScores.length
        : 0;
    const reviewedGroups = new Set(reviewHistoryRows.map((row) => row.groupName)).size;
    const latestReviewTime = reviewHistoryRows
      .map((row) => row.reviewedAt)
      .filter((value) => value !== '-')
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0];
    return {
      reviewedPeople: reviewHistoryRows.length,
      reviewedGroups,
      averageScore,
      latestReviewTime: latestReviewTime || '-',
    };
  }, [reviewHistoryRows]);

  const historyColumns: ColumnsType<ReviewHistoryRow> = [
    {
      title: '分组',
      dataIndex: 'groupName',
      key: 'groupName',
      width: 180,
    },
    {
      title: '成员',
      key: 'target',
      width: 180,
      render: (_, record) => `${record.targetName} (${record.targetUsername})`,
    },
    {
      title: '评分维度数',
      dataIndex: 'scoreCount',
      key: 'scoreCount',
      width: 120,
      render: (value: number) => <Tag color="blue">{value}</Tag>,
    },
    {
      title: '平均分',
      dataIndex: 'averageScore',
      key: 'averageScore',
      width: 120,
      render: (value: number) => value.toFixed(1),
    },
    {
      title: '最近评分时间',
      dataIndex: 'reviewedAt',
      key: 'reviewedAt',
      width: 220,
      render: (value: string) =>
        value === '-' ? '-' : new Date(value).toLocaleString(),
    },
  ];

  const handleOpenScoreModal = (target: PeerReviewTarget) => {
    if (target.abilityDimensions.length === 0) {
      message.warning('该成员未分配岗位能力维度，暂不可评分');
      return;
    }
    setEditingTarget(target);
    const initialScores = target.abilityDimensions.reduce(
      (result, dimension) => {
        result[dimension.code] = target.myReviewScores?.[dimension.code] || 0;
        return result;
      },
      {} as Record<string, number>,
    );
    setScores(initialScores);
    setIsScoreModalOpen(true);
  };

  const handleSaveScore = async () => {
    if (!selectedGroupId || !editingTarget) {
      return;
    }
    try {
      setSaving(true);
      await api.savePeerReviewScore({
        groupId: selectedGroupId,
        targetUserId: editingTarget.id,
        scores,
      });

      setGroups((prev) =>
        prev.map((group) => {
          if (group.id !== selectedGroupId) {
            return group;
          }
          return {
            ...group,
            targets: group.targets.map((target) =>
              target.id === editingTarget.id
                ? {
                    ...target,
                    myReviewScores: { ...scores },
                    myReviewUpdatedAt: new Date().toISOString(),
                  }
                : target,
            ),
          };
        }),
      );
      message.success('互评保存成功');
      setIsScoreModalOpen(false);
    } catch (error) {
      message.error(error instanceof Error ? error.message : '互评保存失败');
    } finally {
      setSaving(false);
    }
  };

  const columns: ColumnsType<PeerReviewTarget> = [
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
      width: 140,
    },
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
      width: 140,
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
      width: 220,
    },
    {
      title: '职级',
      dataIndex: 'rank',
      key: 'rank',
      width: 100,
      render: (rank: string | null) => rank || '-',
    },
    {
      title: '维度数',
      key: 'dimensionCount',
      width: 100,
      render: (_, record) => (
        <Tag color="blue">{record.abilityDimensions.length}</Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <Button
          type="link"
          icon={<EditOutlined />}
          onClick={() => handleOpenScoreModal(record)}
        >
          评分
        </Button>
      ),
    },
  ];

  return (
    <Card
      title="分组互评"
      extra={
        <Select
          style={{ width: 260 }}
          placeholder="选择分组"
          value={selectedGroupId}
          onChange={setSelectedGroupId}
          options={groups.map((group) => ({
            label: `${group.name} (${group.targets.length}人)`,
            value: group.id,
          }))}
        />
      }
      loading={loading}
    >
      <Card
        size="small"
        title="我的历史评分摘要"
        style={{ marginBottom: 16 }}
      >
        <Space size="large" wrap style={{ marginBottom: 12 }}>
          <Statistic title="已评分成员数" value={historySummary.reviewedPeople} />
          <Statistic title="涉及分组数" value={historySummary.reviewedGroups} />
          <Statistic
            title="历史平均分"
            value={historySummary.averageScore}
            precision={1}
          />
          <Statistic
            title="最近评分时间"
            value={
              historySummary.latestReviewTime === '-'
                ? '-'
                : new Date(historySummary.latestReviewTime).toLocaleString()
            }
          />
        </Space>
        <Table
          rowKey="key"
          columns={historyColumns}
          dataSource={reviewHistoryRows}
          size="small"
          pagination={{ pageSize: 5 }}
          scroll={{ x: 900 }}
          locale={{ emptyText: '暂无历史评分记录' }}
        />
      </Card>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={selectedGroup?.targets || []}
        pagination={{ pageSize: 10 }}
        scroll={{ x: 900 }}
        locale={{ emptyText: '当前分组暂无可互评成员' }}
      />

      <Modal
        title={`互评打分 - ${editingTarget?.name || ''}`}
        open={isScoreModalOpen}
        onOk={handleSaveScore}
        onCancel={() => setIsScoreModalOpen(false)}
        okText="保存"
        cancelText="取消"
        width={680}
        confirmLoading={saving}
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {(editingTarget?.abilityDimensions || []).map((dimension) => (
            <div key={dimension.code}>
              <div style={{ marginBottom: 8 }}>
                {dimension.title}: {scores[dimension.code] || 0}
                <span style={{ marginLeft: 8, color: '#999', fontSize: 12 }}>
                  标准分: {dimension.standardScore}
                </span>
              </div>
              <div style={{ marginBottom: 8, color: '#666', fontSize: 12 }}>
                {dimension.description}
              </div>
              <Slider
                min={0}
                max={100}
                value={scores[dimension.code] || 0}
                onChange={(value) =>
                  setScores((prev) => ({ ...prev, [dimension.code]: value }))
                }
              />
            </div>
          ))}
        </Space>
      </Modal>
    </Card>
  );
}
