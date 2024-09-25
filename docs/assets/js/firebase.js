<<<<<<< Updated upstream
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
=======
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, updateProfile } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
>>>>>>> Stashed changes

// Firebase setup (no import/export statements)
const firebaseConfig = {
  apiKey: "AIzaSyCnx-VGjSYMaf9w-QEca2x6eSZhh2WXPUA",
  authDomain: "wordle-12568.firebaseapp.com",
  projectId: "wordle-12568",
  storageBucket: "wordle-12568.appspot.com",
  messagingSenderId: "652192334684",
  appId: "1:652192334684:web:907ea0cf9cd0fc67d67799"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

<<<<<<< Updated upstream
firebase.initializeApp(firebaseConfig);
=======
>>>>>>> Stashed changes

// Function to show and hide popups
window.openPopup = function(popupId) {
  document.getElementById(popupId).style.display = 'block';
}

window.closePopup = function(popupId) {
  document.getElementById(popupId).style.display = 'none';
}

// Function to show user info after login or register
function showUserInfo(user) {
  document.getElementById('user-name-display').innerText = `Logado como: ${user.displayName || "Usuário"}`;
}

// Function to log in the user
window.login = function() {
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;

<<<<<<< Updated upstream
  auth.signInWithEmailAndPassword(email, password)
      .then((userCredential) => {
          const user = userCredential.user;
          alert('Login realizado com sucesso!');
          document.getElementById('user-name-display').innerText = user.displayName || "Usuário";
          closePopup('login-popup');
          openPopup('logout-popup');
      })
      .catch((error) => {
          alert(error.message);
      });
}
=======
  signInWithEmailAndPassword(auth, email, password)
    .then(async (userCredential) => {
      const user = userCredential.user;
      alert('Login realizado com sucesso!');
      document.getElementById('user-name-display').innerText = user.displayName || "Usuário";
      closePopup('login-popup');
      openPopup('logout-popup');

      // Após o login, carregar o conteúdo salvo
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        tinymce.get('editor').setContent(docSnap.data().content);
      } else {
        tinymce.get('editor').setContent('');
      }
    })
    .catch((error) => {
      alert(error.message);
    });
};

>>>>>>> Stashed changes

// Function to register the user
window.register = function() {
  const name = document.getElementById('register-name').value;
  const email = document.getElementById('register-email').value;
  const password = document.getElementById('register-password').value;

  auth.createUserWithEmailAndPassword(email, password)
      .then((userCredential) => {
          const user = userCredential.user;
          user.updateProfile({ displayName: name }).then(() => {
              alert('Registro realizado com sucesso!');
              document.getElementById('user-name-display').innerText = name;
              closePopup('register-popup');
              openPopup('logout-popup');
          });
      })
      .catch((error) => {
          alert(error.message);
      });
}

// Function to log out the user
window.logout = function() {
  auth.signOut().then(() => {
      alert('Logout realizado com sucesso!');
      closePopup('logout-popup');
  }).catch((error) => {
      alert(error.message);
  });
}
