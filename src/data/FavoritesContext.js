import React, { createContext, useContext, useState, useEffect } from 'react';
import { getStudentMistakes, getStudentConceptNotes, toggleMistakeStar, toggleConceptNoteStar } from '../services/api';

const FavoritesContext = createContext();

export const useFavorites = () => useContext(FavoritesContext);

export const FavoritesProvider = ({ children }) => {
  const [favoriteMistakes, setFavoriteMistakes] = useState([]);
  const [favoriteNotes, setFavoriteNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadFavoritedMistakes = async () => {
    try {
      const mistakes = await getStudentMistakes({ starredOnly: true });
      setFavoriteMistakes(mistakes || []);
    } catch (error) {
      console.error('載入收藏錯題失敗:', error);
    }
  };

  const loadFavoritedNotes = async () => {
    try {
      const notes = await getStudentConceptNotes({ starredOnly: true });
      setFavoriteNotes(notes || []);
    } catch (error) {
      console.error('載入收藏筆記失敗:', error);
    }
  };

  const loadAllFavorites = async () => {
    setLoading(true);
    await Promise.all([loadFavoritedMistakes(), loadFavoritedNotes()]);
    setLoading(false);
  };

  const toggleMistakeFavorite = async (mistakeId, starred) => {
    await toggleMistakeStar(mistakeId, starred);
    await loadFavoritedMistakes();
  };

  const toggleNoteFavorite = async (noteId, starred) => {
    await toggleConceptNoteStar(noteId, starred);
    await loadFavoritedNotes();
  };

  useEffect(() => {
    loadAllFavorites();
  }, []);

  return (
    <FavoritesContext.Provider value={{
      favoriteMistakes,
      favoriteNotes,
      loading,
      loadFavoritedMistakes,
      loadFavoritedNotes,
      loadAllFavorites,
      toggleMistakeFavorite,
      toggleNoteFavorite,
    }}>
      {children}
    </FavoritesContext.Provider>
  );
};