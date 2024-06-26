
import firebase from 'firebase/compat/app';
import 'firebase/compat/storage';
const firebaseConfig = {
  apiKey: "AIzaSyC-RcfJiO18l4Z2kQ6d2xh1cZBU-9wy-20",
  authDomain: "thuctap-58e60.firebaseapp.com",
  projectId: "thuctap-58e60",
  storageBucket: "thuctap-58e60.appspot.com",
  messagingSenderId: "535619409524",
  appId: "1:535619409524:web:2d1229e9db2b491c65e321",
  measurementId: "G-FKFGC42KCH"
};
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
export { firebase };