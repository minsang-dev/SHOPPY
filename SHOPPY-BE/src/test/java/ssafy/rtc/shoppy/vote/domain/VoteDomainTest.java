package ssafy.rtc.shoppy.vote.domain;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import ssafy.rtc.shoppy.vote.enums.VoteStatus;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("Vote 도메인 모델 테스트")
class VoteDomainTest {

    @Nested
    @DisplayName("Vote 생성 테스트")
    class VoteCreateTest {

        @Test
        @DisplayName("Vote.create() - 초기 상태는 OPEN")
        void create_InitialStatusIsOpen() {
            // given
            Long roomId = 1L;
            String title = "점심 메뉴 투표";

            // when
            Vote vote = Vote.create(roomId, title);

            // then
            assertNull(vote.getVoteId()); // 저장 전이므로 null
            assertEquals(roomId, vote.getRoomId());
            assertEquals(title, vote.getTitle());
            assertEquals(VoteStatus.OPEN, vote.getStatus());
            assertNull(vote.getCreatedAt()); // 저장 전이므로 null
            assertNull(vote.getClosedAt());
        }

        @Test
        @DisplayName("Vote.from() - 저장된 데이터로 복원")
        void from_RestoreFromSavedData() {
            // given
            Long voteId = 1L;
            Long roomId = 1L;
            String title = "점심 메뉴 투표";
            VoteStatus status = VoteStatus.OPEN;
            LocalDateTime createdAt = LocalDateTime.now();
            LocalDateTime closedAt = null;

            // when
            Vote vote = Vote.from(voteId, roomId, title, status, createdAt, closedAt);

            // then
            assertEquals(voteId, vote.getVoteId());
            assertEquals(roomId, vote.getRoomId());
            assertEquals(title, vote.getTitle());
            assertEquals(status, vote.getStatus());
            assertEquals(createdAt, vote.getCreatedAt());
            assertNull(vote.getClosedAt());
        }
    }

    @Nested
    @DisplayName("Vote 마감 테스트")
    class VoteCloseTest {

        @Test
        @DisplayName("close() - 상태가 CLOSED로 변경됨")
        void close_StatusChangesToClosed() {
            // given
            Vote openVote = Vote.from(1L, 1L, "테스트 투표", VoteStatus.OPEN, LocalDateTime.now(), null);

            // when
            Vote closedVote = openVote.close();

            // then
            assertEquals(VoteStatus.CLOSED, closedVote.getStatus());
            assertNotNull(closedVote.getClosedAt());
        }

        @Test
        @DisplayName("close() - 불변 객체 확인 (원본 변경 없음)")
        void close_ImmutableObject() {
            // given
            Vote openVote = Vote.from(1L, 1L, "테스트 투표", VoteStatus.OPEN, LocalDateTime.now(), null);

            // when
            Vote closedVote = openVote.close();

            // then
            assertNotSame(openVote, closedVote);
            assertEquals(VoteStatus.OPEN, openVote.getStatus()); // 원본은 여전히 OPEN
            assertEquals(VoteStatus.CLOSED, closedVote.getStatus());
        }

        @Test
        @DisplayName("close() - 기존 정보 유지")
        void close_PreservesExistingData() {
            // given
            Long voteId = 1L;
            Long roomId = 1L;
            String title = "테스트 투표";
            LocalDateTime createdAt = LocalDateTime.now().minusHours(1);

            Vote openVote = Vote.from(voteId, roomId, title, VoteStatus.OPEN, createdAt, null);

            // when
            Vote closedVote = openVote.close();

            // then
            assertEquals(voteId, closedVote.getVoteId());
            assertEquals(roomId, closedVote.getRoomId());
            assertEquals(title, closedVote.getTitle());
            assertEquals(createdAt, closedVote.getCreatedAt());
        }
    }

    @Nested
    @DisplayName("Vote 상태 확인 테스트")
    class VoteStatusCheckTest {

        @Test
        @DisplayName("isOpen() - OPEN 상태일 때 true")
        void isOpen_WhenOpen_ReturnsTrue() {
            // given
            Vote openVote = Vote.from(1L, 1L, "테스트 투표", VoteStatus.OPEN, LocalDateTime.now(), null);

            // when & then
            assertTrue(openVote.isOpen());
        }

        @Test
        @DisplayName("isOpen() - CLOSED 상태일 때 false")
        void isOpen_WhenClosed_ReturnsFalse() {
            // given
            Vote closedVote = Vote.from(1L, 1L, "테스트 투표", VoteStatus.CLOSED, LocalDateTime.now(), LocalDateTime.now());

            // when & then
            assertFalse(closedVote.isOpen());
        }
    }

    @Nested
    @DisplayName("VoteOption 테스트")
    class VoteOptionTest {

        @Test
        @DisplayName("VoteOption.create() - 새 옵션 생성")
        void create_NewOption() {
            // given
            Long voteId = 1L;
            String content = "한식";

            // when
            VoteOption option = VoteOption.create(voteId, content);

            // then
            assertNull(option.getOptionId()); // 저장 전
            assertEquals(voteId, option.getVoteId());
            assertEquals(content, option.getContent());
        }

        @Test
        @DisplayName("VoteOption.from() - 저장된 데이터로 복원")
        void from_RestoreFromSavedData() {
            // given
            Long optionId = 1L;
            Long voteId = 1L;
            String content = "한식";

            // when
            VoteOption option = VoteOption.from(optionId, voteId, content);

            // then
            assertEquals(optionId, option.getOptionId());
            assertEquals(voteId, option.getVoteId());
            assertEquals(content, option.getContent());
        }
    }

    @Nested
    @DisplayName("VoteParticipant 테스트")
    class VoteParticipantTest {

        @Test
        @DisplayName("VoteParticipant.create() - 새 참여 기록 생성")
        void create_NewParticipant() {
            // given
            Long voteId = 1L;
            Long optionId = 1L;
            Long userId = 1L;

            // when
            VoteParticipant participant = VoteParticipant.create(voteId, optionId, userId);

            // then
            assertNull(participant.getVoteParticipantId()); // 저장 전
            assertEquals(voteId, participant.getVoteId());
            assertEquals(optionId, participant.getOptionId());
            assertEquals(userId, participant.getUserId());
            assertNull(participant.getVotedAt()); // 저장 전
        }

        @Test
        @DisplayName("VoteParticipant.from() - 저장된 데이터로 복원")
        void from_RestoreFromSavedData() {
            // given
            Long participantId = 1L;
            Long voteId = 1L;
            Long optionId = 1L;
            Long userId = 1L;
            LocalDateTime votedAt = LocalDateTime.now();

            // when
            VoteParticipant participant = VoteParticipant.from(participantId, voteId, optionId, userId, votedAt);

            // then
            assertEquals(participantId, participant.getVoteParticipantId());
            assertEquals(voteId, participant.getVoteId());
            assertEquals(optionId, participant.getOptionId());
            assertEquals(userId, participant.getUserId());
            assertEquals(votedAt, participant.getVotedAt());
        }
    }
}
