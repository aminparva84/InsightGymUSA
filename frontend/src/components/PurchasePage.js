import React, { useMemo, useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { getApiBase } from '../services/apiBase';
import AppHeader from './AppHeader';
import AuthModal from './AuthModal';
import './PurchasePage.css';

const DISCOUNT_CODE = 'FREE100';

const PurchasePage = () => {
  const { t } = useTranslation();
  const API_BASE = getApiBase();
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [purchase, setPurchase] = useState(null);
  const [discountCode, setDiscountCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const tier = useMemo(() => purchase?.tier || null, [purchase]);
  const program = useMemo(() => purchase?.program || null, [purchase]);
  const packages = useMemo(() => purchase?.packages || [], [purchase]);
  const emsForm = useMemo(() => purchase?.emsForm || null, [purchase]);

  const isMembership = !!tier && !program;

  useEffect(() => {
    const statePayload = location.state;
    if (statePayload) {
      setPurchase(statePayload);
      try {
        localStorage.setItem('pendingPurchase', JSON.stringify(statePayload));
      } catch (err) {
        console.error('Could not save pending purchase:', err);
      }
      return;
    }
    try {
      const raw = localStorage.getItem('pendingPurchase');
      if (raw) setPurchase(JSON.parse(raw));
    } catch (err) {
      console.error('Could not read pending purchase:', err);
    }
  }, [location.state]);

  const subtotal = useMemo(() => {
    if (isMembership) return tier?.price || 0;
    const base = program?.price || 0;
    const pkgSum = packages.reduce((sum, p) => sum + (p.price || 0), 0);
    return base + pkgSum;
  }, [isMembership, tier, program, packages]);

  const discountAmount = useMemo(() => {
    return discountCode.trim().toUpperCase() === DISCOUNT_CODE ? subtotal : 0;
  }, [discountCode, subtotal]);

  const total = Math.max(0, subtotal - discountAmount);

  const handlePlaceOrder = async () => {
    if (isMembership) {
      if (!user) {
        setShowAuthModal(true);
        return;
      }
      setIsSubmitting(true);
      setResult(null);
      try {
        const token = localStorage.getItem('token');
        const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
        const res = await axios.post(`${API_BASE}/api/member/purchase-membership`, {
          tier_name: tier.name,
          price: total,
          period: tier.period || 'month',
          discount_code: discountCode.trim(),
        }, config);
        setResult({ ok: true, data: res.data });
        try {
          localStorage.removeItem('pendingPurchase');
        } catch (err) {
          console.error('Could not clear pending purchase:', err);
        }
      } catch (err) {
        const msg = err.response?.data?.error || err.message || 'Error';
        setResult({ ok: false, error: msg });
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    if (!program) return;
    setIsSubmitting(true);
    setResult(null);
    try {
      const token = localStorage.getItem('token');
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      const res = await axios.post(`${API_BASE}/api/member/purchase-training-program`, {
        program_id: program.id,
        base_price: program.price,
        packages,
        ems_form: emsForm,
        discount_code: discountCode.trim(),
        language: 'en',
      }, config);
      setResult({ ok: true, data: res.data });
      if (res.data?.status === 'paid') {
        try {
          localStorage.removeItem('pendingPurchase');
        } catch (err) {
          console.error('Could not clear pending purchase:', err);
        }
      }
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Error';
      setResult({ ok: false, error: msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isPaid = result?.ok && (isMembership || result.data?.status === 'paid');

  if (!purchase || (!tier && !program)) {
    return (
      <div className="purchase-page-wrap">
        <AppHeader />
        <div className="purchase-page">
          <div className="purchase-card">
            <h2>{t('purchaseTitle')}</h2>
            <p>{t('purchaseEmpty')}</p>
            <button type="button" className="purchase-btn purchase-btn-secondary" onClick={() => navigate('/pricing')}>
              View Plans
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="purchase-page-wrap">
      <AppHeader />
      <div className="purchase-page" dir="ltr">
        {isSubmitting && (
          <div className="purchase-loading-overlay" aria-live="polite">
            <div className="purchase-loading-spinner" />
            <p className="purchase-loading-text">{isMembership ? 'Processing...' : t('purchaseGenerating')}</p>
          </div>
        )}
        <div className={`purchase-card ${isSubmitting ? 'purchase-card-loading' : ''}`}>
          <div className="purchase-header">
            <h2>{isMembership ? 'Membership Checkout' : t('purchaseTitle')}</h2>
            <button type="button" className="purchase-btn purchase-btn-secondary" onClick={() => navigate('/pricing')}>
              {t('purchaseBack')}
            </button>
          </div>

          <div className="purchase-section">
            <h3>{isMembership ? 'Plan Summary' : t('purchaseSummary')}</h3>
            {isMembership ? (
              <>
                <div className="purchase-summary-row">
                  <span>{tier.name}</span>
                  <span>${tier.price || 0}/{tier.period || 'month'}</span>
                </div>
                {tier.features && tier.features.length > 0 && (
                  <ul className="purchase-features-list">
                    {tier.features.map((f, j) => (
                      <li key={j}>{f}</li>
                    ))}
                  </ul>
                )}
              </>
            ) : (
              <>
                <div className="purchase-summary-row">
                  <span>{program.nameKey ? t(program.nameKey) : (program.name_en || program.name_fa) || program.name || 'Training program'}</span>
                  <span>${program.price || 0}</span>
                </div>
                {packages.map((pkg) => (
                  <div key={pkg.id} className="purchase-summary-row">
                    <span>{pkg.nameKey ? t(pkg.nameKey) : (pkg.name_en || pkg.name_fa) || pkg.name}</span>
                    <span>+${pkg.price}</span>
                  </div>
                ))}
                {emsForm && (
                  <div className="purchase-summary-note">
                    {t('purchaseEmsNote')}
                  </div>
                )}
              </>
            )}
          </div>

          <div className="purchase-section">
            <h3>Discount Code</h3>
            <div className="purchase-discount-row">
              <input
                type="text"
                value={discountCode}
                onChange={(e) => setDiscountCode(e.target.value)}
                placeholder="Enter discount code"
              />
              {discountAmount > 0 ? (
                <span className="purchase-discount-applied">Discount applied! -${discountAmount}</span>
              ) : (
                <span className="purchase-discount-hint">e.g. FREE100 for 100% off</span>
              )}
            </div>
          </div>

          <div className="purchase-total">
            <div className="purchase-summary-row">
              <span>{t('purchaseSubtotal')}</span>
              <span>${subtotal}</span>
            </div>
            <div className="purchase-summary-row">
              <span>Discount</span>
              <span>-${discountAmount}</span>
            </div>
            <div className="purchase-summary-row total">
              <span>{t('purchaseTotal')}</span>
              <span>${total}</span>
            </div>
          </div>

          {result && (
            <div className={`purchase-result ${result.ok ? 'ok' : 'err'}`}>
              {result.ok
                ? (isMembership ? 'Membership confirmed! Welcome to Insight GYM USA.' : (result.data?.status === 'paid' ? t('purchaseSuccess') : t('purchasePending')))
                : (result.error || t('purchaseError'))}
            </div>
          )}

          {isPaid ? (
            <button
              type="button"
              className="purchase-btn purchase-btn-primary"
              onClick={() => navigate(isMembership ? '/dashboard' : '/dashboard?tab=training-program')}
            >
              {isMembership ? 'Go to Dashboard' : t('purchaseGoToProgram')}
            </button>
          ) : (
            <button
              type="button"
              className="purchase-btn purchase-btn-primary"
              onClick={handlePlaceOrder}
              disabled={isSubmitting}
            >
              {!user && isMembership
                ? 'Sign in to Complete Purchase'
                : isSubmitting
                  ? (isMembership ? 'Processing...' : t('purchaseSubmitting'))
                  : (isMembership ? 'Complete Purchase' : t('purchasePay'))}
            </button>
          )}

          {!user && isMembership && (
            <p className="purchase-auth-hint">Sign in or create an account to complete your membership purchase.</p>
          )}

          {total > 0 && !isMembership && (
            <p className="purchase-gateway-note">{t('purchaseNoGateway')}</p>
          )}
        </div>
      </div>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  );
};

export default PurchasePage;
