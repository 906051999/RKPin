import React from 'react';
import { TabList, Tab } from 'react-tabs';

const DateTabs = ({ sortedDates, selectedIndex, onSelect }) => (
  <TabList className="flex overflow-x-auto py-3 px-4">
    {sortedDates.map((date, index) => (
      <Tab
        key={date}
        className="px-4 py-2 text-sm font-medium cursor-pointer whitespace-nowrap"
        selectedClassName="text-blue-600 border-b-2 border-blue-600"
        selected={index === selectedIndex}
        onClick={() => onSelect(index)}
      >
        {date.split('年')[1].replace('月', '/').replace('日', '')}
      </Tab>
    ))}
  </TabList>
);

export default DateTabs;
