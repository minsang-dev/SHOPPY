import React from 'react';
import { useOutletContext } from 'react-router-dom';
import MobilePanelHost, { type PanelType } from '@/widgets/mobile/Mobile/MobilePanelHost';

type RoomPanelOutletContext = {
  roomId?: string;
  activePanel: PanelType;
  onEndShopping?: () => void;
};

const RoomPanelRoute: React.FC = () => {
  const { roomId, activePanel, onEndShopping } = useOutletContext<RoomPanelOutletContext>();
  return <MobilePanelHost activePanel={activePanel} roomId={roomId} onEndShopping={onEndShopping} />;
};

export default RoomPanelRoute;

