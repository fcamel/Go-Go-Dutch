'use strict';

import React, { Component } from 'react';
import {
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import styles from './styles';


export default class SummaryView extends Component {
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
                <Text style={[styles.tableData, {flex: 1}]}>{Number(item.shouldPay).toFixed(1)}</Text>
                <Text style={[styles.tableData, {flex: 1}]}>{Number(item.paid).toFixed(1)}</Text>
                <Text style={[styles.tableData, {flex: 1}]}>{Number(item.paid - item.shouldPay).toFixed(1)}</Text>
              </TouchableOpacity>
          }
        />
      </View>
    );
  }
}
