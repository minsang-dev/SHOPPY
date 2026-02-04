package ssafy.rtc.shoppy.vote.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataIntegrityViolationException;
import ssafy.rtc.shoppy.global.exception.BusinessException;
import ssafy.rtc.shoppy.global.exception.ErrorCode;
import ssafy.rtc.shoppy.room.entity.RoomEntity;
import ssafy.rtc.shoppy.room.enums.RoomStatus;
import ssafy.rtc.shoppy.room.repository.RoomRepository;
import ssafy.rtc.shoppy.vote.dto.*;
import ssafy.rtc.shoppy.vote.entity.VoteEntity;
import ssafy.rtc.shoppy.vote.entity.VoteOptionEntity;
import ssafy.rtc.shoppy.vote.entity.VoteParticipantEntity;
import ssafy.rtc.shoppy.vote.enums.VoteStatus;
import ssafy.rtc.shoppy.vote.event.VoteEventPublisher;
import ssafy.rtc.shoppy.vote.repository.VoteOptionRepository;
import ssafy.rtc.shoppy.vote.repository.VoteParticipantRepository;
import ssafy.rtc.shoppy.vote.repository.VoteRepository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("VoteService 테스트")
class VoteServiceTest {

    @Mock
    private VoteRepository voteRepository;

    @Mock
    private VoteOptionRepository voteOptionRepository;

    @Mock
    private VoteParticipantRepository voteParticipantRepository;

    @Mock
    private RoomRepository roomRepository;

    @Mock
    private VoteEventPublisher voteEventPublisher;

    @InjectMocks
    private VoteService voteService;

    private RoomEntity testRoom;
    private VoteEntity testVote;
    private VoteOptionEntity testOption1;
    private VoteOptionEntity testOption2;

    @BeforeEach
    void setUp() {
        // 테스트용 Room 생성 (hostId = 1L)
        testRoom = new RoomEntity(1L, 1L, "테스트 방", "ABCD1234", RoomStatus.ACTIVE, new BigDecimal("100000"), null);

        // 테스트용 Vote 생성
        testVote = new VoteEntity(1L, 1L, "점심 메뉴 투표", VoteStatus.OPEN, LocalDateTime.now(), null);

        // 테스트용 VoteOption 생성
        testOption1 = new VoteOptionEntity(1L, 1L, "한식");
        testOption2 = new VoteOptionEntity(2L, 1L, "중식");
    }

    @Nested
    @DisplayName("투표 생성 테스트")
    class CreateVoteTest {

        @Test
        @DisplayName("투표 생성 성공")
        void createVote_Success() {
            // given
            Long roomId = 1L;
            Long userId = 1L;
            VoteCreateRequestDto request = new VoteCreateRequestDto("점심 메뉴 투표", List.of("한식", "중식", "일식"));

            when(roomRepository.findById(roomId)).thenReturn(Optional.of(testRoom));
            when(voteRepository.save(any(VoteEntity.class))).thenReturn(testVote);
            when(voteOptionRepository.saveAll(anyList())).thenReturn(List.of(testOption1, testOption2));

            // when
            VoteCreateResponseDto response = voteService.createVote(roomId, userId, request);

            // then
            assertNotNull(response);
            assertEquals(testVote.getVoteId(), response.voteId());
            assertEquals(testVote.getTitle(), response.title());
            verify(voteRepository).save(any(VoteEntity.class));
            verify(voteOptionRepository).saveAll(anyList());
            verify(voteEventPublisher).publishVoteCreated(eq(roomId), any(VoteCreateResponseDto.class));
        }

        @Test
        @DisplayName("존재하지 않는 방에 투표 생성 시 ROOM_NOT_FOUND 예외 발생")
        void createVote_RoomNotFound_ThrowsException() {
            // given
            Long nonExistentRoomId = 999L;
            Long userId = 1L;
            VoteCreateRequestDto request = new VoteCreateRequestDto("테스트 투표", List.of("옵션1", "옵션2"));

            when(roomRepository.findById(nonExistentRoomId)).thenReturn(Optional.empty());

            // when & then
            BusinessException exception = assertThrows(BusinessException.class,
                    () -> voteService.createVote(nonExistentRoomId, userId, request));

            assertEquals(ErrorCode.ROOM_NOT_FOUND, exception.getErrorCode());
        }
    }

    @Nested
    @DisplayName("투표 목록 조회 테스트")
    class GetVoteListTest {

        @Test
        @DisplayName("전체 투표 목록 조회 성공")
        void getVoteList_All_Success() {
            // given
            Long roomId = 1L;
            VoteEntity closedVote = new VoteEntity(2L, 1L, "마감된 투표", VoteStatus.CLOSED, LocalDateTime.now().minusDays(1), LocalDateTime.now());

            when(roomRepository.findById(roomId)).thenReturn(Optional.of(testRoom));
            when(voteRepository.findByRoomIdOrderByCreatedAtDesc(roomId)).thenReturn(List.of(testVote, closedVote));

            // when
            VoteListResponseDto response = voteService.getVoteList(roomId, null);

            // then
            assertNotNull(response);
            assertEquals(2, response.items().size());
        }

        @Test
        @DisplayName("OPEN 상태 투표만 조회")
        void getVoteList_OpenOnly_Success() {
            // given
            Long roomId = 1L;

            when(roomRepository.findById(roomId)).thenReturn(Optional.of(testRoom));
            when(voteRepository.findByRoomIdAndStatusOrderByCreatedAtDesc(roomId, VoteStatus.OPEN))
                    .thenReturn(List.of(testVote));

            // when
            VoteListResponseDto response = voteService.getVoteList(roomId, VoteStatus.OPEN);

            // then
            assertNotNull(response);
            assertEquals(1, response.items().size());
            verify(voteRepository).findByRoomIdAndStatusOrderByCreatedAtDesc(roomId, VoteStatus.OPEN);
        }
    }

    @Nested
    @DisplayName("투표 상세 조회 테스트")
    class GetVoteDetailTest {

        @Test
        @DisplayName("투표 상세 조회 성공")
        void getVoteDetail_Success() {
            // given
            Long roomId = 1L;
            Long voteId = 1L;
            Long userId = 2L;

            when(roomRepository.findById(roomId)).thenReturn(Optional.of(testRoom));
            when(voteRepository.findById(voteId)).thenReturn(Optional.of(testVote));
            when(voteOptionRepository.findByVoteId(voteId)).thenReturn(List.of(testOption1, testOption2));
            when(voteParticipantRepository.countByVoteIdGroupByOptionId(voteId)).thenReturn(Collections.emptyList());
            when(voteParticipantRepository.findByVoteIdAndUserId(voteId, userId)).thenReturn(Optional.empty());

            // when
            VoteDetailResponseDto response = voteService.getVoteDetail(roomId, voteId, userId);

            // then
            assertNotNull(response);
            assertEquals(voteId, response.voteId());
            assertEquals(2, response.options().size());
        }

        @Test
        @DisplayName("존재하지 않는 투표 조회 시 VOTE_NOT_FOUND 예외 발생")
        void getVoteDetail_VoteNotFound_ThrowsException() {
            // given
            Long roomId = 1L;
            Long nonExistentVoteId = 999L;
            Long userId = 1L;

            when(roomRepository.findById(roomId)).thenReturn(Optional.of(testRoom));
            when(voteRepository.findById(nonExistentVoteId)).thenReturn(Optional.empty());

            // when & then
            BusinessException exception = assertThrows(BusinessException.class,
                    () -> voteService.getVoteDetail(roomId, nonExistentVoteId, userId));

            assertEquals(ErrorCode.VOTE_NOT_FOUND, exception.getErrorCode());
        }

        @Test
        @DisplayName("다른 방의 투표 조회 시 VOTE_NOT_FOUND 예외 발생")
        void getVoteDetail_WrongRoom_ThrowsException() {
            // given
            Long roomId = 2L; // 다른 방
            Long voteId = 1L;
            Long userId = 1L;

            RoomEntity anotherRoom = new RoomEntity(2L, 1L, "다른 방", "EFGH5678", RoomStatus.ACTIVE, new BigDecimal("50000"), null);

            when(roomRepository.findById(roomId)).thenReturn(Optional.of(anotherRoom));
            when(voteRepository.findById(voteId)).thenReturn(Optional.of(testVote)); // roomId = 1L

            // when & then
            BusinessException exception = assertThrows(BusinessException.class,
                    () -> voteService.getVoteDetail(roomId, voteId, userId));

            assertEquals(ErrorCode.VOTE_NOT_FOUND, exception.getErrorCode());
        }
    }

    @Nested
    @DisplayName("투표 참여 테스트")
    class ParticipateTest {

        @Test
        @DisplayName("투표 참여 성공")
        void participate_Success() {
            // given
            Long roomId = 1L;
            Long voteId = 1L;
            Long userId = 2L;
            Long optionId = 1L;
            VoteParticipateRequestDto request = new VoteParticipateRequestDto(optionId);

            VoteParticipantEntity savedParticipant = new VoteParticipantEntity(1L, voteId, optionId, userId, LocalDateTime.now());

            when(roomRepository.findById(roomId)).thenReturn(Optional.of(testRoom));
            when(voteRepository.findById(voteId)).thenReturn(Optional.of(testVote));
            when(voteOptionRepository.findById(optionId)).thenReturn(Optional.of(testOption1));
            when(voteParticipantRepository.saveAndFlush(any(VoteParticipantEntity.class))).thenReturn(savedParticipant);
            when(voteOptionRepository.findByVoteId(voteId)).thenReturn(List.of(testOption1, testOption2));
            List<Object[]> countResult = new ArrayList<>();
            countResult.add(new Object[]{1L, 1L});
            when(voteParticipantRepository.countByVoteIdGroupByOptionId(voteId)).thenReturn(countResult);
            when(voteParticipantRepository.findByVoteIdAndUserId(voteId, userId)).thenReturn(Optional.of(savedParticipant));

            // when
            VoteParticipateResponseDto response = voteService.participate(roomId, voteId, userId, request);

            // then
            assertNotNull(response);
            assertEquals(voteId, response.voteId());
            assertEquals(optionId, response.optionId());
            verify(voteEventPublisher).publishVoteParticipated(eq(roomId), any(VoteDetailResponseDto.class));
        }

        @Test
        @DisplayName("중복 투표 시 ALREADY_VOTED 예외 발생")
        void participate_Duplicate_ThrowsException() {
            // given
            Long roomId = 1L;
            Long voteId = 1L;
            Long userId = 2L;
            Long optionId = 1L;
            VoteParticipateRequestDto request = new VoteParticipateRequestDto(optionId);

            when(roomRepository.findById(roomId)).thenReturn(Optional.of(testRoom));
            when(voteRepository.findById(voteId)).thenReturn(Optional.of(testVote));
            when(voteOptionRepository.findById(optionId)).thenReturn(Optional.of(testOption1));
            when(voteParticipantRepository.saveAndFlush(any(VoteParticipantEntity.class)))
                    .thenThrow(new DataIntegrityViolationException("Duplicate entry"));

            // when & then
            BusinessException exception = assertThrows(BusinessException.class,
                    () -> voteService.participate(roomId, voteId, userId, request));

            assertEquals(ErrorCode.ALREADY_VOTED, exception.getErrorCode());
        }

        @Test
        @DisplayName("마감된 투표에 참여 시 VOTE_ALREADY_CLOSED 예외 발생")
        void participate_ClosedVote_ThrowsException() {
            // given
            Long roomId = 1L;
            Long voteId = 1L;
            Long userId = 2L;
            Long optionId = 1L;
            VoteParticipateRequestDto request = new VoteParticipateRequestDto(optionId);

            VoteEntity closedVote = new VoteEntity(1L, 1L, "마감된 투표", VoteStatus.CLOSED, LocalDateTime.now().minusDays(1), LocalDateTime.now());

            when(roomRepository.findById(roomId)).thenReturn(Optional.of(testRoom));
            when(voteRepository.findById(voteId)).thenReturn(Optional.of(closedVote));

            // when & then
            BusinessException exception = assertThrows(BusinessException.class,
                    () -> voteService.participate(roomId, voteId, userId, request));

            assertEquals(ErrorCode.VOTE_ALREADY_CLOSED, exception.getErrorCode());
        }

        @Test
        @DisplayName("존재하지 않는 옵션 선택 시 VOTE_OPTION_NOT_FOUND 예외 발생")
        void participate_OptionNotFound_ThrowsException() {
            // given
            Long roomId = 1L;
            Long voteId = 1L;
            Long userId = 2L;
            Long nonExistentOptionId = 999L;
            VoteParticipateRequestDto request = new VoteParticipateRequestDto(nonExistentOptionId);

            when(roomRepository.findById(roomId)).thenReturn(Optional.of(testRoom));
            when(voteRepository.findById(voteId)).thenReturn(Optional.of(testVote));
            when(voteOptionRepository.findById(nonExistentOptionId)).thenReturn(Optional.empty());

            // when & then
            BusinessException exception = assertThrows(BusinessException.class,
                    () -> voteService.participate(roomId, voteId, userId, request));

            assertEquals(ErrorCode.VOTE_OPTION_NOT_FOUND, exception.getErrorCode());
        }

        @Test
        @DisplayName("다른 투표의 옵션 선택 시 VOTE_OPTION_NOT_FOUND 예외 발생")
        void participate_WrongVoteOption_ThrowsException() {
            // given
            Long roomId = 1L;
            Long voteId = 1L;
            Long userId = 2L;
            Long optionId = 3L; // 다른 투표의 옵션

            VoteOptionEntity wrongOption = new VoteOptionEntity(3L, 2L, "다른 투표 옵션"); // voteId = 2L
            VoteParticipateRequestDto request = new VoteParticipateRequestDto(optionId);

            when(roomRepository.findById(roomId)).thenReturn(Optional.of(testRoom));
            when(voteRepository.findById(voteId)).thenReturn(Optional.of(testVote));
            when(voteOptionRepository.findById(optionId)).thenReturn(Optional.of(wrongOption));

            // when & then
            BusinessException exception = assertThrows(BusinessException.class,
                    () -> voteService.participate(roomId, voteId, userId, request));

            assertEquals(ErrorCode.VOTE_OPTION_NOT_FOUND, exception.getErrorCode());
        }
    }

    @Nested
    @DisplayName("투표 마감 테스트")
    class CloseVoteTest {

        @Test
        @DisplayName("호스트가 투표 마감 성공")
        void closeVote_ByHost_Success() {
            // given
            Long roomId = 1L;
            Long voteId = 1L;
            Long hostId = 1L; // testRoom의 hostId와 동일

            VoteEntity closedVote = new VoteEntity(1L, 1L, "마감된 투표", VoteStatus.CLOSED, testVote.getCreatedAt(), LocalDateTime.now());

            when(roomRepository.findById(roomId)).thenReturn(Optional.of(testRoom));
            when(voteRepository.findById(voteId)).thenReturn(Optional.of(testVote));
            when(voteRepository.save(any(VoteEntity.class))).thenReturn(closedVote);

            // when
            VoteCloseResponseDto response = voteService.closeVote(roomId, voteId, hostId);

            // then
            assertNotNull(response);
            assertEquals(VoteStatus.CLOSED, response.status());
            verify(voteEventPublisher).publishVoteClosed(eq(roomId), any(VoteCloseResponseDto.class));
        }

        @Test
        @DisplayName("호스트가 아닌 사용자가 마감 시도 시 HOST_ONLY 예외 발생")
        void closeVote_ByNonHost_ThrowsException() {
            // given
            Long roomId = 1L;
            Long voteId = 1L;
            Long nonHostId = 2L; // testRoom의 hostId(1L)와 다름

            when(roomRepository.findById(roomId)).thenReturn(Optional.of(testRoom));

            // when & then
            BusinessException exception = assertThrows(BusinessException.class,
                    () -> voteService.closeVote(roomId, voteId, nonHostId));

            assertEquals(ErrorCode.HOST_ONLY, exception.getErrorCode());
        }

        @Test
        @DisplayName("이미 마감된 투표 재마감 시 VOTE_ALREADY_CLOSED 예외 발생")
        void closeVote_AlreadyClosed_ThrowsException() {
            // given
            Long roomId = 1L;
            Long voteId = 1L;
            Long hostId = 1L;

            VoteEntity closedVote = new VoteEntity(1L, 1L, "마감된 투표", VoteStatus.CLOSED, LocalDateTime.now().minusDays(1), LocalDateTime.now());

            when(roomRepository.findById(roomId)).thenReturn(Optional.of(testRoom));
            when(voteRepository.findById(voteId)).thenReturn(Optional.of(closedVote));

            // when & then
            BusinessException exception = assertThrows(BusinessException.class,
                    () -> voteService.closeVote(roomId, voteId, hostId));

            assertEquals(ErrorCode.VOTE_ALREADY_CLOSED, exception.getErrorCode());
        }

        @Test
        @DisplayName("존재하지 않는 투표 마감 시 VOTE_NOT_FOUND 예외 발생")
        void closeVote_VoteNotFound_ThrowsException() {
            // given
            Long roomId = 1L;
            Long nonExistentVoteId = 999L;
            Long hostId = 1L;

            when(roomRepository.findById(roomId)).thenReturn(Optional.of(testRoom));
            when(voteRepository.findById(nonExistentVoteId)).thenReturn(Optional.empty());

            // when & then
            BusinessException exception = assertThrows(BusinessException.class,
                    () -> voteService.closeVote(roomId, nonExistentVoteId, hostId));

            assertEquals(ErrorCode.VOTE_NOT_FOUND, exception.getErrorCode());
        }

        @Test
        @DisplayName("다른 방의 투표 마감 시 VOTE_NOT_FOUND 예외 발생")
        void closeVote_WrongRoom_ThrowsException() {
            // given
            Long roomId = 2L;
            Long voteId = 1L;
            Long hostId = 1L;

            RoomEntity anotherRoom = new RoomEntity(2L, 1L, "다른 방", "EFGH5678", RoomStatus.ACTIVE, new BigDecimal("50000"), null);

            when(roomRepository.findById(roomId)).thenReturn(Optional.of(anotherRoom));
            when(voteRepository.findById(voteId)).thenReturn(Optional.of(testVote)); // roomId = 1L

            // when & then
            BusinessException exception = assertThrows(BusinessException.class,
                    () -> voteService.closeVote(roomId, voteId, hostId));

            assertEquals(ErrorCode.VOTE_NOT_FOUND, exception.getErrorCode());
        }
    }

    @Nested
    @DisplayName("데이터 정합성 테스트")
    class DataIntegrityTest {

        @Test
        @DisplayName("투표 참여 후 옵션별 카운트 정확성 검증")
        void participate_CountAccuracy() {
            // given
            Long roomId = 1L;
            Long voteId = 1L;
            Long userId = 2L;
            Long optionId = 1L;
            VoteParticipateRequestDto request = new VoteParticipateRequestDto(optionId);

            VoteParticipantEntity savedParticipant = new VoteParticipantEntity(1L, voteId, optionId, userId, LocalDateTime.now());

            // 옵션1에 3명, 옵션2에 2명 투표
            List<Object[]> countResults = List.of(
                    new Object[]{1L, 3L},
                    new Object[]{2L, 2L}
            );

            when(roomRepository.findById(roomId)).thenReturn(Optional.of(testRoom));
            when(voteRepository.findById(voteId)).thenReturn(Optional.of(testVote));
            when(voteOptionRepository.findById(optionId)).thenReturn(Optional.of(testOption1));
            when(voteParticipantRepository.saveAndFlush(any(VoteParticipantEntity.class))).thenReturn(savedParticipant);
            when(voteOptionRepository.findByVoteId(voteId)).thenReturn(List.of(testOption1, testOption2));
            when(voteParticipantRepository.countByVoteIdGroupByOptionId(voteId)).thenReturn(countResults);
            when(voteParticipantRepository.findByVoteIdAndUserId(voteId, userId)).thenReturn(Optional.of(savedParticipant));

            // when
            voteService.participate(roomId, voteId, userId, request);

            // then
            verify(voteParticipantRepository).countByVoteIdGroupByOptionId(voteId);
        }
    }
}
