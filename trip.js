'use strict';

import React, { Component } from 'react';
import {
  Button,
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import BottomNavigation, { Tab } from 'react-native-material-bottom-navigation'
import ModalWrapper from 'react-native-modal-wrapper';

import DummyStore from './store';
import styles from './styles';
import MembersView from './member';
import ExpensesView, { AddExpenseStep1Screen, AddExpenseStep2Screen, ExpenseDetailScreen } from './expense';
import SummaryView from './summary';


let gStore = new DummyStore();

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


export { TripListScreen, TripContentScreen };
