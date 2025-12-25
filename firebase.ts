
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAO9pBDkuUP03SBx3pDJtuDaIByBmUo7ug",
  authDomain: "western-pivot-384004.firebaseapp.com",
  projectId: "western-pivot-384004",
  storageBucket: "western-pivot-384004.firebasestorage.app",
  messagingSenderId: "77819660841",
  appId: "1:77819660841:web:975386a85ba119d0686a38",
  measurementId: "G-8CGCH2FTFS"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
