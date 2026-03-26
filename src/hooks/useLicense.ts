import { useState } from 'react'
import type { LicenseStatus } from '../types'

const STORAGE_KEY = 'part107_license'

function readStatus(): LicenseStatus {
  const raw = localStorage.getItem(STORAGE_KEY)
  return raw === 'pro' ? 'pro' : 'free'
}

export function useLicense(): { status: LicenseStatus; unlock: () => void; revoke: () => void } {
  const [status, setStatus] = useState<LicenseStatus>(readStatus)

  const unlock = () => {
    localStorage.setItem(STORAGE_KEY, 'pro')
    setStatus('pro')
  }

  const revoke = () => {
    localStorage.setItem(STORAGE_KEY, 'free')
    setStatus('free')
  }

  return { status, unlock, revoke }
}
