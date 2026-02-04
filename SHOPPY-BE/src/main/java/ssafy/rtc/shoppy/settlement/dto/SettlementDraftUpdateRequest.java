package ssafy.rtc.shoppy.settlement.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class SettlementDraftUpdateRequest {
    private Long payerMemberId;
    private String payerBankName;
    private String payerAccountNumber;
    private List<Long> participantIds;

    @NotNull(message = "items는 필수입니다.")
    @Valid
    private List<SettlementDraftItemRequest> items;
}
