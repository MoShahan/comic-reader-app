// Side-effect import must stay first for gesture handling on native.

import 'react-native-gesture-handler';
import { registerRootComponent } from 'expo';

import App from './App';

registerRootComponent(App);
