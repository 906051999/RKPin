import { useState } from 'react';
import ThumbnailCard from './ThumbnailCard';
import FullDataCard from './FullDataCard';
import { TextThumbnail, TextFullContent } from './types/Text';
import { MusicThumbnail, MusicFullContent } from './types/Music';
import { DefaultThumbnail, DefaultFullContent } from './types/Default';

const typeComponents = {
  text: { Thumbnail: TextThumbnail, FullContent: TextFullContent },
  music: { Thumbnail: MusicThumbnail, FullContent: MusicFullContent },
  default: { Thumbnail: DefaultThumbnail, FullContent: DefaultFullContent },
};

export default function Card({ type, data }) {
  const [isOpen, setIsOpen] = useState(false);
  const togglePopCard = () => setIsOpen(prev => !prev);

  const { Thumbnail, FullContent } = typeComponents[type] || typeComponents.default;

  return (
    <>
      <ThumbnailCard data={data} onClick={togglePopCard} TypeSpecificContent={Thumbnail} />
      {isOpen && (
        <FullDataCard data={data} onClose={togglePopCard} TypeSpecificContent={FullContent} />
      )}
    </>
  );
}