package ssafy.rtc.shoppy.vote.service;

import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ssafy.rtc.shoppy.global.exception.BusinessException;
import ssafy.rtc.shoppy.global.exception.ErrorCode;
import ssafy.rtc.shoppy.room.domain.Room;
import ssafy.rtc.shoppy.room.entity.RoomEntity;
import ssafy.rtc.shoppy.room.repository.RoomRepository;
import ssafy.rtc.shoppy.vote.domain.Vote;
import ssafy.rtc.shoppy.vote.domain.VoteOption;
import ssafy.rtc.shoppy.vote.domain.VoteParticipant;
import ssafy.rtc.shoppy.vote.dto.*;
import ssafy.rtc.shoppy.vote.entity.VoteEntity;
import ssafy.rtc.shoppy.vote.entity.VoteOptionEntity;
import ssafy.rtc.shoppy.vote.entity.VoteParticipantEntity;
import ssafy.rtc.shoppy.vote.enums.VoteStatus;
import ssafy.rtc.shoppy.vote.event.VoteEventPublisher;
import ssafy.rtc.shoppy.vote.repository.VoteOptionRepository;
import ssafy.rtc.shoppy.vote.repository.VoteParticipantRepository;
import ssafy.rtc.shoppy.vote.repository.VoteRepository;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class VoteService {

    private final VoteRepository voteRepository;
    private final VoteOptionRepository voteOptionRepository;
    private final VoteParticipantRepository voteParticipantRepository;
    private final RoomRepository roomRepository;
    private final VoteEventPublisher voteEventPublisher;

    @Transactional
    public VoteCreateResponseDto createVote(Long roomId, Long userId, VoteCreateRequestDto request) {
        Room room = getRoomById(roomId);

        if (!room.isHost(userId)) {
            throw new BusinessException(ErrorCode.HOST_ONLY);
        }

        Vote vote = Vote.create(roomId, request.title());
        VoteEntity voteEntity = VoteEntity.fromDomain(vote);
        VoteEntity savedVoteEntity = voteRepository.save(voteEntity);
        Vote savedVote = savedVoteEntity.toDomain();

        List<VoteOptionEntity> optionEntities = request.options().stream()
                .map(content -> {
                    VoteOption option = VoteOption.create(savedVote.getVoteId(), content);
                    return VoteOptionEntity.fromDomain(option);
                })
                .toList();

        List<VoteOptionEntity> savedOptionEntities = voteOptionRepository.saveAll(optionEntities);
        List<VoteOption> savedOptions = savedOptionEntities.stream()
                .map(VoteOptionEntity::toDomain)
                .toList();

        VoteCreateResponseDto response = VoteCreateResponseDto.from(savedVote, savedOptions);
        voteEventPublisher.publishVoteCreated(roomId, response);

        return response;
    }

    public VoteListResponseDto getVoteList(Long roomId, VoteStatus status) {
        getRoomById(roomId);

        List<VoteEntity> voteEntities;
        if (status != null) {
            voteEntities = voteRepository.findByRoomIdAndStatusOrderByCreatedAtDesc(roomId, status);
        } else {
            voteEntities = voteRepository.findByRoomIdOrderByCreatedAtDesc(roomId);
        }

        List<Vote> votes = voteEntities.stream()
                .map(VoteEntity::toDomain)
                .toList();

        return VoteListResponseDto.from(votes);
    }

    public VoteDetailResponseDto getVoteDetail(Long roomId, Long voteId, Long userId) {
        getRoomById(roomId);

        VoteEntity voteEntity = voteRepository.findById(voteId)
                .orElseThrow(() -> new BusinessException(ErrorCode.VOTE_NOT_FOUND));

        if (!voteEntity.getRoomId().equals(roomId)) {
            throw new BusinessException(ErrorCode.VOTE_NOT_FOUND);
        }

        Vote vote = voteEntity.toDomain();

        return buildVoteDetail(vote, voteId, userId);
    }

    @Transactional
    public VoteParticipateResponseDto participate(Long roomId, Long voteId, Long userId, VoteParticipateRequestDto request) {
        getRoomById(roomId);

        VoteEntity voteEntity = voteRepository.findById(voteId)
                .orElseThrow(() -> new BusinessException(ErrorCode.VOTE_NOT_FOUND));

        if (!voteEntity.getRoomId().equals(roomId)) {
            throw new BusinessException(ErrorCode.VOTE_NOT_FOUND);
        }

        Vote vote = voteEntity.toDomain();

        if (!vote.isOpen()) {
            throw new BusinessException(ErrorCode.VOTE_ALREADY_CLOSED);
        }

        VoteOptionEntity optionEntity = voteOptionRepository.findById(request.optionId())
                .orElseThrow(() -> new BusinessException(ErrorCode.VOTE_OPTION_NOT_FOUND));

        if (!optionEntity.getVoteId().equals(voteId)) {
            throw new BusinessException(ErrorCode.VOTE_OPTION_NOT_FOUND);
        }

        VoteParticipant participant = VoteParticipant.create(voteId, request.optionId(), userId);
        VoteParticipantEntity participantEntity = VoteParticipantEntity.fromDomain(participant);

        VoteParticipantEntity savedEntity;
        try {
            savedEntity = voteParticipantRepository.saveAndFlush(participantEntity);
        } catch (DataIntegrityViolationException e) {
            throw new BusinessException(ErrorCode.ALREADY_VOTED);
        }

        VoteDetailResponseDto voteDetail = buildVoteDetail(vote, voteId, userId);
        voteEventPublisher.publishVoteParticipated(roomId, voteDetail);

        return VoteParticipateResponseDto.from(savedEntity.toDomain());
    }

    @Transactional
    public VoteCloseResponseDto closeVote(Long roomId, Long voteId, Long userId) {
        Room room = getRoomById(roomId);

        if (!room.isHost(userId)) {
            throw new BusinessException(ErrorCode.HOST_ONLY);
        }

        VoteEntity voteEntity = voteRepository.findById(voteId)
                .orElseThrow(() -> new BusinessException(ErrorCode.VOTE_NOT_FOUND));

        if (!voteEntity.getRoomId().equals(roomId)) {
            throw new BusinessException(ErrorCode.VOTE_NOT_FOUND);
        }

        Vote vote = voteEntity.toDomain();

        if (!vote.isOpen()) {
            throw new BusinessException(ErrorCode.VOTE_ALREADY_CLOSED);
        }

        Vote closedVote = vote.close();
        VoteEntity closedEntity = VoteEntity.fromDomain(closedVote);
        VoteEntity savedEntity = voteRepository.save(closedEntity);

        VoteCloseResponseDto response = VoteCloseResponseDto.from(savedEntity.toDomain());
        voteEventPublisher.publishVoteClosed(roomId, response);

        return response;
    }

    private Room getRoomById(Long roomId) {
        RoomEntity roomEntity = roomRepository.findById(roomId)
                .orElseThrow(() -> new BusinessException(ErrorCode.ROOM_NOT_FOUND));
        return roomEntity.toDomain();
    }

    private VoteDetailResponseDto buildVoteDetail(Vote vote, Long voteId, Long userId) {
        List<VoteOptionEntity> optionEntities = voteOptionRepository.findByVoteId(voteId);

        Map<Long, Long> countByOptionId = voteParticipantRepository.countByVoteIdGroupByOptionId(voteId)
                .stream()
                .collect(Collectors.toMap(
                        row -> (Long) row[0],
                        row -> (Long) row[1]
                ));

        List<VoteOptionWithCountDto> optionsWithCount = optionEntities.stream()
                .map(optionEntity -> {
                    VoteOption option = optionEntity.toDomain();
                    long count = countByOptionId.getOrDefault(option.getOptionId(), 0L);
                    return VoteOptionWithCountDto.from(option, count);
                })
                .toList();

        Long mySelectedOptionId = voteParticipantRepository.findByVoteIdAndUserId(voteId, userId)
                .map(VoteParticipantEntity::getOptionId)
                .orElse(null);

        return VoteDetailResponseDto.from(vote, optionsWithCount, mySelectedOptionId);
    }
}
