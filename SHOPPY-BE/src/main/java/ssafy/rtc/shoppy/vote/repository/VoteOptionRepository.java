package ssafy.rtc.shoppy.vote.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ssafy.rtc.shoppy.vote.entity.VoteOptionEntity;

import java.util.List;

@Repository
public interface VoteOptionRepository extends JpaRepository<VoteOptionEntity, Long> {

    List<VoteOptionEntity> findByVoteId(Long voteId);
}
