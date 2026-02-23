import { useState, useEffect } from 'react';
import ReactECharts from 'echarts-for-react';
import { storage } from '../utils/storage';
import type { Employee } from '../types';
import './TeamRadar.css';

export default function TeamRadar() {
  const [employees, setEmployees] = useState<Employee[]>([]);

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = () => {
    const data = storage.get<Employee[]>('EMPLOYEES') || [];
    setEmployees(data);
  };

  const calculateTeamAverage = () => {
    if (employees.length === 0) return [0, 0, 0, 0, 0];

    const totals = employees.reduce(
      (acc, emp) => ({
        tech: acc.tech + emp.scores.tech,
        engineering: acc.engineering + emp.scores.engineering,
        uiux: acc.uiux + emp.scores.uiux,
        communication: acc.communication + emp.scores.communication,
        problem: acc.problem + emp.scores.problem
      }),
      { tech: 0, engineering: 0, uiux: 0, communication: 0, problem: 0 }
    );

    return [
      Math.round(totals.tech / employees.length),
      Math.round(totals.engineering / employees.length),
      Math.round(totals.uiux / employees.length),
      Math.round(totals.communication / employees.length),
      Math.round(totals.problem / employees.length)
    ];
  };

  const getRadarOption = () => {
    const teamAvg = calculateTeamAverage();
    const companyAvg = [75, 72, 70, 80, 76];
    const lastQuarter = [73, 70, 68, 78, 74];

    return {
      title: {
        text: '团队能力雷达图',
        left: 'center'
      },
      legend: {
        data: ['当前团队', '上期团队', '公司平均'],
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
            value: teamAvg,
            name: '当前团队',
            areaStyle: { color: 'rgba(24, 144, 255, 0.3)' },
            lineStyle: { color: '#1890FF', width: 2 }
          },
          {
            value: lastQuarter,
            name: '上期团队',
            lineStyle: { color: '#52C41A', type: 'dashed', width: 2 },
            symbol: 'none'
          },
          {
            value: companyAvg,
            name: '公司平均',
            lineStyle: { color: '#FAAD14', type: 'dotted', width: 2 },
            symbol: 'none'
          }
        ]
      }]
    };
  };

  const calculateTeamHealth = () => {
    const avg = calculateTeamAverage();
    const overall = Math.round(avg.reduce((a, b) => a + b, 0) / avg.length);
    return overall;
  };

  const getHealthStatus = (score: number) => {
    if (score >= 80) return { text: '优秀', color: '#52c41a' };
    if (score >= 70) return { text: '健康', color: '#1890ff' };
    if (score >= 60) return { text: '良好', color: '#faad14' };
    return { text: '待提升', color: '#ff4d4f' };
  };

  const teamHealth = calculateTeamHealth();
  const healthStatus = getHealthStatus(teamHealth);

  return (
    <div className="team-radar">
      <div className="page-header">
        <h2>团队能力分析</h2>
        <div className="team-info">
          <span>团队人数: {employees.length}</span>
        </div>
      </div>

      <div className="content-grid">
        <div className="chart-container">
          <ReactECharts option={getRadarOption()} style={{ height: '500px' }} />
        </div>

        <div className="info-panel">
          <div className="info-card">
            <h3>团队健康度</h3>
            <div className="health-score">
              <div className="score-circle" style={{ borderColor: healthStatus.color }}>
                <span className="score">{teamHealth}</span>
                <span className="total">/100</span>
              </div>
              <div className="status" style={{ color: healthStatus.color }}>
                {healthStatus.text}
              </div>
            </div>
          </div>

          <div className="info-card">
            <h3>能力分布</h3>
            <div className="distribution-list">
              {calculateTeamAverage().map((score, index) => {
                const labels = ['技术深度', '工程能力', 'UI/UX能力', '沟通协作', '问题解决'];
                return (
                  <div key={index} className="distribution-item">
                    <span className="label">{labels[index]}</span>
                    <div className="bar-container">
                      <div className="bar" style={{ width: `${score}%` }}>
                        <span className="bar-value">{score}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="info-card">
            <h3>团队成员</h3>
            <div className="member-list">
              {employees.map(emp => (
                <div key={emp.id} className="member-item">
                  <div className="member-info">
                    <span className="name">{emp.name}</span>
                    <span className="rank">{emp.rank}</span>
                  </div>
                  <div className="member-score">
                    {Math.round((emp.scores.tech + emp.scores.engineering + emp.scores.uiux +
                      emp.scores.communication + emp.scores.problem) / 5)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
