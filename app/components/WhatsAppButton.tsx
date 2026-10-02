'use client'

// Replace with your real WhatsApp number — country code, no +, no spaces or
// dashes. E.g. for +92 300 1234567, this would be "923001234567".
const WHATSAPP_NUMBER = '923249453952'
const DEFAULT_MESSAGE = "Hi Qasim! I came across your website and wanted to reach out."

export default function WhatsAppButton() {
  const href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(DEFAULT_MESSAGE)}`

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-[#25D366] shadow-lg flex items-center justify-center hover:scale-105 transition-transform"
    >
      <svg viewBox="0 0 32 32" width="28" height="28" fill="white">
        <path d="M16.004 3C9.374 3 4 8.373 4 15.002c0 2.46.73 4.747 1.983 6.66L4 29l7.5-1.955a11.93 11.93 0 0 0 4.504.88h.005c6.63 0 12.003-5.373 12.003-12.003C28.012 8.373 22.64 3 16.004 3zm0 21.816a9.76 9.76 0 0 1-4.98-1.364l-.357-.213-3.72.97.993-3.627-.233-.372a9.76 9.76 0 0 1-1.497-5.208c0-5.406 4.4-9.805 9.805-9.805 2.62 0 5.082 1.02 6.934 2.874a9.74 9.74 0 0 1 2.87 6.934c0 5.406-4.4 9.811-9.815 9.811zm5.373-7.345c-.294-.147-1.74-.858-2.01-.956-.27-.098-.467-.147-.664.147s-.76.956-.932 1.153c-.172.196-.343.221-.637.074-.294-.147-1.242-.458-2.366-1.46-.875-.78-1.466-1.744-1.638-2.038-.172-.294-.018-.453.129-.6.133-.132.294-.343.44-.515.148-.172.196-.294.294-.49.098-.196.049-.368-.025-.515-.074-.147-.664-1.6-.91-2.192-.24-.577-.484-.5-.664-.51-.172-.008-.368-.01-.564-.01s-.515.074-.785.368c-.27.294-1.03 1.007-1.03 2.456s1.055 2.848 1.202 3.044c.147.196 2.075 3.168 5.028 4.443.703.303 1.252.484 1.68.62.706.225 1.348.193 1.856.117.566-.085 1.74-.711 1.985-1.398.245-.687.245-1.276.172-1.398-.074-.123-.27-.196-.564-.343z"/>
      </svg>
    </a>
  )
}
