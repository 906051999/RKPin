import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/free-mode';

const DateTabs = React.memo(({ sortedDates, selectedIndex, onSelect, currentPage, totalPages, setDateSwiper }) => (
  <Swiper
    modules={[FreeMode]}
    slidesPerView="auto"
    freeMode={true}
    spaceBetween={10}
    className="date-tabs py-3 px-4"
    onSwiper={setDateSwiper}
  >
    {sortedDates.map((date, index) => (
      <SwiperSlide key={date} className="w-auto">
        <div
          onClick={() => onSelect(index)}
          className={`px-4 py-2 text-sm font-medium cursor-pointer whitespace-nowrap relative ${
            index === selectedIndex ? 'text-blue-600 border-b-2 border-blue-600' : ''
          }`}
        >
          <span>{date.split('年')[1].replace('月', '/').replace('日', '')}</span>
          {index === selectedIndex && (
            <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded-full">
              {currentPage}/{totalPages}
            </span>
          )}
        </div>
      </SwiperSlide>
    ))}
  </Swiper>
));

DateTabs.displayName = 'DateTabs';

export default DateTabs;
