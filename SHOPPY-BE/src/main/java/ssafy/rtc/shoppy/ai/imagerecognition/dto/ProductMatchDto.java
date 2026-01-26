package ssafy.rtc.shoppy.ai.imagerecognition.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductMatchDto {
    private String brand;
    private String productAlias;
    private String category;
    private String matchSource;
    private String candidateValue;
}
