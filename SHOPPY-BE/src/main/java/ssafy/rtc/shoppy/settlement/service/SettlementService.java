package ssafy.rtc.shoppy.settlement.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import ssafy.rtc.shoppy.ai.imagerecognition.dto.ImageRecognitionRequestDto;
import ssafy.rtc.shoppy.ai.imagerecognition.dto.ImageRecognitionResponseDto;
import ssafy.rtc.shoppy.ai.imagerecognition.service.ImageRecognitionService;
import ssafy.rtc.shoppy.auth.repository.MemberRepository;
import ssafy.rtc.shoppy.global.exception.BusinessException;
import ssafy.rtc.shoppy.global.exception.ErrorCode;
import ssafy.rtc.shoppy.room.entity.RoomMemberEntity;
import ssafy.rtc.shoppy.room.enums.MemberStatus;
import ssafy.rtc.shoppy.room.repository.RoomMemberRepository;
import ssafy.rtc.shoppy.settlement.dto.*;
import ssafy.rtc.shoppy.settlement.event.SettlementEventPublisher;
import ssafy.rtc.shoppy.settlement.entity.ItemAllocation;
import ssafy.rtc.shoppy.settlement.entity.Purchase;
import ssafy.rtc.shoppy.settlement.entity.PurchaseItem;
import ssafy.rtc.shoppy.settlement.entity.PurchaseStatus;
import ssafy.rtc.shoppy.settlement.entity.Receipt;
import ssafy.rtc.shoppy.settlement.repository.ItemAllocationRepository;
import ssafy.rtc.shoppy.settlement.repository.PurchaseItemRepository;
import ssafy.rtc.shoppy.settlement.repository.PurchaseRepository;
import ssafy.rtc.shoppy.settlement.repository.ReceiptRepository;
import ssafy.rtc.shoppy.settlement.utils.ReceiptParser;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
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
    private final ImageRecognitionService imageRecognitionService;
    private final MemberRepository memberRepository;
    private final SettlementEventPublisher settlementEventPublisher;

    /**
     * 수동으로 정산 품목 추가
     */
    public SettlementItemCreateResponse addSettlementItem(Long receiptId, SettlementItemCreateRequest request) {
        // 1. 영수증 확인
        Receipt receipt = receiptRepository.findById(receiptId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RECEIPT_NOT_FOUND));

        Purchase purchase = receipt.getPurchase();
        if (purchase == null) {
            throw new BusinessException(ErrorCode.SETTLEMENT_NOT_FOUND); 
        }

        // 2. 아이템 저장
        PurchaseItem purchaseItem = PurchaseItem.builder()
                .purchase(purchase)
                .itemName(request.getItemName())
                .unitPrice(request.getUnitPrice())
                .quantity(request.getQuantity())
                .build();
        purchaseItemRepository.save(purchaseItem);

        // 3. 1/N 자동 할당 (기본)
        List<RoomMemberEntity> activeMembers = roomMemberRepository.findByRoom_RoomIdAndStatus(purchase.getRoomId(), MemberStatus.ACTIVE);
        if (!activeMembers.isEmpty()) {
            calculateAndAllocate(purchaseItem, activeMembers);
        }

        SettlementItemCreateResponse response = SettlementItemCreateResponse.builder()
                .settlementItemId(purchaseItem.getPurchaseItemId())
                .receiptId(receiptId)
                .itemName(purchaseItem.getItemName())
                .unitPrice(purchaseItem.getUnitPrice())
                .quantity(purchaseItem.getQuantity())
                .totalPrice(purchaseItem.getUnitPrice().multiply(BigDecimal.valueOf(purchaseItem.getQuantity())))
                .build();

        // WebSocket 이벤트 발행
        SettlementItemAddedResponseEvent eventResponse = SettlementItemAddedResponseEvent.builder()
                .type(SettlementEventType.ITEM_ADDED)
                .roomId(purchase.getRoomId())
                .updatedAt(java.time.LocalDateTime.now())
                .settlementItemId(purchaseItem.getPurchaseItemId())
                .receiptId(receiptId)
                .itemName(purchaseItem.getItemName())
                .unitPrice(purchaseItem.getUnitPrice().intValue())
                .quantity(purchaseItem.getQuantity())
                .totalPrice(purchaseItem.getUnitPrice().multiply(BigDecimal.valueOf(purchaseItem.getQuantity())).intValue())
                .build();

        settlementEventPublisher.publishItemAdded(purchase.getRoomId(), eventResponse);

        return response;
    }

    /**
     * 영수증 이미지 업로드 및 정산(Purchase) 초기 생성
     */
    public ReceiptUploadResponse uploadReceipt(Long roomId, Long memberId, MultipartFile file) {
        // 1. 파일 저장 (S3)
        String imageUrl = fileStorageService.storeFile(file);

        // 2. OCR 분석 수행
        BigDecimal recognizedTotal = BigDecimal.ZERO;
        List<ReceiptParser.ParsedItem> parsedItems = new ArrayList<>();

        try {
            ImageRecognitionRequestDto requestDto = ImageRecognitionRequestDto.builder()
                    .imageUrl(imageUrl)
                    .features(Collections.singletonList("TEXT_DETECTION"))
                    .build();

            List<ImageRecognitionResponseDto> results = imageRecognitionService.analyzeImages(Collections.singletonList(requestDto));

            if (!results.isEmpty() && !results.get(0).getTexts().isEmpty()) {
                // 첫 번째 요소는 전체 텍스트
                String fullText = results.get(0).getTexts().get(0).getDescription();
                recognizedTotal = ReceiptParser.parseTotalAmount(fullText);
                parsedItems = ReceiptParser.parseItems(fullText);
                log.info("OCR Recognized Total: {}, Items: {}", recognizedTotal, parsedItems.size());
            }
        } catch (Exception e) {
            log.error("OCR analysis failed for image: {}", imageUrl, e);
        }

        // 3. 정산(Purchase) 생성 (초기 상태)
        Purchase purchase = Purchase.builder()
                .roomId(roomId)
                .payerMemberId(memberId)
                .totalAmount(recognizedTotal) // OCR 결과 반영
                .status("PENDING")
                .build();
        purchaseRepository.save(purchase);

        // 4. 품목(PurchaseItem) 저장 및 초기 1/N 할당
        List<ReceiptUploadResponse.ItemDto> itemDtos = new ArrayList<>();
        List<RoomMemberEntity> activeMembers = roomMemberRepository.findByRoom_RoomIdAndStatus(roomId, MemberStatus.ACTIVE);
        
        for (ReceiptParser.ParsedItem item : parsedItems) {
            PurchaseItem purchaseItem = PurchaseItem.builder()
                    .purchase(purchase)
                    .itemName(item.itemName())
                    .unitPrice(item.unitPrice())
                    .quantity(item.quantity())
                    .build();
            purchaseItemRepository.save(purchaseItem);
            
            // 초기 1/N 할당 (모든 멤버에게 분배)
            if (!activeMembers.isEmpty()) {
                calculateAndAllocate(purchaseItem, activeMembers);
            }
            
            itemDtos.add(ReceiptUploadResponse.ItemDto.builder()
                    .itemName(item.itemName())
                    .unitPrice(item.unitPrice())
                    .quantity(item.quantity())
                    .build());
        }

        // 5. 영수증(Receipt) 정보 저장
        Receipt receipt = Receipt.builder()
                .purchase(purchase)
                .imageUrl(imageUrl)
                .originalFilename(file.getOriginalFilename())
                .recognizedTotal(recognizedTotal)
                .build();
        receiptRepository.save(receipt);

        // 6. 응답 반환
        ReceiptUploadResponse response = ReceiptUploadResponse.builder()
                .receiptId(receipt.getReceiptId())
                .settlementId(purchase.getPurchaseId())
                .imageUrl(imageUrl)
                .items(itemDtos)
                .build();

        // WebSocket 이벤트 발행
        ReceiptUploadResponseEvent eventResponse = ReceiptUploadResponseEvent.builder()
                .type(SettlementEventType.RECEIPT_UPLOADED)
                .roomId(roomId)
                .updatedAt(java.time.LocalDateTime.now())
                .receiptId(receipt.getReceiptId())
                .settlementId(purchase.getPurchaseId())
                .imageUrl(imageUrl)
                .items(itemDtos)
                .build();

        settlementEventPublisher.publishReceiptUploaded(roomId, eventResponse);

        return response;
    }

    /**
     * 정산 마스터(Purchase) 생성 및 초기 분배 (모든 멤버 참여)
     */
    public PurchaseResponse createSettlement(Long roomId, Long payerMemberId, BigDecimal totalAmount, List<PurchaseItemDto> itemDtos, Long currentUserId) {
        // 0. 검증: 요청자(User)가 해당 payerMemberId의 주인인지 확인
        RoomMemberEntity payerMember = roomMemberRepository.findById(payerMemberId)
                .orElseThrow(() -> new BusinessException(ErrorCode.MEMBER_NOT_FOUND));
        
        // userId가 null일 수도 있으므로(게스트 등) null 체크 필요, 여기서는 회원제라 가정
        if (payerMember.getUserId() == null || !payerMember.getUserId().equals(currentUserId)) {
             throw new BusinessException(ErrorCode.UNAUTHORIZED_MEMBER);
        }

        // 1. Purchase 생성
        Purchase purchase = Purchase.builder()
                .roomId(roomId)
                .payerMemberId(payerMemberId)
                .totalAmount(totalAmount)
                .status("PENDING")
                .build();
        purchaseRepository.save(purchase);

        // 2. 방의 모든 활성 멤버 조회
        List<RoomMemberEntity> members = roomMemberRepository.findByRoom_RoomIdAndStatus(roomId, MemberStatus.ACTIVE);
        if (members.isEmpty()) {
            throw new BusinessException(ErrorCode.MEMBER_NOT_FOUND);
        }

        // 3. 각 아이템별 처리
        for (PurchaseItemDto itemDto : itemDtos) {
            createPurchaseItemWithAllocations(purchase, itemDto, members);
        }

        PurchaseResponse response = PurchaseResponse.from(purchase);

        // WebSocket 이벤트 발행
        SettlementCreatedResponseEvent eventResponse = SettlementCreatedResponseEvent.builder()
                .type(SettlementEventType.SETTLEMENT_CREATED)
                .roomId(roomId)
                .updatedAt(java.time.LocalDateTime.now())
                .purchaseId(purchase.getPurchaseId())
                .payerMemberId(purchase.getPayerMemberId())
                .totalAmount(purchase.getTotalAmount().intValue())
                .status(PurchaseStatus.valueOf(purchase.getStatus()))
                .items(response.getItems())
                .build();

        settlementEventPublisher.publishSettlementCreated(roomId, eventResponse);

        return response;
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
        // 3-1. PurchaseItem 생성
        PurchaseItem purchaseItem = PurchaseItem.builder()
                .purchase(purchase)
                .itemName(itemDto.getItemName())
                .unitPrice(itemDto.getUnitPrice())
                .quantity(itemDto.getQuantity())
                .payerMemberId(itemDto.getPayerMemberId())
                .payerBankName(itemDto.getPayerBankName())
                .payerAccountNumber(itemDto.getPayerAccountNumber())
                .build();
        purchase.addPurchaseItem(purchaseItem);
        purchaseItemRepository.save(purchaseItem);

        // 3-2. 금액 계산 및 분배
        calculateAndAllocate(purchaseItem, members);
    }

    private void calculateAndAllocate(PurchaseItem purchaseItem, List<RoomMemberEntity> members) {
        BigDecimal totalItemPrice = purchaseItem.getUnitPrice().multiply(BigDecimal.valueOf(purchaseItem.getQuantity()));
        int participantCount = members.size();

        if (participantCount == 0) return;

        BigDecimal amountToPayPerPerson = totalItemPrice.divide(BigDecimal.valueOf(participantCount), 0, RoundingMode.FLOOR);
        BigDecimal totalUserPay = amountToPayPerPerson.multiply(BigDecimal.valueOf(participantCount));
        BigDecimal totalDiffAmount = totalItemPrice.subtract(totalUserPay);

        // 검증
        if (totalItemPrice.compareTo(totalUserPay.add(totalDiffAmount)) != 0) {
            throw new ArithmeticException("정산 금액 검증 실패");
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
     * 정산 품목 수정 (이름, 가격, 수량)
     * 가격/수량 변경 시 기존 할당(Allocation) 금액 재계산 수행
     */
    public SettlementItemCreateResponse updateSettlementItem(Long itemId, SettlementItemCreateRequest request) {
        PurchaseItem item = purchaseItemRepository.findById(itemId)
                .orElseThrow(() -> new BusinessException(ErrorCode.ITEM_NOT_FOUND));

        Purchase purchase = item.getPurchase();

        // 값 업데이트
        boolean needRecalculate = (request.getUnitPrice().compareTo(item.getUnitPrice()) != 0) || (request.getQuantity() != item.getQuantity());

        item.updateDetails(request.getItemName(), request.getUnitPrice(), request.getQuantity());

        if (needRecalculate) {
            // 현재 할당되어 있는 멤버들 목록 가져오기
            List<Long> currentMemberIds = item.getItemAllocations().stream()
                    .map(ItemAllocation::getMemberId)
                    .toList();

            // 기존 할당 내역 삭제 후 재생성 (updateAllocations 재활용)
            // updateAllocations()가 이미 WebSocket 이벤트를 발행하므로 여기서는 발행하지 않음
            updateAllocations(itemId, currentMemberIds);
        } else {
            // 이름만 변경된 경우에도 WebSocket 이벤트 발행
            PurchaseResponse purchaseResponse = PurchaseResponse.from(purchase);

            SettlementItemUpdatedResponseEvent eventResponse = SettlementItemUpdatedResponseEvent.builder()
                    .type(SettlementEventType.ITEM_UPDATED)
                    .roomId(purchase.getRoomId())
                    .updatedAt(java.time.LocalDateTime.now())
                    .purchaseId(purchase.getPurchaseId())
                    .totalAmount(purchase.getTotalAmount().intValue())
                    .items(purchaseResponse.getItems())
                    .build();

            settlementEventPublisher.publishItemUpdated(purchase.getRoomId(), eventResponse);
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
     * 정산 품목 삭제
     */
    public void deleteSettlementItem(Long itemId) {
        PurchaseItem item = purchaseItemRepository.findById(itemId)
                .orElseThrow(() -> new BusinessException(ErrorCode.ITEM_NOT_FOUND));

        Purchase purchase = item.getPurchase();
        Long roomId = purchase.getRoomId();
        Long purchaseId = purchase.getPurchaseId();

        // 품목 삭제
        purchaseItemRepository.delete(item);

        // WebSocket 이벤트 발행
        SettlementItemDeletedResponseEvent eventResponse = SettlementItemDeletedResponseEvent.builder()
                .type(SettlementEventType.ITEM_DELETED)
                .roomId(roomId)
                .updatedAt(java.time.LocalDateTime.now())
                .settlementItemId(itemId)
                .purchaseId(purchaseId)
                .build();

        settlementEventPublisher.publishItemDeleted(roomId, eventResponse);
    }

    // 재정산 로직 (멤버 변경 시)
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

    public void updateAllocations(Long purchaseItemId, List<Long> newMemberIds) {
        PurchaseItem purchaseItem = purchaseItemRepository.findById(purchaseItemId)
                .orElseThrow(() -> new BusinessException(ErrorCode.ITEM_NOT_FOUND));

        rebuildAllocations(purchaseItem, newMemberIds);

        // WebSocket 이벤트 발행
        Purchase purchase = purchaseItem.getPurchase();
        PurchaseResponse purchaseResponse = PurchaseResponse.from(purchase);

        SettlementItemUpdatedResponseEvent eventResponse = SettlementItemUpdatedResponseEvent.builder()
                .type(SettlementEventType.ITEM_UPDATED)
                .roomId(purchase.getRoomId())
                .updatedAt(java.time.LocalDateTime.now())
                .purchaseId(purchase.getPurchaseId())
                .totalAmount(purchase.getTotalAmount().intValue())
                .items(purchaseResponse.getItems())
                .build();

        settlementEventPublisher.publishItemUpdated(purchase.getRoomId(), eventResponse);
    }

    @Transactional(readOnly = true)
    public PurchaseResponse getSettlement(Long settlementId) {
        Purchase purchase = purchaseRepository.findById(settlementId)
                .orElseThrow(() -> new BusinessException(ErrorCode.SETTLEMENT_NOT_FOUND));
        return PurchaseResponse.from(purchase);
    }
    
    // 정산 완료 및 리포트 생성
    public String completeAndGetReport(Long settlementId) {
        Purchase purchase = purchaseRepository.findById(settlementId)
                .orElseThrow(() -> new BusinessException(ErrorCode.SETTLEMENT_NOT_FOUND));
        purchase.updateStatus("COMPLETE");

        String report = generateReport(purchase);

        // WebSocket 이벤트 발행
        SettlementCompletedResponseEvent eventResponse = SettlementCompletedResponseEvent.builder()
                .type(SettlementEventType.SETTLEMENT_COMPLETED)
                .roomId(purchase.getRoomId())
                .updatedAt(java.time.LocalDateTime.now())
                .settlementId(purchase.getPurchaseId())
                .status("COMPLETE")
                .report(report)
                .build();

        settlementEventPublisher.publishSettlementCompleted(purchase.getRoomId(), eventResponse);

        return report;
    }

    private String generateReport(Purchase purchase) {
        StringBuilder sb = new StringBuilder();
        sb.append("### 🧾 정산 결과 리포트\n\n");
        
        // 결제자 정보 조회
        RoomMemberEntity payerMember = roomMemberRepository.findById(purchase.getPayerMemberId())
                .orElse(null);
        String payerName = (payerMember != null) ? payerMember.getNickname() : "알 수 없음";
        
        sb.append(String.format("- **총 결제 금액**: %s원\n", purchase.getTotalAmount()));
        sb.append(String.format("- **결제자**: %s\n", payerName));

        // 결제자의 실제 계좌/QR 정보 조회 (Member 엔티티)
        if (payerMember != null && payerMember.getUserId() != null) {
            memberRepository.findById(payerMember.getUserId()).ifPresent(m -> {
                if (m.getBankName() != null && m.getAccountNumber() != null) {
                    sb.append(String.format("- **송금 계좌**: %s %s\n", m.getBankName(), m.getAccountNumber()));
                }
                if (m.getQrCodeUrl() != null) {
                    sb.append(String.format("- **송금 QR 링크**: %s\n", m.getQrCodeUrl()));
                }
            });
        }
        
        sb.append("\n#### [물품별 세부 내역]\n");
        sb.append("| 물품명 | 참여자 | 금액 |\n");
        sb.append("|:---|:---|:---|\n");

        Map<Long, BigDecimal> memberTotalMap = new HashMap<>();
        Map<Long, String> nicknameMap = new HashMap<>();
        List<RoomMemberEntity> roomMembers = roomMemberRepository.findByRoom_RoomIdAndStatus(purchase.getRoomId(), MemberStatus.ACTIVE);
        for(RoomMemberEntity rm : roomMembers) {
            nicknameMap.put(rm.getMemberId(), rm.getNickname());
        }

        for (PurchaseItem item : purchase.getPurchaseItems()) {
            for (ItemAllocation allocation : item.getItemAllocations()) {
                String memberName = nicknameMap.getOrDefault(allocation.getMemberId(), "알수없음");
                sb.append(String.format("| %s | %s | %s원 |\n", 
                        item.getItemName(), 
                        memberName, 
                        allocation.getAmountToPay()));

                memberTotalMap.merge(allocation.getMemberId(), allocation.getAmountToPay(), BigDecimal::add);
            }
        }
        
        sb.append("\n#### 💰 멤버별 최종 송금액\n");
        for (Map.Entry<Long, BigDecimal> entry : memberTotalMap.entrySet()) {
            // 결제자 본인은 제외
            if (entry.getKey().equals(purchase.getPayerMemberId())) continue;
            
            String name = nicknameMap.getOrDefault(entry.getKey(), "알수없음");
            sb.append(String.format("- **%s**: %s원\n", name, entry.getValue()));
        }

        return sb.toString();
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
