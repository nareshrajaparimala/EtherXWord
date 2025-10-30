import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import FormInput from '../../components/FormInput';
import PasswordInput from '../../components/PasswordInput';
import { authService } from '../../services/authService';

const SignIn = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
    }
  }, [location]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      await authService.signin(formData);
      navigate('/');
    } catch (error) {
      setErrors({ submit: error.response?.data?.message || 'Sign in failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">Welcome Back</h1>
          <p className="auth-subtitle">Sign in to your account</p>
        </div>

        {successMessage && (
          <div className="success-message" style={{ textAlign: 'center', marginBottom: '1rem' }}>
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <FormInput
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="you@example.com"
            required
            error={errors.email}
          />

          <PasswordInput
            label="Password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Your account password"
            required
            error={errors.password}
          />

          <div className="form-group">
            <div className="align-checkbox">
              <input
                type="checkbox"
                id="rememberMe"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
                className="checkbox"
              />
              <label htmlFor="rememberMe" className="" style={{ marginBottom: 0 }}>
                Remember me
              </label>
            </div>
          </div>

          {errors.submit && <div className="error-message">{errors.submit}</div>}

          <button 
            type="submit" 
            className={`btn btn-primary ${loading ? 'loading' : ''}`}
            style={{ width: '100%' }}
            disabled={loading}
          >
            {loading ? <span className="spinner"></span> : 'Sign In'}
          </button>
        </form>

        <div className="auth-links" style={{ marginBottom: '1rem' }}>
          <Link to="/forgot-password" className="auth-link">Forgot Password?</Link>
        </div>

        <div className="auth-divider">
          <span>or</span>
        </div>

        <button className="btn btn-google" style={{ width: '100%', display: 'none' }}>
          <span>📧</span> Sign in with Google
        </button>

        <div className="auth-links">
          Don't have an account? <Link to="/signup" className="auth-link">Create Account</Link>
        </div>
      </div>
    </div>
  );
};

export default SignIn;