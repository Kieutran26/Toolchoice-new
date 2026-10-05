import { useEffect, useState } from 'react';
import { adminRequest, getAdminSession } from '@/api/adminClient';

export default function useAdminSession() {
  const [session, setSession] = useState(null);
  useEffect(() => {
    let active = true;
    const expire = () => setSession(null);
    window.addEventListener('admin-session-expired', expire);
    if (getAdminSession()) adminRequest('/session').then(value => { if (active) setSession(value); }).catch(() => { if (active) setSession(null); });
    return () => { active = false; window.removeEventListener('admin-session-expired', expire); };
  }, []);
  useEffect(() => {
    if (!session) return;
    const timer = setTimeout(() => setSession(null), Math.max(0, session.expiresAt - Date.now()));
    return () => clearTimeout(timer);
  }, [session]);
  return [session, setSession];
}
