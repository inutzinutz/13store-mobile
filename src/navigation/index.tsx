/**
 * Navigation Configuration
 */

import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { restoreSession } from '../store/authSlice';

// Screens
import LoginScreen from '../screens/LoginScreen';
import DashboardScreen from '../screens/DashboardScreen';
import CustomersScreen from '../screens/CustomersScreen';
import CustomerDetailScreen from '../screens/CustomerDetailScreen';
import CreateCustomerScreen from '../screens/CreateCustomerScreen';
import EditCustomerScreen from '../screens/EditCustomerScreen';
import DealsScreen from '../screens/DealsScreen';
import DealDetailScreen from '../screens/DealDetailScreen';
import CreateDealScreen from '../screens/CreateDealScreen';
import EditDealScreen from '../screens/EditDealScreen';
import ProfileScreen from '../screens/ProfileScreen';

// Navigation types
export type AuthStackParamList = {
  Login: undefined;
};

export type MainTabParamList = {
  Dashboard: undefined;
  Customers: undefined;
  Deals: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  CustomerDetail: { customerId: string };
  CreateCustomer: undefined;
  EditCustomer: { customerId: string };
  DealDetail: { dealId: string };
  CreateDeal: undefined;
  EditDeal: { dealId: string };
};

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const MainTab = createBottomTabNavigator<MainTabParamList>();
const RootStack = createNativeStackNavigator<RootStackParamList>();

// Auth Navigator
function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
    </AuthStack.Navigator>
  );
}

// Main Tab Navigator
function MainNavigator() {
  return (
    <MainTab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';

          if (route.name === 'Dashboard') {
            iconName = focused ? 'speedometer' : 'speedometer-outline';
          } else if (route.name === 'Customers') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'Deals') {
            iconName = focused ? 'briefcase' : 'briefcase-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
        headerShown: true,
      })}
    >
      <MainTab.Screen name="Dashboard" component={DashboardScreen} />
      <MainTab.Screen name="Customers" component={CustomersScreen} />
      <MainTab.Screen name="Deals" component={DealsScreen} />
      <MainTab.Screen name="Profile" component={ProfileScreen} />
    </MainTab.Navigator>
  );
}

// Root Navigator
function RootNavigator() {
  const { isAuthenticated, isLoading } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Try to restore session on app start
    dispatch(restoreSession());
  }, [dispatch]);

  if (isLoading) {
    // Could show a splash screen here
    return null;
  }

  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        <RootStack.Screen name="Auth" component={AuthNavigator} />
      ) : (
        <>
          <RootStack.Screen name="Main" component={MainNavigator} />
          <RootStack.Screen
            name="CustomerDetail"
            component={CustomerDetailScreen}
            options={{ headerShown: true, title: 'Customer Details' }}
          />
          <RootStack.Screen
            name="CreateCustomer"
            component={CreateCustomerScreen}
            options={{ headerShown: true, title: 'Create Customer' }}
          />
          <RootStack.Screen
            name="EditCustomer"
            component={EditCustomerScreen}
            options={{ headerShown: true, title: 'Edit Customer' }}
          />
          <RootStack.Screen
            name="DealDetail"
            component={DealDetailScreen}
            options={{ headerShown: true, title: 'Deal Details' }}
          />
          <RootStack.Screen
            name="CreateDeal"
            component={CreateDealScreen}
            options={{ headerShown: true, title: 'Create Deal' }}
          />
          <RootStack.Screen
            name="EditDeal"
            component={EditDealScreen}
            options={{ headerShown: true, title: 'Edit Deal' }}
          />
        </>
      )}
    </RootStack.Navigator>
  );
}

// Main Navigation Component
export default function Navigation() {
  return (
    <NavigationContainer>
      <RootNavigator />
    </NavigationContainer>
  );
}
