'use client'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import toast from 'react-hot-toast'

export function PurchaseSuccessBanner() {
  const searchParams = useSearchParams()
  const [shown, setShown] = useState(false)

  useEffect(() => {
    if (searchParams.get('purchased') === 'true' && !shown) {
      setShown(true)
      toast.success('Purchase complete! You can now download this wallpaper.')
    }
  }, [searchParams, shown])

  return null
}
