import React, { useState } from 'react';
import { resetPassword } from '../../helpers/auth/auth.helper';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useSupplier } from '../../context/supplierContext';

const ResetPassword = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState({ text: '', type: '' });
    const [loading, setLoading] = useState(false);
    const { token } = useParams();
    const navigate = useNavigate();
    const { darkMode } = useSupplier();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            return setMessage({
                text: 'Passwords do not match',
                type: 'error'
            });
        }

        setLoading(true);
        setMessage({ text: '', type: '' });
        
        try {
            const result = await resetPassword(token, password);
            setMessage({
                text: result.message,
                type: result.status === 200 ? 'success' : 'error'
            });
            
            if (result.status === 200) {
                setTimeout(() => navigate('/login'), 2000);
            }
        } catch (error) {
            setMessage({
                text: 'Password reset failed',
                type: 'error'
            });
        }
        setLoading(false);
    };

    return (
        <div className={`container my-5 d-flex justify-content-center align-items-center ${darkMode ? 'text-light bg-dark' : 'text-dark bg-light'}`} style={{ minHeight: '80vh' }}>
            <div className="col-md-8 col-lg-6 col-xl-5 p-5 shadow rounded">
                <h1 className={`display-4 mb-4 text-center ${darkMode ? 'text-light' : 'text-dark'}`}>Reset Password</h1>
                <form onSubmit={handleSubmit} className="w-100">
                    <div className="form-group mb-4">
                        <label htmlFor="password" className={darkMode ? 'text-light' : 'text-dark'}>New Password</label>
                        <input
                            type="password"
                            className="form-control"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter new password"
                            required
                        />
                    </div>
                    <div className="form-group mb-4">
                        <label htmlFor="confirmPassword" className={darkMode ? 'text-light' : 'text-dark'}>Confirm Password</label>
                        <input
                            type="password"
                            className="form-control"
                            id="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm new password"
                            required
                        />
                    </div>
                    <div className="d-grid gap-2 my-3">
                        <button 
                            type="submit" 
                            disabled={loading}
                            className={`btn btn-${darkMode ? 'light' : 'primary'}`}
                        >
                            {loading ? 'Updating...' : 'Reset Password'}
                        </button>
                    </div>
                </form>

                {message.text && (
                    <div className={`alert alert-${message.type} mt-3`}>
                        {message.type === 'success' ? '✓' : '✗'} {message.text}
                    </div>
                )}

                <hr className={`my-4 ${darkMode ? 'border-light' : 'border-dark'}`} />
                <p className={`text-center ${darkMode ? 'text-light' : 'text-dark'}`}>
                    Remember your password?{' '}
                    <Link to="/login" className={darkMode ? 'text-light' : 'text-primary'}>
                        Login here
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default ResetPassword;
