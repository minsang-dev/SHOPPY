package ssafy.rtc.shoppy.settlement.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import ssafy.rtc.shoppy.ai.ocr.config.OcrProperties;
import ssafy.rtc.shoppy.ai.ocr.dto.ReceiptItemDto;
import ssafy.rtc.shoppy.ai.ocr.dto.ReceiptOcrAnalyzeData;
import ssafy.rtc.shoppy.ai.ocr.service.ReceiptOcrAnalysisService;
import ssafy.rtc.shoppy.ai.ocr.service.ReceiptOcrService;
import ssafy.rtc.shoppy.auth.repository.MemberRepository;
import ssafy.rtc.shoppy.global.exception.BusinessException;
import ssafy.rtc.shoppy.global.exception.ErrorCode;
import ssafy.rtc.shoppy.room.entity.RoomMemberEntity;
import ssafy.rtc.shoppy.room.enums.MemberStatus;
import ssafy.rtc.shoppy.room.repository.RoomMemberRepository;
import ssafy.rtc.shoppy.settlement.dto.PurchaseItemResponse;
import ssafy.rtc.shoppy.settlement.dto.PurchaseResponse;
import ssafy.rtc.shoppy.settlement.dto.ReceiptUploadResponse;
import ssafy.rtc.shoppy.settlement.dto.SettlementDraftItemRequest;
import ssafy.rtc.shoppy.settlement.dto.SettlementDraftResponse;
import ssafy.rtc.shoppy.settlement.dto.SettlementDraftUpdateRequest;
import ssafy.rtc.shoppy.settlement.dto.SettlementDraftUpdatedResponseEvent;
import ssafy.rtc.shoppy.settlement.dto.SettlementEventType;
import ssafy.rtc.shoppy.settlement.dto.SettlementItemCreateRequest;
import ssafy.rtc.shoppy.settlement.dto.SettlementItemCreateResponse;
import ssafy.rtc.shoppy.settlement.entity.ItemAllocation;
import ssafy.rtc.shoppy.settlement.entity.Purchase;
import ssafy.rtc.shoppy.settlement.entity.PurchaseItem;
import ssafy.rtc.shoppy.settlement.entity.Receipt;
import ssafy.rtc.shoppy.settlement.event.SettlementEventPublisher;
import ssafy.rtc.shoppy.settlement.repository.ItemAllocationRepository;
import ssafy.rtc.shoppy.settlement.repository.PurchaseItemRepository;
import ssafy.rtc.shoppy.settlement.repository.PurchaseRepository;
import ssafy.rtc.shoppy.settlement.repository.ReceiptRepository;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class SettlementService {

    private final PurchaseRepository purchaseRepository;
    private final PurchaseItemRepository purchaseItemRepository;
    private final ItemAllocationRepository itemAllocationRepository;
    private final RoomMemberRepository roomMemberRepository;
    private final ReceiptRepository receiptRepository;
    private final FileStorageService fileStorageService;
    private final ReceiptOcrService receiptOcrService;
    private final ReceiptOcrAnalysisService receiptOcrAnalysisService;
    private final OcrProperties ocrProperties;
    private final MemberRepository memberRepository;
    private final SettlementEventPublisher settlementEventPublisher;

    /**
     * 수동으로 정산 품목 추가
     */
    public SettlementItemCreateResponse addSettlementItem(Long receiptId, SettlementItemCreateRequest request) {
        Receipt receipt = receiptRepository.findById(receiptId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RECEIPT_NOT_FOUND));

        Purchase purchase = receipt.getPurchase();
        if (purchase == null) {
            throw new BusinessException(ErrorCode.SETTLEMENT_NOT_FOUND); 
        }

        PurchaseItem purchaseItem = PurchaseItem.builder()
                .purchase(purchase)
                .itemName(request.getItemName())
                .unitPrice(request.getUnitPrice())
                .quantity(request.getQuantity())
                .build();
        purchaseItemRepository.save(purchaseItem);

        List<RoomMemberEntity> activeMembers = roomMemberRepository.findByRoom_RoomIdAndStatus(purchase.getRoomId(), MemberStatus.ACTIVE);
        if (!activeMembers.isEmpty()) {
            calculateAndAllocate(purchaseItem, activeMembers);
        }

        return SettlementItemCreateResponse.builder()
                .settlementItemId(purchaseItem.getPurchaseItemId())
                .receiptId(receiptId)
                .itemName(purchaseItem.getItemName())
                .unitPrice(purchaseItem.getUnitPrice())
                .quantity(purchaseItem.getQuantity())
                .totalPrice(purchaseItem.getUnitPrice().multiply(BigDecimal.valueOf(purchaseItem.getQuantity())))
                .build();
    }

    /**
     * ??? ??? ??? ? Purchase ??
     */
    public ReceiptUploadResponse uploadReceipt(Long roomId, Long memberId, MultipartFile file) {
        // 1. ?? ?? (S3)
        String imageUrl = fileStorageService.storeFile(file);

        // 2. OCR ?? (AI OCR ?? ??)
        BigDecimal recognizedTotal = BigDecimal.ZERO;
        List<ReceiptItemDto> parsedItems = new ArrayList<>();
        ReceiptOcrAnalyzeData ocrData = null;
        String ocrErrorCode = null;
        String ocrErrorMessage = null;
        long ocrStartMs = System.currentTimeMillis();

        // ocr.enabled=false? OCR ?? ?? Purchase? ??
        if (ocrProperties.isEnabled()) {
            try {
                ocrData = receiptOcrService.analyze(file, false);
                if (ocrData != null && ocrData.getItems() != null) {
                    parsedItems = ocrData.getItems();
                    recognizedTotal = calculateTotal(parsedItems);
                    log.info("OCR Recognized Total: {}, Items: {}", recognizedTotal, parsedItems.size());
                }
            } catch (BusinessException e) {
                // OCR ????/???? ??? ?? ?? ??
                ocrErrorCode = e.getErrorCode().name();
                ocrErrorMessage = e.getMessage();
                log.error("OCR analysis failed for image: {}", imageUrl, e);
            } catch (Exception e) {
                ocrErrorCode = ErrorCode.OCR_502_GPT_UPSTREAM_FAIL.name();
                ocrErrorMessage = e.getMessage();
                log.error("OCR analysis failed for image: {}", imageUrl, e);
            }
        } else {
            ocrErrorCode = "OCR_DISABLED";
            ocrErrorMessage = "OCR is disabled";
        }

        Integer ocrElapsedMs = (int) (System.currentTimeMillis() - ocrStartMs);

        // 3. Purchase ??
        Purchase purchase = Purchase.builder()
                .roomId(roomId)
                .payerMemberId(memberId)
                .totalAmount(recognizedTotal)
                .status("PENDING")
                .build();
        purchaseRepository.save(purchase);

        // 4. PurchaseItem ?? ? ?? 1/N ??
        List<ReceiptUploadResponse.ItemDto> itemDtos = new ArrayList<>();
        List<RoomMemberEntity> activeMembers = roomMemberRepository.findByRoom_RoomIdAndStatus(roomId, MemberStatus.ACTIVE);

        for (ReceiptItemDto item : parsedItems) {
            PurchaseItem purchaseItem = PurchaseItem.builder()
                    .purchase(purchase)
                    .itemName(item.getName())
                    .unitPrice(toBigDecimal(item.getUnitPrice()))
                    .quantity(item.getQuantity() == null ? 1 : item.getQuantity())
                    .build();
            purchaseItemRepository.save(purchaseItem);

            if (!activeMembers.isEmpty()) {
                calculateAndAllocate(purchaseItem, activeMembers);
            }

            itemDtos.add(ReceiptUploadResponse.ItemDto.builder()
                    .itemName(item.getName())
                    .unitPrice(toBigDecimal(item.getUnitPrice()))
                    .quantity(item.getQuantity() == null ? 1 : item.getQuantity())
                    .build());
        }

        // 5. Receipt ??
        Receipt receipt = Receipt.builder()
                .purchase(purchase)
                .imageUrl(imageUrl)
                .originalFilename(file.getOriginalFilename())
                .recognizedTotal(recognizedTotal)
                .build();
        receiptRepository.save(receipt);

        // 6. OCR ?? ?? ??
        receiptOcrAnalysisService.saveAnalysis(
                receipt.getReceiptId(),
                purchase.getPurchaseId(),
                roomId,
                memberId,
                ocrData,
                ocrErrorCode,
                ocrErrorMessage,
                ocrElapsedMs
        );

        // 7. ?? ??
        return ReceiptUploadResponse.builder()
                .receiptId(receipt.getReceiptId())
                .settlementId(purchase.getPurchaseId())
                .imageUrl(imageUrl)
                .items(itemDtos)
                .build();
    }

    /**
     * ?? ???(Purchase) ?? ? ?? ??
     */
    public PurchaseResponse createSettlement(Long roomId, Long payerMemberId, BigDecimal totalAmount, List<PurchaseItemDto> itemDtos, Long currentUserId) {
        RoomMemberEntity payerMember = roomMemberRepository.findById(payerMemberId)
                .orElseThrow(() -> new BusinessException(ErrorCode.MEMBER_NOT_FOUND));

        if (payerMember.getUserId() == null || !payerMember.getUserId().equals(currentUserId)) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED_MEMBER);
        }

        Purchase purchase = Purchase.builder()
                .roomId(roomId)
                .payerMemberId(payerMemberId)
                .totalAmount(totalAmount)
                .status("PENDING")
                .build();
        purchaseRepository.save(purchase);

        List<RoomMemberEntity> members = roomMemberRepository.findByRoom_RoomIdAndStatus(roomId, MemberStatus.ACTIVE);
        if (members.isEmpty()) {
            throw new BusinessException(ErrorCode.MEMBER_NOT_FOUND);
        }

        for (PurchaseItemDto itemDto : itemDtos) {
            createPurchaseItemWithAllocations(purchase, itemDto, members);
        }

        return PurchaseResponse.from(purchase);
    }

    /**
     * 정산 draft 전체 upsert
     */
    public SettlementDraftResponse updateSettlementDraft(Long settlementId, SettlementDraftUpdateRequest request, Long userId) {
        Purchase purchase = purchaseRepository.findById(settlementId)
                .orElseThrow(() -> new BusinessException(ErrorCode.SETTLEMENT_NOT_FOUND));

        Long roomId = purchase.getRoomId();
        roomMemberRepository.findByRoom_RoomIdAndUserIdAndStatus(roomId, userId, MemberStatus.ACTIVE)
                .orElseThrow(() -> new BusinessException(ErrorCode.UNAUTHORIZED_MEMBER));

        List<RoomMemberEntity> activeMembers = roomMemberRepository.findByRoom_RoomIdAndStatus(roomId, MemberStatus.ACTIVE);
        if (activeMembers.isEmpty()) {
            throw new BusinessException(ErrorCode.MEMBER_NOT_FOUND);
        }

        List<Long> activeMemberIdList = activeMembers.stream()
                .map(RoomMemberEntity::getMemberId)
                .sorted()
                .toList();

        Set<Long> activeMemberIdSet = new HashSet<>(activeMemberIdList);

        if (request.getPayerMemberId() != null) {
            if (!activeMemberIdSet.contains(request.getPayerMemberId())) {
                throw new BusinessException(ErrorCode.INVALID_ROOM_MEMBER);
            }
            purchase.updatePayerMemberId(request.getPayerMemberId());
        }

        List<SettlementDraftItemRequest> itemRequests = request.getItems();
        if (itemRequests == null) {
            throw new BusinessException(ErrorCode.MISSING_FIELD);
        }

        Map<Long, PurchaseItem> existingItems = purchase.getPurchaseItems().stream()
                .collect(Collectors.toMap(PurchaseItem::getPurchaseItemId, item -> item));

        Set<Long> seenItemIds = new HashSet<>();
        List<PurchaseItem> orderedItems = new ArrayList<>();
        BigDecimal totalAmount = BigDecimal.ZERO;

        for (SettlementDraftItemRequest itemRequest : itemRequests) {
            PurchaseItem item;
            boolean isNewItem = itemRequest.getPurchaseItemId() == null;

            if (isNewItem) {
                item = PurchaseItem.builder()
                        .purchase(purchase)
                        .itemName(itemRequest.getItemName())
                        .unitPrice(itemRequest.getUnitPrice())
                        .quantity(itemRequest.getQuantity())
                        .build();
                purchase.addPurchaseItem(item);
                purchaseItemRepository.save(item);
            } else {
                item = existingItems.get(itemRequest.getPurchaseItemId());
                if (item == null) {
                    throw new BusinessException(ErrorCode.ITEM_NOT_FOUND);
                }
                item.updateDetails(itemRequest.getItemName(), itemRequest.getUnitPrice(), itemRequest.getQuantity());
            }

            Long payerMemberId = resolvePayerMemberId(itemRequest, request);
            String payerBankName = resolvePayerBankName(itemRequest, request);
            String payerAccountNumber = resolvePayerAccountNumber(itemRequest, request);

            if (payerMemberId != null && !activeMemberIdSet.contains(payerMemberId)) {
                throw new BusinessException(ErrorCode.INVALID_ROOM_MEMBER);
            }
            if (payerMemberId != null || payerBankName != null || payerAccountNumber != null) {
                item.updatePayer(payerMemberId, payerBankName, payerAccountNumber);
            }

            List<Long> participantIds = resolveParticipantIds(itemRequest, request, activeMemberIdList, activeMemberIdSet);
            rebuildAllocations(item, participantIds);

            if (item.getPurchaseItemId() != null) {
                seenItemIds.add(item.getPurchaseItemId());
            }
            orderedItems.add(item);

            if (item.getUnitPrice() != null) {
                totalAmount = totalAmount.add(item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity())));
            }
        }

        List<PurchaseItem> toDelete = purchase.getPurchaseItems().stream()
                .filter(existing -> existing.getPurchaseItemId() != null && !seenItemIds.contains(existing.getPurchaseItemId()))
                .toList();

        if (!toDelete.isEmpty()) {
            toDelete.forEach(purchase.getPurchaseItems()::remove);
            purchaseItemRepository.deleteAll(toDelete);
        }

        purchase.updateTotalAmount(totalAmount);

        LocalDateTime updatedAt = LocalDateTime.now();
        List<PurchaseItemResponse> responseItems = orderedItems.stream()
                .map(PurchaseItemResponse::from)
                .toList();

        SettlementDraftResponse response = SettlementDraftResponse.builder()
                .settlementId(purchase.getPurchaseId())
                .roomId(roomId)
                .updatedAt(updatedAt)
                .items(responseItems)
                .build();

        SettlementDraftUpdatedResponseEvent eventResponse = SettlementDraftUpdatedResponseEvent.builder()
                .type(SettlementEventType.SETTLEMENT_DRAFT_UPDATED)
                .roomId(roomId)
                .updatedAt(updatedAt)
                .settlementId(purchase.getPurchaseId())
                .items(responseItems)
                .build();

        settlementEventPublisher.publishSettlementDraftUpdated(roomId, eventResponse);

        return response;
    }

    private void createPurchaseItemWithAllocations(Purchase purchase, PurchaseItemDto itemDto, List<RoomMemberEntity> members) {
        PurchaseItem purchaseItem = PurchaseItem.builder()
                .purchase(purchase)
                .itemName(itemDto.getItemName())
                .unitPrice(itemDto.getUnitPrice())
                .quantity(itemDto.getQuantity())
                .build();
        purchase.addPurchaseItem(purchaseItem);
        purchaseItemRepository.save(purchaseItem);

        calculateAndAllocate(purchaseItem, members);
    }

    private void calculateAndAllocate(PurchaseItem purchaseItem, List<RoomMemberEntity> members) {
        BigDecimal totalItemPrice = purchaseItem.getUnitPrice().multiply(BigDecimal.valueOf(purchaseItem.getQuantity()));
        int participantCount = members.size();

        if (participantCount == 0) return;

        BigDecimal amountToPayPerPerson = totalItemPrice.divide(BigDecimal.valueOf(participantCount), 0, RoundingMode.FLOOR);
        BigDecimal totalUserPay = amountToPayPerPerson.multiply(BigDecimal.valueOf(participantCount));
        BigDecimal totalDiffAmount = totalItemPrice.subtract(totalUserPay);

        if (totalItemPrice.compareTo(totalUserPay.add(totalDiffAmount)) != 0) {
            throw new ArithmeticException("?? ?? ?? ??");
        }

        boolean diffAssigned = false;

        for (RoomMemberEntity member : members) {
            BigDecimal diff = BigDecimal.ZERO;
            if (!diffAssigned) {
                diff = totalDiffAmount;
                diffAssigned = true;
            }

            ItemAllocation allocation = ItemAllocation.builder()
                    .purchaseItem(purchaseItem)
                    .memberId(member.getMemberId())
                    .amountToPay(amountToPayPerPerson)
                    .diffAmount(diff)
                    .settlementStatus(0)
                    .build();

            purchaseItem.addItemAllocation(allocation);
            itemAllocationRepository.save(allocation);
        }
    }

    /**
     * ?? ?? ??
     */
    public SettlementItemCreateResponse updateSettlementItem(Long itemId, SettlementItemCreateRequest request) {
        PurchaseItem item = purchaseItemRepository.findById(itemId)
                .orElseThrow(() -> new BusinessException(ErrorCode.ITEM_NOT_FOUND));

        boolean needRecalculate = (request.getUnitPrice().compareTo(item.getUnitPrice()) != 0)
                || (request.getQuantity() != item.getQuantity());

        item.updateDetails(request.getItemName(), request.getUnitPrice(), request.getQuantity());

        if (needRecalculate) {
            List<Long> currentMemberIds = item.getItemAllocations().stream()
                    .map(ItemAllocation::getMemberId)
                    .toList();
            updateAllocations(itemId, currentMemberIds);
        }

        return SettlementItemCreateResponse.builder()
                .settlementItemId(item.getPurchaseItemId())
                .receiptId(item.getPurchase().getPurchaseId())
                .itemName(item.getItemName())
                .unitPrice(item.getUnitPrice())
                .quantity(item.getQuantity())
                .totalPrice(item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                .build();
    }

    /**
     * ?? ?? ??
     */
    public void deleteSettlementItem(Long itemId) {
        PurchaseItem item = purchaseItemRepository.findById(itemId)
                .orElseThrow(() -> new BusinessException(ErrorCode.ITEM_NOT_FOUND));

        purchaseItemRepository.delete(item);
    }

    private Long resolvePayerMemberId(SettlementDraftItemRequest itemRequest, SettlementDraftUpdateRequest request) {
        return itemRequest.getPayerMemberId() != null ? itemRequest.getPayerMemberId() : request.getPayerMemberId();
    }

    private String resolvePayerBankName(SettlementDraftItemRequest itemRequest, SettlementDraftUpdateRequest request) {
        return itemRequest.getPayerBankName() != null ? itemRequest.getPayerBankName() : request.getPayerBankName();
    }

    private String resolvePayerAccountNumber(SettlementDraftItemRequest itemRequest, SettlementDraftUpdateRequest request) {
        return itemRequest.getPayerAccountNumber() != null ? itemRequest.getPayerAccountNumber() : request.getPayerAccountNumber();
    }

    private List<Long> resolveParticipantIds(SettlementDraftItemRequest itemRequest,
                                             SettlementDraftUpdateRequest request,
                                             List<Long> activeMemberIdList,
                                             Set<Long> activeMemberIdSet) {
        List<Long> participantIds = itemRequest.getParticipantIds();
        if ((participantIds == null || participantIds.isEmpty())
                && request.getParticipantIds() != null
                && !request.getParticipantIds().isEmpty()) {
            participantIds = request.getParticipantIds();
        }

        if (participantIds == null || participantIds.isEmpty()) {
            participantIds = new ArrayList<>(activeMemberIdList);
        }

        LinkedHashSet<Long> uniqueIds = new LinkedHashSet<>(participantIds);
        if (!activeMemberIdSet.containsAll(uniqueIds)) {
            throw new BusinessException(ErrorCode.INVALID_ROOM_MEMBER);
        }
        return new ArrayList<>(uniqueIds);
    }

    private void rebuildAllocations(PurchaseItem purchaseItem, List<Long> memberIds) {
        if (purchaseItem.getPurchaseItemId() != null) {
            List<ItemAllocation> oldAllocations = itemAllocationRepository.findByPurchaseItem_PurchaseItemId(purchaseItem.getPurchaseItemId());
            itemAllocationRepository.deleteAll(oldAllocations);
        }
        purchaseItem.getItemAllocations().clear();

        if (memberIds == null || memberIds.isEmpty()) return;

        BigDecimal totalItemPrice = purchaseItem.getUnitPrice().multiply(BigDecimal.valueOf(purchaseItem.getQuantity()));
        int participantCount = memberIds.size();

        BigDecimal amountToPayPerPerson = totalItemPrice.divide(BigDecimal.valueOf(participantCount), 0, RoundingMode.FLOOR);
        BigDecimal totalUserPay = amountToPayPerPerson.multiply(BigDecimal.valueOf(participantCount));
        BigDecimal totalDiffAmount = totalItemPrice.subtract(totalUserPay);

        boolean diffAssigned = false;
        for (Long memberId : memberIds) {
            BigDecimal diff = BigDecimal.ZERO;
            if (!diffAssigned) {
                diff = totalDiffAmount;
                diffAssigned = true;
            }

            ItemAllocation allocation = ItemAllocation.builder()
                    .purchaseItem(purchaseItem)
                    .memberId(memberId)
                    .amountToPay(amountToPayPerPerson)
                    .diffAmount(diff)
                    .settlementStatus(0)
                    .build();
            purchaseItem.addItemAllocation(allocation);
            itemAllocationRepository.save(allocation);
        }
    }

    /**
     * ?? ?? ??
     */
    public void updateAllocations(Long purchaseItemId, List<Long> newMemberIds) {
        PurchaseItem purchaseItem = purchaseItemRepository.findById(purchaseItemId)
                .orElseThrow(() -> new BusinessException(ErrorCode.ITEM_NOT_FOUND));

        List<ItemAllocation> oldAllocations = itemAllocationRepository.findByPurchaseItem_PurchaseItemId(purchaseItemId);
        itemAllocationRepository.deleteAll(oldAllocations);
        purchaseItem.getItemAllocations().clear();

        BigDecimal totalItemPrice = purchaseItem.getUnitPrice().multiply(BigDecimal.valueOf(purchaseItem.getQuantity()));
        int participantCount = newMemberIds.size();

        if (participantCount == 0) return;

        BigDecimal amountToPayPerPerson = totalItemPrice.divide(BigDecimal.valueOf(participantCount), 0, RoundingMode.FLOOR);
        BigDecimal totalUserPay = amountToPayPerPerson.multiply(BigDecimal.valueOf(participantCount));
        BigDecimal totalDiffAmount = totalItemPrice.subtract(totalUserPay);

        boolean diffAssigned = false;
        for (Long memberId : newMemberIds) {
            BigDecimal diff = BigDecimal.ZERO;
            if (!diffAssigned) {
                diff = totalDiffAmount;
                diffAssigned = true;
            }

            ItemAllocation allocation = ItemAllocation.builder()
                    .purchaseItem(purchaseItem)
                    .memberId(memberId)
                    .amountToPay(amountToPayPerPerson)
                    .diffAmount(diff)
                    .settlementStatus(0)
                    .build();
            purchaseItem.addItemAllocation(allocation);
            itemAllocationRepository.save(allocation);
        }
    }

    @Transactional(readOnly = true)
    public PurchaseResponse getSettlement(Long settlementId) {
        Purchase purchase = purchaseRepository.findById(settlementId)
                .orElseThrow(() -> new BusinessException(ErrorCode.SETTLEMENT_NOT_FOUND));
        return PurchaseResponse.from(purchase);
    }

    public String completeAndGetReport(Long settlementId) {
        Purchase purchase = purchaseRepository.findById(settlementId)
                .orElseThrow(() -> new BusinessException(ErrorCode.SETTLEMENT_NOT_FOUND));
        purchase.updateStatus("COMPLETE");

        return generateReport(purchase);
    }

    private String generateReport(Purchase purchase) {
        StringBuilder sb = new StringBuilder();
        sb.append("### ?? ?? ???\n\n");

        RoomMemberEntity payerMember = roomMemberRepository.findById(purchase.getPayerMemberId())
                .orElse(null);
        String payerName = (payerMember != null) ? payerMember.getNickname() : "? ? ??";

        sb.append(String.format("- **? ?? ??**: %s?\n", purchase.getTotalAmount()));
        sb.append(String.format("- **???**: %s\n", payerName));

        if (payerMember != null && payerMember.getUserId() != null) {
            memberRepository.findById(payerMember.getUserId()).ifPresent(m -> {
                if (m.getBankName() != null && m.getAccountNumber() != null) {
                    sb.append(String.format("- **?? ??**: %s %s\n", m.getBankName(), m.getAccountNumber()));
                }
                if (m.getQrCodeUrl() != null) {
                    sb.append(String.format("- **?? QR ??**: %s\n", m.getQrCodeUrl()));
                }
            });
        }

        sb.append("\n#### [??? ?? ??]\n");
        sb.append("| ??? | ??? | ?? |\n");
        sb.append("|:---|:---|:---|\n");

        Map<Long, BigDecimal> memberTotalMap = new HashMap<>();
        Map<Long, String> nicknameMap = new HashMap<>();
        List<RoomMemberEntity> roomMembers = roomMemberRepository.findByRoom_RoomIdAndStatus(purchase.getRoomId(), MemberStatus.ACTIVE);
        for (RoomMemberEntity rm : roomMembers) {
            nicknameMap.put(rm.getMemberId(), rm.getNickname());
        }

        for (PurchaseItem item : purchase.getPurchaseItems()) {
            for (ItemAllocation allocation : item.getItemAllocations()) {
                String memberName = nicknameMap.getOrDefault(allocation.getMemberId(), "? ? ??");
                sb.append(String.format("| %s | %s | %s?|\n",
                        item.getItemName(),
                        memberName,
                        allocation.getAmountToPay()));

                memberTotalMap.merge(allocation.getMemberId(), allocation.getAmountToPay(), BigDecimal::add);
            }
        }

        sb.append("\n#### ??? ?? ???\n");
        for (Map.Entry<Long, BigDecimal> entry : memberTotalMap.entrySet()) {
            if (entry.getKey().equals(purchase.getPayerMemberId())) continue;

            String name = nicknameMap.getOrDefault(entry.getKey(), "? ? ??");
            sb.append(String.format("- **%s**: %s?\n", name, entry.getValue()));
        }

        return sb.toString();
    }

    private BigDecimal calculateTotal(List<ReceiptItemDto> items) {
        if (items == null) {
            return BigDecimal.ZERO;
        }
        BigDecimal total = BigDecimal.ZERO;
        for (ReceiptItemDto item : items) {
            if (item == null) {
                continue;
            }
            BigDecimal unitPrice = toBigDecimal(item.getUnitPrice());
            int quantity = item.getQuantity() == null ? 1 : item.getQuantity();
            total = total.add(unitPrice.multiply(BigDecimal.valueOf(quantity)));
        }
        return total;
    }

    private BigDecimal toBigDecimal(Integer value) {
        if (value == null) {
            return BigDecimal.ZERO;
        }
        return BigDecimal.valueOf(value);
    }

    @lombok.Data
    @lombok.AllArgsConstructor
    @lombok.NoArgsConstructor
    public static class PurchaseItemDto {
        private String itemName;
        private BigDecimal unitPrice;
        private int quantity;
        private Long payerMemberId;
        private String payerBankName;
        private String payerAccountNumber;
    }
}
