import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, User } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input, Select } from '../components/ui/FormControls';
import { Card } from '../components/ui/Card';
import { useApp } from '../context/AppContext';
import { createOrUpdateProfile } from '../api/profileApi';
import toast from 'react-hot-toast';

const EXPERIENCE_LEVELS = [
  { value: 'fresher',      label: 'Fresher (Student / No experience)' },
  { value: 'entry',        label: 'Entry Level (0–2 years)' },
  { value: 'intermediate', label: 'Intermediate (2–5 years)' },
  { value: 'experienced',  label: 'Experienced (5+ years)' },
];

const STEPS = ['Profile', 'Resume', 'Setup'];

export default function ProfileSetupPage() {
  const navigate = useNavigate();
  const { profile, setProfile } = useApp();

  const [form, setForm] = useState({
    name:            profile?.name            || '',
    targetRole:      profile?.targetRole      || '',
    experienceLevel: profile?.experienceLevel || 'fresher',
    skills:          profile?.skills?.join(', ') || '',
    yearsExperience: profile?.yearsExperience  ?? 0,
    targetCompany:   profile?.targetCompany   || '',
    industry:        profile?.industry        || '',
    careerGoal:      profile?.careerGoal      || '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  function set(key: string, value: string | number) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: '' }));
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!form.name.trim())       e.name = 'Full name is required.';
    if (!form.targetRole.trim()) e.targetRole = 'Target role is required.';
    if (!form.skills.trim())     e.skills = 'Please enter at least one skill.';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const skills = form.skills.split(',').map((s) => s.trim()).filter(Boolean);
      const saved = await createOrUpdateProfile({
        id: profile?.id,
        name: form.name.trim(),
        targetRole: form.targetRole.trim(),
        experienceLevel: form.experienceLevel as any,
        skills,
        yearsExperience: Number(form.yearsExperience),
        targetCompany: form.targetCompany.trim() || undefined,
        industry: form.industry.trim() || undefined,
        careerGoal: form.careerGoal.trim() || undefined,
        resumeText: profile?.resumeText,
      });
      setProfile(saved);
      navigate('/prepare/resume');
    } catch {
      toast.error('Failed to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {STEPS.map((step, i) => (
          <React.Fragment key={step}>
            <div className={`flex items-center gap-2 ${i === 0 ? 'text-indigo-700' : 'text-slate-400'}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold
                ${i === 0 ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                {i + 1}
              </div>
              <span className="text-sm font-medium hidden sm:block">{step}</span>
            </div>
            {i < STEPS.length - 1 && <div className="flex-1 h-px bg-slate-200" />}
          </React.Fragment>
        ))}
      </div>

      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 bg-indigo-50 rounded-xl flex items-center justify-center">
            <User className="w-5 h-5 text-indigo-600" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">Candidate Profile</h1>
        </div>
        <p className="text-sm text-slate-500 ml-12">Tell us about yourself so we can personalize your interview experience.</p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="Full Name *" value={form.name} onChange={(e) => set('name', e.target.value)}
              placeholder="e.g. Priya Sharma" error={errors.name} />
            <Input label="Target Job Role *" value={form.targetRole} onChange={(e) => set('targetRole', e.target.value)}
              placeholder="e.g. Python Developer" error={errors.targetRole} />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Select label="Experience Level *" value={form.experienceLevel}
              onChange={(e) => set('experienceLevel', e.target.value)} options={EXPERIENCE_LEVELS} />
            <Input label="Years of Experience" type="number" value={form.yearsExperience}
              onChange={(e) => set('yearsExperience', e.target.value)} min={0} max={50} />
          </div>

          <Input label="Skills * (comma-separated)" value={form.skills}
            onChange={(e) => set('skills', e.target.value)}
            placeholder="Python, Django, SQL, REST APIs, Git" error={errors.skills}
            hint="Enter the skills most relevant to your target role" />

          <div className="border-t border-slate-100 pt-4">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-3">Optional Details</p>
            <div className="grid sm:grid-cols-2 gap-4">
              <Input label="Target Company" value={form.targetCompany}
                onChange={(e) => set('targetCompany', e.target.value)} placeholder="e.g. TCS, Infosys (optional)" />
              <Input label="Industry" value={form.industry}
                onChange={(e) => set('industry', e.target.value)} placeholder="e.g. Software, Finance" />
            </div>
            <div className="mt-4">
              <Input label="Career Goal" value={form.careerGoal}
                onChange={(e) => set('careerGoal', e.target.value)}
                placeholder="e.g. Become a full-stack developer at a product company" />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" loading={loading} icon={<ArrowRight className="w-4 h-4" />}>
              Continue to Resume Upload
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
