'use strict';

import { Dimensions, StyleSheet } from 'react-native';

const colors = {
  base: '#f5fcff',
  button: '#94bfe0'
};

const navigationConsts = {
  height: 60,
  backgroundColor: '#007ab5',
  buttonColor: '#3295c2',
  tintColor: '#fff'
};

export default StyleSheet.create({
  baseView: {
    flex: 1,
    backgroundColor: colors.base
  },
  contentText: {
    fontSize: 16
  },
  navigationHeaderTitle: {
    color: '#fff'
  },
  navigationHeader: {
    backgroundColor: navigationConsts.backgroundColor,
    height: navigationConsts.height
  },
  tableHeader: {
    fontSize: 14,
    color: '#959fa1',
    backgroundColor: '#d6e0e3',
    paddingTop: 6,
    paddingBottom: 6
  },
  tableData: {
    fontSize: 18,
    textAlign: 'left',
    textAlignVertical: 'center',
    paddingLeft: 10,
    paddingTop: 5,
    paddingBottom: 5
  },
  tableDataNumber: {
    fontSize: 18
  },
  bottomMenuItem: {
    fontSize: 28,
    textAlign: 'center',
    textAlignVertical: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderColor: '#ccc',
    width: Dimensions.get('window').width
  }
});

export { colors, navigationConsts };
