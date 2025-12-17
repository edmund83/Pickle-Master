
import React from 'react';

const ReportsDashboard: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Inventory Value', value: '$124,500', icon: 'fa-sack-dollar', color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Low Stock Items', value: '8 Items', icon: 'fa-triangle-exclamation', color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Orders Shipped', value: '342', icon: 'fa-box-open', color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Warehouse Space', value: '78%', icon: 'fa-warehouse', color: 'text-indigo-600', bg: 'bg-indigo-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center text-xl`}>
                <i className={`fa-solid ${stat.icon}`}></i>
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</span>
            </div>
            <p className="text-3xl font-black text-slate-800">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Mock Consumption Chart */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
             <h3 className="text-lg font-black text-slate-800">Inventory Usage Trend</h3>
             <select className="bg-slate-50 text-xs font-bold px-3 py-1.5 rounded-lg border-none outline-none">
               <option>Last 30 Days</option>
               <option>Last 90 Days</option>
             </select>
          </div>
          <div className="h-48 w-full flex items-end gap-3 px-2">
            {[40, 60, 35, 90, 45, 70, 85, 55, 65, 30].map((h, i) => (
              <div key={i} className="flex-1 group relative">
                <div 
                  style={{ height: `${h}%` }}
                  className={`w-full rounded-t-lg transition-all duration-500 cursor-pointer ${i === 3 ? 'bg-indigo-600' : 'bg-indigo-100 hover:bg-indigo-300'}`}
                ></div>
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                  {h}%
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between px-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Feb 01</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase">Feb 15</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase">Feb 28</span>
          </div>
        </div>

        {/* Categories Breakdown */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
          <h3 className="text-lg font-black text-slate-800">Top Categories</h3>
          <div className="space-y-5">
            {[
              { label: 'Electronics', count: 45, percent: 65, color: 'bg-indigo-500' },
              { label: 'Furniture', count: 12, percent: 20, color: 'bg-emerald-500' },
              { label: 'Stationary', count: 15, percent: 15, color: 'bg-amber-500' },
            ].map((cat, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between text-xs font-bold uppercase tracking-tight">
                  <span className="text-slate-600">{cat.label}</span>
                  <span className="text-slate-400">{cat.count} Units</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                   <div style={{ width: `${cat.percent}%` }} className={`h-full ${cat.color} rounded-full`}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Delivery Orders Table */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b flex items-center justify-between">
           <h3 className="text-lg font-black text-slate-800">Order Logs</h3>
           <button className="text-sm font-bold text-indigo-600 hover:underline">View All Orders</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-4 text-[10px] font-black uppercase text-slate-400">Order ID</th>
                <th className="px-8 py-4 text-[10px] font-black uppercase text-slate-400">Status</th>
                <th className="px-8 py-4 text-[10px] font-black uppercase text-slate-400">Destination</th>
                <th className="px-8 py-4 text-[10px] font-black uppercase text-slate-400">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {[
                { id: 'ORD-9912', status: 'Delivered', dest: 'London Depot', date: '2 hours ago' },
                { id: 'ORD-9913', status: 'Transit', dest: 'NYC Office', date: '5 hours ago' },
                { id: 'ORD-9914', status: 'Pending', dest: 'Paris Outlet', date: 'Yesterday' },
              ].map(row => (
                <tr key={row.id} className="hover:bg-slate-50 transition-colors cursor-pointer">
                  <td className="px-8 py-4 text-sm font-black text-slate-800">{row.id}</td>
                  <td className="px-8 py-4">
                    <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase ${
                      row.status === 'Delivered' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                    }`}>{row.status}</span>
                  </td>
                  <td className="px-8 py-4 text-sm font-medium text-slate-500">{row.dest}</td>
                  <td className="px-8 py-4 text-sm font-bold text-slate-400">{row.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReportsDashboard;
