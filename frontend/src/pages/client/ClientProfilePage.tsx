import React, { useState, useRef } from 'react';
import { Camera, Save, Loader2, User, Mail, Phone, FileText, KeyRound, CheckCircle } from 'lucide-react';
import { Avatar } from '../../components/ui/Avatar';
import { useToast } from '../../components/ui/Toast';
import { useAuthStore } from '../../store/authStore';
import { profileService } from '../../services/profileService';
import { api } from '../../api/apiClient';
import type { User as UserType } from '../../types';

// ── Password change sub-form ──────────────────────────────────────────────────

function PasswordSection() {
  const { success, error } = useToast();
  const [form, setForm] = useState({ current: '', next: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.next !== form.confirm) { error('Les mots de passe ne correspondent pas'); return; }
    if (form.next.length < 8) { error('Minimum 8 caractères'); return; }
    setLoading(true);
    try {
      await api.patch('/api/auth/me/', {
        password: form.next,
        current_password: form.current,
      });
      success('Mot de passe mis à jour');
      setForm({ current: '', next: '', confirm: '' });
      setDone(true);
      setTimeout(() => setDone(false), 3000);
    } catch {
      error('Mot de passe actuel incorrect');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handle} className="space-y-4">
      <h3 className="text-sm font-semibold text-ink flex items-center gap-2">
        <KeyRound className="h-4 w-4 text-muted" /> Changer le mot de passe
      </h3>
      <div>
        <label className="field-label">Mot de passe actuel</label>
        <input type="password" className="field-input" value={form.current}
          onChange={(e) => setForm({ ...form, current: e.target.value })} required />
      </div>
      <div>
        <label className="field-label">Nouveau mot de passe</label>
        <input type="password" className="field-input" value={form.next}
          onChange={(e) => setForm({ ...form, next: e.target.value })} required minLength={8} />
      </div>
      <div>
        <label className="field-label">Confirmer le nouveau mot de passe</label>
        <input type="password" className="field-input" value={form.confirm}
          onChange={(e) => setForm({ ...form, confirm: e.target.value })} required />
      </div>
      <button type="submit" disabled={loading}
        className="inline-flex items-center gap-2 rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-white hover:bg-ink/80 disabled:opacity-60 transition-colors">
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : done ? <CheckCircle className="h-4 w-4" /> : <Save className="h-4 w-4" />}
        {done ? 'Modifié !' : 'Mettre à jour'}
      </button>
    </form>
  );
}

// ── ClientProfilePage ─────────────────────────────────────────────────────────

export default function ClientProfilePage() {
  const { user, setUser } = useAuthStore();
  const { success, error } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    first_name: user?.first_name ?? '',
    last_name: user?.last_name ?? '',
    email: user?.email ?? '',
    phone: user?.phone ?? '',
    bio: user?.bio ?? '',
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saved, setSaved] = useState(false);

  if (!user) return null;

  const displayName = `${user.first_name} ${user.last_name}`.trim() || user.username;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await profileService.update(form);
      setUser(updated);
      success('Profil mis à jour');
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      error('Impossible de mettre à jour le profil');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { error('Image trop grande (max 5 Mo)'); return; }
    setUploading(true);
    try {
      const updated = await profileService.uploadAvatar(file);
      setUser(updated);
      success('Photo de profil mise à jour');
    } catch {
      error('Impossible de téléverser la photo');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="px-6 py-8 max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-ink">Mon profil</h1>

      {/* ── Avatar card ── */}
      <div className="card p-6 flex items-center gap-5">
        <div className="relative shrink-0">
          <Avatar name={displayName} src={user.avatar ?? null} size="lg" />
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="absolute bottom-0 right-0 h-7 w-7 rounded-full bg-sky-600 flex items-center justify-center text-white shadow hover:bg-sky-700 disabled:opacity-60 transition-colors"
            title="Changer la photo"
          >
            {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Camera className="h-3.5 w-3.5" />}
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatar} />
        </div>
        <div>
          <p className="text-lg font-bold text-ink">{displayName}</p>
          <p className="text-sm text-muted">{user.email}</p>
          <span className="inline-block mt-1 bg-sky-100 text-sky-700 text-xs font-semibold px-2 py-0.5 rounded-full capitalize">
            {user.role}
          </span>
        </div>
      </div>

      {/* ── Info form ── */}
      <div className="card p-6">
        <h2 className="text-sm font-semibold text-ink mb-5 flex items-center gap-2">
          <User className="h-4 w-4 text-muted" /> Informations personnelles
        </h2>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="field-label">Prénom</label>
              <input className="field-input" value={form.first_name}
                onChange={(e) => setForm({ ...form, first_name: e.target.value })} />
            </div>
            <div>
              <label className="field-label">Nom</label>
              <input className="field-input" value={form.last_name}
                onChange={(e) => setForm({ ...form, last_name: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="field-label flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" />Email</label>
            <input type="email" className="field-input" value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div>
            <label className="field-label flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" />Téléphone</label>
            <input type="tel" className="field-input" placeholder="+33 6 00 00 00 00" value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div>
            <label className="field-label flex items-center gap-1.5"><FileText className="h-3.5 w-3.5" />Bio</label>
            <textarea rows={3} className="field-input h-auto py-2 resize-none" placeholder="Parlez-nous de vous…"
              value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
          </div>
          <button type="submit" disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-sky-700 disabled:opacity-60 transition-colors">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? <CheckCircle className="h-4 w-4" /> : <Save className="h-4 w-4" />}
            {saved ? 'Enregistré !' : 'Sauvegarder'}
          </button>
        </form>
      </div>

      {/* ── Password card ── */}
      <div className="card p-6">
        <PasswordSection />
      </div>
    </div>
  );
}
