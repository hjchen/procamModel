import { useState } from 'react';
import { Form, Input, Button, Card, Typography, Row, Col, Alert, Descriptions } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { storage } from '../utils/storage';
import type { User } from '../types';
import { api } from '../services/api';

const { Title, Text } = Typography;

interface LoginProps {
  onLoginSuccess: (user: User) => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: { username: string; password: string }) => {
    setError('');
    setLoading(true);

    try {
      const response = await api.login(values.username, values.password);
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
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <Card
        style={{
          width: '100%',
          maxWidth: 900,
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
        }}
      >
        <Title level={2} style={{ textAlign: 'center', marginBottom: 32 }}>
          程序员能力模型平台
        </Title>

        <Row gutter={32}>
          <Col xs={24} md={12}>
            <Form
              name="login"
              onFinish={handleSubmit}
              autoComplete="off"
              layout="vertical"
            >
              <Form.Item
                label="用户名"
                name="username"
                rules={[{ required: true, message: '请输入用户名' }]}
              >
                <Input
                  prefix={<UserOutlined />}
                  placeholder="请输入用户名"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                label="密码"
                name="password"
                rules={[{ required: true, message: '请输入密码' }]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="请输入密码"
                  size="large"
                />
              </Form.Item>

              {error && (
                <Form.Item>
                  <Alert message={error} type="error" showIcon />
                </Form.Item>
              )}

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  block
                  size="large"
                >
                  登录
                </Button>
              </Form.Item>
            </Form>
          </Col>

          <Col xs={24} md={12}>
            <Card
              type="inner"
              title="测试账号（账号密码相同）"
              size="small"
            >
              <Descriptions column={1} size="small">
                {roleDescriptions.map((item, index) => (
                  <Descriptions.Item
                    key={index}
                    label={<Text strong>{item.role}</Text>}
                  >
                    {item.desc}
                  </Descriptions.Item>
                ))}
              </Descriptions>
            </Card>
          </Col>
        </Row>
      </Card>
    </div>
  );
}
