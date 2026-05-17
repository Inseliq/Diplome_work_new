import { useCallback, useEffect, useState } from 'react';
import {
  getProfile,
  updateProfileNickname,
  updateProfileEmail,
  changeProfilePassword,
  leaveClan,
} from '../../api/endpoints';
import { logger } from '../utils/logger';

export function useProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getProfile();
      setProfile(data);
    } catch (err) {
      logger.warn('useProfile: не удалось загрузить профиль', err);
      setProfile(null);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateNickname = useCallback(async (nickname) => {
    const result = await updateProfileNickname({ nickname });
    await loadProfile();
    return result;
  }, [loadProfile]);

  const updateEmail = useCallback(async (email) => {
    const result = await updateProfileEmail({ email });
    await loadProfile();
    return result;
  }, [loadProfile]);

  const changePassword = useCallback(async (payload) => {
    return await changeProfilePassword(payload);
  }, []);

  const leaveCurrentClan = useCallback(async () => {
    const result = await leaveClan();
    await loadProfile();
    return result;
  }, [loadProfile]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const data = await getProfile();

        if (!cancelled) {
          setProfile(data);
        }
      } catch (err) {
        if (!cancelled) {
          logger.warn('useProfile: не удалось загрузить профиль', err);
          setProfile(null);
          setError(err);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  return {
    profile,
    loading,
    error,
    reload: loadProfile,
    updateNickname,
    updateEmail,
    changePassword,
    leaveCurrentClan,
  };
}