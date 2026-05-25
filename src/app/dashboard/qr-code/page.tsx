'use client'

import { useEffect, useRef, useState } from 'react'
import QRCode from 'qrcode'

const FORM_BASE_URL = 'https://ssvvsswwii.github.io/cuckoo-prospect-form'

export default function QRCodePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [source, setSource]     = useState('QR_General')
  const [qrUrl, setQrUrl]       = useState('')
  const [generated, setGenerated] = useState(false)

  const formUrl = `${FORM_BASE_URL}/?source=${encodeURIComponent(source)}`

  async function generate() {
    if (!canvasRef.current) return
    await QRCode.toCanvas(canvasRef.current, formUrl, {
      width: 320,
      margin: 2,
      color: { dark: '#7e171b', light: '#ffffff' },
    })
    setQrUrl(formUrl)
    setGenerated(true)
  }

  function download() {
    const canvas = canvasRef.current
    if (!canvas) return
    const link = document.createElement('a')
    link.download = `CUCKOO-QR-${source}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  // Generate on mount
  useEffect(() => { generate() }, [])

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-gray-900">QR Code Generator</h1>
        <p className="text-gray-500 text-sm mt-1">Generate a QR code for customer registration</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 max-w-3xl">
        {/* Config */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-5">
          <h2 className="font-bold text-gray-800">Configuration</h2>

          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">Source Label</label>
            <input
              type="text" value={source} onChange={e => setSource(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
              placeholder="e.g. KL_Branch, PJ_Event"
            />
            <p className="text-xs text-gray-400 mt-1">Labels where the QR code was scanned from</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">Form URL</label>
            <div className="bg-gray-50 rounded-lg px-3 py-2.5 text-xs text-gray-500 break-all font-mono border border-gray-100">
              {formUrl}
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={generate}
              className="flex-1 bg-brand hover:bg-brand-dark text-white font-bold py-2.5 rounded-lg text-sm transition-colors">
              Generate QR
            </button>
            <button onClick={download} disabled={!generated}
              className="flex-1 border-2 border-brand text-brand hover:bg-brand-light font-bold py-2.5 rounded-lg text-sm transition-colors disabled:opacity-40">
              Download PNG
            </button>
          </div>
        </div>

        {/* Preview */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col items-center justify-center">
          <div className="bg-brand-light rounded-xl p-4 mb-4">
            <canvas ref={canvasRef} className="rounded-lg" />
          </div>
          <p className="text-xs text-gray-400 text-center">
            Scan with phone camera to open registration form
          </p>
          {generated && (
            <p className="text-xs text-brand font-semibold mt-1">Source: {source}</p>
          )}
        </div>
      </div>
    </div>
  )
}
