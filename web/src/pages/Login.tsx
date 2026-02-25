import { useState } from 'react';
import { storage } from '../utils/storage';
import type { User } from '../types';
import { api } from '../services/api';
import './Login.css';

interface LoginProps {
  onLoginSuccess: (user: User) => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.login(username, password);
      localStorage.setItem('token', response.access_token);
      storage.set('CURRENT_USER', response.user);
      onLoginSuccess(response.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : '登录失败');
    } finally {
      setLoading(false);
    }
  };

  const roleDescriptions = [
    { role: '系统管理员', desc: '系统配置、权限管理、数据备份' },
    { role: 'HR管理员', desc: '模型配置、报告查看、人才盘点' },
    { role: '部门管理者', desc: '团队能力查看、发展计划审批' },
    { role: '评估人', desc: '完成对他人的能力评估' },
    { role: '张三', desc: '查看个人报告、制定发展计划' },
    { role: '数据分析师', desc: '深度数据分析、报告导出' }
  ];

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>程序员能力模型平台</h1>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>用户名</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="请输入用户名"
              required
            />
          </div>
          <div className="form-group">
            <label>密码</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="请输入密码"
              required
            />
          </div>
          {error && <div className="error-message">{error}</div>}
          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? '登录中...' : '登录'}
          </button>
        </form>

        <div className="user-hints">
          <h3>测试账号（账号密码相同）：</h3>
          <div className="hints-grid">
            {roleDescriptions.map((item, index) => (
              <div key={index} className="hint-item">
                <strong>{item.role}</strong>
                <span>{item.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
