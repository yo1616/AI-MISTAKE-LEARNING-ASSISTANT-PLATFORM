import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import { getStudentProfile, getStudentClasses } from '../services/api';
import '../style/AccountPage.css';

function AccountPage() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState({
    name: '',
    phone: '',
    subjects: [],
    email: '',
    gradeYear: '',
    language: '繁體中文'
  });
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const [student, classes] = await Promise.all([
        getStudentProfile(),
        getStudentClasses('student_001')
      ]);

      setUserData({
        name: student?.name || '',
        gradeYear: student?.gradeYear || '',
        phone: student?.phone || '',
        subjects: classes || [],
        email: student?.email || '',
        language: '繁體中文'
      });
    } catch (error) {
      console.error('載入個人資料失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditField = (field) => {
    console.log(`編輯字段: ${field}`);
  };

  const handleNotificationToggle = () => {
    setNotificationsEnabled(!notificationsEnabled);
  };

  if (loading) {
    return (
      <div className="account-page">
        <div className="account-container">
          <PageHeader title="個人設定" />
          <div className="loading">載入中...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="account-page">
      <div className="account-container">
        <PageHeader title="個人設定" />
        <div className="account-content">
          <div className="account-card">
            <div className="card-title">資料</div>
            <div className="info-list">
              <div className="info-row" onClick={() => handleEditField('name')}>
                <span className="info-label">姓名</span>
                <div className="info-value-wrapper">
                  <span className="info-value">{userData.name}</span>
                </div>
              </div>
              <div className="info-row" onClick={() => handleEditField('gradeYear')}>
                <span className="info-label">年級</span>
                <div className="info-value-wrapper">
                  <span className="info-value">{userData.gradeYear}</span>
                </div>
              </div>
              <div className="info-row" onClick={() => handleEditField('phone')}>
                <span className="info-label">聯絡電話</span>
                <div className="info-value-wrapper">
                  <span className="info-value">{userData.phone}</span>
                </div>
              </div>
              <div className="info-row subjects-row" onClick={() => handleEditField('subjects')}>
                <span className="info-label">科目</span>
                <div className="info-value-wrapper">
                  <div className="subjects-tags">
                    {userData.subjects.map((s, idx) => (
                      <span key={idx} className="subject-tag">{s.subjectName}</span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="info-row" onClick={() => handleEditField('email')}>
                <span className="info-label">Email</span>
                <div className="info-value-wrapper">
                  <span className="info-value">{userData.email}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="account-card notification-card">
            <div className="card-title">通知</div>
            <div className="notification-row">
              <span className="notification-label">接受通知訊息</span>
              <div className={`toggle-switch ${notificationsEnabled ? 'active' : ''}`} onClick={handleNotificationToggle}>
                <div className="toggle-knob"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AccountPage;
