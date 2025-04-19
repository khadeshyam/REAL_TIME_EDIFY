import React, { useState } from 'react';
import { forgotPassword } from '../../helpers/auth/auth.helper';
import { useNavigate, Link } from 'react-router-dom';
import { useSupplier } from '../../context/supplierContext';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState({ text: '', type: '' });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { darkMode } = useSupplier();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ text: '', type: '' });
        
        try {
            const result = await forgotPassword(email);
            setMessage({
                text: result.message,
                type: result.status === 200 ? 'success' : 'error'
            });
            
            if (result.status === 200) {
                setTimeout(() => navigate('/login'), 3000);
            }
        } catch (error) {
            setMessage({
                text: 'Failed to process request',
                type: 'error'
            });
        }
        setLoading(false);
    };

    return (
        <div className={`container my-5 d-flex justify-content-center align-items-center ${darkMode ? 'text-light bg-dark' : 'text-dark bg-light'}`} style={{ minHeight: '80vh' }}>
            <div className="col-md-8 col-lg-6 col-xl-5 p-5 shadow rounded">
                <h1 className={`display-4 mb-4 text-center ${darkMode ? 'text-light' : 'text-dark'}`}>Forgot Password</h1>
                <form onSubmit={handleSubmit} className="w-100">
                    <div className="form-group mb-4">
                        <label htmlFor="email" className={darkMode ? 'text-light' : 'text-dark'}>Email</label>
                        <input
                            type="email"
                            className="form-control"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            required
                        />
                    </div>
                    <div className="d-grid gap-2 my-3">
                        <button 
                            type="submit" 
                            disabled={loading}
                            className={`btn btn-${darkMode ? 'light' : 'primary'}`}
                        >
                            {loading ? 'Sending...' : 'Send Reset Link'}
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

export default ForgotPassword;
