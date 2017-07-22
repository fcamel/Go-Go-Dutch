'use strict';

import React, { Component } from 'react';
import {
  AppRegistry,
  Alert,
  Button,
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { StackNavigator } from 'react-navigation';

import BottomNavigation, { Tab } from 'react-native-material-bottom-navigation'
import ModalWrapper from 'react-native-modal-wrapper';


//---------------------------------------------------------------------
// Store
//---------------------------------------------------------------------
let gStore = null;

// TODO(fcamel): Rewrite it with real data stored in files.
// For early development.
class DummyStore {
  constructor() {
    // Fill dumy trips.
    this.nextTripId = 1;
    this.store = {};
    this.store.trips = [];
    this.addTrip('Germany 2015/06/11');
    this.addTrip('Japan 2017/01/07');
    this.addTrip('Taipei 2016/01/13');
    this.addTrip('Taipei 2017/07/28');

    // Fill dummy members.
    this.nextMemberId = 1;
    var trip = this.store.trips[0];
    this.addMember(trip.id, '王小明', 1);
    this.addMember(trip.id, '工藤新一', 2);
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
    this.store.trips.push({
      key: this.nextTripId,
      id: this.nextTripId,
      name,
      members: {},
      expenses: {},
    });
    this.nextTripId++;
  }

  updateTrip(id, name) {
    for (var i = 0; i < this.store.trips.length; i++) {
      if (this.store.trips[i].id === id) {
        this.store.trips[i].name = name;
        break;
      }
    }
  }

  getTrips() {
    return this.store.trips;
  }

  deleteTrip(id) {
    for (var i = 0; i < this.store.trips.length; i++) {
      if (this.store.trips[i].id == id) {
        this.store.trips.splice(i, 1);
        break;
      }
    }
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
    console.log('getExpenses', expenses);
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


gStore = new DummyStore();

//---------------------------------------------------------------------
// Main components
//---------------------------------------------------------------------
class TripListScreen extends Component {
  static navigationOptions = ({ navigation }) => {
    const {state, setParams} = navigation;
    return {
      title: '記帳本',
      headerRight: (
        <Button title='新增帳本' onPress={() => setParams({editTripVisible: true})} />
      ),
    };
  };

  constructor() {
    super();
    this.store = gStore;
    this.state = { id: -1, name: '' };
  }

  render() {
    // NOTE: params is undefined in the first call.
    const params = this.props.navigation.state.params ? this.props.navigation.state.params : {};

    return (
      <View style={{flex: 1, backgroundColor: '#f5fcff'}}>
        <ModalWrapper
          style={{ width: 280, height: 180, paddingLeft: 24, paddingRight: 24 }}
          visible={!!params.editTripVisible}>
          <Text>出遊名稱</Text>
          <TextInput
            autoFocus={true}
            defaultValue={this.state.name}
            placeholder='阿里山 2017/01'
            onChangeText={(name) => this.setState({name})}/>
          <View style={{flexDirection: 'row', justifyContent: 'space-around'}}>
            <Button title="確認" onPress={() => this.onFinishEditTrip(true)} />
            <Button title="取消" onPress={() => this.onFinishEditTrip(false)} />
          </View>
        </ModalWrapper>
        <ModalWrapper
          containerStyle={{ flexDirection: 'row', alignItems: 'flex-end' }}
          visible={!!params.deleteTripId}>
          <TouchableOpacity style={{}}
            onPress={() => { this.onConfirmDeleteTrip(params.deleteTripId ? params.deleteTripId : 0) }}>
            <Text style={[styles.bottomMenuItem, {backgroundColor: '#f55'}]}>刪除</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{}}
            onPress={this.onCancelDeleteTrip}>
            <Text style={styles.bottomMenuItem}>取消</Text>
          </TouchableOpacity>
        </ModalWrapper>

        <FlatList
          style={{flex: 1}}
          data={this.store.getTrips()}
          renderItem={
            ({item}) =>
              <TouchableOpacity style={{flex: 1, flexDirection: 'row', borderBottomWidth: 1, borderColor: '#ccc'}}
                onPress={() => this.onClickTrip(item.id, item.name)}>
                <Text style={[styles.tableData, {flex: 1}]}>{item.name}</Text>
                <View style={{margin: 8, flexDirection: 'row', width: 100, justifyContent: 'space-around'}}>
                  <Button title="編輯" onPress={() => {this.onEditTrip(item.id, item.name)}} />
                  <Button title="刪除" onPress={() => {this.onDeleteTrip(item.id)}} />
                </View>
              </TouchableOpacity>
          }
        />
      </View>
    );
  }

  //--------------------------------------------------------------------
  // Helper methods.
  //--------------------------------------------------------------------
  onEditTrip(id, name) {
    this.setState({id, name});
    this.props.navigation.setParams({editTripVisible: true})
  }

  onFinishEditTrip(done) {
    if (done && this.state.name.length > 0) {
      if (this.state.id > 0) {
        this.store.updateTrip(this.state.id, this.state.name);
      } else {
        this.store.addTrip(this.state.name);
      }
    }

    this.props.navigation.setParams({editTripVisible: false})
    this.setState({id: -1, name: ''});
  }

  onDeleteTrip = (id) => {
    this.props.navigation.setParams({deleteTripId: id})
  }

  onConfirmDeleteTrip = (id) => {
    this.store.deleteTrip(id);
    this.props.navigation.setParams({deleteTripId: 0})
  }

  onCancelDeleteTrip = () => {
    this.props.navigation.setParams({deleteTripId: 0})
  }

  onClickTrip = (id, name) => {
    var members = this.store.getMembers(id);
    var activeTab = (!members || members.length <= 0)
        ? TripContentMainView.Tabs.Members
        : TripContentMainView.Tabs.Expenses;
    this.props.navigation.navigate('Trip', {title: name, tripId: id, activeTab})
  }
}

class TripContentScreen extends Component {
  static navigationOptions = ({ navigation }) => {
    const {state, setParams} = navigation;
    if (state.params.activeTab === TripContentMainView.Tabs.Members) {
      return {
        title: state.params.title,
        headerRight: (
          <Button title='新增成員' onPress={() => {
            setParams({editorVisible: true});
          }}/>
        ),
      };
    } else if (state.params.activeTab === TripContentMainView.Tabs.Expenses) {
      return {
        title: state.params.title,
        headerRight: (
          <Button title='新增消費' onPress={() => {
            setParams({editorVisible: true});
          }}/>
        ),
      };
    } else {
      // TODO
      return {
        title: state.params.title,
      };
    }
  };

  constructor() {
    super();
    this.store = gStore;
    this.resetState();
  }

  render() {
    const { params } = this.props.navigation.state;

    // params.editorVisible may be undefined.
    var editorVisible = !!params.editorVisible;
    var showEditor = (visible) => {
      this.props.navigation.setParams({editorVisible: visible});
    };

    return (
      <View style={{flex: 1, backgroundColor: '#f5fcff'}}>
        <TripContentMainView
          store={this.store}
          navigation={this.props.navigation}
          tripId={params.tripId}
          activeTab={params.activeTab}
          showEditor={showEditor}
          editorVisible={editorVisible} />
        <BottomNavigation
          activeTab={params.activeTab}
          labelColor="white"
          rippleColor="white"
          style={{ height: 56, elevation: 8, position: 'absolute', left: 0, bottom: 0, right: 0 }}
          onTabChange={(newTabIndex) => {
            if (newTabIndex === 0) {
              this.props.navigation.setParams({activeTab: TripContentMainView.Tabs.Members});
            } else if (newTabIndex === 1) {
              this.props.navigation.setParams({activeTab: TripContentMainView.Tabs.Expenses});
            } else {
              this.props.navigation.setParams({activeTab: TripContentMainView.Tabs.Summary});
            }
          }}
        >
          <Tab
            label="成員"
            barBackgroundColor="#37474F"
          />
          <Tab
            label="消費記錄"
            barBackgroundColor="#37474F"
          />
          <Tab
            label="結算"
            barBackgroundColor="#37474F"
          />
        </BottomNavigation>
      </View>
    );
  }

  //--------------------------------------------------------------------
  // Helper methods.
  //--------------------------------------------------------------------
  resetState() {
    this.state = {};
  }
}

class TripContentMainView extends Component {
  // The value is the tab index.
  static Tabs = {
    Members: 0,
    Expenses: 1,
    Summary: 2,
  };

  render() {
    if (this.props.activeTab === TripContentMainView.Tabs.Members) {
      return (
        <MembersView
          store={this.props.store}
          navigation={this.props.navigation}
          tripId={this.props.tripId}
          showEditor={this.props.showEditor}
          editorVisible={this.props.editorVisible} />
      );
    } else if (this.props.activeTab === TripContentMainView.Tabs.Expenses) {
      return (
        <ExpensesView
          store={this.props.store}
          navigation={this.props.navigation}
          tripId={this.props.tripId}
          showEditor={this.props.showEditor}
          editorVisible={this.props.editorVisible} />
      );
    } else {
      return (
        <SummaryView
          store={this.props.store}
          tripId={this.props.tripId} />
      );
    }
  }
}

class MembersView extends Component {
  constructor() {
    super();
    this.state = this.getInitialState();
  }

  render() {
    return (
      <View style={{flex: 1, backgroundColor: '#f5fcff'}}>
        <ModalWrapper
          style={{ width: 280, height: 340, paddingLeft: 24, paddingRight: 24 }}
          visible={this.props.editorVisible}>
          <TextField
            name={'名稱'}
            autoFocus={true}
            placeholder={'阿土伯'}
            defaultValue={this.state.name}
            updater={(name) => this.setState({name})}/>
          <TextField
            name={'付費比例 (人數)'}
            autoFocus={false}
            placeholder={''}
            defaultValue={this.state.ratio.toString()}
            updater={(ratio) => this.setState({ratio})}/>
          <View style={{flexDirection: 'row', justifyContent: 'space-around', paddingTop: 50}}>
            <Button title="確認" onPress={this.onFinishEditMember} />
            <Button title="取消" onPress={this.onCancelEditMember} />
          </View>
        </ModalWrapper>
        <ModalWrapper
          containerStyle={{ flexDirection: 'row', alignItems: 'flex-end' }}
          visible={this.state.deleteMemberId > 0}>
          <TouchableOpacity style={{}}
            onPress={() => { this.onConfirmDeleteMember() }}>
            <Text style={[styles.bottomMenuItem, {backgroundColor: '#f55'}]}>刪除</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{}}
            onPress={this.onCancelDeleteMember}>
            <Text style={styles.bottomMenuItem}>取消</Text>
          </TouchableOpacity>
        </ModalWrapper>

        <FlatList
          style={{flex: 1}}
          data={this.props.store.getMembers(this.props.tripId)}
          renderItem={
            ({item}) =>
              <TouchableOpacity style={{flex: 1, flexDirection: 'row', borderBottomWidth: 1, borderColor: '#ccc'}}
                onPress={() => this.onClickMember(item.id, item.name, item.ratio)}>
                <Text style={[styles.tableData, {flex: 1}]}>{item.name + '(' + item.ratio + ')'}</Text>
                <View style={{margin: 8}}>
                  <Button title="刪除" onPress={() => {this.onDeleteMember(item.id)}} />
                </View>
              </TouchableOpacity>
          }
        />
      </View>
    );
  }

  //--------------------------------------------------------------------
  // Helper methods.
  //--------------------------------------------------------------------
  getInitialState() {
    return { memberId: -1, name: '', ratio: 1, deleteMemberId: 0, }
  }
  resetState() {
    this.setState(() => { return this.getInitialState(); });
  }

  onClickMember = (memberId, name, ratio) => {
    this.setState(() => {
      return {
        memberId, name, ratio, deleteMemberId: 0,
      }
    });
    this.props.showEditor(true);
  }

  onFinishEditMember = () => {
    var { tripId } = this.props;
    var { memberId, name, ratio } = this.state;
    ratio = parseInt(ratio);
    if (name.length > 0 && !isNaN(ratio) && ratio > 0) {
      if (memberId !== undefined && memberId > 0) {
        this.props.store.updateMember(tripId, memberId, name, ratio);
      } else {
        this.props.store.addMember(tripId, name, ratio);
      }
    }
    this.resetState();
    this.props.showEditor(false);
  }

  onCancelEditMember = () => {
    this.resetState();
    this.props.showEditor(false);
  }

  onDeleteMember = (memberId) => {
    this.setState((previous) => {
      previous.deleteMemberId = memberId;
      return previous;
    });
  }

  onConfirmDeleteMember = () => {
    this.props.store.deleteMember(this.props.tripId, this.state.deleteMemberId);
    this.resetState();
  }

  onCancelDeleteMember = () => {
    this.resetState();
  }
}

class ExpensesView extends Component {
  constructor() {
    super();
    this.state = this.getInitialState();
  }

  render() {
    return (
      <View style={{flex: 1, backgroundColor: '#f5fcff'}}>
        <FlatList
          style={{flex: 1}}
          data={this.props.store.getExpenses(this.props.tripId)}
          extraData={this.state.dataUpdateDetector}
          ListHeaderComponent={
            () =>
            <View style={{flexDirection: 'row'}}>
              <Text style={[styles.tableData, styles.tableHeader, {flex: 1}]}>消費名稱</Text>
              <Text style={[styles.tableData, styles.tableHeader, {flex: 1}]}>金額</Text>
              <Text style={[styles.tableData, styles.tableHeader, {flex: 1}]}>拆帳成員</Text>
            </View>
          }
          renderItem={
            ({item}) =>
              <TouchableOpacity style={{flex: 1, flexDirection: 'row', borderBottomWidth: 1, borderColor: '#ccc'}}
                onPress={() => this.onClickExpense(item.id, item.name, item.cost, item.details)}>
                <Text style={[styles.tableData, {flex: 1}]}>{item.name}</Text>
                <Text style={[styles.tableData, {flex: 1}]}>{item.cost}</Text>
                <Text style={[styles.tableData, {flex: 1}]}>{item.members.join(', ')}</Text>
              </TouchableOpacity>
          }
        />
      </View>
    );
  }

  //--------------------------------------------------------------------
  // Helper methods.
  //--------------------------------------------------------------------

  getInitialState() {
    return {
      dataUpdateDetector: {},
    }
  }
  resetState() {
    this.setState(() => getInitialState());
  }

  onClickExpense(expenseId, name, cost, details) {
    // Format of details:
    // {
    //   memberId: { paid: 0, shouldPay: 0 },
    //     ...
    //   }
    // }
    var expenseDetails = [];
    console.log('onClickExpense', details);
    for (var memberId in details) {
      var r = details[memberId];
      memberId = parseInt(memberId);
      console.log('onClickExpense', memberId, r);
      expenseDetails.push({
        key: memberId,
        memberId,
        name: this.props.store.getMemberName(this.props.tripId, memberId),
        paid: r.paid,
        shouldPay: r.shouldPay,
      });
    }
    expenseDetails.sort(function(a, b) {
      if (a.name < b.name)
        return -1;
      if (a.name > b.name)
        return 1;
      return 0;
    });

    console.log('onClickExpense', expenseDetails);

    this.props.navigation.navigate('ExpenseDetail', {
      store: this.props.store,
      tripId: this.props.tripId,
      title: `${name} ($${cost})`,
      expenseId,
      expenseDetails,
      deleteExpenseButtonVisible: true,
      dataUpdater: () => { this.setState({dataUpdateDetector: {}}) }
    });
  }
}


// TODO
class AddExpenseStep1Screen extends Component {
}

// TODO
class AddExpenseStep2Screen extends Component {
}

class ExpenseDetailScreen extends Component {
  static navigationOptions = ({ navigation }) => {
    const { setParams } = navigation;
    const { params } = navigation.state;
    if (params.deleteExpenseButtonVisible) {
      return {
        title: params.title,
        headerRight: (
          <View style={{width: 100, flexDirection: 'row', justifyContent: 'space-around'}}>
            <Button title='刪除' onPress={() => {
              params.store.deleteExpense(params.tripId, params.expenseId);
              params.dataUpdater();
              navigation.goBack();
            }} />
            <Button title='完成' onPress={() => {
              // TODO
              params.dataUpdater();
              navigation.goBack();
            }}/>
          </View>
        ),
      };
    } else {
      return {
        title: params.title,
        headerRight: (
          <Button title='完成' onPress={() => {
            // TODO
            params.dataUpdater();
            navigation.goBack();
          }}/>
        ),
      };
    }
  };

  render() {
    const { params } = this.props.navigation.state;

    return (
      <View style={{flex: 1, backgroundColor: '#f5fcff'}}>
        <FlatList
          style={{flex: 1}}
          data={params.expenseDetails}
          ListHeaderComponent={
            () =>
            <View style={{flexDirection: 'row'}}>
              <Text style={[styles.tableData, styles.tableHeader, {flex: 1}]}>成員</Text>
              <Text style={[styles.tableData, styles.tableHeader, {flex: 1}]}>應付</Text>
              <Text style={[styles.tableData, styles.tableHeader, {flex: 1}]}>已付</Text>
              <Text style={[styles.tableData, styles.tableHeader, {flex: 1}]}>差額</Text>
            </View>
          }
          renderItem={
            ({item}) =>
              <TouchableOpacity style={{flex: 1, flexDirection: 'row', borderBottomWidth: 1, borderColor: '#ccc'}}
                onPress={() => this.onClickExpenseDetail(params.tripId, item.expenseId, item.name, item.shouldPay, item.paid,)}>
                <Text style={[styles.tableData, {flex: 1}]}>{item.name}</Text>
                <Text style={[styles.tableData, {flex: 1}]}>{item.shouldPay}</Text>
                <Text style={[styles.tableData, {flex: 1}]}>{item.paid}</Text>
                <Text style={[styles.tableData, {flex: 1}]}>{item.shouldPay - item.paid}</Text>
              </TouchableOpacity>
          }
        />
      </View>
    );
  }

  //--------------------------------------------------------------------
  // Helper methods.
  //--------------------------------------------------------------------

  onClickExpenseDetail(tripId, expenseId, name, shouldPay, paid) {
    // TODO
  }
}

class SummaryView extends Component {
  render() {
    return (
      <View style={{flex: 1, backgroundColor: '#f5fcff'}}>
        <FlatList
          style={{flex: 1}}
          data={this.props.store.getSummary(this.props.tripId)}
          ListHeaderComponent={
            () =>
            <View style={{flexDirection: 'row'}}>
              <Text style={[styles.tableData, styles.tableHeader, {flex: 1}]}>成員</Text>
              <Text style={[styles.tableData, styles.tableHeader, {flex: 1}]}>應付</Text>
              <Text style={[styles.tableData, styles.tableHeader, {flex: 1}]}>已付</Text>
              <Text style={[styles.tableData, styles.tableHeader, {flex: 1}]}>差額</Text>
            </View>
          }
          renderItem={
            ({item}) =>
              <TouchableOpacity style={{flex: 1, flexDirection: 'row', borderBottomWidth: 1, borderColor: '#ccc'}}>
                <Text style={[styles.tableData, {flex: 1}]}>{item.name}</Text>
                <Text style={[styles.tableData, {flex: 1}]}>{item.shouldPay}</Text>
                <Text style={[styles.tableData, {flex: 1}]}>{item.paid}</Text>
                <Text style={[styles.tableData, {flex: 1}]}>{item.paid - item.shouldPay}</Text>
              </TouchableOpacity>
          }
        />
      </View>
    );
  }
}

//---------------------------------------------------------------------
// Helper components
//---------------------------------------------------------------------
class TextField extends Component {
  render() {
    const { name, autoFocus, placeholder, defaultValue, updater } = this.props;

    return (
      <View style={{flexDirection: 'row'}}>
        <Text style={{width: 100, textAlignVertical: 'center'}}>{name}</Text>
        <TextInput
          style={{width: 100}}
          autoFocus={autoFocus}
          placeholder={placeholder}
          defaultValue={defaultValue}
          onChangeText={updater} />
      </View>
    );
  }
}


//---------------------------------------------------------------------
// Styles
//---------------------------------------------------------------------
const styles = StyleSheet.create({
  tableHeader: {
    color: '#ccc',
    backgroundColor: '#333',
    fontWeight: 'bold',
    paddingTop: 6,
    paddingBottom: 6,
  },
  tableData: {
    fontSize: 18,
    textAlign: 'left',
    textAlignVertical: 'center',
    paddingLeft: 10,
  },
  bottomMenuItem: {
    fontSize: 28,
    textAlign: 'center',
    textAlignVertical: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderColor: '#ccc',
    // Use the max value to fix the orientation issue.
    width: Math.max(Dimensions.get('window').width, Dimensions.get('window').height),
  },
});

const GoGoDutch = StackNavigator({
  Home: { screen: TripListScreen, },
  Trip: { screen: TripContentScreen, },
  AddExpenseStep1: { screen: AddExpenseStep1Screen, },
  AddExpenseStep2: { screen: AddExpenseStep2Screen, },
  ExpenseDetail: { screen: ExpenseDetailScreen, },
});

AppRegistry.registerComponent('go_go_dutch', () => GoGoDutch);
