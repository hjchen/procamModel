import { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, Space, Card, message, Tag, InputNumber, Tabs } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, BarChartOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import ReactECharts from 'echarts-for-react';
import type { Position, AbilityDimension } from '../types';
import { api } from '../services/api';

const { TextArea } = Input;
const { TabPane } = Tabs;

export default function PositionManagement() {
  const [positions, setPositions] = useState<Position[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPosition, setEditingPosition] = useState<Position | null>(null);
  const [isDimensionModalOpen, setIsDimensionModalOpen] = useState(false);
  const [editingDimension, setEditingDimension] = useState<AbilityDimension | null>(null);
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const [isRadarModalOpen, setIsRadarModalOpen] = useState(false);
  const [selectedRank, setSelectedRank] = useState<string>('F1');
  const [form] = Form.useForm();
  const [dimensionForm] = Form.useForm();

  useEffect(() => {
    loadPositions();
  }, []);

  const loadPositions = async () => {
    try {
      const data = await api.getPositions();
      setPositions(data);
    } catch (error) {
      message.error('获取岗位列表失败');
    }
  };

  const handleAdd = () => {
    setEditingPosition(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEdit = (position: Position) => {
    setEditingPosition(position);
    form.setFieldsValue(position);
    setIsModalOpen(true);
  };

  const handleDelete = (position: Position) => {
    Modal.confirm({
      title: '确定要删除该岗位吗?',
      content: `岗位: ${position.name}`,
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        try {
          await api.deletePosition(position.id as number);
          message.success('删除成功');
          await loadPositions();
        } catch (error) {
          message.error(error instanceof Error ? error.message : '删除失败');
        }
      }
    });
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      const abilityDimensions = (values.abilityDimensions || []).map((dim: any) => ({
        code: dim.id || `${values.code}-${Date.now()}`,
        title: dim.title,
        description: dim.description,
        scores: dim.scores
      }));

      const positionData = {
        code: values.code,
        name: values.name,
        dimensions: values.dimensions,
        ranks: values.ranks,
        status: values.status,
        abilityDimensions
      };

      if (editingPosition) {
        await api.updatePosition(editingPosition.id as number, positionData);
        message.success('更新成功');
      } else {
        await api.createPosition(positionData);
        message.success('创建成功');
      }

      setIsModalOpen(false);
      await loadPositions();
    } catch (error) {
      message.error(error instanceof Error ? error.message : '保存失败');
    }
  };

  const handleAddDimension = () => {
    if (!editingPosition) {
      message.warning('请先保存岗位后再添加能力维度');
      return;
    }
    setEditingDimension(null);
    dimensionForm.resetFields();
    setIsDimensionModalOpen(true);
  };

  const handleEditDimension = (dimension: AbilityDimension) => {
    setEditingDimension(dimension);
    dimensionForm.setFieldsValue(dimension);
    setIsDimensionModalOpen(true);
  };

  const handleDeleteDimension = (dimensionId: string | number) => {
    Modal.confirm({
      title: '确定要删除该能力维度吗?',
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        try {
          if (typeof dimensionId === 'number') {
            await api.deleteAbilityDimension(dimensionId);
            message.success('删除成功');
            await loadPositions();
          } else {
            const currentValues = form.getFieldsValue();
            const updatedDimensions = currentValues.abilityDimensions.filter((d: AbilityDimension) => d.id !== dimensionId);
            form.setFieldsValue({ abilityDimensions: updatedDimensions });
          }
        } catch (error) {
          message.error(error instanceof Error ? error.message : '删除失败');
        }
      }
    });
  };

  const handleDimensionSubmit = async () => {
    try {
      const values = await dimensionForm.validateFields();

      if (!editingPosition) {
        message.warning('请先保存岗位后再添加能力维度');
        return;
      }

      const dimensionData = {
        title: values.title,
        description: values.description,
        scores: values.scores
      };

      if (editingDimension && typeof editingDimension.id === 'number') {
        await api.updateAbilityDimension(editingDimension.id, dimensionData);
        message.success('更新能力维度成功');
      } else {
        const code = `${editingPosition.code}-${Date.now()}`;
        await api.createAbilityDimension({
          ...dimensionData,
          code,
          positionId: editingPosition.id
        });
        message.success('添加能力维度成功');
      }

      setIsDimensionModalOpen(false);
      await loadPositions();

      const updatedPosition = positions.find(p => p.id === editingPosition.id);
      if (updatedPosition) {
        setEditingPosition(updatedPosition);
        form.setFieldsValue(updatedPosition);
      }
    } catch (error) {
      message.error(error instanceof Error ? error.message : '保存失败');
    }
  };

  const handleViewRadar = (position: Position) => {
    setSelectedPosition(position);
    setSelectedRank('F1');
    setIsRadarModalOpen(true);
  };

  const getRadarOption = () => {
    if (!selectedPosition) return {};

    const { abilityDimensions } = selectedPosition;
    const indicators = abilityDimensions.map(dimension => ({
      name: dimension.title,
      max: 100
    }));
    const scores = abilityDimensions.map(dimension => dimension.scores[selectedRank] || 0);

    return {
      title: {
        text: `${selectedPosition.name} - ${selectedRank}职级能力雷达图`,
        left: 'center'
      },
      radar: {
        indicator: indicators,
        radius: '65%'
      },
      series: [{
        type: 'radar',
        data: [{
          value: scores,
          name: `${selectedRank}职级标准`,
          areaStyle: { color: 'rgba(24, 144, 255, 0.3)' },
          lineStyle: { color: '#1890FF', width: 2 },
          itemStyle: {
            color: '#1890FF'
          },
          label: {
            show: true,
            formatter: function(params: any) {
              return params.value;
            }
          }
        }]
      }]
    };
  };

  const columns: ColumnsType<Position> = [
    {
      title: '岗位名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '岗位编码',
      dataIndex: 'code',
      key: 'code',
    },
    {
      title: '能力维度数',
      dataIndex: 'dimensions',
      key: 'dimensions',
      render: (dimensions) => <Tag color="blue">{dimensions}</Tag>,
    },
    {
      title: '关联职级',
      dataIndex: 'ranks',
      key: 'ranks',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status === 'active' ? '启用' : '停用'}
        </Tag>
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
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
          >
            删除
          </Button>
          <Button
            type="link"
            icon={<BarChartOutlined />}
            onClick={() => handleViewRadar(record)}
          >
            雷达图
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Card
      title="岗位管理"
      extra={
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAdd}
        >
          新增岗位
        </Button>
      }
    >
      <Table
        columns={columns}
        dataSource={positions}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingPosition ? '编辑岗位' : '新增岗位'}
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={() => setIsModalOpen(false)}
        okText="保存"
        cancelText="取消"
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ abilityDimensions: [] }}
        >
          <Form.Item
            label="岗位编码"
            name="code"
            rules={[{ required: true, message: '请输入岗位编码' }]}
          >
            <Input disabled={!!editingPosition} />
          </Form.Item>
          <Form.Item
            label="岗位名称"
            name="name"
            rules={[{ required: true, message: '请输入岗位名称' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="能力维度数"
            name="dimensions"
            rules={[{ required: true, message: '请输入能力维度数' }]}
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            label="关联职级"
            name="ranks"
            rules={[{ required: true, message: '请输入关联职级' }]}
          >
            <Input placeholder="例: F1-F3, E1-E3" />
          </Form.Item>
          <Form.Item
            label="状态"
            name="status"
            rules={[{ required: true, message: '请选择状态' }]}
          >
            <Select>
              <Select.Option value="active">启用</Select.Option>
              <Select.Option value="inactive">停用</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item label="能力维度">
            <Form.Item noStyle shouldUpdate>
              {() => {
                const dimensions = form.getFieldValue('abilityDimensions') || [];
                return (
                  <div>
                    {dimensions.map((dimension: AbilityDimension, index: number) => (
                      <Card
                        key={dimension.id}
                        size="small"
                        style={{ marginBottom: 8 }}
                        extra={
                          <Space>
                            <Button
                              type="link"
                              size="small"
                              icon={<EditOutlined />}
                              onClick={() => handleEditDimension(dimension)}
                            />
                            <Button
                              type="link"
                              size="small"
                              danger
                              icon={<DeleteOutlined />}
                              onClick={() => handleDeleteDimension(dimension.id)}
                            />
                          </Space>
                        }
                      >
                        <div>
                          <strong>{dimension.title}</strong>
                          <p style={{ margin: '4px 0 0 0', color: '#666' }}>{dimension.description}</p>
                        </div>
                      </Card>
                    ))}
                    <Button
                      type="dashed"
                      onClick={handleAddDimension}
                      block
                      icon={<PlusOutlined />}
                    >
                      添加能力维度
                    </Button>
                  </div>
                );
              }}
            </Form.Item>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={editingDimension ? '编辑能力维度' : '新增能力维度'}
        open={isDimensionModalOpen}
        onOk={handleDimensionSubmit}
        onCancel={() => setIsDimensionModalOpen(false)}
        okText="保存"
        cancelText="取消"
        width={600}
      >
        <Form
          form={dimensionForm}
          layout="vertical"
        >
          <Form.Item
            label="能力标题"
            name="title"
            rules={[{ required: true, message: '请输入能力标题' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="能力描述"
            name="description"
            rules={[{ required: true, message: '请输入能力描述' }]}
          >
            <TextArea rows={3} />
          </Form.Item>
          <Form.Item label="职级评分">
            <Space direction="vertical" style={{ width: '100%' }}>
              {['F1', 'F2', 'F3', 'E1', 'E2', 'E3'].map(rank => (
                <Form.Item
                  key={rank}
                  label={rank}
                  name={['scores', rank]}
                  rules={[{ required: true, message: `请输入${rank}评分` }]}
                  style={{ marginBottom: 8 }}
                >
                  <InputNumber min={0} max={100} style={{ width: '100%' }} />
                </Form.Item>
              ))}
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={`${selectedPosition?.name} 能力雷达图`}
        open={isRadarModalOpen}
        onCancel={() => setIsRadarModalOpen(false)}
        footer={[
          <Button key="close" type="primary" onClick={() => setIsRadarModalOpen(false)}>
            关闭
          </Button>
        ]}
        width={700}
      >
        <Form layout="inline" style={{ marginBottom: 16 }}>
          <Form.Item label="选择职级">
            <Select
              value={selectedRank}
              onChange={setSelectedRank}
              style={{ width: 120 }}
            >
              {['F1', 'F2', 'F3', 'E1', 'E2', 'E3'].map(rank => (
                <Select.Option key={rank} value={rank}>{rank}</Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
        <ReactECharts option={getRadarOption()} style={{ height: '400px' }} />
      </Modal>
    </Card>
  );
}
