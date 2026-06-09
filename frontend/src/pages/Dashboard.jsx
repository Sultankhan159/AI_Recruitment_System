import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LogOut, User, Cpu, FileText, CheckCircle, 
  Sparkles, ListCollapse, Award, Settings, MessageSquare,
  Shield, Server, Loader2, Send, PlusCircle, Trash2, Edit2, Briefcase, GraduationCap, Check, X, Star
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

  // Role-Specific Data States
  const [candidates, setCandidates] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [systemStats, setSystemStats] = useState(null);
  const [profileData, setProfileData] = useState(null);

  // Input States
  const [jobIdInput, setJobIdInput] = useState('');
  const [jobTitleInput, setJobTitleInput] = useState('');
  const [jobDescInput, setJobDescInput] = useState('');

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
      } else if (isRecruiter) {
        const candList = await RecruiterService.getCandidates();
        setCandidates(candList);
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

  // Candidate: Job Application
  const handleApply = async (e) => {
    e.preventDefault();
    if (!jobIdInput) return;
    setLoading(true);
    setSuccessMsg('');
    setErrorMsg('');
    try {
      const res = await CandidateService.applyForJob(jobIdInput);
      setSuccessMsg(res.message || 'Application submitted successfully!');
      setJobIdInput('');
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to submit application.');
    } finally {
      setLoading(false);
    }
  };

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
      const res = await RecruiterService.postJob(jobTitleInput, jobDescInput);
      setSuccessMsg(res.message || 'Job posting created successfully!');
      setJobTitleInput('');
      setJobDescInput('');
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to post job listing.');
    } finally {
      setLoading(false);
    }
  };

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
              {/* Left Column: Quick Actions & Basic Info */}
              <div className="space-y-8 lg:col-span-1">
                {/* Action 1: Apply for Job */}
                <div className="glassmorphism rounded-xl p-6 border border-dark-800 space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 rounded-lg bg-primary-500/10 text-primary-400 border border-primary-500/20">
                      <Send className="h-5 w-5" />
                    </div>
                    <h3 className="text-lg font-bold text-white">Apply for Job Listing</h3>
                  </div>
                  <p className="text-xs text-dark-400 leading-relaxed">
                    Apply directly to active job listings by entering the Job ID.
                  </p>
                  <form onSubmit={handleApply} className="space-y-4 pt-2">
                    <div>
                      <label htmlFor="jobId" className="block text-xs font-medium text-dark-300 mb-1">
                        Job Identification Code
                      </label>
                      <input
                        id="jobId"
                        type="text"
                        required
                        placeholder="Enter Job ID (e.g. 123)"
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
                        <span className="text-dark-500 block">Resume Repository URL</span>
                        {profileData?.resumeUrl ? (
                          <a href={profileData.resumeUrl} target="_blank" rel="noreferrer" className="text-primary-400 hover:underline font-medium break-all">
                            {profileData.resumeUrl}
                          </a>
                        ) : (
                          <span className="text-dark-400 italic">No link submitted</span>
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
          </div>
        )}

        {/* ========================================================================= */}
        {/* RECRUITER CONSOLE */}
        {/* ========================================================================= */}
        {isRecruiter && (
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
                    placeholder="e.g. Senior Java developer"
                    className="block w-full px-3 py-2.5 bg-dark-900/50 border border-dark-800 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-transparent transition-all"
                    value={jobTitleInput}
                    onChange={(e) => setJobTitleInput(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="jobDesc" className="block text-xs font-medium text-dark-300 mb-1">
                    Job Description / Requirements
                  </label>
                  <textarea
                    id="jobDesc"
                    required
                    rows="3"
                    placeholder="Describe requirements and technologies (e.g. Spring Boot, AWS, MySQL)"
                    className="block w-full px-3 py-2.5 bg-dark-900/50 border border-dark-800 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-transparent transition-all"
                    value={jobDescInput}
                    onChange={(e) => setJobDescInput(e.target.value)}
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
              <div className="space-y-3 overflow-y-auto max-h-[320px] pt-2 pr-1">
                {candidates.length === 0 ? (
                  <div className="text-center py-8 text-xs text-dark-500 italic">
                    No candidates found.
                  </div>
                ) : (
                  candidates.map((cand, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-dark-900/40 border border-dark-800/60 flex items-center justify-between card-hover">
                      <div className="space-y-1">
                        <span className="text-sm font-semibold text-white">{cand.name}</span>
                        <span className="text-[10px] text-dark-400 block">{cand.email}</span>
                      </div>
                      <div className="text-right">
                        <span className="px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold">
                          {cand.matchScore} Match
                        </span>
                      </div>
                    </div>
                  ))
                )}
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

      {/* Footer */}
      <footer className="glassmorphism border-t border-dark-800/40 py-4 px-6 text-center text-xs text-dark-500">
        &copy; {new Date().getFullYear()} AI Recruitment Management System. All rights reserved.
      </footer>
    </div>
  );
}

export default Dashboard;
