'use strict';

import React from 'react';
import { AppRegistry } from 'react-native';
import { StackNavigator } from 'react-navigation';

import { TripListScreen, TripContentScreen } from './trip';
import { AddExpenseScreen, ExpenseDetailScreen } from './expense';


const GoGoDutch = StackNavigator({
  Home: { screen: TripListScreen, },
  Trip: { screen: TripContentScreen, },
  AddExpense: { screen: AddExpenseScreen, },
  ExpenseDetail: { screen: ExpenseDetailScreen, },
});

AppRegistry.registerComponent('GoGoDutch', () => GoGoDutch);
