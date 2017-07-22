'use strict';

import React, { Component } from 'react';
import { AppRegistry } from 'react-native';
import { StackNavigator } from 'react-navigation';

import { TripListScreen, TripContentScreen } from './trip';
import ExpensesView, { AddExpenseStep1Screen, AddExpenseStep2Screen, ExpenseDetailScreen } from './expense';
import SummaryView from './summary';


const GoGoDutch = StackNavigator({
  Home: { screen: TripListScreen, },
  Trip: { screen: TripContentScreen, },
  AddExpenseStep1: { screen: AddExpenseStep1Screen, },
  AddExpenseStep2: { screen: AddExpenseStep2Screen, },
  ExpenseDetail: { screen: ExpenseDetailScreen, },
});

AppRegistry.registerComponent('GoGoDutch', () => GoGoDutch);
