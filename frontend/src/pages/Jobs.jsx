/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Briefcase, Calendar, MapPin, 
  DollarSign, Check, Loader2, Sparkles, User, LogOut
} from 'lucide-react';
import CandidateService from '../services/candidate.service';
import AuthService from '../services/auth.service';

function Jobs() {
  const navigate = useNavigate();
  const user = AuthService.getCurrentUser();

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [jobs, setJobs] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [jobIdInput, setJobIdInput] = useState('');

  const loadData = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const openJobs = await CandidateService.getJobs();
      setJobs(openJobs);
      const apps = await CandidateService.getApplications();
      setMyApplications(apps);
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to load job listings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApplyDirect = async (jobId) => {
    setLoading(true);
    setSuccessMsg('');
    setErrorMsg('');
    try {
      const res = await CandidateService.applyForJob(jobId);
      setSuccessMsg(res.message || 'Application submitted successfully!');
      await loadData();
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.error || 'Failed to submit application.');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyById = async (e) => {
    e.preventDefault();
    if (!jobIdInput) return;
    setLoading(true);
    setSuccessMsg('');
    setErrorMsg('');
    try {
      const res = await CandidateService.applyForJob(jobIdInput);
      setSuccessMsg(res.message || 'Application submitted successfully!');
      setJobIdInput('');
      await loadData();
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.error || 'Failed to submit application.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    AuthService.logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-dark-950 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 glassmorphism border-b border-dark-800/60 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => navigate('/dashboard')}
            className="p-2 rounded-lg bg-dark-900 border border-dark-800 text-dark-300 hover:text-white hover:border-dark-700 transition-colors mr-2 cursor-pointer flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            <span className="text-xs font-semibold">Dashboard</span>
          </button>
          <span className="font-semibold text-lg text-white">Available Jobs</span>
        </div>

        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-full bg-primary-500/20 text-primary-400 flex items-center justify-center border border-primary-500/30">
              <User className="h-4 w-4" />
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-sm font-semibold text-white leading-tight">
                {user?.firstName} {user?.lastName}
              </div>
              <div className="text-[10px] uppercase font-bold text-primary-400 tracking-wider">
                Candidate
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center text-sm font-medium text-dark-400 hover:text-red-400 transition-colors py-1.5 px-3 rounded-lg hover:bg-red-500/10 border border-transparent hover:border-red-500/10 cursor-pointer"
          >
            <LogOut className="h-4 w-4 mr-2" />
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 sm:p-8 space-y-8">
        
        {/* Alerts Block */}
        {(successMsg || errorMsg || loading) && (
          <div className="space-y-3">
            {loading && (
              <div className="p-3 rounded-xl bg-primary-500/10 border border-primary-500/20 text-primary-400 text-sm flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Processing request...</span>
              </div>
            )}
            {successMsg && (
              <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm">
                {successMsg}
              </div>
            )}
            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {errorMsg}
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Left Panel: Filter/Apply by ID */}
          <div className="lg:col-span-1 space-y-6">
            <div className="glassmorphism rounded-xl p-6 border border-dark-800 space-y-4">
              <div className="flex items-center space-x-2 text-primary-400 text-xs font-semibold tracking-wider uppercase">
                <Sparkles className="h-4 w-4" />
                <span>Direct Apply</span>
              </div>
              <h3 className="text-lg font-bold text-white">Apply by Job ID</h3>
              <p className="text-xs text-dark-400 leading-relaxed">
                If you have a direct job code from a recruiter, submit it below.
              </p>
              <form onSubmit={handleApplyById} className="space-y-4 pt-2">
                <div>
                  <label htmlFor="jobId" className="block text-xs font-medium text-dark-300 mb-1">
                    Job Identification Code
                  </label>
                  <input
                    id="jobId"
                    type="text"
                    required
                    placeholder="Enter Job ID (e.g. 1)"
                    className="block w-full px-3 py-2.5 bg-dark-900/50 border border-dark-800 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-transparent transition-all"
                    value={jobIdInput}
                    onChange={(e) => setJobIdInput(e.target.value)}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="glow-btn py-2.5 px-4 bg-primary-600 hover:bg-primary-500 text-white font-medium rounded-xl text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer w-full"
                >
                  <span>Submit Application</span>
                </button>
              </form>
            </div>
            
            <div className="glassmorphism rounded-xl p-6 border border-dark-800 space-y-2 text-xs text-dark-400">
              <h4 className="font-bold text-white mb-1 uppercase tracking-wider text-[10px]">Tips for applying</h4>
              <p>1. Make sure your profile experience is updated before applying.</p>
              <p className="mt-2">2. Uploading a resume link under basic info increases recruiter visibility.</p>
            </div>
          </div>

          {/* Right Panel: Jobs Grid */}
          <div className="lg:col-span-3 space-y-6">
            <div className="glassmorphism rounded-xl p-6 border border-dark-800 space-y-4">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-lg bg-primary-500/10 text-primary-400 border border-primary-500/20">
                  <Briefcase className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Active Openings</h3>
                  <p className="text-xs text-dark-400">Showing {jobs.length} open opportunities.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                {jobs.length === 0 ? (
                  <div className="text-center py-12 text-xs text-dark-500 italic md:col-span-2">
                    No active job listings are currently available. Check back soon!
                  </div>
                ) : (
                  jobs.map((job) => {
                    const hasApplied = myApplications.some(app => app.jobId === job.id);
                    return (
                      <div key={job.id} className="p-5 rounded-xl bg-dark-900/30 border border-dark-850 flex flex-col justify-between space-y-4 card-hover">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h4 className="font-bold text-white text-base leading-snug">{job.title}</h4>
                              <div className="flex items-center space-x-1.5 text-xs text-primary-400 mt-1">
                                <MapPin className="h-3.5 w-3.5" />
                                <span>{job.location || 'Remote'}</span>
                              </div>
                            </div>
                            <span className="text-[10px] text-dark-500 font-mono bg-dark-900/80 px-2 py-1 rounded border border-dark-800/60">
                              ID: {job.id}
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-2 text-xs">
                            {job.salary && (
                              <div className="flex items-center space-x-1 text-emerald-400 font-bold bg-emerald-500/5 px-2.5 py-1 rounded border border-emerald-500/10">
                                <DollarSign className="h-3 w-3" />
                                <span>{job.salary}</span>
                              </div>
                            )}
                            <div className="flex items-center space-x-1 text-dark-400 bg-dark-900/50 px-2.5 py-1 rounded border border-dark-800">
                              <Calendar className="h-3 w-3" />
                              <span>Posted recently</span>
                            </div>
                          </div>

                          <div className="space-y-1">
                            <span className="text-[10px] uppercase font-bold text-dark-500 tracking-wider">Description:</span>
                            <p className="text-xs text-dark-300 leading-relaxed line-clamp-3">
                              {job.description}
                            </p>
                          </div>

                          {job.requirements && (
                            <div className="space-y-1">
                              <span className="text-[10px] uppercase font-bold text-dark-500 tracking-wider">Required Skills:</span>
                              <p className="text-xs text-dark-400 leading-relaxed line-clamp-2">
                                {job.requirements}
                              </p>
                            </div>
                          )}
                        </div>

                        <button
                          onClick={() => handleApplyDirect(job.id)}
                          disabled={loading || hasApplied}
                          className={`py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center transition-all w-full cursor-pointer ${
                            hasApplied
                              ? 'bg-dark-800 text-dark-500 border border-dark-750 cursor-not-allowed'
                              : 'bg-primary-600 hover:bg-primary-500 text-white border border-transparent glow-btn'
                          }`}
                        >
                          {hasApplied ? (
                            <span className="flex items-center space-x-1.5">
                              <Check className="h-4 w-4" />
                              <span>Applied</span>
                            </span>
                          ) : (
                            <span>Apply to Position</span>
                          )}
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Jobs;
