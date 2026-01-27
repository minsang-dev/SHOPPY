package ssafy.rtc.shoppy.vote.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ssafy.rtc.shoppy.vote.entity.VoteEntity;
import ssafy.rtc.shoppy.vote.enums.VoteStatus;

import java.util.List;

@Repository
public interface VoteRepository extends JpaRepository<VoteEntity, Long> {

    List<VoteEntity> findByRoomIdOrderByCreatedAtDesc(Long roomId);

    List<VoteEntity> findByRoomIdAndStatusOrderByCreatedAtDesc(Long roomId, VoteStatus status);
}
