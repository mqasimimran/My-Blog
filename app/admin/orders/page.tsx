'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import AdminNav from '@/app/admin/AdminNav'

const METHOD_LABELS: Record<string, string> = {
  jazzcash: 'JazzCash',
  easypaisa: 'EasyPaisa',
  bank_transfer: 'Bank Transfer',
  payoneer: 'Payoneer',
}

type Order = {
  id: string
  order_number: string
  product_name: string
  product_price: number
  amount_local: number | null
  currency_local: string | null
  customer_name: string
  customer_email: string
  payment_method: string
  customer_transaction_id: string
  status: string
  created_at: string
}

export default function AdminOrdersPage() {
  const { data: session, status } = useSession()
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [verifyingId, setVerifyingId] = useState<string | null>(null)
  const [filter, setFilter] = useState<'pending_verification' | 'paid' | 'rejected' | 'all'>('pending_verification')

  useEffect(() => {
    async function fetchOrders() {
      const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false })
      if (error) console.error('Error fetching orders:', error)
      else setOrders(data || [])
      setIsLoading(false)
    }
    if (status === 'authenticated') fetchOrders()
  }, [status])

  async function verifyAndRelease(order: Order) {
    const methodLabel = METHOD_LABELS[order.payment_method] || order.payment_method
    const amountDisplay = order.currency_local === 'PKR' && order.amount_local
      ? `Rs ${Number(order.amount_local).toLocaleString('en-PK')}`
      : `$${order.product_price}`
    if (!confirm(`Confirm you've received this payment via ${methodLabel}?\n\nTransaction/Reference ID: ${order.customer_transaction_id}\nAmount: ${amountDisplay}`)) return

    setVerifyingId(order.id)
    try {
      const res = await fetch('/api/orders/notify-customer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: order.id }),
      })
      const data = await res.json()
      if (res.ok) {
        setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: 'paid' } : o))
      } else {
        alert('Error: ' + data.error)
      }
    } catch (err) {
      alert('Something went wrong verifying this order.')
    } finally {
      setVerifyingId(null)
    }
  }

  async function rejectOrder(order: Order) {
    const methodLabel = METHOD_LABELS[order.payment_method] || order.payment_method
    if (!confirm(`Mark this order as rejected? Use this if you can't find this transaction via ${methodLabel}.`)) return
    const { error } = await supabase.from('orders').update({ status: 'rejected' }).eq('id', order.id)
    if (error) alert('Error: ' + error.message)
    else setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: 'rejected' } : o))
  }

  const filteredOrders = filter === 'all' ? orders : orders.filter(o => o.status === filter)

  if (status === 'loading' || isLoading) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center font-mono text-sm text-gray-500">Loading admin portal...</div>
  }
  if (!session) return null

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans">
      <AdminNav />

      <main className="flex-1 p-10 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-light tracking-wide uppercase text-gray-900 mb-2">Orders</h1>
          <p className="text-xs text-gray-500 mb-8">Check your JazzCash/EasyPaisa app for each transaction ID before verifying.</p>

          <div className="flex gap-2 mb-8">
            {(['pending_verification', 'paid', 'rejected', 'all'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`text-[10px] font-bold uppercase tracking-widest px-3 py-2 rounded-full transition-colors ${
                  filter === f ? 'bg-[#aa002a] text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                {f.replace('_', ' ')} ({f === 'all' ? orders.length : orders.filter(o => o.status === f).length})
              </button>
            ))}
          </div>

          {filteredOrders.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-10 text-center text-sm text-gray-500">
              No orders here.
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <div key={order.id} className="bg-white p-5 border border-gray-200 rounded-lg shadow-sm">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs text-gray-400">{order.order_number}</span>
                        <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${
                          order.status === 'paid' ? 'bg-green-50 text-green-700' :
                          order.status === 'rejected' ? 'bg-red-50 text-red-700' :
                          'bg-amber-50 text-amber-700'
                        }`}>
                          {order.status.replace('_', ' ')}
                        </span>
                      </div>
                      <h2 className="text-base font-medium text-gray-900">{order.product_name}</h2>
                      <p className="text-sm text-gray-500">
                        ${Number(order.product_price).toFixed(2)}
                        {order.currency_local === 'PKR' && order.amount_local && (
                          <span className="text-gray-900 font-medium"> · Verify: Rs {Number(order.amount_local).toLocaleString('en-PK')}</span>
                        )}
                      </p>
                    </div>
                    <p className="text-xs text-gray-400">{new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm bg-gray-50 rounded p-4 mb-4">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Customer</p>
                      <p className="text-gray-900">{order.customer_name}</p>
                      <p className="text-gray-500 text-xs">{order.customer_email}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Payment</p>
                      <p className="text-gray-900">{METHOD_LABELS[order.payment_method] || order.payment_method}</p>
                      <p className="text-gray-500 text-xs font-mono">TID: {order.customer_transaction_id}</p>
                    </div>
                  </div>

                  {order.status === 'pending_verification' && (
                    <div className="flex gap-3">
                      <button
                        onClick={() => verifyAndRelease(order)}
                        disabled={verifyingId === order.id}
                        className="flex-1 bg-[#aa002a] text-white text-xs font-bold uppercase tracking-widest py-3 rounded hover:bg-gray-900 transition-colors disabled:opacity-60"
                      >
                        {verifyingId === order.id ? 'Sending...' : '✓ Verify & Send Download Link'}
                      </button>
                      <button onClick={() => rejectOrder(order)} className="text-xs font-bold uppercase tracking-widest text-red-500 hover:text-red-700 px-4">
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
