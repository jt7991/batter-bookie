/// <reference types="vinxi/types/client" />
import { hydrateRoot } from 'react-dom/client'
import { StartClient } from '@tanstack/react-start'
import { createRouter } from './router'

const router = createRouter()

function Client() {
  return <StartClient router={router} />
}

hydrateRoot(document, <Client />)

export default Client
