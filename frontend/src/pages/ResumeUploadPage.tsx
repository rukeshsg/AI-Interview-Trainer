import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, X, CheckCircle, ArrowRight, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { useApp } from '../context/AppContext';
import { uploadResume } from '../api/resumeApi';
import toast from 'react-hot-toast';

const STEPS = ['Profile', 'Resume', 'Setup'];
const ACCEPTED = ['.pdf', '.docx'];
const MAX_MB = 10;

export default function ResumeUploadPage() {
  const navigate = useNavigate();
  const { setResumeData, profile, setProfile } = useApp();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [resumeData, setLocalResumeData] = useState<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  if (!profile) {
    navigate('/prepare');
    return null;
  }

  function validateFile(f: File): string {
    const ext = '.' + f.name.split('.').pop()?.toLowerCase();
    if (!ACCEPTED.includes(ext)) return 'Only PDF and DOCX files are supported.';
    if (f.size > MAX_MB * 1024 * 1024) return `File must be under ${MAX_MB}MB.`;
    return '';
  }

  function pickFile(f: File) {
    const err = validateFile(f);
    if (err) { setError(err); return; }
    setFile(f);
    setError('');
    setUploaded(false);
    setLocalResumeData(null);
  }

  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) pickFile(f);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) pickFile(f);
  }

  async function handleUpload() {
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const result = await uploadResume(file);
      setLocalResumeData(result.data);
      setResumeData(result.data);
      if (profile && result.data.rawText) {
        setProfile({ ...profile, resumeText: result.data.rawText });
      }
      setUploaded(true);
      toast.success('Resume parsed successfully!');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Could not parse this file. You can continue without a resume.';
      setError(msg);
    } finally {
      setUploading(false);
    }
  }

  function skipResume() {
    navigate('/prepare/setup');
  }

  function useResume() {
    navigate('/prepare/setup');
  }

  function formatSize(bytes: number) {
    return bytes < 1024 * 1024 ? `${(bytes / 1024).toFixed(0)} KB` : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {STEPS.map((step, i) => (
          <React.Fragment key={step}>
            <div className={`flex items-center gap-2 ${i === 1 ? 'text-indigo-700' : i < 1 ? 'text-green-600' : 'text-slate-400'}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold
                ${i === 1 ? 'bg-indigo-600 text-white' : i < 1 ? 'bg-green-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
                {i < 1 ? '✓' : i + 1}
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
            <FileText className="w-5 h-5 text-indigo-600" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">Resume Upload</h1>
        </div>
        <p className="text-sm text-slate-500 ml-12">Upload your resume for context-aware interview questions. You can also skip this step.</p>
      </div>

      <Card>
        {/* Drop zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => !file && inputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer
            ${dragOver ? 'border-indigo-400 bg-indigo-50' : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'}
            ${file ? 'cursor-default' : ''}`}
        >
          <input ref={inputRef} type="file" accept=".pdf,.docx" className="hidden" onChange={handleInput} />

          {!file ? (
            <div>
              <Upload className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-medium text-slate-700 mb-1">Drag & drop your resume here</p>
              <p className="text-xs text-slate-400">or click to browse — PDF or DOCX, up to {MAX_MB}MB</p>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <FileText className="w-8 h-8 text-indigo-500 flex-shrink-0" />
              <div className="text-left flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">{file.name}</p>
                <p className="text-xs text-slate-500">{formatSize(file.size)}</p>
              </div>
              {uploaded && <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />}
              <button
                onClick={(e) => { e.stopPropagation(); setFile(null); setLocalResumeData(null); setUploaded(false); setError(''); }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {error && (
          <div className="mt-3 flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Action buttons */}
        {!uploaded && (
          <div className="flex justify-between items-center mt-5">
            <Button variant="ghost" onClick={skipResume}>Skip Resume</Button>
            <Button onClick={handleUpload} disabled={!file} loading={uploading}>
              {uploading ? 'Parsing...' : 'Upload & Parse'}
            </Button>
          </div>
        )}

        {/* Resume summary */}
        {uploaded && resumeData && (
          <div className="mt-5 pt-5 border-t border-slate-100">
            <p className="text-sm font-semibold text-slate-900 mb-3">Resume Summary</p>
            <div className="space-y-3">
              {resumeData.skills?.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-1.5">Detected Skills</p>
                  <div className="flex flex-wrap gap-1.5">
                    {resumeData.skills.slice(0, 12).map((s: string) => (
                      <Badge key={s} variant="info">{s}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {resumeData.experience?.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-1">Experience</p>
                  {resumeData.experience.slice(0, 3).map((e: string, i: number) => (
                    <p key={i} className="text-xs text-slate-600 py-0.5 truncate">• {e}</p>
                  ))}
                </div>
              )}
              {resumeData.education?.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-1">Education</p>
                  {resumeData.education.slice(0, 2).map((e: string, i: number) => (
                    <p key={i} className="text-xs text-slate-600 py-0.5 truncate">• {e}</p>
                  ))}
                </div>
              )}
            </div>
            <div className="flex justify-between items-center mt-5">
              <Button variant="secondary" onClick={() => { setFile(null); setUploaded(false); setLocalResumeData(null); }}>
                Re-upload
              </Button>
              <Button onClick={useResume} icon={<ArrowRight className="w-4 h-4" />}>
                Use Resume & Continue
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
