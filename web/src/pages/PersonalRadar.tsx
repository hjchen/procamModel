import { useState, useEffect } from 'react';
import ReactECharts from 'echarts-for-react';
import { Card, Row, Col, Statistic, Progress, Button, Slider, message, Spin } from 'antd';
import { EditOutlined, SaveOutlined } from '@ant-design/icons';
import { storage } from '../utils/storage';
import { api } from '../services/api';
import type { User } from '../types';

interface AbilityScores {
  tech: number;
  engineering: number;
  uiux: number;
  communication: number;
  problem: number;
}

interface MyAbilityData {
  name: string;
  position: string;
  positionName: string;
  rank: string;
  scores: AbilityScores;
}

export default function PersonalRadar() {
  const [myData, setMyData] = useState<MyAbilityData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editScores, setEditScores] = useState<AbilityScores | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMyAbilityData();
  }, []);

  const loadMyAbilityData = async () => {
    try {
      setLoading(true);
      const data = await api.getMyAbilityScores();
      setMyData(data);
    } catch (error) {
      message.error('获取能力数据失败');
      console.error('获取能力数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    if (myData) {
      setEditScores({ ...myData.scores });
      setIsEditing(true);
    }
  };

  const handleSave = async () => {
    if (!editScores) return;

    try {
      await api.updateMyAbilityScores(editScores);
      setMyData({ ...myData!, scores: editScores });
      setIsEditing(false);
      message.success('保存成功');
    } catch (error) {
      message.error('保存失败');
      console.error('保存失败:', error);
    }
  };

  const handleCancel = () => {
    setEditScores(null);
    setIsEditing(false);
  };

  const getRadarOption = () => {
    if (!myData) return {};

    const scores = isEditing && editScores ? editScores : myData.scores;
    const standardScores = [85, 80, 75, 75, 80];
    const teamAvgScores = [75, 72, 70, 80, 76];

    return {
      title: {
        text: '个人能力雷达图',
        left: 'center'
      },
      legend: {
        data: ['我的能力', '岗位标准', '团队平均'],
        bottom: 10
      },
      radar: {
        indicator: [
          { name: '技术深度', max: 100 },
          { name: '工程能力', max: 100 },
          { name: 'UI/UX能力', max: 100 },
          { name: '沟通协作', max: 100 },
          { name: '问题解决', max: 100 }
        ],
        radius: '65%'
      },
      series: [{
        type: 'radar',
        data: [
          {
            value: [scores.tech, scores.engineering, scores.uiux, scores.communication, scores.problem],
            name: '我的能力',
            areaStyle: { color: 'rgba(24, 144, 255, 0.3)' },
            lineStyle: { color: '#1890FF', width: 2 }
          },
          {
            value: standardScores,
            name: '岗位标准',
            lineStyle: { color: '#52C41A', type: 'dashed', width: 2 },
            symbol: 'none'
          },
          {
            value: teamAvgScores,
            name: '团队平均',
            lineStyle: { color: '#FAAD14', type: 'dotted', width: 2 },
            symbol: 'none'
          }
        ]
      }]
    };
  };

  const calculateOverallScore = () => {
    if (!myData) return 0;
    const scores = isEditing && editScores ? editScores : myData.scores;
    return Math.round((scores.tech + scores.engineering + scores.uiux + scores.communication + scores.problem) / 5);
  };

  const abilities = [
    { name: '技术深度', key: 'tech' as const },
    { name: '工程能力', key: 'engineering' as const },
    { name: 'UI/UX能力', key: 'uiux' as const },
    { name: '沟通协作', key: 'communication' as const },
    { name: '问题解决', key: 'problem' as const },
  ];

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!myData) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <p>暂无能力数据</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>个人能力分析</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          {!isEditing && (
            <Button type="primary" icon={<EditOutlined />} onClick={handleEdit}>
              编辑打分
            </Button>
          )}
          {isEditing && (
            <>
              <Button type="primary" icon={<SaveOutlined />} onClick={handleSave}>
                保存
              </Button>
              <Button onClick={handleCancel}>取消</Button>
            </>
          )}
        </div>
      </div>

      <Row gutter={[16, 16]}>
        <Col span={16}>
          <Card>
            <ReactECharts option={getRadarOption()} style={{ height: '500px' }} />
          </Card>
        </Col>

        <Col span={8}>
          <Card title="能力概览" style={{ marginBottom: 16 }}>
            <Statistic title="综合得分" value={calculateOverallScore()} suffix="/ 100" />
            <div style={{ marginTop: 16 }}>
              <p><strong>姓名：</strong>{myData.name}</p>
              <p><strong>岗位：</strong>{myData.positionName}</p>
              <p><strong>职级：</strong>{myData.rank}</p>
            </div>
          </Card>

          <Card title={isEditing ? "编辑能力评分" : "能力详情"}>
            {abilities.map(ability => {
              const score = isEditing && editScores ? editScores[ability.key] : myData.scores[ability.key];
              return (
                <div key={ability.key} style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span>{ability.name}</span>
                    <span>{score}</span>
                  </div>
                  {isEditing && editScores ? (
                    <Slider
                      min={0}
                      max={100}
                      value={score}
                      onChange={(value) => {
                        setEditScores({ ...editScores, [ability.key]: value });
                      }}
                    />
                  ) : (
                    <Progress percent={score} showInfo={false} />
                  )}
                </div>
              );
            })}
          </Card>
        </Col>
      </Row>
    </div>
  );
}
