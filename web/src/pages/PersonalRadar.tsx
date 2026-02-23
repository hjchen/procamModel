import { useState, useEffect } from 'react';
import ReactECharts from 'echarts-for-react';
import { storage } from '../utils/storage';
import type { Employee } from '../types';
import './PersonalRadar.css';

export default function PersonalRadar() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = () => {
    const data = storage.get<Employee[]>('EMPLOYEES') || [];
    setEmployees(data);
    if (data.length > 0) {
      setSelectedEmployee(data[0]);
    }
  };

  const getRadarOption = () => {
    if (!selectedEmployee) return {};

    const { scores } = selectedEmployee;
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
    if (!selectedEmployee) return 0;
    const { scores } = selectedEmployee;
    return Math.round((scores.tech + scores.engineering + scores.uiux + scores.communication + scores.problem) / 5);
  };

  return (
    <div className="personal-radar">
      <div className="page-header">
        <h2>个人能力分析</h2>
        <select
          value={selectedEmployee?.id || ''}
          onChange={(e) => {
            const emp = employees.find(e => e.id === Number(e.target.value));
            setSelectedEmployee(emp || null);
          }}
        >
          {employees.map(emp => (
            <option key={emp.id} value={emp.id}>
              {emp.name} - {emp.rank}
            </option>
          ))}
        </select>
      </div>

      {selectedEmployee && (
        <div className="content-grid">
          <div className="chart-container">
            <ReactECharts option={getRadarOption()} style={{ height: '500px' }} />
          </div>

          <div className="info-panel">
            <div className="info-card">
              <h3>能力概览</h3>
              <div className="stat-item">
                <span className="label">综合得分</span>
                <span className="value">{calculateOverallScore()}/100</span>
              </div>
              <div className="stat-item">
                <span className="label">岗位</span>
                <span className="value">{selectedEmployee.position}</span>
              </div>
              <div className="stat-item">
                <span className="label">职级</span>
                <span className="value">{selectedEmployee.rank}</span>
              </div>
            </div>

            <div className="info-card">
              <h3>能力详情</h3>
              <div className="ability-list">
                <div className="ability-item">
                  <span>技术深度</span>
                  <div className="progress-bar">
                    <div className="progress" style={{ width: `${selectedEmployee.scores.tech}%` }}></div>
                  </div>
                  <span>{selectedEmployee.scores.tech}</span>
                </div>
                <div className="ability-item">
                  <span>工程能力</span>
                  <div className="progress-bar">
                    <div className="progress" style={{ width: `${selectedEmployee.scores.engineering}%` }}></div>
                  </div>
                  <span>{selectedEmployee.scores.engineering}</span>
                </div>
                <div className="ability-item">
                  <span>UI/UX能力</span>
                  <div className="progress-bar">
                    <div className="progress" style={{ width: `${selectedEmployee.scores.uiux}%` }}></div>
                  </div>
                  <span>{selectedEmployee.scores.uiux}</span>
                </div>
                <div className="ability-item">
                  <span>沟通协作</span>
                  <div className="progress-bar">
                    <div className="progress" style={{ width: `${selectedEmployee.scores.communication}%` }}></div>
                  </div>
                  <span>{selectedEmployee.scores.communication}</span>
                </div>
                <div className="ability-item">
                  <span>问题解决</span>
                  <div className="progress-bar">
                    <div className="progress" style={{ width: `${selectedEmployee.scores.problem}%` }}></div>
                  </div>
                  <span>{selectedEmployee.scores.problem}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
