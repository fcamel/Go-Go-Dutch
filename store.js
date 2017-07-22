'use strict';


// TODO(fcamel): Rewrite it with real data stored in files.
// For early development.
export default class DummyStore {
  constructor() {
    // Fill dumy trips.
    this.nextTripId = 1;
    this.store = {};
    this.store.trips = {};
    this.addTrip('Germany 2015/06/11');
    this.addTrip('Japan 2017/01/07');
    this.addTrip('Taipei 2016/01/13');
    this.addTrip('Taipei 2017/07/28');

    // Fill dummy members.
    this.nextMemberId = 1;
    var trip = this.getTrips()[0];
    this.addMember(trip.id, '吉吉', 1);
    this.addMember(trip.id, '小小兵', 2);
    this.addMember(trip.id, '三眼怪', 3);

    // Fill dummy expenses.
    this.nextExpenseId = 1;
    var ms = this.getMembers(trip.id);
    var members = {};
    members[ms[0].id] = { paid: 0, shouldPay: 2000, };
    members[ms[1].id] = { paid: 0, shouldPay: 1000, };
    members[ms[2].id] = { paid: 5000, shouldPay: 2000, };
    this.addExpense(trip.id, { name: '飯店', cost: 5000, members, });
    members = {};
    members[ms[0].id] = { paid: 2000, shouldPay: 1000, };
    members[ms[2].id] = { paid: 0, shouldPay: 1000, };
    this.addExpense(trip.id, { name: '租車', cost: 2000, members, });
    members = {};
    members[ms[1].id] = { paid: 800, shouldPay: 500, };
    members[ms[2].id] = { paid: 200, shouldPay: 500, };
    this.addExpense(trip.id, { name: '午餐', cost: 1000, members, });
  }

  addTrip(name) {
    var id = this.nextTripId++;
    this.store.trips[id] = {
      key: id,
      id,
      name,
      members: {},
      expenses: {},
    };
  }

  updateTrip(id, name) {
    this.store.trips[id].name = name;
  }

  getTrips() {
    var trips = [];
    for (var id in this.store.trips) {
        trips.push(this.store.trips[id]);
    }
    trips.sort(function (a, b) {
      return parseInt(a.id) - parseInt(b.id);
    });
    return trips;
  }

  deleteTrip(id) {
    delete this.store.trips[id];
  }

  addMember(tripId, name, ratio) {
    this.updateMember(tripId, this.nextMemberId++, name, ratio);
  }

  updateMember(tripId, memberId, name, ratio) {
    var trip = this.store.trips[tripId];
    trip.members[memberId] = { name, ratio };
  }

  deleteMember(tripId, memberId) {
    var trip = this.store.trips[tripId];
    delete trip.members[memberId];
  }

  getMembers(tripId) {
    var members = [];
    if (!(tripId in this.store.trips)) {
      return members;
    }

    for (var key in this.store.trips[tripId].members) {
      key = parseInt(key);
      var m = this.store.trips[tripId].members[key];
      members.push({
        key: key,
        id: key,
        name: m['name'],
        ratio: m['ratio']
      });
    }
    return members;
  }

  getMemberName(tripId, memberId) {
    for (var key in this.store.trips[tripId].members) {
      key = parseInt(key);
      if (key == memberId)
        return this.store.trips[tripId].members[key].name;
    }
    return '';
  }

  addExpense(tripId, expense) {
    this.updateExpense(tripId, this.nextExpenseId++, expense);
  }

  updateExpense(tripId, expenseId, expense) {
    var trip = this.store.trips[tripId];
    trip.expenses[expenseId] = expense;
  }

  deleteExpense(tripId, expenseId) {
    var trip = this.store.trips[tripId];
    delete trip.expenses[expenseId];
  }

  getExpenses(tripId) {
    var expenses = [];
    for (var key in this.store.trips[tripId].expenses) {
      key = parseInt(key);
      var e = this.store.trips[tripId].expenses[key];
      var members = [];
      for (var memberId in e.members) {
        members.push(this.getMemberName(tripId, memberId));
      }
      members.sort();
      expenses.push({
        key: key,
        id: key,
        name: e.name,
        cost: e.cost,
        members,
        details: e.members,
      });
    }
    return expenses;
  }

  getSummary(tripId) {
    var members = this.getMembers(tripId);
    var summary = {};
    for (var i = 0; i < members.length; i++) {
      var m = members[i];
      summary[m.id] = { key: m.id, member_id: m.id, name: m.name, paid: 0, shouldPay: 0 };
    }

    for (var key in this.store.trips[tripId].expenses) {
      key = parseInt(key);
      var e = this.store.trips[tripId].expenses[key];
      for (var member_id in e.members) {
        summary[member_id].paid += e.members[member_id].paid;
        summary[member_id].shouldPay += e.members[member_id].shouldPay;
      }
    }

    var results = [];
    for (var m in summary) {
      results.push(summary[m]);
    }
    results.sort();
    return results;
  }
}
