import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { getApiBase } from '../../services/apiBase';
import './WarmingCooldownTab.css';

const API_BASE = getApiBase();

const defaultPhase = () => ({ title_fa: '', title_en: '', steps: [] });
const defaultStep = () => ({ title_fa: '', title_en: '', body_fa: '', body_en: '' });
const getRecommendedTemplate = () => ({
  warming: {
    title_fa: 'گرم کردن فعال',
    title_en: 'Active Warm-up',
    steps: [
      {
        title_fa: 'موبیلیتی مفاصل',
        title_en: 'Joint mobility',
        body_fa: '۲ تا ۳ دقیقه حرکت نرم برای گردن، شانه، لگن، زانو و مچ‌ها. هدف: آزادسازی دامنه حرکتی.',
        body_en: '2–3 minutes of gentle mobility for neck, shoulders, hips, knees, and ankles to open range of motion.',
      },
      {
        title_fa: 'فعال‌سازی عضلات اصلی',
        title_en: 'Primary muscle activation',
        body_fa: '۲ ست سبک از حرکت‌های مرتبط (مثلاً اسکوات وزن بدن یا پرس سبک) با تمرکز روی فرم.',
        body_en: '2 light sets of related movements (e.g., bodyweight squat or light press) focusing on form.',
      },
      {
        title_fa: 'آماده‌سازی اختصاصی جلسه',
        title_en: 'Session-specific prep',
        body_fa: '۱ تا ۲ ست از اولین حرکت جلسه با وزن کم و ریتم کنترل‌شده.',
        body_en: '1–2 sets of the first exercise with light load and controlled tempo.',
      },
    ],
  },
  cooldown: {
    title_fa: 'سرد کردن و تنفس',
    title_en: 'Cooldown & Breathing',
    steps: [
      {
        title_fa: 'کاهش ضربان',
        title_en: 'Lower heart rate',
        body_fa: '۲ تا ۳ دقیقه راه‌رفتن آرام یا حرکات سبک برای بازگشت ضربان به حالت طبیعی.',
        body_en: '2–3 minutes of easy walking or light movement to bring heart rate down.',
      },
      {
        title_fa: 'کشش عضلات اصلی',
        title_en: 'Stretch key muscles',
        body_fa: 'کشش ملایم عضلات درگیر (۲۰–۳۰ ثانیه برای هر عضله). بدون درد.',
        body_en: 'Gentle stretching of worked muscles (20–30s each). No pain.',
      },
      {
        title_fa: 'تنفس آرام',
        title_en: 'Calm breathing',
        body_fa: '۳ تا ۵ نفس عمیق: دم از بینی، بازدم طولانی از دهان برای آرام‌سازی.',
        body_en: '3–5 deep breaths: inhale through nose, long exhale through mouth to relax.',
      },
    ],
  },
  ending_message_fa: 'عالی بود! خسته نباشید. کمی آب بنوشید و ریکاوری را جدی بگیرید.',
  ending_message_en: 'Great job! Hydrate and take recovery seriously.',
});

const WarmingCooldownTab = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const autoSavedTemplate = useRef(false);
  const [data, setData] = useState({
    warming: defaultPhase(),
    cooldown: defaultPhase(),
    ending_message_fa: '',
    ending_message_en: ''
  });

  const getAuthToken = useCallback(() => localStorage.getItem('token') || '', []);
  const getAxiosConfig = useCallback(() => ({
    headers: { Authorization: `Bearer ${getAuthToken()}`, 'Content-Type': 'application/json' }
  }), [getAuthToken]);

  const saveSessionPhases = useCallback(async (payload) => {
    await axios.put(`${API_BASE}/api/admin/session-phases`, payload, getAxiosConfig());
  }, [getAxiosConfig]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/api/admin/session-phases`, getAxiosConfig());
      const d = res.data || {};
      const next = {
        warming: d.warming && typeof d.warming === 'object'
          ? { title_fa: d.warming.title_fa || '', title_en: d.warming.title_en || '', steps: Array.isArray(d.warming.steps) ? d.warming.steps.map(s => ({ ...defaultStep(), ...s })) : [] }
          : defaultPhase(),
        cooldown: d.cooldown && typeof d.cooldown === 'object'
          ? { title_fa: d.cooldown.title_fa || '', title_en: d.cooldown.title_en || '', steps: Array.isArray(d.cooldown.steps) ? d.cooldown.steps.map(s => ({ ...defaultStep(), ...s })) : [] }
          : defaultPhase(),
        ending_message_fa: d.ending_message_fa || '',
        ending_message_en: d.ending_message_en || ''
      };
      const isEmpty = (!next.warming.title_fa && !next.warming.title_en && (next.warming.steps || []).length === 0)
        && (!next.cooldown.title_fa && !next.cooldown.title_en && (next.cooldown.steps || []).length === 0)
        && !next.ending_message_fa && !next.ending_message_en;
      if (isEmpty) {
        const template = getRecommendedTemplate();
        setData(template);
        if (!autoSavedTemplate.current) {
          try {
            await saveSessionPhases(template);
            autoSavedTemplate.current = true;
          } catch (err) {
            console.error('Auto-save template failed:', err);
          }
        }
      } else {
        setData(next);
      }
    } catch (err) {
      console.error('Error loading session phases:', err);
      setData(getRecommendedTemplate());
    } finally {
      setLoading(false);
    }
  }, [getAxiosConfig, saveSessionPhases]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const setWarming = (updater) => setData(prev => ({ ...prev, warming: updater(prev.warming) }));
  const setCooldown = (updater) => setData(prev => ({ ...prev, cooldown: updater(prev.cooldown) }));

  const addStep = (phase) => {
    if (phase === 'warming') setWarming(w => ({ ...w, steps: [...(w.steps || []), defaultStep()] }));
    if (phase === 'cooldown') setCooldown(c => ({ ...c, steps: [...(c.steps || []), defaultStep()] }));
  };

  const removeStep = (phase, index) => {
    if (phase === 'warming') setWarming(w => ({ ...w, steps: (w.steps || []).filter((_, i) => i !== index) }));
    if (phase === 'cooldown') setCooldown(c => ({ ...c, steps: (c.steps || []).filter((_, i) => i !== index) }));
  };

  const updateStep = (phase, index, field, value) => {
    if (phase === 'warming') {
      setWarming(w => {
        const steps = [...(w.steps || [])];
        steps[index] = { ...(steps[index] || defaultStep()), [field]: value };
        return { ...w, steps };
      });
    }
    if (phase === 'cooldown') {
      setCooldown(c => {
        const steps = [...(c.steps || [])];
        steps[index] = { ...(steps[index] || defaultStep()), [field]: value };
        return { ...c, steps };
      });
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await saveSessionPhases(data);
      alert('Saved');
    } catch (err) {
      console.error('Error saving:', err);
      alert('Error saving');
    } finally {
      setSaving(false);
    }
  };

  const renderPhase = (key, phase, setPhase) => {
    const titleLabel = key === 'warming' ? 'Warming' : 'Cooldown & Breathing';
    const steps = phase.steps || [];
    return (
      <section key={key} className="warming-cooldown-phase">
        <h3>{titleLabel}</h3>
        <div className="phase-titles">
          <div className="form-group">
            <label>Title (EN)</label>
            <input
              type="text"
              value={phase.title_fa}
              onChange={(e) => setPhase(p => ({ ...p, title_fa: e.target.value }))}
              placeholder="Warming"
            />
          </div>
          <div className="form-group">
            <label>Title (EN)</label>
            <input
              type="text"
              value={phase.title_en}
              onChange={(e) => setPhase(p => ({ ...p, title_en: e.target.value }))}
              placeholder="Warming"
            />
          </div>
        </div>
        <div className="phase-steps">
          <h4>Sub-steps</h4>
          {steps.map((step, idx) => (
            <div key={idx} className="step-block">
              <div className="step-row">
                <input
                  type="text"
                  className="step-title-fa"
                  value={step.title_fa}
                  onChange={(e) => updateStep(key, idx, 'title_fa', e.target.value)}
                  placeholder="Step title"
                />
                <input
                  type="text"
                  className="step-title-en"
                  value={step.title_en}
                  onChange={(e) => updateStep(key, idx, 'title_en', e.target.value)}
                  placeholder="Step title"
                />
                <button type="button" className="step-remove" onClick={() => removeStep(key, idx)}>×</button>
              </div>
              <div className="step-bodies">
                <textarea
                  rows={2}
                  value={step.body_fa}
                  onChange={(e) => updateStep(key, idx, 'body_fa', e.target.value)}
                  placeholder="Description"
                />
                <textarea
                  rows={2}
                  value={step.body_en}
                  onChange={(e) => updateStep(key, idx, 'body_en', e.target.value)}
                  placeholder="Description"
                />
              </div>
            </div>
          ))}
          <button type="button" className="btn-add-step" onClick={() => addStep(key)}>
            + Add sub-step
          </button>
        </div>
      </section>
    );
  };

  if (loading) {
    return <div className="warming-cooldown-loading">Loading...</div>;
  }

  return (
    <div className="warming-cooldown-tab" dir="ltr">
      <div className="warming-cooldown-header">
        <h2>Warming & Cooldown (Session Steps)</h2>
        <p className="warming-cooldown-desc">
          Set warming and cooldown/breathing content shown to members in each training session. Add sub-steps as needed.
        </p>
        <div className="warming-cooldown-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => setData(getRecommendedTemplate())}
          >
            Load recommended template
          </button>
          <button type="button" className="btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
      <div className="warming-cooldown-form">
        {renderPhase('warming', data.warming, setWarming)}
        {renderPhase('cooldown', data.cooldown, setCooldown)}
        <section className="warming-cooldown-phase">
          <h3>Ending message (encourage member)</h3>
          <div className="form-group">
            <label>Text (EN)</label>
            <textarea
              rows={3}
              value={data.ending_message_fa}
              onChange={(e) => setData(prev => ({ ...prev, ending_message_fa: e.target.value }))}
              placeholder="Great job! Keep it up."
            />
          </div>
          <div className="form-group">
            <label>Text (EN)</label>
            <textarea
              rows={3}
              value={data.ending_message_en}
              onChange={(e) => setData(prev => ({ ...prev, ending_message_en: e.target.value }))}
              placeholder="Great job! Keep it up."
            />
          </div>
        </section>
        <div className="form-actions">
          <button type="button" className="btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WarmingCooldownTab;
