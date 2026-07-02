<script type="module">
  // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";
  import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-analytics.js";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  const firebaseConfig = {
    apiKey: "AIzaSyBW0egtlG4JXjkoWB2Lfu5GcYhZz_oEjbI",
    authDomain: "boni-lottery-8d0e6.firebaseapp.com",
    projectId: "boni-lottery-8d0e6",
    storageBucket: "boni-lottery-8d0e6.firebasestorage.app",
    messagingSenderId: "479140405683",
    appId: "1:479140405683:web:20a2205ece9fdcdf076bc6",
    measurementId: "G-6MG08FXC7V"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);
</script>