
import React from 'react';

const DashboardCard = ({ title, value, icon: Icon, color }) => {
  const bgColorClass = `bg-${color}-50`;
  const textColorClass = `text-${color}-600`;
  const iconColorClass = `text-${color}-500`;

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className={`flex-shrink-0 rounded-md p-3 ${bgColorClass}`}>
            <Icon className={`h-6 w-6 ${iconColorClass}`} aria-hidden="true" />
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd>
                <div className="text-lg font-medium text-gray-900">{value}</div>
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardCard;
