/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, CheckCircle, Clock, MapPin, 
  Award, Loader2, Sparkles, User, LogOut, FileText, Bell, Trash2
} from 'lucide-react';
import CandidateService from '../services/candidate.service';
import AuthService from '../services/auth.service';

function Applications() {
  const navigate = useNavigate();
  const user = AuthService.getCurrentUser();

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [myApplications, setMyApplications] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const apps = await CandidateService.getApplications();
      setMyApplications(apps);
      
      const interviewList = await CandidateService.getInterviews();
      setInterviews(interviewList);
      
      const notificationList = await CandidateService.getNotifications();
      setNotifications(notificationList);
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to load application history or interview schedule.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleLogout = () => {
    AuthService.logout();
    navigate('/login');
  };

  const handleMarkNotificationAsRead = async (id) => {
    try {
      await CandidateService.markNotificationAsRead(id);
      const notificationList = await CandidateService.getNotifications();
      setNotifications(notificationList);
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  const handleDeleteNotification = async (id) => {
    try {
      await CandidateService.deleteNotification(id);
      const notificationList = await CandidateService.getNotifications();
      setNotifications(notificationList);
    } catch (err) {
      console.error("Failed to delete notification:", err);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

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
          <span className="font-semibold text-lg text-white">My Applications</span>
        </div>

        <div className="flex items-center space-x-6">
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-lg bg-dark-900 border border-dark-800 text-dark-300 hover:text-white hover:border-dark-700 transition-colors cursor-pointer relative flex items-center justify-center"
            >
              <Bell className="h-4.5 w-4.5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-red-500 text-[9px] font-bold text-white flex items-center justify-center animate-pulse border border-dark-950">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 glassmorphism border border-dark-800 rounded-xl shadow-2xl z-50 overflow-hidden">
                <div className="p-3 border-b border-dark-800/60 bg-dark-950/40 flex items-center justify-between">
                  <span className="text-xs font-bold text-white">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="text-[10px] text-primary-400 font-semibold">{unreadCount} unread</span>
                  )}
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-dark-850">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-xs text-dark-500 italic">
                      No notifications yet.
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div key={n.id} className={`p-3 text-left space-y-1.5 transition-colors relative group ${n.isRead ? 'bg-transparent' : 'bg-primary-500/5'}`}>
                        <button
                          onClick={() => handleDeleteNotification(n.id)}
                          className="absolute top-2.5 right-2.5 text-dark-500 hover:text-red-400 opacity-60 hover:opacity-100 transition-all cursor-pointer bg-transparent border-none focus:outline-none"
                          title="Delete notification"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                        <p className="text-xs text-dark-200 leading-normal pr-5">{n.message}</p>
                        <div className="flex items-center justify-between text-[9px]">
                          <span className="text-dark-500">{new Date(n.createdAt).toLocaleString()}</span>
                          {!n.isRead && (
                            <button
                              onClick={() => handleMarkNotificationAsRead(n.id)}
                              className="text-primary-400 hover:text-primary-300 font-bold hover:underline cursor-pointer bg-transparent border-none"
                            >
                              Mark as Read
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

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
      <main className="flex-1 max-w-5xl w-full mx-auto p-6 sm:p-8 space-y-8">
        
        {/* Alerts Block */}
        {(errorMsg || loading) && (
          <div className="space-y-3">
            {loading && (
              <div className="p-3 rounded-xl bg-primary-500/10 border border-primary-500/20 text-primary-400 text-sm flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Fetching applications...</span>
              </div>
            )}
            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {errorMsg}
              </div>
            )}
          </div>
        )}

        <div className="glassmorphism rounded-xl p-6 border border-dark-800 space-y-6">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CheckCircle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Application Status Tracker</h3>
              <p className="text-xs text-dark-400">Keep track of your neural match score and recruiter updates.</p>
            </div>
          </div>

          <div className="space-y-4 pt-2">
            {myApplications.length === 0 ? (
              <div className="text-center py-16 text-xs text-dark-500 italic">
                You haven't submitted any job applications yet. Go to the "Available Jobs" page to apply!
              </div>
            ) : (
              myApplications.map((app) => {
                const appInterviews = interviews.filter(item => item.jobApplicationId === app.id);
                return (
                  <div key={app.id} className="p-5 rounded-xl bg-dark-900/30 border border-dark-850 flex flex-col md:flex-row md:items-center justify-between gap-6 card-hover">
                    
                    {/* Job Details */}
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <h4 className="font-bold text-white text-base leading-snug">{app.jobTitle}</h4>
                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          app.status === 'HIRED' ? 'bg-green-500/20 text-green-400 border border-green-500/20' :
                          app.status === 'REJECTED' ? 'bg-red-500/20 text-red-400 border border-red-500/20' :
                          app.status === 'OFFERED' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20' :
                          app.status === 'INTERVIEWING' ? 'bg-primary-500/20 text-primary-400 border border-primary-500/20' :
                          app.status === 'SCREENING' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/20' :
                          'bg-dark-800 text-dark-400 border border-dark-700'
                        } border`}>
                          {app.status}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-dark-400">
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-3.5 w-3.5" />
                          <span>{app.jobLocation || 'Remote'}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3.5 w-3.5" />
                          <span>Applied: {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : 'N/A'}</span>
                        </div>
                      </div>

                      {app.aiSummary && (
                        <div className="mt-3 p-3 rounded-lg bg-dark-950/40 border border-dark-850/60 text-xs text-dark-300 leading-relaxed font-mono">
                          <div className="flex items-center space-x-1 text-primary-400 font-bold mb-1 uppercase tracking-wider text-[9px]">
                            <Sparkles className="h-3 w-3" />
                            <span>AI Assessment Summary</span>
                          </div>
                          {app.aiSummary}
                        </div>
                      )}

                      {/* Scheduled Interviews */}
                      {appInterviews.length > 0 && (
                        <div className="mt-4 pt-3 border-t border-dark-800/60 space-y-3">
                          <div className="flex items-center space-x-2 text-primary-400 font-bold uppercase tracking-wider text-[9px]">
                            <Clock className="h-3.5 w-3.5" />
                            <span>Scheduled Interviews</span>
                          </div>
                          <div className="space-y-3">
                            {appInterviews.map((item) => (
                              <div key={item.id} className="p-3.5 rounded-xl bg-dark-950/40 border border-dark-850 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="space-y-1">
                                  <div className="flex items-center space-x-2">
                                    <h5 className="text-xs font-bold text-white">{item.title}</h5>
                                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold border ${
                                      item.status === 'SCHEDULED' 
                                        ? 'bg-primary-500/10 text-primary-400 border-primary-500/20' 
                                        : item.status === 'COMPLETED' 
                                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                                          : 'bg-red-500/10 text-red-400 border-red-500/20'
                                    }`}>
                                      {item.status}
                                    </span>
                                  </div>
                                  <p className="text-[10px] text-dark-400">
                                    Time: {new Date(item.scheduledAt).toLocaleString()} ({item.durationMinutes} mins)
                                  </p>
                                  {item.notes && (
                                    <p className="text-[10px] text-dark-400 italic">Notes: {item.notes}</p>
                                  )}
                                </div>
                                
                                {item.status === 'SCHEDULED' && item.location && (
                                  <a
                                    href={item.location.startsWith('http') ? item.location : `https://${item.location}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="px-3.5 py-1.5 bg-primary-600 hover:bg-primary-500 text-white text-[11px] font-bold rounded-lg transition-colors flex items-center justify-center space-x-1 cursor-pointer w-full sm:w-auto text-center"
                                  >
                                    <span>Join Interview</span>
                                  </a>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Match Score & Actions */}
                    <div className="flex flex-row md:flex-col items-center justify-between md:justify-center gap-4 border-t md:border-t-0 md:border-l border-dark-850 pt-4 md:pt-0 md:pl-6 text-center">
                      <div className="space-y-1">
                        <span className="text-[10px] uppercase font-bold text-dark-500 tracking-wider block">Neural Match</span>
                        <div className="flex items-center space-x-1.5 justify-center">
                          <Award className="h-4 w-4 text-primary-400" />
                          <span className={`text-lg font-extrabold ${app.matchScore !== null ? 'text-primary-400' : 'text-dark-500 italic text-sm'}`}>
                            {app.matchScore !== null ? `${Math.round(app.matchScore)}%` : 'Pending'}
                          </span>
                        </div>
                      </div>

                      {app.resumeUrl && (
                        <a 
                          href={app.resumeUrl} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="py-1.5 px-3 rounded-lg bg-dark-900 border border-dark-800 text-dark-300 hover:text-white hover:border-dark-700 transition-colors text-xs font-semibold flex items-center space-x-1"
                        >
                          <FileText className="h-3.5 w-3.5" />
                          <span>View Resume</span>
                        </a>
                      )}
                    </div>

                  </div>
                );
              })
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default Applications;
