/**
 * @format
 */

// Import these at the top of the file
import 'react-native-gesture-handler'; // Required for navigation and gestures
import 'react-native-reanimated';      // Required for reanimated library

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);
