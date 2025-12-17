
import React from 'react';

const NotificationsView: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-12 animate-in fade-in duration-700">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-black text-slate-800">You don't have any alerts.</h1>
        <p className="text-xl font-bold text-slate-800">Stay on top of your stuff with Sortly Alerts:</p>
      </div>

      <div className="max-w-2xl w-full space-y-16">
        {/* Stock level Alerts */}
        <div className="flex items-start gap-8">
          <div className="w-16 h-16 bg-[#00a3cc] rounded-lg flex items-center justify-center shrink-0 shadow-lg shadow-sky-100">
            <i className="fa-solid fa-chart-line text-white text-3xl"></i>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-slate-800">Stock level Alerts</h3>
            <p className="text-slate-500 font-medium leading-relaxed">
              These are item quantity based alerts. Get notified when item quantities hit certain thresholds. (E.g.: Low stock alerts)
            </p>
            <a href="#" className="inline-block text-[#00a3cc] font-bold text-sm hover:underline">Learn More</a>
          </div>
        </div>

        {/* Date based Alerts */}
        <div className="flex items-start gap-8">
          <div className="w-16 h-16 bg-[#00a3cc] rounded-lg flex items-center justify-center shrink-0 shadow-lg shadow-sky-100">
            <i className="fa-solid fa-calendar-days text-white text-3xl"></i>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-slate-800">Date based Alerts</h3>
            <p className="text-slate-500 font-medium leading-relaxed">
              Get reminded of important dates related to your items (E.g.: Expiry date alert, item return date reminder)
            </p>
            <a href="#" className="inline-block text-[#00a3cc] font-bold text-sm hover:underline">Learn More</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationsView;
