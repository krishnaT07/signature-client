import React from 'react';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-700 border border-yellow-400',
  signed: 'bg-green-100 text-green-700 border border-green-500',
  rejected: 'bg-red-100 text-red-700 border border-red-500',
};

const StatusBadge = ({ status = 'pending' }) => {
  const baseClass = 'text-xs sm:text-sm px-2 py-1 rounded-full font-semibold transition-all duration-200';
  const colorClass = statusColors[status.toLowerCase()] || 'bg-gray-200 text-gray-700 border border-gray-300';

  return (
    <span className={`${baseClass} ${colorClass}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

export default StatusBadge;
