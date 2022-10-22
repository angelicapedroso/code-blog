import { useState, useEffect, useReducer } from 'react';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import db from '../firebase/config';

const initialState = {
  loading: null,
  error: null,
};

const insertReducer = (state, action) => {
  switch (action.type) {
    case 'LOADING':
      return {
        loading: true,
        error: null,
      };
    case 'INSERTED_DOC':
      return {
        loading: false,
        error: null,
      };
    case 'ERROR':
      return {
        loading: false,
        error: action.payload,
      };
    default:
      return state;
  }
};

const useInsertDocument = (docCollection) => {
  const [response, dispatch] = useReducer(insertReducer, initialState);
  const [cancelled, setCancelled] = useState(false);

  const checkCancelBeforeDispatch = (action) => {
    if (!cancelled) {
      dispatch(action);
    }
  };

  const insertDocument = async (document) => {
    checkCancelBeforeDispatch({
      type: 'LOADING',
    });

    try {
      const newDocument = { ...document, createAt: Timestamp.now() };

      const insertedDocument = await addDoc(
        collection(db, docCollection),
        newDocument,
      );

      checkCancelBeforeDispatch({
        type: 'INSERTED_DOC',
        payload: insertedDocument,
      });
    } catch (error) {
      checkCancelBeforeDispatch({
        type: 'ERROR',
        payload: error.message,
      });
    }
  };

  useEffect(() => () => setCancelled(true), []);

  return {
    insertDocument,
    response,
  };
};

export default useInsertDocument;