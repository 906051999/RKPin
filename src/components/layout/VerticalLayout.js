import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Tabs, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import Card from '@/components/common/Card';
import Flickity from 'react-flickity-component';
import 'flickity/css/flickity.css';
import { debounce } from 'lodash';
import DateTabs from '@/components/vertical/DateTabs';
import DotIndicator from '@/components/vertical/DotIndicator';

export default function Vertical({ content, isLoading, isComplete, totalMessages }) {
  const [groupedMessages, setGroupedMessages] = useState({});
  const [sortedDates, setSortedDates] = useState([]);
  const [tabIndex, setTabIndex] = useState(0);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const flickityRefs = useRef({});

  useEffect(() => {
    const grouped = content.reduce((groups, message) => {
      const date = new Date(message.date).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
      if (!groups[date]) groups[date] = [];
      groups[date].push(message);
      return groups;
    }, {});
    setGroupedMessages(grouped);

    const sorted = Object.keys(grouped).sort((a, b) => new Date(b) - new Date(a));
    setSortedDates(sorted);
  }, [content]);

  const flickityOptions = {
    cellAlign: 'center',
    contain: true,
    pageDots: false,
    prevNextButtons: false,
    draggable: '>1',
    adaptiveHeight: true
  };

  const handleTabSelect = (index) => {
    setTabIndex(index);
    setActiveSlideIndex(0);
    if (flickityRefs.current[sortedDates[index]]) {
      flickityRefs.current[sortedDates[index]].select(0, false, true);
    }
  };

  const handleSlideChange = useCallback(
    debounce((index) => {
      setActiveSlideIndex(index);
    }, 150),
    []
  );

  const handleDotClick = (index) => {
    setActiveSlideIndex(index);
    if (flickityRefs.current[sortedDates[tabIndex]]) {
      flickityRefs.current[sortedDates[tabIndex]].select(index, false, true);
    }
  };

  const flickityRef = useCallback((date) => (c) => {
    if (c) {
      flickityRefs.current[date] = c;
      c.on('change', handleSlideChange);
    }
  }, [handleSlideChange]);

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* 顶部标签栏 */}
      <div className="fixed top-30 left-0 right-0 z-10 bg-white shadow-md">
        <Tabs selectedIndex={tabIndex} onSelect={handleTabSelect}>
          <DateTabs 
            sortedDates={sortedDates} 
            selectedIndex={tabIndex} 
            onSelect={handleTabSelect} 
          />
          {sortedDates[tabIndex] && (
            <DotIndicator
              messages={groupedMessages[sortedDates[tabIndex]]}
              activeSlideIndex={activeSlideIndex}
              handleDotClick={handleDotClick}
            />
          )}
        </Tabs>
      </div>

      {/* 内容区域 */}
      <div className="flex-grow overflow-y-auto mt-24">
        <Tabs selectedIndex={tabIndex} onSelect={handleTabSelect}>
          {sortedDates.map((date, index) => (
            <TabPanel key={date}>
              <Flickity
                className="w-full"
                elementType="div"
                options={flickityOptions}
                flickityRef={flickityRef(date)}
              >
                {groupedMessages[date].map((message) => (
                  <div key={message.messageId} className="w-full px-4 py-2">
                    <Card message={message} isVertical={true} />
                  </div>
                ))}
              </Flickity>
            </TabPanel>
          ))}
        </Tabs>
      </div>
    </div>
  );
}
