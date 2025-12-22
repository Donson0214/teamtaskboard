importScripts("https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js");

const firebaseConfig = {
  apiKey: "AIzaSyCccreTmP58KjBmPWb9_vPmis1BV2HPbdM",
  authDomain: "taskflow-d9ff0.firebaseapp.com",
  projectId: "taskflow-d9ff0",
  storageBucket: "taskflow-d9ff0.firebasestorage.app",
  messagingSenderId: "920179304892",
  appId: "1:920179304892:web:441ff526fd95c78b1ca3b9",
  measurementId: "G-G0LMBYP59G",
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log("Received background message ", payload);
});
