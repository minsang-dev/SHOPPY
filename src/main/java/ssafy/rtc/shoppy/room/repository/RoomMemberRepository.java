package ssafy.rtc.shoppy.room.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ssafy.rtc.shoppy.room.entity.RoomMemberEntity;
import ssafy.rtc.shoppy.room.enums.MemberStatus;

import java.util.List;

@Repository
public interface RoomMemberRepository extends JpaRepository<RoomMemberEntity, Long> {
    List<RoomMemberEntity> findByRoom_RoomIdAndStatus(Long roomId, MemberStatus status);
}
