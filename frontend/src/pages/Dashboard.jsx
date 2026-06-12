/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LogOut, User, Cpu, CheckCircle, 
  Sparkles, ListCollapse, Award,
  Shield, Server, Loader2, PlusCircle, Trash2, Edit2, Briefcase, GraduationCap, X, Bell,
  TrendingUp, Users, BarChart3
} from 'lucide-react';
import AuthService from '../services/auth.service';
import CandidateService from '../services/candidate.service';
import RecruiterService from '../services/recruiter.service';
import AdminService from '../services/admin.service';

function Dashboard() {
  const navigate = useNavigate();
  const user = AuthService.getCurrentUser();

  // Role Checks
  const isRecruiter = user?.roles?.includes('ROLE_RECRUITER');
  const isAdmin = user?.roles?.includes('ROLE_ADMIN');
  const isCandidate = !isRecruiter && !isAdmin;

  // General States
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [uploadingResume, setUploadingResume] = useState(false);
  const [expandedSummaries, setExpandedSummaries] = useState({});

  const toggleSummary = (idx) => {
    setExpandedSummaries(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  const getResumeDownloadUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `http://localhost:8080${path}`;
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setErrorMsg('Please select a valid PDF file.');
      return;
    }

    setUploadingResume(true);
    setSuccessMsg('');
    setErrorMsg('');
    try {
      const result = await CandidateService.uploadResume(file);
      setSuccessMsg('Resume uploaded and profile details parsed successfully by AI!');
      if (result.profile) {
        setProfileData(result.profile);
        setBasicPhone(result.profile.phone || '');
        setBasicSummary(result.profile.summary || '');
        setBasicResumeUrl(result.profile.resumeUrl || '');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.error || 'Failed to upload and parse resume.');
    } finally {
      setUploadingResume(false);
    }
  };

  // Role-Specific Data States
  const [candidates, setCandidates] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [systemStats, setSystemStats] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [recommendations, setRecommendations] = useState([]);

  // Recruiter Interview States
  const [expandedInterviews, setExpandedInterviews] = useState({});
  const [interviews, setInterviews] = useState({});
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedApplicationId, setSelectedApplicationId] = useState(null);

  // Notification States
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  // Interview Form States
  const [interviewTitle, setInterviewTitle] = useState('Technical Interview');
  const [interviewDate, setInterviewDate] = useState('');
  const [interviewDuration, setInterviewDuration] = useState(45);
  const [interviewLocation, setInterviewLocation] = useState('');
  const [interviewNotes, setInterviewNotes] = useState('');

  // Input States
  const [jobTitleInput, setJobTitleInput] = useState('');
  const [jobDescInput, setJobDescInput] = useState('');
  const [jobReqsInput, setJobReqsInput] = useState('');
  const [jobLocInput, setJobLocInput] = useState('');
  const [jobSalaryInput, setJobSalaryInput] = useState('');

  // Profile Editor States
  const [editingBasic, setEditingBasic] = useState(false);
  const [basicPhone, setBasicPhone] = useState('');
  const [basicSummary, setBasicSummary] = useState('');
  const [basicResumeUrl, setBasicResumeUrl] = useState('');

  // Education Editor States
  const [showEduForm, setShowEduForm] = useState(false);
  const [eduId, setEduId] = useState(null); // null = add, ID = edit
  const [eduInstitution, setEduInstitution] = useState('');
  const [eduDegree, setEduDegree] = useState('');
  const [eduFieldOfStudy, setEduFieldOfStudy] = useState('');
  const [eduStartDate, setEduStartDate] = useState('');
  const [eduEndDate, setEduEndDate] = useState('');
  const [eduGrade, setEduGrade] = useState('');

  // Experience Editor States
  const [showExpForm, setShowExpForm] = useState(false);
  const [expId, setExpId] = useState(null);
  const [expCompany, setExpCompany] = useState('');
  const [expTitle, setExpTitle] = useState('');
  const [expLocation, setExpLocation] = useState('');
  const [expStartDate, setExpStartDate] = useState('');
  const [expEndDate, setExpEndDate] = useState('');
  const [expCurrent, setExpCurrent] = useState(false);
  const [expDescription, setExpDescription] = useState('');

  // Skill Editor States
  const [showSkillForm, setShowSkillForm] = useState(false);
  const [skillName, setSkillName] = useState('');
  const [skillLevel, setSkillLevel] = useState('Intermediate');

  // Certification Editor States
  const [showCertForm, setShowCertForm] = useState(false);
  const [certId, setCertId] = useState(null);
  const [certName, setCertName] = useState('');
  const [certOrg, setCertOrg] = useState('');
  const [certIssueDate, setCertIssueDate] = useState('');
  const [certExpDate, setCertExpDate] = useState('');
  const [certCredId, setCertCredId] = useState('');
  const [certCredUrl, setCertCredUrl] = useState('');

  // Logout Handler
  const handleLogout = () => {
    AuthService.logout();
    navigate('/login');
  };

  // Load Initial Role-Specific Data
  const loadData = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      if (isCandidate) {
        const profile = await CandidateService.getProfile();
        setProfileData(profile);
        const notificationList = await CandidateService.getNotifications();
        setNotifications(notificationList);
        try {
          const recList = await CandidateService.getRecommendations();
          setRecommendations(recList);
        } catch (err) {
          console.error("Failed to load recommendations:", err);
        }
      } else if (isRecruiter) {
        const candList = await RecruiterService.getCandidates();
        setCandidates(candList);
        try {
          const analytics = await RecruiterService.getAnalytics();
          setAnalyticsData(analytics);
        } catch (err) {
          console.error("Failed to load recruiter analytics:", err);
        }
      } else if (isAdmin) {
        const stats = await AdminService.getSystemStats();
        const list = await AdminService.getAllUsers();
        setSystemStats(stats);
        setUsersList(list);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to load portal data from backend.');
    } finally {
      setLoading(false);
    }
  };

  const handleInstantApply = async (jobId) => {
    setLoading(true);
    setSuccessMsg('');
    setErrorMsg('');
    try {
      const result = await CandidateService.applyForJob(jobId);
      setSuccessMsg(result.message || 'Successfully applied to job!');
      
      // Update recommendations and profile in real-time
      const recList = await CandidateService.getRecommendations();
      setRecommendations(recList);
      
      const profile = await CandidateService.getProfile();
      setProfileData(profile);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.error || 'Failed to apply for job.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [isCandidate, isRecruiter, isAdmin]);

  // Sync profile data to local input states when loaded
  useEffect(() => {
    if (profileData) {
      setBasicPhone(profileData.phone || '');
      setBasicSummary(profileData.summary || '');
      setBasicResumeUrl(profileData.resumeUrl || '');
    }
  }, [profileData]);

  // Candidate application handlers moved to Jobs.jsx and Applications.jsx

  // Candidate: Basic Profile update
  const handleUpdateBasic = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg('');
    setErrorMsg('');
    try {
      await CandidateService.updateProfile({
        phone: basicPhone,
        summary: basicSummary,
        resumeUrl: basicResumeUrl
      });
      const updated = await CandidateService.getProfile();
      setProfileData(updated);
      setEditingBasic(false);
      setSuccessMsg('Profile details successfully updated.');
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to update basic profile details.');
    } finally {
      setLoading(false);
    }
  };

  // Candidate: Education Form Reset
  const resetEduForm = () => {
    setEduId(null);
    setEduInstitution('');
    setEduDegree('');
    setEduFieldOfStudy('');
    setEduStartDate('');
    setEduEndDate('');
    setEduGrade('');
  };

  // Candidate: Save Education
  const handleSaveEducation = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg('');
    setErrorMsg('');
    try {
      const payload = {
        institution: eduInstitution,
        degree: eduDegree,
        fieldOfStudy: eduFieldOfStudy,
        startDate: eduStartDate || null,
        endDate: eduEndDate || null,
        grade: eduGrade
      };
      if (eduId) {
        await CandidateService.updateEducation(eduId, payload);
      } else {
        await CandidateService.addEducation(payload);
      }
      const updated = await CandidateService.getProfile();
      setProfileData(updated);
      setShowEduForm(false);
      resetEduForm();
      setSuccessMsg('Education record saved.');
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to save education record.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditEducation = (edu) => {
    setEduId(edu.id);
    setEduInstitution(edu.institution || '');
    setEduDegree(edu.degree || '');
    setEduFieldOfStudy(edu.fieldOfStudy || '');
    setEduStartDate(edu.startDate || '');
    setEduEndDate(edu.endDate || '');
    setEduGrade(edu.grade || '');
    setShowEduForm(true);
  };

  const handleDeleteEducation = async (id) => {
    if (!window.confirm('Are you sure you want to delete this education entry?')) return;
    setLoading(true);
    setSuccessMsg('');
    setErrorMsg('');
    try {
      await CandidateService.deleteEducation(id);
      const updated = await CandidateService.getProfile();
      setProfileData(updated);
      setSuccessMsg('Education record deleted.');
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to delete education record.');
    } finally {
      setLoading(false);
    }
  };

  // Candidate: Experience Form Reset
  const resetExpForm = () => {
    setExpId(null);
    setExpCompany('');
    setExpTitle('');
    setExpLocation('');
    setExpStartDate('');
    setExpEndDate('');
    setExpCurrent(false);
    setExpDescription('');
  };

  // Candidate: Save Experience
  const handleSaveExperience = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg('');
    setErrorMsg('');
    try {
      const payload = {
        company: expCompany,
        title: expTitle,
        location: expLocation,
        startDate: expStartDate || null,
        endDate: expCurrent ? null : (expEndDate || null),
        current: expCurrent,
        description: expDescription
      };
      if (expId) {
        await CandidateService.updateExperience(expId, payload);
      } else {
        await CandidateService.addExperience(payload);
      }
      const updated = await CandidateService.getProfile();
      setProfileData(updated);
      setShowExpForm(false);
      resetExpForm();
      setSuccessMsg('Experience record saved.');
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to save experience record.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditExperience = (exp) => {
    setExpId(exp.id);
    setExpCompany(exp.company || '');
    setExpTitle(exp.title || '');
    setExpLocation(exp.location || '');
    setExpStartDate(exp.startDate || '');
    setExpEndDate(exp.endDate || '');
    setExpCurrent(exp.current || false);
    setExpDescription(exp.description || '');
    setShowExpForm(true);
  };

  const handleDeleteExperience = async (id) => {
    if (!window.confirm('Are you sure you want to delete this experience entry?')) return;
    setLoading(true);
    setSuccessMsg('');
    setErrorMsg('');
    try {
      await CandidateService.deleteExperience(id);
      const updated = await CandidateService.getProfile();
      setProfileData(updated);
      setSuccessMsg('Experience record deleted.');
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to delete experience record.');
    } finally {
      setLoading(false);
    }
  };

  // Candidate: Skill CRUD
  const handleAddSkill = async (e) => {
    e.preventDefault();
    if (!skillName) return;
    setLoading(true);
    setSuccessMsg('');
    setErrorMsg('');
    try {
      await CandidateService.addSkill({ name: skillName, proficiencyLevel: skillLevel });
      const updated = await CandidateService.getProfile();
      setProfileData(updated);
      setSkillName('');
      setShowSkillForm(false);
      setSuccessMsg('Skill added.');
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to add skill.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSkill = async (id) => {
    setLoading(true);
    setSuccessMsg('');
    setErrorMsg('');
    try {
      await CandidateService.deleteSkill(id);
      const updated = await CandidateService.getProfile();
      setProfileData(updated);
      setSuccessMsg('Skill removed.');
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to remove skill.');
    } finally {
      setLoading(false);
    }
  };

  // Candidate: Certification Form Reset
  const resetCertForm = () => {
    setCertId(null);
    setCertName('');
    setCertOrg('');
    setCertIssueDate('');
    setCertExpDate('');
    setCertCredId('');
    setCertCredUrl('');
  };

  // Candidate: Save Certification
  const handleSaveCertification = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg('');
    setErrorMsg('');
    try {
      const payload = {
        name: certName,
        issuingOrganization: certOrg,
        issueDate: certIssueDate || null,
        expirationDate: certExpDate || null,
        credentialId: certCredId,
        credentialUrl: certCredUrl
      };
      if (certId) {
        await CandidateService.updateCertification(certId, payload);
      } else {
        await CandidateService.addCertification(payload);
      }
      const updated = await CandidateService.getProfile();
      setProfileData(updated);
      setShowCertForm(false);
      resetCertForm();
      setSuccessMsg('Certification record saved.');
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to save certification record.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditCertification = (cert) => {
    setCertId(cert.id);
    setCertName(cert.name || '');
    setCertOrg(cert.issuingOrganization || '');
    setCertIssueDate(cert.issueDate || '');
    setCertExpDate(cert.expirationDate || '');
    setCertCredId(cert.credentialId || '');
    setCertCredUrl(cert.credentialUrl || '');
    setShowCertForm(true);
  };

  const handleDeleteCertification = async (id) => {
    if (!window.confirm('Are you sure you want to delete this certification?')) return;
    setLoading(true);
    setSuccessMsg('');
    setErrorMsg('');
    try {
      await CandidateService.deleteCertification(id);
      const updated = await CandidateService.getProfile();
      setProfileData(updated);
      setSuccessMsg('Certification deleted.');
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to delete certification.');
    } finally {
      setLoading(false);
    }
  };

  // Recruiter Actions
  const handlePostJob = async (e) => {
    e.preventDefault();
    if (!jobTitleInput || !jobDescInput) return;
    setLoading(true);
    setSuccessMsg('');
    setErrorMsg('');
    try {
      const res = await RecruiterService.postJob({
        title: jobTitleInput,
        description: jobDescInput,
        requirements: jobReqsInput,
        location: jobLocInput,
        salary: jobSalaryInput
      });
      setSuccessMsg(res.message || 'Job posting created successfully!');
      setJobTitleInput('');
      setJobDescInput('');
      setJobReqsInput('');
      setJobLocInput('');
      setJobSalaryInput('');
      await loadData();
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.error || 'Failed to post job listing.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (applicationId, newStatus) => {
    setLoading(true);
    setSuccessMsg('');
    setErrorMsg('');
    try {
      await RecruiterService.updateApplicationStatus(applicationId, newStatus);
      setSuccessMsg('Candidate application status updated.');
      await loadData();
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.error || 'Failed to update candidate status.');
    } finally {
      setLoading(false);
    }
  };

  // Recruiter Interview Actions
  const toggleInterviews = async (applicationId) => {
    if (expandedInterviews[applicationId]) {
      setExpandedInterviews(prev => ({ ...prev, [applicationId]: false }));
    } else {
      setLoading(true);
      setErrorMsg('');
      try {
        const list = await RecruiterService.getInterviews(applicationId);
        setInterviews(prev => ({ ...prev, [applicationId]: list }));
        setExpandedInterviews(prev => ({ ...prev, [applicationId]: true }));
      } catch (err) {
        console.error(err);
        setErrorMsg('Failed to load interviews.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleOpenScheduleModal = (applicationId) => {
    setSelectedApplicationId(applicationId);
    setShowScheduleModal(true);
  };

  const handleScheduleInterview = async (e) => {
    e.preventDefault();
    if (!interviewDate) {
      setErrorMsg('Please select a date and time for the interview.');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const payload = {
        title: interviewTitle,
        scheduledAt: interviewDate,
        durationMinutes: parseInt(interviewDuration),
        location: interviewLocation,
        notes: interviewNotes
      };
      await RecruiterService.scheduleInterview(selectedApplicationId, payload);
      setSuccessMsg('Interview scheduled successfully!');
      setShowScheduleModal(false);
      
      // Refresh interviews
      const list = await RecruiterService.getInterviews(selectedApplicationId);
      setInterviews(prev => ({ ...prev, [selectedApplicationId]: list }));
      setExpandedInterviews(prev => ({ ...prev, [selectedApplicationId]: true }));
      
      // Reset form
      setInterviewTitle('Technical Interview');
      setInterviewDate('');
      setInterviewDuration(45);
      setInterviewLocation('');
      setInterviewNotes('');
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.error || 'Failed to schedule interview.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateInterviewStatus = async (applicationId, interviewId, newStatus) => {
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      await RecruiterService.updateInterviewStatus(interviewId, newStatus);
      setSuccessMsg(`Interview status updated to ${newStatus}.`);
      const list = await RecruiterService.getInterviews(applicationId);
      setInterviews(prev => ({ ...prev, [applicationId]: list }));
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.error || 'Failed to update interview status.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateQuestions = async (applicationId, interviewId) => {
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      await RecruiterService.generateAiQuestions(interviewId);
      setSuccessMsg('AI questions generated/regenerated successfully!');
      const list = await RecruiterService.getInterviews(applicationId);
      setInterviews(prev => ({ ...prev, [applicationId]: list }));
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.error || 'Failed to generate AI questions.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyQuestions = (questionsText) => {
    if (!questionsText) return;
    navigator.clipboard.writeText(questionsText);
    setSuccessMsg('AI Interview Questions copied to clipboard!');
    setTimeout(() => setSuccessMsg(''), 3000);
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
    <div className="min-h-screen bg-dark-950 flex flex-col">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 glassmorphism border-b border-dark-800/60 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-primary-600/20 text-primary-400 border border-primary-500/20 font-bold tracking-wider text-sm">
            AI-RMS
          </div>
          <span className="font-semibold text-lg text-white">Recruitment Portal</span>
        </div>

        <div className="flex items-center space-x-6">
          {isCandidate && (
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-lg bg-dark-900 border border-dark-800 text-dark-300 hover:text-white hover:border-dark-700 transition-colors cursor-pointer relative flex items-center justify-center"
              >
                <Bell className="h-4.5 w-4.5 " />
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
                            className="absolute top-2.5 right-2.5 text-red-400 hover:text-red-700 opacity-60 hover:opacity-100 transition-all cursor-pointer bg-transparent border-none focus:outline-none"
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
          )}

          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-full bg-primary-500/20 text-primary-400 flex items-center justify-center border border-primary-500/30">
              {isAdmin ? <Shield className="h-4 w-4" /> : <User className="h-4 w-4" />}
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-sm font-semibold text-white leading-tight">
                {user?.firstName} {user?.lastName}
              </div>
              <div className="text-[10px] uppercase font-bold text-primary-400 tracking-wider">
                {isRecruiter ? 'Recruiter' : isAdmin ? 'Administrator' : 'Candidate'}
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

        {/* Welcome Banner */}
        <section className="glassmorphism rounded-2xl p-8 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between">
          <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-primary-500/10 blur-[100px] -mr-20 -mt-20 pointer-events-none" />
          <div className="space-y-2 relative z-10">
            <div className="flex items-center space-x-2 text-primary-400 text-xs font-semibold tracking-wider uppercase">
              <Sparkles className="h-4 w-4" />
              <span>Workspace Console</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white">
              Welcome back, {user?.firstName}!
            </h1>
            <p className="text-dark-400 max-w-xl text-sm leading-relaxed">
              Analyze, rank, and connect with optimal matches powered by our recruitment neural networks.
            </p>
          </div>
          <div className="mt-4 md:mt-0 px-4 py-2 rounded-xl bg-dark-900/60 border border-dark-800 text-xs text-dark-300 font-medium">
            System Status: <span className="text-green-400 font-bold">Online</span>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* CANDIDATE CONSOLE */}
        {/* ========================================================================= */}
        {isCandidate && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column: Navigation Hub & Basic Info */}
              <div className="space-y-8 lg:col-span-1">
                {/* Candidate Navigation Hub */}
                <div className="grid grid-cols-1 gap-4">
                  {/* Card 1: Browse Jobs */}
                  <button
                    onClick={() => navigate('/jobs')}
                    className="glassmorphism rounded-xl p-5 border border-dark-800 text-left hover:border-primary-500/30 transition-all card-hover group w-full cursor-pointer flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="p-3 rounded-xl bg-primary-500/10 text-primary-400 border border-primary-500/20 group-hover:bg-primary-500/20 transition-all">
                        <Briefcase className="h-6 w-6" />
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-sm">Available Job Openings</h4>
                        <p className="text-xs text-dark-400 mt-0.5">Explore active roles & apply</p>
                      </div>
                    </div>
                    <div className="text-dark-400 group-hover:text-primary-400 pr-2 transition-colors">
                      <span className="text-xl">➔</span>
                    </div>
                  </button>

                  {/* Card 2: Track Applications */}
                  <button
                    onClick={() => navigate('/applications')}
                    className="glassmorphism rounded-xl p-5 border border-dark-800 text-left hover:border-emerald-500/30 transition-all card-hover group w-full cursor-pointer flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:bg-emerald-500/20 transition-all">
                        <CheckCircle className="h-6 w-6" />
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-sm">My Applications</h4>
                        <p className="text-xs text-dark-400 mt-0.5">Track your matching status</p>
                      </div>
                    </div>
                    <div className="text-dark-400 group-hover:text-emerald-400 pr-2 transition-colors">
                      <span className="text-xl">➔</span>
                    </div>
                  </button>
                </div>

                {/* AI Resume Upload & Parser Card */}
                <div className="glassmorphism rounded-xl p-6 border border-dark-800 space-y-4 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-primary-500/5 blur-xl -mr-6 -mt-6 pointer-events-none" />
                  
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 rounded-lg bg-primary-500/10 text-primary-400 border border-primary-500/20">
                      <Cpu className="h-5 w-5 animate-pulse" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">AI Profile Builder</h3>
                      <p className="text-[10px] text-dark-400">Extract skills and summary automatically</p>
                    </div>
                  </div>

                  {uploadingResume ? (
                    <div className="p-6 rounded-xl bg-primary-500/5 border border-primary-500/20 flex flex-col items-center text-center space-y-3">
                      <Loader2 className="h-8 w-8 text-primary-400 animate-spin" />
                      <div className="space-y-1">
                        <span className="text-xs font-semibold text-white block">AI parsing in progress...</span>
                        <span className="text-[10px] text-dark-400 block max-w-[200px]">Extracting contact details and listing professional skills</span>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {profileData?.resumeUrl ? (
                        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="h-2 w-2 rounded-full bg-emerald-400" />
                            <span className="text-xs font-medium text-emerald-400">Resume parsed & active</span>
                          </div>
                          <a 
                            href={getResumeDownloadUrl(profileData.resumeUrl)} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="text-[10px] text-primary-400 hover:underline font-bold"
                          >
                            View PDF
                          </a>
                        </div>
                      ) : (
                        <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center space-x-2">
                          <span className="h-2 w-2 rounded-full bg-amber-400" />
                          <span className="text-xs font-medium text-amber-400">No PDF resume uploaded yet</span>
                        </div>
                      )}

                      <label className="flex flex-col items-center justify-center p-4 border border-dashed border-dark-700 hover:border-primary-500/50 rounded-xl cursor-pointer hover:bg-dark-900/30 transition-all text-center space-y-1.5">
                        <span className="text-xs font-bold text-white">Upload new PDF</span>
                        <span className="text-[10px] text-dark-400">Select your resume to trigger AI scan</span>
                        <input 
                          type="file" 
                          accept=".pdf" 
                          onChange={handleResumeUpload} 
                          className="hidden" 
                        />
                      </label>
                    </div>
                  )}
                </div>

                {/* Candidate Basic details Edit */}
                <div className="glassmorphism rounded-xl p-6 border border-dark-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
                        <User className="h-5 w-5" />
                      </div>
                      <h3 className="text-lg font-bold text-white">Basic Info</h3>
                    </div>
                    {!editingBasic && (
                      <button 
                        onClick={() => setEditingBasic(true)}
                        className="text-xs text-primary-400 hover:text-primary-300 flex items-center space-x-1 cursor-pointer bg-transparent border-none"
                      >
                        <Edit2 className="h-3 w-3" />
                        <span>Edit</span>
                      </button>
                    )}
                  </div>

                  {editingBasic ? (
                    <form onSubmit={handleUpdateBasic} className="space-y-4">
                      <div>
                        <label className="block text-xs font-medium text-dark-300 mb-1">Phone Number</label>
                        <input
                          type="text"
                          className="block w-full px-3 py-2 bg-dark-900/50 border border-dark-800 rounded-xl text-xs text-white focus:ring-1 focus:ring-primary-500 focus:outline-none"
                          value={basicPhone}
                          onChange={(e) => setBasicPhone(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-dark-300 mb-1">Resume Link (URL)</label>
                        <input
                          type="url"
                          className="block w-full px-3 py-2 bg-dark-900/50 border border-dark-800 rounded-xl text-xs text-white focus:ring-1 focus:ring-primary-500 focus:outline-none"
                          value={basicResumeUrl}
                          onChange={(e) => setBasicResumeUrl(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-dark-300 mb-1">Profile Summary</label>
                        <textarea
                          rows="4"
                          className="block w-full px-3 py-2 bg-dark-900/50 border border-dark-800 rounded-xl text-xs text-white focus:ring-1 focus:ring-primary-500 focus:outline-none"
                          value={basicSummary}
                          onChange={(e) => setBasicSummary(e.target.value)}
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          type="submit"
                          className="px-3 py-1.5 bg-primary-600 text-white rounded-lg text-xs font-medium hover:bg-primary-500"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingBasic(false);
                            setBasicPhone(profileData?.phone || '');
                            setBasicSummary(profileData?.summary || '');
                            setBasicResumeUrl(profileData?.resumeUrl || '');
                          }}
                          className="px-3 py-1.5 bg-dark-800 text-dark-300 rounded-lg text-xs font-medium hover:bg-dark-700"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="space-y-3 text-xs">
                      <div>
                        <span className="text-dark-500 block">Registered Email</span>
                        <span className="text-white font-medium">{profileData?.email || user?.email}</span>
                      </div>
                      <div>
                        <span className="text-dark-500 block">Phone Number</span>
                        <span className="text-white font-medium">{profileData?.phone || 'Not provided'}</span>
                      </div>
                      <div>
                        <span className="text-dark-500 block">Resume PDF File</span>
                        {profileData?.resumeUrl ? (
                          <a href={getResumeDownloadUrl(profileData.resumeUrl)} target="_blank" rel="noreferrer" className="text-primary-400 hover:underline font-medium break-all">
                            View / Download Resume PDF
                          </a>
                        ) : (
                          <span className="text-dark-400 italic">No resume uploaded yet</span>
                        )}
                      </div>
                      <div>
                        <span className="text-dark-500 block">Professional Summary</span>
                        <p className="text-dark-300 leading-relaxed italic">
                          {profileData?.summary || 'No summary set. Click Edit to add details about your career.'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Columns: Detailed Profile sections */}
              <div className="lg:col-span-2 space-y-8">
                
                {/* 1. EDUCATION SECTION */}
                <div className="glassmorphism rounded-xl p-6 border border-dark-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        <GraduationCap className="h-5 w-5" />
                      </div>
                      <h3 className="text-lg font-bold text-white">Education History</h3>
                    </div>
                    {!showEduForm && (
                      <button
                        onClick={() => { resetEduForm(); setShowEduForm(true); }}
                        className="text-xs text-primary-400 hover:text-primary-300 flex items-center space-x-1 cursor-pointer bg-transparent border-none"
                      >
                        <PlusCircle className="h-4 w-4" />
                        <span>Add</span>
                      </button>
                    )}
                  </div>

                  {showEduForm && (
                    <form onSubmit={handleSaveEducation} className="p-4 rounded-xl bg-dark-900/30 border border-dark-800 space-y-4">
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                        {eduId ? 'Edit Education Entry' : 'Add Education Entry'}
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] uppercase font-semibold text-dark-400 mb-1">Institution Name</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Stanford University"
                            className="block w-full px-3 py-2 bg-dark-900/80 border border-dark-800 rounded-lg text-xs text-white"
                            value={eduInstitution}
                            onChange={(e) => setEduInstitution(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase font-semibold text-dark-400 mb-1">Degree Earned</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. B.S. / M.S. / Ph.D."
                            className="block w-full px-3 py-2 bg-dark-900/80 border border-dark-800 rounded-lg text-xs text-white"
                            value={eduDegree}
                            onChange={(e) => setEduDegree(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase font-semibold text-dark-400 mb-1">Field of Study</label>
                          <input
                            type="text"
                            placeholder="e.g. Computer Science"
                            className="block w-full px-3 py-2 bg-dark-900/80 border border-dark-800 rounded-lg text-xs text-white"
                            value={eduFieldOfStudy}
                            onChange={(e) => setEduFieldOfStudy(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase font-semibold text-dark-400 mb-1">Grade/GPA</label>
                          <input
                            type="text"
                            placeholder="e.g. A / 3.9 GPA"
                            className="block w-full px-3 py-2 bg-dark-900/80 border border-dark-800 rounded-lg text-xs text-white"
                            value={eduGrade}
                            onChange={(e) => setEduGrade(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase font-semibold text-dark-400 mb-1">Start Date</label>
                          <input
                            type="date"
                            className="block w-full px-3 py-2 bg-dark-900/80 border border-dark-800 rounded-lg text-xs text-white"
                            value={eduStartDate}
                            onChange={(e) => setEduStartDate(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase font-semibold text-dark-400 mb-1">End Date (or Expected)</label>
                          <input
                            type="date"
                            className="block w-full px-3 py-2 bg-dark-900/80 border border-dark-800 rounded-lg text-xs text-white"
                            value={eduEndDate}
                            onChange={(e) => setEduEndDate(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 pt-2">
                        <button type="submit" className="px-3 py-1.5 bg-primary-600 hover:bg-primary-500 text-white text-xs font-semibold rounded-lg">
                          Save Record
                        </button>
                        <button type="button" onClick={() => { setShowEduForm(false); resetEduForm(); }} className="px-3 py-1.5 bg-dark-800 text-dark-300 text-xs font-semibold rounded-lg hover:bg-dark-700">
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}

                  <div className="space-y-4">
                    {profileData?.education?.length === 0 ? (
                      <p className="text-xs text-dark-500 italic py-2">No education history details listed.</p>
                    ) : (
                      profileData?.education?.map((edu) => (
                        <div key={edu.id} className="p-4 rounded-xl bg-dark-900/30 border border-dark-850 flex justify-between items-start">
                          <div className="space-y-1 text-xs">
                            <h4 className="font-bold text-white text-sm">{edu.degree} in {edu.fieldOfStudy}</h4>
                            <span className="text-primary-400 block font-medium">{edu.institution}</span>
                            <div className="text-dark-400 flex items-center space-x-2">
                              <span>{edu.startDate || 'N/A'} to {edu.endDate || 'Present'}</span>
                              {edu.grade && (
                                <>
                                  <span className="text-dark-600">•</span>
                                  <span className="text-emerald-400 font-bold">Grade: {edu.grade}</span>
                                </>
                              )}
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <button onClick={() => handleEditEducation(edu)} className="p-1 text-dark-400 hover:text-white transition-colors bg-transparent border-none cursor-pointer">
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            <button onClick={() => handleDeleteEducation(edu.id)} className="p-1 text-dark-400 hover:text-red-400 transition-colors bg-transparent border-none cursor-pointer">
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* 2. EXPERIENCE SECTION */}
                <div className="glassmorphism rounded-xl p-6 border border-dark-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        <Briefcase className="h-5 w-5" />
                      </div>
                      <h3 className="text-lg font-bold text-white">Work Experience</h3>
                    </div>
                    {!showExpForm && (
                      <button
                        onClick={() => { resetExpForm(); setShowExpForm(true); }}
                        className="text-xs text-primary-400 hover:text-primary-300 flex items-center space-x-1 cursor-pointer bg-transparent border-none"
                      >
                        <PlusCircle className="h-4 w-4" />
                        <span>Add</span>
                      </button>
                    )}
                  </div>

                  {showExpForm && (
                    <form onSubmit={handleSaveExperience} className="p-4 rounded-xl bg-dark-900/30 border border-dark-800 space-y-4">
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                        {expId ? 'Edit Experience Entry' : 'Add Experience Entry'}
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] uppercase font-semibold text-dark-400 mb-1">Company</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Google Inc."
                            className="block w-full px-3 py-2 bg-dark-900/80 border border-dark-800 rounded-lg text-xs text-white"
                            value={expCompany}
                            onChange={(e) => setExpCompany(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase font-semibold text-dark-400 mb-1">Job Title</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Software Engineer II"
                            className="block w-full px-3 py-2 bg-dark-900/80 border border-dark-800 rounded-lg text-xs text-white"
                            value={expTitle}
                            onChange={(e) => setExpTitle(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase font-semibold text-dark-400 mb-1">Location</label>
                          <input
                            type="text"
                            placeholder="e.g. Mountain View, CA"
                            className="block w-full px-3 py-2 bg-dark-900/80 border border-dark-800 rounded-lg text-xs text-white"
                            value={expLocation}
                            onChange={(e) => setExpLocation(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase font-semibold text-dark-400 mb-1 flex items-center space-x-2 pt-6">
                            <input
                              type="checkbox"
                              className="rounded border-dark-800 bg-dark-900 focus:ring-0"
                              checked={expCurrent}
                              onChange={(e) => setExpCurrent(e.target.checked)}
                            />
                            <span>Current Job</span>
                          </label>
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase font-semibold text-dark-400 mb-1">Start Date</label>
                          <input
                            type="date"
                            className="block w-full px-3 py-2 bg-dark-900/80 border border-dark-800 rounded-lg text-xs text-white"
                            value={expStartDate}
                            onChange={(e) => setExpStartDate(e.target.value)}
                          />
                        </div>
                        {!expCurrent && (
                          <div>
                            <label className="block text-[10px] uppercase font-semibold text-dark-400 mb-1">End Date</label>
                            <input
                              type="date"
                              className="block w-full px-3 py-2 bg-dark-900/80 border border-dark-800 rounded-lg text-xs text-white"
                              value={expEndDate}
                              onChange={(e) => setExpEndDate(e.target.value)}
                            />
                          </div>
                        )}
                        <div className="md:col-span-2">
                          <label className="block text-[10px] uppercase font-semibold text-dark-400 mb-1">Description / Core Duties</label>
                          <textarea
                            rows="3"
                            placeholder="Detail your accomplishments and stack..."
                            className="block w-full px-3 py-2 bg-dark-900/80 border border-dark-800 rounded-lg text-xs text-white focus:outline-none"
                            value={expDescription}
                            onChange={(e) => setExpDescription(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 pt-2">
                        <button type="submit" className="px-3 py-1.5 bg-primary-600 hover:bg-primary-500 text-white text-xs font-semibold rounded-lg">
                          Save Record
                        </button>
                        <button type="button" onClick={() => { setShowExpForm(false); resetExpForm(); }} className="px-3 py-1.5 bg-dark-800 text-dark-300 text-xs font-semibold rounded-lg hover:bg-dark-700">
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}

                  <div className="space-y-4">
                    {profileData?.experience?.length === 0 ? (
                      <p className="text-xs text-dark-500 italic py-2">No professional experience listed.</p>
                    ) : (
                      profileData?.experience?.map((exp) => (
                        <div key={exp.id} className="p-4 rounded-xl bg-dark-900/30 border border-dark-850 flex justify-between items-start">
                          <div className="space-y-1 text-xs">
                            <h4 className="font-bold text-white text-sm">{exp.title}</h4>
                            <span className="text-amber-400 block font-medium">{exp.company} {exp.location && `• ${exp.location}`}</span>
                            <span className="text-dark-400 block">{exp.startDate || 'N/A'} to {exp.current ? 'Present' : (exp.endDate || 'N/A')}</span>
                            {exp.description && (
                              <p className="text-dark-300 mt-2 bg-dark-950/40 p-2.5 rounded-lg border border-dark-850/60 leading-relaxed font-mono text-[11px] whitespace-pre-line">
                                {exp.description}
                              </p>
                            )}
                          </div>
                          <div className="flex space-x-2">
                            <button onClick={() => handleEditExperience(exp)} className="p-1 text-dark-400 hover:text-white transition-colors bg-transparent border-none cursor-pointer">
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            <button onClick={() => handleDeleteExperience(exp.id)} className="p-1 text-dark-400 hover:text-red-400 transition-colors bg-transparent border-none cursor-pointer">
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* 3. SKILLS SECTION */}
                <div className="glassmorphism rounded-xl p-6 border border-dark-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/20">
                        <Cpu className="h-5 w-5" />
                      </div>
                      <h3 className="text-lg font-bold text-white">Extracted Neural Skills</h3>
                    </div>
                    {!showSkillForm && (
                      <button
                        onClick={() => { setSkillName(''); setShowSkillForm(true); }}
                        className="text-xs text-primary-400 hover:text-primary-300 flex items-center space-x-1 cursor-pointer bg-transparent border-none"
                      >
                        <PlusCircle className="h-4 w-4" />
                        <span>Add Skill</span>
                      </button>
                    )}
                  </div>

                  {showSkillForm && (
                    <form onSubmit={handleAddSkill} className="p-4 rounded-xl bg-dark-900/30 border border-dark-800 flex flex-col sm:flex-row items-end gap-3">
                      <div className="flex-1 w-full">
                        <label className="block text-[10px] uppercase font-semibold text-dark-400 mb-1">Skill Name</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. React, Spring Boot"
                          className="block w-full px-3 py-2 bg-dark-900/80 border border-dark-800 rounded-lg text-xs text-white focus:outline-none"
                          value={skillName}
                          onChange={(e) => setSkillName(e.target.value)}
                        />
                      </div>
                      <div className="w-full sm:w-48">
                        <label className="block text-[10px] uppercase font-semibold text-dark-400 mb-1">Proficiency Level</label>
                        <select
                          className="block w-full px-3 py-2 bg-dark-900/80 border border-dark-800 rounded-lg text-xs text-white focus:outline-none"
                          value={skillLevel}
                          onChange={(e) => setSkillLevel(e.target.value)}
                        >
                          <option value="Beginner">Beginner</option>
                          <option value="Intermediate">Intermediate</option>
                          <option value="Expert">Expert</option>
                        </select>
                      </div>
                      <div className="flex items-center space-x-2 w-full sm:w-auto">
                        <button type="submit" className="px-3 py-2 bg-primary-600 hover:bg-primary-500 text-white text-xs font-semibold rounded-lg w-full sm:w-auto">
                          Add
                        </button>
                        <button type="button" onClick={() => setShowSkillForm(false)} className="px-3 py-2 bg-dark-800 text-dark-300 text-xs font-semibold rounded-lg hover:bg-dark-700 w-full sm:w-auto">
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}

                  <div className="flex flex-wrap gap-2.5">
                    {profileData?.skills?.length === 0 ? (
                      <span className="text-xs text-dark-500 italic py-2">No skills registered. Click Add to insert skills.</span>
                    ) : (
                      profileData?.skills?.map((sk) => (
                        <div key={sk.id} className="flex items-center space-x-2 px-3 py-1 rounded-full bg-dark-900 border border-dark-800/80 text-white text-xs">
                          <span>{sk.name}</span>
                          <span className={`text-[9px] uppercase px-1.5 py-0.5 rounded font-bold ${
                            sk.proficiencyLevel === 'Expert' ? 'bg-primary-500/20 text-primary-400' :
                            sk.proficiencyLevel === 'Intermediate' ? 'bg-indigo-500/20 text-indigo-400' :
                            'bg-dark-750 text-dark-400'
                          }`}>{sk.proficiencyLevel}</span>
                          <button onClick={() => handleDeleteSkill(sk.id)} className="text-dark-500 hover:text-red-400 font-bold bg-transparent border-none cursor-pointer focus:outline-none pl-1">
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* 4. CERTIFICATIONS SECTION */}
                <div className="glassmorphism rounded-xl p-6 border border-dark-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-lg bg-pink-500/10 text-pink-400 border border-pink-500/20">
                        <Award className="h-5 w-5" />
                      </div>
                      <h3 className="text-lg font-bold text-white">Certifications</h3>
                    </div>
                    {!showCertForm && (
                      <button
                        onClick={() => { resetCertForm(); setShowCertForm(true); }}
                        className="text-xs text-primary-400 hover:text-primary-300 flex items-center space-x-1 cursor-pointer bg-transparent border-none"
                      >
                        <PlusCircle className="h-4 w-4" />
                        <span>Add</span>
                      </button>
                    )}
                  </div>

                  {showCertForm && (
                    <form onSubmit={handleSaveCertification} className="p-4 rounded-xl bg-dark-900/30 border border-dark-800 space-y-4">
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                        {certId ? 'Edit Certification' : 'Add Certification'}
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] uppercase font-semibold text-dark-400 mb-1">Certification Name</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. AWS Solutions Architect"
                            className="block w-full px-3 py-2 bg-dark-900/80 border border-dark-800 rounded-lg text-xs text-white"
                            value={certName}
                            onChange={(e) => setCertName(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase font-semibold text-dark-400 mb-1">Issuing Organization</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Amazon Web Services"
                            className="block w-full px-3 py-2 bg-dark-900/80 border border-dark-800 rounded-lg text-xs text-white"
                            value={certOrg}
                            onChange={(e) => setCertOrg(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase font-semibold text-dark-400 mb-1">Issue Date</label>
                          <input
                            type="date"
                            className="block w-full px-3 py-2 bg-dark-900/80 border border-dark-800 rounded-lg text-xs text-white"
                            value={certIssueDate}
                            onChange={(e) => setCertIssueDate(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase font-semibold text-dark-400 mb-1">Expiration Date</label>
                          <input
                            type="date"
                            className="block w-full px-3 py-2 bg-dark-900/80 border border-dark-800 rounded-lg text-xs text-white"
                            value={certExpDate}
                            onChange={(e) => setCertExpDate(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase font-semibold text-dark-400 mb-1">Credential ID</label>
                          <input
                            type="text"
                            placeholder="e.g. AWS-SEC-929"
                            className="block w-full px-3 py-2 bg-dark-900/80 border border-dark-800 rounded-lg text-xs text-white"
                            value={certCredId}
                            onChange={(e) => setCertCredId(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase font-semibold text-dark-400 mb-1">Credential URL</label>
                          <input
                            type="url"
                            placeholder="e.g. http://aws.amazon.com/verify/..."
                            className="block w-full px-3 py-2 bg-dark-900/80 border border-dark-800 rounded-lg text-xs text-white"
                            value={certCredUrl}
                            onChange={(e) => setCertCredUrl(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 pt-2">
                        <button type="submit" className="px-3 py-1.5 bg-primary-600 hover:bg-primary-500 text-white text-xs font-semibold rounded-lg">
                          Save Record
                        </button>
                        <button type="button" onClick={() => { setShowCertForm(false); resetCertForm(); }} className="px-3 py-1.5 bg-dark-800 text-dark-300 text-xs font-semibold rounded-lg hover:bg-dark-700">
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}

                  <div className="space-y-4">
                    {profileData?.certifications?.length === 0 ? (
                      <p className="text-xs text-dark-500 italic py-2">No certifications listed.</p>
                    ) : (
                      profileData?.certifications?.map((cert) => (
                        <div key={cert.id} className="p-4 rounded-xl bg-dark-900/30 border border-dark-850 flex justify-between items-start">
                          <div className="space-y-1 text-xs">
                            <h4 className="font-bold text-white text-sm">{cert.name}</h4>
                            <span className="text-pink-400 block font-medium">{cert.issuingOrganization}</span>
                            <div className="text-dark-400 flex items-center space-x-2">
                              <span>Issued: {cert.issueDate || 'N/A'}</span>
                              {cert.expirationDate && (
                                <>
                                  <span className="text-dark-600">•</span>
                                  <span>Expires: {cert.expirationDate}</span>
                                </>
                              )}
                            </div>
                            {cert.credentialId && (
                              <span className="text-dark-500 block">Credential ID: {cert.credentialId}</span>
                            )}
                            {cert.credentialUrl && (
                              <a href={cert.credentialUrl} target="_blank" rel="noreferrer" className="text-primary-400 hover:underline font-medium block mt-1">
                                Verify Credential
                              </a>
                            )}
                          </div>
                          <div className="flex space-x-2">
                            <button onClick={() => handleEditCertification(cert)} className="p-1 text-dark-400 hover:text-white transition-colors bg-transparent border-none cursor-pointer">
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            <button onClick={() => handleDeleteCertification(cert.id)} className="p-1 text-dark-400 hover:text-red-400 transition-colors bg-transparent border-none cursor-pointer">
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>
            </div>

            {/* AI Job Recommendations Section */}
            <div className="glassmorphism rounded-xl p-6 border border-dark-800 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 rounded-lg bg-primary-500/10 text-primary-400 border border-primary-500/20">
                    <Sparkles className="h-5 w-5 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">AI Recommended Jobs</h3>
                    <p className="text-xs text-dark-400">Tailored roles sorted by matching score based on your parsed profile skills & summary</p>
                  </div>
                </div>
                <div className="px-3 py-1 rounded-full bg-primary-500/10 border border-primary-500/20 text-xs font-bold text-primary-400">
                  {recommendations.length} {recommendations.length === 1 ? 'Match' : 'Matches'}
                </div>
              </div>

              {recommendations.length === 0 ? (
                <div className="text-center py-12 rounded-xl bg-dark-900/20 border border-dark-800/40 text-xs text-dark-500 italic space-y-2">
                  <p>No job recommendations found at the moment.</p>
                  <p className="text-[10px] text-dark-600">Please make sure to fill out your profile details or upload your resume PDF to trigger matching.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  {recommendations.map((rec, idx) => {
                    const matchPercent = Math.round(rec.matchScore);
                    
                    // Tailor score color dynamically
                    let scoreBadgeColor = 'text-red-400 bg-red-500/5 border-red-500/10';
                    if (matchPercent >= 80) scoreBadgeColor = 'text-emerald-400 bg-emerald-500/5 border-emerald-500/10';
                    else if (matchPercent >= 60) scoreBadgeColor = 'text-amber-400 bg-amber-500/5 border-amber-500/10';

                    return (
                      <div key={idx} className="p-5 rounded-xl bg-dark-900/40 border border-dark-800/60 flex flex-col justify-between space-y-4 card-hover relative overflow-hidden group">
                        {/* Suitability score gauge bar on the side/top */}
                        <div className="absolute top-0 left-0 right-0 h-1 bg-dark-950">
                          <div 
                            className={`h-full ${matchPercent >= 80 ? 'bg-emerald-500' : matchPercent >= 60 ? 'bg-amber-500' : 'bg-red-500'}`}
                            style={{ width: `${matchPercent}%` }}
                          />
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <h4 className="font-bold text-white text-base group-hover:text-primary-400 transition-colors">{rec.job.title}</h4>
                              <p className="text-xs text-dark-400 font-medium mt-0.5">{rec.job.recruiterName || 'Company'} • {rec.job.location || 'Remote'}</p>
                            </div>
                            <span className={`px-2.5 py-1 rounded-lg text-xs font-extrabold border ${scoreBadgeColor}`}>
                              {matchPercent}% Match
                            </span>
                          </div>

                          {rec.job.salary && (
                            <p className="text-xs font-semibold text-primary-400">{rec.job.salary}</p>
                          )}

                          {/* Matching Explanation */}
                          <div className="p-3 rounded-lg bg-primary-500/5 border border-primary-500/10 space-y-1">
                            <div className="flex items-center space-x-1.5 text-[10px] uppercase font-bold text-primary-400">
                              <Cpu className="h-3 w-3" />
                              <span>AI Suitability Explanation</span>
                            </div>
                            <p className="text-[11px] text-dark-300 leading-relaxed font-sans">{rec.explanation}</p>
                          </div>
                        </div>

                        <div className="pt-2 flex items-center justify-between">
                          <div className="flex flex-wrap gap-1.5 max-w-[70%]">
                            {rec.job.requirements ? (
                              rec.job.requirements.split(',').slice(0, 3).map((req, rid) => (
                                <span key={rid} className="px-2 py-0.5 bg-dark-950 border border-dark-800 rounded text-[9px] font-semibold text-dark-400">
                                  {req.trim()}
                                </span>
                              ))
                            ) : null}
                          </div>
                          
                          <button
                            onClick={() => handleInstantApply(rec.job.id)}
                            disabled={loading}
                            className="glow-btn px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center space-x-1.5"
                          >
                            <span>Instant Apply</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* RECRUITER CONSOLE */}
        {/* ========================================================================= */}
        {isRecruiter && (
          <div className="space-y-8">
            {/* Recruiter Analytics Hub */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Metric Card 1 */}
              <div className="glassmorphism rounded-xl p-6 border border-dark-800 flex items-center space-x-4">
                <div className="p-3 rounded-lg bg-primary-500/10 text-primary-400 border border-primary-500/20">
                  <Briefcase className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-dark-400 uppercase tracking-wider">Total Job Openings</p>
                  <p className="text-2xl font-bold text-white mt-1">{analyticsData?.totalJobs ?? 0}</p>
                </div>
              </div>
              
              {/* Metric Card 2 */}
              <div className="glassmorphism rounded-xl p-6 border border-dark-800 flex items-center space-x-4">
                <div className="p-3 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-dark-400 uppercase tracking-wider">Total Applications</p>
                  <p className="text-2xl font-bold text-white mt-1">{analyticsData?.totalApplications ?? 0}</p>
                </div>
              </div>
              
              {/* Metric Card 3 */}
              <div className="glassmorphism rounded-xl p-6 border border-dark-800 flex items-center space-x-4">
                <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-dark-400 uppercase tracking-wider">Avg AI Suitability</p>
                  <p className="text-2xl font-bold text-white mt-1">
                    {analyticsData?.averageMatchScore ? `${analyticsData.averageMatchScore}%` : 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {/* Funnel & Average score per Job */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Applicant Pipeline Status Funnel */}
              <div className="glassmorphism rounded-xl p-6 border border-dark-800 space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-primary-500/10 text-primary-400 border border-primary-500/20">
                    <BarChart3 className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-bold text-white">Applicant Status Pipeline</h3>
                </div>
                <div className="space-y-4 pt-2">
                  {(() => {
                    const statuses = ['APPLIED', 'SCREENING', 'INTERVIEWING', 'OFFERED', 'HIRED', 'REJECTED'];
                    const breakdown = analyticsData?.statusBreakdown ?? {};
                    const total = analyticsData?.totalApplications ?? 0;
                    
                    return statuses.map(status => {
                      const count = breakdown[status] ?? 0;
                      const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
                      
                      let barColor = 'bg-primary-500';
                      if (status === 'SCREENING') barColor = 'bg-amber-500';
                      if (status === 'INTERVIEWING') barColor = 'bg-blue-500';
                      if (status === 'OFFERED') barColor = 'bg-teal-500';
                      if (status === 'HIRED') barColor = 'bg-emerald-500';
                      if (status === 'REJECTED') barColor = 'bg-rose-500';
                      
                      return (
                        <div key={status} className="space-y-1.5">
                          <div className="flex justify-between text-xs font-semibold">
                            <span className="text-dark-300 uppercase tracking-wider text-[10px]">{status}</span>
                            <span className="text-white">{count} ({percentage}%)</span>
                          </div>
                          <div className="h-2 w-full bg-dark-900 border border-dark-800 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${barColor} transition-all duration-500`} 
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>

              {/* Average Match Score per Job Listing */}
              <div className="glassmorphism rounded-xl p-6 border border-dark-800 space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <Cpu className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-bold text-white">Average AI Suitability by Job</h3>
                </div>
                <div className="space-y-4 pt-2 overflow-y-auto max-h-[300px] pr-1">
                  {!analyticsData?.jobMatchScores || Object.keys(analyticsData.jobMatchScores).length === 0 ? (
                    <p className="text-xs text-dark-500 italic py-4">No jobs or matching data available.</p>
                  ) : (
                    Object.entries(analyticsData.jobMatchScores).map(([title, avgScore]) => (
                      <div key={title} className="space-y-1.5">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-dark-200 truncate max-w-[250px]">{title}</span>
                          <span className="text-emerald-400">{avgScore}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-dark-900 border border-dark-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-emerald-500 transition-all duration-500" 
                            style={{ width: `${avgScore}%` }}
                          />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Form: Post a Job */}
            <div className="glassmorphism rounded-xl p-6 border border-dark-800 space-y-4">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-lg bg-primary-500/10 text-primary-400 border border-primary-500/20">
                  <PlusCircle className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-white">Post New Job Listing</h3>
              </div>
              <form onSubmit={handlePostJob} className="space-y-4 pt-2">
                <div>
                  <label htmlFor="jobTitle" className="block text-xs font-medium text-dark-300 mb-1">
                    Job Title
                  </label>
                  <input
                    id="jobTitle"
                    type="text"
                    required
                    placeholder="e.g. Senior Java Developer"
                    className="block w-full px-3 py-2.5 bg-dark-900/50 border border-dark-800 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-transparent transition-all"
                    value={jobTitleInput}
                    onChange={(e) => setJobTitleInput(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="jobLoc" className="block text-xs font-medium text-dark-300 mb-1">
                      Location
                    </label>
                    <input
                      id="jobLoc"
                      type="text"
                      placeholder="e.g. Remote / San Francisco, CA"
                      className="block w-full px-3 py-2.5 bg-dark-900/50 border border-dark-800 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-transparent transition-all"
                      value={jobLocInput}
                      onChange={(e) => setJobLocInput(e.target.value)}
                    />
                  </div>
                  <div>
                    <label htmlFor="jobSalary" className="block text-xs font-medium text-dark-300 mb-1">
                      Salary Range
                    </label>
                    <input
                      id="jobSalary"
                      type="text"
                      placeholder="e.g. $120,000 - $140,000"
                      className="block w-full px-3 py-2.5 bg-dark-900/50 border border-dark-800 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-transparent transition-all"
                      value={jobSalaryInput}
                      onChange={(e) => setJobSalaryInput(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="jobDesc" className="block text-xs font-medium text-dark-300 mb-1">
                    Job Description
                  </label>
                  <textarea
                    id="jobDesc"
                    required
                    rows="3"
                    placeholder="Describe the responsibilities and team role details..."
                    className="block w-full px-3 py-2.5 bg-dark-900/50 border border-dark-800 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-transparent transition-all"
                    value={jobDescInput}
                    onChange={(e) => setJobDescInput(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="jobReqs" className="block text-xs font-medium text-dark-300 mb-1">
                    Job Requirements / Core Technologies
                  </label>
                  <textarea
                    id="jobReqs"
                    rows="2"
                    placeholder="e.g. Java, Spring Boot, MySQL, REST APIs, Git"
                    className="block w-full px-3 py-2.5 bg-dark-900/50 border border-dark-800 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-transparent transition-all"
                    value={jobReqsInput}
                    onChange={(e) => setJobReqsInput(e.target.value)}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="glow-btn py-2.5 px-4 bg-primary-600 hover:bg-primary-500 text-white font-medium rounded-xl text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer w-full"
                >
                  <span>Post Job Opportunity</span>
                </button>
              </form>
            </div>

            {/* List: Registered Candidates */}
            <div className="glassmorphism rounded-xl p-6 border border-dark-800 space-y-4">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  <ListCollapse className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-white">Candidates Applied</h3>
              </div>
              <div className="space-y-3 overflow-y-auto max-h-[450px] pt-2 pr-1">
                {candidates.length === 0 ? (
                  <div className="text-center py-8 text-xs text-dark-500 italic">
                    No candidates found.
                  </div>
                ) : (
                  candidates.map((cand, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-dark-900/40 border border-dark-800/60 flex flex-col space-y-3 card-hover">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-semibold text-white">{cand.name}</span>
                            <span className="text-[10px] text-primary-400 font-bold uppercase bg-primary-500/5 px-2 py-0.5 rounded border border-primary-500/10">
                              Job: {cand.jobTitle || 'General'}
                            </span>
                          </div>
                          <div className="flex items-center space-x-3 text-[10px] text-dark-400">
                            <span>{cand.email}</span>
                            {cand.resumeUrl && (
                              <>
                                <span className="text-dark-600">•</span>
                                <a 
                                  href={getResumeDownloadUrl(cand.resumeUrl)} 
                                  target="_blank" 
                                  rel="noreferrer" 
                                  className="text-primary-400 hover:underline font-bold"
                                >
                                  View Resume PDF
                                </a>
                              </>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-4 justify-between sm:justify-end">
                          <div className="text-right">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              cand.matchScore === 'Pending' ? 'bg-dark-800 text-dark-400 border border-dark-750' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            } border`}>
                              {cand.matchScore} {cand.matchScore !== 'Pending' && 'Match'}
                            </span>
                          </div>
                          
                          {cand.applicationId && (
                            <div className="flex items-center space-x-2">
                              <label className="text-[9px] uppercase font-bold text-dark-500">Status:</label>
                              <select
                                className="px-2 py-1 bg-dark-900 border border-dark-800 rounded text-xs text-white focus:outline-none"
                                value={cand.status}
                                onChange={(e) => handleUpdateStatus(cand.applicationId, e.target.value)}
                                disabled={loading}
                              >
                                <option value="APPLIED">Applied</option>
                                <option value="SCREENING">Screening</option>
                                <option value="INTERVIEWING">Interviewing</option>
                                <option value="OFFERED">Offered</option>
                                <option value="HIRED">Hired</option>
                                <option value="REJECTED">Rejected</option>
                              </select>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* AI suitability summary */}
                      {cand.aiSummary && (
                        <div className="p-3 rounded-lg bg-primary-500/5 border border-primary-500/10 text-[11px] text-dark-300 space-y-1">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-1.5 text-[10px] uppercase font-bold text-primary-400">
                              <Cpu className="h-3 w-3" />
                              <span>AI Matching Summary</span>
                            </div>
                            {cand.aiSummary.length > 120 && (
                              <button
                                onClick={() => toggleSummary(idx)}
                                className="text-[10px] text-primary-400 hover:text-primary-300 font-bold flex items-center space-x-1 cursor-pointer bg-transparent border-none focus:outline-none"
                              >
                                <span>{expandedSummaries[idx] ? 'Show Less' : 'Show More'}</span>
                                <span>{expandedSummaries[idx] ? '▲' : '▼'}</span>
                              </button>
                            )}
                          </div>
                          <p className="leading-relaxed font-mono">
                            {expandedSummaries[idx] 
                              ? cand.aiSummary 
                              : (cand.aiSummary.length > 120 
                                  ? `${cand.aiSummary.substring(0, 120)}...` 
                                  : cand.aiSummary
                                )
                            }
                          </p>
                        </div>
                      )}

                      {/* Interview Management Section */}
                      <div className="pt-2.5 border-t border-dark-800/60 flex flex-col space-y-2">
                        <div className="flex items-center justify-between">
                          <button
                            onClick={() => toggleInterviews(cand.applicationId)}
                            className="text-xs text-primary-400 hover:text-primary-300 font-bold flex items-center space-x-1 cursor-pointer bg-transparent border-none focus:outline-none"
                          >
                            <span>{expandedInterviews[cand.applicationId] ? 'Hide Interviews' : 'View Interviews'}</span>
                            <span className="text-[10px]">{expandedInterviews[cand.applicationId] ? '▲' : '▼'}</span>
                          </button>
                          
                          <button
                            onClick={() => handleOpenScheduleModal(cand.applicationId)}
                            className="px-2.5 py-1 bg-primary-600 hover:bg-primary-500 text-white text-[10px] font-bold rounded-lg transition-colors flex items-center space-x-1 cursor-pointer"
                          >
                            <span>Schedule Interview</span>
                          </button>
                        </div>

                        {/* Expandable Interview List */}
                        {expandedInterviews[cand.applicationId] && (
                          <div className="space-y-3 pt-2">
                            {!interviews[cand.applicationId] || interviews[cand.applicationId].length === 0 ? (
                              <p className="text-[10px] text-dark-500 italic pl-1">No interviews scheduled yet.</p>
                            ) : (
                              interviews[cand.applicationId].map((item) => (
                                <div key={item.id} className="p-3 rounded-lg bg-dark-950/40 border border-dark-800 flex flex-col space-y-2">
                                  <div className="flex items-start justify-between">
                                    <div className="space-y-1">
                                      <h5 className="text-xs font-bold text-white">{item.title}</h5>
                                      <p className="text-[10px] text-dark-400">
                                        Scheduled: {new Date(item.scheduledAt).toLocaleString()} ({item.durationMinutes} mins)
                                      </p>
                                      {item.location && (
                                        <p className="text-[10px] text-primary-400 font-medium truncate max-w-[250px]">
                                          Link: <a href={item.location.startsWith('http') ? item.location : `https://${item.location}`} target="_blank" rel="noreferrer" className="hover:underline">{item.location}</a>
                                        </p>
                                      )}
                                      {item.notes && (
                                        <p className="text-[10px] text-dark-400 italic">Notes: {item.notes}</p>
                                      )}
                                    </div>
                                    <div className="flex flex-col items-end space-y-1.5">
                                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold border ${
                                        item.status === 'SCHEDULED' 
                                          ? 'bg-primary-500/10 text-primary-400 border-primary-500/20' 
                                          : item.status === 'COMPLETED' 
                                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                                            : 'bg-red-500/10 text-red-400 border-red-500/20'
                                      }`}>
                                        {item.status}
                                      </span>
                                      
                                      {/* Status update controls */}
                                      {item.status === 'SCHEDULED' && (
                                        <div className="flex items-center space-x-1">
                                          <button
                                            onClick={() => handleUpdateInterviewStatus(cand.applicationId, item.id, 'COMPLETED')}
                                            className="px-1.5 py-0.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 text-[8px] font-semibold rounded border border-emerald-500/20 cursor-pointer"
                                          >
                                            Complete
                                          </button>
                                          <button
                                            onClick={() => handleUpdateInterviewStatus(cand.applicationId, item.id, 'CANCELLED')}
                                            className="px-1.5 py-0.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 text-[8px] font-semibold rounded border border-red-500/20 cursor-pointer"
                                          >
                                            Cancel
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  {/* AI Questions Subcard */}
                                  <div className="mt-1 p-2.5 rounded-md bg-purple-500/5 border border-purple-500/10 space-y-2">
                                    <div className="flex items-center justify-between">
                                      <span className="text-[9px] uppercase font-bold text-purple-400 flex items-center space-x-1">
                                        <Cpu className="h-3 w-3" />
                                        <span>AI Tailored Questions</span>
                                      </span>
                                      <div className="flex items-center space-x-1.5">
                                        {item.aiQuestions && (
                                          <button
                                            onClick={() => handleCopyQuestions(item.aiQuestions)}
                                            className="text-[9px] text-purple-300 hover:text-purple-200 hover:underline cursor-pointer bg-transparent border-none"
                                          >
                                            Copy
                                          </button>
                                        )}
                                        <button
                                          onClick={() => handleGenerateQuestions(cand.applicationId, item.id)}
                                          className="text-[9px] text-purple-300 hover:text-purple-200 hover:underline cursor-pointer bg-transparent border-none"
                                        >
                                          {item.aiQuestions ? 'Regenerate' : 'Generate'}
                                        </button>
                                      </div>
                                    </div>
                                    {item.aiQuestions ? (
                                      <p className="text-[10px] text-dark-300 whitespace-pre-wrap font-mono leading-normal pl-1">
                                        {item.aiQuestions}
                                      </p>
                                    ) : (
                                      <p className="text-[10px] text-dark-500 italic pl-1">AI Questions not generated yet. Click generate above.</p>
                                    )}
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* ADMIN CONSOLE */}
        {/* ========================================================================= */}
        {isAdmin && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* System Status Metrics */}
            <div className="glassmorphism rounded-xl p-6 border border-dark-800 space-y-4 md:col-span-1">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-lg bg-primary-500/10 text-primary-400 border border-primary-500/20">
                  <Server className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-white">System Diagnostics</h3>
              </div>
              
              {systemStats && (
                <div className="space-y-4 pt-2">
                  <div className="border-b border-dark-800 pb-3">
                    <span className="text-[10px] text-dark-500 uppercase tracking-wider block font-semibold">Total Users</span>
                    <span className="text-2xl font-bold text-white">{systemStats.totalUsers}</span>
                  </div>
                  <div className="border-b border-dark-800 pb-3">
                    <span className="text-[10px] text-dark-500 uppercase tracking-wider block font-semibold">System Cpu Load</span>
                    <span className="text-lg font-bold text-white">{systemStats.systemLoad}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-dark-500 uppercase tracking-wider block font-semibold mb-2">Active Neural Engines</span>
                    <div className="flex flex-wrap gap-1.5">
                      {systemStats.activeEngines?.map((eng, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded bg-primary-500/10 text-primary-400 border border-primary-500/20 text-[9px] font-bold">
                          {eng}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* List: Users Registry */}
            <div className="glassmorphism rounded-xl p-6 border border-dark-800 space-y-4 md:col-span-2">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  <User className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-white">Registered Accounts</h3>
              </div>
              <div className="overflow-y-auto max-h-[300px] border border-dark-850 rounded-xl bg-dark-900/20">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-dark-800 bg-dark-900/60 text-dark-400 font-semibold">
                      <th className="p-3">Name</th>
                      <th className="p-3">Email</th>
                      <th className="p-3">Roles</th>
                      <th className="p-3 text-right">State</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersList.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="text-center py-8 text-dark-500 italic">No users found.</td>
                      </tr>
                    ) : (
                      usersList.map((usr, idx) => (
                        <tr key={idx} className="border-b border-dark-800/40 hover:bg-dark-900/30 transition-colors">
                          <td className="p-3 font-medium text-white">{usr.firstName} {usr.lastName}</td>
                          <td className="p-3 text-dark-300">{usr.email}</td>
                          <td className="p-3">
                            <div className="flex gap-1">
                              {usr.roles?.map((r, i) => (
                                <span key={i} className="px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400 text-[8px] font-bold border border-purple-500/20">
                                  {r.name?.replace('ROLE_', '')}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="p-3 text-right">
                            <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${
                              usr.active 
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'bg-red-500/10 text-red-400 border border-red-500/20'
                            }`}>
                              {usr.active ? 'Active' : 'Suspended'}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Schedule Interview Modal overlay */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-dark-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-dark-900 border border-dark-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden space-y-4">
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-primary-500/5 blur-2xl -mr-10 -mt-10 pointer-events-none" />
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary-600/20 text-primary-400 border border-primary-500/20 rounded-xl">
                  <Briefcase className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-white">Schedule Candidate Interview</h3>
              </div>
              <button
                onClick={() => setShowScheduleModal(false)}
                className="p-1 rounded-lg text-dark-400 hover:text-white hover:bg-dark-800 transition-colors bg-transparent border-none cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleScheduleInterview} className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-dark-300 mb-1">Interview Title</label>
                <input
                  type="text"
                  required
                  className="block w-full px-3 py-2 bg-dark-950/50 border border-dark-800 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                  value={interviewTitle}
                  onChange={(e) => setInterviewTitle(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-dark-300 mb-1">Date & Time</label>
                <input
                  type="datetime-local"
                  required
                  className="block w-full px-3 py-2 bg-dark-950/50 border border-dark-800 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                  value={interviewDate}
                  onChange={(e) => setInterviewDate(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-dark-300 mb-1">Duration (minutes)</label>
                <input
                  type="number"
                  required
                  min="10"
                  max="180"
                  className="block w-full px-3 py-2 bg-dark-950/50 border border-dark-800 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                  value={interviewDuration}
                  onChange={(e) => setInterviewDuration(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-dark-300 mb-1">Location / Meet Link</label>
                <input
                  type="text"
                  placeholder="e.g. google.com/meet/abc-def-ghi"
                  className="block w-full px-3 py-2 bg-dark-950/50 border border-dark-800 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                  value={interviewLocation}
                  onChange={(e) => setInterviewLocation(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-dark-300 mb-1">Recruiter Notes</label>
                <textarea
                  rows="3"
                  placeholder="Add any instructions, setup steps, or prep items for candidate..."
                  className="block w-full px-3 py-2 bg-dark-950/50 border border-dark-800 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                  value={interviewNotes}
                  onChange={(e) => setInterviewNotes(e.target.value)}
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="px-4 py-2 bg-dark-800 hover:bg-dark-700 text-dark-300 font-medium rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white font-medium rounded-xl text-xs transition-all cursor-pointer flex items-center space-x-1.5"
                >
                  {loading && <Loader2 className="h-3 w-3 animate-spin" />}
                  <span>Schedule Interview</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="glassmorphism border-t border-dark-800/40 py-4 px-6 text-center text-xs text-dark-500">
        &copy; {new Date().getFullYear()} AI Recruitment Management System. All rights reserved.
      </footer>
    </div>
  );
}

export default Dashboard;
