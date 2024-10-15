import React, { useState } from 'react';
import './App.css';
import DateRangePicker from './components/DateRangePicker';

function App() {

  const handleDateRangeChange = (
    dateRange: [string, string] | null, 
    weekends: string[]
  ) => {
    if (dateRange) {
      console.log('Selected date range:', dateRange);
      console.log('Weekend dates within range:', weekends);
    } else {
      console.log('No date range selected');
    }
  };

  const predefinedRanges = [
    {
      id: 121,
      label: 'Last 7 days',
      startDate: new Date(new Date().setDate(new Date().getDate() - 7)),
      endDate: new Date(),
    },
    {
      id: 131,
      label: 'Last 30 days',
      startDate: new Date(new Date().setDate(new Date().getDate() - 30)),
      endDate: new Date(),
    },
    {
      id: 141,
      label: 'This month',
      startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      endDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
    },
  ];

  return (
    <div className="App">
      <DateRangePicker 
        onDateRangeChange={handleDateRangeChange}
        predefinedRanges={predefinedRanges} />
    </div>
  );
}

export default App;
