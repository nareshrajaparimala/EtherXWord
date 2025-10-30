import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import FormInput from '../../components/FormInput';
import PasswordInput from '../../components/PasswordInput';
import { authService } from '../../services/authService';

const SignUp = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

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

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (!formData.agreeToTerms) newErrors.agreeToTerms = 'You must agree to terms';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      await authService.signup({
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password
      });
      navigate('/signin', { state: { message: 'Account created successfully! Please sign in.' } });
    } catch (error) {
      setErrors({ submit: error.response?.data?.message || 'Registration failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">Join EtherXWord and start creating</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <FormInput
            label="Full Name"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            placeholder="Enter your full name"
            required
            error={errors.fullName}
          />

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
            placeholder="At least 8 characters"
            required
            error={errors.password}
          />

          <PasswordInput
            label="Confirm Password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Re-enter your password"
            required
            error={errors.confirmPassword}
          />

          <div className="form-group">
            <div className="align-checkbox">
              <input
                type="checkbox"
                id="agreeToTerms"
                name="agreeToTerms"
                checked={formData.agreeToTerms}
                onChange={handleChange}
                className="checkbox"
              />
              <label htmlFor="agreeToTerms" className="" style={{ marginBottom: 0 }}>
                I agree to the{' '}
                <button
                  type="button"
                  className="terms-link"
                  onClick={() => setShowTermsModal(true)}
                >
                  Terms of Service
                </button>
              </label>
            </div>
            {errors.agreeToTerms && <div className="error-message">{errors.agreeToTerms}</div>}
          </div>

          {errors.submit && <div className="error-message">{errors.submit}</div>}

          <button 
            type="submit" 
            className={`btn btn-primary ${loading ? 'loading' : ''}`}
            style={{ width: '100%' }}
            disabled={loading}
          >
            {loading ? <span className="spinner"></span> : 'Create Account'}
          </button>
        </form>

        <div className="auth-divider">
          <span>or</span>
        </div>

        <button className="btn btn-google" style={{ width: '100%', display: 'none' }}>
          <span>📧</span> Sign up with Google
        </button>

        <div className="auth-links">
          Already have an account? <Link to="/signin" className="auth-link">Sign In</Link>
        </div>
      </div>
      
      {/* Terms of Service Modal */}
      {showTermsModal && (
        <div className="modal-overlay" onClick={() => setShowTermsModal(false)}>
          <div className="terms-modal" onClick={(e) => e.stopPropagation()}>
            <div className="terms-header">
              <h2>Terms of Service</h2>
              <button 
                className="close-btn"
                onClick={() => setShowTermsModal(false)}
              >
                ×
              </button>
            </div>
            
            <div className="terms-content">
              <h3>1. Acceptance of Terms</h3>
              <p>By accessing and using EtherXWord, you accept and agree to be bound by the terms and provision of this agreement.</p>
              
              <h3>2. Use License</h3>
              <p>Permission is granted to temporarily use EtherXWord for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title.</p>
              
              <h3>3. User Account</h3>
              <p>You are responsible for safeguarding the password and for maintaining the confidentiality of your account. You agree not to disclose your password to any third party.</p>
              
              <h3>4. Privacy Policy</h3>
              <p>Your privacy is important to us. Our Privacy Policy explains how we collect, use, and protect your information when you use our service.</p>
              
              <h3>5. Content Ownership</h3>
              <p>You retain ownership of any content you create using EtherXWord. We do not claim ownership of your documents or data.</p>
              
              <h3>6. Prohibited Uses</h3>
              <p>You may not use EtherXWord for any unlawful purpose or to solicit others to perform unlawful acts. You may not transmit any worms, viruses, or any code of a destructive nature.</p>
              
              <h3>7. Service Availability</h3>
              <p>We strive to keep EtherXWord available 24/7, but we cannot guarantee uninterrupted service. We may need to suspend the service for maintenance or updates.</p>
              
              <h3>8. Limitation of Liability</h3>
              <p>EtherXWord shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the service.</p>
              
              <h3>9. Changes to Terms</h3>
              <p>We reserve the right to modify these terms at any time. We will notify users of any material changes via email or through the service.</p>
              
              <h3>10. Contact Information</h3>
              <p>If you have any questions about these Terms of Service, please contact us at support@etherxword.com</p>
            </div>
            
            <div className="terms-actions">
              <button 
                className="btn btn-secondary"
                onClick={() => setShowTermsModal(false)}
              >
                Back
              </button>
              <button 
                className="btn btn-primary"
                onClick={() => {
                  setFormData(prev => ({ ...prev, agreeToTerms: true }));
                  setShowTermsModal(false);
                }}
              >
                Accept & Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SignUp;