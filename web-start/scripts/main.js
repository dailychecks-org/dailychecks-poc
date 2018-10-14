/**
 * Copyright 2018 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

function signInWithGoogle() {
  var provider = new firebase.auth.GoogleAuthProvider();
  firebase.auth().signInWithPopup(provider);
}

function signInWithTwitter() {
  var provider = new firebase.auth.TwitterAuthProvider();
  firebase.auth().signInWithPopup(provider);
}

function getProviderName() {
  return firebase.auth().currentUser.providerData[0].providerId;
}

function signOut() {
  firebase.auth().signOut();
}

// Initiate firebase auth.
function initFirebaseAuth() {
  firebase.auth().onAuthStateChanged(authStateObserver);
}

// Returns the signed-in user's profile Pic URL.
function getProfilePicUrl() {
  return firebase.auth().currentUser.photoURL || '/images/profile_placeholder.png';
}

// Returns the signed-in user's display name.
function getUserName() {
  return firebase.auth().currentUser.displayName;
}

// Returns the signed-in user's user id
function getUid() {
  return firebase.auth().currentUser.uid;
}

// Returns true if a user is signed-in.
function isUserSignedIn() {
  return !!firebase.auth().currentUser;
}

// Loads habits and listens for upcoming ones.
function loadHabits() {
  var callback = function(snap) {
    var data = snap.val();
    displayHabit(snap.key, data);
  };

  const uid = getUid();
  // https://firebase.google.com/docs/database/web/lists-of-data#filtering_data
  const query = firebase.database()
    .ref(`/users/${uid}/habits/`)
    .orderByChild('type')
    .equalTo('positive');
  query.on('child_added', callback);
  query.on('child_changed', callback);
}

// Saves a new habit on the Firebase DB.
function createHabit(name, days) {
  const uid = getUid();
  const type = 'positive';
  days = parseInt(days, 10);
  return firebase.database().ref(`/users/${uid}/habits/`).push({
    name: name,
    type: type,
    days: days,
    createdAt: Date.now()
  }).catch(function(error) {
    console.error('Error writing new Habit to Firebase Database', error);
  });
}

// Triggered when the new habit form is submitted.
function onNewHabitFormSubmit(e) {
  e.preventDefault();
  // Check that the user entered a habit and is signed in.
  if (habitInputElement.value && daysInputElement.value && checkSignedInWithMessage()) {
    createHabit(habitInputElement.value, daysInputElement.value).then(function() {
      // Clear habit input fields and re-disable the SEND button.
      resetMaterialTextfield(habitInputElement);
      resetMaterialTextfield(daysInputElement);
      toggleButton();
    });
  }
}

// Triggers when the auth state change for instance when the user signs-in or signs-out.
function authStateObserver(user) {
  if (user) { // User is signed in!
    // Get the signed-in user's profile pic and name.
    var userName = getUserName();
    var profilePicUrl = getProfilePicUrl();
    var providerName = getProviderName();

    // Set the user's profile pic and name.
    userNameElement.textContent = userName;
    userPicElement.style.backgroundImage = 'url(' + profilePicUrl + ')';
    providerNameElement.textContent = providerName;

    // Show user's profile and sign-out button.
    userNameElement.removeAttribute('hidden');
    userPicElement.removeAttribute('hidden');
    providerNameElement.removeAttribute('hidden');
    signOutButtonElement.removeAttribute('hidden');

    // Hide sign-in button.
    signInWithGoogleButtonElement.setAttribute('hidden', 'true');
    signInWithTwitterButtonElement.setAttribute('hidden', 'true');

    loadHabits();
  } else { // User is signed out!
    // Hide user's profile and sign-out button.
    userNameElement.setAttribute('hidden', 'true');
    userPicElement.setAttribute('hidden', 'true');
    providerNameElement.setAttribute('hidden', 'true');
    signOutButtonElement.setAttribute('hidden', 'true');

    // Show sign-in button.
    signInWithGoogleButtonElement.removeAttribute('hidden');
    signInWithTwitterButtonElement.removeAttribute('hidden');
  }
}

// Returns true if user is signed-in. Otherwise false and displays a message.
function checkSignedInWithMessage() {
  // Return true if the user is signed in Firebase
  if (isUserSignedIn()) {
    return true;
  }

  // Display a message to the user using a Toast.
  var data = {
    message: 'You must sign-in first',
    timeout: 2000
  };
  signInSnackbarElement.MaterialSnackbar.showSnackbar(data);
  return false;
}

// Resets the given MaterialTextField.
function resetMaterialTextfield(element) {
  element.value = '';
  element.parentNode.MaterialTextfield.boundUpdateClassesHandler();
}

var HABIT_TEMPLATE = `
<li class="mdl-list__item mdl-list__item--two-line">
<span class="mdl-list__item-primary-content">
  <span class="name">Push-ups</span>
  <span class="mdl-list__item-sub-title frequency">Every 3 days</span>
</span>
<span class="mdl-list__item-secondary-content">
  <button class="mdl-button mdl-js-button mdl-list__item-secondary-action">
    <i class="material-icons">done_outline</i>
  </button>
</span>
</li>
`

// A loading image URL.
var LOADING_IMAGE_URL = 'https://www.google.com/images/spin-32.gif?a';

// Displays a Habit in the UI.
function displayHabit(key, data) {
  var div = document.getElementById(key);
  // If an element for that habit does not exists yet we create it.
  if (!div) {
    var container = document.createElement('div');
    container.innerHTML = HABIT_TEMPLATE;
    div = container.firstElementChild;
    div.setAttribute('id', key);
    insertHabit(div, data);
  }
  div.querySelector('.name').textContent = formatName(data.name);
  div.querySelector('.frequency').textContent = formatFrequency(data.days);
  // Show the card fading-in and scroll to view the new habit.
  setTimeout(function() {div.classList.add('visible')}, 1);
  habitListElement.scrollTop = habitListElement.scrollHeight;
  habitInputElement.focus();
}

function insertHabit(div, data) {
  habits[div.getAttribute('id')] = data;

  function daysToMs(days) {
    return 1000 * 60 * 60 * 24 * days;
  }

  const now = Date.now();
  const nextDate = (data.lastDoneAt || now) + daysToMs(data.days);
  for (let i = 0; i < habitListElement.childElementCount; i++) {
    const otherDiv = habitListElement.children[i];
    const otherHabit = habits[otherDiv.getAttribute('id')];
    if (data.lastDoneAt === undefined) {
      if (otherHabit.lastDoneAt === undefined && otherHabit.days < data.days) {
        continue;
      }
      habitListElement.insertBefore(div, otherDiv);
      return;
    }

    if (otherHabit.lastDoneAt === undefined) {
      continue;
    }

    const otherNextDate = otherHabit.lastDoneAt + daysToMs(otherHabit.days);
    if (nextDate < otherNextDate || nextDate == otherNextDate && data.days < otherHabit.days) {
      habitListElement.insertBefore(div, otherDiv);
      return;
    }
  }
  habitListElement.appendChild(div);
}

function formatName(name) {
  return capitalizeFirstLetter(name);
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function formatFrequency(days) {
  return `Every ${days} days`;
}

// Enables or disables the submit button depending on the values of the input
// fields.
function toggleButton() {
  if (habitInputElement.value && daysInputElement.value) {
    submitButtonElement.removeAttribute('disabled');
  } else {
    submitButtonElement.setAttribute('disabled', 'true');
  }
}

// Checks that the Firebase SDK has been correctly setup and configured.
function checkSetup() {
  if (!window.firebase || !(firebase.app instanceof Function) || !firebase.app().options) {
    window.alert('You have not configured and imported the Firebase SDK. ' +
        'Make sure you go through the codelab setup instructions and make ' +
        'sure you are running the codelab using `firebase serve`');
  }
}

// Checks that Firebase has been imported.
checkSetup();

// Shortcuts to DOM Elements.
var habitListElement = document.getElementById('habits');
var habitFormElement = document.getElementById('new-habit-form');
var habitInputElement = document.getElementById('new-habit');
var daysInputElement = document.getElementById('new-days');
var submitButtonElement = document.getElementById('submit');
var userPicElement = document.getElementById('user-pic');
var userNameElement = document.getElementById('user-name');
var providerNameElement = document.getElementById('provider-name');
var signInWithGoogleButtonElement = document.getElementById('sign-in-with-google');
var signInWithTwitterButtonElement = document.getElementById('sign-in-with-twitter');
var signOutButtonElement = document.getElementById('sign-out');
var signInSnackbarElement = document.getElementById('must-signin-snackbar');

// Saves habit on form submit.
habitFormElement.addEventListener('submit', onNewHabitFormSubmit);
signOutButtonElement.addEventListener('click', signOut);
signInWithGoogleButtonElement.addEventListener('click', signInWithGoogle);
signInWithTwitterButtonElement.addEventListener('click', signInWithTwitter);

// Toggle for the button.
habitInputElement.addEventListener('keyup', toggleButton);
habitInputElement.addEventListener('change', toggleButton);
daysInputElement.addEventListener('keyup', toggleButton);
daysInputElement.addEventListener('change', toggleButton);

// program state
const habits = {};

// initialize Firebase
initFirebaseAuth();
