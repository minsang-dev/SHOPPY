package ssafy.rtc.shoppy.ai.llm.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "AiChecklist")
public class AiChecklistEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "checklist_id")
    private Long checklistId;

    @Column(name = "room_id", nullable = false, unique = true)
    private Long roomId;

    @Column(name = "status", nullable = false, length = 10)
    private String status;

    @Column(name = "generated_at", nullable = false)
    private LocalDateTime generatedAt;

    private AiChecklistEntity(Long roomId, String status, LocalDateTime generatedAt) {
        this.roomId = roomId;
        this.status = status;
        this.generatedAt = generatedAt;
    }

    private AiChecklistEntity(Long checklistId, Long roomId, String status, LocalDateTime generatedAt) {
        this.checklistId = checklistId;
        this.roomId = roomId;
        this.status = status;
        this.generatedAt = generatedAt;
    }

    public static AiChecklistEntity create(Long roomId) {
        return new AiChecklistEntity(roomId, "ACTIVE", LocalDateTime.now());
    }

    public static AiChecklistEntity withId(Long checklistId, Long roomId) {
        return new AiChecklistEntity(checklistId, roomId, "ACTIVE", LocalDateTime.now());
    }

    @PrePersist
    public void onCreate() {
        if (this.generatedAt == null) {
            this.generatedAt = LocalDateTime.now();
        }
        if (this.status == null) {
            this.status = "ACTIVE";
        }
    }
}
