import React, { Component } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';

import ModalWrapper from 'react-native-modal-wrapper';

import styles from './styles';


class TextField extends Component {
  render() {
    const {
      name='', autoFocus=false, placeholder='', value='', keyboardType='default',
      onBlur=this.nop,
      updater,
    } = this.props;

    return (
      <View style={{flexDirection: 'row'}}>
        <Text style={[styles.contentText, {width: 100, textAlignVertical: 'center'}]}>{name}</Text>
        <TextInput
          style={[styles.contentText, {width: 150}]}
          autoFocus={autoFocus}
          placeholder={placeholder}
          value={value}
          keyboardType={keyboardType}
          onBlur={onBlur}
          onChangeText={updater} />
      </View>
    );
  }

  nop = () => {};
}

class DeleteConfirmDialog extends Component {
  render() {
    return (
      <ModalWrapper
        containerStyle={{ flexDirection: 'row', alignItems: 'flex-end' }}
        visible={this.props.visible}>
        <TouchableOpacity
          onPress={() => this.props.onRespond(true)}>
          <Text style={[styles.bottomMenuItem, {backgroundColor: '#f55'}]}>刪除</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => this.props.onRespond(false)}>
          <Text style={styles.bottomMenuItem}>取消</Text>
        </TouchableOpacity>
      </ModalWrapper>
    );
  }
}

function toEmptyOrNumericString(str)
{
  let f = parseFloat(str);
  if (!isNaN(f) && isFinite(f))
    return f.toString();
  return '';
}

export { TextField, DeleteConfirmDialog, toEmptyOrNumericString };
