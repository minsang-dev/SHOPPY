package ssafy.rtc.shoppy.auth.service;

public interface TokenBlacklistService {

    void blacklist(String token, long remainingMillis);

    boolean isBlacklisted(String token);
}
