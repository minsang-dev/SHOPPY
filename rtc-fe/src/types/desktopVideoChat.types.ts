export type VideoChatMode = 'personal' | 'host';

export type RightPanelType = 'cart' | 'participants' | 'vote' | 'chat';

// interface = 컴포넌트에게 전달할 리스트: 보통 컴포넌트 뒤에 Props 붙여 작명
// 화상채팅 페이지의 상단바
export interface DesktopVideoChatHeaderProps {
  mode: VideoChatMode;
  // 모드변경 함수: 바꿀 모드 이름이 필요함
  // 함수명 : 입력 인자 => 결과값 타입
  onModeChange: (mode: VideoChatMode) => void;
  // 나가기 함수: 바로 실행. 별도의 인자 필요X 
  onExit: () => void;
  activePanel: RightPanelType;
  // 패널 여닫기 함수: 패널 아이콘을 누르면 실행할 함수
  onPanelToggle: (panel: RightPanelType) => void;
}

// 화상채팅 페이지의 재사용성 높이기 위해 정의
// ex1.컴포넌트 안쪽에 <div className="bg-red">는 재사용 못함.
// ex2. 재사용 위해 이렇게 
// function DesktopVideoChatPage({ className }) {
//     return <div className={className}> 채팅 페이지 </div>; 
//   }
export interface DesktopVideoChatPageProps {
  className?: string;
}
