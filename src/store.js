import { createStore, combineReducers, compose } from 'redux';
import firebase from 'firebase';
import 'firebase/firestore';
import { reactReduxFirebase, firebaseReducer } from 'react-redux-firebase';
import { reduxFirestore, firestoreReducer } from 'redux-firestore';

//Reducers
import notifyReducer from './reducers/notifyReducer';
import settingsReducer from './reducers/settingsReducer';

//Check for local development
if (process.env.NOD_ENV === 'procduction') {
  const firebaseConfig = require('./config/firebase_prod');
  firebaseRun(firebaseConfig);
} else {
  const firebaseConfig = require('./config/firebase_dev');
  firebaseRun(firebaseConfig);
}
//fire
function firebaseRun(firebaseConfig) {
  firebase.initializeApp(firebaseConfig);
}
// react-redux-firebase config
const rrfConfig = {
  userProfile: 'users',
  useFirestoreForProfile: true // Firestore for Profile instead of Realtime DB
};

//Init firestore
const firestore = firebase.firestore();
const settings = { timestampsInSnapshots: true };
firestore.settings(settings);

// Add reactReduxFirebase enhancer when making store creator
const createStoreWithFirebase = compose(
  reactReduxFirebase(firebase, rrfConfig),
  reduxFirestore(firebase)
)(createStore);

const rootReducer = combineReducers({
  firebase: firebaseReducer,
  firestore: firestoreReducer,
  notify: notifyReducer,
  settings: settingsReducer
});

//Check for settings in localStoarge
if (localStorage.getItem('settings') == null) {
  //Defualt Settings
  const defaultSettings = {
    disableBalanceOnAdd: true,
    disableBalanceOnEdit: false,
    allowRegistration: false
  };

  //Set to localStorage
  localStorage.setItem('settings', JSON.stringify(defaultSettings));
}

//Create initial state
const initialState = { settings: JSON.parse(localStorage.getItem('settings')) };

//create store
const store = createStoreWithFirebase(
  rootReducer,
  initialState,
  compose(
    window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
  )
);

export default store;
