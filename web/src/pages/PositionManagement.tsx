import { useState, useEffect } from 'react';
import ReactECharts from 'echarts-for-react';
import type { Position, AbilityDimension } from '../types';
import { api } from '../services/api';
import './PositionManagement.css';

export default function PositionManagement() {
  const [positions, setPositions] = useState<Position[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPosition, setEditingPosition] = useState<Position | null>(null);
  const [formData, setFormData] = useState<Position>({
    id: '',
    name: '',
    dimensions: 0,
    ranks: '',
    status: 'active',
    abilityDimensions: []
  });
  const [isDimensionModalOpen, setIsDimensionModalOpen] = useState(false);
  const [editingDimension, setEditingDimension] = useState<AbilityDimension | null>(null);
  const [dimensionFormData, setDimensionFormData] = useState<AbilityDimension>({
    id: '',
    title: '',
    description: '',
    scores: {}
  });
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const [isRadarModalOpen, setIsRadarModalOpen] = useState(false);
  const [selectedRank, setSelectedRank] = useState<string>('F1');

  useEffect(() => {
    const fetchPositions = async () => {
      await loadPositions();
    };
    fetchPositions();
  }, []);

  const loadPositions = async () => {
    try {
      const data = await api.getPositions();
      setPositions(data);
    } catch (error) {
      console.error('获取岗位列表失败:', error);
    }
  };

  const handleAdd = () => {
    setEditingPosition(null);
    setFormData({ id: '', name: '', dimensions: 0, ranks: '', status: 'active', abilityDimensions: [] });
    setIsModalOpen(true);
  };

  const handleEdit = (position: Position) => {
    setEditingPosition(position);
    setFormData(position);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('确定要删除该岗位吗?')) {
      const newPositions = positions.filter(p => p.id !== id);
      storage.set('POSITIONS', newPositions);
      loadPositions();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let newPositions: Position[];

    if (editingPosition) {
      newPositions = positions.map(p => p.id === editingPosition.id ? formData : p);
    } else {
      newPositions = [...positions, formData];
    }

    storage.set('POSITIONS', newPositions);
    loadPositions();
    setIsModalOpen(false);
  };

  const handleAddDimension = () => {
    setEditingDimension(null);
    setDimensionFormData({ id: '', title: '', description: '', scores: {} });
    setIsDimensionModalOpen(true);
  };

  const handleEditDimension = (dimension: AbilityDimension) => {
    setEditingDimension(dimension);
    setDimensionFormData(dimension);
    setIsDimensionModalOpen(true);
  };

  const handleDeleteDimension = (dimensionId: string) => {
    if (confirm('确定要删除该能力维度吗?')) {
      const updatedDimensions = formData.abilityDimensions.filter(d => d.id !== dimensionId);
      setFormData({ ...formData, abilityDimensions: updatedDimensions });
    }
  };

  const handleDimensionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let updatedDimensions: AbilityDimension[];

    if (editingDimension) {
      updatedDimensions = formData.abilityDimensions.map(d => d.id === editingDimension.id ? dimensionFormData : d);
    } else {
      const newDimension = {
        ...dimensionFormData,
        id: dimensionFormData.id || `${formData.id}-${Date.now()}`
      };
      updatedDimensions = [...formData.abilityDimensions, newDimension];
    }

    setFormData({ ...formData, abilityDimensions: updatedDimensions });
    setIsDimensionModalOpen(false);
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

  return (
    <div className="position-management">
      <div className="page-header">
        <h2>岗位管理</h2>
        <button className="btn-primary" onClick={handleAdd}>+ 新增岗位</button>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>岗位名称</th>
              <th>岗位编码</th>
              <th>能力维度数</th>
              <th>关联职级</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {positions.map(position => (
              <tr key={position.id}>
                <td>{position.name}</td>
                <td>{position.id}</td>
                <td>{position.dimensions}</td>
                <td>{position.ranks}</td>
                <td>
                  <span className={`status ${position.status}`}>
                    {position.status === 'active' ? '启用' : '停用'}
                  </span>
                </td>
                <td>
                  <button className="btn-edit" onClick={() => handleEdit(position)}>✏️</button>
                  <button className="btn-delete" onClick={() => handleDelete(position.id)}>🗑️</button>
                  <button className="btn-view-radar" onClick={() => handleViewRadar(position)}>📊</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>{editingPosition ? '编辑岗位' : '新增岗位'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>岗位编码</label>
                <input
                  type="text"
                  value={formData.id}
                  onChange={e => setFormData({...formData, id: e.target.value})}
                  required
                  disabled={!!editingPosition}
                />
              </div>
              <div className="form-group">
                <label>岗位名称</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>能力维度数</label>
                <input
                  type="number"
                  value={formData.dimensions}
                  onChange={e => setFormData({...formData, dimensions: Number(e.target.value)})}
                  required
                />
              </div>
              <div className="form-group">
                <label>关联职级</label>
                <input
                  type="text"
                  value={formData.ranks}
                  onChange={e => setFormData({...formData, ranks: e.target.value})}
                  placeholder="例: F1-F3, E1-E3"
                  required
                />
              </div>
              <div className="form-group">
                <label>状态</label>
                <select
                  value={formData.status}
                  onChange={e => setFormData({...formData, status: e.target.value as 'active' | 'inactive'})}
                >
                  <option value="active">启用</option>
                  <option value="inactive">停用</option>
                </select>
              </div>
              <div className="form-group">
                <label>能力维度</label>
                <div className="dimensions-list">
                  {formData.abilityDimensions.map(dimension => (
                    <div key={dimension.id} className="dimension-item">
                      <div className="dimension-info">
                        <h4>{dimension.title}</h4>
                        <p>{dimension.description}</p>
                      </div>
                      <div className="dimension-actions">
                        <button className="btn-edit" onClick={() => handleEditDimension(dimension)}>✏️</button>
                        <button className="btn-delete" onClick={() => handleDeleteDimension(dimension.id)}>🗑️</button>
                      </div>
                    </div>
                  ))}
                  <button className="btn-add-dimension" onClick={handleAddDimension}>+ 添加能力维度</button>
                </div>
              </div>
              <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={() => setIsModalOpen(false)}>取消</button>
                <button type="submit" className="btn-primary">保存</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isDimensionModalOpen && (
        <div className="modal-overlay" onClick={() => setIsDimensionModalOpen(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>{editingDimension ? '编辑能力维度' : '新增能力维度'}</h3>
            <form onSubmit={handleDimensionSubmit}>
              <div className="form-group">
                <label>能力标题</label>
                <input
                  type="text"
                  value={dimensionFormData.title}
                  onChange={e => setDimensionFormData({...dimensionFormData, title: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>能力描述</label>
                <textarea
                  value={dimensionFormData.description}
                  onChange={e => setDimensionFormData({...dimensionFormData, description: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>职级评分</label>
                <div className="scores-grid">
                  {['F1', 'F2', 'F3', 'E1', 'E2', 'E3'].map(rank => (
                    <div key={rank} className="score-item">
                      <label>{rank}</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={dimensionFormData.scores[rank] || ''}
                        onChange={e => setDimensionFormData({
                          ...dimensionFormData,
                          scores: {
                            ...dimensionFormData.scores,
                            [rank]: Number(e.target.value)
                          }
                        })}
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={() => setIsDimensionModalOpen(false)}>取消</button>
                <button type="submit" className="btn-primary">保存</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isRadarModalOpen && selectedPosition && (
        <div className="modal-overlay" onClick={() => setIsRadarModalOpen(false)}>
          <div className="modal radar-modal" onClick={e => e.stopPropagation()}>
            <h3>{selectedPosition.name}能力雷达图</h3>
            <div className="form-group">
              <label>选择职级</label>
              <select
                value={selectedRank}
                onChange={e => setSelectedRank(e.target.value)}
              >
                {['F1', 'F2', 'F3', 'E1', 'E2', 'E3'].map(rank => (
                  <option key={rank} value={rank}>{rank}</option>
                ))}
              </select>
            </div>
            <div className="chart-container">
              <ReactECharts option={getRadarOption()} style={{ height: '400px' }} />
            </div>
            <div className="form-actions">
              <button type="button" className="btn-cancel" onClick={() => setIsRadarModalOpen(false)}>关闭</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
