package ssafy.rtc.shoppy.room.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ssafy.rtc.shoppy.global.exception.BusinessException;
import ssafy.rtc.shoppy.global.exception.ErrorCode;
import ssafy.rtc.shoppy.room.domain.Room;
import ssafy.rtc.shoppy.room.entity.RoomEntity;
import ssafy.rtc.shoppy.room.enums.SyncMode;
import ssafy.rtc.shoppy.room.repository.RoomRepository;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RoomService {

    private final RoomRepository roomRepository;

    @Transactional
    public Room createRoom(String roomName, BigDecimal targetBudget, SyncMode syncMode, Long hostId) {
        Room room = Room.create(hostId, roomName, targetBudget, syncMode);

        RoomEntity roomEntity = RoomEntity.fromDomain(room);
        RoomEntity savedEntity = roomRepository.save(roomEntity);

        return savedEntity.toDomain();
    }

    public Room getRoomById(Long roomId) {
        RoomEntity roomEntity = roomRepository.findById(roomId)
                .orElseThrow(() -> new BusinessException(ErrorCode.ROOM_NOT_FOUND));

        return roomEntity.toDomain();
    }

    public Room getRoomByCode(String roomCode) {
        RoomEntity roomEntity = roomRepository.findByRoomCode(roomCode)
                .orElseThrow(() -> new BusinessException(ErrorCode.ROOM_NOT_FOUND));

        return roomEntity.toDomain();
    }

    @Transactional
    public void updateSyncMode(Long roomId, Long requestUserId, SyncMode syncMode) {
        RoomEntity roomEntity = roomRepository.findById(roomId)
                .orElseThrow(() -> new BusinessException(ErrorCode.ROOM_NOT_FOUND));

        Room room = roomEntity.toDomain();

        if (!room.isHost(requestUserId)) {
            throw new BusinessException(ErrorCode.HOST_ONLY);
        }

        Room updatedRoom = room.updateSyncMode(syncMode);
        RoomEntity updatedEntity = RoomEntity.fromDomain(updatedRoom);
        roomRepository.save(updatedEntity);
    }

    @Transactional
    public void updateHostCurrentUrl(Long roomId, Long requestUserId, String currentUrl) {
        if (currentUrl == null || currentUrl.isBlank()) {
            throw new BusinessException(ErrorCode.HOST_URL_REQUIRED);
        }

        RoomEntity roomEntity = roomRepository.findById(roomId)
                .orElseThrow(() -> new BusinessException(ErrorCode.ROOM_NOT_FOUND));

        Room room = roomEntity.toDomain();

        if (!room.isHost(requestUserId)) {
            throw new BusinessException(ErrorCode.HOST_ONLY);
        }

        if (room.getSyncMode() != SyncMode.FOLLOW) {
            throw new BusinessException(ErrorCode.SYNC_MODE_NOT_FOLLOW);
        }

        Room updatedRoom = room.updateHostCurrentUrl(currentUrl);
        RoomEntity updatedEntity = RoomEntity.fromDomain(updatedRoom);
        roomRepository.save(updatedEntity);
    }

    @Transactional
    public void closeRoom(Long roomId, Long requestUserId) {
        RoomEntity roomEntity = roomRepository.findById(roomId)
                .orElseThrow(() -> new BusinessException(ErrorCode.ROOM_NOT_FOUND));

        Room room = roomEntity.toDomain();

        if (!room.isHost(requestUserId)) {
            throw new BusinessException(ErrorCode.HOST_ONLY);
        }

        Room closedRoom = room.close();
        RoomEntity updatedEntity = RoomEntity.fromDomain(closedRoom);
        roomRepository.save(updatedEntity);
    }
}
