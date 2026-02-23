import { useState, useEffect } from 'react';
import { storage } from '../utils/storage';
import type { Position } from '../types';
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
    status: 'active'
  });

  useEffect(() => {
    loadPositions();
  }, []);

  const loadPositions = () => {
    const data = storage.get<Position[]>('POSITIONS') || [];
    setPositions(data);
  };

  const handleAdd = () => {
    setEditingPosition(null);
    setFormData({ id: '', name: '', dimensions: 0, ranks: '', status: 'active' });
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
              <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={() => setIsModalOpen(false)}>取消</button>
                <button type="submit" className="btn-primary">保存</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
