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
import ModalWrapper from 'react-native-modal-wrapper';


//---------------------------------------------------------------------
// Store
//---------------------------------------------------------------------
let g_store = null;

// TODO(fcamel): Rewrite it with real data stored in files.
// For early development.
class DummyStore {
  constructor() {
    // Fill dumy trips.
    this.next_trip_id = 1;
    this.store = {};
    this.store.trips = [];
    for (var i = 0; i <20; i++) {
      if (i % 3 == 0) {
        this.addTrip('Germany 2015/06/11');
      } else if (i % 3 == 1) {
        this.addTrip('Japan 2017/01/07');
      } else {
        this.addTrip('Taipei 2016/01/13');
      }
    }

    // Fill dummy members.
    this.next_member_id = 1;
    this.addMember(this.store.trips[0].id, '王小明', 1);
    this.addMember(this.store.trips[0].id, '工藤新一', 2);
    this.addMember(this.store.trips[0].id, '三眼怪', 3);
  }

  addTrip(name) {
    this.store.trips.push({
      key: this.next_trip_id,
      id: this.next_trip_id,
      title: name,
      members: {},
      expenses: {},
    });
    this.next_trip_id++;
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

  addMember(trip_id, name, ratio) {
    this.updateMember(trip_id, this.next_member_id++, name, ratio);
  }

  updateMember(trip_id, member_id, name, ratio) {
    var trip = this.store.trips[trip_id];
    trip.members[member_id] = { name, ratio };
  }

  deleteMember(trip_id, member_id) {
    var trip = this.store.trips[trip_id];
    delete trip.members[member_id];
  }

  getMembers(trip_id) {
    console.log('getMembers trip_id=' + trip_id, this.store.trips[trip_id].members);
    var members = [];
    for (var key in this.store.trips[trip_id].members) {
      var m = this.store.trips[trip_id].members[key];
      members.push({
        key: key,
        id: key,
        name: m['name'],
        ratio: m['ratio']
      });
    }
    return members;
  }
}

g_store = new DummyStore();

//---------------------------------------------------------------------
// Main components
//---------------------------------------------------------------------
class TripListScreen extends Component {
  static navigationOptions = ({ navigation }) => {
    const {state, setParams} = navigation;
    return {
      title: '記帳本',
      headerRight: (
        <Button title='新增帳本' onPress={() => setParams({newTripVisible: true})} />
      ),
    };
  };

  constructor() {
    super();
    this.store = g_store;
    this.state = {text: ''};
  }

  render() {
    // NOTE: params is undefined in the first call.
    const params = this.props.navigation.state.params ? this.props.navigation.state.params : {};
    const { navigate } = this.props.navigation;

    // DEBUG
    console.log('render: state=', this.props.navigation.state, params);

    return (
      <View style={{flex: 1, backgroundColor: '#f5fcff'}}>
        <ModalWrapper
          style={{ width: 280, height: 180, paddingLeft: 24, paddingRight: 24 }}
          visible={!!params.newTripVisible}>
          <Text>出遊名稱</Text>
          <TextInput
            autoFocus={true}
            placeholder='阿里山 2017/01'
            onChangeText={(text) => this.setState({text})}/>
          <View style={{flexDirection: 'row', justifyContent: 'space-around'}}>
            <Button title="確認" onPress={this.onSubmitNewTrip} />
            <Button title="取消" onPress={this.onCancelNewTrip} />
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
                onPress={() => this.onClickTrip(item.title, item.id)}>
                <Text style={[styles.tableData, {flex: 1}]}>{item.title}</Text>
                <View style={{margin: 8}}>
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
  onSubmitNewTrip = () => {
    var text = this.state.text;
    console.log('onSubmitNewTrip', text);
    if (text.length > 0) {
      this.store.addTrip(text);
    }
    this.props.navigation.setParams({newTripVisible: false})
  }

  onCancelNewTrip = () => {
    console.log('onCancelNewTrip');
    this.props.navigation.setParams({newTripVisible: false})
  }

  onDeleteTrip = (id) => {
    console.log('onDeleteTrip id=', id);
    this.props.navigation.setParams({deleteTripId: id})
  }

  onConfirmDeleteTrip = (id) => {
    console.log('onConfirmDeleteTrip', id);
    this.store.deleteTrip(id);
    this.props.navigation.setParams({deleteTripId: 0})
  }

  onCancelDeleteTrip = () => {
    this.props.navigation.setParams({deleteTripId: 0})
  }

  onClickTrip = (title, id) => {
    // TODO(fcamel): navigate to ExpenseListScreen if there is any member.
    this.props.navigation.navigate('Members', {title: title, trip_id: id})
  }
}

class MemberListScreen extends Component {
  static navigationOptions = ({ navigation }) => {
    const {state, setParams} = navigation;
    return {
      title: state.params.title,
      headerRight: (
        <Button title='新增成員' onPress={() => {
          setParams({editMemberVisible: true});
        }}/>
      ),
    };
  };

  constructor() {
    super();
    this.store = g_store;
    this.resetState();
  }

  render() {
    const { params } = this.props.navigation.state;

    // DEBUG
    console.log('MemberListScreen.render: state=', this.props.navigation.state, 'params=', params);

    return (
      <View style={{flex: 1, backgroundColor: '#f5fcff'}}>
        <ModalWrapper
          style={{ width: 280, height: 340, paddingLeft: 24, paddingRight: 24 }}
          visible={!!params.editMemberVisible}>
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
          visible={!!params.deleteMemberVisible}>
          <TouchableOpacity style={{}}
            onPress={() => { this.onConfirmDeleteMember(params.trip_id, this.state.deleteMemberId) }}>
            <Text style={[styles.bottomMenuItem, {backgroundColor: '#f55'}]}>刪除</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{}}
            onPress={this.onCancelDeleteMember}>
            <Text style={styles.bottomMenuItem}>取消</Text>
          </TouchableOpacity>
        </ModalWrapper>

        <FlatList
          style={{flex: 1}}
          data={this.store.getMembers(params.trip_id)}
          renderItem={
            ({item}) =>
              <TouchableOpacity style={{flex: 1, flexDirection: 'row', borderBottomWidth: 1, borderColor: '#ccc'}}
                onPress={() => this.onClickMember(item.id, item.name, item.ratio)}>
                <Text style={[styles.tableData, {flex: 1}]}>{item.name + '(' + item.ratio + ')'}</Text>
                <View style={{margin: 8}}>
                  <Button title="刪除" onPress={() => {this.onDeleteMember(params.trip_id, item.id)}} />
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
  resetState() {
    this.state = {
      name: '',
      ratio: 1,
      deleteMemberId: 0,
    };
  }

  onClickMember = (member_id, name, ratio) => {
    this.state = {member_id, name, ratio};
    this.props.navigation.setParams({editMemberVisible: true});
  }

  onFinishEditMember = () => {
    console.log('onFiinishEdiMember', this.props.navigation.state, this.state);
    var { trip_id } = this.props.navigation.state.params;
    var { member_id, name, ratio } = this.state;
    ratio = parseInt(ratio);
    if (name.length > 0 && !isNaN(ratio) && ratio > 0) {
      if (member_id !== undefined && member_id > 0) {
        this.store.updateMember(trip_id, member_id, name, ratio);
      } else {
        this.store.addMember(trip_id, name, ratio);
      }
    }
    this.resetState();
    this.props.navigation.setParams({editMemberVisible: false});
  }

  onCancelEditMember = () => {
    this.resetState();
    this.props.navigation.setParams({editMemberVisible: false});
  }

  onDeleteMember = (trip_id, member_id) => {
    console.log(`onDeleteMember trip_id=${trip_id} member_id=${member_id}`);
    this.props.navigation.setParams({deleteMemberVisible: true});
    this.state = {trip_id: trip_id, deleteMemberId: member_id, ratio: this.state.ratio};
  }

  onConfirmDeleteMember = (trip_id, member_id) => {
    console.log(`onConfirmDeleteMember trip_id=${trip_id} member_id=${member_id}`);
    this.store.deleteMember(trip_id, member_id);
    this.resetState();
    this.props.navigation.setParams({deleteMemberVisible: false});
  }

  onCancelDeleteMember = () => {
    this.resetState();
    this.props.navigation.setParams({deleteMemberVisible: false});
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
  Members: { screen: MemberListScreen, },
});

AppRegistry.registerComponent('go_go_dutch', () => GoGoDutch);
