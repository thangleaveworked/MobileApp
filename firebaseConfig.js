
import firebase from 'firebase/compat/app';
import 'firebase/compat/storage';
const firebaseConfig = {
  apiKey: "AIzaSyB710sMP_Mu5QrgL9-tlps6kg1-8BYxC3I",
  authDomain: "thuctap-f37c9.firebaseapp.com",
  projectId: "thuctap-f37c9",
  storageBucket: "thuctap-f37c9.appspot.com",
  messagingSenderId: "1004691222880",
  appId: "1:1004691222880:web:1e2d04dc0e995caa35ee05",
  measurementId: "G-53KVV3X53D"
};
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
export { firebase };
// adb