'use strict';

import React, { Component } from 'react';
import {
  Button,
  FlatList,
  Keyboard,
  Picker,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import ModalWrapper from 'react-native-modal-wrapper';
import SelectMultiple from 'react-native-select-multiple'

import styles from './styles';
import { TextField, DeleteConfirmDialog } from './utils';


export default class ExpensesView extends Component {
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
      name,
      cost,
      expenseId,
      expenseDetails,
      deleteExpenseButtonVisible: true,
      editorVisible: false,
      deleteExpenseId: -1,
      notifyDataUpdated: () => { this.setState({dataUpdateDetector: {}}) }
    });
  }
}


class AddExpenseScreen extends Component {
  static navigationOptions = ({ navigation }) => {
    const {state, setParams, navigate} = navigation;
      return {
        title: state.params.title,
        headerRight: (
          <Button title='下一步' onPress={() => { state.params.onNext(); }}/>
        ),
      };
  };

  constructor() {
    super();

    this.state = { name: '', cost: 0, payer: -1 };
  }

  componentWillMount() {
    const { setParams } = this.props.navigation;
    const { params } = this.props.navigation.state;
    setParams({onNext: this.onNext});
  }

  render() {
    const { navigation } = this.props;
    const { params } = navigation.state;

    let pickerMembers = params.store.getMembers(params.tripId).map( (m) => {
      return <Picker.Item key={m.id} label={m.name} value={m.id} />
    });

    const members = params.store.getMembers(params.tripId).map( (m) => {
      return { label: m.name, value: m.id };
    });
    members.sort();

    return (
      <ScrollView style={{flex: 1, backgroundColor: '#f5fcff', paddingTop: 20, paddingLeft: 20,}}>
        <Text style={{fontSize: 30, paddingBottom: 10}}>輸入消費資訊：</Text>
        <View style={{paddingLeft: 10}}>
          <TextField
            name={'名稱'}
            autoFocus={true}
            defaultValue={this.state.name.toString()}
            updater={(name) => this.setState({name})}/>
          <TextField
            name={'金額'}
            defaultValue={this.state.cost.toString()}
            keyboardType={'numeric'}
            updater={(cost) => this.setState({cost: parseFloat(cost)})}/>
          <View style={{flex: 1, flexDirection: 'row'}}>
            <Text style={[styles.contentText, {width: 100, height: 50, paddingTop: 15}]}>付費者</Text>
            <Picker
              style={{flex: 1}}
              selectedValue={this.state.payer}
              onValueChange={(value, index) => this.setState({payer: value})}>
              <Picker.Item key={-1} label={'(多人付帳)'} value={-1} />
              {pickerMembers}
            </Picker>
          </View>
          <View style={{}}>
            <Text style={styles.contentText}>拆帳成員</Text>
            <SelectMultiple
              style={{height: 300}}
              labelStyle={styles.contentText}
              rowStyle={{width: 300, backgroundColor: '#f5fcff'}}
              checkboxStyle={{width: 16, height: 16}}
              items={members}
              selectedItems={this.state.selectedMembers}
              onSelectionsChange={(selectedMembers) => this.setState({selectedMembers})} />
          </View>
        </View>
      </ScrollView>
    );
  }

  onNext = () => {
    const { params } = this.props.navigation.state;
    const { navigate } = this.props.navigation;

    if (this.state.selectedMembers.length <= 0) {
      alert('請選擇拆帳成員');
      return;
    }

    Keyboard.dismiss();

    // TODO: auto fill
    // this.state.payer: memberId
    // this.state.selectedMembers

    // Prepare the data.
    console.log('XXX', this.state.payer, this.state.selectedMembers);
    let expenseDetails = [];
    let selectedMembers = {};
    for (let i = 0; i < this.state.selectedMembers.length; i++) {
      let m = this.state.selectedMembers[i];
      selectedMembers[m.value] = m.label;
    }
    let allMembers = params.store.getMembers(params.tripId);
    let members = [];
    let payer = {};
    let payerId = this.state.payer;
    for (let i = 0; i < allMembers.length; i++) {
      let m = allMembers[i];
      if (m.id === payerId)
        payer = m;
      if (m.id in selectedMembers)
        members.push(m);
    }

    let payerInMembers = false;
    for (let i = 0; i < members.length; i++) {
      if (members[i].id === payerId) {
        payerInMembers = true;
        break;
      }
    }
    if (!payerInMembers) {
      payer.ratio = 0;
      members.push(payer);
    }

    let ratioTotal = 0;
    for (let i = 0; i < members.length; i++) {
      ratioTotal += members[i].ratio;
    }

    console.log('XXX 2', members, ratioTotal);
    // Fill the data.
    let cost = this.state.cost;
    for (let i = 0; i < members.length; i++) {
      let m = members[i];
      let memberId = m.id;
      expenseDetails.push({
        key: memberId,
        memberId,
        name: m.name,
        paid: memberId === payerId ? cost : 0,
        shouldPay: cost * m.ratio / ratioTotal,
      });
    }

    expenseDetails.sort(function(a, b) {
      if (a.name < b.name)
        return -1;
      if (a.name > b.name)
        return 1;
      return 0;
    });

    console.log('WTF', this.state.name, this.state.cost);
    navigate('ExpenseDetail', {
      store: params.store,
      tripId: params.tripId,
      name: this.state.name,
      cost: this.state.cost,
      expenseId: -1,
      expenseDetails,
      deleteExpenseButtonVisible: false,
      editorVisible: false,
      deleteExpenseId: -1,
      notifyDataUpdated: () => {
        // TODO
      },
    });
  }
}


class ExpenseDetailScreen extends Component {
  static navigationOptions = ({ navigation }) => {
    const { setParams } = navigation;
    const { params } = navigation.state;
    const title = `${params.name} ($${params.cost})`;
    if (params.deleteExpenseButtonVisible) {
      return {
        title: title,
        headerRight: (
          <View style={{width: 100, flexDirection: 'row', justifyContent: 'space-around'}}>
            <Button title='刪除' onPress={() => {
              setParams({deleteExpenseId: params.expenseId});
            }} />
            <Button title='完成' onPress={() => {
              if (params.onEditingDone) {
                params.onEditingDone();
              }
            }}/>
          </View>
        ),
      };
    } else {
      return {
        title: title,
        headerRight: (
          <Button title='完成' onPress={() => {
            if (params.onEditingDone) {
              params.onEditingDone();
            }
          }}/>
        ),
      };
    }
  };

  constructor() {
    super();

    this.state = this.getInitialState();
  }

  componentWillMount() {
    const { setParams } = this.props.navigation;
    const { params } = this.props.navigation.state;
    setParams({onEditingDone: this.onEditingDone});
    this.setState({expenseDetails: params.expenseDetails});
  }

  componentDidMount() {
    this.checkNumbers();
  }

  render() {
    const { params } = this.props.navigation.state;

    return (
      <View style={{flex: 1, backgroundColor: '#f5fcff'}}>
        <ModalWrapper
          style={{ width: 280, height: 340, paddingLeft: 24, paddingRight: 24 }}
          visible={params.editorVisible}>
          <Text style={{fontSize: 24, paddingBottom: 24}}>{this.state.name}</Text>
          <View style={{}}>
            <TextField
              name={'應付'}
              autoFocus={true}
              defaultValue={this.state.shouldPay.toString()}
              keyboardType={'numeric'}
              updater={(shouldPay) => this.setState({shouldPay: parseFloat(shouldPay)})}/>
            <TextField
              name={'已付'}
              defaultValue={this.state.paid.toString()}
              keyboardType={'numeric'}
              updater={(paid) => this.setState({paid: parseFloat(paid)})}/>
          </View>
          <View style={{flexDirection: 'row', justifyContent: 'space-around', paddingTop: 50}}>
            <Button title="確認" onPress={() => this.onEditingMemberExpenseDone(true)} />
            <Button title="取消" onPress={() => this.onEditingMemberExpenseDone(false)} />
          </View>
        </ModalWrapper>
        <DeleteConfirmDialog
          visible={params.deleteExpenseId > 0}
          onRespond={this.onRespondDeleteExpense} />

        <View style={{paddingLeft: 10, paddingTop: 15, paddingBottom: 15}}>
          <Text style={{paddingBottom: 10, fontSize: 30, fontWeight: 'bold', color: '#77c'}}>消費明細</Text>
          <Text style={{fontSize: 12, color: '#777'}}>＊可點擊單列編輯金額</Text>
          <WarningMessage
            shouldPayVisible={this.state.warningShouldPayVisible}
            paidVisible={this.state.warningPaidVisible} />
        </View>
        <FlatList
          style={{flex: 1}}
          data={this.state.expenseDetails}
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
                onPress={() => this.onClickExpenseMember(item.memberId, item.name, item.shouldPay, item.paid)}>
                <Text style={[styles.tableData, {flex: 1}]}>{item.name}</Text>
                <Text style={[styles.tableData, {flex: 1}]}>{Number(item.shouldPay).toFixed(1)}</Text>
                <Text style={[styles.tableData, {flex: 1}]}>{Number(item.paid).toFixed(1)}</Text>
                <Text style={[styles.tableData, {flex: 1}]}>{Number(item.shouldPay - item.paid).toFixed(1)}</Text>
              </TouchableOpacity>
          }
        />
      </View>
    );
  }

  //--------------------------------------------------------------------
  // Helper methods.
  //--------------------------------------------------------------------

  getInitialState = () => {
    var expenseDetails = this.props && this.props.navigation && this.props.navigation.state.params
        ? this.props.navigation.state.params.expenseDetails : [];
    return {
      warningPaidVisible: false,
      warningShouldPayVisible: false,
      expenseDetails,
      // Editing data.
      memberId: -1,
      name: '',
      shouldPay: 0,
      paid: 0
    }
  };

  resetState = () => {
    this.setState(this.getInitialState());
  }

  onClickExpenseMember(memberId, name, shouldPay, paid) {
    this.setState({memberId, name, shouldPay, paid});
    this.props.navigation.setParams({editorVisible: true});
  }

  onEditingMemberExpenseDone = (okay) => {
    const { setParams } = this.props.navigation;

    setParams({editorVisible: false});

    // Update numbers.
    if (okay) {
      for (var i = 0; i < this.state.expenseDetails.length; i++) {
        var e = this.state.expenseDetails[i];
        if (e.memberId == this.state.memberId) {
          e.shouldPay = parseFloat(this.state.shouldPay);
          e.paid = parseFloat(this.state.paid);
          break;
        }
      }
    }

    this.checkNumbers();
  }

  checkNumbers = () => {
    // Check whether the input numbers are mismatched.
    var totalPaid = 0;
    var totalShouldPay = 0;
    for (var i = 0; i < this.state.expenseDetails.length; i++) {
      var e = this.state.expenseDetails[i];
      totalPaid += e.paid;
      totalShouldPay += e.shouldPay;
    }
    const epsilon = 1e-5;
    var cost = this.props.navigation.state.params.cost;
    this.setState({warningShouldPayVisible: Math.abs(totalShouldPay - cost) > epsilon});
    this.setState({warningPaidVisible: Math.abs(totalPaid - cost) > epsilon});
  }

  onEditingDone = () => {
    const { setParams, goBack } = this.props.navigation;
    const { params } = this.props.navigation.state;

    // Update to the store.
    var members = {};
    for (var i = 0; i < this.state.expenseDetails.length; i++) {
      var e = this.state.expenseDetails[i];
      members[e.memberId] = { paid: e.paid, shouldPay: e.shouldPay };
    }
    var expense = { name: params.name, cost: params.cost, members };

    if (params.expenseId > 0) {
      // Update existed data.
      params.store.updateExpense(params.tripId, params.expenseId, expense);

      // Go back to the last page.
      params.notifyDataUpdated();
      goBack();
    } else {
      // New data.
      // TODO
    }
  }

  onRespondDeleteExpense = (okay) => {
    const { setParams, goBack } = this.props.navigation;
    const { params } = this.props.navigation.state;

    setParams({deleteExpenseId: -1});
    if (okay) {
      params.store.deleteExpense(params.tripId, params.deleteExpenseId);
      params.notifyDataUpdated();
      goBack();
    }
  }
}


class WarningMessage extends Component
{
  render() {
    if (!this.props.shouldPayVisible && !this.props.paidVisible) {
      return ( <View /> );
    }

    if (this.props.shouldPayVisible && this.props.paidVisible) {
      return (
        <View style={{paddingTop: 12}}>
          <Text style={{fontSize: 12, color: '#f77'}}>應付總和不等於支出金額</Text>
          <Text style={{fontSize: 12, color: '#f77'}}>已付總和不等於支出金額</Text>
        </View>
      );
    }

    if (this.props.shouldPayVisible) {
      return (
        <View style={{paddingTop: 12}}>
          <Text style={{fontSize: 12, color: '#f77'}}>應付總和不等於支出金額</Text>
        </View>
      );
    }

    return (
      <View style={{paddingTop: 12}}>
        <Text style={{fontSize: 12, color: '#f77'}}>已付總和不等於支出金額</Text>
      </View>
    );
  }
}

export { AddExpenseScreen, ExpenseDetailScreen };
