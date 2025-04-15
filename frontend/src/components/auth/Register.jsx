import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { useAuth } from '../../context/AuthContext';

const Register = ({ toast }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.current.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Passwords do not match',
        life: 3000
      });
      return;
    }
    
    setLoading(true);
    
    try {
      const result = await register({ username, password });
      
      if (result.success) {
        toast.current.show({
          severity: 'success',
          summary: 'Success',
          detail: 'Registered successfully',
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
        <Card title="Register" className="shadow-4">
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
                toggleMask
                required
                className="w-full"
              />
            </div>
            
            <div className="field mb-4">
              <label htmlFor="confirmPassword" className="block mb-2">Confirm Password</label>
              <Password
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                feedback={false}
                toggleMask
                required
                className="w-full"
              />
            </div>
            
            <Button
              type="submit"
              label="Register"
              icon="pi pi-user-plus"
              className="mt-3"
              loading={loading}
            />
            
            <div className="mt-4 text-center">
              <p>Already have an account? <Link to="/login">Login</Link></p>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Register;