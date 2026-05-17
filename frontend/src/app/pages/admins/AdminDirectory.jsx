import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  getAdminDirectoryDictionaries,
  createAdminDirectoryEquipment,
  updateAdminDirectoryEquipment,
  deleteAdminDirectoryEquipment,
  createAdminDirectoryFieldItem,
  updateAdminDirectoryFieldItem,
  deleteAdminDirectoryFieldItem,
  getAdminDirectoryVehicles,
  getAdminDirectoryVehicle,
  upsertAdminDirectoryVehicle,
  deleteAdminDirectoryVehicle,
  createAdminDirectoryBuild,
  updateAdminDirectoryBuild,
  deleteAdminDirectoryBuild,
  createAdminDirectoryFieldModification,
  updateAdminDirectoryFieldModification,
  deleteAdminDirectoryFieldModification,
} from '../../../api/endpoints';
import { logger } from '../../utils/logger';

const EMPTY_EQUIPMENT_FORM = {
  key: '',
  label: '',
  tier: 'std',
  imageUrl: '',
  isActive: true,
  sortOrder: 0,
};

const EMPTY_FIELD_ITEM_FORM = {
  key: '',
  label: '',
  imageUrl: '',
  isActive: true,
  sortOrder: 0,
};

const EMPTY_VEHICLE_FORM = {
  imageUrl: '',
  isPublished: true,
};

const EMPTY_BUILD_FORM = {
  modeKey: 'random',
  stateKey: 'default',
  equipment1Key: '',
  equipment2Key: '',
  equipment3Key: '',
  sortOrder: 0,
};

const EMPTY_FIELD_FORM = {
  sectionKey: 'section1',
  leftItemKey: '',
  rightItemKey: '',
  selectedSide: 'right',
  sortOrder: 0,
};

const TABS = [
  { key: 'vehicles', label: 'Сборки техники' },
  { key: 'equipment', label: 'Оборудование' },
  { key: 'field', label: 'Полевая' },
];

const EQUIPMENT_TIERS = [
  { value: 'std', label: 'Обычное' },
  { value: 'bounty', label: 'Боновое' },
  { value: 'experimental', label: 'Экспериментальное' },
];

const MODE_OPTIONS = [
  { value: 'random', label: 'Рандом' },
  { value: 'fortified', label: 'Укрепрайон' },
];

const STATE_OPTIONS = [
  { value: 'default', label: 'Базовая' },
  { value: 'state1', label: 'Вариант 1' },
  { value: 'state2', label: 'Вариант 2' },
];

const SECTION_OPTIONS = [
  { value: 'section1', label: 'Секция 1' },
  { value: 'section2', label: 'Секция 2' },
  { value: 'section3', label: 'Секция 3' },
  { value: 'section4', label: 'Секция 4' },
  { value: 'section5', label: 'Секция 5' },
  { value: 'section6', label: 'Секция 6' },
  { value: 'section7', label: 'Секция 7' },
  { value: 'section8', label: 'Секция 8' },
];

function getTierLabel(tier) {
  return EQUIPMENT_TIERS.find((item) => item.value === tier)?.label || tier;
}

function getEquipmentLabel(equipment, key) {
  const found = equipment.find((item) => item.key === key);

  return found ? `${found.label} (${getTierLabel(found.tier)})` : key;
}

function getFieldItemLabel(items, key) {
  const found = items.find((item) => item.key === key);

  return found ? found.label : key;
}

function AdminDirectory() {
  const [activeTab, setActiveTab] = useState('vehicles');

  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [vehicleDetail, setVehicleDetail] = useState(null);

  const [equipment, setEquipment] = useState([]);
  const [fieldItems, setFieldItems] = useState([]);

  const [vehicleSearch, setVehicleSearch] = useState('');
  const [equipmentSearch, setEquipmentSearch] = useState('');
  const [fieldSearch, setFieldSearch] = useState('');

  const [equipmentForm, setEquipmentForm] = useState(EMPTY_EQUIPMENT_FORM);
  const [fieldItemForm, setFieldItemForm] = useState(EMPTY_FIELD_ITEM_FORM);
  const [vehicleForm, setVehicleForm] = useState(EMPTY_VEHICLE_FORM);
  const [buildForm, setBuildForm] = useState(EMPTY_BUILD_FORM);
  const [fieldForm, setFieldForm] = useState(EMPTY_FIELD_FORM);

  const [editingEquipmentKey, setEditingEquipmentKey] = useState(null);
  const [editingFieldItemKey, setEditingFieldItemKey] = useState(null);
  const [editingBuildId, setEditingBuildId] = useState(null);
  const [editingFieldId, setEditingFieldId] = useState(null);

  const [loadingVehicles, setLoadingVehicles] = useState(true);
  const [loadingDictionaries, setLoadingDictionaries] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [actionKey, setActionKey] = useState(null);

  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const activeEquipment = useMemo(
    () => equipment.filter((item) => item.isActive),
    [equipment]
  );

  const activeFieldItems = useMemo(
    () => fieldItems.filter((item) => item.isActive),
    [fieldItems]
  );

  const filteredEquipment = useMemo(() => {
    const value = equipmentSearch.trim().toLowerCase();

    if (!value) return equipment;

    return equipment.filter((item) =>
      item.key.toLowerCase().includes(value) ||
      item.label.toLowerCase().includes(value) ||
      item.tier.toLowerCase().includes(value)
    );
  }, [equipment, equipmentSearch]);

  const filteredFieldItems = useMemo(() => {
    const value = fieldSearch.trim().toLowerCase();

    if (!value) return fieldItems;

    return fieldItems.filter((item) =>
      item.key.toLowerCase().includes(value) ||
      item.label.toLowerCase().includes(value)
    );
  }, [fieldItems, fieldSearch]);

  const loadDictionaries = async () => {
    setLoadingDictionaries(true);
    setError(null);

    try {
      const data = await getAdminDirectoryDictionaries();

      setEquipment(Array.isArray(data?.equipment) ? data.equipment : []);
      setFieldItems(Array.isArray(data?.fieldModifications) ? data.fieldModifications : []);
    } catch (err) {
      logger.warn('AdminDirectory: не удалось загрузить справочники', err);
      setEquipment([]);
      setFieldItems([]);
      setError(err);
    } finally {
      setLoadingDictionaries(false);
    }
  };

  const loadVehicles = async (search = vehicleSearch) => {
    setLoadingVehicles(true);
    setError(null);

    try {
      const data = await getAdminDirectoryVehicles(search);
      setVehicles(Array.isArray(data) ? data : []);
    } catch (err) {
      logger.warn('AdminDirectory: не удалось загрузить технику', err);
      setVehicles([]);
      setError(err);
    } finally {
      setLoadingVehicles(false);
    }
  };

  const loadVehicleDetail = async (vehicleId) => {
    setLoadingDetail(true);
    setError(null);

    try {
      const data = await getAdminDirectoryVehicle(vehicleId);

      setVehicleDetail(data);
      setSelectedVehicle(data.vehicle);

      setVehicleForm({
        imageUrl: data.imageUrl ?? '',
        isPublished: Boolean(data.isPublished),
      });
    } catch (err) {
      logger.warn('AdminDirectory: не удалось загрузить технику', err);
      setVehicleDetail(null);
      setError(err);
    } finally {
      setLoadingDetail(false);
    }
  };

  useEffect(() => {
    loadDictionaries();
    loadVehicles('');
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadVehicles(vehicleSearch);
    }, 350);

    return () => clearTimeout(timer);
  }, [vehicleSearch]);

  const applyDictionaries = (data) => {
    if (!data) return;

    setEquipment(Array.isArray(data.equipment) ? data.equipment : []);
    setFieldItems(Array.isArray(data.fieldModifications) ? data.fieldModifications : []);
  };

  const updateEquipmentField = (field, value) => {
    setEquipmentForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const updateFieldItemField = (field, value) => {
    setFieldItemForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const updateVehicleField = (field, value) => {
    setVehicleForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const updateBuildField = (field, value) => {
    setBuildForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const updateFieldFormField = (field, value) => {
    setFieldForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const resetEquipmentForm = () => {
    setEquipmentForm(EMPTY_EQUIPMENT_FORM);
    setEditingEquipmentKey(null);
  };

  const resetFieldItemForm = () => {
    setFieldItemForm(EMPTY_FIELD_ITEM_FORM);
    setEditingFieldItemKey(null);
  };

  const resetBuildForm = () => {
    setBuildForm(EMPTY_BUILD_FORM);
    setEditingBuildId(null);
  };

  const resetFieldForm = () => {
    setFieldForm(EMPTY_FIELD_FORM);
    setEditingFieldId(null);
  };

  const handleSaveEquipment = async (event) => {
    event.preventDefault();

    setMessage(null);
    setError(null);
    setActionKey('save-equipment');

    try {
      const body = {
        key: equipmentForm.key.trim(),
        label: equipmentForm.label.trim(),
        tier: equipmentForm.tier,
        imageUrl: equipmentForm.imageUrl.trim(),
        isActive: Boolean(equipmentForm.isActive),
        sortOrder: Number(equipmentForm.sortOrder),
      };

      const result = editingEquipmentKey
        ? await updateAdminDirectoryEquipment(editingEquipmentKey, body)
        : await createAdminDirectoryEquipment(body);

      setMessage(result?.message || 'Оборудование сохранено');
      applyDictionaries(result?.dictionaries);
      resetEquipmentForm();

      if (selectedVehicle) {
        await loadVehicleDetail(selectedVehicle.id);
      }
    } catch (err) {
      logger.warn('AdminDirectory: не удалось сохранить оборудование', err);
      setError(err);
    } finally {
      setActionKey(null);
    }
  };

  const handleEditEquipment = (item) => {
    setEditingEquipmentKey(item.key);
    setEquipmentForm({
      key: item.key,
      label: item.label,
      tier: item.tier,
      imageUrl: item.imageUrl,
      isActive: Boolean(item.isActive),
      sortOrder: item.sortOrder ?? 0,
    });
    setActiveTab('equipment');
  };

  const handleDeleteEquipment = async (item) => {
    const confirmed = window.confirm(`Удалить оборудование «${item.label}»?`);

    if (!confirmed) return;

    setMessage(null);
    setError(null);
    setActionKey(`delete-equipment-${item.key}`);

    try {
      const result = await deleteAdminDirectoryEquipment(item.key);

      setMessage(result?.message || 'Оборудование удалено');
      applyDictionaries(result?.dictionaries);
    } catch (err) {
      logger.warn('AdminDirectory: не удалось удалить оборудование', err);
      setError(err);
    } finally {
      setActionKey(null);
    }
  };

  const handleSaveFieldItem = async (event) => {
    event.preventDefault();

    setMessage(null);
    setError(null);
    setActionKey('save-field-item');

    try {
      const body = {
        key: fieldItemForm.key.trim(),
        label: fieldItemForm.label.trim(),
        imageUrl: fieldItemForm.imageUrl.trim(),
        isActive: Boolean(fieldItemForm.isActive),
        sortOrder: Number(fieldItemForm.sortOrder),
      };

      const result = editingFieldItemKey
        ? await updateAdminDirectoryFieldItem(editingFieldItemKey, body)
        : await createAdminDirectoryFieldItem(body);

      setMessage(result?.message || 'Элемент полевой модернизации сохранён');
      applyDictionaries(result?.dictionaries);
      resetFieldItemForm();

      if (selectedVehicle) {
        await loadVehicleDetail(selectedVehicle.id);
      }
    } catch (err) {
      logger.warn('AdminDirectory: не удалось сохранить элемент полевой', err);
      setError(err);
    } finally {
      setActionKey(null);
    }
  };

  const handleEditFieldItem = (item) => {
    setEditingFieldItemKey(item.key);
    setFieldItemForm({
      key: item.key,
      label: item.label,
      imageUrl: item.imageUrl,
      isActive: Boolean(item.isActive),
      sortOrder: item.sortOrder ?? 0,
    });
    setActiveTab('field');
  };

  const handleDeleteFieldItem = async (item) => {
    const confirmed = window.confirm(`Удалить элемент «${item.label}»?`);

    if (!confirmed) return;

    setMessage(null);
    setError(null);
    setActionKey(`delete-field-item-${item.key}`);

    try {
      const result = await deleteAdminDirectoryFieldItem(item.key);

      setMessage(result?.message || 'Элемент полевой модернизации удалён');
      applyDictionaries(result?.dictionaries);
    } catch (err) {
      logger.warn('AdminDirectory: не удалось удалить элемент полевой', err);
      setError(err);
    } finally {
      setActionKey(null);
    }
  };

  const handleSaveVehicle = async (event) => {
    event.preventDefault();

    if (!selectedVehicle) return;

    setMessage(null);
    setError(null);
    setActionKey('save-vehicle');

    try {
      const result = await upsertAdminDirectoryVehicle(selectedVehicle.id, {
        imageUrl: vehicleForm.imageUrl.trim() || null,
        isPublished: Boolean(vehicleForm.isPublished),
      });

      setMessage(result?.message || 'Страница техники сохранена');

      if (result?.vehicle) {
        setVehicleDetail(result.vehicle);
        setSelectedVehicle(result.vehicle.vehicle);
      }

      await loadVehicles(vehicleSearch);
    } catch (err) {
      logger.warn('AdminDirectory: не удалось сохранить страницу техники', err);
      setError(err);
    } finally {
      setActionKey(null);
    }
  };

  const handleDeleteVehicleDirectory = async () => {
    if (!selectedVehicle) return;

    const confirmed = window.confirm(`Удалить страницу сборок для «${selectedVehicle.name}» вместе со сборками и полевой?`);

    if (!confirmed) return;

    setMessage(null);
    setError(null);
    setActionKey('delete-vehicle');

    try {
      const result = await deleteAdminDirectoryVehicle(selectedVehicle.id);

      setMessage(result?.message || 'Страница техники удалена');
      setVehicleDetail(null);
      await loadVehicles(vehicleSearch);
    } catch (err) {
      logger.warn('AdminDirectory: не удалось удалить страницу техники', err);
      setError(err);
    } finally {
      setActionKey(null);
    }
  };

  const handleSaveBuild = async (event) => {
    event.preventDefault();

    if (!selectedVehicle) return;

    setMessage(null);
    setError(null);
    setActionKey('save-build');

    try {
      const body = {
        modeKey: buildForm.modeKey,
        stateKey: buildForm.stateKey,
        equipment1Key: buildForm.equipment1Key,
        equipment2Key: buildForm.equipment2Key,
        equipment3Key: buildForm.equipment3Key,
        sortOrder: Number(buildForm.sortOrder),
      };

      const result = editingBuildId
        ? await updateAdminDirectoryBuild(selectedVehicle.id, editingBuildId, body)
        : await createAdminDirectoryBuild(selectedVehicle.id, body);

      setMessage(result?.message || 'Сборка сохранена');

      if (result?.vehicle) {
        setVehicleDetail(result.vehicle);
      }

      resetBuildForm();
      await loadVehicles(vehicleSearch);
    } catch (err) {
      logger.warn('AdminDirectory: не удалось сохранить сборку', err);
      setError(err);
    } finally {
      setActionKey(null);
    }
  };

  const handleEditBuild = (build) => {
    setEditingBuildId(build.id);
    setBuildForm({
      modeKey: build.modeKey,
      stateKey: build.stateKey,
      equipment1Key: build.equipment1Key,
      equipment2Key: build.equipment2Key,
      equipment3Key: build.equipment3Key,
      sortOrder: build.sortOrder ?? 0,
    });
  };

  const handleDeleteBuild = async (build) => {
    if (!selectedVehicle) return;

    const confirmed = window.confirm(`Удалить сборку ${build.modeKey}/${build.stateKey}?`);

    if (!confirmed) return;

    setMessage(null);
    setError(null);
    setActionKey(`delete-build-${build.id}`);

    try {
      const result = await deleteAdminDirectoryBuild(selectedVehicle.id, build.id);

      setMessage(result?.message || 'Сборка удалена');

      if (result?.vehicle) {
        setVehicleDetail(result.vehicle);
      }

      if (editingBuildId === build.id) {
        resetBuildForm();
      }

      await loadVehicles(vehicleSearch);
    } catch (err) {
      logger.warn('AdminDirectory: не удалось удалить сборку', err);
      setError(err);
    } finally {
      setActionKey(null);
    }
  };

  const handleSaveFieldModification = async (event) => {
    event.preventDefault();

    if (!selectedVehicle) return;

    setMessage(null);
    setError(null);
    setActionKey('save-field');

    try {
      const body = {
        sectionKey: fieldForm.sectionKey,
        leftItemKey: fieldForm.leftItemKey,
        leftSelected: fieldForm.selectedSide === 'left',
        rightItemKey: fieldForm.rightItemKey,
        rightSelected: fieldForm.selectedSide === 'right',
        sortOrder: Number(fieldForm.sortOrder),
      };

      const result = editingFieldId
        ? await updateAdminDirectoryFieldModification(selectedVehicle.id, editingFieldId, body)
        : await createAdminDirectoryFieldModification(selectedVehicle.id, body);

      setMessage(result?.message || 'Полевая модернизация сохранена');

      if (result?.vehicle) {
        setVehicleDetail(result.vehicle);
      }

      resetFieldForm();
      await loadVehicles(vehicleSearch);
    } catch (err) {
      logger.warn('AdminDirectory: не удалось сохранить полевую модернизацию', err);
      setError(err);
    } finally {
      setActionKey(null);
    }
  };

  const handleEditFieldModification = (item) => {
    setEditingFieldId(item.id);
    setFieldForm({
      sectionKey: item.sectionKey,
      leftItemKey: item.leftItemKey,
      rightItemKey: item.rightItemKey,
      selectedSide: item.leftSelected ? 'left' : 'right',
      sortOrder: item.sortOrder ?? 0,
    });
  };

  const handleDeleteFieldModification = async (item) => {
    if (!selectedVehicle) return;

    const confirmed = window.confirm(`Удалить секцию ${item.sectionKey}?`);

    if (!confirmed) return;

    setMessage(null);
    setError(null);
    setActionKey(`delete-field-${item.id}`);

    try {
      const result = await deleteAdminDirectoryFieldModification(selectedVehicle.id, item.id);

      setMessage(result?.message || 'Полевая модернизация удалена');

      if (result?.vehicle) {
        setVehicleDetail(result.vehicle);
      }

      if (editingFieldId === item.id) {
        resetFieldForm();
      }

      await loadVehicles(vehicleSearch);
    } catch (err) {
      logger.warn('AdminDirectory: не удалось удалить полевую модернизацию', err);
      setError(err);
    } finally {
      setActionKey(null);
    }
  };

  return (
    <main className="wrapper admin-directory">
      <div className="admin-directory__container">
        <header className="admin-directory__header">
          <div>
            <div className="admin-directory__label">Админ-панель</div>
            <h1 className="admin-directory__title">Сборки техники</h1>
            <p className="admin-directory__subtitle">
              Управление справочниками оборудования, полевой модернизацией и сборками для техники.
              Сначала создаются элементы справочников, затем они выбираются в сборках танка.
            </p>
          </div>

          <Link to="/admin" className="admin-directory__back">
            Назад в админку
          </Link>
        </header>

        {message && (
          <div className="admin-directory__message admin-directory__message--success">
            {message}
          </div>
        )}

        {error && (
          <div className="admin-directory__message admin-directory__message--error">
            {error?.data?.message || error?.message || 'Произошла ошибка'}
          </div>
        )}

        <nav className="admin-directory__tabs">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              className={activeTab === tab.key ? 'admin-directory__tab admin-directory__tab--active' : 'admin-directory__tab'}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {activeTab === 'vehicles' && (
          <section className="admin-directory__layout">
            <aside className="admin-directory__sidebar">
              <div className="admin-directory__section-head">
                <div>
                  <h2>Техника</h2>
                  <p>Поиск по названию, internalName, нации и типу.</p>
                </div>
                <span>{vehicles.length}</span>
              </div>

              <label className="admin-directory__field">
                <span>Поиск техники</span>
                <input
                  type="search"
                  value={vehicleSearch}
                  onChange={(event) => setVehicleSearch(event.target.value)}
                  placeholder="ИС-7, r45_is-7, ussr..."
                />
              </label>

              <div className="admin-directory__vehicle-list">
                {loadingVehicles ? (
                  <p className="admin-directory__empty">Загружаем технику...</p>
                ) : vehicles.length > 0 ? (
                  vehicles.map((vehicle) => (
                    <button
                      key={vehicle.id}
                      type="button"
                      className={`admin-directory__vehicle-card${selectedVehicle?.id === vehicle.id ? ' admin-directory__vehicle-card--active' : ''}`}
                      onClick={() => loadVehicleDetail(vehicle.id)}
                    >
                      <img src={vehicle.iconUrl} alt={vehicle.shortName} />

                      <div>
                        <strong>{vehicle.name}</strong>
                        <span>{vehicle.internalName}</span>

                        <div className="admin-directory__vehicle-meta">
                          <em>{vehicle.tier} уровень</em>
                          <em>{vehicle.type}</em>
                          {vehicle.hasDirectory ? <b>Есть сборка</b> : <em>Нет сборки</em>}
                        </div>
                      </div>
                    </button>
                  ))
                ) : (
                  <p className="admin-directory__empty">Техника не найдена.</p>
                )}
              </div>
            </aside>

            <section className="admin-directory__content">
              {!selectedVehicle ? (
                <div className="admin-directory__placeholder">
                  <h2>Техника не выбрана</h2>
                  <p>Выберите танк слева, чтобы настроить изображение, сборки оборудования и полевую модернизацию.</p>
                </div>
              ) : loadingDetail ? (
                <p className="admin-directory__empty">Загружаем выбранную технику...</p>
              ) : (
                <>
                  <div className="admin-directory__selected">
                    <div>
                      <span>Выбранная техника</span>
                      <h2>{selectedVehicle.name}</h2>
                      <p>
                        {selectedVehicle.internalName} · {selectedVehicle.tier} уровень ·
                        сборок: {vehicleDetail?.builds?.length ?? 0} ·
                        полевых: {vehicleDetail?.fieldModifications?.length ?? 0}
                      </p>
                    </div>

                    <img src={selectedVehicle.iconUrl} alt={selectedVehicle.shortName} />
                  </div>

                  <form className="admin-directory__panel" onSubmit={handleSaveVehicle}>
                    <div className="admin-directory__panel-head">
                      <div>
                        <h3>Страница техники</h3>
                        <p>Картинка используется на странице выбранного танка. Если не указана — можно использовать иконку Poliroid.</p>
                      </div>
                    </div>

                    <label className="admin-directory__field">
                      <span>Изображение танка</span>
                      <input
                        type="text"
                        value={vehicleForm.imageUrl}
                        onChange={(event) => updateVehicleField('imageUrl', event.target.value)}
                        placeholder="/images/tanks/r45_is-7.webp"
                      />
                    </label>

                    <label className="admin-directory__check">
                      <input
                        type="checkbox"
                        checked={vehicleForm.isPublished}
                        onChange={(event) => updateVehicleField('isPublished', event.target.checked)}
                      />
                      <span>Опубликовано в каталоге</span>
                    </label>

                    <div className="admin-directory__actions">
                      <button
                        type="submit"
                        className="admin-directory__submit"
                        disabled={actionKey === 'save-vehicle'}
                      >
                        Сохранить страницу техники
                      </button>

                      {vehicleDetail?.hasDirectory && (
                        <button
                          type="button"
                          className="admin-directory__small-btn admin-directory__small-btn--danger"
                          onClick={handleDeleteVehicleDirectory}
                          disabled={actionKey === 'delete-vehicle'}
                        >
                          Удалить страницу
                        </button>
                      )}
                    </div>
                  </form>

                  <section className="admin-directory__columns">
                    <form className="admin-directory__panel" onSubmit={handleSaveBuild}>
                      <div className="admin-directory__panel-head">
                        <div>
                          <h3>{editingBuildId ? 'Изменить сборку' : 'Добавить сборку'}</h3>
                          <p>Выберите режим, состояние и три оборудования.</p>
                        </div>

                        {editingBuildId && (
                          <button type="button" className="admin-directory__small-btn" onClick={resetBuildForm}>
                            Отмена
                          </button>
                        )}
                      </div>

                      <div className="admin-directory__row">
                        <label className="admin-directory__field">
                          <span>Режим</span>
                          <select
                            value={buildForm.modeKey}
                            onChange={(event) => updateBuildField('modeKey', event.target.value)}
                          >
                            {MODE_OPTIONS.map((mode) => (
                              <option key={mode.value} value={mode.value}>
                                {mode.label}
                              </option>
                            ))}
                          </select>
                        </label>

                        <label className="admin-directory__field">
                          <span>Состояние</span>
                          <select
                            value={buildForm.stateKey}
                            onChange={(event) => updateBuildField('stateKey', event.target.value)}
                          >
                            {STATE_OPTIONS.map((state) => (
                              <option key={state.value} value={state.value}>
                                {state.label}
                              </option>
                            ))}
                          </select>
                        </label>
                      </div>

                      <EquipmentSelect
                        label="Оборудование 1"
                        value={buildForm.equipment1Key}
                        equipment={activeEquipment}
                        onChange={(value) => updateBuildField('equipment1Key', value)}
                      />

                      <EquipmentSelect
                        label="Оборудование 2"
                        value={buildForm.equipment2Key}
                        equipment={activeEquipment}
                        onChange={(value) => updateBuildField('equipment2Key', value)}
                      />

                      <EquipmentSelect
                        label="Оборудование 3"
                        value={buildForm.equipment3Key}
                        equipment={activeEquipment}
                        onChange={(value) => updateBuildField('equipment3Key', value)}
                      />

                      <label className="admin-directory__field">
                        <span>Сортировка</span>
                        <input
                          type="number"
                          value={buildForm.sortOrder}
                          onChange={(event) => updateBuildField('sortOrder', event.target.value)}
                        />
                      </label>

                      <button type="submit" className="admin-directory__submit">
                        {editingBuildId ? 'Сохранить сборку' : 'Добавить сборку'}
                      </button>
                    </form>

                    <form className="admin-directory__panel" onSubmit={handleSaveFieldModification}>
                      <div className="admin-directory__panel-head">
                        <div>
                          <h3>{editingFieldId ? 'Изменить полевую' : 'Добавить полевую'}</h3>
                          <p>Выберите секцию и два варианта, один из них отметьте как выбранный.</p>
                        </div>

                        {editingFieldId && (
                          <button type="button" className="admin-directory__small-btn" onClick={resetFieldForm}>
                            Отмена
                          </button>
                        )}
                      </div>

                      <label className="admin-directory__field">
                        <span>Секция</span>
                        <select
                          value={fieldForm.sectionKey}
                          onChange={(event) => updateFieldFormField('sectionKey', event.target.value)}
                        >
                          {SECTION_OPTIONS.map((section) => (
                            <option key={section.value} value={section.value}>
                              {section.label}
                            </option>
                          ))}
                        </select>
                      </label>

                      <FieldItemSelect
                        label="Левый вариант"
                        value={fieldForm.leftItemKey}
                        items={activeFieldItems}
                        onChange={(value) => updateFieldFormField('leftItemKey', value)}
                      />

                      <FieldItemSelect
                        label="Правый вариант"
                        value={fieldForm.rightItemKey}
                        items={activeFieldItems}
                        onChange={(value) => updateFieldFormField('rightItemKey', value)}
                      />

                      <label className="admin-directory__field">
                        <span>Выбранный вариант</span>
                        <select
                          value={fieldForm.selectedSide}
                          onChange={(event) => updateFieldFormField('selectedSide', event.target.value)}
                        >
                          <option value="left">Левый</option>
                          <option value="right">Правый</option>
                        </select>
                      </label>

                      <label className="admin-directory__field">
                        <span>Сортировка</span>
                        <input
                          type="number"
                          value={fieldForm.sortOrder}
                          onChange={(event) => updateFieldFormField('sortOrder', event.target.value)}
                        />
                      </label>

                      <button type="submit" className="admin-directory__submit">
                        {editingFieldId ? 'Сохранить полевую' : 'Добавить полевую'}
                      </button>
                    </form>
                  </section>

                  <section className="admin-directory__columns">
                    <div className="admin-directory__panel">
                      <div className="admin-directory__panel-head">
                        <div>
                          <h3>Текущие сборки</h3>
                          <p>Оборудование для разных режимов и состояний.</p>
                        </div>
                        <span>{vehicleDetail?.builds?.length ?? 0}</span>
                      </div>

                      <div className="admin-directory__sub-list">
                        {vehicleDetail?.builds?.length > 0 ? (
                          vehicleDetail.builds.map((build) => (
                            <article key={build.id} className="admin-directory__sub-item">
                              <div>
                                <strong>{build.modeKey} / {build.stateKey}</strong>
                                <span>{getEquipmentLabel(equipment, build.equipment1Key)}</span>
                                <span>{getEquipmentLabel(equipment, build.equipment2Key)}</span>
                                <span>{getEquipmentLabel(equipment, build.equipment3Key)}</span>
                              </div>

                              <div className="admin-directory__sub-actions">
                                <button type="button" className="admin-directory__small-btn" onClick={() => handleEditBuild(build)}>
                                  Изменить
                                </button>

                                <button
                                  type="button"
                                  className="admin-directory__small-btn admin-directory__small-btn--danger"
                                  onClick={() => handleDeleteBuild(build)}
                                  disabled={actionKey === `delete-build-${build.id}`}
                                >
                                  Удалить
                                </button>
                              </div>
                            </article>
                          ))
                        ) : (
                          <p className="admin-directory__empty">Сборок пока нет.</p>
                        )}
                      </div>
                    </div>

                    <div className="admin-directory__panel">
                      <div className="admin-directory__panel-head">
                        <div>
                          <h3>Текущая полевая</h3>
                          <p>Секции полевой модернизации для выбранной техники.</p>
                        </div>
                        <span>{vehicleDetail?.fieldModifications?.length ?? 0}</span>
                      </div>

                      <div className="admin-directory__sub-list">
                        {vehicleDetail?.fieldModifications?.length > 0 ? (
                          vehicleDetail.fieldModifications.map((item) => (
                            <article key={item.id} className="admin-directory__sub-item">
                              <div>
                                <strong>{item.sectionKey}</strong>
                                <span>
                                  {item.leftSelected ? '✓ ' : ''}
                                  Лево: {getFieldItemLabel(fieldItems, item.leftItemKey)}
                                </span>
                                <span>
                                  {item.rightSelected ? '✓ ' : ''}
                                  Право: {getFieldItemLabel(fieldItems, item.rightItemKey)}
                                </span>
                              </div>

                              <div className="admin-directory__sub-actions">
                                <button type="button" className="admin-directory__small-btn" onClick={() => handleEditFieldModification(item)}>
                                  Изменить
                                </button>

                                <button
                                  type="button"
                                  className="admin-directory__small-btn admin-directory__small-btn--danger"
                                  onClick={() => handleDeleteFieldModification(item)}
                                  disabled={actionKey === `delete-field-${item.id}`}
                                >
                                  Удалить
                                </button>
                              </div>
                            </article>
                          ))
                        ) : (
                          <p className="admin-directory__empty">Полевой модернизации пока нет.</p>
                        )}
                      </div>
                    </div>
                  </section>
                </>
              )}
            </section>
          </section>
        )}

        {activeTab === 'equipment' && (
          <section className="admin-directory__wide">
            <form className="admin-directory__panel" onSubmit={handleSaveEquipment}>
              <div className="admin-directory__panel-head">
                <div>
                  <h2>{editingEquipmentKey ? 'Изменить оборудование' : 'Новое оборудование'}</h2>
                  <p>Обычное, боновое и экспериментальное оборудование. Ключ используется в сборках.</p>
                </div>

                {editingEquipmentKey && (
                  <button type="button" className="admin-directory__small-btn" onClick={resetEquipmentForm}>
                    Отмена
                  </button>
                )}
              </div>

              <div className="admin-directory__row admin-directory__row--4">
                <label className="admin-directory__field">
                  <span>Ключ</span>
                  <input
                    type="text"
                    value={equipmentForm.key}
                    onChange={(event) => updateEquipmentField('key', event.target.value)}
                    placeholder="rammer"
                  />
                </label>

                <label className="admin-directory__field">
                  <span>Название</span>
                  <input
                    type="text"
                    value={equipmentForm.label}
                    onChange={(event) => updateEquipmentField('label', event.target.value)}
                    placeholder="Орудийный досылатель"
                  />
                </label>

                <label className="admin-directory__field">
                  <span>Вид</span>
                  <select
                    value={equipmentForm.tier}
                    onChange={(event) => updateEquipmentField('tier', event.target.value)}
                  >
                    {EQUIPMENT_TIERS.map((tier) => (
                      <option key={tier.value} value={tier.value}>
                        {tier.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="admin-directory__field">
                  <span>Сортировка</span>
                  <input
                    type="number"
                    value={equipmentForm.sortOrder}
                    onChange={(event) => updateEquipmentField('sortOrder', event.target.value)}
                  />
                </label>
              </div>

              <label className="admin-directory__field">
                <span>Картинка</span>
                <input
                  type="text"
                  value={equipmentForm.imageUrl}
                  onChange={(event) => updateEquipmentField('imageUrl', event.target.value)}
                  placeholder="/images/equipment/rammer.png"
                />
              </label>

              <label className="admin-directory__check">
                <input
                  type="checkbox"
                  checked={equipmentForm.isActive}
                  onChange={(event) => updateEquipmentField('isActive', event.target.checked)}
                />
                <span>Активно</span>
              </label>

              <button type="submit" className="admin-directory__submit" disabled={actionKey === 'save-equipment'}>
                {editingEquipmentKey ? 'Сохранить оборудование' : 'Добавить оборудование'}
              </button>
            </form>

            <div className="admin-directory__panel">
              <div className="admin-directory__section-head">
                <div>
                  <h2>Справочник оборудования</h2>
                  <p>Можно искать, менять, отключать и удалять неиспользуемые элементы.</p>
                </div>
                <span>{filteredEquipment.length}</span>
              </div>

              <label className="admin-directory__field">
                <span>Поиск</span>
                <input
                  type="search"
                  value={equipmentSearch}
                  onChange={(event) => setEquipmentSearch(event.target.value)}
                  placeholder="rammer, досылатель, bounty..."
                />
              </label>

              <DictionaryGrid
                items={filteredEquipment}
                type="equipment"
                loading={loadingDictionaries}
                onEdit={handleEditEquipment}
                onDelete={handleDeleteEquipment}
                actionKey={actionKey}
              />
            </div>
          </section>
        )}

        {activeTab === 'field' && (
          <section className="admin-directory__wide">
            <form className="admin-directory__panel" onSubmit={handleSaveFieldItem}>
              <div className="admin-directory__panel-head">
                <div>
                  <h2>{editingFieldItemKey ? 'Изменить элемент полевой' : 'Новый элемент полевой'}</h2>
                  <p>Создай варианты полевой модернизации, а затем выбирай их в технике.</p>
                </div>

                {editingFieldItemKey && (
                  <button type="button" className="admin-directory__small-btn" onClick={resetFieldItemForm}>
                    Отмена
                  </button>
                )}
              </div>

              <div className="admin-directory__row admin-directory__row--3">
                <label className="admin-directory__field">
                  <span>Ключ</span>
                  <input
                    type="text"
                    value={fieldItemForm.key}
                    onChange={(event) => updateFieldItemField('key', event.target.value)}
                    placeholder="item__1"
                  />
                </label>

                <label className="admin-directory__field">
                  <span>Название</span>
                  <input
                    type="text"
                    value={fieldItemForm.label}
                    onChange={(event) => updateFieldItemField('label', event.target.value)}
                    placeholder="Вездеходная ходовая"
                  />
                </label>

                <label className="admin-directory__field">
                  <span>Сортировка</span>
                  <input
                    type="number"
                    value={fieldItemForm.sortOrder}
                    onChange={(event) => updateFieldItemField('sortOrder', event.target.value)}
                  />
                </label>
              </div>

              <label className="admin-directory__field">
                <span>Картинка</span>
                <input
                  type="text"
                  value={fieldItemForm.imageUrl}
                  onChange={(event) => updateFieldItemField('imageUrl', event.target.value)}
                  placeholder="/images/polevaya/item__1.png"
                />
              </label>

              <label className="admin-directory__check">
                <input
                  type="checkbox"
                  checked={fieldItemForm.isActive}
                  onChange={(event) => updateFieldItemField('isActive', event.target.checked)}
                />
                <span>Активно</span>
              </label>

              <button type="submit" className="admin-directory__submit" disabled={actionKey === 'save-field-item'}>
                {editingFieldItemKey ? 'Сохранить элемент' : 'Добавить элемент'}
              </button>
            </form>

            <div className="admin-directory__panel">
              <div className="admin-directory__section-head">
                <div>
                  <h2>Справочник полевой</h2>
                  <p>Элементы, из которых собираются секции полевой модернизации танка.</p>
                </div>
                <span>{filteredFieldItems.length}</span>
              </div>

              <label className="admin-directory__field">
                <span>Поиск</span>
                <input
                  type="search"
                  value={fieldSearch}
                  onChange={(event) => setFieldSearch(event.target.value)}
                  placeholder="item__1, ходовая..."
                />
              </label>

              <DictionaryGrid
                items={filteredFieldItems}
                type="field"
                loading={loadingDictionaries}
                onEdit={handleEditFieldItem}
                onDelete={handleDeleteFieldItem}
                actionKey={actionKey}
              />
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

function EquipmentSelect({ label, value, equipment, onChange }) {
  return (
    <label className="admin-directory__field">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        <option value="">Выберите оборудование</option>
        {equipment.map((item) => (
          <option key={item.key} value={item.key}>
            {item.label} — {getTierLabel(item.tier)}
          </option>
        ))}
      </select>
    </label>
  );
}

function FieldItemSelect({ label, value, items, onChange }) {
  return (
    <label className="admin-directory__field">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        <option value="">Выберите вариант</option>
        {items.map((item) => (
          <option key={item.key} value={item.key}>
            {item.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function DictionaryGrid({
  items,
  type,
  loading,
  onEdit,
  onDelete,
  actionKey,
}) {
  if (loading) {
    return <p className="admin-directory__empty">Загружаем справочник...</p>;
  }

  if (!items.length) {
    return <p className="admin-directory__empty">Элементов пока нет.</p>;
  }

  return (
    <div className="admin-directory__dict-grid">
      {items.map((item) => (
        <article key={item.key} className="admin-directory__dict-card">
          <div className="admin-directory__dict-top">
            <img src={item.imageUrl} alt={item.label} />

            <div>
              <strong>{item.label}</strong>
              <span>{item.key}</span>
            </div>
          </div>

          <div className="admin-directory__dict-meta">
            {type === 'equipment' && (
              <em>{getTierLabel(item.tier)}</em>
            )}

            <em>{item.isActive ? 'Активно' : 'Отключено'}</em>

            <em>
              Используется: {type === 'equipment'
                ? item.usedInBuildsCount
                : item.usedInFieldModificationsCount}
            </em>
          </div>

          <div className="admin-directory__dict-actions">
            <button type="button" className="admin-directory__small-btn" onClick={() => onEdit(item)}>
              Изменить
            </button>

            <button
              type="button"
              className="admin-directory__small-btn admin-directory__small-btn--danger"
              onClick={() => onDelete(item)}
              disabled={actionKey === `delete-equipment-${item.key}` || actionKey === `delete-field-item-${item.key}`}
            >
              Удалить
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}

export default AdminDirectory;