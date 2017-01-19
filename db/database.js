import firebase from 'firebase';
import {firebaseConfigs} from './secrets';

firebase.initializeApp(firebaseConfigs);

const database = firebase.database();

export default cameraDb = {
    rootRef: database.ref(),
    configs: database.ref('_configurations'),
    imgRef: database.ref('images'),

};

export const firebaseAuth = firebase.auth();
export const firebaseTimeStamp = firebase.database.ServerValue.TIMESTAMP;