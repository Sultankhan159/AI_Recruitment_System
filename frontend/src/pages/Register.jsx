import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, Briefcase, Loader2, ArrowRight } from 'lucide-react';
import AuthService from '../services/auth.service';

function Register() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('candidate');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await AuthService.register(email, password, firstName, lastName, [role]);
      setSuccess('Registration successful! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message || 
        'Registration failed. Please try again.'
      );
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 py-8">
      {/* Decorative Blur Spheres */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-primary-600/10 blur-[128px]" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 rounded-full bg-primary-400/10 blur-[128px]" />

      <div className="w-full max-w-lg glassmorphism rounded-2xl p-8 shadow-2xl relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex p-3 rounded-xl bg-primary-500/10 text-primary-400 border border-primary-500/20 mb-3 font-semibold text-lg tracking-wider">
            AI-RMS
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white mb-2 font-sans">Create Account</h2>
          <p className="text-dark-400 text-sm">Join the AI Recruitment Management System</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-start animate-pulse">
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm flex items-start">
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-1.5" htmlFor="firstName">
                First Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-dark-500">
                  <User className="h-4 w-4" />
                </div>
                <input
                  id="firstName"
                  type="text"
                  required
                  className="block w-full pl-10 pr-4 py-2.5 bg-dark-900/50 border border-dark-800 rounded-xl text-white placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm"
                  placeholder="John"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-300 mb-1.5" htmlFor="lastName">
                Last Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-dark-500">
                  <User className="h-4 w-4" />
                </div>
                <input
                  id="lastName"
                  type="text"
                  required
                  className="block w-full pl-10 pr-4 py-2.5 bg-dark-900/50 border border-dark-800 rounded-xl text-white placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm"
                  placeholder="Doe"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-300 mb-1.5" htmlFor="email">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-dark-500">
                <Mail className="h-4 w-4" />
              </div>
              <input
                id="email"
                type="email"
                required
                className="block w-full pl-10 pr-4 py-2.5 bg-dark-900/50 border border-dark-800 rounded-xl text-white placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm"
                placeholder="john.doe@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-300 mb-1.5" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-dark-500">
                <Lock className="h-4 w-4" />
              </div>
              <input
                id="password"
                type="password"
                required
                className="block w-full pl-10 pr-4 py-2.5 bg-dark-900/50 border border-dark-800 rounded-xl text-white placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">
              Select Your Role
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label
                className={`flex items-center justify-center p-3 rounded-xl border cursor-pointer transition-all ${
                  role === 'candidate'
                    ? 'border-primary-500 bg-primary-500/10 text-white'
                    : 'border-dark-800 bg-dark-900/30 text-dark-400 hover:border-dark-700'
                }`}
              >
                <input
                  type="radio"
                  name="role"
                  value="candidate"
                  checked={role === 'candidate'}
                  onChange={() => setRole('candidate')}
                  className="sr-only"
                />
                <User className="h-4 w-4 mr-2" />
                <span className="text-sm font-medium">Candidate</span>
              </label>

              <label
                className={`flex items-center justify-center p-3 rounded-xl border cursor-pointer transition-all ${
                  role === 'recruiter'
                    ? 'border-primary-500 bg-primary-500/10 text-white'
                    : 'border-dark-800 bg-dark-900/30 text-dark-400 hover:border-dark-700'
                }`}
              >
                <input
                  type="radio"
                  name="role"
                  value="recruiter"
                  checked={role === 'recruiter'}
                  onChange={() => setRole('recruiter')}
                  className="sr-only"
                />
                <Briefcase className="h-4 w-4 mr-2" />
                <span className="text-sm font-medium">Recruiter</span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="glow-btn w-full py-2.5 px-4 bg-primary-600 hover:bg-primary-500 text-white font-medium rounded-xl flex items-center justify-center space-x-2 shadow-lg shadow-primary-600/25 transition-all text-sm mt-6"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Registering...</span>
              </>
            ) : (
              <>
                <span>Register</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-dark-400">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium transition-colors">
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
