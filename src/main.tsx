import ReactDOM from 'react-dom/client'
// import App from './App.tsx'
import './index.css'
import { Provider } from 'react-redux'
import { persistor, store } from './redux/store.ts'
import App from './App.tsx'
import { PersistGate } from 'redux-persist/integration/react'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient()
ReactDOM.createRoot(document.getElementById('root')!).render(
  // <React.StrictMode>
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <QueryClientProvider client={queryClient}>
        <App />
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </PersistGate>
  </Provider>
  // </React.StrictMode>,
)
