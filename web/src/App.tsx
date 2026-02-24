import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { initDefaultData, storage } from './utils/storage';
import type { User } from './types';
import Login from './pages/Login';
import PositionManagement from './pages/PositionManagement';
import RankConfig from './pages/RankConfig';
import PersonalRadar from './pages/PersonalRadar';
import TeamRadar from './pages/TeamRadar';
import RoleManagement from './pages/RoleManagement';
import RolePermission from './pages/RolePermission';
import './App.css';

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    initDefaultData();
    const user = storage.get<User>('CURRENT_USER');
    if (user) {
      setCurrentUser(user);
    }
  }, []);

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    storage.remove('CURRENT_USER');
    setCurrentUser(null);
  };

  if (!currentUser) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <Router>
      <div className="app">
        <nav className="navbar">
          <div className="nav-brand">程序员能力模型平台</div>
          <div className="nav-links">
            <Link to="/">首页</Link>
            {(currentUser.role === 'admin' || currentUser.role === 'hr') && (
              <>
                <Link to="/positions">岗位管理</Link>
                <Link to="/ranks">职级配置</Link>
                <Link to="/roles">角色管理</Link>
              </>
            )}
            <Link to="/personal">个人能力</Link>
            {(currentUser.role === 'admin' || currentUser.role === 'hr' || currentUser.role === 'manager' || currentUser.role === 'analyst') && (
              <Link to="/team">团队能力</Link>
            )}
          </div>
          <div className="user-info">
            <span>{currentUser.name} ({getRoleName(currentUser.role)})</span>
            <button onClick={handleLogout} className="logout-btn">退出</button>
          </div>
        </nav>

        <div className="main-content">
          <Routes>
            <Route path="/" element={<Home user={currentUser} />} />
            <Route path="/positions" element={<PositionManagement />} />
            <Route path="/ranks" element={<RankConfig />} />
            <Route path="/roles" element={<RoleManagement />} />
            <Route path="/roles/:id" element={<RolePermission />} />
            <Route path="/personal" element={<PersonalRadar />} />
            <Route path="/team" element={<TeamRadar />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

function getRoleName(role: string) {
  const roleMap: Record<string, string> = {
    admin: '系统管理员',
    hr: 'HR管理员',
    manager: '部门管理者',
    evaluator: '评估人',
    employee: '员工',
    analyst: '数据分析师'
  };
  return roleMap[role] || role;
}

function Home({ user }: { user: User }) {
  const getAvailableCards = () => {
    const allCards = [
      { path: '/positions', icon: '🖥️', title: '岗位管理', desc: '配置和管理岗位类型', roles: ['admin', 'hr'] },
      { path: '/ranks', icon: '📊', title: '职级配置', desc: '设置职级体系标准', roles: ['admin', 'hr'] },
      { path: '/roles', icon: '🔒', title: '角色管理', desc: '管理角色和权限配置', roles: ['admin', 'hr'] },
      { path: '/personal', icon: '👤', title: '个人能力', desc: '查看个人能力雷达图', roles: ['admin', 'hr', 'manager', 'evaluator', 'employee', 'analyst'] },
      { path: '/team', icon: '👥', title: '团队能力', desc: '查看团队能力分析', roles: ['admin', 'hr', 'manager', 'analyst'] }
    ];

    return allCards.filter(card => card.roles.includes(user.role));
  };

  return (
    <div className="home">
      <h1>欢迎使用程序员能力模型平台</h1>
      <p className="welcome-text">您好，{user.name}！</p>
      <div className="home-cards">
        {getAvailableCards().map(card => (
          <Link key={card.path} to={card.path} className="card">
            <h3>{card.icon} {card.title}</h3>
            <p>{card.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default App;
