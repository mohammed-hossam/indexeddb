//* the big difference between localstorage and indexeddb:
//1) the indexeddb doesnot need to use json.parse or json.stringify, 3shan moomkn 27ot feha 2y values 3ala 3ks locaclsotrage lazm tkon json values.
//2) the indexeddb can be used with serverworker,localstorage cannot,3shan localstorage mota7a fqt ll webpage bta3ty.
//3) the indexeddb can store blobs(binary data).

//* the idb-keyval library :
//doesnot allow for mutltiple stores per database.(but can create more than one database).
//doesnot have cursor.
//doesnot espose transaction.
//return promises

//* indexeddb in general:
//sh8al ka async lma 2gy 23ml open put add delete 2w kda, b7es ene b2olo y3ml el 7aga ele 3yzha 3ala shkl request, wlma y5lsha bytrigger event mo3yn.
//transcations=>wrapper around requests.

/* -------------------------------------------------------------------------- */
/*                           coding begin from here                           */
/* -------------------------------------------------------------------------- */
import { uid } from './utilites.js';

//7tana db w objectStore hena 3shan nt3aml en feh wa7d bs mnhom fl apllication kolo.

//* create a database:
let DBopenReq = window.indexedDB.open('whiskeyDB', 11);
let db;
let objectStore;
DBopenReq.addEventListener('error', (err) => {
  //Error occurred while trying to open DB
  console.warn(err);
});

DBopenReq.addEventListener('success', (e) => {
  //this will be always triggerd whatever i changed the version or not.
  //if upgradeneeded triggerd it will always be triggered after it.
  console.log(e);
  db = e.target.result;
});

DBopenReq.addEventListener('upgradeneeded', (e) => {
  //first time opening this DB
  //OR a new version was passed into open()
  console.log(e);
  db = e.target.result;
  let oldVersion = e.oldVersion;
  let newVersion = e.newVersion || db.version;
  //   e.newVersion just the same as db.version

  //*add objectstore:
  //mynf3sh n3ml objectstore bnfs el esm 3shan kda 3mlna if condition.
  if (!db.objectStoreNames.contains('whiskeyStore')) {
    objectStore = db.createObjectStore('whiskeyStore', {
      keyPath: 'id',
    });
  }
  //   db.createObjectStore('blabla');

  //*removeobjectstore:
  if (db.objectStoreNames.contains('blabla')) {
    db.deleteObjectStore('blabla');
  }
});

document.whiskeyForm.addEventListener('submit', (e) => {
  e.preventDefault();

  let name = document.querySelector('#name').value.trim();
  let country = document.querySelector('#country').value.trim();
  let age = parseInt(document.querySelector('#age'));
  let owned = document.querySelector('#isOwned ').checked;

  let whiskey = {
    id: uid(),
    name,
    country,
    age,
    owned,
  };

  //* adding data to the db:
  let tx = db.transaction('whiskeyStore', 'readwrite');
  let store = tx.objectStore('whiskeyStore');
  let request = store.add(whiskey);

  request.onsuccess = (e) => {
    console.log(e);
  };
  request.onerror = (err) => {
    console.log(err);
  };

  tx.oncomplete = (e) => {
    console.log(e);
  };
  tx.onerror = (err) => {
    console.log(err);
  };
});
