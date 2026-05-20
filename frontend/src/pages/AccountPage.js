import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import { getStudentProfile } from '../data/mockApi';
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

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
  const result = await getStudentProfile();
  console.log('getStudentProfile 結果:', result);  // 查看完整資料
  if (result.success && result.data) {
    console.log('學生資料:', result.data);
    console.log('gradeYear:', result.data.gradeYear);  // 確認年級是否有值
    setUserData({
      name: result.data.name || '',
      gradeYear: result.data.gradeYear || '',
      phone: result.data.phone || '',
      subjects: result.data.subjects || [],
      email: result.data.email || '',
      language: '繁體中文'
    });
  }
};

  const handleEditField = (field) => {
    console.log(`編輯字段: ${field}`);
  };

  const handleNotificationToggle = () => {
    setNotificationsEnabled(!notificationsEnabled);
  };

  return (
    <div className="account-page">
      <div className="account-container">
        <PageHeader title="設定" />
        <div className="account-content">
          <div className="account-card">
            <div className="card-title">Profile Details</div>
            <div className="info-list">
              <div className="info-row" onClick={() => handleEditField('name')}><span className="info-label">Name</span><div className="info-value-wrapper"><span className="info-value">{userData.name}</span></div></div>
              <div className="info-row" onClick={() => handleEditField('gradeYear')}><span className="info-label">Grade Year</span><div className="info-value-wrapper"><span className="info-value">{userData.gradeYear}</span></div></div>
              <div className="info-row" onClick={() => handleEditField('phone')}><span className="info-label">Contact Phone</span><div className="info-value-wrapper"><span className="info-value">{userData.phone}</span></div></div>
              <div className="info-row subjects-row" onClick={() => handleEditField('subjects')}><span className="info-label">Subjects</span><div className="info-value-wrapper"><div className="subjects-tags">{userData.subjects.map((s, idx) => (<span key={idx} className="subject-tag">{s.subjectName}</span>))}</div></div></div>
              <div className="info-row" onClick={() => handleEditField('email')}><span className="info-label">Email</span><div className="info-value-wrapper"><span className="info-value">{userData.email}</span></div></div>
              <div className="info-row" onClick={() => handleEditField('language')}><span className="info-label">Language</span><div className="info-value-wrapper"><span className="info-value">{userData.language}</span></div></div>
            </div>
          </div>
          <div className="account-card notification-card"><div className="card-title">Notification Settings</div><div className="notification-row"><span className="notification-label">Push Notifications</span><div className={`toggle-switch ${notificationsEnabled ? 'active' : ''}`} onClick={handleNotificationToggle}><div className="toggle-knob"></div></div></div></div>
        </div>
      </div>
    </div>
  );
}

export default AccountPage;