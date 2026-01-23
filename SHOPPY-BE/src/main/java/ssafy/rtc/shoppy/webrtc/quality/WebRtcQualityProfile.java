package ssafy.rtc.shoppy.webrtc.quality;

public enum WebRtcQualityProfile {
    LOW(320, 180, 15, 150),
    MEDIUM(640, 360, 24, 600),
    HIGH(1280, 720, 30, 2500);

    private final int width;
    private final int height;
    private final int maxFps;
    private final int maxBitrateKbps;

    WebRtcQualityProfile(int width, int height, int maxFps, int maxBitrateKbps) {
        this.width = width;
        this.height = height;
        this.maxFps = maxFps;
        this.maxBitrateKbps = maxBitrateKbps;
    }

    public int getWidth() {
        return width;
    }

    public int getHeight() {
        return height;
    }

    public int getMaxFps() {
        return maxFps;
    }

    public int getMaxBitrateKbps() {
        return maxBitrateKbps;
    }
}
