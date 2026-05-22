import React, { createContext, useState, useContext, useEffect } from 'react';
import { getStudentMistakes, toggleMistakeStar, getConceptNotes, toggleConceptNoteStar } from '../services/api';

const FavoritesContext = createContext();

export const useFavorites = () => useContext(FavoritesContext);

export const FavoritesProvider = ({ children }) => {
  const [favoritedMistakes, setFavoritedMistakes] = useState([]);
  const [favoritedNotes, setFavoritedNotes] = useState([]);

  const loadFavoritedMistakes = async () => {
    const result = await getStudentMistakes({ starredOnly: true });
    if (result.success) {
      setFavoritedMistakes(result.data);
    }
  };

  const toggleMistakeFavorite = async (mistakeId, starred) => {
    await toggleMistakeStar(mistakeId, starred);
    await loadFavoritedMistakes();
  };

  const loadFavoritedNotes = async () => {
    const result = await getConceptNotes({ starredOnly: true });
    if (result.success) {
      setFavoritedNotes(result.data);
    }
  };

  const toggleNoteFavorite = async (noteId, starred) => {
    await toggleConceptNoteStar(noteId, starred);
    await loadFavoritedNotes();
  };

  useEffect(() => {
    loadFavoritedMistakes();
    loadFavoritedNotes();
  }, []);

  return (
    <FavoritesContext.Provider value={{
      favoritedMistakes,
      favoritedNotes,
      loadFavoritedMistakes,
      loadFavoritedNotes,
      toggleMistakeFavorite,
      toggleNoteFavorite
    }}>
      {children}
    </FavoritesContext.Provider>
  );
};