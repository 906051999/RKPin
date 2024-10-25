import React, { useState, useEffect, useCallback } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Virtual } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/virtual';
import DateTabs from '@/components/vertical/DateTabs';
import VerticalCard from '@/components/vertical/VerticalCard';

export default function Vertical({ content, isLoading, isComplete, totalMessages }) {
  const [groupedMessages, setGroupedMessages] = useState({});
  const [sortedDates, setSortedDates] = useState([]);
  const [tabIndex, setTabIndex] = useState(0);
  const [activeUniqueId, setActiveUniqueId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [dateSwiper, setDateSwiper] = useState(null);
  const [contentSwiper, setContentSwiper] = useState(null);
  const [flattenedMessages, setFlattenedMessages] = useState([]);
  const [currentDateIndex, setCurrentDateIndex] = useState(0);

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

    const flattened = sorted.flatMap(date => grouped[date]);
    setFlattenedMessages(flattened);

    if (sorted.length > 0 && grouped[sorted[0]].length > 0) {
      setActiveUniqueId(grouped[sorted[0]][0].uniqueId);
    }
  }, [content]);

  const handleTabSelect = useCallback((index) => {
    setCurrentDateIndex(index);
    if (contentSwiper) {
      const startIndex = sortedDates.slice(0, index).reduce((sum, date) => sum + groupedMessages[date].length, 0);
      contentSwiper.slideTo(startIndex);
    }
  }, [contentSwiper, sortedDates, groupedMessages]);

  const handleSlideChange = useCallback((swiper) => {
    const currentMessageIndex = swiper.activeIndex;
    let newDateIndex = 0;
    let messagesCount = 0;

    for (let i = 0; i < sortedDates.length; i++) {
      messagesCount += groupedMessages[sortedDates[i]].length;
      if (currentMessageIndex < messagesCount) {
        newDateIndex = i;
        break;
      }
    }

    if (newDateIndex !== currentDateIndex) {
      setCurrentDateIndex(newDateIndex);
      if (dateSwiper) {
        dateSwiper.slideTo(newDateIndex);
      }
    }

    setCurrentPage(currentMessageIndex - (messagesCount - groupedMessages[sortedDates[newDateIndex]].length) + 1);
    setActiveUniqueId(flattenedMessages[currentMessageIndex].uniqueId);
  }, [sortedDates, groupedMessages, flattenedMessages, dateSwiper, currentDateIndex]);

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <div className="fixed top-30 left-0 right-0 z-10 bg-white shadow-md">
        <DateTabs 
          sortedDates={sortedDates} 
          selectedIndex={currentDateIndex} 
          onSelect={handleTabSelect}
          currentPage={currentPage}
          totalPages={groupedMessages[sortedDates[currentDateIndex]]?.length || 0}
          setDateSwiper={setDateSwiper}
        />
      </div>

      <div className="flex-grow overflow-hidden mt-10">
        <Swiper
          modules={[Pagination, Virtual]}
          direction="horizontal"
          slidesPerView={1}
          spaceBetween={30}
          onSlideChange={handleSlideChange}
          onSwiper={setContentSwiper}
          virtual={{
            enabled: true,
            addSlidesAfter: 1,
            addSlidesBefore: 1,
          }}
          className="h-full"
        >
          {flattenedMessages.map((message, index) => (
            <SwiperSlide key={message.uniqueId} virtualIndex={index} className="overflow-y-auto">
              <div className="h-full px-4 py-2 mt-5">
                <VerticalCard message={message} />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
}
