import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';

const API_URL = 'http://localhost:8080/api';

const api = {
  lease: async () => {
    const res = await fetch(`${API_URL}/leases/my-active-lease`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    return res.json();
  },
  payments: async () => {
    const res = await fetch(`${API_URL}/tenant/payments`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    return res.json();
  },
  submitPayment: async (paymentId, data) => {
    const res = await fetch(`${API_URL}/payments/submit`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({paymentId,...data})
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
  maintenance: async () => {
    const res = await fetch(`${API_URL}/tenant/maintenance`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    return res.json();
  },
  createMaintenance: async (data) => {
    const res = await fetch(`${API_URL}/maintenance`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
  documents: async () => {
    const res = await fetch(`${API_URL}/documents`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    return res.json();
  }
};

const fmt = (amt) => `$${parseFloat(amt||0).toFixed(2)}`;
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-US', {month:'short',day:'numeric',year:'numeric'}) : 'N/A';
const statusColor = (s) => ({ACTIVE:'bg-green-100 text-green-800',PAID:'bg-green-100 text-green-800',PENDING:'bg-yellow-100 text-yellow-800',OVERDUE:'bg-red-100 text-red-800',OPEN:'bg-blue-100 text-blue-800',IN_PROGRESS:'bg-purple-100 text-purple-800',COMPLETED:'bg-green-100 text-green-800'}[s]||'bg-gray-100 text-gray-800');

const PaymentModal = ({payment,onClose,onSubmit}) => {
  const [d,setD] = useState({paymentMethod:'CREDIT_CARD',transactionId:'',notes:''});
  const [submitting,setSubmitting] = useState(false);

  const submit = async () => {
    if(!d.transactionId) return alert('Enter transaction ID');
    setSubmitting(true);
    try {
      await onSubmit(payment.id, d);
      alert('Payment submitted!');
      onClose();
    } catch(e) {
      alert('Error: '+e.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="border-b px-6 py-4 flex justify-between">
          <h2 className="text-xl font-bold">Make Payment</h2>
          <button onClick={onClose} className="text-2xl">×</button>
        </div>
        <div className="p-6 space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">Amount Due</span>
              <span className="text-2xl font-bold text-blue-600">{fmt(payment.amount)}</span>
            </div>
            {payment.lateFee>0&&<div className="flex justify-between text-sm"><span className="text-red-600">Late Fee</span><span className="font-semibold text-red-600">+{fmt(payment.lateFee)}</span></div>}
            <div className="border-t border-blue-200 mt-2 pt-2 flex justify-between">
              <span className="font-semibold">Total</span>
              <span className="text-xl font-bold">{fmt(parseFloat(payment.amount)+parseFloat(payment.lateFee||0))}</span>
            </div>
          </div>
          <div><label className="block text-sm font-medium mb-1">Payment Method *</label>
            <select value={d.paymentMethod} onChange={e=>setD({...d,paymentMethod:e.target.value})} className="w-full px-4 py-2 border rounded-lg">
              <option value="CREDIT_CARD">Credit Card</option>
              <option value="DEBIT_CARD">Debit Card</option>
              <option value="BANK_TRANSFER">Bank Transfer</option>
              <option value="CHECK">Check</option>
              <option value="CASH">Cash</option>
            </select>
          </div>
          <div><label className="block text-sm font-medium mb-1">Transaction ID *</label><input value={d.transactionId} onChange={e=>setD({...d,transactionId:e.target.value})} placeholder="Confirmation number" className="w-full px-4 py-2 border rounded-lg"/></div>
          <div><label className="block text-sm font-medium mb-1">Notes</label><textarea value={d.notes} onChange={e=>setD({...d,notes:e.target.value})} rows="3" className="w-full px-4 py-2 border rounded-lg"/></div>
        </div>
        <div className="border-t px-6 py-4 flex gap-3">
          <button onClick={onClose} disabled={submitting} className="flex-1 px-4 py-2 border rounded-lg">Cancel</button>
          <button onClick={submit} disabled={submitting} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg">{submitting?'Processing...':'Submit Payment'}</button>
        </div>
      </div>
    </div>
  );
};

const MaintenanceModal = ({onClose,onSubmit}) => {
  const [d,setD] = useState({title:'',description:'',category:'OTHER',priority:'MEDIUM'});
  const [submitting,setSubmitting] = useState(false);

  const submit = async () => {
    if(!d.title||!d.description) return alert('Fill required fields');
    setSubmitting(true);
    try {
      await onSubmit(d);
      alert('Request submitted!');
      onClose();
      setD({title:'',description:'',category:'OTHER',priority:'MEDIUM'});
    } catch(e) {
      alert('Error: '+e.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full">
        <div className="border-b px-6 py-4 flex justify-between">
          <h2 className="text-xl font-bold">Report Issue</h2>
          <button onClick={onClose} className="text-2xl">×</button>
        </div>
        <div className="p-6 space-y-4">
          <div><label className="block text-sm font-medium mb-1">Title *</label><input value={d.title} onChange={e=>setD({...d,title:e.target.value})} placeholder="Brief title" className="w-full px-4 py-2 border rounded-lg"/></div>
          <div><label className="block text-sm font-medium mb-1">Description *</label><textarea value={d.description} onChange={e=>setD({...d,description:e.target.value})} rows="4" placeholder="Detailed description" className="w-full px-4 py-2 border rounded-lg"/></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">Category</label>
              <select value={d.category} onChange={e=>setD({...d,category:e.target.value})} className="w-full px-4 py-2 border rounded-lg">
                <option value="OTHER">Other</option>
                <option value="PLUMBING">Plumbing</option>
                <option value="ELECTRICAL">Electrical</option>
                <option value="APPLIANCE">Appliance</option>
                <option value="HVAC">HVAC</option>
                <option value="STRUCTURAL">Structural</option>
              </select>
            </div>
            <div><label className="block text-sm font-medium mb-1">Priority</label>
              <select value={d.priority} onChange={e=>setD({...d,priority:e.target.value})} className="w-full px-4 py-2 border rounded-lg">
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
          </div>
        </div>
        <div className="border-t px-6 py-4 flex gap-3">
          <button onClick={onClose} disabled={submitting} className="flex-1 px-4 py-2 border rounded-lg">Cancel</button>
          <button onClick={submit} disabled={submitting} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg">{submitting?'Submitting...':'Submit'}</button>
        </div>
      </div>
    </div>
  );
};

export default function TenantDashboard() {
  const { logout } = useAuthStore();
  const [loading,setLoading] = useState(true);
  const [tab,setTab] = useState('overview');
  const [lease,setLease] = useState(null);
  const [payments,setPayments] = useState([]);
  const [maintenance,setMaintenance] = useState([]);
  const [documents,setDocuments] = useState([]);
  const [showPayment,setShowPayment] = useState(false);
  const [showMaintenance,setShowMaintenance] = useState(false);
  const [selectedPayment,setSelectedPayment] = useState(null);

  useEffect(()=>{fetchAll()},[]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [l,p,m,d] = await Promise.all([api.lease(),api.payments(),api.maintenance(),api.documents()]);
      setLease(l);setPayments(p);setMaintenance(m);setDocuments(d);
    } catch(e) {
      alert('Error: '+e.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (paymentId, data) => {
    await api.submitPayment(paymentId, data);
    await fetchAll();
  };

  const handleMaintenance = async (data) => {
    await api.createMaintenance(data);
    await fetchAll();
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  if(loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm"><div className="max-w-7xl mx-auto px-4 py-4"><div className="flex justify-between"><div><h1 className="text-2xl font-bold">Tenant Dashboard</h1><p className="text-sm text-gray-600">Welcome back!</p></div><button onClick={handleLogout} className="px-4 py-2 bg-red-50 text-red-600 rounded-lg">Logout</button></div></div></header>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {lease&&<div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 rounded-lg p-6 mb-8"><h3 className="text-lg font-semibold">Current Lease</h3><p className="text-2xl font-bold text-blue-700 mt-2">{lease.property?.name}</p><p className="text-sm text-gray-600 mt-1">{lease.property?.address}</p><div className="grid grid-cols-3 gap-6 mt-6"><div><p className="text-xs font-medium text-gray-500 mb-1">Monthly Rent</p><p className="text-xl font-bold">{fmt(lease.rentAmount)}</p></div><div><p className="text-xs font-medium text-gray-500 mb-1">Lease Ends</p><p className="text-xl font-bold">{fmtDate(lease.endDate)}</p></div><div><p className="text-xs font-medium text-gray-500 mb-1">Status</p><span className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold ${statusColor(lease.status)}`}>{lease.status}</span></div></div></div>}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <button onClick={()=>setShowMaintenance(true)} className="bg-white border rounded-lg p-6 hover:shadow-lg transition text-left"><div className="flex items-center"><div className="p-3 bg-red-100 rounded-lg"><svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg></div><div className="ml-4"><p className="text-lg font-semibold">Report Issue</p><p className="text-sm text-gray-600">Submit request</p></div></div></button>
          <button onClick={()=>setTab('payments')} className="bg-white border rounded-lg p-6 hover:shadow-lg transition text-left"><div className="flex items-center"><div className="p-3 bg-green-100 rounded-lg"><svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/></svg></div><div className="ml-4"><p className="text-lg font-semibold">Payments</p><p className="text-sm text-gray-600">View history</p></div></div></button>
          <button onClick={()=>setTab('documents')} className="bg-white border rounded-lg p-6 hover:shadow-lg transition text-left"><div className="flex items-center"><div className="p-3 bg-blue-100 rounded-lg"><svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg></div><div className="ml-4"><p className="text-lg font-semibold">Documents</p><p className="text-sm text-gray-600">View files</p></div></div></button>
        </div>
        <div className="mb-6 bg-white border-b rounded-t-lg"><div className="flex">{['overview','payments','maintenance','documents'].map(t=><button key={t} onClick={()=>setTab(t)} className={`px-4 py-3 font-medium capitalize ${tab===t?'border-b-2 border-blue-600 text-blue-600':'text-gray-600'}`}>{t}</button>)}</div></div>
        <div className="bg-white rounded-b-lg p-6 shadow-sm">
          {tab==='overview'&&<div className="grid grid-cols-2 gap-6"><div><h3 className="text-lg font-semibold mb-4">Recent Payments</h3><div className="space-y-3">{payments.slice(0,3).map(p=><div key={p.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border"><div><p className="text-sm font-medium">{fmtDate(p.dueDate)}</p><p className="text-xs text-gray-600">{p.description}</p></div><div className="text-right"><p className="text-sm font-semibold">{fmt(p.amount)}</p><span className={`text-xs px-2 py-1 rounded-full ${statusColor(p.status)}`}>{p.status}</span></div></div>)}</div></div><div><h3 className="text-lg font-semibold mb-4">Maintenance</h3><div className="space-y-3">{maintenance.map(m=><div key={m.id} className="p-4 bg-gray-50 border rounded-lg"><div className="flex justify-between"><p className="text-sm font-medium">{m.title}</p><span className={`text-xs px-2 py-1 rounded-full ${statusColor(m.status)}`}>{m.status}</span></div><p className="text-xs text-gray-600 mt-1">{m.description}</p></div>)}</div></div></div>}
          {tab==='payments'&&<div><h3 className="text-lg font-semibold mb-4">Payment History</h3><table className="min-w-full divide-y"><thead className="bg-gray-50"><tr><th className="px-6 py-3 text-left text-xs font-semibold">Due Date</th><th className="px-6 py-3 text-left text-xs font-semibold">Description</th><th className="px-6 py-3 text-left text-xs font-semibold">Amount</th><th className="px-6 py-3 text-left text-xs font-semibold">Status</th><th className="px-6 py-3 text-left text-xs font-semibold">Action</th></tr></thead><tbody className="divide-y">{payments.map(p=><tr key={p.id}><td className="px-6 py-4 text-sm">{fmtDate(p.dueDate)}</td><td className="px-6 py-4 text-sm">{p.description}</td><td className="px-6 py-4 text-sm font-semibold">{fmt(p.amount)}</td><td className="px-6 py-4"><span className={`px-2 py-1 text-xs rounded-full ${statusColor(p.status)}`}>{p.status}</span></td><td className="px-6 py-4">{p.status==='PAID'?<button className="text-blue-600 text-sm">Receipt</button>:<button onClick={()=>{setSelectedPayment(p);setShowPayment(true)}} className="px-3 py-1 bg-green-600 text-white rounded text-sm">Make Payment</button>}</td></tr>)}</tbody></table></div>}
          {tab==='maintenance'&&<div><div className="flex justify-between mb-4"><h3 className="text-lg font-semibold">My Requests</h3><button onClick={()=>setShowMaintenance(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg">+ New Request</button></div><div className="space-y-4">{maintenance.map(m=><div key={m.id} className="border rounded-lg p-6"><div className="flex justify-between items-start"><div><h4 className="text-lg font-semibold">{m.title}</h4><p className="text-sm text-gray-600 mt-2">{m.description}</p><div className="flex gap-4 mt-3 text-sm text-gray-500"><span>{m.category}</span><span>•</span><span>Priority: {m.priority}</span><span>•</span><span>{fmtDate(m.createdAt)}</span></div></div><span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusColor(m.status)}`}>{m.status}</span></div></div>)}</div></div>}
          {tab==='documents'&&<div><h3 className="text-lg font-semibold mb-4">My Documents</h3>{documents.length===0?<p className="text-center py-8 text-gray-500">No documents</p>:<div className="grid grid-cols-3 gap-4">{documents.map(d=><div key={d.id} className="border rounded-lg p-4 hover:shadow-md transition"><div className="flex items-start"><div className="p-3 bg-blue-100 rounded-lg"><svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg></div><div className="ml-3 flex-1"><p className="text-sm font-medium">{d.name}</p><p className="text-xs text-gray-600 mt-1">{d.type}</p><p className="text-xs text-gray-400 mt-1">{fmtDate(d.uploadedAt)}</p><button className="mt-2 text-blue-600 text-sm hover:underline">Download</button></div></div></div>)}</div>}</div>}
        </div>
      </div>
      {showPayment&&selectedPayment&&<PaymentModal payment={selectedPayment} onClose={()=>{setShowPayment(false);setSelectedPayment(null)}} onSubmit={handlePayment}/>}
      {showMaintenance&&<MaintenanceModal onClose={()=>setShowMaintenance(false)} onSubmit={handleMaintenance}/>}
    </div>
  );
}
