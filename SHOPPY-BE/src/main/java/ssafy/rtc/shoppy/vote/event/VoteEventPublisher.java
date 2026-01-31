package ssafy.rtc.shoppy.vote.event;

import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Component;
import ssafy.rtc.shoppy.vote.dto.VoteCloseResponseDto;
import ssafy.rtc.shoppy.vote.dto.VoteCreateResponseDto;
import ssafy.rtc.shoppy.vote.dto.VoteDetailResponseDto;

@Component
@RequiredArgsConstructor
public class VoteEventPublisher {

    private final ApplicationEventPublisher applicationEventPublisher;

    public void publishVoteCreated(Long roomId, VoteCreateResponseDto response) {
        applicationEventPublisher.publishEvent(new VoteCreatedEvent(roomId, response));
    }

    public void publishVoteParticipated(Long roomId, VoteDetailResponseDto voteDetail) {
        applicationEventPublisher.publishEvent(new VoteParticipatedEvent(roomId, voteDetail));
    }

    public void publishVoteClosed(Long roomId, VoteCloseResponseDto response) {
        applicationEventPublisher.publishEvent(new VoteClosedEvent(roomId, response));
    }
}
