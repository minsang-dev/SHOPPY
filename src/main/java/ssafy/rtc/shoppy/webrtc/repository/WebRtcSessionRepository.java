package ssafy.rtc.shoppy.webrtc.repository;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import ssafy.rtc.shoppy.webrtc.repository.entity.WebRtcSessionEntity;

public interface WebRtcSessionRepository extends JpaRepository<WebRtcSessionEntity, Long> {
    Optional<WebRtcSessionEntity> findByRoomId(Long roomId);
}
