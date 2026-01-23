package ssafy.rtc.shoppy.room.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
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
}
