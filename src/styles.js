'use strict';

import { Dimensions, StyleSheet } from 'react-native';

const colors = {
  base: '#f5fcff',
  navigationBackground: '#007ab5',
};

const navigationConsts = {
  height: 60,
};

const NAVIGATION_BUTTON_COLOR = '#3295c2';
const NAVIGATION_TINT_COLOR = '#fff';
const BUTTON_COLOR = '#94bfe0';

export default StyleSheet.create({
  baseView: {
    flex: 1,
    backgroundColor: colors.base,
  },
  contentText: {
    fontSize: 16
  },
  navigationHeaderTitle: {
    color: '#fff'
  },
  navigationHeader: {
    backgroundColor: colors.navigationBackground,
    height: navigationConsts.height,
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
    // Use the max value to fix the orientation issue.
    width: Math.max(Dimensions.get('window').width, Dimensions.get('window').height)
  }
});

export { colors, navigationConsts, NAVIGATION_BUTTON_COLOR, NAVIGATION_TINT_COLOR, BUTTON_COLOR };
