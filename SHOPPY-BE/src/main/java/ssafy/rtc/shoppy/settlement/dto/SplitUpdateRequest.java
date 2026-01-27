package ssafy.rtc.shoppy.settlement.dto;

import lombok.Data;
import java.util.List;

@Data
public class SplitUpdateRequest {
    private List<Long> memberIds;
}
