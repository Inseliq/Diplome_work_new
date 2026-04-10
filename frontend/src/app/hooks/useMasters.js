import { useState, useEffect } from 'react';
import { MASTERS_FALLBACK } from '../data/mastersData';
import { logger } from '../utils/logger';

const MASTERY_URL = 'https://poliroid.me/mastery/api/v2/data/ru/vehicles';
const VEHICLES_URL = 'https://poliroid.me/mastery/api/v2/vehicles/ru/ru';

/**
 * Структура ответов Poliroid (mastery):
 *
 * MASTERY:
 *   { status, data: { meta, data: [ {id, mastery:[deg3,deg2,deg1,master]}, ... ] } }
 *   mastery[0] = 3-я степень
 *   mastery[1] = 2-я степень
 *   mastery[2] = 1-я степень
 *   mastery[3] = мастер
 *
 * VEHICLES:
 *   { status, data: { meta, data: { vehicles: [
 *     [id, internalName, nation, type, tier, fullName, shortName,
 *      isTechTree, isPremium, isSpecial, isCollector, ?, role],
 *     ...
 *   ] } } }
 *
 * Алгоритм:
 *   1. Параллельно fetch mastery + vehicles
 *   2. Vehicles → Map<id, объект>
 *   3. Для каждой mastery-записи ищем танк по id, объединяем
 */
export function useMasters() {
  const [tanks, setTanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFallback, setIsFallback] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      setIsFallback(false);

      try {
        const [masteryRes, vehiclesRes] = await Promise.all([
          fetch(MASTERY_URL),
          fetch(VEHICLES_URL),
        ]);

        if (!masteryRes.ok) throw new Error(`mastery ${masteryRes.status}`);
        if (!vehiclesRes.ok) throw new Error(`vehicles ${vehiclesRes.status}`);

        const masteryJson = await masteryRes.json();
        const vehiclesJson = await vehiclesRes.json();

        // Строим Map<id, vehicle>
        const vehicleMap = new Map();
        const vehicleRows = vehiclesJson?.data?.data?.vehicles ?? [];

        for (const row of vehicleRows) {
          vehicleMap.set(row[0], {
            id: row[0],
            nation: row[2],
            type: row[3],
            tier: row[4],
            name: row[5],
            shortName: row[6],
            isPremium: row[8] === 1,
            isSpecial: row[9] === 1,
            isCollector: row[10] === 1,
            role: row[12] ?? '',
          });
        }

        // Объединяем
        const masteryRows = masteryJson?.data?.data ?? [];
        const merged = [];

        for (const entry of masteryRows) {
          const v = vehicleMap.get(entry.id);
          if (!v) continue;

          const m = entry.mastery ?? [];
          merged.push({
            tank_id: entry.id,
            name: v.name,
            short_name: v.shortName,
            nation: v.nation,
            type: v.type,
            tier: v.tier,
            is_premium: v.isPremium,
            is_special: v.isSpecial,
            is_collector: v.isCollector,
            role: v.role,
            deg3: m[0] ?? null,
            deg2: m[1] ?? null,
            deg1: m[2] ?? null,
            master: m[3] ?? null,
          });
        }

        logger.info(`useMasters: загружено ${merged.length} танков`);
        if (!cancelled) setTanks(merged);

      } catch (err) {
        if (cancelled) return;
        logger.warn('useMasters: ошибка Poliroid, заглушка', err);
        setTanks(MASTERS_FALLBACK);
        setError(err);
        setIsFallback(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchData();
    return () => { cancelled = true; };
  }, []);

  return { tanks, loading, error, isFallback };
}