import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { useAuth } from '../../context/AuthContext';

const Login = ({ toast }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const result = await login({ username, password });
      
      if (result.success) {
        toast.current.show({
          severity: 'success',
          summary: 'Success',
          detail: 'Logged in successfully',
          life: 3000
        });
        navigate('/todos');
      } else {
        toast.current.show({
          severity: 'error',
          summary: 'Error',
          detail: result.message,
          life: 3000
        });
      }
    } catch (error) {
      toast.current.show({
        severity: 'error',
        summary: 'Error',
        detail: 'An unexpected error occurred',
        life: 3000
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex align-items-center justify-content-center min-h-screen">
      <div className="w-full md:w-5 lg:w-3">
        <Card title="Login" className="shadow-4">
          <form onSubmit={handleSubmit} className="p-fluid">
            <div className="field mb-4">
              <label htmlFor="username" className="block mb-2">Username</label>
              <InputText
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full"
              />
            </div>
            
            <div className="field mb-4">
              <label htmlFor="password" className="block mb-2">Password</label>
              <Password
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                feedback={false}
                toggleMask
                required
                className="w-full"
              />
            </div>
            
            <Button
              type="submit"
              label="Login"
              icon="pi pi-sign-in"
              className="mt-3"
              loading={loading}
            />
            
            <div className="mt-4 text-center">
              <p>Don't have an account? <Link to="/register">Register</Link></p>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Login;