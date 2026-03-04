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
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-800 to-violet-900 flex items-center justify-center p-5">
      <Card className="w-[600px] max-w-md shadow-2xl bg-white/10 border border-violet-400/20 backdrop-blur-xl drop-shadow-2xl">
        <Title level={2} className="text-center mb-8 bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent font-bold">
          程序员能力模型平台
        </Title>

        <Form
          name="login"
          onFinish={handleSubmit}
          autoComplete="off"
          layout="vertical"
        >
          <Form.Item
            label={<span className="text-violet-200">用户名</span>}
            name="username"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input
              prefix={<UserOutlined className="text-violet-300" />}
              placeholder="请输入用户名"
              size="large"
              className="bg-purple-900/30 border-violet-400/30 text-violet-100 placeholder:text-violet-300/60"
            />
          </Form.Item>

          <Form.Item
            label={<span className="text-violet-200">密码</span>}
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password
              prefix={<LockOutlined className="text-violet-300" />}
              placeholder="请输入密码"
              size="large"
              className="bg-purple-900/30 border-violet-400/30 text-violet-100 placeholder:text-violet-300/60"
            />
          </Form.Item>

          {error && (
            <div className="p-3 mb-4 bg-red-500/15 border border-red-500/40 rounded-lg text-red-300 text-sm">
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
              className="h-11 text-base font-semibold bg-gradient-to-r from-violet-600 to-violet-500 border-none shadow-[0_4px_15px_rgba(124,58,237,0.4)] hover:from-violet-700 hover:to-violet-600"
            >
              登录
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}