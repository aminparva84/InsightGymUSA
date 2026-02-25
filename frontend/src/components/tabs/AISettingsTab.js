import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { getApiBase } from '../../services/apiBase';
import './AISettingsTab.css';

const API_BASE = getApiBase();

const PROVIDER_IDS = ['openai', 'anthropic', 'gemini', 'vertex'];
const PROVIDER_NAMES = { auto: 'Auto', openai: 'OpenAI', anthropic: 'Anthropic', gemini: 'Gemini', vertex: 'Vertex AI' };
const AISettingsTab = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(null);
  const [settings, setSettings] = useState({ selected_provider: 'openai', providers: {} });
  const [keys, setKeys] = useState({ openai: '', anthropic: '', gemini: '', vertex: '' });
  const [kbStatus, setKbStatus] = useState(null);
  const [kbIndexing, setKbIndexing] = useState(false);

  const getAuthToken = useCallback(() => {
    const t = localStorage.getItem('token');
    return t && t.trim() ? t.trim() : null;
  }, []);
  const getAxiosConfig = useCallback(() => ({
    headers: {
      Authorization: `Bearer ${getAuthToken()}`,
      'Content-Type': 'application/json',
    },
  }), [getAuthToken]);

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/api/admin/ai-settings`, getAxiosConfig());
      setSettings(res.data || { selected_provider: 'auto', providers: {} });
      setKeys({ openai: '', anthropic: '', gemini: '', vertex: '' });
    } catch (err) {
      console.error('Error fetching AI settings:', err);
      setSettings({ selected_provider: 'auto', providers: {} });
    } finally {
      setLoading(false);
    }
  }, [getAxiosConfig]);

  const fetchKbStatus = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/admin/website-kb/status`, getAxiosConfig());
      setKbStatus(res.data || null);
    } catch (err) {
      setKbStatus(null);
    }
  }, [getAxiosConfig]);

  useEffect(() => {
    fetchSettings();
    fetchKbStatus();
  }, [fetchSettings, fetchKbStatus]);

  const handleSaveKey = async (provider) => {
    const key = (keys[provider] || '').trim();
    try {
      setSaving(true);
      await axios.put(
        `${API_BASE}/api/admin/ai-settings`,
        {
          [provider]: { api_key: key || null },
        },
        getAxiosConfig()
      );
      alert('Saved');
      setKeys((p) => ({ ...p, [provider]: '' }));
      await fetchSettings();
    } catch (err) {
      console.error('Error saving AI settings:', err);
      alert('Error saving');
    } finally {
      setSaving(false);
    }
  };

  const handleSelectProvider = async (provider) => {
    try {
      setSaving(true);
      await axios.put(
        `${API_BASE}/api/admin/ai-settings`,
        { selected_provider: provider },
        getAxiosConfig()
      );
      alert('AI provider saved');
      setSettings((s) => ({ ...s, selected_provider: provider }));
    } catch (err) {
      console.error('Error updating selected provider:', err);
      alert('Error saving');
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async (provider, useFormKey = false) => {
    setTesting(provider);
    try {
      const body = useFormKey && keys[provider] ? { provider, api_key: keys[provider].trim() } : { provider };
      const res = await axios.post(`${API_BASE}/api/admin/ai-settings/test`, body, getAxiosConfig());
      const ok = res.data && res.data.success;
      alert(ok ? 'API key is valid.' : (res.data?.message || 'Test failed'));
      await fetchSettings();
    } catch (err) {
      alert('Error: ' + (err.response?.data?.message || err.message));
    } finally {
      setTesting(null);
    }
  };

  const handleReindexKb = async () => {
    try {
      setKbIndexing(true);
      await axios.post(`${API_BASE}/api/admin/website-kb/reindex`, {}, getAxiosConfig());
      alert('KB index updated');
      fetchKbStatus();
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Error reindexing KB';
      alert(msg);
    } finally {
      setKbIndexing(false);
    }
  };

  const providers = settings.providers || {};
  const validProviders = PROVIDER_IDS.filter(
    (p) => providers[p]?.sdk_installed && providers[p]?.has_key && providers[p]?.is_valid
  );
  const displayValue = ['auto', ...validProviders].includes(settings.selected_provider)
    ? settings.selected_provider
    : 'auto';

  if (loading) {
    return (
      <div className="ai-settings-tab">
        <p className="ai-settings-loading">Loading...</p>
      </div>
    );
  }

  return (
    <div className="ai-settings-tab">
      <h2>AI Settings</h2>
      <p className="ai-settings-desc">
        Choose which AI provider to use for chat and text generation. Enter API key for each provider and test.
      </p>
      <p className="ai-settings-desc">
        Vertex AI uses the REST API with an API key (e.g. from Google Cloud); model: gemini-2.5-flash-lite.
      </p>

      <div className="ai-settings-selected">
        <label>Current provider</label>
        <select
          value={displayValue}
          onChange={(e) => handleSelectProvider(e.target.value)}
          disabled={saving}
        >
          <option value="auto">Auto (first valid)</option>
          {validProviders.length === 0 ? (
            <option value="openai" disabled>No valid provider</option>
          ) : (
            validProviders.map((p) => (
              <option key={p} value={p}>
                {PROVIDER_NAMES[p]}
              </option>
            ))
          )}
        </select>
        {validProviders.length === 0 && (
          <p className="ai-settings-warn">
            Configure and test at least one provider with a valid key.
          </p>
        )}
      </div>

      <div className="ai-settings-table-wrap">
        <table className="ai-settings-table">
          <thead>
            <tr>
              <th>Provider</th>
              <th>SDK installed</th>
              <th>API key</th>
              <th>Source</th>
              <th>Valid</th>
              <th>Last test</th>
              <th>API key / Actions</th>
            </tr>
          </thead>
          <tbody>
            {PROVIDER_IDS.map((id) => {
              const p = providers[id] || {};
              const name = PROVIDER_NAMES[id];
              const canUse = p.sdk_installed && p.has_key && p.is_valid;
              return (
                <tr key={id} className={canUse ? 'valid' : ''}>
                  <td className="ai-settings-cell-name">{name}</td>
                  <td>{p.sdk_installed ? 'Yes' : 'No'}</td>
                  <td>{p.has_key ? 'Set' : 'Not set'}</td>
                  <td>{p.source || '—'}</td>
                  <td>{p.is_valid ? 'Yes' : 'No'}</td>
                  <td>{p.last_tested_at ? new Date(p.last_tested_at).toLocaleString() : '—'}</td>
                  <td>
                    <div className="ai-settings-cell-actions">
                      <input
                        type="password"
                        placeholder="API key"
                        value={keys[id] || ''}
                        onChange={(e) => setKeys((k) => ({ ...k, [id]: e.target.value }))}
                        className="ai-settings-key-input"
                      />
                      <button
                        type="button"
                        className="ai-settings-btn ai-settings-btn-save"
                        onClick={() => handleSaveKey(id)}
                        disabled={saving}
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        className="ai-settings-btn ai-settings-btn-test"
                        onClick={() => handleTest(id, true)}
                        disabled={testing !== null}
                      >
                        {testing === id ? '…' : 'Test'}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="ai-kb-section">
        <h3>Website Knowledge Base (KB)</h3>
        <p className="ai-settings-desc">
          Click &quot;Reindex&quot; to index all website info: site settings, training levels, corrective movements, exercise library, warming &amp; cooldown.
        </p>
        <div className="ai-kb-meta">
          <span>
            Chunks: {kbStatus?.count ?? 0}
          </span>
          <span>
            Last updated: {kbStatus?.updated_at ? new Date(kbStatus.updated_at).toLocaleString() : '—'}
          </span>
        </div>
        <div className="ai-kb-actions">
          <button
            type="button"
            className="ai-settings-btn ai-settings-btn-test"
            onClick={handleReindexKb}
            disabled={kbIndexing}
          >
            {kbIndexing ? 'Indexing...' : 'Reindex'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AISettingsTab;
