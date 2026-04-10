import { useState, useEffect } from 'react';
import { MARKS_FALLBACK } from '../data/marksData';
import { logger } from '../utils/logger';

const MARKS_URL = 'https://poliroid.me/gunmarks/api/v2/data/ru/vehicles/65,85,95,100';
const VEHICLES_URL = 'https://poliroid.me/gunmarks/api/v2/vehicles/ru/ru';

/**
 * Структура ответов Poliroid:
 *
 * MARKS:
 *   { status, data: { meta, data: [ {id, marks: {"65":N,"85":N,"95":N,"100":N}}, ... ] } }
 *
 * VEHICLES:
 *   { status, data: { meta, data: { vehicles: [
 *     [id, internalName, nation, type, tier, fullName, shortName, isTechTree, isPremium, isSpecial, isCollector, ?, role],
 *     ...
 *   ] } } }
 *
 * Алгоритм:
 *   1. Fetch marks → получаем массив { id, marks }
 *   2. Fetch vehicles → строим Map<id, vehicleRow>
 *   3. Для каждой записи отметок ищем танк по id и объединяем
 */
export function useMarks() {
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
        // ── Параллельно запрашиваем оба эндпоинта ──
        const [marksRes, vehiclesRes] = await Promise.all([
          fetch(MARKS_URL),
          fetch(VEHICLES_URL),
        ]);

        if (!marksRes.ok) throw new Error(`marks ${marksRes.status}`);
        if (!vehiclesRes.ok) throw new Error(`vehicles ${vehiclesRes.status}`);

        const marksJson = await marksRes.json();
        const vehiclesJson = await vehiclesRes.json();

        // ── Индексируем танки по id ──
        // Каждый элемент vehicles: [id, internalName, nation, type, tier, fullName, shortName, ...]
        const vehicleMap = new Map();
        const vehicleRows = vehiclesJson?.data?.data?.vehicles ?? [];

        for (const row of vehicleRows) {
          const id = row[0];
          vehicleMap.set(id, {
            id,
            internalName: row[1],
            nation: row[2],
            type: row[3],
            tier: row[4],
            name: row[5],      // полное название
            shortName: row[6],
            isPremium: row[8] === 1,
            isSpecial: row[9] === 1,
            isCollector: row[10] === 1,
            role: row[12] ?? '',
          });
        }

        // ── Объединяем отметки с данными танка ──
        const marksRows = marksJson?.data?.data ?? [];

        const merged = [];
        for (const entry of marksRows) {
          const vehicle = vehicleMap.get(entry.id);
          if (!vehicle) continue;   // танк есть в отметках, но не найден в списке → пропускаем

          merged.push({
            tank_id: entry.id,
            name: vehicle.name,
            short_name: vehicle.shortName,
            nation: vehicle.nation,
            type: vehicle.type,
            tier: vehicle.tier,
            is_premium: vehicle.isPremium,
            is_special: vehicle.isSpecial,
            is_collector: vehicle.isCollector,
            role: vehicle.role,
            moe_65: entry.marks?.['65'] ?? null,
            moe_85: entry.marks?.['85'] ?? null,
            moe_95: entry.marks?.['95'] ?? null,
            moe_100: entry.marks?.['100'] ?? null,
          });
        }

        logger.info(`useMarks: загружено ${merged.length} танков`);

        if (!cancelled) setTanks(merged);

      } catch (err) {
        if (cancelled) return;
        logger.warn('useMarks: ошибка загрузки Poliroid, используем заглушку', err);
        setTanks(MARKS_FALLBACK);
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