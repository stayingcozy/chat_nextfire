import firebase from 'firebase/app'
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/storage';

const firebaseConfig = {
    apiKey: "AIzaSyDE5ioNkrsXnTv5uA9-9Gcf9ykKYHeEO4I",
    authDomain: "nextfire-bd884.firebaseapp.com",
    projectId: "nextfire-bd884",
    storageBucket: "nextfire-bd884.appspot.com",
    messagingSenderId: "624361251406",
    appId: "1:624361251406:web:6cfd736d5cf8fdb479591f",
    measurementId: "G-PKNER4TTTN"
  };

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig)
}

export const auth = firebase.auth();
export const firestore = firebase.firestore();
export const storage = firebase.storage();
