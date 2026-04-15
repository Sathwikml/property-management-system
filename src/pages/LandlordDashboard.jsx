import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';

// Real API calls to your backend
const API_URL = 'http://localhost:8080/api';

const api = {
  getToken: () => localStorage.getItem('token'),
  
  properties: {
    getAll: async () => {
      const res = await fetch(`${API_URL}/properties`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      return res.json();
    },
    create: async (data) => {
      const res = await fetch(`${API_URL}/landlord/properties`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(data)
      });
      return res.json();
    },
    update: async (id, data) => {
      const res = await fetch(`${API_URL}/landlord/properties/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(data)
      });
      return res.json();
    },
    delete: async (id) => {
      await fetch(`${API_URL}/landlord/properties/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
    }
  },
  
  leases: {
    getAll: async () => {
      const res = await fetch(`${API_URL}/leases`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      return res.json();
    },
    create: async (data) => {
      const res = await fetch(`${API_URL}/leases`, {
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
    terminate: async (id, reason) => {
      const res = await fetch(`${API_URL}/leases/${id}/terminate`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ reason })
      });
      return res.json();
    }
  },
  
  payments: {
    getAll: async () => {
      const res = await fetch(`${API_URL}/payments`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      return res.json();
    },
    create: async (data) => {
      const res = await fetch(`${API_URL}/payments`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    }
  },
  
  documents: {
    getAll: async () => {
      const res = await fetch(`${API_URL}/documents`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      return res.json();
    },
    upload: async (file, type) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);
      const res = await fetch(`${API_URL}/documents`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: formData
      });
      return res.json();
    }
  },
  
  maintenance: {
    getAll: async () => {
      const res = await fetch(`${API_URL}/maintenance`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      return res.json();
    }
  }
};

const fmt = (amt) => `$${parseFloat(amt||0).toFixed(2)}`;
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-US', {month:'short',day:'numeric',year:'numeric'}) : 'N/A';
const statusColor = (s) => ({ACTIVE:'bg-green-100 text-green-800',PAID:'bg-green-100 text-green-800',PENDING:'bg-yellow-100 text-yellow-800',OVERDUE:'bg-red-100 text-red-800',OPEN:'bg-blue-100 text-blue-800'}[s]||'bg-gray-100 text-gray-800');

const PropertyModal = ({isOpen,onClose,property,onSuccess}) => {
  const [d,setD] = useState({name:'',address:'',city:'',state:'',zipCode:'',type:'APARTMENT',bedrooms:1,bathrooms:1,squareFeet:'',rentAmount:'',securityDeposit:'',description:''});
  const [saving,setSaving] = useState(false);

  useEffect(() => {
    if(property) setD(property);
    else setD({name:'',address:'',city:'',state:'',zipCode:'',type:'APARTMENT',bedrooms:1,bathrooms:1,squareFeet:'',rentAmount:'',securityDeposit:'',description:''});
  },[property,isOpen]);

  const save = async () => {
    if(!d.name||!d.address||!d.rentAmount) return alert('Fill required fields');
    setSaving(true);
    try {
      if(property?.id) await api.properties.update(property.id,d);
      else await api.properties.create(d);
      alert('Property saved!');
      onSuccess();
      onClose();
    } catch(e) {
      alert('Error: '+e.message);
    } finally {
      setSaving(false);
    }
  };

  if(!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="border-b px-6 py-4 flex justify-between">
          <h2 className="text-xl font-bold">{property?'Edit':'Add'} Property</h2>
          <button onClick={onClose} className="text-2xl">×</button>
        </div>
        <div className="p-6 space-y-4">
          <div><label className="block text-sm font-medium mb-1">Name *</label><input value={d.name} onChange={e=>setD({...d,name:e.target.value})} className="w-full px-4 py-2 border rounded-lg"/></div>
          <div><label className="block text-sm font-medium mb-1">Address *</label><input value={d.address} onChange={e=>setD({...d,address:e.target.value})} className="w-full px-4 py-2 border rounded-lg"/></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">City</label><input value={d.city} onChange={e=>setD({...d,city:e.target.value})} className="w-full px-4 py-2 border rounded-lg"/></div>
            <div><label className="block text-sm font-medium mb-1">State</label><input value={d.state} onChange={e=>setD({...d,state:e.target.value})} className="w-full px-4 py-2 border rounded-lg"/></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">Rent ($) *</label><input type="number" step="0.01" value={d.rentAmount} onChange={e=>setD({...d,rentAmount:e.target.value})} className="w-full px-4 py-2 border rounded-lg"/></div>
            <div><label className="block text-sm font-medium mb-1">Deposit ($)</label><input type="number" step="0.01" value={d.securityDeposit} onChange={e=>setD({...d,securityDeposit:e.target.value})} className="w-full px-4 py-2 border rounded-lg"/></div>
          </div>
        </div>
        <div className="border-t px-6 py-4 flex justify-end gap-3">
          <button onClick={onClose} disabled={saving} className="px-4 py-2 border rounded-lg">Cancel</button>
          <button onClick={save} disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded-lg">{saving?'Saving...':'Save'}</button>
        </div>
      </div>
    </div>
  );
};

const LeaseModal = ({isOpen,onClose,properties,onSuccess}) => {
  const [d,setD] = useState({propertyId:'',tenantEmail:'',startDate:'',endDate:'',rentAmount:'',securityDeposit:'',terms:''});
  const [saving,setSaving] = useState(false);

  const save = async () => {
    if(!d.propertyId||!d.tenantEmail||!d.startDate||!d.endDate||!d.rentAmount) return alert('Fill required fields');
    setSaving(true);
    try {
      await api.leases.create({...d,propertyId:parseInt(d.propertyId),rentAmount:parseFloat(d.rentAmount),securityDeposit:parseFloat(d.securityDeposit||0)});
      alert('Lease created!');
      onSuccess();
      onClose();
      setD({propertyId:'',tenantEmail:'',startDate:'',endDate:'',rentAmount:'',securityDeposit:'',terms:''});
    } catch(e) {
      alert('Error: '+e.message);
    } finally {
      setSaving(false);
    }
  };

  if(!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full">
        <div className="border-b px-6 py-4 flex justify-between">
          <h2 className="text-xl font-bold">Create Lease</h2>
          <button onClick={onClose} className="text-2xl">×</button>
        </div>
        <div className="p-6 space-y-4">
          <div><label className="block text-sm font-medium mb-1">Property *</label>
            <select value={d.propertyId} onChange={e=>setD({...d,propertyId:e.target.value})} className="w-full px-4 py-2 border rounded-lg">
              <option value="">Select property</option>
              {properties.map(p=><option key={p.id} value={p.id}>{p.name} - {p.address}</option>)}
            </select>
          </div>
          <div><label className="block text-sm font-medium mb-1">Tenant Email *</label><input type="email" value={d.tenantEmail} onChange={e=>setD({...d,tenantEmail:e.target.value})} placeholder="tenant@example.com" className="w-full px-4 py-2 border rounded-lg"/></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">Start Date *</label><input type="date" value={d.startDate} onChange={e=>setD({...d,startDate:e.target.value})} className="w-full px-4 py-2 border rounded-lg"/></div>
            <div><label className="block text-sm font-medium mb-1">End Date *</label><input type="date" value={d.endDate} onChange={e=>setD({...d,endDate:e.target.value})} className="w-full px-4 py-2 border rounded-lg"/></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">Rent ($) *</label><input type="number" step="0.01" value={d.rentAmount} onChange={e=>setD({...d,rentAmount:e.target.value})} className="w-full px-4 py-2 border rounded-lg"/></div>
            <div><label className="block text-sm font-medium mb-1">Deposit ($)</label><input type="number" step="0.01" value={d.securityDeposit} onChange={e=>setD({...d,securityDeposit:e.target.value})} className="w-full px-4 py-2 border rounded-lg"/></div>
          </div>
        </div>
        <div className="border-t px-6 py-4 flex justify-end gap-3">
          <button onClick={onClose} disabled={saving} className="px-4 py-2 border rounded-lg">Cancel</button>
          <button onClick={save} disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded-lg">{saving?'Creating...':'Create Lease'}</button>
        </div>
      </div>
    </div>
  );
};

const PaymentModal = ({isOpen,onClose,leases,onSuccess}) => {
  const [d,setD] = useState({leaseId:'',amount:'',dueDate:'',description:''});
  const [saving,setSaving] = useState(false);

  const save = async () => {
    if(!d.leaseId||!d.amount||!d.dueDate) return alert('Fill required fields');
    setSaving(true);
    try {
      await api.payments.create({lease:{id:parseInt(d.leaseId)},amount:parseFloat(d.amount),dueDate:d.dueDate,description:d.description,status:'PENDING'});
      alert('Payment created!');
      onSuccess();
      onClose();
      setD({leaseId:'',amount:'',dueDate:'',description:''});
    } catch(e) {
      alert('Error: '+e.message);
    } finally {
      setSaving(false);
    }
  };

  if(!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="border-b px-6 py-4 flex justify-between">
          <h2 className="text-xl font-bold">Create Payment</h2>
          <button onClick={onClose} className="text-2xl">×</button>
        </div>
        <div className="p-6 space-y-4">
          <div><label className="block text-sm font-medium mb-1">Lease *</label>
            <select value={d.leaseId} onChange={e=>setD({...d,leaseId:e.target.value})} className="w-full px-4 py-2 border rounded-lg">
              <option value="">Select lease</option>
              {leases.filter(l=>l.status==='ACTIVE').map(l=><option key={l.id} value={l.id}>{l.property?.name} - {l.tenant?.firstName} {l.tenant?.lastName}</option>)}
            </select>
          </div>
          <div><label className="block text-sm font-medium mb-1">Amount ($) *</label><input type="number" step="0.01" value={d.amount} onChange={e=>setD({...d,amount:e.target.value})} className="w-full px-4 py-2 border rounded-lg"/></div>
          <div><label className="block text-sm font-medium mb-1">Due Date *</label><input type="date" value={d.dueDate} onChange={e=>setD({...d,dueDate:e.target.value})} className="w-full px-4 py-2 border rounded-lg"/></div>
          <div><label className="block text-sm font-medium mb-1">Description</label><input value={d.description} onChange={e=>setD({...d,description:e.target.value})} placeholder="January Rent" className="w-full px-4 py-2 border rounded-lg"/></div>
        </div>
        <div className="border-t px-6 py-4 flex justify-end gap-3">
          <button onClick={onClose} disabled={saving} className="px-4 py-2 border rounded-lg">Cancel</button>
          <button onClick={save} disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded-lg">{saving?'Creating...':'Create'}</button>
        </div>
      </div>
    </div>
  );
};

const DocumentModal = ({isOpen,onClose,onSuccess}) => {
  const [file,setFile] = useState(null);
  const [type,setType] = useState('LEASE_AGREEMENT');
  const [uploading,setUploading] = useState(false);

  const upload = async () => {
    if(!file) return alert('Select a file');
    setUploading(true);
    try {
      await api.documents.upload(file,type);
      alert('Document uploaded!');
      onSuccess();
      onClose();
      setFile(null);
    } catch(e) {
      alert('Error: '+e.message);
    } finally {
      setUploading(false);
    }
  };

  if(!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="border-b px-6 py-4 flex justify-between">
          <h2 className="text-xl font-bold">Upload Document</h2>
          <button onClick={onClose} className="text-2xl">×</button>
        </div>
        <div className="p-6 space-y-4">
          <div><label className="block text-sm font-medium mb-1">Type</label>
            <select value={type} onChange={e=>setType(e.target.value)} className="w-full px-4 py-2 border rounded-lg">
              <option value="LEASE_AGREEMENT">Lease Agreement</option>
              <option value="INSURANCE">Insurance</option>
              <option value="INSPECTION_REPORT">Inspection Report</option>
              <option value="RECEIPT">Receipt</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
          <div><label className="block text-sm font-medium mb-1">File</label><input type="file" onChange={e=>setFile(e.target.files[0])} className="w-full px-4 py-2 border rounded-lg"/></div>
        </div>
        <div className="border-t px-6 py-4 flex justify-end gap-3">
          <button onClick={onClose} disabled={uploading} className="px-4 py-2 border rounded-lg">Cancel</button>
          <button onClick={upload} disabled={uploading} className="px-4 py-2 bg-blue-600 text-white rounded-lg">{uploading?'Uploading...':'Upload'}</button>
        </div>
      </div>
    </div>
  );
};

export default function LandlordDashboard() {
  const { logout } = useAuthStore();
  const [loading,setLoading] = useState(true);
  const [tab,setTab] = useState('overview');
  const [properties,setProperties] = useState([]);
  const [leases,setLeases] = useState([]);
  const [payments,setPayments] = useState([]);
  const [maintenance,setMaintenance] = useState([]);
  const [documents,setDocuments] = useState([]);
  const [modals,setModals] = useState({property:false,lease:false,payment:false,document:false});
  const [selectedProperty,setSelectedProperty] = useState(null);

  useEffect(()=>{fetchAll()},[]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [p,l,pay,m,d] = await Promise.all([api.properties.getAll(),api.leases.getAll(),api.payments.getAll(),api.maintenance.getAll(),api.documents.getAll()]);
      setProperties(p);setLeases(l);setPayments(pay);setMaintenance(m);setDocuments(d);
    } catch(e) {
      alert('Error loading data: '+e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  if(loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;

  const stats = {properties:properties.length,leases:leases.filter(l=>l.status==='ACTIVE').length,revenue:leases.filter(l=>l.status==='ACTIVE').reduce((s,l)=>s+parseFloat(l.rentAmount||0),0),pending:maintenance.filter(m=>m.status==='OPEN').length};

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm"><div className="max-w-7xl mx-auto px-4 py-4"><div className="flex justify-between"><h1 className="text-2xl font-bold">Landlord Dashboard</h1><button onClick={handleLogout} className="px-4 py-2 bg-red-50 text-red-600 rounded-lg">Logout</button></div></div></header>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6"><p className="text-sm text-gray-600">Properties</p><p className="text-2xl font-bold">{stats.properties}</p></div>
          <div className="bg-white rounded-lg shadow p-6"><p className="text-sm text-gray-600">Active Leases</p><p className="text-2xl font-bold">{stats.leases}</p></div>
          <div className="bg-white rounded-lg shadow p-6"><p className="text-sm text-gray-600">Revenue</p><p className="text-2xl font-bold">{fmt(stats.revenue)}</p></div>
          <div className="bg-white rounded-lg shadow p-6"><p className="text-sm text-gray-600">Pending</p><p className="text-2xl font-bold">{stats.pending}</p></div>
        </div>
        <div className="mb-6 bg-white border-b rounded-t-lg"><div className="flex">{['overview','properties','leases','payments','documents'].map(t=><button key={t} onClick={()=>setTab(t)} className={`px-4 py-3 font-medium capitalize ${tab===t?'border-b-2 border-blue-600 text-blue-600':'text-gray-600'}`}>{t}</button>)}</div></div>
        <div className="bg-white rounded-b-lg p-6 shadow-sm">
          {tab==='overview'&&<div><h3 className="text-lg font-semibold mb-4">Dashboard Overview</h3><p className="text-gray-600">Manage your properties, leases, and payments.</p></div>}
          {tab==='properties'&&<div><div className="flex justify-between mb-4"><h3 className="text-lg font-semibold">Properties</h3><button onClick={()=>{setSelectedProperty(null);setModals({...modals,property:true})}} className="px-4 py-2 bg-blue-600 text-white rounded-lg">+ Add</button></div><div className="grid grid-cols-3 gap-4">{properties.map(p=><div key={p.id} className="border rounded-lg p-4"><h4 className="font-semibold">{p.name}</h4><p className="text-sm text-gray-600">{p.address}</p><p className="text-lg font-bold text-blue-600 mt-2">{fmt(p.rentAmount)}/mo</p><div className="flex gap-2 mt-4"><button onClick={()=>{setSelectedProperty(p);setModals({...modals,property:true})}} className="flex-1 px-3 py-1 bg-gray-100 rounded">Edit</button><button onClick={()=>api.properties.delete(p.id).then(fetchAll)} className="flex-1 px-3 py-1 bg-red-50 text-red-600 rounded">Delete</button></div></div>)}</div></div>}
          {tab==='leases'&&<div><div className="flex justify-between mb-4"><h3 className="text-lg font-semibold">Leases</h3><button onClick={()=>setModals({...modals,lease:true})} className="px-4 py-2 bg-blue-600 text-white rounded-lg">+ Create Lease</button></div><div className="space-y-4">{leases.map(l=><div key={l.id} className="border rounded-lg p-4"><div className="flex justify-between"><div><h4 className="font-semibold">{l.property?.name}</h4><p className="text-sm text-gray-600">Tenant: {l.tenant?.firstName} {l.tenant?.lastName}</p><p className="text-sm text-gray-600">{fmtDate(l.startDate)} - {fmtDate(l.endDate)}</p><p className="text-lg font-bold text-blue-600 mt-2">{fmt(l.rentAmount)}/mo</p></div><span className={`px-3 py-1 text-xs font-semibold rounded-full h-fit ${statusColor(l.status)}`}>{l.status}</span></div></div>)}</div></div>}
          {tab==='payments'&&<div><div className="flex justify-between mb-4"><h3 className="text-lg font-semibold">Payments</h3><button onClick={()=>setModals({...modals,payment:true})} className="px-4 py-2 bg-blue-600 text-white rounded-lg">+ Create Payment</button></div><table className="min-w-full divide-y"><thead className="bg-gray-50"><tr><th className="px-6 py-3 text-left text-xs font-semibold">Tenant</th><th className="px-6 py-3 text-left text-xs font-semibold">Amount</th><th className="px-6 py-3 text-left text-xs font-semibold">Due</th><th className="px-6 py-3 text-left text-xs font-semibold">Status</th></tr></thead><tbody className="divide-y">{payments.map(p=><tr key={p.id}><td className="px-6 py-4 text-sm">{p.lease?.tenant?.firstName} {p.lease?.tenant?.lastName}</td><td className="px-6 py-4 text-sm">{fmt(p.amount)}</td><td className="px-6 py-4 text-sm">{fmtDate(p.dueDate)}</td><td className="px-6 py-4"><span className={`px-2 py-1 text-xs rounded-full ${statusColor(p.status)}`}>{p.status}</span></td></tr>)}</tbody></table></div>}
          {tab==='documents'&&<div><div className="flex justify-between mb-4"><h3 className="text-lg font-semibold">Documents</h3><button onClick={()=>setModals({...modals,document:true})} className="px-4 py-2 bg-blue-600 text-white rounded-lg">+ Upload</button></div>{documents.length===0?<p className="text-center py-8 text-gray-500">No documents</p>:<div className="grid grid-cols-3 gap-4">{documents.map(d=><div key={d.id} className="border rounded-lg p-4"><p className="font-semibold">{d.name}</p><p className="text-xs text-gray-600">{d.type}</p><p className="text-xs text-gray-400">{fmtDate(d.uploadedAt)}</p></div>)}</div>}</div>}
        </div>
      </div>
      <PropertyModal isOpen={modals.property} onClose={()=>setModals({...modals,property:false})} property={selectedProperty} onSuccess={fetchAll}/>
      <LeaseModal isOpen={modals.lease} onClose={()=>setModals({...modals,lease:false})} properties={properties} onSuccess={fetchAll}/>
      <PaymentModal isOpen={modals.payment} onClose={()=>setModals({...modals,payment:false})} leases={leases} onSuccess={fetchAll}/>
      <DocumentModal isOpen={modals.document} onClose={()=>setModals({...modals,document:false})} onSuccess={fetchAll}/>
    </div>
  );
}
