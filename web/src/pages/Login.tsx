import { useState } from 'react';
import { storage } from '../utils/storage';
import type { User } from '../types';
import './Login.css';

interface LoginProps {
  onLoginSuccess: (user: User) => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const users = storage.get<User[]>('USERS') || [];
    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
      storage.set('CURRENT_USER', user);
      onLoginSuccess(user);
    } else {
      setError('用户名或密码错误');
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
          <button type="submit" className="login-btn">登录</button>
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
