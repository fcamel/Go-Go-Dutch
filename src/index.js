'use strict';

import React from 'react';
import { AppRegistry } from 'react-native';
import { StackNavigator } from 'react-navigation';

import { TripListScreen, TripContentScreen } from './trip';
import { AddExpenseScreen, EditMemberRatioScreen, ExpenseDetailScreen } from './expense';

export default function() {
  const GoGoDutch = StackNavigator({
    Home: { screen: TripListScreen },
    Trip: { screen: TripContentScreen },
    AddExpense: { screen: AddExpenseScreen },
    EditMemberRatio: { screen: EditMemberRatioScreen },
    ExpenseDetail: { screen: ExpenseDetailScreen }
  });

  AppRegistry.registerComponent('GoGoDutch', () => GoGoDutch);
}
