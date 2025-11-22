import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import OtpInput from '../../components/OtpInput';
import { authService } from '../../services/authService';

const VerifyOtp = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email] = useState(location.state?.email || '');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (!email) {
      navigate('/forgot-password');
      return;
    }

    const timer = setInterval(() => {
      setResendTimer(prev => {
        if (prev <= 1) {
          setCanResend(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [email, navigate]);

  const handleOtpComplete = async (otpValue) => {
    setOtp(otpValue);
    setLoading(true);
    setError('');

    try {
      const response = await authService.verifyOtp(email, otpValue);
      navigate('/reset-password', { 
        state: { resetToken: response.resetToken, email } 
      });
    } catch (error) {
      setError(error.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    
    setLoading(true);
    try {
      await authService.forgotPassword(email);
      setCanResend(false);
      setResendTimer(60);
      setError('');
      
      const timer = setInterval(() => {
        setResendTimer(prev => {
          if (prev <= 1) {
            setCanResend(true);
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      setError('Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">Verify OTP</h1>
          <p className="auth-subtitle">
            Enter the 6-digit code sent to<br />
            <strong>{email}</strong>
          </p>
        </div>

        <div className="auth-form">
          <OtpInput 
            length={6}
            onComplete={handleOtpComplete}
            error={error}
          />

          {loading && (
            <div style={{ textAlign: 'center', margin: '1rem 0' }}>
              <span className="spinner"></span>
            </div>
          )}

          <div className="resend-timer">
            {canResend ? (
              <button 
                onClick={handleResend}
                className="auth-link"
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                disabled={loading}
              >
                Resend OTP
              </button>
            ) : (
              <span>Resend OTP in {resendTimer}s</span>
            )}
          </div>
        </div>

        <div className="auth-links">
          <Link to="/forgot-password" className="auth-link">← Back to Email</Link>
        </div>
      </div>
    </div>
  );
};

export default VerifyOtp;