import React, { Component } from 'react';
import { Dimensions, View, Text, TextInput, TouchableHighlight } from 'react-native';

import Icon from 'react-native-vector-icons/MaterialIcons';
import ModalWrapper from 'react-native-modal-wrapper';

import styles from './styles';

class TextField extends Component {
  render() {
    const {
      name = '',
      autoFocus = false,
      placeholder = '',
      value = '',
      keyboardType = 'default',
      onBlur = this.nop,
      updater
    } = this.props;

    return (
      <View style={{ flexDirection: 'row' }}>
        <Text style={[styles.contentText, { width: 100, textAlignVertical: 'center' }]}>
          {name}
        </Text>
        <TextInput
          style={[styles.contentText, { width: 150 }]}
          autoFocus={autoFocus}
          placeholder={placeholder}
          value={value}
          keyboardType={keyboardType}
          onBlur={onBlur}
          onChangeText={updater}
        />
      </View>
    );
  }

  nop = () => {};
}

class DeleteButton extends Component {
  render() {
    return (
      <TouchableHighlight
        onPress={() => {
          this.props.onPress();
        }}
        underlayColor="#dfecf2"
        style={styles.iconBtn}
      >
        <Icon name="delete" size={28} color="#9bafb8" />
      </TouchableHighlight>
    );
  }
}

class DeleteConfirmDialog extends Component {
  render() {
    const buttonContainerStyle = {
      borderRadius: 12,
      padding: 14,
      borderWidth: 1,
      borderColor: '#999',
      backgroundColor: 'rgba(225, 225, 225, 1.0)',
      width: Dimensions.get('window').width - 30
    };
    const buttonStyle = {
      fontSize: 20,
      textAlign: 'center',
      textAlignVertical: 'center'
    };
    return (
      <ModalWrapper
        containerStyle={{
          flexDirection: 'row',
          alignItems: 'flex-end',
          backgroundColor: 'rgba(0, 0, 0, 0.1)'
        }}
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.0)' }}
        visible={this.props.visible}
      >
        <TouchableHighlight
          style={[buttonContainerStyle, { marginBottom: 6 }]}
          onPress={() => this.props.onRespond(true)}
        >
          <Text style={[buttonStyle, { color: '#e64133', fontWeight: 'bold' }]}>刪除</Text>
        </TouchableHighlight>
        <TouchableHighlight
          style={[buttonContainerStyle, { marginBottom: 15 }]}
          onPress={() => this.props.onRespond(false)}
        >
          <Text style={buttonStyle}>取消</Text>
        </TouchableHighlight>
      </ModalWrapper>
    );
  }
}

function toEmptyOrNumericString(str) {
  let f = parseFloat(str);
  if (!isNaN(f) && isFinite(f)) return f.toString();
  return '';
}

export { TextField, DeleteButton, DeleteConfirmDialog, toEmptyOrNumericString };
