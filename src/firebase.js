// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyBNacalSUTV71_tgUkS0JrtvbgPPY-JHZc",
    authDomain: "urbancart-20cc2.firebaseapp.com",
    projectId: "urbancart-20cc2",
    storageBucket: "urbancart-20cc2.appspot.com",
    messagingSenderId: "742105588542",
    appId: "1:742105588542:web:bdd141d50657899c4a026f",
    measurementId: "G-TCDPNXWB91"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { app, auth, RecaptchaVerifier, signInWithPhoneNumber }
