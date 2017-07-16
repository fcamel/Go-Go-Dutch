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

let s_store = null;

// TODO(fcamel): Rewrite it with real data stored in files.
// For early development.
class DummyStore {
  constructor() {
    if (!s_store) {
      s_store = this;

      this.next_id = 1;
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
    }
    return s_store;
  }

  addTrip(name) {
    this.store.trips.push({id: this.next_id, key: this.next_id, title: name});
    this.next_id++;
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
}

class TripListScreen extends Component {
  static navigationOptions = ({ navigation }) => {
    const {state, setParams} = navigation;
    return {
      title: '記帳本',
      headerRight: (
        <Button
          title='新增帳本'
          onPress={() => setParams({newTripVisible: true})}
        />
      ),
    };
  };

  constructor() {
    super();
    this.store = new DummyStore();
    this.state = {text: ''};
  }

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

  render() {
    // NOTE: params is undefined in the first call.
    const params = this.props.navigation.state.params ? this.props.navigation.state.params : {};

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
              <View style={{flex: 1, flexDirection: 'row', borderBottomWidth: 1, borderColor: '#ccc'}}>
                <Text style={[styles.tripItem, {flex: 1}]}>{item.title}</Text>
                <View style={{margin: 8}}>
                  <Button title="刪除" onPress={() => {this.onDeleteTrip(item.id)}} />
                </View>
              </View>
          }
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  tripItem: {
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
});

AppRegistry.registerComponent('go_go_dutch', () => GoGoDutch);
