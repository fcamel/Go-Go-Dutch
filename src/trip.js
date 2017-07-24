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

import BottomNavigation, { Tab } from 'react-native-material-bottom-navigation';
import ModalWrapper from 'react-native-modal-wrapper';
import Icon from 'react-native-vector-icons/MaterialIcons';

import FileStore from './store';
import styles, { NAVIGATION_BUTTON_COLOR, NAVIGATION_TINT_COLOR, BUTTON_COLOR } from './styles';
import MembersView from './member';
import ExpensesView from './expense';
import SummaryView from './summary';
import { DeleteConfirmDialog } from './utils';


let gStore = new FileStore();

class TripListScreen extends Component {
  static navigationOptions = ({ navigation }) => {
    const {setParams} = navigation;
    return {
      title: '記帳本',
      headerTitleStyle: styles.navigationHeaderTitle,
      headerStyle: styles.navigationHeader,
      headerRight: (
        <Button title='新增帳本' color={NAVIGATION_BUTTON_COLOR} onPress={() => setParams({editTripVisible: true})} />
      ),
    };
  };

  constructor() {
    super();
    this.state = { id: -1, name: '', dataUpdateDetector: {} };
    this.store = gStore;
    this.store.setReadyCallback(() => {
      console.log('XXX store is ready', this.store.isReady());
      this.setState({dataUpdateDetector: {}});
    });
  }

  render() {
    // NOTE: params is undefined in the first call.
    const params = this.props.navigation.state.params ? this.props.navigation.state.params : {};

    return (
      <View style={styles.baseView}>
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
        <DeleteConfirmDialog
          visible={!!params.deleteTripId}
          onRespond={this.onRespondDelete} />

        <FlatList
          style={{flex: 1}}
          data={this.store.isReady() ? this.store.getTrips() : []}
          extraData={this.state.dataUpdateDetector}
          renderItem={
            ({item}) =>
              <TouchableOpacity style={{flex: 1, flexDirection: 'row', borderBottomWidth: 1, borderColor: '#ccc'}}
                onPress={() => this.onClickTrip(item.id, item.name)}>
                <Text style={[styles.tableData, {flex: 1}]}>{item.name}</Text>
                <View style={{margin: 8, flexDirection: 'row', width: 100, justifyContent: 'space-around'}}>
                  <Button title="編輯" color={BUTTON_COLOR} onPress={() => {this.onEditTrip(item.id, item.name);}} />
                  <Button title="刪除" color={BUTTON_COLOR} onPress={() => {this.onDeleteTrip(item.id);}} />
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
    this.props.navigation.setParams({editTripVisible: true});
  }

  onFinishEditTrip(done) {
    if (!this.store.isReady()) {
      // Retry after 1s.
      setTimeout(() => {
        this.onFinishEditTrip(done);
      }, 1000);
      return;
    }

    if (done && this.state.name.length > 0) {
      if (this.state.id > 0) {
        this.store.updateTrip(this.state.id, this.state.name);
      } else {
        this.store.addTrip(this.state.name);
      }
    }

    this.props.navigation.setParams({editTripVisible: false});
    this.setState({id: -1, name: ''});
  }

  onDeleteTrip = (id) => {
    this.props.navigation.setParams({deleteTripId: id});
  }

  onRespondDelete = (okay) => {
    let id = this.props.navigation.state.params.deleteTripId;
    this.props.navigation.setParams({deleteTripId: 0});
    if (okay) {
      this.store.deleteTrip(id);
    }
  }

  onClickTrip = (id, name) => {
    let members = this.store.getMembers(id);
    let activeTab = (!members || members.length <= 0)
      ? TripContentMainView.Tabs.Members
      : TripContentMainView.Tabs.Expenses;
    this.props.navigation.navigate('Trip', {title: name, tripId: id, activeTab});
  }
}

class TripContentScreen extends Component {
  static navigationOptions = ({ navigation }) => {
    const {state, setParams, navigate} = navigation;
    const {params} = state;
    let headerRight = {};
    if (params.activeTab === TripContentMainView.Tabs.Members) {
      headerRight = (
        <Button title='新增成員' color={NAVIGATION_BUTTON_COLOR} onPress={() => {
          setParams({editorVisible: true});
        }}/>
      );
    } else if (params.activeTab === TripContentMainView.Tabs.Expenses) {
      headerRight = (
        <Button title='新增消費' color={NAVIGATION_BUTTON_COLOR} onPress={() => {
          navigate('AddExpense', {
            tripId: params.tripId,
            title: params.title,
            store: gStore,
            notifyDataUpdated: params.notifyExpensesUpdated,
          });
        }}/>
      );
    } else {
      headerRight = (
        <Button title='匯出 CSV' color={NAVIGATION_BUTTON_COLOR} onPress={() => {
          // TODO: export CSV.
        }}/>
      );
    }

    return {
      title: params.title,
      headerTitleStyle: styles.navigationHeaderTitle,
      headerStyle: styles.navigationHeader,
      headerTintColor: NAVIGATION_TINT_COLOR,
      headerRight,
    };
  };

  constructor() {
    super();
    this.store = gStore;
    this.state = { notifyExpensesUpdated: {}};
  }

  componentWillMount() {
    const { setParams } = this.props.navigation;
    setParams({notifyExpensesUpdated: this.onExpensesUpdated});
  }

  render() {
    const { params } = this.props.navigation.state;

    // params.editorVisible may be undefined.
    let editorVisible = !!params.editorVisible;
    let showEditor = (visible) => {
      this.props.navigation.setParams({editorVisible: visible});
    };

    // NOTE: BottomNavigation doesn't occupy the height, so there is an empty View
    // to occupy the same space; otherwise, BottomNavigation will cover the last row of data.
    return (
      <View style={styles.baseView}>
        <TripContentMainView
          store={this.store}
          navigation={this.props.navigation}
          tripId={params.tripId}
          activeTab={params.activeTab}
          showEditor={showEditor}
          setNotifyExpensesUpdated={this.setNotifyExpensesUpdated}
          editorVisible={editorVisible} />
        <View style={{ height: 56 }} />
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
            icon={<Icon name='people' size={20} color='#fff'/>}
            barBackgroundColor="#37474F"
          />
          <Tab
            label="消費記錄"
            icon={<Icon name='monetization-on' size={20} color='#fff'/>}
            barBackgroundColor="#37474F"
          />
          <Tab
            label="結算"
            icon={<Icon name='receipt' size={20} color='#fff'/>}
            barBackgroundColor="#37474F"
          />
        </BottomNavigation>
      </View>
    );
  }

  //--------------------------------------------------------------------
  // Helper methods.
  //--------------------------------------------------------------------
  onExpensesUpdated = () => {
    this.state.notifyExpensesUpdated();
  };

  setNotifyExpensesUpdated = (func) => {
    this.state.notifyExpensesUpdated = func;
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
          editorVisible={this.props.editorVisible}
          setNotifyExpensesUpdated={this.props.setNotifyExpensesUpdated} />
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
