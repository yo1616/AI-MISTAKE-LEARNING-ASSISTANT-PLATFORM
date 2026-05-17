import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { FavoritesProvider } from './data/FavoritesContext';
import HomePage from './pages/HomePage';
import MenuPage from './pages/MenuPage';
import ChapterListPage from './pages/ChapterListPage';
import MistakeDetailPage from './pages/MistakeDetailPage';
import ConceptPage from './pages/ConceptPage';
import ImportantConceptPage from './pages/ImportantConceptPage';
import ImportantMistakePage from './pages/ImportantMistakePage';
import DiagnosticQuizPage from './pages/DiagnosticQuizPage';
import DashboardPage from './pages/DashboardPage';
import AccountPage from './pages/AccountPage';
import ChatHistoryPage from './pages/ChatHistoryPage';
import './global.css';

function App() {
  return (
    <FavoritesProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/menu" element={<MenuPage />} />
          <Route path="/chapters" element={<ChapterListPage />} />
          <Route path="/mistake/:chapterId" element={<MistakeDetailPage />} />
          <Route path="/concept" element={<ConceptPage />} />
          <Route path="/important-concept" element={<ImportantConceptPage />} />
          <Route path="/important-mistake" element={<ImportantMistakePage />} />
          <Route path="/diagnostic-quiz" element={<DiagnosticQuizPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="/chat-history" element={<ChatHistoryPage />} />
        </Routes>
      </BrowserRouter>
    </FavoritesProvider>
  );
}

export default App;