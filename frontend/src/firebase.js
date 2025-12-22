
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCccreTmP58KjBmPWb9_vPmis1BV2HPbdM",
  authDomain: "taskflow-d9ff0.firebaseapp.com",
  projectId: "taskflow-d9ff0",
  storageBucket: "taskflow-d9ff0.firebasestorage.app",
  messagingSenderId: "920179304892",
  appId: "1:920179304892:web:441ff526fd95c78b1ca3b9",
  measurementId: "G-G0LMBYP59G",
};

const app = initializeApp(firebaseConfig);


export const firebaseApp = app;
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
provider.setCustomParameters({
  prompt: "select_account", 
});

import { getAnalytics } from "firebase/analytics";
getAnalytics(app);
