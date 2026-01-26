package ssafy.rtc.shoppy.ai.llm.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "AiChecklistItem")
public class AiChecklistItemEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "checklist_item_id")
    private Long checklistItemId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "checklist_id", nullable = false)
    private AiChecklistEntity checklist;

    @Column(name = "category_code", nullable = false, length = 30)
    private String categoryCode;

    @Column(name = "item_name", nullable = false, length = 255)
    private String itemName;

    @Column(name = "reason", length = 255)
    private String reason;

    @Column(name = "is_checked", nullable = false)
    private boolean isChecked;

    @Column(name = "sort_order")
    private Integer sortOrder;

    private AiChecklistItemEntity(
            AiChecklistEntity checklist,
            String categoryCode,
            String itemName,
            String reason,
            boolean isChecked,
            Integer sortOrder
    ) {
        this.checklist = checklist;
        this.categoryCode = categoryCode;
        this.itemName = itemName;
        this.reason = reason;
        this.isChecked = isChecked;
        this.sortOrder = sortOrder;
    }

    public static AiChecklistItemEntity create(
            AiChecklistEntity checklist,
            String categoryCode,
            String itemName,
            String reason,
            Integer sortOrder
    ) {
        return new AiChecklistItemEntity(checklist, categoryCode, itemName, reason, false, sortOrder);
    }

    public void updateChecked(boolean checked) {
        this.isChecked = checked;
    }
}
