import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth, User } from '../../contexts/AuthContext';
import styles from './Login.module.css';

interface LoginCredentials {
  email: string;
  password: string;
}

const Login: React.FC = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // 既にログイン済みの場合はダッシュボードにリダイレクト
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  // モックユーザーデータ
  const mockUsers: User[] = [
    { id: '1', email: 'user@example.com', name: '田中太郎', role: 'user' },
    { id: '2', email: 'admin@example.com', name: '管理者', role: 'admin' },
    { id: '3', email: 'demo@demo.com', name: 'デモユーザー', role: 'user' }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleRegisterInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRegisterData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // バリデーション
      if (!credentials.email || !credentials.password) {
        setError('メールアドレスとパスワードを入力してください。');
        return;
      }

      // モック認証処理
      await new Promise(resolve => setTimeout(resolve, 1000)); // 1秒待機

      // ユーザー検証
      const user = mockUsers.find(u => u.email === credentials.email);
      if (!user || credentials.password !== 'password123') {
        setError('メールアドレスまたはパスワードが間違っています。');
        return;
      }

      // ログイン成功
      login(user);
      
      // リダイレクト先を決定
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
      
    } catch (err) {
      setError('ログインに失敗しました。もう一度お試しください。');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // バリデーション
      if (!registerData.name || !registerData.email || !registerData.password || !registerData.confirmPassword) {
        setError('すべての項目を入力してください。');
        return;
      }

      if (registerData.password !== registerData.confirmPassword) {
        setError('パスワードが一致しません。');
        return;
      }

      if (registerData.password.length < 6) {
        setError('パスワードは6文字以上で入力してください。');
        return;
      }

      // 既存ユーザーチェック
      const existingUser = mockUsers.find(u => u.email === registerData.email);
      if (existingUser) {
        setError('このメールアドレスは既に登録されています。');
        return;
      }

      // モック登録処理
      await new Promise(resolve => setTimeout(resolve, 1000)); // 1秒待機

      // 新規ユーザー作成
      const newUser: User = {
        id: Date.now().toString(),
        email: registerData.email,
        name: registerData.name,
        role: 'user'
      };

      // ログイン状態にする
      login(newUser);
      
      // リダイレクト先を決定
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
      
    } catch (err) {
      setError('登録に失敗しました。もう一度お試しください。');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = () => {
    const demoUser = mockUsers.find(u => u.email === 'demo@demo.com');
    if (demoUser) {
      login(demoUser);
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginCard}>
        <div className={styles.loginHeader}>
          <h1>SafeRoute</h1>
          <p>避難経路共有アプリケーション</p>
        </div>

        {!isRegisterMode ? (
          // ログインフォーム
          <form onSubmit={handleLogin} className={styles.loginForm}>
            <h2>ログイン</h2>
            
            {error && <div className={styles.errorMessage}>{error}</div>}
            
            <div className={styles.formGroup}>
              <label htmlFor="email">メールアドレス</label>
              <input
                type="email"
                id="email"
                name="email"
                value={credentials.email}
                onChange={handleInputChange}
                className={styles.input}
                placeholder="例: user@example.com"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="password">パスワード</label>
              <input
                type="password"
                id="password"
                name="password"
                value={credentials.password}
                onChange={handleInputChange}
                className={styles.input}
                placeholder="パスワードを入力"
                required
              />
            </div>

            <button 
              type="submit" 
              className={styles.loginButton}
              disabled={isLoading}
            >
              {isLoading ? 'ログイン中...' : 'ログイン'}
            </button>

            <div className={styles.divider}>または</div>

            <button 
              type="button" 
              onClick={handleDemoLogin}
              className={styles.demoButton}
            >
              デモユーザーでログイン
            </button>

            <div className={styles.switchMode}>
              <p>
                アカウントをお持ちでない方は{' '}
                <button 
                  type="button" 
                  onClick={() => setIsRegisterMode(true)}
                  className={styles.linkButton}
                >
                  新規登録
                </button>
              </p>
            </div>
          </form>
        ) : (
          // 新規登録フォーム
          <form onSubmit={handleRegister} className={styles.loginForm}>
            <h2>新規登録</h2>
            
            {error && <div className={styles.errorMessage}>{error}</div>}
            
            <div className={styles.formGroup}>
              <label htmlFor="name">お名前</label>
              <input
                type="text"
                id="name"
                name="name"
                value={registerData.name}
                onChange={handleRegisterInputChange}
                className={styles.input}
                placeholder="例: 田中太郎"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="email">メールアドレス</label>
              <input
                type="email"
                id="email"
                name="email"
                value={registerData.email}
                onChange={handleRegisterInputChange}
                className={styles.input}
                placeholder="例: user@example.com"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="password">パスワード</label>
              <input
                type="password"
                id="password"
                name="password"
                value={registerData.password}
                onChange={handleRegisterInputChange}
                className={styles.input}
                placeholder="6文字以上で入力"
                required
                minLength={6}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="confirmPassword">パスワード（確認）</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={registerData.confirmPassword}
                onChange={handleRegisterInputChange}
                className={styles.input}
                placeholder="パスワードを再入力"
                required
                minLength={6}
              />
            </div>

            <button 
              type="submit" 
              className={styles.loginButton}
              disabled={isLoading}
            >
              {isLoading ? '登録中...' : '新規登録'}
            </button>

            <div className={styles.switchMode}>
              <p>
                既にアカウントをお持ちの方は{' '}
                <button 
                  type="button" 
                  onClick={() => setIsRegisterMode(false)}
                  className={styles.linkButton}
                >
                  ログイン
                </button>
              </p>
            </div>
          </form>
        )}

        <div className={styles.demoInfo}>
          <h3>デモアカウント情報</h3>
          <p>メールアドレス: user@example.com</p>
          <p>パスワード: password123</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
