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

import ModalWrapper from 'react-native-modal-wrapper';

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
        title: `${params.name} ($${params.cost})`,
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
        title: params.title,
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
              updater={(shouldPay) => this.setState({shouldPay})}/>
            <TextField
              name={'已付'}
              defaultValue={this.state.paid.toString()}
              keyboardType={'numeric'}
              updater={(paid) => this.setState({paid})}/>
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
          e.shouldPay = parseInt(this.state.shouldPay);
          e.paid = parseInt(this.state.paid);
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
    var cost = this.props.navigation.state.params.cost;
    console.log('XXX', cost, totalShouldPay, totalPaid);
    this.setState({warningShouldPayVisible: totalShouldPay !== cost});
    this.setState({warningPaidVisible: totalPaid !== cost});
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
    params.store.updateExpense(params.tripId, params.expenseId, expense);

    // Go back to the last page.
    params.notifyDataUpdated();
    goBack();
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

export { AddExpenseStep1Screen, AddExpenseStep2Screen, ExpenseDetailScreen };
