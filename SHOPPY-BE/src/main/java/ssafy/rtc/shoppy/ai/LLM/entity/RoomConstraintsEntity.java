package ssafy.rtc.shoppy.ai.llm.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import ssafy.rtc.shoppy.ai.llm.dto.RoomConstraintsRequestDto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "room_constraints")
public class RoomConstraintsEntity {

    @Id
    @Column(name = "room_id")
    private Long roomId;

    @Column(name = "purpose_code", nullable = false, length = 20)
    private String purposeCode;

    @Column(name = "people_count", nullable = false)
    private int peopleCount;

    @Column(name = "min_budget", nullable = false, precision = 12, scale = 2)
    private BigDecimal minBudget;

    @Column(name = "target_budget", nullable = false, precision = 12, scale = 2)
    private BigDecimal targetBudget;

    @Convert(converter = JsonStringListConverter.class)
    @Column(name = "interest_category_codes", nullable = false, columnDefinition = "json")
    private List<String> interestCategoryCodes;

    @Convert(converter = JsonStringListConverter.class)
    @Column(name = "trait_codes", nullable = false, columnDefinition = "json")
    private List<String> traitCodes;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    private RoomConstraintsEntity(
            Long roomId,
            String purposeCode,
            int peopleCount,
            BigDecimal minBudget,
            BigDecimal targetBudget,
            List<String> interestCategoryCodes,
            List<String> traitCodes
    ) {
        this.roomId = roomId;
        this.purposeCode = purposeCode;
        this.peopleCount = peopleCount;
        this.minBudget = minBudget;
        this.targetBudget = targetBudget;
        this.interestCategoryCodes = interestCategoryCodes;
        this.traitCodes = traitCodes;
    }

    public static RoomConstraintsEntity from(Long roomId, RoomConstraintsRequestDto constraints,
                                             BigDecimal minBudget, BigDecimal targetBudget) {
        return new RoomConstraintsEntity(
                roomId,
                constraints.purpose(),
                constraints.peopleCount(),
                minBudget,
                targetBudget,
                constraints.interestCategories(),
                constraints.traits()
        );
    }

    public Long getRoomId() {
        return roomId;
    }

    @PrePersist
    public void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
