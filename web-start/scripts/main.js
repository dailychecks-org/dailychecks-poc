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

// Signs-in Friendly Chat.
function signIn() {
  // Sign in Firebase using popup auth and Google as the identity provider.
  var provider = new firebase.auth.GoogleAuthProvider();
  var provider = new firebase.auth.TwitterAuthProvider();
  firebase.auth().signInWithPopup(provider);
}

// Signs-out of Friendly Chat.
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
    displayHabit(snap.key, data.name, data.type === 'positive', data.frequency);
  };

  const uid = getUid();
  firebase.database().ref(`/users/${uid}/habits/`).on('child_added', callback);
  firebase.database().ref(`/users/${uid}/habits/`).on('child_changed', callback);
}

// Loads habit logs and listens for upcoming ones.
function loadHabitLogs() {
  var callback = function(snap) {
    var data = snap.val();
    displayHabitLog(snap.key, data.habitId, data.createdAt);
  };

  const uid = getUid();
  firebase.database().ref(`/users/${uid}/habitLogs/`).on('child_added', callback);
  firebase.database().ref(`/users/${uid}/habitLogs/`).on('child_changed', callback);
}

// Saves a new message on the Firebase DB.
function saveMessage(messageText) {
  const uid = getUid();

  // habit:name:type:days
  // log:name
  var parts = messageText.split(':');
  const cmd = parts[0];
  if (cmd === 'habit' && parts.length == 4) {
    const name = parts[1];
    const type = parts[2];
    const days = parseInt(parts[3], 10);
    return firebase.database().ref(`/users/${uid}/habits/`).push({
      name: name,
      type: type,
      frequency: days
    }).catch(function(error) {
      console.error('Error writing new Habit to Firebase Database', error);
    });
  } else if (cmd == 'log' && parts.length == 2) {
    // TODO use specified habitId instead of hardcoded dummy
    const habitId = '-LLM-P6dS1NjmQ5FVpSp';
    return firebase.database().ref(`/users/${uid}/habitLogs/`).push({
      habitId: habitId,
      createdAt: Date.now()
    }).catch(function(error) {
      console.error('Error writing new HabitLog to Firebase Database', error);
    });
  }
}

// Triggered when the send new message form is submitted.
function onMessageFormSubmit(e) {
  e.preventDefault();
  // Check that the user entered a message and is signed in.
  if (messageInputElement.value && checkSignedInWithMessage()) {
    saveMessage(messageInputElement.value).then(function() {
      // Clear message text field and re-enable the SEND button.
      resetMaterialTextfield(messageInputElement);
      toggleButton();
    });
  }
}

// Triggers when the auth state change for instance when the user signs-in or signs-out.
function authStateObserver(user) {
  if (user) { // User is signed in!
    // Get the signed-in user's profile pic and name.
    var profilePicUrl = getProfilePicUrl();
    var userName = getUserName();

    // Set the user's profile pic and name.
    userPicElement.style.backgroundImage = 'url(' + profilePicUrl + ')';
    userNameElement.textContent = userName;

    // Show user's profile and sign-out button.
    userNameElement.removeAttribute('hidden');
    userPicElement.removeAttribute('hidden');
    signOutButtonElement.removeAttribute('hidden');

    // Hide sign-in button.
    signInButtonElement.setAttribute('hidden', 'true');

    loadHabits();
    loadHabitLogs();
  } else { // User is signed out!
    // Hide user's profile and sign-out button.
    userNameElement.setAttribute('hidden', 'true');
    userPicElement.setAttribute('hidden', 'true');
    signOutButtonElement.setAttribute('hidden', 'true');

    // Show sign-in button.
    signInButtonElement.removeAttribute('hidden');
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

var HABIT_TEMPLATE =
    '<div class="habit-container">' +
      '<div class="name"></div>' +
      '<div class="positive"></div>' +
      '<div class="frequency"></div>' +
    '</div>';

var HABIT_LOG_TEMPLATE =
    '<div class="habitlog-container">' +
      '<div class="habitId"></div>' +
      '<div class="createdAt"></div>' +
    '</div>';

// A loading image URL.
var LOADING_IMAGE_URL = 'https://www.google.com/images/spin-32.gif?a';

// Displays a Habit in the UI.
function displayHabit(key, name, positive, frequency) {
  var div = document.getElementById(key);
  // If an element for that message does not exists yet we create it.
  if (!div) {
    var container = document.createElement('div');
    container.innerHTML = HABIT_TEMPLATE;
    div = container.firstChild;
    div.setAttribute('id', key);
    habitListElement.appendChild(div);
  }
  div.querySelector('.name').textContent = name;
  div.querySelector('.positive').textContent = positive ? 'good' : 'bad';
  div.querySelector('.frequency').textContent = frequency;
  // Show the card fading-in and scroll to view the new habit.
  setTimeout(function() {div.classList.add('visible')}, 1);
  habitListElement.scrollTop = habitListElement.scrollHeight;
  messageInputElement.focus();
}

// Displays a HabitLog in the UI.
function displayHabitLog(key, habitId, createdAt) {
  var div = document.getElementById(key);
  // If an element for that message does not exists yet we create it.
  if (!div) {
    var container = document.createElement('div');
    container.innerHTML = HABIT_LOG_TEMPLATE;
    div = container.firstChild;
    div.setAttribute('id', key);
    habitLogListElement.appendChild(div);
  }
  div.querySelector('.habitId').textContent = habitId;
  div.querySelector('.createdAt').textContent = createdAt;
  // Show the card fading-in and scroll to view the new habit.
  setTimeout(function() {div.classList.add('visible')}, 1);
  habitLogListElement.scrollTop = habitLogListElement.scrollHeight;
  messageInputElement.focus();
}

// Enables or disables the submit button depending on the values of the input
// fields.
function toggleButton() {
  if (messageInputElement.value) {
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
var habitLogListElement = document.getElementById('habitLogs');
var messageFormElement = document.getElementById('message-form');
var messageInputElement = document.getElementById('message');
var submitButtonElement = document.getElementById('submit');
var userPicElement = document.getElementById('user-pic');
var userNameElement = document.getElementById('user-name');
var signInButtonElement = document.getElementById('sign-in');
var signOutButtonElement = document.getElementById('sign-out');
var signInSnackbarElement = document.getElementById('must-signin-snackbar');

// Saves message on form submit.
messageFormElement.addEventListener('submit', onMessageFormSubmit);
signOutButtonElement.addEventListener('click', signOut);
signInButtonElement.addEventListener('click', signIn);

// Toggle for the button.
messageInputElement.addEventListener('keyup', toggleButton);
messageInputElement.addEventListener('change', toggleButton);

// initialize Firebase
initFirebaseAuth();
