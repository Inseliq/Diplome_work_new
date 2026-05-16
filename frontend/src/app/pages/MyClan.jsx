import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMyClan } from '../hooks/useMyClan';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from '../components/ui/StatusComponents';

function MyClanEmpty({ error }) {
  const message =
    error?.data?.message ||
    'Вы пока не состоите в клане. Вступить самостоятельно нельзя, клан назначается администратором.';

  return (
    <div className="wrapper my-clan-page">
      <div className="container">
        <div
          className="my-clan-page__empty reveal reveal--visible"
          style={{ padding: '32px', textAlign: 'center' }}
        >
          <h1>Вы пока не состоите в клане</h1>
          <p>{message}</p>

          <div
            style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'center',
              marginTop: '20px',
              flexWrap: 'wrap',
            }}
          >
            <Link className="btn btn-primary" to="/">
              На главную
            </Link>

            <Link className="btn btn-ghost" to="/profile">
              В профиль
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function MyClan() {
  const {
    clan,
    loading,
    error,
    reload,
    leaveCurrentClan,
  } = useMyClan();

  const { refreshUser } = useAuth();

  const [leavingClan, setLeavingClan] = useState(false);
  const [message, setMessage] = useState(null);

  if (loading) {
    return (
      <div className="wrapper my-clan-page">
        <div className="container">
          <LoadingSpinner text="Загружаем клан..." />
        </div>
      </div>
    );
  }

  if (error?.status === 404) {
    return <MyClanEmpty error={error} />;
  }

  if (error) {
    return (
      <div className="wrapper my-clan-page">
        <div className="container">
          <div
            className="my-clan-page__empty reveal reveal--visible"
            style={{ padding: '32px', textAlign: 'center' }}
          >
            <h1>К сожалению, не удалось загрузить клан.</h1>
            <p>Пожалуйста, попробуйте ещё раз.</p>

            <div
              style={{
                display: 'flex',
                gap: '12px',
                justifyContent: 'center',
                marginTop: '20px',
                flexWrap: 'wrap',
              }}
            >
              <button className="btn btn-primary" onClick={reload}>
                Попробовать снова
              </button>

              <Link className="btn btn-ghost" to="/">
                На главную
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!clan) {
    return <MyClanEmpty />;
  }

  const handleLeaveClan = async () => {
    const confirmed = window.confirm('Вы точно хотите покинуть клан?');

    if (!confirmed) return;

    setLeavingClan(true);
    setMessage(null);

    try {
      const result = await leaveCurrentClan();
      await refreshUser?.();
      setMessage(result?.message || 'Вы покинули клан');
    } catch (err) {
      setMessage(err?.data?.message || err?.message || 'Не удалось покинуть клан');
    } finally {
      setLeavingClan(false);
    }
  };

  return (
    <div className="wrapper my-clan-page">
      <div className="container">
        <div className="my-clan-page__header reveal">
          <div className="my-clan-page__label">
            Клан
          </div>

          <h1 className="my-clan-page__title">
            [{clan.tag}] {clan.name}
          </h1>

          <p className="my-clan-page__subtitle">
            {clan.description}
          </p>
        </div>

        {message && (
          <div className="my-clan-page__message reveal">
            {message}
          </div>
        )}

        <section className="my-clan-card reveal">
          <div className="my-clan-card__header">
            <h2>Информация о клане</h2>
          </div>

          <div className="my-clan-card__grid">
            <div className="my-clan-field">
              <span>Тег</span>
              <strong>{clan.tag}</strong>
            </div>

            <div className="my-clan-field">
              <span>Название</span>
              <strong>{clan.name}</strong>
            </div>

            <div className="my-clan-field">
              <span>Рейтинг ELO</span>
              <strong>{clan.eloRating}</strong>
            </div>

            <div className="my-clan-field">
              <span>Участников</span>
              <strong>{clan.membersCount}</strong>
            </div>
          </div>

          <div className="my-clan-card__actions">
            <button
              className="btn btn-ghost"
              onClick={handleLeaveClan}
              disabled={leavingClan}
            >
              {leavingClan ? 'Выходим...' : 'Покинуть клан'}
            </button>
          </div>
        </section>

        <section className="my-clan-card reveal">
          <div className="my-clan-card__header">
            <h2>Участники клана</h2>
          </div>

          {clan.members?.length > 0 ? (
            <div className="my-clan-members">
              {clan.members.map((member) => (
                <div
                  key={member.id}
                  className={`my-clan-member${member.isCurrentUser ? ' my-clan-member--me' : ''}`}
                >
                  <div className="my-clan-member__main">
                    <strong>
                      {member.nickname}
                      {member.isCurrentUser ? ' — это вы' : ''}
                    </strong>

                    <span>{member.rankLabel}</span>
                  </div>

                  {member.email && (
                    <div className="my-clan-member__email">
                      {member.email}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="my-clan-card__empty">
              Участников пока нет.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}

export default MyClan;