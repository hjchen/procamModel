import { useState } from 'react';
import { Form, Input, Button, Card, Typography } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { storage } from '../utils/storage';
import type { User } from '../types';
import { api } from '../services/api';

const { Title } = Typography;

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

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* AI风格装饰元素 */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `
          radial-gradient(circle at 20% 30%, rgba(124, 58, 237, 0.15) 0%, transparent 50%),
          radial-gradient(circle at 80% 70%, rgba(168, 85, 247, 0.15) 0%, transparent 50%)
        `,
        pointerEvents: 'none'
      }} />

      {/* 代码片段装饰 - 左上 */}
      <div style={{
        position: 'absolute',
        top: '8%',
        left: '3%',
        fontSize: '13px',
        fontFamily: 'Consolas, Monaco, monospace',
        color: 'rgba(168, 85, 247, 0.3)',
        lineHeight: '1.8',
        pointerEvents: 'none'
      }}>
        <div>{'import { AI } from "@future/core";'}</div>
        <div>{''}</div>
        <div>{'function analyzeSkills(dev) {'}</div>
        <div>{'  const model = AI.load();'}</div>
        <div>{'  return model.predict(dev);'}</div>
        <div>{'}'}</div>
      </div>

      {/* 代码片段装饰 - 右下 */}
      <div style={{
        position: 'absolute',
        bottom: '12%',
        right: '5%',
        fontSize: '13px',
        fontFamily: 'Consolas, Monaco, monospace',
        color: 'rgba(168, 85, 247, 0.3)',
        lineHeight: '1.8',
        pointerEvents: 'none'
      }}>
        <div>{'const capabilities = {'}</div>
        <div>{'  ai: "GPT-4",'}</div>
        <div>{'  ml: "TensorFlow",'}</div>
        <div>{'  vision: "OpenCV",'}</div>
        <div>{'  nlp: "Transformers"'}</div>
        <div>{'};'}</div>
      </div>

      {/* 代码片段装饰 - 右上 */}
      <div style={{
        position: 'absolute',
        top: '15%',
        right: '8%',
        fontSize: '12px',
        fontFamily: 'Consolas, Monaco, monospace',
        color: 'rgba(196, 181, 253, 0.25)',
        lineHeight: '1.8',
        pointerEvents: 'none'
      }}>
        <div>{'// Neural Network'}</div>
        <div>{'model.compile({'}</div>
        <div>{'  optimizer: "adam",'}</div>
        <div>{'  loss: "categorical"'}</div>
        <div>{'});'}</div>
      </div>

      {/* 代码片段装饰 - 左下 */}
      <div style={{
        position: 'absolute',
        bottom: '20%',
        left: '5%',
        fontSize: '12px',
        fontFamily: 'Consolas, Monaco, monospace',
        color: 'rgba(196, 181, 253, 0.25)',
        lineHeight: '1.8',
        pointerEvents: 'none'
      }}>
        <div>{'interface Developer {'}</div>
        <div>{'  skills: string[];'}</div>
        <div>{'  level: number;'}</div>
        <div>{'  aiScore: float;'}</div>
        <div>{'}'}</div>
      </div>

      {/* 浮动圆点装饰 */}
      <div style={{
        position: 'absolute',
        top: '25%',
        left: '15%',
        width: '6px',
        height: '6px',
        borderRadius: '50%',
        background: 'rgba(168, 85, 247, 0.5)',
        boxShadow: '0 0 20px rgba(168, 85, 247, 0.5)',
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute',
        top: '60%',
        right: '20%',
        width: '4px',
        height: '4px',
        borderRadius: '50%',
        background: 'rgba(196, 181, 253, 0.5)',
        boxShadow: '0 0 15px rgba(196, 181, 253, 0.5)',
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '35%',
        left: '25%',
        width: '5px',
        height: '5px',
        borderRadius: '50%',
        background: 'rgba(124, 58, 237, 0.5)',
        boxShadow: '0 0 18px rgba(124, 58, 237, 0.5)',
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute',
        top: '45%',
        right: '12%',
        width: '4px',
        height: '4px',
        borderRadius: '50%',
        background: 'rgba(168, 85, 247, 0.5)',
        boxShadow: '0 0 16px rgba(168, 85, 247, 0.5)',
        pointerEvents: 'none'
      }} />

      <Card
        style={{
          width: '100%',
          maxWidth: 420,
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
          background: 'rgba(30, 27, 75, 0.85)',
          border: '1px solid rgba(168, 85, 247, 0.3)',
          backdropFilter: 'blur(20px)'
        }}
      >
        <Title level={2} style={{
          textAlign: 'center',
          marginBottom: 32,
          background: 'linear-gradient(135deg, #a855f7 0%, #c084fc 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontWeight: 700
        }}>
          程序员能力模型平台
        </Title>

        <Form
          name="login"
          onFinish={handleSubmit}
          autoComplete="off"
          layout="vertical"
        >
          <Form.Item
            label={<span style={{ color: '#e9d5ff' }}>用户名</span>}
            name="username"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input
              prefix={<UserOutlined style={{ color: '#a78bfa' }} />}
              placeholder="请输入用户名"
              size="large"
              style={{
                background: 'rgba(49, 46, 129, 0.5)',
                border: '1px solid rgba(168, 85, 247, 0.3)',
                color: '#e9d5ff'
              }}
            />
          </Form.Item>

          <Form.Item
            label={<span style={{ color: '#e9d5ff' }}>密码</span>}
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: '#a78bfa' }} />}
              placeholder="请输入密码"
              size="large"
              style={{
                background: 'rgba(49, 46, 129, 0.5)',
                border: '1px solid rgba(168, 85, 247, 0.3)',
                color: '#e9d5ff'
              }}
            />
          </Form.Item>

          {error && (
            <div style={{
              padding: '12px',
              marginBottom: '16px',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              borderRadius: '8px',
              color: '#fca5a5',
              fontSize: '14px'
            }}>
              {error}
            </div>
          )}

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              size="large"
              style={{
                height: '44px',
                fontSize: '16px',
                fontWeight: 600,
                background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
                border: 'none',
                boxShadow: '0 4px 15px rgba(124, 58, 237, 0.4)'
              }}
            >
              登录
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
