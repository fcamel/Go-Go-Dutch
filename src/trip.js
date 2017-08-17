'use strict';

import React, { Component } from 'react';
import {
  Dimensions,
  FlatList,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  TouchableHighlight
} from 'react-native';

import BottomNavigation, { Tab } from 'react-native-material-bottom-navigation';
import IconMI from 'react-native-vector-icons/MaterialIcons';
import IconMII from 'react-native-vector-icons/MaterialCommunityIcons';
import MailCompose from 'react-native-mail-compose';
import ModalWrapper from 'react-native-modal-wrapper';
import SelectMultiple from 'react-native-select-multiple';
import Swiper from 'react-native-swiper';

import FileStore from './store';
import styles, { colors, navigationConsts } from './styles';
import MembersView from './member';
import ExpensesView from './expense';
import SummaryView from './summary';
import { MyButton, DeleteButton, DeleteConfirmDialog } from './utils';

let gStore = new FileStore();

class TripListScreen extends Component {
  static navigationOptions = ({ navigation }) => {
    const { setParams } = navigation;
    return {
      title: '記帳本',
      headerTitleStyle: styles.navigationHeaderTitle,
      headerStyle: styles.navigationHeader,
      headerRight: (
        <TouchableHighlight
          underlayColor="#008bcc"
          onPress={() =>
            setParams({
              editTripVisible: true,
              newTrip: true
            })}
          style={[styles.iconBtn, styles.navIconBtn]}
        >
          <IconMI name="add" size={30} color="#fff" />
        </TouchableHighlight>
      )
    };
  };

  constructor() {
    super();
    this.state = { id: -1, name: '', dataUpdateDetector: {}, selectedMembers: [] };
    this.store = gStore;
    this.store.init(() => {
      console.log('INFO: store is ready', this.store.isReady());
      this.setState({ dataUpdateDetector: {} });
    });
  }

  render() {
    // NOTE: params is undefined in the first call.
    const params = this.props.navigation.state.params ? this.props.navigation.state.params : {};

    let members = [];
    if (this.store.isReady()) {
      members = this.store.getAllMembers().map((m, i) => {
        return { label: `${m.name} (${m.ratio})`, value: i };
      });
    }

    let modalStyle = {};
    if (params.newTrip) {
      modalStyle = { width: 280, height: 380, paddingLeft: 18, paddingRight: 18, paddingTop: 28 };
    } else {
      modalStyle = { width: 280, height: 180, paddingLeft: 18, paddingRight: 18 };
    }

    return (
      <View style={styles.baseView}>
        <ModalWrapper style={modalStyle} visible={!!params.editTripVisible}>
          <Text>帳本名稱</Text>
          <TextInput
            autoFocus={true}
            defaultValue={this.state.name}
            placeholder="阿里山 2017/01"
            placeholderTextColor="#bcbcbc"
            onChangeText={name => this.setState({ name })}
          />
          {params.newTrip &&
            <View style={{ paddingTop: 18 }}>
              <Text>匯入既有成員</Text>
              <SelectMultiple
                style={{ height: 175, marginTop: 20 }}
                labelStyle={styles.contentText}
                rowStyle={[styles.baseView, { width: 250 }]}
                checkboxStyle={{ width: 16, height: 16 }}
                items={members}
                selectedItems={this.state.selectedMembers}
                onSelectionsChange={selectedMembers => this.setState({ selectedMembers })}
              />
            </View>}
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 6 }}>
            <MyButton title="取消" onPress={() => this.onFinishEditTrip(false)} />
            <MyButton title="建立" onPress={() => this.onFinishEditTrip(true)} />
          </View>
        </ModalWrapper>
        <DeleteConfirmDialog
          visible={!!params.deleteTripId}
          deleteButtonMessage="刪除帳本"
          onRespond={this.onRespondDelete}
        />

        <FlatList
          style={{ flex: 1, paddingTop: 3 }}
          data={this.store.isReady() ? this.store.getTrips() : []}
          extraData={this.state.dataUpdateDetector}
          renderItem={({ item }) =>
            <TouchableOpacity
              style={styles.tripListItem}
              onPress={() => this.onClickTrip(item.id, item.name)}
            >
              <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                <IconMI name="book" size={36} color="#007ab5" />
                <Text style={[styles.tableData, { color: '#007ab5', fontWeight: 'bold' }]}>
                  {item.name}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                <TouchableHighlight
                  onPress={() => {
                    this.onEditTrip(item.id, item.name);
                  }}
                  underlayColor="#dfecf2"
                  style={styles.iconBtn}
                >
                  <IconMI name="edit" size={28} color="#9bafb8" />
                </TouchableHighlight>
                <DeleteButton
                  onPress={() => {
                    this.onDeleteTrip(item.id);
                  }}
                />
              </View>
            </TouchableOpacity>}
        />
      </View>
    );
  }

  //--------------------------------------------------------------------
  // Helper methods.
  //--------------------------------------------------------------------
  onEditTrip(id, name) {
    this.setState({ id, name });
    this.props.navigation.setParams({
      editTripVisible: true,
      newTrip: false
    });
  }

  onFinishEditTrip(done) {
    if (!this.store.isReady()) {
      // Retry after 1s.
      setTimeout(() => {
        this.onFinishEditTrip(done);
      }, 1000);
      return;
    }

    if (done) {
      if (this.state.name.length === 0) {
        alert('請輸入名稱');
        return;
      }

      if (this.state.id > 0) {
        this.store.updateTrip(this.state.id, this.state.name);
      } else {
        let tripId = this.store.addTrip(this.state.name);
        let members = this.store.getAllMembers().filter((m, i) => {
          for (let selected of this.state.selectedMembers) {
            if (selected.value == i) return true;
          }
          return false;
        });
        for (let m of members) {
          this.store.addMember(tripId, m.name, m.ratio);
        }
      }
    }

    this.props.navigation.setParams({ editTripVisible: false });
    this.setState({ id: -1, name: '', selectedMembers: [] });
  }

  onDeleteTrip = id => {
    this.props.navigation.setParams({ deleteTripId: id });
  };

  onRespondDelete = okay => {
    let id = this.props.navigation.state.params.deleteTripId;
    this.props.navigation.setParams({ deleteTripId: 0 });
    if (okay) {
      this.store.deleteTrip(id);
    }
  };

  onClickTrip = (id, name) => {
    let members = this.store.getMembers(id);
    let activeTab =
      !members || members.length <= 0
        ? TripContentScreen.Tabs.Members
        : TripContentScreen.Tabs.Expenses;
    this.props.navigation.navigate('Trip', { title: name, tripId: id, activeTab });
  };
}

class TripContentScreen extends Component {
  // The value is the tab index.
  static Tabs = {
    Members: 0,
    Expenses: 1,
    Summary: 2
  };

  static navigationOptions = ({ navigation }) => {
    const { state, setParams, navigate } = navigation;
    const { params } = state;
    let headerRight = {};
    if (params.activeTab === TripContentScreen.Tabs.Members) {
      headerRight = (
        <TouchableHighlight
          underlayColor="#008bcc"
          onPress={() => {
            setParams({ editorVisible: true });
          }}
          style={[styles.iconBtn, styles.navIconBtn]}
        >
          <IconMI name="group-add" size={30} color="#fff" />
        </TouchableHighlight>
      );
    } else if (params.activeTab === TripContentScreen.Tabs.Expenses) {
      headerRight = (
        <TouchableHighlight
          underlayColor="#008bcc"
          onPress={() => {
            navigate('AddExpense', {
              tripId: params.tripId,
              title: params.title,
              store: gStore,
              notifyDataUpdated: params.notifyExpensesUpdated
            });
          }}
          style={[styles.iconBtn, styles.navIconBtn]}
        >
          <IconMI name="playlist-add" size={30} color="#fff" />
        </TouchableHighlight>
      );
    } else {
      headerRight = (
        <TouchableHighlight
          underlayColor="#008bcc"
          onPress={() => {
            params.exportCSV();
          }}
          style={[styles.iconBtn, styles.navIconBtn]}
        >
          <IconMII name="file-export" size={30} color="#fff" />
        </TouchableHighlight>
      );
    }

    return {
      title: params.title,
      headerTitleStyle: styles.navigationHeaderTitle,
      headerStyle: styles.navigationHeader,
      headerTintColor: navigationConsts.tintColor,
      headerRight
    };
  };

  constructor() {
    super();
    this.store = gStore;
    this.state = { notifyExpensesUpdated: {} };
    this.swiper = null;
  }

  componentWillMount() {
    const { setParams } = this.props.navigation;
    setParams({
      notifyExpensesUpdated: this.onExpensesUpdated,
      exportCSV: this.exportCSV
    });
  }

  render() {
    const { params } = this.props.navigation.state;

    // params.editorVisible may be undefined.
    let editorVisible = !!params.editorVisible;
    let showEditor = visible => {
      this.props.navigation.setParams({ editorVisible: visible });
    };
    let activeIconColor = navigationConsts.backgroundColor;
    let barBackgroundColor = colors.base;

    // NOTE:
    // 1. BottomNavigation doesn't occupy the space.
    // 2. Swiper uses fixed width/height to make it fullscreen. Need override the height manually.
    return (
      <View style={styles.baseView}>
        <Swiper
          height={Dimensions.get('window').height - navigationConsts.height - 80}
          loop={false}
          showsPagination={false}
          index={params.activeTab}
          ref={swiper => {
            this.swiper = swiper;
          }}
          onMomentumScrollEnd={this.onSwiperDidUpdateIndex}
          onWillUpdateIndex={this.onSwiperWillUpdateIndex}
        >
          <MembersView
            store={this.store}
            navigation={this.props.navigation}
            tripId={params.tripId}
            showEditor={showEditor}
            editorVisible={editorVisible}
          />
          <ExpensesView
            store={this.store}
            navigation={this.props.navigation}
            tripId={params.tripId}
            showEditor={showEditor}
            editorVisible={editorVisible}
            setNotifyExpensesUpdated={this.setNotifyExpensesUpdated}
          />
          <SummaryView store={this.store} tripId={params.tripId} />
        </Swiper>
        <View style={{ flex: 1, backgroundColor: 'black' }} />
        <BottomNavigation
          activeTab={params.activeTab}
          labelColor="black"
          activeLabelColor="#007ab5"
          rippleColor="black"
          style={{ height: 56, elevation: 8, position: 'absolute', left: 0, bottom: 0, right: 0 }}
          onTabChange={newTabIndex => {
            this.onTabChange(newTabIndex);
          }}
        >
          <Tab
            label="成員"
            icon={<IconMI name="people" size={20} />}
            activeIcon={<IconMI name="people" size={20} color={activeIconColor} />}
            barBackgroundColor={barBackgroundColor}
          />
          <Tab
            label="消費記錄"
            icon={<IconMI name="monetization-on" size={20} />}
            activeIcon={<IconMI name="monetization-on" size={20} color={activeIconColor} />}
            barBackgroundColor={barBackgroundColor}
          />
          <Tab
            label="結算"
            icon={<IconMI name="receipt" size={20} />}
            activeIcon={<IconMI name="receipt" size={20} color={activeIconColor} />}
            barBackgroundColor={barBackgroundColor}
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

  onTabChange = index => {
    const { params } = this.props.navigation.state;

    if (index != params.activeTab) {
      if (Platform.OS === 'android') {
        // Show the scroll animation, too.
        // This makes a bug on iOS, so don't do it on iOS.
        this.swiper.scrollTo(index, true);
      }
      this.props.navigation.setParams({ activeTab: index });
    }
  };

  onSwiperDidUpdateIndex = (e, state, context) => {
    // NOTE: updating the active tab here is a little slow compared to
    // do this in onSwiperWillUpdateIndex.
  };

  onSwiperWillUpdateIndex = newIndex => {
    this.props.navigation.setParams({ activeTab: newIndex });
  };

  setNotifyExpensesUpdated = func => {
    this.state.notifyExpensesUpdated = func;
  };

  exportCSV = () => {
    this.sendMail();
  };

  async sendMail() {
    try {
      const { params } = this.props.navigation.state;
      let content = this.store.exportFullAsCSV(params.tripId);
      await MailCompose.send({
        subject: params.title + '結算',
        html: '請用 Google Spreadsheet / Excel 開啟附件',
        attachments: [
          {
            filename: 'summary',
            ext: '.csv',
            mimeType: 'text/csv',
            text: content
          }
        ]
      });
    } catch (e) {
      alert('Failed to mail: e=' + e);
    }
  }
}

export { TripListScreen, TripContentScreen };
