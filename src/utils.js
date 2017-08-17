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
    const { deleteButtonMessage = '刪除' } = this.props;

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
          <Text style={[buttonStyle, { color: '#e64133', fontWeight: 'bold' }]}>
            {deleteButtonMessage}
          </Text>
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

class MyButton extends Component {
  render() {
    return (
      <TouchableHighlight
        onPress={this.props.onPress}
        style={styles.popupBtn}
        underlayColor="#99d9f4"
      >
        <Text style={{ color: '#1e7d6a' }}>
          {this.props.title}
        </Text>
      </TouchableHighlight>
    );
  }
}

function toEmptyOrNumericString(value) {
  const str = value.toString();
  let f = parseFloat(str);
  if (isNaN(f) || !isFinite(f)) {
    return '';
  }

  let result = [];
  let foundPeriod = false;
  for (let i = 0; i < str.length; i++) {
    if ((str[i] >= '0' && str[i] <= '9') || str[i] === '.') {
      if (str[i] == '.') {
        if (foundPeriod) {
          // Invalid number. Skip the rest.
          break;
        }
        foundPeriod = true;
      }
      if (result.length === 1 && result[0] === '0') {
        if (str[i] === '0') continue;
        if (str[i] !== '.') result = [];
      }
      result.push(str[i]);
    }
  }

  return result.join('');
}

export { MyButton, TextField, DeleteButton, DeleteConfirmDialog, toEmptyOrNumericString };
