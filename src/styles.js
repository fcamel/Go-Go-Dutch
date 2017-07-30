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
    fontSize: 19,
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
    fontSize: 20,
    textAlign: 'center',
    textAlignVertical: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderColor: '#ccc',
    width: Dimensions.get('window').width
  },
  tripListItem: {
    flex: 1,
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#ccc',
    marginLeft: 10,
    marginRight: 10,
    padding: 3,
    height: 60
  },
  navIconBtn: {
    marginRight: 4
  },
  iconBtn: {
    padding: 10
  },
  popupBtn: {
    marginTop: 20,
    padding: 10,
    paddingRight: 22,
    paddingLeft: 22,
    marginRight: 2,
    marginLeft: 2
  }
});

export { colors, navigationConsts };
