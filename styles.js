'use strict';


import { Dimensions, StyleSheet, } from 'react-native';

export default StyleSheet.create({
  contentText: {
    fontSize: 16,
  },
  tableHeader: {
    color: '#ccc',
    backgroundColor: '#333',
    fontWeight: 'bold',
    paddingTop: 6,
    paddingBottom: 6,
  },
  tableData: {
    fontSize: 18,
    textAlign: 'left',
    textAlignVertical: 'center',
    paddingLeft: 10,
  },
  bottomMenuItem: {
    fontSize: 28,
    textAlign: 'center',
    textAlignVertical: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderColor: '#ccc',
    // Use the max value to fix the orientation issue.
    width: Math.max(Dimensions.get('window').width, Dimensions.get('window').height),
  },
});
