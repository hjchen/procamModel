import { useState, useEffect } from 'react';
import ReactECharts from 'echarts-for-react';
import { Card, Row, Col, Statistic, Progress, Button, Slider, message, Spin } from 'antd';
import { EditOutlined, SaveOutlined } from '@ant-design/icons';
import { api } from '../services/api';

interface AbilityDimension {
  code: string;
  title: string;
  description: string;
  standardScore: number;
}

interface MyAbilityData {
  name: string;
  position: string;
  positionName: string;
  rank: string;
  scores: Record<string, number>;
  abilityDimensions: AbilityDimension[];
}

export default function PersonalRadar() {
  const [myData, setMyData] = useState<MyAbilityData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editScores, setEditScores] = useState<Record<string, number> | null>(null);
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
    if (!myData || !myData.abilityDimensions.length) return {};

    const scores = isEditing && editScores ? editScores : myData.scores;
    const dimensions = myData.abilityDimensions;

    const indicators = dimensions.map(dim => ({
      name: dim.title,
      max: 100
    }));

    const myScores = dimensions.map(dim => scores[dim.code] || 0);
    const standardScores = dimensions.map(dim => dim.standardScore);

    return {
      tooltip: {
        trigger: 'item',
        triggerOn: 'mousemove|click',
        confine: true,
        formatter: (
          params: {
            name?: string;
            value?: number[] | number;
            dimensionIndex?: number;
          },
        ) => {
          const dimensionIndex = params.dimensionIndex;
          const values = Array.isArray(params.value) ? params.value : [];
          if (typeof dimensionIndex === 'number' && dimensionIndex >= 0) {
            const dimensionName = indicators[dimensionIndex]?.name || '维度';
            const pointValue = values[dimensionIndex] ?? 0;
            return `${dimensionName}<br/>${params.name || '评分'}: ${pointValue}`;
          }
          return '';
        },
      },
      title: {
        text: '个人能力雷达图',
        left: 'center',
        top: 8
      },
      legend: {
        data: ['我的能力', '岗位标准'],
        bottom: 0
      },
      radar: {
        indicator: indicators,
        center: ['50%', '54%'],
        radius: '64%',
        name: {
          textStyle: {
            fontSize: 12,
            lineHeight: 16
          }
        }
      },
      media: [
        {
          query: { maxWidth: 1400 },
          option: {
            radar: {
              center: ['50%', '53%'],
              radius: '60%',
            },
          },
        },
        {
          query: { maxWidth: 992 },
          option: {
            radar: {
              center: ['50%', '52%'],
              radius: '58%',
            },
            legend: {
              bottom: 4,
            },
          },
        },
      ],
      series: [{
        type: 'radar',
        data: [
          {
            value: myScores,
            name: '我的能力',
            symbol: 'circle',
            symbolSize: 10,
            areaStyle: { color: 'rgba(24, 144, 255, 0.3)' },
            lineStyle: { color: '#1890FF', width: 2 },
            itemStyle: { color: '#1890FF' },
            emphasis: {
              lineStyle: { width: 3 },
              itemStyle: {
                borderColor: '#fff',
                borderWidth: 2,
              },
            },
          },
          {
            value: standardScores,
            name: '岗位标准',
            symbol: 'circle',
            symbolSize: 10,
            lineStyle: { color: '#52C41A', type: 'dashed', width: 2 },
            itemStyle: { color: '#52C41A' },
            emphasis: {
              lineStyle: { width: 3, type: 'solid' },
              itemStyle: {
                borderColor: '#fff',
                borderWidth: 2,
              },
            },
          }
        ]
      }]
    };
  };

  const calculateOverallScore = () => {
    if (!myData || !myData.abilityDimensions.length) return 0;
    const scores = isEditing && editScores ? editScores : myData.scores;
    const dimensions = myData.abilityDimensions;
    const total = dimensions.reduce((sum, dim) => sum + (scores[dim.code] || 0), 0);
    return Math.round(total / dimensions.length);
  };

  if (loading) {
    return (
      <div className="text-center py-24">
        <Spin size="large" />
      </div>
    );
  }

  if (!myData) {
    return (
      <div className="text-center py-24">
        <p>暂无能力数据</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <h2 className="m-0">个人能力分析</h2>
        <div className="flex gap-2">
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
        <Col xs={24} xl={16}>
          <Card>
            <ReactECharts
              option={getRadarOption()}
              style={{ height: 'clamp(560px, 72vh, 780px)' }}
            />
          </Card>
        </Col>

        <Col xs={24} xl={8}>
          <div style={{ maxHeight: 'calc(100vh - 240px)', overflowY: 'auto', paddingRight: 4 }}>
            <Card title="能力概览" className="mb-4">
              <Statistic title="综合得分" value={calculateOverallScore()} suffix="/ 100" />
              <div className="mt-4">
                <p><strong>姓名：</strong>{myData.name}</p>
                <p><strong>岗位：</strong>{myData.positionName}</p>
                <p><strong>职级：</strong>{myData.rank}</p>
              </div>
            </Card>

            <Card title={isEditing ? "编辑能力评分" : "能力详情"}>
              {myData.abilityDimensions.map(dimension => {
                const score = isEditing && editScores ? editScores[dimension.code] : myData.scores[dimension.code] || 0;
                return (
                  <div key={dimension.code} className="mb-4">
                    <div className="flex justify-between mb-1">
                      <span>{dimension.title}</span>
                      <span>{score}</span>
                    </div>
                    <div className="text-xs text-gray-600 mb-1">
                      {dimension.description}
                    </div>
                    {isEditing && editScores ? (
                      <Slider
                        min={0}
                        max={100}
                        value={score}
                        onChange={(value) => {
                          setEditScores({ ...editScores, [dimension.code]: value });
                        }}
                      />
                    ) : (
                      <Progress percent={score} showInfo={false} />
                    )}
                    <div className="text-xs text-gray-500 mt-1">
                      岗位标准: {dimension.standardScore}
                    </div>
                  </div>
                );
              })}
            </Card>
          </div>
        </Col>
      </Row>
    </div>
  );
}
