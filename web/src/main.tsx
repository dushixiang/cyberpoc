import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import dayjs from "dayjs";
import relativeTime from 'dayjs/plugin/relativeTime' // ES 2015

dayjs.locale('zh-cn') // 使用本地化语言
dayjs.extend(relativeTime)

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            // 禁用缓存
            staleTime: 0,
            gcTime: 0, // 替代 cacheTime (v5)
            refetchOnMount: true,
            refetchOnWindowFocus: false,
            refetchOnReconnect: false,
            retry: false,
        },
        mutations: {
            // 禁用 mutation 缓存
            retry: false,
        },
    },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
      <QueryClientProvider client={queryClient}>
          <App/>
      </QueryClientProvider>
  </StrictMode>,
)
