import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Layout, Menu, Avatar, Dropdown, Button } from 'antd';
import { HomeOutlined, TeamOutlined, BarChartOutlined, UserOutlined, SettingOutlined, LogoutOutlined, SafetyOutlined, ApartmentOutlined } from '@ant-design/icons';
import { initDefaultData, storage } from './utils/storage';
import type { User } from './types';
import Login from './pages/Login';
import PositionManagement from './pages/PositionManagement';
import RankConfig from './pages/RankConfig';
import PersonalRadar from './pages/PersonalRadar';
import TeamRadar from './pages/TeamRadar';
import RoleManagement from './pages/RoleManagement';
import RolePermission from './pages/RolePermission';
import DepartmentManagement from './pages/DepartmentManagement';
import './App.css';

const { Header, Sider, Content } = Layout;

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [collapsed, setCollapsed] = useState(false);

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

  const getMenuItems = () => {
    const items = [
      {
        key: '/',
        icon: <HomeOutlined />,
        label: <Link to="/">首页</Link>,
      },
    ];

    if (currentUser.role === 'admin' || currentUser.role === 'hr') {
      items.push(
        {
          key: '/positions',
          icon: <SettingOutlined />,
          label: <Link to="/positions">岗位管理</Link>,
        },
        {
          key: '/ranks',
          icon: <BarChartOutlined />,
          label: <Link to="/ranks">职级配置</Link>,
        },
        {
          key: '/departments',
          icon: <ApartmentOutlined />,
          label: <Link to="/departments">部门管理</Link>,
        },
        {
          key: '/roles',
          icon: <SafetyOutlined />,
          label: <Link to="/roles">角色管理</Link>,
        }
      );
    }

    items.push({
      key: '/personal',
      icon: <UserOutlined />,
      label: <Link to="/personal">个人能力</Link>,
    });

    if (currentUser.role === 'admin' || currentUser.role === 'hr' || currentUser.role === 'manager' || currentUser.role === 'analyst') {
      items.push({
        key: '/team',
        icon: <TeamOutlined />,
        label: <Link to="/team">部门能力</Link>,
      });
    }

    return items;
  };

  const userMenuItems = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout,
    },
  ];

  return (
    <Router>
      <Layout style={{ minHeight: '100vh' }}>
        <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed}>
          <div style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: collapsed ? 14 : 18,
            fontWeight: 'bold',
            padding: '0 16px',
            overflow: 'hidden',
            whiteSpace: 'nowrap'
          }}>
            {collapsed ? '能力' : '程序员能力模型平台'}
          </div>
          <Menu
            theme="dark"
            mode="inline"
            defaultSelectedKeys={['/']}
            items={getMenuItems()}
          />
        </Sider>
        <Layout>
          <Header style={{
            background: '#fff',
            padding: '0 24px',
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center'
          }}>
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Avatar icon={<UserOutlined />} />
                <span>{currentUser.name} ({getRoleName(currentUser.role)})</span>
              </div>
            </Dropdown>
          </Header>
          <Content style={{ margin: '24px 16px', padding: 24, background: '#fff' }}>
            <Routes>
              <Route path="/" element={<Home user={currentUser} />} />
              <Route path="/positions" element={<PositionManagement />} />
              <Route path="/ranks" element={<RankConfig />} />
              <Route path="/departments" element={<DepartmentManagement />} />
              <Route path="/roles" element={<RoleManagement />} />
              <Route path="/roles/:id" element={<RolePermission />} />
              <Route path="/personal" element={<PersonalRadar />} />
              <Route path="/team" element={<TeamRadar />} />
            </Routes>
          </Content>
        </Layout>
      </Layout>
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
      { path: '/positions', icon: <SettingOutlined />, title: '岗位管理', desc: '配置和管理岗位类型', roles: ['admin', 'hr'] },
      { path: '/ranks', icon: <BarChartOutlined />, title: '职级配置', desc: '设置职级体系标准', roles: ['admin', 'hr'] },
      { path: '/departments', icon: <ApartmentOutlined />, title: '部门管理', desc: '管理部门和成员', roles: ['admin', 'hr'] },
      { path: '/roles', icon: <SafetyOutlined />, title: '角色管理', desc: '管理角色和权限配置', roles: ['admin', 'hr'] },
      { path: '/personal', icon: <UserOutlined />, title: '个人能力', desc: '查看个人能力雷达图', roles: ['admin', 'hr', 'manager', 'evaluator', 'employee', 'analyst'] },
      { path: '/team', icon: <TeamOutlined />, title: '部门能力', desc: '查看部门能力分析', roles: ['admin', 'hr', 'manager', 'analyst'] }
    ];

    return allCards.filter(card => card.roles.includes(user.role));
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <h1 style={{ fontSize: 32, marginBottom: 16 }}>欢迎使用程序员能力模型平台</h1>
      <p style={{ fontSize: 18, color: '#666', marginBottom: 48 }}>您好，{user.name}！</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 24 }}>
        {getAvailableCards().map(card => (
          <Link key={card.path} to={card.path} style={{ textDecoration: 'none' }}>
            <div style={{
              background: '#fafafa',
              padding: 32,
              borderRadius: 8,
              border: '1px solid #f0f0f0',
              transition: 'all 0.3s',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>{card.icon}</div>
              <h3 style={{ fontSize: 18, marginBottom: 8, color: '#000' }}>{card.title}</h3>
              <p style={{ color: '#666', margin: 0 }}>{card.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default App;
