package ssafy.rtc.shoppy.vote.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import ssafy.rtc.shoppy.vote.entity.VoteParticipantEntity;

import java.util.List;
import java.util.Optional;

@Repository
public interface VoteParticipantRepository extends JpaRepository<VoteParticipantEntity, Long> {

    Optional<VoteParticipantEntity> findByVoteIdAndUserId(Long voteId, Long userId);

    List<VoteParticipantEntity> findByVoteId(Long voteId);

    long countByOptionId(Long optionId);

    boolean existsByVoteIdAndUserId(Long voteId, Long userId);

    @Query("SELECT p.optionId, COUNT(p) FROM VoteParticipantEntity p WHERE p.voteId = :voteId GROUP BY p.optionId")
    List<Object[]> countByVoteIdGroupByOptionId(@Param("voteId") Long voteId);
}
