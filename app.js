//* the big difference between localstorage and indexeddb:
//1) the indexeddb doesnot need to use json.parse or json.stringify, 3shan moomkn 27ot feha 2y values 3ala 3ks locaclsotrage lazm tkon json values.
//2) the indexeddb can be used with serverworker,localstorage cannot,3shan localstorage mota7a fqt ll webpage bta3ty.
//3) the indexeddb can store blobs(binary data).
//4)el etnan l browser byms7 el data ele fehom fe 7dod 14 youm.

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

//7tana db w objectStore hena 3shan nt3aml en feh wa7d bs mnhom fl application kolo.

//* create a database:
let DBopenReq = window.indexedDB.open('whiskeyDB', 13);
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

  //lma el db tkon ready 3yzen n3ml build list
  buildList();
  //lw 3ayz 23ml 7aga fl data 2wel ma el application yft7 bshkl 3am, ene msln 27ot data fl db 2w 2geb data meno 23mlha fl success event, 3shan el mfrod m3mlsh 2y 7aga leha 3laqa bl data fl upgradeneeded event 5ales.
  //upgradeneeded event 23ml feh bs 7agat leha 3laqa bstructure el db nfsha.
});

DBopenReq.addEventListener('upgradeneeded', (e) => {
  //first time opening this DB
  //OR a new version was passed into open()
  console.log(e);
  db = e.target.result;
  let oldVersion = e.oldVersion;
  let newVersion = e.newVersion || db.version;
  //   e.newVersion just the same as db.version

  //*to add objectstore:
  //mynf3sh n3ml objectstore bnfs el esm 3shan kda 3mlna if condition.
  if (!db.objectStoreNames.contains('whiskeyStore')) {
    objectStore = db.createObjectStore('whiskeyStore', {
      keyPath: 'id',
    });

    // to createindex( hena by3ml nfs el dataele 3ndana gwa el store bs byrtbha trteb 3ala 7sb key gded n2olo 3leh bdl ele md5leno fl 2wel(ele hwa hena id))
    // objectStore.createIndex('nameIDX', 'name', { unique: false });
    // objectStore.createIndex('countryIDX', 'country', { unique: false });
  }

  //   db.createObjectStore('blabla');
  //*to removeobjectstore:
  // if (db.objectStoreNames.contains('blabla')) {
  //   db.deleteObjectStore('blabla');
  // }
});

//*add btn:
document.getElementById('btnAdd').addEventListener('click', (e) => {
  e.preventDefault();

  let name = document.querySelector('#name').value.trim();
  let country = document.querySelector('#country').value.trim();
  let age = parseInt(document.querySelector('#age').value);
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

  //dol by7slo 2bl events el transactions.
  request.onsuccess = (e) => {
    console.log(e);
  };
  request.onerror = (err) => {
    console.log(err);
  };

  //moomkn 23ml 2ktr mn request w lma kol el requests t5ls kolha b3d kda el transaction complete hytf3l, lw 2y request bs mnhom baz transaction error hytf3l.
  tx.oncomplete = (e) => {
    console.log(e);
    buildList();
    // clearForm();
  };
  tx.onerror = (err) => {
    console.log(err);
  };
});

//*reset btn:
document.getElementById('btnClear').addEventListener('click', clearForm);
function clearForm(e) {
  if (e) {
    e.preventDefault();
  }
  document.whiskeyForm.reset();
}
//*delete btn:
document.getElementById('btnDelete').addEventListener('click', (e) => {
  e.preventDefault();

  let id = document.whiskeyForm.getAttribute('data-key');
  if (id) {
    let tx = db.transaction('whiskeyStore', 'readwrite');
    let store = tx.objectStore('whiskeyStore');
    let request = store.delete(id);

    tx.oncomplete = () => {
      buildList();
      clearForm();
    };
  }
});

//*update btn:
document.getElementById('btnUpdate').addEventListener('click', (e) => {
  e.preventDefault();

  let id = document.whiskeyForm.getAttribute('data-key');
  let name = document.querySelector('#name').value.trim();
  let country = document.querySelector('#country').value.trim();
  let age = parseInt(document.querySelector('#age').value);
  let owned = document.querySelector('#isOwned ').checked;
  let whiskey = {
    id,
    name,
    country,
    age,
    owned,
  };
  if (id) {
    let tx = db.transaction('whiskeyStore', 'readwrite');
    let store = tx.objectStore('whiskeyStore');
    let request = store.put(whiskey);

    tx.oncomplete = () => {
      buildList();
      clearForm();
    };
  }
});

//* build list util:
function buildList() {
  let ULlist = document.querySelector('.wList');
  ULlist.innerHTML = `<li>Loading...</li>`;
  console.log(ULlist.innerHTML);
  let tx = db.transaction('whiskeyStore', 'readonly');
  let store = tx.objectStore('whiskeyStore');
  let request = store.getAll();
  // getAll=> give us an array of all objects inside the store
  //moomkn ta5od argumnet bykon el id 2w el index ele m5taro bshkl 3am b7es ygbly el objects ele ttmasha m3 el id dah bs
  //moomkn 2deha brdo range of ids

  //lw 3ayz b index mo3yn bdl el id.
  // let idx=store.index('countryIDX')
  // let request = idx.getAll();

  //lw 3ayz range mo3yn.
  // let range = IDBKeyRange.lowerBound(14, true); //false 14 or higher... true 15 or higher
  // let range = IDBKeyRange.bound(1, 10, false, false);
  // let idx = store.index('ageIDX');
  // let request = idx.getAll(range);

  //moomkn 23ml el kaalm dah fl tx.oncomplete brdo msh fr2a hena fl 7eta deh.
  request.onsuccess = (e) => {
    let request = e.target;
    let result = e.target.result;
    console.log(result);
    ULlist.innerHTML = result
      .map((el) => {
        return `<li data-key='${el.id}'><span>${el.name}</span> ${el.age}</li>`;
      })
      .join('');
  };
}

//* manage list:
document.querySelector('.wList').addEventListener('click', (e) => {
  let li = e.target.closest('[data-key]');
  let id = li.getAttribute('data-key');

  let tx = db.transaction('whiskeyStore', 'readonly');
  let store = tx.objectStore('whiskeyStore');
  let request = store.get(id);

  request.onsuccess = (e) => {
    let request = e.target;
    let whiskey = request.result;
    document.getElementById('name').value = whiskey.name;
    document.getElementById('country').value = whiskey.country;
    document.getElementById('age').value = whiskey.age;
    document.getElementById('isOwned').checked = whiskey.owned;
    //3mlna ll form id 3shan lma n3mlo update 2w delete
    document.whiskeyForm.setAttribute('data-key', whiskey.id);
  };
});

// buildList using cursors:
/* function buildList() {
  let ULlist = document.querySelector('.wList');
  ULlist.innerHTML = `<li>Loading...</li>`;
  let tx = db.transaction('whiskeyStore', 'readonly');
  let store = tx.objectStore('whiskeyStore');

  let index = store.index('nameIDX');
  let range = IDBKeyRange.bound('A', 'Z', false, false); //case sensitive A-Z a-z
  list.innerHTML = '';
  //direction - next, nextunique, prev, prevunique
  index.openCursor(range, 'next').onsuccess = (ev) => {
    let cursor = ev.target.result;
    if (cursor) {
      console.log(
        cursor.source.objectStore.name,
        cursor.source.name,
        cursor.direction,
        cursor.key,
        cursor.primaryKey
      );
      let whiskey = cursor.value;
      list.innerHTML += `<li data-key="${whiskey.id}"><span>${whiskey.name}</span> ${whiskey.age}</li>`;
      cursor.continue(); //call onsuccess event
      //mynf3sh 2st3mlhom fe 7aga async y3ny mynf3sh 27thom msln fe setTimeOut w lma el timeOut y5ls ttnfz, 2w ene 23mlo lma el user y3ml click 3ala 7aga mo3yna, w dah bsbb en el transaction nfso bykon 3yz y5ls as soon as possible
    } else {
      console.log('end of cursor');
    }
  };
} */
