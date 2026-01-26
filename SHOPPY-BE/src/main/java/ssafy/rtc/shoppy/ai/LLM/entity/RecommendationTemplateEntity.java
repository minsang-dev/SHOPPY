package ssafy.rtc.shoppy.ai.llm.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "RecommendationTemplate")
public class RecommendationTemplateEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "template_id")
    private Long templateId;

    @Column(name = "purpose_code", length = 20)
    private String purposeCode;

    @Column(name = "category_code", nullable = false, length = 30)
    private String categoryCode;

    @Column(name = "item_name", nullable = false, length = 255)
    private String itemName;

    @Convert(converter = JsonStringListConverter.class)
    @Column(name = "trait_excludes", columnDefinition = "json")
    private List<String> traitExcludes;

    @Column(name = "priority", nullable = false)
    private int priority;

    @Column(name = "is_active", nullable = false)
    private boolean isActive;

    private RecommendationTemplateEntity(
            String purposeCode,
            String categoryCode,
            String itemName,
            List<String> traitExcludes,
            int priority,
            boolean isActive
    ) {
        this.purposeCode = purposeCode;
        this.categoryCode = categoryCode;
        this.itemName = itemName;
        this.traitExcludes = traitExcludes;
        this.priority = priority;
        this.isActive = isActive;
    }

    public static RecommendationTemplateEntity create(
            String categoryCode,
            String itemName,
            List<String> traitExcludes,
            int priority
    ) {
        return new RecommendationTemplateEntity(null, categoryCode, itemName, traitExcludes, priority, true);
    }
}
