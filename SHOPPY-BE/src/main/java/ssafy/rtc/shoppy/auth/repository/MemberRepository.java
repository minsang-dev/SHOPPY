package ssafy.rtc.shoppy.auth.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ssafy.rtc.shoppy.auth.entity.Member;

import java.util.Optional;

public interface MemberRepository extends JpaRepository<Member, Long> {

    Optional<Member> findByOauthIdAndProvider(String oauthId, String provider);

    Optional<Member> findByRefreshToken(String refreshToken);
}
