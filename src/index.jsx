import './index.css'

import { createRoot } from 'react-dom/client'
import { App } from './App'
import React from 'react'

import 'bootstrap'

document.addEventListener('DOMContentLoaded', () => {
  const root = document.querySelector('#app')
  createRoot(root).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  )
})