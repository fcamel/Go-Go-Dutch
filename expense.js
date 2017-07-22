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
import { DeleteConfirmDialog } from './utils';


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
      title: `${name} ($${cost})`,
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
        title: params.title,
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

  componentWillMount() {
    const { setParams } = this.props.navigation;
    setParams({onEditingDone: this.onEditingDone});
  }

  render() {
    const { params } = this.props.navigation.state;

    return (
      <View style={{flex: 1, backgroundColor: '#f5fcff'}}>
        <ModalWrapper
          style={{ width: 280, height: 340, paddingLeft: 24, paddingRight: 24 }}
          visible={params.editorVisible}>
        </ModalWrapper>
        <DeleteConfirmDialog
          visible={params.deleteExpenseId > 0}
          onRespond={this.onRespondDeleteExpense} />

        <View style={{paddingLeft: 10, paddingTop: 15, paddingBottom: 15}}>
          <Text style={{paddingBottom: 10, fontSize: 30, fontWeight: 'bold', color: '#77c'}}>消費明細</Text>
          <Text style={{fontSize: 12, color: '#777'}}>＊可點擊單列編輯金額</Text>
        </View>
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
                onPress={() => this.onClickExpenseMember(params.tripId, item.expenseId, item.name, item.shouldPay, item.paid,)}>
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

  onClickExpenseMember(tripId, expenseId, name, shouldPay, paid) {
    // TODO
  }

  onEditingMemberExpenseDone = (okay) => {
    const { setParams, goBack } = this.props.navigation;
    const { params } = this.props.navigation.state;

    alert(okay);
    // TODO
  }

  onEditingDone = () => {
    const { setParams, goBack } = this.props.navigation;
    const { params } = this.props.navigation.state;

    // TODO

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


export { AddExpenseStep1Screen, AddExpenseStep2Screen, ExpenseDetailScreen };
