/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  AppRegistry,
  Alert,
  Button,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';


export default class GoGoDutch extends Component {
  constructor() {
    super();

    store.accountings = [];
    for (i = 0; i <20; i++) {
      if (i % 3 == 0) {
        store.accountings.push({key:i, title: 'German 2015/06/11'});
      } else if (i % 3 == 1) {
        store.accountings.push({key:i, title: 'Japan 2017/04/07'});
      } else {
        store.accountings.push({key:i, title: 'Taipei 2016/01/13'});
      }
    }
  }

  render() {
    return (
      <View style={{flex: 1, backgroundColor: '#f5fcff'}}>
        <View style={{flexDirection: 'row', height: 100, borderBottomWidth: 3, borderColor: '#ccc'}}>
          <Text style={{flex: 1, paddingLeft: 20, fontSize: 55, textAlignVertical: 'center',}}>記帳本</Text>
          <View style={{margin: 4}}>
            <Button
              onPress={() => { Alert.alert('You tapped the button!')}}
              title="新增帳本"
            />
          </View>
        </View>
        <FlatList
          style={{flex: 1}}
          data={store.accountings}
          renderItem={
            ({item}) =>
              <View style={{flex: 1, flexDirection: 'row', borderBottomWidth: 1, borderColor: '#ccc'}}>
                <Text style={[styles.item, {flex: 1}]}>{item.title}</Text>
                <View style={{margin: 8}}>
                  <Button
                    onPress={() => { Alert.alert('You tapped the button!')}}
                    title="刪除"
                  />
                </View>
              </View>
          }
        />
      </View>
    );
  }
}

store = {
};

const styles = StyleSheet.create({
  item: {
    fontSize: 24,
    textAlign: 'left',
    paddingLeft: 12,
    paddingTop: 6,
    paddingBottom: 6,
  },
});

AppRegistry.registerComponent('go_go_dutch', () => GoGoDutch);
