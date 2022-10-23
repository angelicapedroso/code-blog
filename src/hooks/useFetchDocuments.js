import { useState, useEffect } from 'react';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
} from 'firebase/firestore';
import db from '../firebase/config';

const useFetchDocuments = (docCollection, search = null, uid = null) => {
  const [documents, setDocuments] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(null);
  const [cancelled, setCancelled] = useState(false);

  useEffect(() => {
    async function loadData() {
      if (cancelled) return null;

      setLoading(true);

      const collectionRef = await collection(db, docCollection);

      try {
        let q;

        if (search) {
          q = query(
            collectionRef,
            where('tags', 'array-contains', search),
            orderBy('createAt', 'desc'),
          );
        } else {
          q = await query(collectionRef, orderBy('createAt', 'desc'));
        }

        await onSnapshot(q, (querySnapshot) => {
          setDocuments(
            querySnapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            })),
          );
        });

        setLoading(false);
      } catch (err) {
        setError(err);
      }

      return setLoading(false);
    }
    loadData();
  }, [docCollection, documents, search, uid, cancelled]);

  useEffect(() => setCancelled(true), []);

  return { documents, error, loading };
};

export default useFetchDocuments;
