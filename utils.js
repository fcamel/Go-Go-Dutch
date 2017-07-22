import React, { Component } from 'react';
import { View, Text, TextInput } from 'react-native';


class TextField extends Component {
  render() {
    const { name, autoFocus, placeholder, defaultValue, updater } = this.props;

    return (
      <View style={{flexDirection: 'row'}}>
        <Text style={{width: 100, textAlignVertical: 'center'}}>{name}</Text>
        <TextInput
          style={{width: 100}}
          autoFocus={autoFocus}
          placeholder={placeholder}
          defaultValue={defaultValue}
          onChangeText={updater} />
      </View>
    );
  }
}

export { TextField };
