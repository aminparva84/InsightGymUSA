import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { getApiBase } from '../../services/apiBase';
import './TrainingPlansProductsTab.css';

const API_BASE = getApiBase();

const DEFAULT_BASE = [
  { id: 1, name_fa: '', name_en: 'Beginner Program', description_fa: '', description_en: 'Perfect for beginners', price: 99, features: [{ key: 'feature1', text_fa: '', text_en: 'Weekly workout plan' }, { key: 'feature2', text_fa: '', text_en: 'Nutrition guidance' }, { key: 'feature3', text_fa: '', text_en: 'Online support' }] },
  { id: 2, name_fa: '', name_en: 'Intermediate Program', description_fa: '', description_en: 'For those ready for more challenges', price: 149, features: [{ key: 'feature1', text_fa: '', text_en: 'Weekly workout plan' }, { key: 'feature2', text_fa: '', text_en: 'Nutrition guidance' }, { key: 'feature3', text_fa: '', text_en: 'Online support' }, { key: 'feature4', text_fa: '', text_en: 'Progress tracking' }] },
  { id: 3, name_fa: '', name_en: 'Advanced Program', description_fa: '', description_en: 'Comprehensive program to achieve your fitness goals', price: 199, features: [{ key: 'feature1', text_fa: '', text_en: 'Weekly workout plan' }, { key: 'feature2', text_fa: '', text_en: 'Nutrition guidance' }, { key: 'feature3', text_fa: '', text_en: 'Online support' }, { key: 'feature4', text_fa: '', text_en: 'Progress tracking' }, { key: 'feature5', text_fa: '', text_en: 'Personal coaching' }] }
];

const DEFAULT_PACKAGES = [
  { id: 'vip', name_fa: '', name_en: 'VIP Package', price: 80 },
  { id: 'weeklyPlan', name_fa: '', name_en: 'Weekly workout plan', price: 25 },
  { id: 'nutrition', name_fa: '', name_en: 'Nutrition guidance', price: 30 },
  { id: 'onlineSupport', name_fa: '', name_en: 'Online support', price: 25 },
  { id: 'progressTracking', name_fa: '', name_en: 'Progress tracking', price: 20 },
  { id: 'personalCoaching', name_fa: '', name_en: 'Personal coaching', price: 50 },
  { id: 'lifetimeAccess', name_fa: '', name_en: 'Lifetime access', price: 100 },
  { id: 'assessment', name_fa: '', name_en: 'Personal assessment', price: 40 },
  { id: 'months3', name_fa: '', name_en: '3-month program', price: 60 }
];

const TrainingPlansProductsTab = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [basePrograms, setBasePrograms] = useState(DEFAULT_BASE);
  const [packages, setPackages] = useState(DEFAULT_PACKAGES);

  const getAuthToken = useCallback(() => localStorage.getItem('token') || '', []);
  const getAxiosConfig = useCallback(() => ({
    headers: { Authorization: `Bearer ${getAuthToken()}`, 'Content-Type': 'application/json' }
  }), [getAuthToken]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/api/admin/training-plans-products`, getAxiosConfig());
      const d = res.data || {};
      if (Array.isArray(d.basePrograms) && d.basePrograms.length > 0) setBasePrograms(d.basePrograms);
      if (Array.isArray(d.packages) && d.packages.length > 0) setPackages(d.packages);
    } catch (err) {
      console.error('Error loading training plans/products:', err);
    } finally {
      setLoading(false);
    }
  }, [getAxiosConfig]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSave = async () => {
    try {
      setSaving(true);
      await axios.put(`${API_BASE}/api/admin/training-plans-products`, { basePrograms, packages }, getAxiosConfig());
      alert('Saved');
    } catch (err) {
      console.error('Error saving:', err);
      alert('Error saving');
    } finally {
      setSaving(false);
    }
  };

  const updateProgram = (index, field, value) => {
    setBasePrograms(prev => {
      const next = [...prev];
      next[index] = { ...(next[index] || {}), [field]: value };
      return next;
    });
  };

  const updateProgramFeature = (programIndex, featureIndex, field, value) => {
    setBasePrograms(prev => {
      const next = [...prev];
      const prog = next[programIndex];
      if (!prog || !Array.isArray(prog.features)) return prev;
      const feats = [...prog.features];
      feats[featureIndex] = { ...(feats[featureIndex] || {}), [field]: value };
      next[programIndex] = { ...prog, features: feats };
      return next;
    });
  };

  const updatePackage = (index, field, value) => {
    setPackages(prev => {
      const next = [...prev];
      next[index] = { ...(next[index] || {}), [field]: value };
      return next;
    });
  };

  if (loading) {
    return <div className="tpp-loading">Loading...</div>;
  }

  return (
    <div className="training-plans-products-tab" dir="ltr">
      <div className="tpp-header">
        <h2>Training Plans & Packages</h2>
        <p className="tpp-desc">Edit sub-info (names, descriptions) of base programs and packages shown in the buy modal.</p>
        <button type="button" className="btn-primary" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>
      <section className="tpp-section">
        <h3>Base programs</h3>
        {basePrograms.map((prog, idx) => (
          <div key={prog.id || idx} className="tpp-card">
            <h4>Program {prog.id}</h4>
            <div className="tpp-row">
              <div className="form-group">
                <label>Name (Primary)</label>
                <input value={prog.name_en || ''} onChange={(e) => updateProgram(idx, 'name_en', e.target.value)} placeholder="Program name" />
              </div>
              <div className="form-group">
                <label>Name (Alternate)</label>
                <input value={prog.name_fa || ''} onChange={(e) => updateProgram(idx, 'name_fa', e.target.value)} placeholder="Optional" />
              </div>
            </div>
            <div className="tpp-row">
              <div className="form-group">
                <label>Description (Primary)</label>
                <input value={prog.description_en || ''} onChange={(e) => updateProgram(idx, 'description_en', e.target.value)} placeholder="Description" />
              </div>
              <div className="form-group">
                <label>Description (Alternate)</label>
                <input value={prog.description_fa || ''} onChange={(e) => updateProgram(idx, 'description_fa', e.target.value)} placeholder="Optional" />
              </div>
            </div>
            <div className="form-group tpp-price">
              <label>Price ($)</label>
              <input type="number" min={0} value={prog.price ?? ''} onChange={(e) => updateProgram(idx, 'price', parseInt(e.target.value, 10) || 0)} />
            </div>
            <div className="tpp-features">
              <label>Features</label>
              {(prog.features || []).map((f, fi) => (
                <div key={fi} className="tpp-feature-row">
                  <input placeholder="Feature text" value={f.text_en || ''} onChange={(e) => updateProgramFeature(idx, fi, 'text_en', e.target.value)} />
                  <input placeholder="Alternate" value={f.text_fa || ''} onChange={(e) => updateProgramFeature(idx, fi, 'text_fa', e.target.value)} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>
      <section className="tpp-section">
        <h3>Packages</h3>
        {packages.map((pkg, idx) => (
          <div key={pkg.id || idx} className="tpp-card tpp-package">
            <div className="tpp-row">
              <div className="form-group">
                <label>{pkg.id} – Name</label>
                <input value={pkg.name_en || ''} onChange={(e) => updatePackage(idx, 'name_en', e.target.value)} placeholder="Package name" />
              </div>
              <div className="form-group">
                <label>Alternate Name</label>
                <input value={pkg.name_fa || ''} onChange={(e) => updatePackage(idx, 'name_fa', e.target.value)} placeholder="Optional" />
              </div>
              <div className="form-group tpp-price">
                <label>Price ($)</label>
                <input type="number" min={0} value={pkg.price ?? ''} onChange={(e) => updatePackage(idx, 'price', parseInt(e.target.value, 10) || 0)} />
              </div>
            </div>
          </div>
        ))}
      </section>
      <div className="tpp-actions">
        <button type="button" className="btn-primary" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>
    </div>
  );
};

export default TrainingPlansProductsTab;
