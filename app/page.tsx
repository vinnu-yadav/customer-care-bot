import { LivelyApp } from '@/components/lively/lively-app'

export const dynamic = 'force-dynamic'

export default function Page() {
  // Firebase web API keys are public identifiers, not Admin SDK credentials.
  const config = {
    apiKey: 'AIzaSyC20z6dWPD4Fjinc6KKpVDmm9rQUGeKjHU',
    authDomain: 'kartify-a4e66.firebaseapp.com',
    databaseURL: 'https://kartify-a4e66-default-rtdb.firebaseio.com',
    projectId: 'kartify-a4e66',
    storageBucket: 'kartify-a4e66.firebasestorage.app',
    messagingSenderId: '663778229564',
    appId: '1:663778229564:web:6c7c55b61dba8271913239',
  }
  return <LivelyApp config={config} />
}
