import { useState, useEffect } from 'react';
import { logger } from '../utils/logger';

const VEHICLES_URL = 'https://poliroid.me/gunmarks/api/v2/vehicles/ru/ru';
export const ICONS_BASE = 'https://cdn.poliroid.me/icons/tanks_svg/ru';

/**
 * Структура каждого танка после парсинга:
 * {
 *   id, internalName, nation, type, tier,
 *   name, shortName,
 *   isTechTree, isPremium, isSpecial, isCollector,
 *   role,
 *   iconUrl   // CDN URL SVG иконки
 * }
 *
 * Vehicles row: [id, internalName, nation, type, tier, fullName, shortName,
 *                isTechTree(7), isPremium(8), isSpecial(9), isCollector(10), ?(11), role(12)]
 */
export function useVehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFallback, setIsFallback] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      setIsFallback(false);

      try {
        const res = await fetch(VEHICLES_URL);
        if (!res.ok) throw new Error(`vehicles ${res.status}`);
        const json = await res.json();

        const rows = json?.data?.data?.vehicles ?? [];
        const parsed = rows.map((row) => ({
          id: row[0],
          internalName: row[1],
          nation: row[2],
          type: row[3],
          tier: row[4],
          name: row[5],
          shortName: row[6],
          isTechTree: row[7] === 1,
          isPremium: row[8] === 1,
          isSpecial: row[9] === 1,
          isCollector: row[10] === 1,
          role: row[12] ?? '',
          iconUrl: `${ICONS_BASE}/${row[1]}.svg`,
        }));

        logger.info(`useVehicles: загружено ${parsed.length} машин`);
        if (!cancelled) setVehicles(parsed);

      } catch (err) {
        if (cancelled) return;
        logger.warn('useVehicles: ошибка Poliroid, пустой список', err);
        setVehicles([]);
        setError(err);
        setIsFallback(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, []);

  return { vehicles, loading, error, isFallback };
}