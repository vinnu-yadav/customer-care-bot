'use client'

import useSWRSubscription from 'swr/subscription'
import { onAuthStateChanged, type User } from 'firebase/auth'
import { limitToLast, onValue, orderByKey, query, ref } from 'firebase/database'
import { firebaseClient, type FirebaseConfig } from '@/lib/firebase'

export function useFirebaseUser(config: FirebaseConfig) {
  return useSWRSubscription<User | null, Error>(['firebase-auth', config.appId], (_, { next }) => {
    try {
      return onAuthStateChanged(firebaseClient(config).auth, (user) => next(null, user), (error) => next(error))
    } catch (error) {
      next(error as Error)
      return () => {}
    }
  })
}

export function useFirebaseValue<T>(config: FirebaseConfig, uid: string, path: string | null, limit?: number) {
  return useSWRSubscription<T | null, Error>(path ? [config.appId, uid, path, limit ?? 0] : null, (_, { next }) => {
    const target = ref(firebaseClient(config).database, path!)
    return onValue(limit ? query(target, orderByKey(), limitToLast(limit)) : target,
      (snapshot) => next(null, snapshot.val() as T | null), (error) => next(error))
  })
}
