'use strict';


import React, { Component } from 'react';
import {
  Button,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import ModalWrapper from 'react-native-modal-wrapper';

import styles from './styles';
import { TextField, DeleteConfirmDialog } from './utils';


export default class MembersView extends Component {
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
            name={'人數'}
            autoFocus={false}
            placeholder={''}
            defaultValue={this.state.ratio.toString()}
            keyboardType={'numeric'}
            updater={(ratio) => this.setState({ratio: parseFloat(ratio)})}/>
          <View style={{flexDirection: 'row', justifyContent: 'space-around', paddingTop: 50}}>
            <Button title="確認" onPress={this.onFinishEditMember} />
            <Button title="取消" onPress={this.onCancelEditMember} />
          </View>
        </ModalWrapper>
        <DeleteConfirmDialog
          visible={this.state.deleteMemberId > 0}
          onRespond={this.onRespondDelete} />

        <FlatList
          style={{flex: 1}}
          data={this.props.store.getMembers(this.props.tripId)}
          renderItem={
            ({item}) =>
              <TouchableOpacity style={{flex: 1, flexDirection: 'row', borderBottomWidth: 1, borderColor: '#ccc'}}
                onPress={() => this.onClickMember(item.id, item.name, item.ratio)}>
                <Text style={[styles.tableData, {flex: 1}]}>{item.name + '(' + item.ratio + ')'}</Text>
                <View style={{margin: 8}}>
                  <Button title="刪除" onPress={() => {this.onDeleteMember(item.id);}} />
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
    return { memberId: -1, name: '', ratio: 1, deleteMemberId: 0, };
  }
  resetState() {
    this.setState(() => { return this.getInitialState(); });
  }

  onClickMember = (memberId, name, ratio) => {
    this.setState(() => {
      return {
        memberId, name, ratio, deleteMemberId: 0,
      };
    });
    this.props.showEditor(true);
  }

  onFinishEditMember = () => {
    var { tripId } = this.props;
    var { memberId, name, ratio } = this.state;
    ratio = parseFloat(ratio);
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

  onRespondDelete = (okay) => {
    if (okay) {
      this.props.store.deleteMember(this.props.tripId, this.state.deleteMemberId);
    }
    this.resetState();
  }
}
