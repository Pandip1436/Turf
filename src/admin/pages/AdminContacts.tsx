import  { useEffect, useState } from 'react';
import { MessageSquare } from 'lucide-react';
import adminApi from '../utils/adminApi';

interface Contact {
  _id:        string;
  name:       string;
  email:      string;
  phone?:     string;
  subject:    string;
  message:    string;
  status:     string;
  adminReply?:string;
  createdAt:  string;
}

const STATUS_STYLES: Record<string, string> = {
  new:     'bg-orange-500/15 text-orange-400 border-orange-500/20',
  read:    'bg-blue-500/15   text-blue-400   border-blue-500/20',
  replied: 'bg-green-500/15  text-green-400  border-green-500/20',
  closed:  'bg-gray-500/15   text-gray-400   border-gray-500/20',
};

const AdminContacts = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState('');
  const [selected, setSelected] = useState<Contact | null>(null);
  const [reply, setReply]       = useState('');
  const [saving, setSaving]     = useState(false);

  useEffect(() => {
    const params = filter ? `?status=${filter}` : '';
    adminApi.get(`/admin/contacts${params}`)
      .then(res => setContacts(res.data.contacts))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [filter]);

  const updateContact = async (id: string, status: string, adminReply?: string) => {
    setSaving(true);
    try {
      const body: Record<string, string> = { status };
      if (adminReply) body.adminReply = adminReply;
      const res = await adminApi.patch(`/admin/contacts/${id}`, body);
      setContacts(prev => prev.map(c => c._id === id ? res.data.contact : c));
      setSelected(res.data.contact);
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const filterBtns = [
    { val: '',       label: 'All'     },
    { val: 'new',    label: 'New'     },
    { val: 'read',   label: 'Read'    },
    { val: 'replied',label: 'Replied' },
    { val: 'closed', label: 'Closed'  },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">Contact Enquiries</h1>
        <p className="text-gray-500 text-sm mt-1">{contacts.length} messages</p>
      </div>

      {/* Filter */}
      <div className="relative w-fit">
        <select
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="appearance-none bg-gray-900 border border-gray-700 rounded-xl pl-4 pr-9 py-2 text-sm text-white focus:border-green-500 outline-none cursor-pointer"
        >
          {filterBtns.map(b => (
            <option key={b.val} value={b.val}>{b.label}</option>
          ))}
        </select>
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none text-xs">▾</span>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* List */}
        <div className="space-y-3">
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : contacts.length === 0 ? (
            <div className="text-center py-16 text-gray-600 bg-gray-900 border border-gray-800 rounded-2xl">
              No messages found
            </div>
          ) : contacts.map(c => (
            <div
              key={c._id}
              onClick={() => { setSelected(c); setReply(c.adminReply || ''); }}
              className={`bg-gray-900 border rounded-2xl p-5 cursor-pointer transition-all ${
                selected?._id === c._id ? 'border-green-500/40 bg-green-500/5' : 'border-gray-800 hover:border-gray-700'
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {c.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-white font-semibold text-sm">{c.name}</div>
                    <div className="text-gray-500 text-xs">{c.email}</div>
                  </div>
                </div>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full border shrink-0 ${STATUS_STYLES[c.status]}`}>
                  {c.status}
                </span>
              </div>
              <div className="text-gray-300 text-sm font-medium mb-1">{c.subject}</div>
              <div className="text-gray-500 text-xs line-clamp-2">{c.message}</div>
              <div className="text-gray-600 text-xs mt-2">
                {new Date(c.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </div>
            </div>
          ))}
        </div>

        {/* Detail / Reply panel */}
        {selected ? (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-5 h-fit">
            <div className="flex items-center gap-3 pb-4 border-b border-gray-800">
              <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center text-green-400 font-bold">
                {selected.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="text-white font-bold">{selected.name}</div>
                <div className="text-gray-400 text-sm">{selected.email}</div>
                {selected.phone && <div className="text-gray-500 text-xs">{selected.phone}</div>}
              </div>
            </div>

            <div>
              <div className="text-xs font-bold text-gray-500 uppercase mb-1">Subject</div>
              <div className="text-white font-semibold">{selected.subject}</div>
            </div>
            <div>
              <div className="text-xs font-bold text-gray-500 uppercase mb-2">Message</div>
              <div className="text-gray-300 text-sm leading-relaxed bg-gray-800/50 rounded-xl p-4">{selected.message}</div>
            </div>

            {/* Status buttons */}
            <div className="flex gap-2 flex-wrap">
              {(['new','read','replied','closed'] as const).map(s => (
                <button key={s} onClick={() => updateContact(selected._id, s)} disabled={saving || selected.status === s}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all disabled:opacity-50
                    ${selected.status === s ? STATUS_STYLES[s] : 'border-gray-700 text-gray-400 hover:border-gray-600 hover:text-white'}`}>
                  {s}
                </button>
              ))}
            </div>

            {/* Reply */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Admin Reply</label>
              <textarea
                rows={4} value={reply}
                onChange={e => setReply(e.target.value)}
                placeholder="Type your reply..."
                className="w-full bg-gray-800 border border-gray-700 focus:border-green-500 text-white rounded-xl px-4 py-3 text-sm outline-none placeholder-gray-600 resize-none"
              />
              <button
                onClick={() => updateContact(selected._id, 'replied', reply)}
                disabled={!reply.trim() || saving}
                className="mt-3 w-full bg-green-500 hover:bg-green-400 disabled:opacity-40 text-white rounded-xl py-2.5 text-sm font-bold transition-colors"
              >
                {saving ? 'Saving...' : 'Send Reply & Mark as Replied'}
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl flex items-center justify-center h-64 text-gray-600">
            <div className="text-center">
              <MessageSquare className="w-8 h-8 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Select a message to view</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminContacts;
