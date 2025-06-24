// import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import {BrowserRouter} from 'react-router-dom';

import "dropzone/dist/dropzone.css";
import {Provider as ReduxProvider} from 'react-redux';
import {store} from './redux/store.js';
import {ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

createRoot(document.getElementById('root')).render(
  // <StrictMode>
    <ReduxProvider store={store}>
      <BrowserRouter>
        <App />
        <ToastContainer position= "top-right" autoClose = {5000} stacked />
      </BrowserRouter>  
    </ReduxProvider>                                                                                                                                                                                          
  // {/* </StrictMode> */}
)
