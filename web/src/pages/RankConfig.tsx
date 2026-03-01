import { useState, useEffect } from 'react';
import { Button, Table, Modal, Form, Input, Tabs, Space, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { RankSystem, Rank } from '../types';
import { api } from '../services/api';

const { TextArea } = Input;

export default function RankConfig() {
  const [rankSystem, setRankSystem] = useState<RankSystem>({ F: [], E: [] });
  const [selectedSeries, setSelectedSeries] = useState<'F' | 'E'>('F');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRank, setEditingRank] = useState<Rank | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadRanks();
  }, []);

  const loadRanks = async () => {
    try {
      const data = await api.getRanks();
      const groupedRanks = {
        F: data.filter((rank: any) => rank.category === 'F'),
        E: data.filter((rank: any) => rank.category === 'E')
      };
      setRankSystem(groupedRanks);
    } catch (error) {
      message.error('获取职级列表失败');
      console.error('获取职级列表失败:', error);
    }
  };

  const handleAdd = () => {
    setEditingRank(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEdit = (rank: Rank) => {
    setEditingRank(rank);
    form.setFieldsValue(rank);
    setIsModalOpen(true);
  };

  const handleDelete = (level: string) => {
    Modal.confirm({
      title: '确定要删除该职级吗?',
      onOk: () => {
        const newRanks = rankSystem[selectedSeries].filter(r => r.level !== level);
        const newSystem = { ...rankSystem, [selectedSeries]: newRanks };
        setRankSystem(newSystem);
        message.success('删除成功');
      }
    });
  };

  const handleSubmit = async (values: Rank) => {
    try {
      let newRanks: Rank[];
      if (editingRank) {
        newRanks = rankSystem[selectedSeries].map(r => r.level === editingRank.level ? values : r);
      } else {
        newRanks = [...rankSystem[selectedSeries], values];
      }
      const newSystem = { ...rankSystem, [selectedSeries]: newRanks };
      setRankSystem(newSystem);
      setIsModalOpen(false);
      message.success(editingRank ? '更新成功' : '添加成功');
    } catch (error) {
      message.error('操作失败');
    }
  };

  const columns = [
    {
      title: '职级',
      dataIndex: 'level',
      key: 'level',
    },
    {
      title: '职级名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '工作年限',
      dataIndex: 'years',
      key: 'years',
    },
    {
      title: '能力标准摘要',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Rank) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Button type="link" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.level)}>
            删除
          </Button>
        </Space>
      ),
    },
  ];

  const tabItems = [
    {
      key: 'F',
      label: 'F序列 (基础发展序列)',
      children: (
        <Table
          columns={columns}
          dataSource={rankSystem.F}
          rowKey="level"
          pagination={false}
        />
      ),
    },
    {
      key: 'E',
      label: 'E序列 (专家发展序列)',
      children: (
        <Table
          columns={columns}
          dataSource={rankSystem.E}
          rowKey="level"
          pagination={false}
        />
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>职级配置</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          新增职级
        </Button>
      </div>

      <Tabs
        activeKey={selectedSeries}
        items={tabItems}
        onChange={(key) => setSelectedSeries(key as 'F' | 'E')}
      />

      <Modal
        title={editingRank ? '编辑职级' : '新增职级'}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
      >
        <Form form={form} onFinish={handleSubmit} layout="vertical">
          <Form.Item
            label="职级编码"
            name="level"
            rules={[{ required: true, message: '请输入职级编码' }]}
          >
            <Input placeholder={`例: ${selectedSeries}1`} disabled={!!editingRank} />
          </Form.Item>
          <Form.Item
            label="职级名称"
            name="name"
            rules={[{ required: true, message: '请输入职级名称' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="工作年限"
            name="years"
            rules={[{ required: true, message: '请输入工作年限' }]}
          >
            <Input placeholder="例: 0-1年" />
          </Form.Item>
          <Form.Item
            label="能力标准描述"
            name="description"
            rules={[{ required: true, message: '请输入能力标准描述' }]}
          >
            <TextArea rows={3} />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setIsModalOpen(false)}>取消</Button>
              <Button type="primary" htmlType="submit">保存</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}