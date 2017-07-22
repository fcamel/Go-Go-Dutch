'use strict';

import React, { Component } from 'react';
import { AppRegistry } from 'react-native';
import { StackNavigator } from 'react-navigation';

import { TripListScreen, TripContentScreen } from './trip';
import ExpensesView, { AddExpenseScreen, ExpenseDetailScreen } from './expense';
import SummaryView from './summary';


const GoGoDutch = StackNavigator({
  Home: { screen: TripListScreen, },
  Trip: { screen: TripContentScreen, },
  AddExpense: { screen: AddExpenseScreen, },
  ExpenseDetail: { screen: ExpenseDetailScreen, },
});

AppRegistry.registerComponent('GoGoDutch', () => GoGoDutch);
