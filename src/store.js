'use strict';

import RNFS from 'react-native-fs';

let gTest = false;

function runInTestMode() {
  console.log('store: run in the test mode.');
  gTest = true;
}

function toCSV(row) {
  let out = [];
  for (let i = 0; i < row.length; i++) {
    let t = row[i].toString().replace(new RegExp('"', 'g'), '""');
    out.push(`"${t}"`);
  }
  return out.join(',');
}

export default class FileStore {
  constructor() {
    this._initialized = false;
    this._readyCallback = null;

    this._nextTripId = this._nextMemberId = this._nextExpenseId = 1;
    this._store = {};
    this._store.trips = {};

    if (gTest) {
      this._initialized = true;
      this._fillDummyData();
    } else {
      this._tripPathPrefix = 'trip';
      this._loadFromPersistentStore();
    }
  }

  //----------------------------------------------------------
  // Public API.
  //----------------------------------------------------------
  setReadyCallback = callback => {
    this._readyCallback = callback;
  };

  isReady = () => {
    return this._initialized;
  };

  addTrip = name => {
    this._check();

    let id = this._nextTripId++;
    this._store.trips[id] = {
      key: id,
      id,
      name,
      members: {},
      expenses: {}
    };

    this._syncToPersistentStore(true, id);
  };

  updateTrip = (id, name) => {
    this._check();

    this._store.trips[id].name = name;

    this._syncToPersistentStore(false, id);
  };

  getTrips = () => {
    this._check();

    let trips = [];
    for (let id in this._store.trips) {
      trips.push(this._store.trips[id]);
    }
    trips.sort(function(a, b) {
      return parseInt(a.id) - parseInt(b.id);
    });
    return trips;
  };

  deleteTrip = id => {
    this._check();

    delete this._store.trips[id];

    RNFS.unlink(this._tripPath(id))
      .then(() => {
        // Do nothing.
      })
      // `unlink` will throw an error, if the item to unlink does not exist
      .catch(error => {
        alert(`ERROR: Failed to delete trip ${id} (${error}).`);
      });
  };

  addMember = (tripId, name, ratio) => {
    this._check();

    this.updateMember(tripId, this._nextMemberId++, name, ratio);

    this._syncToPersistentStore(true, tripId);
  };

  updateMember = (tripId, memberId, name, ratio) => {
    this._check();

    let trip = this._store.trips[tripId];
    trip.members[memberId] = { name, ratio };

    this._syncToPersistentStore(false, tripId);
  };

  deleteMember = (tripId, memberId) => {
    this._check();

    let trip = this._store.trips[tripId];
    delete trip.members[memberId];

    this._syncToPersistentStore(false, tripId);
  };

  getMembers = tripId => {
    this._check();

    let members = [];
    if (!(tripId in this._store.trips)) {
      return members;
    }

    for (let key in this._store.trips[tripId].members) {
      key = parseInt(key);
      let m = this._store.trips[tripId].members[key];
      members.push({
        key: key,
        id: key,
        name: m['name'],
        ratio: m['ratio']
      });
    }
    members.sort(function(a, b) {
      if (a.name < b.name) return -1;
      if (a.name > b.name) return 1;
      return 0;
    });
    return members;
  };

  getMemberName = (tripId, memberId) => {
    this._check();

    for (let key in this._store.trips[tripId].members) {
      key = parseInt(key);
      if (key == memberId) return this._store.trips[tripId].members[key].name;
    }
    return '';
  };

  addExpense = (tripId, expense) => {
    this._check();

    this.updateExpense(tripId, this._nextExpenseId++, expense);

    this._syncToPersistentStore(true, tripId);
  };

  updateExpense = (tripId, expenseId, expense) => {
    this._check();

    let trip = this._store.trips[tripId];
    trip.expenses[expenseId] = expense;

    this._syncToPersistentStore(false, tripId);
  };

  deleteExpense = (tripId, expenseId) => {
    this._check();

    let trip = this._store.trips[tripId];
    delete trip.expenses[expenseId];

    this._syncToPersistentStore(false, tripId);
  };

  getExpenses = tripId => {
    this._check();

    let expenses = [];
    for (let key in this._store.trips[tripId].expenses) {
      key = parseInt(key);
      let e = this._store.trips[tripId].expenses[key];
      let members = [];
      for (let memberId in e.members) {
        members.push(this.getMemberName(tripId, memberId));
      }
      members.sort();
      expenses.push({
        key: key,
        id: key,
        name: e.name,
        cost: e.cost,
        members,
        details: e.members
      });
    }
    return expenses;
  };

  getSummary = tripId => {
    this._check();

    let members = this.getMembers(tripId);
    let summary = {};
    for (let i = 0; i < members.length; i++) {
      let m = members[i];
      summary[m.id] = {
        key: m.id,
        member_id: m.id,
        name: m.name,
        paid: 0,
        shouldPay: 0
      };
    }

    for (let key in this._store.trips[tripId].expenses) {
      key = parseInt(key);
      let e = this._store.trips[tripId].expenses[key];
      for (let member_id in e.members) {
        summary[member_id].paid += e.members[member_id].paid;
        summary[member_id].shouldPay += e.members[member_id].shouldPay;
      }
    }

    let results = [];
    for (let m in summary) {
      results.push(summary[m]);
    }
    results.sort();
    return results;
  };

  exportFullAsCSV = tripId => {
    let lines = [];
    let members = this.getMembers(tripId);
    let expenses = this.getExpenses(tripId);

    // Members' names
    let row = ['', ''];
    for (let i = 0; i < members.length; i++) {
      row.push(members[i].name);
      row.push('');
      row.push('');
    }
    lines.push(toCSV(row));

    // Header
    row = ['', '費用'];
    for (let i = 0; i < members.length; i++) {
      row.push('應付', '已付', '差額');
    }
    lines.push(toCSV(row));

    // Details of expenses
    for (let i = 0; i < expenses.length; i++) {
      let e = expenses[i];
      row = [e.name, e.cost];
      for (let i = 0; i < members.length; i++) {
        let m = members[i];
        let t = e.details[m.id];
        if (t) {
          row.push(t.shouldPay);
          row.push(t.paid);
          row.push(t.paid - t.shouldPay);
        } else {
          row.push('');
          row.push('');
          row.push('');
        }
      }
      lines.push(toCSV(row));
    }
    return lines.join('\n') + '\n';
  };

  //----------------------------------------------------------
  // Private API.
  //----------------------------------------------------------
  _fillDummyData = () => {
    // Fill dumy trips.
    this.addTrip('Germany 2015/06/11');
    this.addTrip('Japan 2017/01/07');
    this.addTrip('Taipei 2016/01/13');
    this.addTrip('Taipei 2017/07/28');

    // Fill dummy members.
    let trip = this.getTrips()[0];
    this.addMember(trip.id, '吉吉', 1);
    this.addMember(trip.id, '小小兵', 2);
    this.addMember(trip.id, '三眼怪', 3);

    // Fill dummy expenses.
    let ms = this.getMembers(trip.id);
    let members = {};
    members[ms[0].id] = { paid: 0, shouldPay: 2000 };
    members[ms[1].id] = { paid: 0, shouldPay: 1000 };
    members[ms[2].id] = { paid: 5000, shouldPay: 2000 };
    this.addExpense(trip.id, { name: '飯店', cost: 5000, members });
    members = {};
    members[ms[0].id] = { paid: 2000, shouldPay: 1000 };
    members[ms[2].id] = { paid: 0, shouldPay: 1000 };
    this.addExpense(trip.id, { name: '租車', cost: 2000, members });
    members = {};
    members[ms[1].id] = { paid: 800, shouldPay: 500 };
    members[ms[2].id] = { paid: 200, shouldPay: 500 };
    this.addExpense(trip.id, { name: '午餐', cost: 1000, members });
  };

  _check = () => {
    if (!this._initialized) {
      throw 'ERROR: FileStore has not been initialized!';
    }
  };

  _metaPath = () => {
    return RNFS.DocumentDirectoryPath + '/meta';
  };

  _tripPath = tripId => {
    return RNFS.DocumentDirectoryPath + '/trip' + tripId.toString();
  };

  _loadFromPersistentStore = () => {
    RNFS.exists(this._metaPath()).then(existed => {
      if (!existed) {
        // The first time.
        let meta = {
          _nextTripId: 1,
          _nextMemberId: 1,
          _nextExpenseId: 1
        };
        RNFS.writeFile(this._metaPath(), JSON.stringify(meta), 'utf8')
          .then(() => {
            // Restart.
            this._loadFromPersistentStore();
          })
          .catch(error => {
            alert(`ERROR: _loadFromPersistentStore: Failed to write meta (${error}).`);
          });
        return;
      }

      this._loadTripsFromPersistentStore();
    });
  };

  _loadTripsFromPersistentStore = () => {
    RNFS.readFile(this._metaPath(), 'utf8')
      .then(content => {
        // Load the meta.
        let meta = JSON.parse(content);
        this._nextTripId = meta._nextTripId;
        this._nextMemberId = meta._nextMemberId;
        this._nextExpenseId = meta._nextExpenseId;

        if (this._nextTripId > 1) {
          this._doLoadTripsFromPersistentStore();
        } else {
          this._initialized = true;
          // Fill sample data.
          this.addTrip('2017 Kyoto');
          let trip = this.getTrips()[0];
          // Fill members.
          this.addMember(trip.id, 'Gru family', 5);
          this.addMember(trip.id, 'Dave', 1);
          this.addMember(trip.id, 'Stuart', 1);
          this.addMember(trip.id, 'Kevin', 1);
          this.addMember(trip.id, 'Tim', 1);
          this.addMember(trip.id, 'Mark', 1);
          this.addMember(trip.id, 'Bob', 1);
          let ms = this.getMembers(trip.id);
          // Fill expenses.
          let members = {};
          members[ms[0].id] = { paid: 11000, shouldPay: 5000 };
          members[ms[1].id] = { paid: 0, shouldPay: 1000 };
          members[ms[2].id] = { paid: 0, shouldPay: 1000 };
          members[ms[3].id] = { paid: 0, shouldPay: 1000 };
          members[ms[4].id] = { paid: 0, shouldPay: 1000 };
          members[ms[5].id] = { paid: 0, shouldPay: 1000 };
          members[ms[6].id] = { paid: 0, shouldPay: 1000 };
          this.addExpense(trip.id, { name: 'hotel', cost: 11000, members });
          members = {};
          members[ms[2].id] = { paid: 0, shouldPay: 1000 };
          members[ms[3].id] = { paid: 3000, shouldPay: 1000 };
          members[ms[6].id] = { paid: 0, shouldPay: 1000 };
          this.addExpense(trip.id, { name: 'foods', cost: 3000, members });
          members = {};
          members[ms[2].id] = { paid: 500, shouldPay: 200 };
          members[ms[5].id] = { paid: 0, shouldPay: 300 };
          this.addExpense(trip.id, { name: 'toys', cost: 500, members });
          members = {};
          members[ms[0].id] = { paid: 2000, shouldPay: 1500 };
          members[ms[2].id] = { paid: 0, shouldPay: 500 };
          members[ms[4].id] = { paid: 1000, shouldPay: 500 };
          members[ms[6].id] = { paid: 0, shouldPay: 500 };
          this.addExpense(trip.id, { name: 'rent car', cost: 3000, members });

          if (this._readyCallback) {
            try {
              this._readyCallback();
            } catch (error) {
              alert(
                `ERROR: _loadTripsFromPersistentStore: Failed to run the ready callback (${error}).`
              );
            }
          }
        }
      })
      .catch(error => {
        alert(`ERROR: _loadTripsFromPersistentStore: Failed to load meta (${error}).`);
      });
  };

  _doLoadTripsFromPersistentStore = () => {
    let promises = [];
    for (let i = 1; i < this._nextTripId; i++) {
      let path = this._tripPath(i);
      let p = RNFS.exists(path)
        .then(existed => {
          return existed ? path : '';
        })
        .then(path => {
          if (path) {
            return RNFS.readFile(path, 'utf8');
          }
          return '';
        })
        .then(content => {
          if (content) {
            this._store.trips[i] = JSON.parse(content);
          }
        })
        .catch(error => {
          alert(`ERROR: _loadTripsFromPersistentStore: Failed to load trip id=${i} (${error}).`);
        });
      promises.push(p);
    }

    Promise.all(promises)
      .then(() => {
        this._initialized = true;
        if (this._readyCallback) {
          try {
            this._readyCallback();
          } catch (error) {
            alert(
              `ERROR: _loadTripsFromPersistentStore: Failed to run the ready callback (${error}).`
            );
          }
        }
      })
      .catch(error => {
        alert(`ERROR: _loadTripsFromPersistentStore: Failed to load trips (${error}).`);
      });
  };

  _syncToPersistentStore = (updateMeta, tripId) => {
    if (gTest) return;

    if (updateMeta) {
      let meta = {
        _nextTripId: this._nextTripId,
        _nextMemberId: this._nextMemberId,
        _nextExpenseId: this._nextExpenseId
      };
      RNFS.writeFile(this._metaPath(), JSON.stringify(meta), 'utf8')
        .then(() => {
          // Restart.
          this._loadFromPersistentStore();
        })
        .catch(error => {
          alert(`ERROR: Failed to update meta (${error}).`);
        });
    }

    RNFS.writeFile(this._tripPath(tripId), JSON.stringify(this._store.trips[tripId]), 'utf8')
      .then(() => {
        // Do nothing.
      })
      .catch(error => {
        alert(`ERROR: Failed to update trip ${tripId} (${error}).`);
      });
  };
}

export { runInTestMode };
