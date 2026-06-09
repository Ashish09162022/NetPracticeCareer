import { Provider } from 'react-redux';
import { store } from '@/store/store';
import Router from '@/wrapperComponents/Router';

const App = () => (
  <Provider store={store}>
    <Router />
  </Provider>
);

export default App;
