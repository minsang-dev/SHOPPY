package ssafy.rtc.shoppy.webrtc.service;

import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ssafy.rtc.shoppy.webrtc.domain.WebRtcSession;
import ssafy.rtc.shoppy.webrtc.repository.WebRtcSessionRepository;
import ssafy.rtc.shoppy.webrtc.repository.entity.WebRtcSessionEntity;

@Service
@RequiredArgsConstructor
public class WebRtcSessionService {

    private final WebRtcSessionRepository webRtcSessionRepository;

    @Transactional
    public WebRtcSession createSession(Long roomId) {
        WebRtcSession session = WebRtcSession.create(roomId);
        WebRtcSessionEntity saved = webRtcSessionRepository.save(WebRtcSessionEntity.from(session));
        return saved.toDomain();
    }

    @Transactional
    public WebRtcSession createSession(Long roomId, int maxParticipants) {
        WebRtcSession session = WebRtcSession.of(null, roomId, maxParticipants);
        WebRtcSessionEntity saved = webRtcSessionRepository.save(WebRtcSessionEntity.from(session));
        return saved.toDomain();
    }

    @Transactional(readOnly = true)
    public Optional<WebRtcSession> findByRoomId(Long roomId) {
        return webRtcSessionRepository.findByRoomId(roomId).map(WebRtcSessionEntity::toDomain);
    }

    @Transactional
    public WebRtcSession getOrCreate(Long roomId) {
        return findByRoomId(roomId).orElseGet(() -> createSession(roomId));
    }

    @Transactional
    public WebRtcSession getOrCreate(Long roomId, int maxParticipants) {
        return findByRoomId(roomId).orElseGet(() -> createSession(roomId, maxParticipants));
    }
}
