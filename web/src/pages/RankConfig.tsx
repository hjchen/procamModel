import { useState, useEffect } from 'react';
import type { RankSystem, Rank } from '../types';
import { api } from '../services/api';
import './RankConfig.css';

export default function RankConfig() {
  const [rankSystem, setRankSystem] = useState<RankSystem>({ F: [], E: [] });
  const [selectedSeries, setSelectedSeries] = useState<'F' | 'E'>('F');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRank, setEditingRank] = useState<Rank | null>(null);
  const [formData, setFormData] = useState<Rank>({
    level: '',
    name: '',
    years: '',
    description: ''
  });

  useEffect(() => {
    const fetchRanks = async () => {
      await loadRanks();
    };
    fetchRanks();
  }, []);

  const loadRanks = async () => {
    try {
      const data = await api.getRanks();
      // 转换数据格式，按照F和E序列分组
      const groupedRanks = {
        F: data.filter((rank: any) => rank.category === 'F'),
        E: data.filter((rank: any) => rank.category === 'E')
      };
      setRankSystem(groupedRanks);
    } catch (error) {
      console.error('获取职级列表失败:', error);
    }
  };

  const handleAdd = () => {
    setEditingRank(null);
    setFormData({ level: '', name: '', years: '', description: '' });
    setIsModalOpen(true);
  };

  const handleEdit = (rank: Rank) => {
    setEditingRank(rank);
    setFormData(rank);
    setIsModalOpen(true);
  };

  const handleDelete = (level: string) => {
    if (confirm('确定要删除该职级吗?')) {
      const newRanks = rankSystem[selectedSeries].filter(r => r.level !== level);
      const newSystem = { ...rankSystem, [selectedSeries]: newRanks };
      storage.set('RANKS', newSystem);
      loadRanks();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let newRanks: Rank[];

    if (editingRank) {
      newRanks = rankSystem[selectedSeries].map(r => r.level === editingRank.level ? formData : r);
    } else {
      newRanks = [...rankSystem[selectedSeries], formData];
    }

    const newSystem = { ...rankSystem, [selectedSeries]: newRanks };
    storage.set('RANKS', newSystem);
    loadRanks();
    setIsModalOpen(false);
  };

  return (
    <div className="rank-config">
      <div className="page-header">
        <h2>职级配置</h2>
        <button className="btn-primary" onClick={handleAdd}>+ 新增职级</button>
      </div>

      <div className="series-tabs">
        <button
          className={selectedSeries === 'F' ? 'active' : ''}
          onClick={() => setSelectedSeries('F')}
        >
          F序列 (基础发展序列)
        </button>
        <button
          className={selectedSeries === 'E' ? 'active' : ''}
          onClick={() => setSelectedSeries('E')}
        >
          E序列 (专家发展序列)
        </button>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>职级</th>
              <th>职级名称</th>
              <th>工作年限</th>
              <th>能力标准摘要</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {rankSystem[selectedSeries].map(rank => (
              <tr key={rank.level}>
                <td>{rank.level}</td>
                <td>{rank.name}</td>
                <td>{rank.years}</td>
                <td>{rank.description}</td>
                <td>
                  <button className="btn-edit" onClick={() => handleEdit(rank)}>✏️</button>
                  <button className="btn-delete" onClick={() => handleDelete(rank.level)}>🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>{editingRank ? '编辑职级' : '新增职级'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>职级编码</label>
                <input
                  type="text"
                  value={formData.level}
                  onChange={e => setFormData({...formData, level: e.target.value})}
                  placeholder={`例: ${selectedSeries}1`}
                  required
                  disabled={!!editingRank}
                />
              </div>
              <div className="form-group">
                <label>职级名称</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>工作年限</label>
                <input
                  type="text"
                  value={formData.years}
                  onChange={e => setFormData({...formData, years: e.target.value})}
                  placeholder="例: 0-1年"
                  required
                />
              </div>
              <div className="form-group">
                <label>能力标准描述</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  rows={3}
                  required
                />
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
