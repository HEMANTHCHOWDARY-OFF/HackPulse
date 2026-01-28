import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyC3wu5wXnVl4Hc6XIU5elafYnzr6ySPGyg",
    authDomain: "hackpulse-c4432.firebaseapp.com",
    projectId: "hackpulse-c4432",
    storageBucket: "hackpulse-c4432.firebasestorage.app",
    messagingSenderId: "1026712957642",
    appId: "1:1026712957642:web:f4695c474f029e9bdd3a33",
    measurementId: "G-HCZV9TFWDQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

// Make app available globally or export it
export { app, analytics, auth, db };
window.firebaseApp = app;
window.firebaseAnalytics = analytics;
window.firebaseAuth = auth;
window.firebaseDb = db;
