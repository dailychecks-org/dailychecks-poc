import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
var firebaseConfig = {
    apiKey: "AIzaSyApAP7c_RAlFhOqT595VLJya_gKOnI1UYY",
    authDomain: "dailychecks-85f53.firebaseapp.com",
    databaseURL: "https://dailychecks-85f53.firebaseio.com",
    projectId: "dailychecks-85f53",
    storageBucket: "dailychecks-85f53.appspot.com",
    messagingSenderId: "988814374316",
    appId: "1:988814374316:web:21dd65aef07769264f7609",
    measurementId: "G-PFV9X7JH0S"
};

firebase.initializeApp(firebaseConfig);

export const auth = firebase.auth();
export const googleProvider = new firebase.auth.GoogleAuthProvider();

export const db = firebase.firestore();
