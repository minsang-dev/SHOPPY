package ssafy.rtc.shoppy.product.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import ssafy.rtc.shoppy.ai.dto.ProductMatchDto;
import ssafy.rtc.shoppy.product.model.ProductMasterEntity;
import ssafy.rtc.shoppy.product.repository.ProductMasterRepository;

import java.text.Normalizer;
import java.util.List;
import java.util.Optional;
import java.util.regex.Pattern;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProductMatchService {

    private final ProductMasterRepository repository;

    private static final Pattern TOKEN_CLEANER = Pattern.compile("[^a-z0-9]+");

    public Optional<ProductMatchDto> match(List<Candidate> candidates) {
        for (Candidate candidate : candidates) {
            String normalized = normalize(candidate.value());
            if (normalized.isBlank()) {
                continue;
            }
            List<ProductMasterEntity> hits = repository.searchByToken(normalized);
            if (!hits.isEmpty()) {
                ProductMasterEntity product = hits.get(0);
                ProductMatchDto dto = ProductMatchDto.builder()
                        .brand(product.getBrand())
                        .productAlias(product.getProductAlias())
                        .category(product.getCategory())
                        .matchSource(candidate.source().name())
                        .candidateValue(candidate.value())
                        .build();
                log.info("Candidate '{}' ({}) matched to {}", candidate.value(), candidate.source(), product.getProductAlias());
                return Optional.of(dto);
            }
        }
        log.info("No product match found for candidates: {}", candidates.stream().map(Candidate::value).toList());
        return Optional.empty();
    }

    private String normalize(String input) {
        String lower = Normalizer.normalize(input.toLowerCase(), Normalizer.Form.NFD);
        String cleaned = TOKEN_CLEANER.matcher(lower).replaceAll(" ");
        return cleaned.trim();
    }

    public record Candidate(String value, CandidateSource source) {}

    public enum CandidateSource {
        LOGO, TEXT, WEB_LABEL, WEB_ENTITY
    }
}
