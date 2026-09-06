import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, Briefcase, Award, Building, Compass, Sparkles, Save,
  FileText, Plus, X, Check, Target, Zap, ArrowRight, ShieldCheck
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useApp } from '../context/AppContext';
import { createOrUpdateProfile } from '../api/profileApi';
import toast from 'react-hot-toast';

const EXPERIENCE_LEVELS = [
  { value: 'fresher', label: 'Fresher', desc: '0-1 yrs • College / Entry' },
  { value: 'entry', label: 'Entry Level', desc: '1-3 yrs • Junior Engineer' },
  { value: 'intermediate', label: 'Intermediate', desc: '3-6 yrs • Mid-Level Pro' },
  { value: 'experienced', label: 'Experienced', desc: '6+ yrs • Senior / Lead' },
];

const POPULAR_SKILL_PRESETS: Record<string, string[]> = {
  ml: ['Python', 'PyTorch', 'TensorFlow', 'Scikit-Learn', 'Pandas', 'NumPy', 'FastAPI', 'Docker', 'MLOps', 'SQL', 'NLP', 'Computer Vision'],
  software: ['Python', 'TypeScript', 'JavaScript', 'React', 'Node.js', 'PostgreSQL', 'Docker', 'REST APIs', 'System Design', 'Git', 'AWS'],
  data: ['Python', 'SQL', 'Pandas', 'Tableau', 'Power BI', 'PySpark', 'ETL Pipelines', 'BigQuery', 'Data Modeling', 'Statistics'],
  general: ['Python', 'Java', 'SQL', 'Git', 'Data Structures', 'Algorithms', 'Communication', 'Problem Solving', 'Agile / Scrum'],
};

export default function ProfilePage() {
  const navigate = useNavigate();
  const { profile, setProfile, resumeData } = useApp();

  const [name, setName] = useState(profile?.name || '');
  const [targetRole, setTargetRole] = useState(profile?.targetRole || '');
  const [experienceLevel, setExperienceLevel] = useState<string>(profile?.experienceLevel || 'fresher');
  const [yearsExperience, setYearsExperience] = useState<number>(profile?.yearsExperience ?? 0);
  const [skills, setSkills] = useState<string[]>(profile?.skills || []);
  const [newSkillInput, setNewSkillInput] = useState('');
  const [targetCompany, setTargetCompany] = useState(profile?.targetCompany || '');
  const [industry, setIndustry] = useState(profile?.industry || '');
  const [careerGoal, setCareerGoal] = useState(profile?.careerGoal || '');
  const [saving, setSaving] = useState(false);

  // Sync state if profile loads asynchronously
  useEffect(() => {
    if (profile) {
      if (!name) setName(profile.name);
      if (!targetRole) setTargetRole(profile.targetRole);
      if (profile.skills && skills.length === 0) setSkills(profile.skills);
    }
  }, [profile]);

  function handleAddSkill(skillToAdd: string) {
    const trimmed = skillToAdd.trim();
    if (!trimmed) return;
    if (!skills.some((s) => s.toLowerCase() === trimmed.toLowerCase())) {
      setSkills((prev) => [...prev, trimmed]);
    }
    setNewSkillInput('');
  }

  function handleRemoveSkill(skillToRemove: string) {
    setSkills((prev) => prev.filter((s) => s !== skillToRemove));
  }

  function handleAddAllResumeSkills() {
    if (!resumeData?.skills) return;
    const combined = Array.from(new Set([...skills, ...resumeData.skills]));
    setSkills(combined);
    toast.success(`Imported ${resumeData.skills.length} skills from resume!`);
  }

  async function handleSave() {
    if (!name.trim()) {
      toast.error('Please enter your full name.');
      return;
    }
    if (!targetRole.trim()) {
      toast.error('Please specify your target job role.');
      return;
    }

    setSaving(true);
    try {
      const saved = await createOrUpdateProfile({
        id: profile?.id,
        name: name.trim(),
        targetRole: targetRole.trim(),
        experienceLevel: experienceLevel as any,
        skills,
        yearsExperience: Number(yearsExperience) || 0,
        targetCompany: targetCompany.trim() || undefined,
        industry: industry.trim() || undefined,
        careerGoal: careerGoal.trim() || undefined,
        resumeText: profile?.resumeText,
      });

      setProfile(saved);
      toast.success('Candidate profile updated successfully!');
    } catch {
      toast.error('Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  // Calculate profile completeness
  const checklist = [
    { label: 'Full Name', done: Boolean(name.trim()) },
    { label: 'Target Job Role', done: Boolean(targetRole.trim()) },
    { label: 'Skills Added (3+)', done: skills.length >= 3 },
    { label: 'Experience Level', done: Boolean(experienceLevel) },
    { label: 'Target Company / Goal', done: Boolean(targetCompany.trim() || careerGoal.trim()) },
  ];
  const completedItems = checklist.filter((c) => c.done).length;
  const completenessPercent = Math.round((completedItems / checklist.length) * 100);

  // Skill presets selection based on role
  const isML = targetRole.toLowerCase().includes('machine') || targetRole.toLowerCase().includes('ml') || targetRole.toLowerCase().includes('ai');
  const isData = targetRole.toLowerCase().includes('data') || targetRole.toLowerCase().includes('analyst');
  const activePresets = isML ? POPULAR_SKILL_PRESETS.ml : isData ? POPULAR_SKILL_PRESETS.data : POPULAR_SKILL_PRESETS.software;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 shadow-xl border border-slate-800">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-extrabold text-2xl shadow-lg border-2 border-indigo-400/40">
              {name ? name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() : 'RS'}
            </div>
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-500/30">
                <Sparkles className="w-3.5 h-3.5" /> IBM watsonx Orchestrate Identity
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Candidate Profile
              </h1>
              <p className="text-slate-300 text-sm max-w-xl">
                Configure your background, skill competencies, and target benchmarks used by the AI interviewer.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              size="md"
              onClick={() => navigate('/prepare/resume')}
              icon={<FileText className="w-4 h-4" />}
              className="bg-white/10 text-white hover:bg-white/20 border-white/10 text-xs sm:text-sm"
            >
              Resume Upload
            </Button>
            <Button
              size="md"
              onClick={handleSave}
              loading={saving}
              icon={<Save className="w-4 h-4" />}
              className="shadow-lg shadow-indigo-600/30 text-xs sm:text-sm"
            >
              Save Profile
            </Button>
          </div>
        </div>

        {/* Ambient glow */}
        <div className="absolute right-0 top-0 -mt-10 -mr-10 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Form Sections */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section 1: Basic Information */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5">
            <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <User className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Basic Information</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Your personal details and primary interview role</p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. RUKESH S G"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 dark:focus:border-indigo-400 outline-none transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  Target Job Role <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="e.g. Machine learning engineer, Full Stack Developer"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 dark:focus:border-indigo-400 outline-none transition-all"
                />
              </div>
            </div>

            {/* Experience Level Matrix */}
            <div className="space-y-2 pt-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Experience Level
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {EXPERIENCE_LEVELS.map((lvl) => {
                  const active = experienceLevel === lvl.value;
                  return (
                    <button
                      key={lvl.value}
                      type="button"
                      onClick={() => setExperienceLevel(lvl.value)}
                      className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                        active
                          ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-950 dark:text-indigo-200 ring-2 ring-indigo-600/20 shadow-xs'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 hover:border-slate-300 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold">{lvl.label}</span>
                        {active && <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />}
                      </div>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">{lvl.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 pt-1">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Years of Experience
                </label>
                <input
                  type="number"
                  min={0}
                  max={40}
                  value={yearsExperience}
                  onChange={(e) => setYearsExperience(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 dark:focus:border-indigo-400 outline-none transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Target Company (optional)
                </label>
                <input
                  type="text"
                  value={targetCompany}
                  onChange={(e) => setTargetCompany(e.target.value)}
                  placeholder="e.g. Google, IBM, Microsoft, Amazon"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 dark:focus:border-indigo-400 outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Interactive Skills Matrix */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/50 flex items-center justify-center text-purple-600 dark:text-purple-400">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">Technical Skills & Competencies</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Used by IBM Agent to tailor questions and evaluation rubrics</p>
                </div>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                {skills.length} Skills
              </span>
            </div>

            {/* Live Tag List */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Active Skill Tags
              </label>
              <div className="min-h-[60px] p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/40 flex flex-wrap items-center gap-2">
                {skills.length === 0 ? (
                  <span className="text-xs text-slate-400 italic">No skills added yet. Add skills below or click presets.</span>
                ) : (
                  skills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold shadow-2xs group hover:border-rose-300 transition-colors"
                    >
                      <span>{skill}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className="w-3.5 h-3.5 rounded-full hover:bg-rose-100 dark:hover:bg-rose-950/60 text-slate-400 hover:text-rose-600 flex items-center justify-center transition-colors"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </span>
                  ))
                )}
              </div>
            </div>

            {/* Add Skill Input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newSkillInput}
                onChange={(e) => setNewSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSkill(newSkillInput);
                  }
                }}
                placeholder="Type a skill (e.g. PyTorch, MLOps, SQL) and press Enter..."
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 dark:focus:border-indigo-400 outline-none transition-all"
              />
              <Button
                size="md"
                variant="secondary"
                onClick={() => handleAddSkill(newSkillInput)}
                icon={<Plus className="w-4 h-4" />}
              >
                Add
              </Button>
            </div>

            {/* Quick Add Presets */}
            <div className="space-y-2 pt-1">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Quick-Add Recommended Skills:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {activePresets.map((preset) => {
                  const isAdded = skills.some((s) => s.toLowerCase() === preset.toLowerCase());
                  return (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => (isAdded ? handleRemoveSkill(preset) : handleAddSkill(preset))}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all flex items-center gap-1 ${
                        isAdded
                          ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-300 dark:border-indigo-700 font-semibold'
                          : 'bg-white dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-indigo-300'
                      }`}
                    >
                      {isAdded ? <Check className="w-3 h-3 text-indigo-600 dark:text-indigo-400" /> : <Plus className="w-3 h-3 opacity-60" />}
                      <span>{preset}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Resume Skills Import */}
            {resumeData?.skills && resumeData.skills.length > 0 && (
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                    <FileText className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Resume Skills Detected ({resumeData.skills.length})</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddAllResumeSkills}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                  >
                    Add All to Profile
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {resumeData.skills.map((rs) => {
                    const isAdded = skills.some((s) => s.toLowerCase() === rs.toLowerCase());
                    return (
                      <button
                        key={rs}
                        type="button"
                        onClick={() => (isAdded ? handleRemoveSkill(rs) : handleAddSkill(rs))}
                        className={`px-2.5 py-0.5 rounded-md text-[11px] border transition-colors ${
                          isAdded
                            ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800 font-semibold'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-indigo-300'
                        }`}
                      >
                        {rs} {isAdded && '✓'}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Section 3: Career Objectives */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5">
            <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <Compass className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Career Vision & Industry Focus</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Contextualizes behavioral & scenario questions</p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Target Industry Sector
                </label>
                <input
                  type="text"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  placeholder="e.g. Artificial Intelligence, Cloud, FinTech"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 dark:focus:border-indigo-400 outline-none transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Primary Career Goal
                </label>
                <input
                  type="text"
                  value={careerGoal}
                  onChange={(e) => setCareerGoal(e.target.value)}
                  placeholder="e.g. Lead ML Engineer building production LLM pipelines"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 dark:focus:border-indigo-400 outline-none transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Profile Identity Card & Readiness */}
        <div className="space-y-6">
          {/* Real-time Preview Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Live AI Benchmark Card</span>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full">
                <ShieldCheck className="w-3 h-3" /> Ready
              </span>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-black text-xl flex items-center justify-center shadow-md">
                {name ? name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() : 'RS'}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white truncate">
                  {name || 'Candidate Name'}
                </h3>
                <p className="text-xs font-medium text-indigo-600 dark:text-indigo-400 truncate">
                  {targetRole || 'Target Role Not Set'}
                </p>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-1 capitalize">
                  <span>{experienceLevel}</span>
                  <span>•</span>
                  <span>{yearsExperience} yrs exp</span>
                </div>
              </div>
            </div>

            {targetCompany && (
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs font-semibold text-slate-700 dark:text-slate-300">
                <Building className="w-3.5 h-3.5 text-indigo-500" />
                <span>Targeting {targetCompany}</span>
              </div>
            )}

            {/* Profile Completeness Gauge */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-700 dark:text-slate-300">Profile Completeness</span>
                <span className="text-indigo-600 dark:text-indigo-400">{completenessPercent}%</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-indigo-500 to-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${completenessPercent}%` }}
                />
              </div>
              <div className="space-y-1.5 pt-1">
                {checklist.map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-[11px]">
                    <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center ${
                      item.done ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-400'
                    }`}>
                      <Check className="w-2.5 h-2.5" />
                    </div>
                    <span className={item.done ? 'text-slate-700 dark:text-slate-300 font-medium' : 'text-slate-400'}>
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5 pt-3">
              <Button
                onClick={handleSave}
                loading={saving}
                icon={<Save className="w-4 h-4" />}
                className="w-full justify-center shadow-lg shadow-indigo-600/20"
              >
                Save Changes
              </Button>
              <Button
                variant="secondary"
                onClick={() => navigate('/prepare/setup')}
                icon={<ArrowRight className="w-4 h-4" />}
                className="w-full justify-center text-xs"
              >
                Launch Mock Interview
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
